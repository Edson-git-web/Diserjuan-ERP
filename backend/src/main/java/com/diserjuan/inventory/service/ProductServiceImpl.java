package com.diserjuan.inventory.service;

import com.diserjuan.inventory.domain.Product;
import com.diserjuan.inventory.repository.ProductRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Importante para ACID
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor // Inyecta el repositorio automáticamente (Constructor Injection)
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    @Override
    @Transactional
    public Product createProduct(Product product) {
        if (productRepository.existsBySku(product.getSku())) {
            throw new IllegalArgumentException("Ya existe un producto con el SKU: " + product.getSku());
        }
        return productRepository.save(product);
    }

    @Override
    @Transactional
    public Product updateStock(Long id, Integer quantity) {
        // Aquí implementaremos más adelante el bloqueo pesimista (Pessimistic Locking)
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado"));

        int newStock = product.getStock() + quantity;
        if (newStock < 0) {
            throw new IllegalStateException("Stock insuficiente. Stock actual: " + product.getStock());
        }

        product.setStock(newStock);
        return productRepository.save(product);
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }
}