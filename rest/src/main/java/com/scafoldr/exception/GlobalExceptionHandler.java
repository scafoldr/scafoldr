package com.scafoldr.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.hibernate.exception.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import com.scafoldr.response.ApiResponse;

import jakarta.persistence.EntityExistsException;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleEntityNotFoundException(
            EntityNotFoundException ex, WebRequest request) {
        log.warn("Entity not found: {}", ex.getMessage());

        return new ResponseEntity<>(
                ApiResponse.error(ex.getMessage(), HttpStatus.NOT_FOUND.value()),
                HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Object>> handleIllegalArgumentException(
            IllegalArgumentException ex, WebRequest request) {
        log.warn("Invalid argument: {}", ex.getMessage());

        return new ResponseEntity<>(
                ApiResponse.error(ex.getMessage(), HttpStatus.BAD_REQUEST.value()),
                HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationException(
            MethodArgumentNotValidException ex, WebRequest request) {
        log.warn("Validation failed");

        Map<String, String> fieldErrors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .collect(Collectors.toMap(
                        error -> error.getField(),
                        error -> error.getDefaultMessage(),
                        (existing, replacement) -> existing + "; " + replacement
                ));

        ApiResponse<Map<String, String>> response = ApiResponse.<Map<String, String>>builder()
                .status("error")
                .code(HttpStatus.BAD_REQUEST.value())
                .message("Validation failed")
                .data(fieldErrors)
                .build();

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(DuplicateEntityException.class)
    public ResponseEntity<ApiResponse<Object>> handleDuplicateEntityException(
            DuplicateEntityException ex, WebRequest request) {
        log.warn("Duplicate entity: {}", ex.getMessage());

        return new ResponseEntity<>(
                ApiResponse.error(ex.getMessage(), HttpStatus.CONFLICT.value()),
                HttpStatus.CONFLICT);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Object>> handleConstraintViolationException(
            ConstraintViolationException ex, WebRequest request) {
        log.warn("Constraint violation: {}", ex.getMessage());

        String message = "Database constraint violation";

        if (ex.getMessage() != null) {
            if (ex.getMessage().contains("unique constraint")) {
                message = "This value already exists in the system";
            } else if (ex.getMessage().contains("foreign key")) {
                message = "Referenced entity does not exist";
            } else if (ex.getMessage().contains("not-null constraint")) {
                message = "Required field is missing";
            }
        }

        return new ResponseEntity<>(
                ApiResponse.error(message, HttpStatus.CONFLICT.value(), ex.getMessage()),
                HttpStatus.CONFLICT);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Object>> handleDataIntegrityViolationException(
            DataIntegrityViolationException ex, WebRequest request) {
        log.warn("Data integrity violation: {}", ex.getMessage());

        String message = "Invalid data provided";

        String errorMsg = ex.getMessage();
        if (errorMsg != null) {
            if (errorMsg.contains("unique constraint")) {
                message = "This value already exists in the system";
            } else if (errorMsg.contains("foreign key constraint")) {
                message = "Referenced entity does not exist";
            } else if (errorMsg.contains("not-null constraint")) {
                if (errorMsg.contains("column")) {
                    int startIdx = errorMsg.indexOf("column \"") + 8;
                    int endIdx = errorMsg.indexOf("\"", startIdx);
                    if (startIdx > 7 && endIdx > startIdx) {
                        String columnName = errorMsg.substring(startIdx, endIdx);
                        message = "Field '" + columnName + "' is required and cannot be empty";
                    }
                } else {
                    message = "Required field is missing or empty";
                }
            } else if (errorMsg.contains("duplicate key")) {
                message = "This value already exists in the system";
            }
        }

        return new ResponseEntity<>(
                ApiResponse.error(message, HttpStatus.BAD_REQUEST.value()),
                HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(EntityExistsException.class)
    public ResponseEntity<ApiResponse<Object>> handleEntityExistsException(
            EntityExistsException ex, WebRequest request) {
        log.warn("Entity already exists: {}", ex.getMessage());

        return new ResponseEntity<>(
                ApiResponse.error("Entity already exists", HttpStatus.CONFLICT.value()),
                HttpStatus.CONFLICT);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<Object>> handleRuntimeException(
            RuntimeException ex, WebRequest request) {
        log.error("Runtime error", ex);

        return new ResponseEntity<>(
                ApiResponse.error("An unexpected error occurred", HttpStatus.INTERNAL_SERVER_ERROR.value(), ex.getMessage()),
                HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleGlobalException(
            Exception ex, WebRequest request) {
        log.error("Unexpected error", ex);

        return new ResponseEntity<>(
                ApiResponse.error("An unexpected error occurred", HttpStatus.INTERNAL_SERVER_ERROR.value()),
                HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
