package com.diserjuan.purchases.service;

import com.diserjuan.inventory.domain.Product;
import com.diserjuan.inventory.repository.ProductRepository;
import com.diserjuan.kardex.domain.MovementType;
import com.diserjuan.kardex.service.KardexService;
import com.diserjuan.purchases.domain.Provider;
import com.diserjuan.purchases.domain.Purchase;
import com.diserjuan.purchases.domain.PurchaseDetail;
import com.diserjuan.purchases.dto.PurchaseRequest;
import com.diserjuan.purchases.repository.ProviderRepository;
import com.diserjuan.purchases.repository.PurchaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class PurchaseService {

    private final PurchaseRepository purchaseRepository;
    private final ProviderRepository providerRepository;
    private final ProductRepository productRepository;
    private final KardexService kardexService; // Inyección del Núcleo de Auditoría
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public Purchase registerPurchase(PurchaseRequest request) {
        Provider provider = providerRepository.findById(request.getProviderId())
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado"));

        Purchase purchase = new Purchase();
        purchase.setProvider(provider);
        purchase.setInvoiceNumber(request.getInvoiceNumber());
        purchase.setItems(new ArrayList<>());

        BigDecimal totalPurchase = BigDecimal.ZERO;

        for (PurchaseRequest.PurchaseItemRequest item : request.getItems()) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + item.getProductId()));

            // --- INTEGRACIÓN KARDEX (REFACTORIZACIÓN 7) ---
            // Registramos la ENTRADA de stock de forma auditada.
            // Esto aumenta el stock en la tabla de productos y crea el registro en el Kardex.
            kardexService.registerMovement(
                    product,
                    MovementType.IN_PURCHASE,
                    item.getQuantity(),
                    item.getUnitCost(), // Costo de adquisición
                    "Factura " + request.getInvoiceNumber() // Referencia cruzada con documento físico
            );

            // Opcional: Aquí podrías implementar lógica de "Precio Promedio Ponderado" si lo requieres.

            PurchaseDetail detail = new PurchaseDetail();
            detail.setPurchase(purchase);
            detail.setProduct(product);
            detail.setQuantity(item.getQuantity());
            detail.setUnitCost(item.getUnitCost());

            BigDecimal subtotal = item.getUnitCost().multiply(new BigDecimal(item.getQuantity()));
            detail.setSubtotal(subtotal);

            purchase.getItems().add(detail);
            totalPurchase = totalPurchase.add(subtotal);
        }

        purchase.setTotal(totalPurchase);
        Purchase savedPurchase = purchaseRepository.save(purchase);

        // Notificar al Dashboard que el stock cambió (para apagar alertas de stock crítico)
        messagingTemplate.convertAndSend("/topic/inventory-updates", "ACTUALIZAR_STOCK");

        return savedPurchase;
    }
}