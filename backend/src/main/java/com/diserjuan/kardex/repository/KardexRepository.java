package com.diserjuan.kardex.repository;

import com.diserjuan.kardex.domain.InventoryMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KardexRepository extends JpaRepository<InventoryMovement, Long> {
    // Buscar movimientos de un producto ordenados cronológicamente
    List<InventoryMovement> findByProductIdOrderByDateTimeDesc(Long productId);
}