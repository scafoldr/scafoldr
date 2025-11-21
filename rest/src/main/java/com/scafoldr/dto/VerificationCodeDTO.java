package com.scafoldr.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.scafoldr.model.VerificationCode;
import lombok.Getter;
import lombok.Setter;
import com.scafoldr.model.User;

import java.time.LocalDateTime;

@Getter
@Setter
public class VerificationCodeDTO implements DomainDTO {

    private User user;

    private String code;

    private LocalDateTime expiresAt;

    private Boolean used;

    private Integer attempts;

    private LocalDateTime createdAt;

    @JsonIgnore
    public static VerificationCodeDTO toDto(VerificationCode code){
       VerificationCodeDTO codeDTO = new VerificationCodeDTO();
       codeDTO.setCode(code.getCode());
       codeDTO.setUsed(code.getUsed());
       codeDTO.setUser(code.getUser());
       codeDTO.setAttempts(code.getAttempts());
       codeDTO.setCreatedAt(code.getCreatedAt());
       codeDTO.setExpiresAt(code.getExpiresAt());
       return codeDTO;
    }
}
