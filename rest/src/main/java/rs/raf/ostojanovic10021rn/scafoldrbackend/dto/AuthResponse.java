package rs.raf.ostojanovic10021rn.scafoldrbackend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import rs.raf.ostojanovic10021rn.scafoldrbackend.model.AuthenticationDetails;

import java.io.Serializable;

@Getter
@Data
@Setter
@AllArgsConstructor
public class AuthResponse implements Serializable, BaseDTO, AuthenticationDetails {

    private String email;

    private String token;


}
