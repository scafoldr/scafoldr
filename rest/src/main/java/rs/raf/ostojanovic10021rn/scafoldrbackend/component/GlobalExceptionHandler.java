package rs.raf.ostojanovic10021rn.scafoldrbackend.component;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import rs.raf.ostojanovic10021rn.scafoldrbackend.exception.EntityNotFoundException;
import rs.raf.ostojanovic10021rn.scafoldrbackend.exception.InvalidVerificationCodeException;
import rs.raf.ostojanovic10021rn.scafoldrbackend.exception.MaxAttemptsExceededException;
import rs.raf.ostojanovic10021rn.scafoldrbackend.exception.RateLimitExceededException;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RateLimitExceededException.class)
    public ResponseEntity<Map<String, String>> handleRateLimitExceeded(RateLimitExceededException ex) {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(InvalidVerificationCodeException.class)
    public ResponseEntity<Map<String, String>> handleInvalidCode(InvalidVerificationCodeException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(MaxAttemptsExceededException.class)
    public ResponseEntity<Map<String, String>> handleMaxAttemptsExceeded(MaxAttemptsExceededException ex) {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleEntityNotFound(EntityNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", ex.getMessage()));
    }
}
