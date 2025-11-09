package com.scafoldr.service;

import org.springframework.transaction.annotation.Transactional;
import com.scafoldr.model.BaseModel;
import com.scafoldr.repository.BaseRepository;

import java.util.List;

public abstract class BaseService<T extends BaseModel> {

    protected final BaseRepository<T, Long> repository;

    protected BaseService(BaseRepository<T, Long> repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<T> getAll() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public T getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Entity not found with ID " + id));
    }

    @Transactional
    public T create(T entity) {
        return repository.save(entity);
    }

    @Transactional
    public T update(Long id, T entity) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Cannot update. Entity not found with ID " + id);
        }
        entity.setId(id);
        return repository.save(entity);
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Cannot delete. Entity not found with ID " + id);
        }
        repository.deleteById(id);
    }
}
