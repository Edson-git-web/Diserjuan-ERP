use DB_DISERJUAN
go

Select * from users
go

--INSERT INTO users (full_name, password, role, username)
--VALUES ('Kevin Victor Honorio Munive', '202406535', 'ADMIN', 'Kevin');


DELETE FROM users 
WHERE id =12;
go

USE DB_DISERJUAN;
GO

-- Limpiar tabla en caso de conflictos (Opcional)
-- DELETE FROM users;
-- DBCC CHECKIDENT ('users', RESEED, 0);
 --go

-- Insertar Administrador
INSERT INTO users (username, full_name, role, password) 
VALUES (
    'admin', 
    'Administrador del Sistema', 
    'ADMIN', 
    '$2a$10$XURPShQNCsLjp1ESc2laoO49BPZ4CGqulX6G.xX9G2oU4X8P8b7Kq' -- Hash para: 123456
);

-- Insertar Vendedor
INSERT INTO users (username, full_name, role, password) 
VALUES (
    'juan', 
    'Juan Perez', 
    'VENDEDOR', 
    '$2a$10$XURPShQNCsLjp1ESc2laoO49BPZ4CGqulX6G.xX9G2oU4X8P8b7Kq' -- Hash para: 123456
);
GO


USE DB_DISERJUAN;
GO

-- Hash verificado universal para '123456'
DECLARE @Hash123456 VARCHAR(255) = '$2a$10$EblZqNptyYvcLm/VwDCVAuAw5QkEX/1gUo.pD0hN1wB9Sj6A/g7Fm';

-- Sobrescribir forzosamente el admin
UPDATE users 
SET password = '$2a$10$EblZqNptyYvcLm/VwDCVAuAw5QkEX/1gUo.pD0hN1wB9Sj6A/g7Fm', 
    role = 'ADMIN' 
WHERE username = 'admin';

-- Sobrescribir forzosamente el vendedor
UPDATE users 
SET password = '$2a$10$EblZqNptyYvcLm/VwDCVAuAw5QkEX/1gUo.pD0hN1wB9Sj6A/g7Fm', 
    role = 'VENDEDOR' 
WHERE username = 'juan';

-- Verificar la inyección
SELECT id, username, role, password FROM users WHERE username IN ('admin', 'juan');
GO
