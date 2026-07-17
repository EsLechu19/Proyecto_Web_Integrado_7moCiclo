package com.tiendaropa.backend.controller;

import com.tiendaropa.backend.entity.DetallePedido;
import com.tiendaropa.backend.entity.EstadoPedido;
import com.tiendaropa.backend.entity.HistorialEstadoPedido;
import com.tiendaropa.backend.entity.Pedido;
import com.tiendaropa.backend.entity.Usuario;
import com.tiendaropa.backend.exception.AccesoDenegadoException;
import com.tiendaropa.backend.exception.RecursoNoEncontradoException;
import com.tiendaropa.backend.repository.UsuarioRepository;
import com.tiendaropa.backend.service.PedidoService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    private final PedidoService pedidoService;
    private final UsuarioRepository usuarioRepository;

    public PedidoController(PedidoService pedidoService, UsuarioRepository usuarioRepository) {
        this.pedidoService = pedidoService;
        this.usuarioRepository = usuarioRepository;
    }

    @PostMapping("/confirmar/{idUsuario}")
    public Pedido confirmarPedido(
            @PathVariable Long idUsuario,
            Authentication auth) {

        verificarPropiedad(idUsuario, auth);
        return pedidoService.confirmarPedido(idUsuario);
    }

    @GetMapping
    public List<Pedido> listarPedidos(Authentication auth) {
        boolean esAdmin = auth.getAuthorities().contains(
                new SimpleGrantedAuthority("ROLE_ADMIN")
        );

        if (esAdmin) {
            return pedidoService.listarPedidos();
        }

        String email = auth.getName();
        Usuario usuario = usuarioRepository.findByCorreo(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return pedidoService.listarPedidosPorUsuario(usuario.getIdUsuario());
    }

    @GetMapping("/usuario/{idUsuario}")
    public List<Pedido> listarPedidosPorUsuario(
            @PathVariable Long idUsuario,
            Authentication auth) {

        verificarPropiedad(idUsuario, auth);
        return pedidoService.listarPedidosPorUsuario(idUsuario);
    }

    @GetMapping("/{idPedido}/detalle")
    public List<DetallePedido> verDetallePedido(
            @PathVariable Long idPedido,
            Authentication auth) {

        Pedido pedido = pedidoService.obtenerPedidoPorId(idPedido);
        Long idUsuario = pedido.getUsuario().getIdUsuario();
        verificarPropiedad(idUsuario, auth);
        return pedidoService.verDetallePedido(idPedido);
    }

    @PutMapping("/{idPedido}/estado")
    public Pedido actualizarEstadoPedido(
            @PathVariable Long idPedido,
            @RequestParam EstadoPedido estado,
            Authentication auth) {

        boolean esAdmin = auth.getAuthorities().contains(
                new SimpleGrantedAuthority("ROLE_ADMIN")
        );

        if (!esAdmin) {
            throw new AccesoDenegadoException("Solo administradores pueden cambiar el estado del pedido");
        }

        String email = auth.getName();
        Usuario usuario = usuarioRepository.findByCorreo(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        return pedidoService.actualizarEstadoPedido(idPedido, estado, usuario);
    }

    @GetMapping("/{idPedido}/historial")
    public List<HistorialEstadoPedido> historialPedido(
            @PathVariable Long idPedido,
            Authentication auth) {

        Pedido pedido = pedidoService.obtenerPedidoPorId(idPedido);
        Long idUsuario = pedido.getUsuario().getIdUsuario();
        verificarPropiedad(idUsuario, auth);
        return pedidoService.obtenerHistorial(idPedido);
    }

    private void verificarPropiedad(Long idUsuario, Authentication auth) {
        boolean esAdmin = auth.getAuthorities().contains(
                new SimpleGrantedAuthority("ROLE_ADMIN")
        );

        if (esAdmin) return;

        String emailAutenticado = auth.getName();
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        if (!usuario.getCorreo().equals(emailAutenticado)) {
            throw new AccesoDenegadoException("No tienes permiso para acceder a estos pedidos");
        }
    }
}
