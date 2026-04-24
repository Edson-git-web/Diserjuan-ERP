package com.diserjuan.security.service;

import com.diserjuan.security.domain.Role;
import com.diserjuan.security.domain.User;
import com.diserjuan.security.dto.UserDto;
import com.diserjuan.security.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UserDto.Response> getAll() {
        return userRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public UserDto.Response create(UserDto.Request request) {
        Role role = parseRole(request.getRole());

        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new IllegalArgumentException("El nombre de usuario ya existe.");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setFullName(request.getFullName());
        user.setRole(role);
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        return toResponse(userRepository.save(user));
    }

    @Transactional
    public UserDto.Response update(Long id, UserDto.Request request) {
        Role role = parseRole(request.getRole());

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        user.setFullName(request.getFullName());
        user.setRole(role);

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        return toResponse(userRepository.save(user));
    }

    private Role parseRole(String role) {
        try {
            return Role.valueOf(role.toUpperCase());
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new IllegalArgumentException(
                    "Rol inválido: '" + role + "'. Los roles permitidos son: " + Arrays.toString(Role.values()));
        }
    }

    private UserDto.Response toResponse(User user) {
        UserDto.Response response = new UserDto.Response();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setFullName(user.getFullName());
        response.setRole(user.getRole().name());
        response.setActive(true);
        return response;
    }
}