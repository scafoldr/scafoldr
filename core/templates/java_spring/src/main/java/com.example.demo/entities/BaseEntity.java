package com.example.entities;

import jakarta.persistence.*;
import java.io.Serializable;
import lombok.*;

@Getter @Setter
@MappedSuperclass
public abstract class BaseEntity implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
}

