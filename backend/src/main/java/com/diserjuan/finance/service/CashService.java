package com.diserjuan.finance.service;

import com.diserjuan.finance.domain.CashShift;
import com.diserjuan.finance.domain.CashTransaction;
import com.diserjuan.finance.repository.CashShiftRepository;
import com.diserjuan.finance.repository.CashTransactionRepository;
import com.diserjuan.security.domain.User;
import com.diserjuan.security.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CashService {

    private final CashShiftRepository shiftRepository;
    private final CashTransactionRepository transactionRepository;
    private final UserRepository userRepository;

    // 1. ABRIR CAJA
    @Transactional
    public CashShift openShift(String username, BigDecimal initialBalance) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Validar que no tenga caja abierta
        if (shiftRepository.findByUserIdAndStatus(user.getId(), "OPEN").isPresent()) {
            throw new IllegalStateException("El usuario ya tiene una caja abierta.");
        }

        CashShift shift = new CashShift();
        shift.setUser(user);
        shift.setInitialBalance(initialBalance);
        shift = shiftRepository.save(shift);

        // Registrar movimiento inicial
        registerTransaction(shift, "OPENING", initialBalance, "Apertura de Caja", null);

        return shift;
    }

    // 2. REGISTRAR MOVIMIENTO (Interno)
    @Transactional
    public void registerTransaction(CashShift shift, String type, BigDecimal amount, String desc, Long saleId) {
        CashTransaction tx = new CashTransaction();
        tx.setShift(shift);
        tx.setType(type);
        tx.setAmount(amount); // Sale es positivo, Expense debe venir negativo
        tx.setDescription(desc);
        tx.setRelatedSaleId(saleId);
        transactionRepository.save(tx);
    }

    // 3. OBTENER CAJA ACTUAL
    public CashShift getCurrentShift(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        return shiftRepository.findByUserIdAndStatus(user.getId(), "OPEN")
                .orElse(null); // Retorna null si no hay caja abierta
    }

    // 4. OBTENER SALDO ACTUAL
    public BigDecimal getCurrentBalance(Long shiftId) {
        return transactionRepository.sumAmountByShiftId(shiftId);
    }

    // 5. CERRAR CAJA (Arqueo)
    @Transactional
    public CashShift closeShift(Long shiftId, BigDecimal physicalCount) {
        CashShift shift = shiftRepository.findById(shiftId)
                .orElseThrow(() -> new RuntimeException("Turno no encontrado"));

        if (!"OPEN".equals(shift.getStatus())) {
            throw new IllegalStateException("La caja ya está cerrada.");
        }

        BigDecimal systemCalc = transactionRepository.sumAmountByShiftId(shiftId);

        shift.setEndTime(LocalDateTime.now());
        shift.setFinalBalance(physicalCount); // Lo que contó el cajero
        shift.setSystemBalance(systemCalc);   // Lo que dice el software
        shift.setDifference(physicalCount.subtract(systemCalc)); // Diferencia
        shift.setStatus("CLOSED");

        return shiftRepository.save(shift);
    }

    // 6. REGISTRAR GASTO MANUAL
    @Transactional
    public void registerExpense(Long shiftId, BigDecimal amount, String description) {
        CashShift shift = shiftRepository.findById(shiftId)
                .orElseThrow(() -> new RuntimeException("Caja cerrada o no existe"));

        // Egresos se guardan en negativo
        registerTransaction(shift, "EXPENSE", amount.negate(), description, null);
    }
}