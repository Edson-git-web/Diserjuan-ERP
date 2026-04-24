package com.diserjuan.reporting.service;

import com.diserjuan.reporting.dto.ReportingDto;
import com.diserjuan.reporting.repository.ReportingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportingService {

    private final ReportingRepository reportingRepository;

    public List<ReportingDto.SalesByDay> getLast7DaysSales() {
        List<Object[]> results = reportingRepository.getLast7DaysSalesRaw();
        return results.stream()
                .map(obj -> new ReportingDto.SalesByDay((String) obj[0], (BigDecimal) obj[1]))
                .collect(Collectors.toList());
    }

    public List<ReportingDto.TopProduct> getTop5Products() {
        List<Object[]> results = reportingRepository.getTop5ProductsRaw();
        return results.stream()
                .map(obj -> new ReportingDto.TopProduct(
                        (String) obj[0],
                        ((Number) obj[1]).longValue(),
                        (BigDecimal) obj[2]
                ))
                .collect(Collectors.toList());
    }
}