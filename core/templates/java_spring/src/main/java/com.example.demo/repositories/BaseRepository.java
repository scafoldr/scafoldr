package com.example.repositories;

import com.example.models.BaseModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

@NoRepositoryBean public interface BaseRepository<T extends BaseModel, ID> extends JpaRepository<T, ID> {}

