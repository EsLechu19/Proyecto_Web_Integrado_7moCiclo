package com.tiendaropa.backend.service;

import com.tiendaropa.backend.entity.*;
import com.tiendaropa.backend.exception.*;
import com.tiendaropa.backend.repository.*;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CarritoService {

    private final CarritoRepository carritoRepository;

    private final DetalleCarritoRepository detalleCarritoRepository;

    private final UsuarioRepository usuarioRepository;

    private final ProductoRepository productoRepository;

    public CarritoService(
            CarritoRepository carritoRepository,
            DetalleCarritoRepository detalleCarritoRepository,
            UsuarioRepository usuarioRepository,
            ProductoRepository productoRepository
    ) {
        this.carritoRepository = carritoRepository;
        this.detalleCarritoRepository = detalleCarritoRepository;
        this.usuarioRepository = usuarioRepository;
        this.productoRepository = productoRepository;
    }

    @Transactional
    public DetalleCarrito agregarProducto(
            Long idUsuario,
            Long idProducto,
            Integer cantidad,
            String talla
    ) {
        Usuario usuario =
                usuarioRepository.findById(idUsuario)
                        .orElseThrow(() ->
                                new RecursoNoEncontradoException("Usuario no encontrado")
                        );

        Producto producto =
                productoRepository.findById(idProducto)
                        .orElseThrow(() ->
                                new RecursoNoEncontradoException("Producto no encontrado")
                        );

        if (producto.getTallas() == null || producto.getTallas().isEmpty()) {
            throw new StockInsuficienteException("El producto no tiene tallas configuradas");
        }

        final String tallaFinal;
        if (talla != null && !talla.isEmpty()) {
            tallaFinal = talla;
        } else if (producto.getTallas().size() == 1) {
            tallaFinal = producto.getTallas().get(0).getTalla();
        } else {
            throw new StockInsuficienteException("Debes seleccionar una talla");
        }

        ProductoTalla productoTalla = producto.getTallas().stream()
                .filter(t -> t.getTalla().equals(tallaFinal))
                .findFirst()
                .orElseThrow(() -> new StockInsuficienteException("Talla " + tallaFinal + " no disponible"));

        if (productoTalla.getStock() <= 0) {
            throw new StockInsuficienteException("Stock insuficiente para la talla " + tallaFinal);
        }

        Carrito carrito =
                carritoRepository
                        .findByUsuarioIdUsuario(idUsuario)
                        .orElseGet(() ->
                                carritoRepository.save(
                                        Carrito.builder()
                                                .usuario(usuario)
                                                .fechaCreacion(LocalDateTime.now())
                                                .build()
                                )
                        );

        Optional<DetalleCarrito> existente =
                detalleCarritoRepository
                        .findByCarritoIdCarritoAndProductoIdProductoAndTalla(
                                carrito.getIdCarrito(),
                                idProducto,
                                tallaFinal
                        );

        if(existente.isPresent()) {
            DetalleCarrito detalle = existente.get();
            int nuevaCantidad = detalle.getCantidad() + cantidad;

            if(nuevaCantidad > productoTalla.getStock()) {
                throw new StockInsuficienteException("Stock insuficiente para la talla " + tallaFinal);
            }

            detalle.setCantidad(nuevaCantidad);
            detalle.setSubtotal(
                    producto.getPrecio().multiply(
                            BigDecimal.valueOf(nuevaCantidad)
                    )
            );
            return detalleCarritoRepository.save(detalle);
        }

        BigDecimal subtotal =
                producto.getPrecio().multiply(
                        BigDecimal.valueOf(cantidad)
                );

        DetalleCarrito nuevoDetalle =
                DetalleCarrito.builder()
                        .carrito(carrito)
                        .producto(producto)
                        .cantidad(cantidad)
                        .subtotal(subtotal)
                        .talla(tallaFinal)
                        .build();

        return detalleCarritoRepository.save(nuevoDetalle);
    }

    public List<DetalleCarrito> verCarrito(Long idUsuario) {
        Carrito carrito =
                carritoRepository
                        .findByUsuarioIdUsuario(idUsuario)
                        .orElseThrow(() ->
                                new RecursoNoEncontradoException("El usuario no tiene carrito")
                        );

        return detalleCarritoRepository
                .findByCarritoIdCarrito(carrito.getIdCarrito());
    }

    public DetalleCarrito actualizarCantidad(Long idDetalle, Integer cantidad) {
        DetalleCarrito detalle =
                detalleCarritoRepository
                        .findById(idDetalle)
                        .orElseThrow(() -> new RecursoNoEncontradoException("Detalle de carrito no encontrado"));

        if (cantidad <= 0) {
            throw new IllegalArgumentException("La cantidad debe ser mayor a 0");
        }

        detalle.setCantidad(cantidad);
        detalle.setSubtotal(
                detalle.getProducto()
                        .getPrecio()
                        .multiply(BigDecimal.valueOf(cantidad))
        );

        return detalleCarritoRepository.save(detalle);
    }

    public void eliminarItem(Long idDetalle) {
        detalleCarritoRepository.deleteById(idDetalle);
    }

    @Transactional
    public void vaciarCarrito(Long idUsuario) {
        Carrito carrito = carritoRepository
                .findByUsuarioIdUsuario(idUsuario)
                .orElseThrow(() -> new RuntimeException("El usuario no tiene carrito"));

        List<DetalleCarrito> detalles =
                detalleCarritoRepository.findByCarritoIdCarrito(carrito.getIdCarrito());

        detalleCarritoRepository.deleteAll(detalles);
    }
}
