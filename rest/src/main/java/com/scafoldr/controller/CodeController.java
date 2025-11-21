package com.scafoldr.controller;

import com.scafoldr.dto.VerificationCodeDTO;
import com.scafoldr.model.VerificationCode;
import com.scafoldr.service.CodeService;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@CrossOrigin
@EnableMethodSecurity
@RequestMapping("/api/v1/user")
public class CodeController extends DomainController<VerificationCode, VerificationCodeDTO> {

    private final CodeService codeService;

    public CodeController(CodeService service) {
        super(service, VerificationCodeDTO::toDto);
        this.codeService = service;

    }
}
