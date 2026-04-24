package com.diserjuan.reporting.controller;

import com.diserjuan.reporting.dto.ReportingDto;
import com.diserjuan.reporting.service.ReportingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class ReportingController {

    private final ReportingService reportingService;

    @GetMapping("/dashboard-charts")
    public ResponseEntity<Map<String, Object>> getDashboardCharts() {
        return ResponseEntity.ok(Map.of(
                "salesTrend", reportingService.getLast7DaysSales(),
                "topProducts", reportingService.getTop5Products()));
    }
}