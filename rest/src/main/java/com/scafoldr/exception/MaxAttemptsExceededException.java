package com.scafoldr.exception;

public class MaxAttemptsExceededException extends RuntimeException {
    public MaxAttemptsExceededException(String message) {
        super(message);
    }
}
