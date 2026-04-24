package com.diserjuan.sales.domain;

import com.diserjuan.customers.domain.Customer;
import com.diserjuan.sales.domain.SaleDetail; // Import explícito
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sales")
@Data
public class Sale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime dateTime;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    // NUEVO: Relación con Cliente (Puede ser null para ventas anónimas, pero en B2B se exige)
    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @OneToMany(mappedBy = "sale", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SaleDetail> items = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        this.dateTime = LocalDateTime.now();
    }
}