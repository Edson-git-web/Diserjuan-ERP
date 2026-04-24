package com.diserjuan.kardex.controller;

import com.diserjuan.kardex.domain.InventoryMovement;
import com.diserjuan.kardex.repository.KardexRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/kardex")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class KardexController {

    private final KardexRepository kardexRepository;

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<InventoryMovement>> getMovementsByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(kardexRepository.findByProductIdOrderByDateTimeDesc(productId));
    }
}