package com.tiendaropa.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginResponse {

    private String token;

    private String rol;

    private Long idUsuario;

    private String nombre;

}