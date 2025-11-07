package rs.raf.ostojanovic10021rn.scafoldrbackend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import rs.raf.ostojanovic10021rn.scafoldrbackend.model.AuthenticationDetails;

import java.io.Serializable;

@Getter
@Data
@Setter
public class AuthRequest implements BaseDTO, AuthenticationDetails {

    @Email
    @NotBlank
    private String email;


}
