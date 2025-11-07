package rs.raf.ostojanovic10021rn.scafoldrbackend.exception;

public class RateLimitExceededException extends RuntimeException {
    public RateLimitExceededException(String message) {
        super(message);
    }
}
