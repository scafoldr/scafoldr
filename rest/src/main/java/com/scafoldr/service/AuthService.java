package com.scafoldr.service;

import com.scafoldr.exception.EntityNotFoundException;
import com.scafoldr.exception.MaxAttemptsExceededException;
import com.scafoldr.exception.RateLimitExceededException;
import com.scafoldr.jwt.JwtUtil;
import com.scafoldr.model.User;
import com.scafoldr.model.VerificationCode;
import com.scafoldr.repository.UserRepository;
import com.scafoldr.repository.VerificationCodeRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
public class AuthService {

    private final UserService userService;
    private final VerificationCodeService codeService;
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

    public AuthService(UserRepository userRepository, VerificationCodeRepository codeRepository, UserService userService, VerificationCodeService codeService, PasswordEncoder passwordEncoder, EmailService emailService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.codeService = codeService;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public void sendVerificationCode(String email){
        User user = userService.findByEmail(email)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(email);
                    return userService.create(newUser);
                });
        LocalDateTime rateLimitTime = LocalDateTime.now().minusHours(1);
        long recentCodes = codeService.countRecentCodesForUser(user, rateLimitTime);
        if (recentCodes >= rateLimit) {
            throw new RateLimitExceededException("Rate limit exceeded");
        }

        codeService.invalidateCodesForUser(user);
        String code = String.format("%06d", random.nextInt(1000000));
        String hashedCode = passwordEncoder.encode(code);

        VerificationCode verificationCode = new VerificationCode();
        System.out.println(verificationCode.getId());
        verificationCode.setUser(user);
        verificationCode.setCode(hashedCode);
        verificationCode.setExpiresAt(LocalDateTime.now().plusMinutes(codeExpirationMinutes));
        codeService.create(verificationCode);

        emailService.sendVerificationCode(email, code);
    }
    @Transactional
    public String verifyCode(String email, String code) {
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Entity "+ email + "not found"));

        VerificationCode verificationCode = codeService
                .findActiveCodeForUser(user, LocalDateTime.now())
                .orElseThrow(() -> new EntityNotFoundException("Entity "+ code + "not found"));

        if (verificationCode.getAttempts() >= maxAttempts) {
            verificationCode.setUsed(true);
            codeService.update(verificationCode.getId(), verificationCode);
            throw new MaxAttemptsExceededException("Maximum attempts exceeded");
        }

        if (!passwordEncoder.matches(code, verificationCode.getCode())) {
            verificationCode.setAttempts(verificationCode.getAttempts() + 1);
            codeService.update(verificationCode.getId(), verificationCode);
            throw new RateLimitExceededException("Rate limit exceeded");
        }

        verificationCode.setUsed(true);
        codeService.update(verificationCode.getId(), verificationCode);

     return jwtUtil.generateToken(user.getEmail(), user.getId());
    }

    @Transactional
    public void cleanupExpiredCodes() {
        codeService.deleteExpiredCodes(LocalDateTime.now());
    }

}
