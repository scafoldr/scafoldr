package com.example.models;

import jakarta.persistence.*;
import java.io.Serializable;
import lombok.*;

@Getter @Setter
@MappedSuperclass
public abstract class BaseModel implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
}

