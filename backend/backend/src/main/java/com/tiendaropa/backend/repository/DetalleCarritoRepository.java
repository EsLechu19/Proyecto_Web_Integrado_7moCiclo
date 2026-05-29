package com.tiendaropa.backend.repository;

import com.tiendaropa.backend.entity.DetalleCarrito;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DetalleCarritoRepository extends JpaRepository<DetalleCarrito, Long> {
    List<DetalleCarrito> findByCarritoIdCarrito(Long idCarrito);
    Optional<DetalleCarrito> findByCarritoIdCarritoAndProductoIdProductoAndTalla(
            Long idCarrito,
            Long idProducto,
            String talla
    );
}