package com.diserjuan.finance.domain;

import com.diserjuan.security.domain.User;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "cash_shifts")
@Data
public class CashShift {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // Cajero responsable

    @Column(nullable = false)
    private LocalDateTime startTime;

    private LocalDateTime endTime;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal initialBalance; // Dinero base al abrir

    @Column(precision = 10, scale = 2)
    private BigDecimal finalBalance; // Dinero contado al cerrar (Arqueo físico)

    @Column(precision = 10, scale = 2)
    private BigDecimal systemBalance; // Dinero calculado por el sistema

    @Column(precision = 10, scale = 2)
    private BigDecimal difference; // Sobrante o Faltante

    @Column(nullable = false)
    private String status; // "OPEN", "CLOSED"

    @PrePersist
    public void prePersist() {
        this.startTime = LocalDateTime.now();
        this.status = "OPEN";
    }
}