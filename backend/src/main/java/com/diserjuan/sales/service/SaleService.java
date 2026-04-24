package com.diserjuan.sales.service;

import com.diserjuan.sales.domain.Sale;
import com.diserjuan.sales.dto.SaleRequest;

public interface SaleService {
    Sale registerSale(SaleRequest request);
}