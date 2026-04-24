package com.diserjuan.purchases.controller;

import com.diserjuan.purchases.domain.Purchase;
import com.diserjuan.purchases.dto.PurchaseRequest;
import com.diserjuan.purchases.service.PurchaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/purchases")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PurchaseController {

    private final PurchaseService purchaseService;

    @PostMapping
    public ResponseEntity<Purchase> createPurchase(@RequestBody PurchaseRequest request) {
        return ResponseEntity.ok(purchaseService.registerPurchase(request));
    }
}