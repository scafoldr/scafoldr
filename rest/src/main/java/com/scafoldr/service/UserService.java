package com.scafoldr.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.scafoldr.exception.EntityNotFoundException;
import com.scafoldr.exception.MaxAttemptsExceededException;
import com.scafoldr.exception.RateLimitExceededException;
import com.scafoldr.jwt.JwtUtil;
import com.scafoldr.model.User;
import com.scafoldr.model.VerificationCode;
import com.scafoldr.repository.UserRepository;
import com.scafoldr.repository.VerificationCodeRepository;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
public class UserService extends BaseService<User>{

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        super(userRepository);
        this.userRepository = userRepository;
    }

}
