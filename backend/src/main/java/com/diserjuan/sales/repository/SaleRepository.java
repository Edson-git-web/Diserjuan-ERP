package com.diserjuan.sales.repository;

import com.diserjuan.sales.domain.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long> {

    // NUEVO: Suma total de dinero en un rango de fechas
    // COALESCE(SUM..., 0) asegura que si no hay ventas devuelva 0 en lugar de NULL
    @Query("SELECT COALESCE(SUM(s.total), 0) FROM Sale s WHERE s.dateTime BETWEEN :start AND :end")
    BigDecimal sumTotalSalesByDateRange(LocalDateTime start, LocalDateTime end);

    // NUEVO: Cantidad de tickets generados en un rango de fechas
    @Query("SELECT COUNT(s) FROM Sale s WHERE s.dateTime BETWEEN :start AND :end")
    long countSalesByDateRange(LocalDateTime start, LocalDateTime end);
}