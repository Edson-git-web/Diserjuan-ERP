package com.diserjuan.sales.controller;

import com.diserjuan.inventory.repository.ProductRepository;
import com.diserjuan.sales.dto.DashboardStats;
import com.diserjuan.sales.repository.SaleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DashboardController {

    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStats> getStats() {
        // 1. Definimos el rango de tiempo: HOY completo
        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime endOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);

        // 2. Ejecutamos las 4 consultas optimizadas en paralelo (virtualmente)
        var stats = DashboardStats.builder()
                .todaySales(saleRepository.sumTotalSalesByDateRange(startOfDay, endOfDay))
                .todayOrders(saleRepository.countSalesByDateRange(startOfDay, endOfDay))
                .criticalStockCount(productRepository.countCriticalStock())
                .criticalProducts(productRepository.findCriticalStockProducts())
                .build();

        return ResponseEntity.ok(stats);
    }
}