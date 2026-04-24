package com.diserjuan.sales.dto;

import lombok.Data;
import java.util.List;

@Data
public class SaleRequest {
    private Long customerId; // NUEVO: ID del cliente que compra
    private List<SaleItemRequest> items;

    @Data
    public static class SaleItemRequest {
        private Long productId;
        private Integer quantity;
    }
}