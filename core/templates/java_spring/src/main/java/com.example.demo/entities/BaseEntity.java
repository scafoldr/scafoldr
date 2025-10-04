package com.example.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import lombok.*;

@Getter @Setter
@MappedSuperclass
public abstract class BaseEntity implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
}

