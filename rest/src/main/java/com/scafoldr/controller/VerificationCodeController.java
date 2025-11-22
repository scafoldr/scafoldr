package com.scafoldr.controller;

import com.scafoldr.dto.VerificationCodeDTO;
import com.scafoldr.model.VerificationCode;
import com.scafoldr.service.VerificationCodeService;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@CrossOrigin
@EnableMethodSecurity
@RequestMapping("/api/v1/code")
public class VerificationCodeController extends DomainController<VerificationCode, VerificationCodeDTO> {

    private final VerificationCodeService verificationCodeService;

    public VerificationCodeController(VerificationCodeService service) {
        super(service, VerificationCodeDTO::toDto, VerificationCodeDTO::toEntity);
        this.verificationCodeService = service;

    }
}
