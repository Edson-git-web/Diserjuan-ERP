package com.diserjuan.finance.controller;

import com.diserjuan.finance.domain.CashShift;
import com.diserjuan.finance.service.CashService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/cash")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CashController {

    private final CashService cashService;

    @GetMapping("/status")
    public ResponseEntity<CashShift> getStatus(Authentication auth) {
        // Busca si el usuario logueado tiene caja abierta
        return ResponseEntity.ok(cashService.getCurrentShift(auth.getName()));
    }

    @PostMapping("/open")
    public ResponseEntity<CashShift> openShift(@RequestBody OpenShiftRequest req, Authentication auth) {
        return ResponseEntity.ok(cashService.openShift(auth.getName(), req.getAmount()));
    }

    @PostMapping("/close")
    public ResponseEntity<CashShift> closeShift(@RequestBody CloseShiftRequest req) {
        return ResponseEntity.ok(cashService.closeShift(req.getShiftId(), req.getPhysicalAmount()));
    }

    @PostMapping("/expense")
    public ResponseEntity<Void> addExpense(@RequestBody ExpenseRequest req) {
        cashService.registerExpense(req.getShiftId(), req.getAmount(), req.getDescription());
        return ResponseEntity.ok().build();
    }

    @Data
    public static class OpenShiftRequest { private BigDecimal amount; }
    @Data
    public static class CloseShiftRequest { private Long shiftId; private BigDecimal physicalAmount; }
    @Data
    public static class ExpenseRequest { private Long shiftId; private BigDecimal amount; private String description; }
}