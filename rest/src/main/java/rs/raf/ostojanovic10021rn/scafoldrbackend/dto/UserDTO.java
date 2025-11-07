package rs.raf.ostojanovic10021rn.scafoldrbackend.dto;

import jakarta.persistence.Column;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class UserDTO implements BaseDTO {

    private Long id;

    private String email;

    private LocalDateTime createdAt;
}
