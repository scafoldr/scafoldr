package com.scafoldr.service;

import com.scafoldr.exception.EntityNotFoundException;
import org.springframework.transaction.annotation.Transactional;
import com.scafoldr.model.DomainModel;
import com.scafoldr.repository.BaseRepository;

import java.util.List;

public abstract class DomainService<T extends DomainModel> {

    protected final BaseRepository<T, Long> repository;

    protected DomainService(BaseRepository<T, Long> repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<T> getAll() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public T getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Entity not found with ID " + id));
    }

    @Transactional
    public T create(T entity) {
        return repository.save(entity);
    }

    @Transactional
    public T update(Long id, T entity) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Cannot update. Entity not found with ID " + id);
        }
        entity.setId(id);
        return repository.save(entity);
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Cannot delete. Entity not found with ID " + id);
        }
        repository.deleteById(id);
    }
}
