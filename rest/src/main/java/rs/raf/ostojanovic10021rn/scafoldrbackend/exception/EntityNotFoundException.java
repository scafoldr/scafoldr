package rs.raf.ostojanovic10021rn.scafoldrbackend.exception;

public class EntityNotFoundException extends RuntimeException {
    public EntityNotFoundException(String message) {
        super(message);
    }
}
