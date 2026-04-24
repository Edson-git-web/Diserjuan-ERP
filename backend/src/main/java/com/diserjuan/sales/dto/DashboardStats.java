package com.diserjuan.sales.dto;

import com.diserjuan.inventory.domain.Product;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class DashboardStats {
    private BigDecimal todaySales;      // Dinero total vendido hoy
    private Long todayOrders;           // Cantidad de pedidos hoy
    private Long criticalStockCount;    // Número de productos en alerta
    private List<Product> criticalProducts; // Lista detallada de productos en riesgo
}