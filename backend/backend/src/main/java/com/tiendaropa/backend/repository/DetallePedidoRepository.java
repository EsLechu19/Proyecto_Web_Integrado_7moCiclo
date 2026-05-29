package com.tiendaropa.backend.repository;

import com.tiendaropa.backend.entity.DetallePedido;
import com.tiendaropa.backend.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface DetallePedidoRepository extends JpaRepository<DetallePedido, Long> {
    List<DetallePedido> findByPedidoIdPedido(Long idPedido);

    @Query(value = "SELECT p.* FROM productos p LEFT JOIN (SELECT dp.id_producto, SUM(dp.cantidad) as total FROM detalle_pedido dp GROUP BY dp.id_producto) AS tops ON p.id_producto = tops.id_producto ORDER BY COALESCE(tops.total, 0) DESC", nativeQuery = true)
    List<Producto> findTopProductos();
}