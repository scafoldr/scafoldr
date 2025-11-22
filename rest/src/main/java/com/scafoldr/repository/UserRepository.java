package com.scafoldr.repository;

import org.springframework.stereotype.Repository;
import com.scafoldr.model.User;

import java.util.Optional;

@Repository
public interface UserRepository extends BaseRepository<User, Long> {

    Optional<User> findByEmail(String email);
}
