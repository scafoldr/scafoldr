package com.example.services;

import com.example.entity.BaseEntity;
import com.example.repositories.BaseRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public abstract class BaseService<T extends BaseEntity> {

    protected final BaseRepository<T, Integer> repository;

    protected BaseService(BaseRepository<T, Integer> repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<T> getAll() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public T getById(Integer id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Entity not found with ID " + id));
    }

    @Transactional
    public T create(T entity) {
        return repository.save(entity);
    }

    @Transactional
    public T update(Integer id, T entity) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Cannot update. Entity not found with ID " + id);
        }
        entity.setId(id);
        return repository.save(entity);
    }

    @Transactional
    public void delete(Integer id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Cannot delete. Entity not found with ID " + id);
        }
        repository.deleteById(id);
    }
}
