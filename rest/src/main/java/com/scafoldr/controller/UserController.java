package com.scafoldr.controller;

import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.web.bind.annotation.*;
import com.scafoldr.dto.UserDTO;
import com.scafoldr.model.User;
import com.scafoldr.service.UserService;


@RestController
@CrossOrigin
@EnableMethodSecurity
@RequestMapping("/api/v1/user")
public class UserController extends DomainController<User, UserDTO> {

    private final UserService userService;

    public UserController(UserService service) {
        super(service, UserDTO::toDto, UserDTO::toEntity);
        this.userService = service;

    }
}
