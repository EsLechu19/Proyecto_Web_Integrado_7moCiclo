package com.tiendaropa.backend.controller;

import com.tiendaropa.backend.entity.Usuario;
import com.tiendaropa.backend.exception.AccesoDenegadoException;
import com.tiendaropa.backend.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping("/registro")
    public Usuario registrarCliente(@Valid @RequestBody Usuario usuario) {
        return usuarioService.registrarCliente(usuario);
    }

    @GetMapping
    public List<Usuario> listarUsuarios() {
        return usuarioService.listarUsuarios();
    }

    @GetMapping("/{id}")
    public Usuario obtenerUsuario(@PathVariable Long id) {
        return usuarioService.obtenerUsuario(id);
    }

    @PutMapping("/{id}")
    public Usuario actualizarUsuario(
            @PathVariable Long id,
            @RequestBody Usuario usuario,
            Authentication auth) {

        if (!esPropietarioOAdmin(auth, id)) {
            throw new AccesoDenegadoException("No tienes permiso para modificar este usuario");
        }

        return usuarioService.actualizarUsuario(id, usuario);
    }

    @DeleteMapping("/{id}")
    public void eliminarUsuario(
            @PathVariable Long id,
            Authentication auth) {

        if (!esPropietarioOAdmin(auth, id)) {
            throw new AccesoDenegadoException("No tienes permiso para eliminar este usuario");
        }

        usuarioService.eliminarUsuario(id);
    }

    private boolean esPropietarioOAdmin(Authentication auth, Long idUsuario) {
        boolean esAdmin = auth.getAuthorities().contains(
                new SimpleGrantedAuthority("ROLE_ADMIN")
        );

        if (esAdmin) return true;

        String emailAutenticado = auth.getName();
        Usuario existente = usuarioService.obtenerUsuario(idUsuario);
        return existente.getCorreo().equals(emailAutenticado);
    }
}
