package com.scafoldr.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import com.scafoldr.model.AuthenticationDetails;

import java.io.Serializable;

@Getter
@Data
@Setter
@AllArgsConstructor
public class AuthResponse implements Serializable, DomainDTO, AuthenticationDetails {

    private String email;

    private String token;


}
