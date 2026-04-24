package com.diserjuan.finance.domain;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "cash_transactions")
@Data
public class CashTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "shift_id", nullable = false)
    private CashShift shift;

    @Column(nullable = false)
    private LocalDateTime dateTime;

    @Column(nullable = false, length = 20)
    private String type; // "SALE" (Ingreso), "EXPENSE" (Egreso), "OPENING" (Apertura)

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(length = 200)
    private String description;

    private Long relatedSaleId; // Para auditar qué venta generó este dinero

    @PrePersist
    public void prePersist() {
        this.dateTime = LocalDateTime.now();
    }
}