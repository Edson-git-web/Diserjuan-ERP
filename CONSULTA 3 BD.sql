USE DB_DISERJUAN;
GO

-- 1. Limpiar datos previos (Orden inverso por las Foreign Keys)
DELETE FROM sale_details;
DELETE FROM sales;
DELETE FROM products;
DELETE FROM users;
DBCC CHECKIDENT ('products', RESEED, 0);
DBCC CHECKIDENT ('users', RESEED, 0);
GO

-- 2. Insertar Usuarios (Password es '123456' encriptado)
INSERT INTO users (full_name, password, role, username) VALUES 
('Juan Perez', '$2a$10$N.zmdr9k7uOCQb376NoUnutj8iAt8aeR0It.dw11qYMS.hRj.gq.', 'VENDEDOR', 'juan'),
('Pedro Gomez', '$2a$10$N.zmdr9k7uOCQb376NoUnutj8iAt8aeR0It.dw11qYMS.hRj.gq.', 'VENDEDOR', 'pedro'),
('Admin Sistema', '$2a$10$N.zmdr9k7uOCQb376NoUnutj8iAt8aeR0It.dw11qYMS.hRj.gq.', 'ADMIN', 'admin');

-- 3. Insertar 20 Productos Variados (Hardware y Laptops)
INSERT INTO products (active, description, name, price, sku, stock) VALUES 
(1, 'Laptop Gamer gama alta, RTX 4090, 32GB RAM', 'MSI Raider GE78', 12500.00, 'LAP-MSI-001', 5),
(1, 'Laptop trabajo ligero, i5 12va, 8GB RAM', 'Lenovo V15 G3', 1800.00, 'LAP-LEN-002', 20),
(1, 'Ultrabook premium, M2 Pro, 16GB RAM', 'MacBook Pro 14', 8500.00, 'LAP-APP-003', 8),
(1, 'Monitor 27 pulgadas 144Hz IPS', 'Monitor LG UltraGear', 1200.00, 'MON-LG-001', 15),
(1, 'Monitor Curvo 34 pulgadas', 'Samsung Odyssey G5', 1900.00, 'MON-SAM-002', 6),
(1, 'Teclado Mecanico Switch Blue', 'Redragon Kumara', 150.00, 'PER-RED-001', 50),
(1, 'Mouse Gamer 16000 DPI', 'Logitech G502 Hero', 220.00, 'PER-LOG-002', 30),
(1, 'Tarjeta de Video 12GB VRAM', 'NVIDIA RTX 4070', 3200.00, 'COM-GPU-001', 4),
(1, 'Procesador 16 nucleos', 'Intel Core i9-13900K', 2800.00, 'COM-CPU-002', 7),
(1, 'Memoria RAM 16GB DDR5 5200MHz', 'Kingston Fury Beast', 350.00, 'COM-RAM-003', 40),
(1, 'Disco Solido NVMe 1TB Gen4', 'WD Black SN850X', 450.00, 'COM-SSD-004', 25),
(1, 'Fuente de Poder 850W Gold', 'Corsair RM850x', 600.00, 'COM-PSU-005', 12),
(1, 'Case Mid Tower Vidrio Templado', 'NZXT H5 Flow', 480.00, 'COM-CAS-006', 10),
(1, 'Silla Gamer Ergonomica', 'Cougar Armor One', 800.00, 'MOB-SIL-001', 5),
(1, 'Webcam 1080p 60fps', 'Logitech StreamCam', 450.00, 'PER-CAM-003', 18),
(1, 'Audifonos Wireless 7.1', 'HyperX Cloud II', 550.00, 'AUD-HYP-001', 14),
(1, 'Impresora Multifuncional Tanque', 'Epson EcoTank L3250', 750.00, 'IMP-EPS-001', 9),
(1, 'Tablet Android 11 pulgadas', 'Xiaomi Pad 6', 1400.00, 'TAB-XIA-001', 11),
(1, 'Router WiFi 6 Doble Banda', 'TP-Link Archer AX50', 300.00, 'NET-ROU-001', 22),
(1, 'Switch 8 Puertos Gigabit', 'D-Link DGS-1008A', 80.00, 'NET-SWI-002', 35);
GO


SELECT * FROM users;
SELECT * FROM products;