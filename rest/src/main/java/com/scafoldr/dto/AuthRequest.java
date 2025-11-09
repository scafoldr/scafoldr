package com.scafoldr.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import com.scafoldr.model.AuthenticationDetails;

@Getter
@Data
@Setter
public class AuthRequest implements BaseDTO, AuthenticationDetails {

    @Email
    @NotBlank
    private String email;


}
