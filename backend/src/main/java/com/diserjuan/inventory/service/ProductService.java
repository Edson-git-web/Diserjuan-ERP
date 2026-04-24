package com.diserjuan.inventory.service;

import com.diserjuan.inventory.domain.Product;
import java.util.List;
import java.util.Optional;

public interface ProductService {
    List<Product> getAllProducts();
    Optional<Product> getProductById(Long id);
    Product createProduct(Product product);
    Product updateStock(Long id, Integer quantity);
    void deleteProduct(Long id);
}