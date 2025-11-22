package com.scafoldr.service;

import com.scafoldr.model.User;
import com.scafoldr.model.VerificationCode;
import com.scafoldr.repository.VerificationCodeRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class VerificationCodeService extends DomainService<VerificationCode>{

    public final VerificationCodeRepository verificationCodeRepository;

    protected VerificationCodeService(VerificationCodeRepository verificationCodeRepository) {
        super(verificationCodeRepository);
        this.verificationCodeRepository = verificationCodeRepository;
    }

    public long countRecentCodesForUser(User user, LocalDateTime rateLimitTime){
        return verificationCodeRepository.countRecentCodesForUser(user, rateLimitTime);
    }
    public void invalidateCodesForUser(User user){
        verificationCodeRepository.invalidateCodesForUser(user);
    }

    public Optional<VerificationCode> findActiveCodeForUser(User user, LocalDateTime localDateTime){
        return verificationCodeRepository.findActiveCodeForUser(user, localDateTime);
    }

    public void deleteExpiredCodes(LocalDateTime localDateTime){
        verificationCodeRepository.deleteExpiredCodes(localDateTime);
    }
}
