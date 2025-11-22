package com.scafoldr.service;

import org.springframework.stereotype.Service;
import com.scafoldr.model.User;
import com.scafoldr.repository.UserRepository;

import java.util.Optional;

@Service
public class UserService extends DomainService<User> {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        super(userRepository);
        this.userRepository = userRepository;
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

}
