package com.diserjuan.security.controller;

import com.diserjuan.security.JwtUtils;
import com.diserjuan.security.domain.User;
import com.diserjuan.security.repository.UserRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        try {
            // 1. Autenticación contra BCrypt en Base de Datos
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

            // 2. Extracción de datos maestros del usuario
            User user = userRepository.findByUsername(request.getUsername())
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado post-auth"));

            // 3. Generación de Token CON ROL embebido
            String token = jwtUtils.generateToken(user.getUsername(), user.getRole().name());

            // 4. Retorno de Payload Enriquecido (Requerido para RBAC en React)
            return ResponseEntity
                    .ok(new AuthResponse(token, user.getUsername(), user.getRole().name(), user.getFullName()));

        } catch (AuthenticationException e) {
            return ResponseEntity.status(401).build();
        }
    }

    @Data
    public static class LoginRequest {
        private String username;
        private String password;
    }

    @Data
    public static class AuthResponse {
        private String token;
        private String username;
        private String role;
        private String fullName;

        public AuthResponse(String token, String username, String role, String fullName) {
            this.token = token;
            this.username = username;
            this.role = role;
            this.fullName = fullName;
        }
    }
}