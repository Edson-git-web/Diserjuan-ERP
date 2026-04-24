USE DB_DISERJUAN;
GO

-- 1. Borrar los usuarios actuales (que tienen la contraseña mal)
DELETE FROM users;
GO

-- 2. Insertar usuarios con la contraseña YA ENCRIPTADA
-- El código largo de abajo es la versión encriptada de "123456"
INSERT INTO users (full_name, password, role, username) VALUES 
('Juan Perez', '$2a$10$N.zmdr9k7uOCQb376NoUnutj8iAt8aeR0It.dw11qYMS.hRj.gq.', 'VENDEDOR', 'juan'),
('Pedro Gomez', '$2a$10$N.zmdr9k7uOCQb376NoUnutj8iAt8aeR0It.dw11qYMS.hRj.gq.', 'VENDEDOR', 'pedro'),
('Admin Sistema', '$2a$10$N.zmdr9k7uOCQb376NoUnutj8iAt8aeR0It.dw11qYMS.hRj.gq.', 'ADMIN', 'admin');
GO

-- 3. VERIFICACIÓN (Paso vital)
SELECT username, password FROM users;
GO