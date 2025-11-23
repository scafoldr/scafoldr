package com.scafoldr.service;

import com.scafoldr.exception.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;
import com.scafoldr.model.DomainModel;
import com.scafoldr.repository.BaseRepository;

import java.util.List;

@Slf4j
@RequiredArgsConstructor
public abstract class DomainService<T extends DomainModel> {

    protected final BaseRepository<T, Long> repository;

    @Transactional(readOnly = true)
    public List<T> getAll() {
        log.debug("Fetching all entities");
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public Page<T> getAll(Pageable pageable) {
        log.debug("Fetching paginated entities with page: {}, size: {}", pageable.getPageNumber(), pageable.getPageSize());
        return repository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public T getById(Long id) {
        log.debug("Fetching entity with ID: {}", id);

        if (id == null || id <= 0) {
            log.warn("Invalid ID provided: {}", id);
            throw new IllegalArgumentException("ID must be a positive number");
        }

        return repository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Entity not found with ID: {}", id);
                    return new EntityNotFoundException("Entity not found with ID: " + id);
                });
    }

    @Transactional
    public T create(T entity) {
        log.debug("Creating new entity");

        if (entity == null) {
            log.error("Attempt to create null entity");
            throw new IllegalArgumentException("Entity cannot be null");
        }

        validateEntity(entity);

        try {
            T saved = repository.save(entity);
            log.info("Entity created successfully with ID: {}", saved.getId());
            return saved;
        } catch (Exception e) {
            log.error("Error creating entity", e);
            throw e;
        }
    }

    @Transactional
    public T update(Long id, T entity) {
        log.debug("Updating entity with ID: {}", id);

        if (id == null || id <= 0) {
            log.warn("Invalid ID provided for update: {}", id);
            throw new IllegalArgumentException("ID must be a positive number");
        }

        if (entity == null) {
            log.error("Attempt to update with null entity");
            throw new IllegalArgumentException("Entity cannot be null");
        }

        T existing = repository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Cannot update. Entity not found with ID: {}", id);
                    return new EntityNotFoundException("Cannot update. Entity not found with ID: " + id);
                });

        validateEntity(entity);
        entity.setId(id);

        try {
            T updated = repository.save(entity);
            log.info("Entity updated successfully with ID: {}", id);
            return updated;
        } catch (Exception e) {
            log.error("Error updating entity with ID: {}", id, e);
            throw e;
        }
    }

    @Transactional
    public void delete(Long id) {
        log.debug("Deleting entity with ID: {}", id);

        if (id == null || id <= 0) {
            log.warn("Invalid ID provided for delete: {}", id);
            throw new IllegalArgumentException("ID must be a positive number");
        }

        if (!repository.existsById(id)) {
            log.warn("Cannot delete. Entity not found with ID: {}", id);
            throw new EntityNotFoundException("Cannot delete. Entity not found with ID: " + id);
        }

        try {
            repository.deleteById(id);
            log.info("Entity deleted successfully with ID: {}", id);
        } catch (Exception e) {
            log.error("Error deleting entity with ID: {}", id, e);
            throw new RuntimeException("Failed to delete entity: " + e.getMessage(), e);
        }
    }

    /**
     * Override this method in subclasses to provide entity-specific validation logic
     */
    protected void validateEntity(T entity) {
        log.debug("Validating entity");
        // Default implementation - override in subclasses for specific validation
    }
}