package com.diserjuan.kardex.service;

import com.diserjuan.inventory.domain.Product;
import com.diserjuan.inventory.repository.ProductRepository;
import com.diserjuan.kardex.domain.InventoryMovement;
import com.diserjuan.kardex.domain.MovementType;
import com.diserjuan.kardex.repository.KardexRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class KardexService {

    private final KardexRepository kardexRepository;
    private final ProductRepository productRepository;

    @Transactional
    public void registerMovement(Product product, MovementType type, Integer quantity, BigDecimal unitPrice, String reference) {
        // 1. Capturar saldo inicial
        int balanceBefore = product.getStock();
        int balanceAfter;

        // 2. Calcular nuevo saldo según tipo
        if (type == MovementType.IN_PURCHASE || type == MovementType.IN_ADJUSTMENT || type == MovementType.IN_RETURN) {
            balanceAfter = balanceBefore + quantity;
        } else {
            // Validar stock negativo (Doble check de seguridad)
            if (balanceBefore < quantity) {
                throw new IllegalStateException("Stock insuficiente para realizar el movimiento en " + product.getName());
            }
            balanceAfter = balanceBefore - quantity;
        }

        // 3. Actualizar Producto Maestro (El cambio real)
        product.setStock(balanceAfter);
        productRepository.save(product);

        // 4. Registrar Auditoría (La historia)
        InventoryMovement movement = new InventoryMovement();
        movement.setProduct(product);
        movement.setType(type);
        movement.setQuantity(quantity);
        movement.setUnitPrice(unitPrice);
        movement.setBalanceBefore(balanceBefore);
        movement.setBalanceAfter(balanceAfter);
        movement.setReference(reference);

        kardexRepository.save(movement);
    }
}