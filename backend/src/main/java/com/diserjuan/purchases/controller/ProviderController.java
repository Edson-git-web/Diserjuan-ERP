package com.diserjuan.purchases.controller;

import com.diserjuan.purchases.domain.Provider;
import com.diserjuan.purchases.repository.ProviderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/providers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProviderController {

    private final ProviderRepository providerRepository;

    @GetMapping
    public ResponseEntity<List<Provider>> getAll() {
        return ResponseEntity.ok(providerRepository.findAll());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Provider> create(@RequestBody Provider provider) {
        if (providerRepository.existsByRuc(provider.getRuc())) {
            return ResponseEntity.badRequest().build(); // RUC duplicado
        }
        return ResponseEntity.ok(providerRepository.save(provider));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Provider> update(@PathVariable Long id, @RequestBody Provider details) {
        return providerRepository.findById(id)
                .map(existing -> {
                    existing.setBusinessName(details.getBusinessName());
                    existing.setContactName(details.getContactName());
                    existing.setPhone(details.getPhone());
                    existing.setEmail(details.getEmail());
                    return ResponseEntity.ok(providerRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}