package com.diserjuan.finance.repository;

import com.diserjuan.finance.domain.CashTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface CashTransactionRepository extends JpaRepository<CashTransaction, Long> {
    List<CashTransaction> findByShiftIdOrderByDateTimeDesc(Long shiftId);

    // Sumar ingresos y egresos para calcular el saldo actual
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM CashTransaction t WHERE t.shift.id = :shiftId")
    BigDecimal sumAmountByShiftId(Long shiftId);
}