package rs.raf.ostojanovic10021rn.scafoldrbackend.controller;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.web.bind.annotation.*;
import rs.raf.ostojanovic10021rn.scafoldrbackend.dto.AuthRequest;
import rs.raf.ostojanovic10021rn.scafoldrbackend.dto.AuthResponse;
import rs.raf.ostojanovic10021rn.scafoldrbackend.dto.UserDTO;
import rs.raf.ostojanovic10021rn.scafoldrbackend.dto.VerifyRequest;
import rs.raf.ostojanovic10021rn.scafoldrbackend.model.User;
import rs.raf.ostojanovic10021rn.scafoldrbackend.service.UserService;

import java.util.Map;


@RestController
@CrossOrigin
@EnableMethodSecurity
@RequestMapping("/api/v1/user")
public class UserController extends BaseController<User, UserDTO>{

    private final UserService userService;

    public UserController(UserService service) {
        super(service, UserController::toDto);
        this.userService = service;

    }

    private static UserDTO toDto(User user){
        UserDTO userDTO = new UserDTO();
        userDTO.setEmail(user.getEmail());
        userDTO.setId(user.getId());
        userDTO.setCreatedAt(user.getCreatedAt());
        return userDTO;
    }

    @PostMapping("/send-code")
    public ResponseEntity<?> sendCode(@Valid @RequestBody AuthRequest request) {
        userService.sendVerificationCode(request.getEmail());
        return ResponseEntity.ok(Map.of("message", "Verification code sent."));
    }
    @PostMapping("/verify")
    public ResponseEntity<?> verifyCode(@Valid @RequestBody VerifyRequest request) {
        String token = userService.verifyCode(request.getEmail(), request.getCode());
        return ResponseEntity.ok().body(new AuthResponse(request.getEmail(), token));
    }


}
