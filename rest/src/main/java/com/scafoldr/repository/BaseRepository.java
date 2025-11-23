package com.scafoldr.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;
import com.scafoldr.model.DomainModel;

@NoRepositoryBean
public interface BaseRepository<T extends DomainModel, ID> extends JpaRepository<T, ID> {}

