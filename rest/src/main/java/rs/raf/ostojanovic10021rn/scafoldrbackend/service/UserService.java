package rs.raf.ostojanovic10021rn.scafoldrbackend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rs.raf.ostojanovic10021rn.scafoldrbackend.exception.EntityNotFoundException;
import rs.raf.ostojanovic10021rn.scafoldrbackend.exception.MaxAttemptsExceededException;
import rs.raf.ostojanovic10021rn.scafoldrbackend.exception.RateLimitExceededException;
import rs.raf.ostojanovic10021rn.scafoldrbackend.jwt.JwtUtil;
import rs.raf.ostojanovic10021rn.scafoldrbackend.model.User;
import rs.raf.ostojanovic10021rn.scafoldrbackend.model.VerificationCode;
import rs.raf.ostojanovic10021rn.scafoldrbackend.repository.UserRepository;
import rs.raf.ostojanovic10021rn.scafoldrbackend.repository.VerificationCodeRepository;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
public class UserService extends BaseService<User>{

    private final UserRepository userRepository;
    private final VerificationCodeRepository codeRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final JwtUtil jwtUtil;

    private static final SecureRandom random = new SecureRandom();

    @Value("${verification.code.expiration}")
    private int codeExpirationMinutes;

    @Value("${verification.code.max-attempts}")
    private int maxAttempts;

    @Value("${verification.code.rate-limit}")
    private int rateLimit;

    public UserService(UserRepository userRepository, VerificationCodeRepository codeRepository, PasswordEncoder passwordEncoder, EmailService emailService, JwtUtil jwtUtil) {
        super(userRepository);
        this.userRepository = userRepository;
        this.codeRepository = codeRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public void sendVerificationCode(String email){
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(email);
                    return userRepository.save(newUser);
                });
        LocalDateTime rateLimitTime = LocalDateTime.now().minusHours(1);
        long recentCodes = codeRepository.countRecentCodesForUser(user, rateLimitTime);
        if (recentCodes >= rateLimit) {
            throw new RateLimitExceededException("Rate limit exceeded");
        }

        codeRepository.invalidateCodesForUser(user);
        String code = String.format("%06d", random.nextInt(1000000));
        String hashedCode = passwordEncoder.encode(code);

        VerificationCode verificationCode = new VerificationCode();
        verificationCode.setUser(user);
        verificationCode.setCode(hashedCode);
        verificationCode.setExpiresAt(LocalDateTime.now().plusMinutes(codeExpirationMinutes));
        codeRepository.save(verificationCode);

        emailService.sendVerificationCode(email, code);
    }
    @Transactional
    public String verifyCode(String email, String code) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Entity "+ email + "not found"));

        VerificationCode verificationCode = codeRepository
                .findActiveCodeForUser(user, LocalDateTime.now())
                .orElseThrow(() -> new EntityNotFoundException("Entity "+ code + "not found"));

        if (verificationCode.getAttempts() >= maxAttempts) {
            verificationCode.setUsed(true);
            codeRepository.save(verificationCode);
            throw new MaxAttemptsExceededException("Maximum attempts exceeded");
        }

        if (!passwordEncoder.matches(code, verificationCode.getCode())) {
            verificationCode.setAttempts(verificationCode.getAttempts() + 1);
            codeRepository.save(verificationCode);
            throw new RateLimitExceededException("Rate limit exceeded");
        }

        verificationCode.setUsed(true);
        codeRepository.save(verificationCode);

     return jwtUtil.generateToken(user.getEmail(), user.getId());
    }

    @Transactional
    public void cleanupExpiredCodes() {
        codeRepository.deleteExpiredCodes(LocalDateTime.now());
    }

}
