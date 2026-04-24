package com.diserjuan.reporting.repository;

import com.diserjuan.sales.domain.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportingRepository extends JpaRepository<Sale, Long> {

    // 1. Ventas de los últimos 7 días agrupadas por fecha
    // SQL Server Syntax: FORMAT(date, 'yyyy-MM-dd')
    @Query(value = """
        SELECT 
            FORMAT(s.date_time, 'dd/MM') as date, 
            SUM(s.total) as total 
        FROM sales s 
        WHERE s.date_time >= DATEADD(day, -7, GETDATE()) 
        GROUP BY FORMAT(s.date_time, 'dd/MM') 
        ORDER BY MIN(s.date_time) ASC
    """, nativeQuery = true)
    List<Object[]> getLast7DaysSalesRaw();

    // 2. Top 5 Productos más vendidos (Cantidad y Dinero)
    @Query(value = """
        SELECT TOP 5 
            p.name, 
            SUM(d.quantity) as qty, 
            SUM(d.subtotal) as revenue 
        FROM sale_details d 
        JOIN products p ON d.product_id = p.id 
        GROUP BY p.name 
        ORDER BY revenue DESC
    """, nativeQuery = true)
    List<Object[]> getTop5ProductsRaw();
}