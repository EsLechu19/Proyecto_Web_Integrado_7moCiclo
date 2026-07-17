package com.tiendaropa.backend.service;

import com.tiendaropa.backend.entity.*;
import com.tiendaropa.backend.exception.*;
import com.tiendaropa.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final DetallePedidoRepository detallePedidoRepository;
    private final CarritoRepository carritoRepository;
    private final DetalleCarritoRepository detalleCarritoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProductoRepository productoRepository;
    private final ProductoTallaRepository productoTallaRepository;
    private final HistorialEstadoPedidoRepository historialEstadoPedidoRepository;

    public PedidoService(
            PedidoRepository pedidoRepository,
            DetallePedidoRepository detallePedidoRepository,
            CarritoRepository carritoRepository,
            DetalleCarritoRepository detalleCarritoRepository,
            UsuarioRepository usuarioRepository,
            ProductoRepository productoRepository,
            ProductoTallaRepository productoTallaRepository,
            HistorialEstadoPedidoRepository historialEstadoPedidoRepository) {
        this.pedidoRepository = pedidoRepository;
        this.detallePedidoRepository = detallePedidoRepository;
        this.carritoRepository = carritoRepository;
        this.detalleCarritoRepository = detalleCarritoRepository;
        this.usuarioRepository = usuarioRepository;
        this.productoRepository = productoRepository;
        this.productoTallaRepository = productoTallaRepository;
        this.historialEstadoPedidoRepository = historialEstadoPedidoRepository;
    }

    @Transactional
    public Pedido confirmarPedido(Long idUsuario) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        Carrito carrito = carritoRepository.findByUsuarioIdUsuario(idUsuario)
                .orElseThrow(() -> new RecursoNoEncontradoException("El usuario no tiene carrito"));

        List<DetalleCarrito> detallesCarrito =
                detalleCarritoRepository.findByCarritoIdCarrito(carrito.getIdCarrito());

        if (detallesCarrito.isEmpty()) {
            throw new IllegalArgumentException("El carrito está vacío");
        }

        BigDecimal total = detallesCarrito.stream()
                .map(DetalleCarrito::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Pedido pedido = Pedido.builder()
                .usuario(usuario)
                .fechaPedido(LocalDateTime.now())
                .estado(EstadoPedido.PENDIENTE)
                .total(total)
                .build();

        Pedido pedidoGuardado = pedidoRepository.save(pedido);

        for (DetalleCarrito item : detallesCarrito) {
            Producto producto = item.getProducto();
            String tallaItem = item.getTalla();

            if (tallaItem == null || tallaItem.isEmpty() || producto.getTallas() == null || producto.getTallas().isEmpty()) {
                throw new StockInsuficienteException("El producto " + producto.getNombre() + " no tiene talla asignada");
            }

            ProductoTalla pt = productoTallaRepository
                    .findByProductoIdProductoAndTalla(producto.getIdProducto(), tallaItem)
                    .orElseThrow(() -> new StockInsuficienteException("Talla " + tallaItem + " no disponible para " + producto.getNombre()));

            if (item.getCantidad() > pt.getStock()) {
                throw new StockInsuficienteException("Stock insuficiente para " + producto.getNombre() + " talla " + tallaItem);
            }

            pt.setStock(pt.getStock() - item.getCantidad());
            productoTallaRepository.save(pt);

            DetallePedido detallePedido = DetallePedido.builder()
                    .pedido(pedidoGuardado)
                    .producto(producto)
                    .cantidad(item.getCantidad())
                    .precioUnitario(producto.getPrecio())
                    .subtotal(item.getSubtotal())
                    .talla(tallaItem)
                    .build();

            detallePedidoRepository.save(detallePedido);
        }

        detalleCarritoRepository.deleteAll(detallesCarrito);

        return pedidoGuardado;
    }

    public List<Pedido> listarPedidos() {
        return pedidoRepository.findAll();
    }

    public List<Pedido> listarPedidosPorUsuario(Long idUsuario) {
        return pedidoRepository.findByUsuarioIdUsuario(idUsuario);
    }

    public Pedido obtenerPedidoPorId(Long idPedido) {
        return pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new RecursoNoEncontradoException("Pedido no encontrado"));
    }

    public List<DetallePedido> verDetallePedido(Long idPedido) {
        return detallePedidoRepository.findByPedidoIdPedido(idPedido);
    }

    @Transactional
    public Pedido actualizarEstadoPedido(Long idPedido, EstadoPedido nuevoEstado, Usuario usuario) {
        Pedido pedido = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new RecursoNoEncontradoException("Pedido no encontrado"));

        EstadoPedido estadoAnterior = pedido.getEstado();

        HistorialEstadoPedido historial = HistorialEstadoPedido.builder()
                .pedido(pedido)
                .estadoAnterior(estadoAnterior)
                .estadoNuevo(nuevoEstado)
                .fechaCambio(LocalDateTime.now())
                .usuario(usuario)
                .build();
        historialEstadoPedidoRepository.save(historial);

        pedido.setEstado(nuevoEstado);

        if (nuevoEstado == EstadoPedido.CANCELADO && estadoAnterior != EstadoPedido.CANCELADO) {
            List<DetallePedido> detalles = detallePedidoRepository.findByPedidoIdPedido(idPedido);
            for (DetallePedido detalle : detalles) {
                Producto producto = detalle.getProducto();
                String tallaItem = detalle.getTalla();

                if (tallaItem != null && !tallaItem.isEmpty() && producto.getTallas() != null && !producto.getTallas().isEmpty()) {
                    ProductoTalla pt = productoTallaRepository
                            .findByProductoIdProductoAndTalla(producto.getIdProducto(), tallaItem)
                            .orElse(null);
                    if (pt != null) {
                        pt.setStock(pt.getStock() + detalle.getCantidad());
                        productoTallaRepository.save(pt);
                    }
                }
            }
        }

        return pedidoRepository.save(pedido);
    }

    public List<HistorialEstadoPedido> obtenerHistorial(Long idPedido) {
        return historialEstadoPedidoRepository.findByPedidoIdPedidoOrderByFechaCambioDesc(idPedido);
    }
}
