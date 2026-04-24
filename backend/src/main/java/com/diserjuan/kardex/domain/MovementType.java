package com.diserjuan.kardex.domain;

public enum MovementType {
    IN_PURCHASE("Compra a Proveedor"),
    IN_ADJUSTMENT("Ajuste de Inventario (+)"),
    IN_RETURN("Devolución de Cliente"),
    OUT_SALE("Venta"),
    OUT_ADJUSTMENT("Merma / Daño (-)"),
    OUT_EXPIRATION("Vencimiento");

    private final String description;

    MovementType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}