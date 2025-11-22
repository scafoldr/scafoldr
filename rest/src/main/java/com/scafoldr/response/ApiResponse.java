package com.scafoldr.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    private String status;
    private int code;
    private String message;
    private T data;
    private String details;

    public static <T> ApiResponse<T> success(T data, String message, int code) {
        return ApiResponse.<T>builder()
                .status("success")
                .code(code)
                .message(message)
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> success(T data, int code) {
        return ApiResponse.<T>builder()
                .status("success")
                .code(code)
                .message("Resource retrieved successfully")
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .status("success")
                .code(200)
                .message("Resource retrieved successfully")
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> created(T data) {
        return ApiResponse.<T>builder()
                .status("success")
                .code(201)
                .message("Resource created successfully")
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> updated(T data) {
        return ApiResponse.<T>builder()
                .status("success")
                .code(200)
                .message("Resource updated successfully")
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> deleted() {
        return ApiResponse.<T>builder()
                .status("success")
                .code(204)
                .message("Resource deleted successfully")
                .build();
    }

    public static <T> ApiResponse<T> error(String message, int code) {
        return ApiResponse.<T>builder()
                .status("error")
                .code(code)
                .message(message)
                .build();
    }

    public static <T> ApiResponse<T> error(String message, int code, String details) {
        return ApiResponse.<T>builder()
                .status("error")
                .code(code)
                .message(message)
                .details(details)
                .build();
    }
}