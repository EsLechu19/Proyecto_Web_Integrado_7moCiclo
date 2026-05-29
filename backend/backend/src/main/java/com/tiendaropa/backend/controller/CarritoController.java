package com.tiendaropa.backend.controller;

import com.tiendaropa.backend.entity.DetalleCarrito;
import com.tiendaropa.backend.entity.Usuario;
import com.tiendaropa.backend.exception.AccesoDenegadoException;
import com.tiendaropa.backend.exception.RecursoNoEncontradoException;
import com.tiendaropa.backend.repository.DetalleCarritoRepository;
import com.tiendaropa.backend.repository.UsuarioRepository;
import com.tiendaropa.backend.service.CarritoService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/carrito")
public class CarritoController {

    private final CarritoService carritoService;
    private final UsuarioRepository usuarioRepository;
    private final DetalleCarritoRepository detalleCarritoRepository;

    public CarritoController(
            CarritoService carritoService,
            UsuarioRepository usuarioRepository,
            DetalleCarritoRepository detalleCarritoRepository) {
        this.carritoService = carritoService;
        this.usuarioRepository = usuarioRepository;
        this.detalleCarritoRepository = detalleCarritoRepository;
    }

    @PostMapping("/agregar")
    public DetalleCarrito agregarProducto(
            @RequestParam Long idUsuario,
            @RequestParam Long idProducto,
            @RequestParam Integer cantidad,
            @RequestParam(required = false) String talla,
            Authentication auth) {

        verificarPropiedad(idUsuario, auth);
        return carritoService.agregarProducto(idUsuario, idProducto, cantidad, talla);
    }

    @GetMapping("/{idUsuario}")
    public List<DetalleCarrito> verCarrito(
            @PathVariable Long idUsuario,
            Authentication auth) {

        verificarPropiedad(idUsuario, auth);
        return carritoService.verCarrito(idUsuario);
    }

    @PutMapping("/actualizar")
    public DetalleCarrito actualizarCantidad(
            @RequestParam Long idDetalle,
            @RequestParam Integer cantidad,
            Authentication auth) {

        verificarPropiedadPorDetalle(idDetalle, auth);
        return carritoService.actualizarCantidad(idDetalle, cantidad);
    }

    @DeleteMapping("/vaciar/{idUsuario}")
    public void vaciarCarrito(
            @PathVariable Long idUsuario,
            Authentication auth) {

        verificarPropiedad(idUsuario, auth);
        carritoService.vaciarCarrito(idUsuario);
    }

    @DeleteMapping("/eliminar/{idDetalle}")
    public void eliminarItem(
            @PathVariable Long idDetalle,
            Authentication auth) {

        verificarPropiedadPorDetalle(idDetalle, auth);
        carritoService.eliminarItem(idDetalle);
    }

    private void verificarPropiedad(Long idUsuario, Authentication auth) {
        String emailAutenticado = auth.getName();
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        if (!usuario.getCorreo().equals(emailAutenticado)) {
            throw new AccesoDenegadoException("No tienes permiso para acceder a este carrito");
        }
    }

    private void verificarPropiedadPorDetalle(Long idDetalle, Authentication auth) {
        DetalleCarrito detalle = detalleCarritoRepository.findById(idDetalle)
                .orElseThrow(() -> new RecursoNoEncontradoException("Detalle no encontrado"));

        Long idUsuario = detalle.getCarrito().getUsuario().getIdUsuario();
        verificarPropiedad(idUsuario, auth);
    }
}
