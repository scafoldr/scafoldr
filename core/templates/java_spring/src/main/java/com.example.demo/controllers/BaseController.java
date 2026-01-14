package com.example.controllers;

import com.example.dtos.BaseDTO;
import com.example.entities.BaseEntity;
import com.example.services.BaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;
import java.util.function.Function;

@RequiredArgsConstructor
public abstract class BaseController<T extends BaseEntity, D extends BaseDTO> {

    protected final BaseService<T> service;
    protected final Function<T, D> toDTO;

    @GetMapping
    public ResponseEntity<List<D>> getAll() {
        List<D> result = service.getAll()
                .stream()
                .map(toDTO)
                .collect(Collectors.toList());
        return handleSuccess(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<D> getById(@PathVariable Integer id) {
        return handleSuccess(toDTO.apply(service.getById(id)));
    }

    @PostMapping
    public ResponseEntity<D> create(@RequestBody T entity) {
        return handleSuccess(toDTO.apply(service.create(entity)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<D> update(@PathVariable Integer id, @RequestBody T entity) {
        return handleSuccess(toDTO.apply(service.update(id, entity)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    protected <R> ResponseEntity<R> handleSuccess(R body) {
        return ResponseEntity.ok(body);
    }

    protected ResponseEntity<String> handleError(Exception e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }

}
