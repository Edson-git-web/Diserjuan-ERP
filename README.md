# 🏢 Diserjuan ERP - Sistema Integral de Gestión

Un sistema transaccional empresarial monolítico reactivo, diseñado para resolver la "Ceguera de Inventario" y la desincronización financiera. Permite gestionar ventas en puntos de venta (POS), auditar inventarios con precisión y visualizar reportes gerenciales con sincronización en tiempo real.

## 🚀 Características Principales

* **Integridad Transaccional (ACID):** Manejo robusto de la base de datos con rollback automático para prevenir quiebres de stock o ventas sin ingreso de caja.
* **Sincronización en Tiempo Real:** Uso de WebSockets (STOMP) para actualizar instantáneamente el stock en todos los terminales conectados cuando ocurre una venta o ingreso de mercadería.
* **Seguridad Robusta (RBAC):** Autenticación mediante **JWT (JSON Web Tokens)** y contraseñas encriptadas con **BCrypt**. Separación estricta de dominios entre roles (`ADMIN` y `VENDEDOR`).
* **Auditoría Inmutable:** Implementación de un **Kardex Valorizado** para la trazabilidad exacta de cada movimiento de almacén (Ingresos y Salidas).
* **Business Intelligence (BI):** Dashboards analíticos interactivos y exportación de matrices de datos masivos a Excel.
* **Control de Caja y Arqueo:** Gestión de turnos de usuarios, registro seguro de gastos operativos y cálculo de descuadres (Sobrantes/Faltantes).

## 🛠️ Tecnologías Utilizadas

### Backend (API REST & WebSockets)
* **Lenguaje:** Java 21 LTS
* **Framework:** Spring Boot 3.4.x
* **Seguridad:** Spring Security 6 + JWT Filter
* **Base de Datos:** SQL Server 2019+
* **ORM:** Hibernate / JPA
* **Real-Time:** Spring WebSockets (STOMP)
* **Gestión de Migraciones:** Flyway (Control de versiones DDL)

### Frontend (Cliente Web SPA)
* **Framework:** React 18 + Vite
* **Lenguaje:** TypeScript
* **Cliente HTTP:** Axios (con Interceptores para manejo de Token JWT)
* **Routing:** React Router DOM
* **Estilos:** Tailwind CSS + Lucide React (Iconos)
* **Visualización de Datos:** Recharts (Gráficos) y SheetJS/XLSX (Exportación Excel)

## 📸 Capturas de Pantalla

<img width="1920" height="962" alt="image" src="https://github.com/user-attachments/assets/206058ba-97d2-4ee4-a5b2-4f4f8c218e03" />
 
<img width="1920" height="675" alt="image" src="https://github.com/user-attachments/assets/eee3e8cc-581a-44b3-8e8c-5362a0c7cc46" />
 
<img width="1920" height="645" alt="image" src="https://github.com/user-attachments/assets/fec8d238-a1cf-4f50-8794-092981fd1348" />
 
<img width="1920" height="972" alt="image" src="https://github.com/user-attachments/assets/aae64708-8a03-4c83-94d2-fe0fe5937154" />
 
<img width="1920" height="866" alt="image" src="https://github.com/user-attachments/assets/9fe30e6e-ed21-4dde-a021-5d2ddc96d2e1" />
 
<img width="1920" height="991" alt="image" src="https://github.com/user-attachments/assets/f7da06f4-3dba-4b20-aa46-0346d5f99fcd" />
 
<img width="1920" height="843" alt="image" src="https://github.com/user-attachments/assets/84cd5c41-0d16-4050-ae6b-5bc73f9bda85" />
 
<img width="1920" height="933" alt="image" src="https://github.com/user-attachments/assets/c080d855-f36b-4f7e-8d19-8ebb53ce4d15" />
 
<img width="1920" height="922" alt="image" src="https://github.com/user-attachments/assets/b98b8227-a5a1-42f8-ae50-787804d1d164" />



## ⚙️ Instalación y Despliegue

### Prerrequisitos
* Java JDK 21 o superior
* Node.js v18+
* SQL Server (Local o Remoto)

### 1. Configuración de la Base de Datos
Crea la base de datos en tu instancia de SQL Server:
```sql
CREATE DATABASE DB_DISERJUAN;
```
*(Nota: Flyway se encargará de crear las tablas automáticamente al iniciar el backend).*

### 2. Configuración del Backend
```bash
cd backend
# Asegúrate de configurar application.properties con tus credenciales de SQL Server (usuario sa)
./mvnw spring-boot:run
```

### 3. Configuración del Frontend
Abre una nueva terminal:
```bash
cd frontend
# Instalar dependencias
npm install
# Iniciar servidor de desarrollo
npm run dev
```

## 🔒 Credenciales de Acceso (Entorno Dev)

Una vez levantado el sistema, puedes acceder con los siguientes usuarios predeterminados (creados vía script de migración inicial):

* **Administrador:**
  * Usuario: `admin`
  * Clave: `123456`
* **Vendedor:**
  * Usuario: `juan`
  * Clave: `123456`
