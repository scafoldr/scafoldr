package com.scafoldr.controller;

import com.scafoldr.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.web.bind.annotation.*;
import com.scafoldr.dto.AuthRequest;
import com.scafoldr.dto.AuthResponse;
import com.scafoldr.dto.VerifyRequest;

import java.util.Map;


@RestController
@CrossOrigin
@EnableMethodSecurity
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService service) {
        this.authService = service;
    }

    @PostMapping("/send-code")
    public ResponseEntity<?> sendCode(@Valid @RequestBody AuthRequest request) {
        authService.sendVerificationCode(request.getEmail());
        return ResponseEntity.ok(Map.of("message", "Verification code sent."));
    }
    @PostMapping("/verify")
    public ResponseEntity<?> verifyCode(@Valid @RequestBody VerifyRequest request) {
        String token = authService.verifyCode(request.getEmail(), request.getCode());
        return ResponseEntity.ok().body(new AuthResponse(request.getEmail(), token));
    }


}
