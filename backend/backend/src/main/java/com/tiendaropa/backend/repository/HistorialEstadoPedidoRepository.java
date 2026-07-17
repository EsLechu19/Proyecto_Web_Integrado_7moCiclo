package com.tiendaropa.backend.repository;

import com.tiendaropa.backend.entity.HistorialEstadoPedido;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface HistorialEstadoPedidoRepository extends JpaRepository<HistorialEstadoPedido, Long> {
    List<HistorialEstadoPedido> findByPedidoIdPedidoOrderByFechaCambioDesc(Long idPedido);
}
