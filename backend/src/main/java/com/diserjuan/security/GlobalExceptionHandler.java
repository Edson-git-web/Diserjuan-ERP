package com.diserjuan.security;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Manejo centralizado de excepciones de seguridad.
 * Retorna respuestas JSON claras en lugar del HTML genérico de Spring.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    // 403 - Acceso Denegado (usuario autenticado pero sin permisos)
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "status", 403,
                "error", "ACCESS_DENIED",
                "message", "No tienes permiso para realizar esta acción. Se requiere rol de ADMIN.",
                "timestamp", LocalDateTime.now().toString()));
    }

    // 401 - No Autenticado (token inválido o ausente)
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, Object>> handleAuthentication(AuthenticationException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                "status", 401,
                "error", "UNAUTHORIZED",
                "message", "Credenciales inválidas o sesión expirada.",
                "timestamp", LocalDateTime.now().toString()));
    }

    // 400 - Errores de validación (rol inválido, usuario duplicado, etc.)
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "status", 400,
                "error", "VALIDATION_ERROR",
                "message", ex.getMessage(),
                "timestamp", LocalDateTime.now().toString()));
    }
}
