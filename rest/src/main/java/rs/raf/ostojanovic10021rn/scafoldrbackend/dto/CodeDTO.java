package rs.raf.ostojanovic10021rn.scafoldrbackend.dto;

import lombok.Getter;
import lombok.Setter;
import rs.raf.ostojanovic10021rn.scafoldrbackend.model.User;

import java.time.LocalDateTime;

@Getter
@Setter
public class CodeDTO implements BaseDTO {

    private User user;

    private String code;

    private LocalDateTime expiresAt;

    private Boolean used;

    private Integer attempts;

    private LocalDateTime createdAt;
}
