package com.diserjuan.sales.service;

import com.diserjuan.customers.repository.CustomerRepository;
import com.diserjuan.finance.domain.CashShift;
import com.diserjuan.finance.repository.CashShiftRepository;
import com.diserjuan.finance.service.CashService;
import com.diserjuan.inventory.domain.Product;
import com.diserjuan.inventory.repository.ProductRepository;
import com.diserjuan.kardex.domain.MovementType;
import com.diserjuan.kardex.service.KardexService;
import com.diserjuan.sales.domain.Sale;
import com.diserjuan.sales.domain.SaleDetail;
import com.diserjuan.sales.dto.SaleRequest;
import com.diserjuan.sales.repository.SaleRepository;
import com.diserjuan.security.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class SaleServiceImpl implements SaleService {

    // Repositorios Base
    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;

    // Servicios de Dominio Cruzado
    private final KardexService kardexService; // Auditoría de Stock
    private final CashService cashService;     // Control Financiero

    // Repositorios de Apoyo
    private final CashShiftRepository shiftRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public Sale registerSale(SaleRequest request) {
        // 1. VALIDACIÓN DE CAJA (FASE 5)
        // Obtener usuario actual del contexto de seguridad
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        Long userId = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Usuario no autenticado")).getId();

        // Verificar si tiene turno abierto. Si no, bloquear venta.
        CashShift shift = shiftRepository.findByUserIdAndStatus(userId, "OPEN")
                .orElseThrow(() -> new IllegalStateException("OPERACIÓN DENEGADA: Debe realizar la Apertura de Caja antes de vender."));

        // 2. CREACIÓN DE LA VENTA
        Sale sale = new Sale();
        sale.setTotal(BigDecimal.ZERO);
        sale.setItems(new ArrayList<>());

        // Asignación de Cliente (FASE 2)
        if (request.getCustomerId() != null) {
            sale.setCustomer(customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new RuntimeException("Cliente no encontrado")));
        }

        // Guardado preliminar para obtener ID (Ticket)
        Sale savedSalePrelim = saleRepository.save(sale);
        BigDecimal totalSale = BigDecimal.ZERO;

        // 3. PROCESAMIENTO DE ITEMS
        for (SaleRequest.SaleItemRequest item : request.getItems()) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + item.getProductId()));

            // KARDEX (FASE 4): Registrar salida auditada
            kardexService.registerMovement(
                    product,
                    MovementType.OUT_SALE,
                    item.getQuantity(),
                    product.getPrice(),
                    "Venta #" + savedSalePrelim.getId()
            );

            // Detalle de Venta
            SaleDetail detail = new SaleDetail();
            detail.setSale(savedSalePrelim);
            detail.setProduct(product);
            detail.setQuantity(item.getQuantity());
            detail.setPrice(product.getPrice());
            detail.setSubtotal(product.getPrice().multiply(new BigDecimal(item.getQuantity())));

            savedSalePrelim.getItems().add(detail);
            totalSale = totalSale.add(detail.getSubtotal());
        }

        savedSalePrelim.setTotal(totalSale);
        Sale finalSale = saleRepository.save(savedSalePrelim);

        // 4. REGISTRO EN CAJA (FASE 5)
        // Ingresar el dinero al turno actual
        cashService.registerTransaction(
                shift,
                "SALE",
                totalSale,
                "Venta Ticket #" + finalSale.getId(),
                finalSale.getId()
        );

        // 5. NOTIFICACIÓN REAL-TIME
        messagingTemplate.convertAndSend("/topic/inventory-updates", "ACTUALIZAR_STOCK");

        return finalSale;
    }
}