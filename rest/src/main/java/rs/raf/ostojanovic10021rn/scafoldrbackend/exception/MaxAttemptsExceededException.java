package rs.raf.ostojanovic10021rn.scafoldrbackend.exception;

public class MaxAttemptsExceededException extends RuntimeException {
    public MaxAttemptsExceededException(String message) {
        super(message);
    }
}
