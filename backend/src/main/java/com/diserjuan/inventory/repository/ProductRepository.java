package com.diserjuan.inventory.repository;

import com.diserjuan.inventory.domain.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findBySku(String sku);
    boolean existsBySku(String sku);

    // NUEVO: Contar productos con stock crítico (menos de 5)
    // Usamos JPQL para una consulta eficiente que retorna solo un número
    @Query("SELECT COUNT(p) FROM Product p WHERE p.stock < 5")
    long countCriticalStock();

    // NUEVO: Obtener la lista completa de productos en alerta
    // Se usará para llenar el widget de "Reposición Urgente"
    @Query("SELECT p FROM Product p WHERE p.stock < 5")
    List<Product> findCriticalStockProducts();
}