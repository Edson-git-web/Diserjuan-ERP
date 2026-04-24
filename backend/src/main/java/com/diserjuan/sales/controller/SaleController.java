package com.diserjuan.sales.controller;

import com.diserjuan.sales.domain.Sale;
import com.diserjuan.sales.dto.SaleRequest;
import com.diserjuan.sales.dto.SaleResponse;
import com.diserjuan.sales.repository.SaleRepository;
import com.diserjuan.sales.service.SaleService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/sales")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SaleController {

    private final SaleService saleService;
    private final SaleRepository saleRepository;

    // Endpoint existente para registrar venta
    @PostMapping
    public ResponseEntity<Sale> createSale(@RequestBody SaleRequest request) {
        return ResponseEntity.ok(saleService.registerSale(request));
    }

    // NUEVO: Historial completo (Mapeado a DTO para ser ligero)
    @GetMapping
    public ResponseEntity<List<SaleResponse>> getAllSales() {
        // Obtenemos todas las ventas ordenadas por fecha descendente (lo más nuevo arriba)
        List<Sale> sales = saleRepository.findAll(Sort.by(Sort.Direction.DESC, "dateTime"));

        // Convertimos Entidad -> DTO manualmente
        List<SaleResponse> response = sales.stream().map(sale -> {
            SaleResponse dto = new SaleResponse();
            dto.setId(sale.getId());
            dto.setDateTime(sale.getDateTime());
            dto.setTotal(sale.getTotal());
            dto.setItemsCount(sale.getItems().size());
            return dto;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // NUEVO: Detalle individual (Para generar el PDF)
    @GetMapping("/{id}")
    public ResponseEntity<Sale> getSaleById(@PathVariable Long id) {
        return saleRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}