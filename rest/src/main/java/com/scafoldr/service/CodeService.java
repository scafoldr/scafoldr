package com.scafoldr.service;

import com.scafoldr.model.User;
import com.scafoldr.model.VerificationCode;
import com.scafoldr.repository.VerificationCodeRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class CodeService extends DomainService<VerificationCode>{

    public final VerificationCodeRepository codeRepository;

    protected CodeService(VerificationCodeRepository codeRepository) {
        super(codeRepository);
        this.codeRepository = codeRepository;
    }

    public long countRecentCodesForUser(User user, LocalDateTime rateLimitTime){
        return codeRepository.countRecentCodesForUser(user, rateLimitTime);
    }
    public void invalidateCodesForUser(User user){
        codeRepository.invalidateCodesForUser(user);
    }

    public Optional<VerificationCode> findActiveCodeForUser(User user, LocalDateTime localDateTime){
        return codeRepository.findActiveCodeForUser(user, localDateTime);
    }

    public void deleteExpiredCodes(LocalDateTime localDateTime){
        codeRepository.deleteExpiredCodes(localDateTime);
    }
}
