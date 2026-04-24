package com.diserjuan.customers.controller;

import com.diserjuan.customers.domain.Customer;
import com.diserjuan.customers.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CustomerController {

    private final CustomerRepository customerRepository;

    @GetMapping
    public ResponseEntity<List<Customer>> getAll() {
        return ResponseEntity.ok(customerRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<Customer> create(@RequestBody Customer customer) {
        if (customerRepository.existsByDocumentNumber(customer.getDocumentNumber())) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(customerRepository.save(customer));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Customer> update(@PathVariable Long id, @RequestBody Customer details) {
        return customerRepository.findById(id)
                .map(existing -> {
                    existing.setName(details.getName());
                    existing.setEmail(details.getEmail());
                    existing.setPhone(details.getPhone());
                    existing.setAddress(details.getAddress());
                    existing.setDocumentNumber(details.getDocumentNumber());
                    return ResponseEntity.ok(customerRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}