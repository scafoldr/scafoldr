package com.scafoldr.controller;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.web.bind.annotation.*;
import com.scafoldr.dto.AuthRequest;
import com.scafoldr.dto.AuthResponse;
import com.scafoldr.dto.UserDTO;
import com.scafoldr.dto.VerifyRequest;
import com.scafoldr.model.User;
import com.scafoldr.service.UserService;

import java.util.Map;


@RestController
@CrossOrigin
@EnableMethodSecurity
@RequestMapping("/api/v1/user")
public class UserController extends BaseController<User, UserDTO>{

    private final UserService userService;

    public UserController(UserService service) {
        super(service, UserDTO::toDto);
        this.userService = service;

    }
}
