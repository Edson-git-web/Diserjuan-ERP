package com.diserjuan.sales.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class SaleResponse {
    private Long id;
    private LocalDateTime dateTime;
    private BigDecimal total;
    private Integer itemsCount; // Solo decimos "5 productos", no enviamos la lista entera aquí
}