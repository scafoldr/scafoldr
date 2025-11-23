package com.scafoldr.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.scafoldr.model.User;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class UserDTO implements DomainDTO {

    private Long id;

    private String email;

    private LocalDateTime createdAt;

    @JsonIgnore
    public static UserDTO toDto(User user){
        UserDTO userDTO = new UserDTO();
        userDTO.setEmail(user.getEmail());
        userDTO.setId(user.getId());
        userDTO.setCreatedAt(user.getCreatedAt());
        return userDTO;
    }

    @JsonIgnore
    public static User toEntity(UserDTO dto) {
        if (dto == null) {
            return null;
        }

        User user = new User();
        user.setId(dto.getId());
        user.setEmail(dto.getEmail());
        user.setCreatedAt(dto.getCreatedAt());
        return user;
    }
}
