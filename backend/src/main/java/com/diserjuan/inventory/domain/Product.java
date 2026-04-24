package com.diserjuan.inventory.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "products")
@Data // Lombok genera Getters, Setters, ToString, HashCode automáticamente
@NoArgsConstructor // Constructor vacío requerido por JPA
@AllArgsConstructor // Constructor con todos los argumentos
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // SQL Server IDENTITY(1,1)
    private Long id;

    // SKU (Stock Keeping Unit): Código único del producto (Ej: "BEB-001")
    @Column(nullable = false, unique = true, length = 50)
    private String sku;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 500)
    private String description;

    // IMPORTANTE: Nunca usar Double/Float para dinero por errores de redondeo.
    // precision=10, scale=2 significa: 99999999.99
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private Integer stock;

    @Column(nullable = false)
    private Boolean active = true;
}