package com.diserjuan.reporting.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

public class ReportingDto {

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SalesByDay {
        private String date; // Fecha formateada
        private BigDecimal total;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TopProduct {
        private String productName;
        private Long quantitySold;
        private BigDecimal totalRevenue;
    }
}