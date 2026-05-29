package com.tiendaropa.backend.exception;

import java.time.LocalDateTime;

public class ApiError {
    private String mensaje;
    private int codigo;
    private LocalDateTime timestamp;

    public ApiError(String mensaje, int codigo, LocalDateTime timestamp) {
        this.mensaje = mensaje;
        this.codigo = codigo;
        this.timestamp = timestamp;
    }

    public String getMensaje() { return mensaje; }
    public int getCodigo() { return codigo; }
    public LocalDateTime getTimestamp() { return timestamp; }
}
