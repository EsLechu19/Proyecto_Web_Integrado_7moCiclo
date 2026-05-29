package com.tiendaropa.backend.repository;

import com.tiendaropa.backend.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
    List<Producto> findByCategoriaIdCategoria(Long idCategoria);

    List<Producto> findByNombreContainingIgnoreCase(String nombre);

    List<Producto> findByColorIgnoreCase(String color);

    List<Producto> findByGeneroIgnoreCase(String genero);

    List<Producto> findByGeneroIgnoreCaseAndCategoriaIdCategoria(String genero, Long idCategoria);

    List<Producto> findTop4ByGeneroIgnoreCaseOrderByIdProductoDesc(String genero);

    List<Producto> findTop4ByCategoriaIdCategoriaOrderByIdProductoDesc(Long idCategoria);
}