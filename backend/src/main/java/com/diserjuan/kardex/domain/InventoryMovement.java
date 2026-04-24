package com.diserjuan.kardex.domain;

import com.diserjuan.inventory.domain.Product;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_movements")
@Data
@NoArgsConstructor
public class InventoryMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime dateTime;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MovementType type; // ENTRADA o SALIDA

    @Column(nullable = false)
    private Integer quantity; // Cantidad movida (siempre positiva)

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice; // Costo o Precio al momento del movimiento

    @Column(nullable = false)
    private Integer balanceBefore; // Stock antes

    @Column(nullable = false)
    private Integer balanceAfter; // Stock después (Saldo)

    @Column(length = 100)
    private String reference; // Nro Factura, Nro Ticket, Motivo de ajuste

    @PrePersist
    public void prePersist() {
        this.dateTime = LocalDateTime.now();
    }
}