package com.scafoldr.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.scafoldr.dto.DomainDTO;
import com.scafoldr.model.DomainModel;
import com.scafoldr.service.DomainService;
import com.scafoldr.response.ApiResponse;

import jakarta.validation.Valid;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@RequiredArgsConstructor
public abstract class DomainController<T extends DomainModel, D extends DomainDTO> {

    protected final DomainService<T> service;
    protected final Function<T, D> toDTO;
    protected final Function<D, T> toEntity;

    @GetMapping
    public ResponseEntity<ApiResponse<List<D>>> getAll() {
        log.debug("GET request: fetch all entities");
        try {
            List<D> result = service.getAll()
                    .stream()
                    .map(toDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponse.success(result, "Resources retrieved successfully", 200));
        } catch (Exception e) {
            log.error("Error fetching all entities", e);
            throw e;
        }
    }

    @GetMapping("/paginated")
    public ResponseEntity<ApiResponse<Page<D>>> getAllPaginated(Pageable pageable) {
        log.debug("GET request: fetch paginated entities");
        try {
            Page<D> result = service.getAll(pageable)
                    .map(toDTO);
            return ResponseEntity.ok(ApiResponse.success(result, "Resources retrieved successfully", 200));
        } catch (Exception e) {
            log.error("Error fetching paginated entities", e);
            throw e;
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<D>> getById(@PathVariable Long id) {
        log.debug("GET request: fetch entity by ID: {}", id);
        try {
            return ResponseEntity.ok(ApiResponse.success(toDTO.apply(service.getById(id)), "Resource retrieved successfully", 200));
        } catch (Exception e) {
            log.error("Error fetching entity by ID: {}", id, e);
            throw e;
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<D>> create(@Valid @RequestBody D dto) {
        log.info("POST request: create new entity");
        try {
            if (dto == null) {
                log.warn("POST request with null body");
                return ResponseEntity.badRequest().body(ApiResponse.error("Request body cannot be null", 400));
            }

            T entity = toEntity.apply(dto);
            T created = service.create(entity);
            D result = toDTO.apply(created);

            log.info("Entity created successfully with ID: {}", created.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(result));
        } catch (IllegalArgumentException e) {
            log.warn("Validation error during create: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error creating entity", e);
            throw e;
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<D>> update(@PathVariable Long id, @Valid @RequestBody D dto) {
        log.info("PUT request: update entity with ID: {}", id);
        try {
            if (dto == null) {
                log.warn("PUT request with null body for ID: {}", id);
                return ResponseEntity.badRequest().body(ApiResponse.error("Request body cannot be null", 400));
            }

            T entity = toEntity.apply(dto);
            T updated = service.update(id, entity);
            D result = toDTO.apply(updated);

            log.info("Entity updated successfully with ID: {}", id);
            return ResponseEntity.ok(ApiResponse.updated(result));
        } catch (IllegalArgumentException e) {
            log.warn("Validation error during update for ID: {}: {}", id, e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error updating entity with ID: {}", id, e);
            throw e;
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        log.info("DELETE request: delete entity with ID: {}", id);
        try {
            service.delete(id);
            log.info("Entity deleted successfully with ID: {}", id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Error deleting entity with ID: {}", id, e);
            throw e;
        }
    }
}