package com.diserjuan.finance.repository;

import com.diserjuan.finance.domain.CashShift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CashShiftRepository extends JpaRepository<CashShift, Long> {
    // Buscar si el usuario tiene una caja abierta
    Optional<CashShift> findByUserIdAndStatus(Long userId, String status);
}