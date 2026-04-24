package com.diserjuan.security.dto;

import lombok.Data;

public class UserDto {

    @Data
    public static class Request {
        private String username;
        private String password; // Solo para crear/actualizar
        private String fullName;
        private String role; // ADMIN, VENDEDOR
    }

    @Data
    public static class Response {
        private Long id;
        private String username;
        private String fullName;
        private String role;
        private Boolean active; // Para saber si está habilitado
    }
}