package rs.raf.ostojanovic10021rn.scafoldrbackend.exception;

public class InvalidVerificationCodeException extends RuntimeException {
    public InvalidVerificationCodeException(String message) {
        super(message);
    }
}
