package com.tiendaropa.backend.repository;

import com.tiendaropa.backend.entity.ProductoTalla;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductoTallaRepository extends JpaRepository<ProductoTalla, Long> {
    List<ProductoTalla> findByProductoIdProducto(Long idProducto);
    java.util.Optional<ProductoTalla> findByProductoIdProductoAndTalla(Long idProducto, String talla);
}
