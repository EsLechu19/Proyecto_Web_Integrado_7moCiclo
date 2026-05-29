package com.tiendaropa.backend.service;

import com.tiendaropa.backend.entity.Categoria;
import com.tiendaropa.backend.entity.Producto;
import com.tiendaropa.backend.entity.ProductoTalla;
import com.tiendaropa.backend.repository.CategoriaRepository;
import com.tiendaropa.backend.repository.DetallePedidoRepository;
import com.tiendaropa.backend.repository.ProductoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;
    private final DetallePedidoRepository detallePedidoRepository;

    public ProductoService(ProductoRepository productoRepository, CategoriaRepository categoriaRepository, DetallePedidoRepository detallePedidoRepository) {
        this.productoRepository = productoRepository;
        this.categoriaRepository = categoriaRepository;
        this.detallePedidoRepository = detallePedidoRepository;
    }

    public Producto crearProducto(Producto producto) {
        Long idCategoria = producto.getCategoria().getIdCategoria();

        Categoria categoria = categoriaRepository.findById(idCategoria)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        producto.setCategoria(categoria);

        if (producto.getTallas() != null) {
            for (ProductoTalla pt : producto.getTallas()) {
                pt.setProducto(producto);
            }
        }

        return productoRepository.save(producto);
    }

    @Transactional(readOnly = true)
    public List<Producto> listarProductos() {
        return productoRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Producto> listarPorCategoria(Long idCategoria) {
        return productoRepository.findByCategoriaIdCategoria(idCategoria);
    }

    @Transactional(readOnly = true)
    public List<Producto> buscarPorNombre(String nombre) {
        return productoRepository.findByNombreContainingIgnoreCase(nombre);
    }

    @Transactional(readOnly = true)
    public List<Producto> filtrarPorColor(String color) {
        return productoRepository.findByColorIgnoreCase(color);
    }

    @Transactional(readOnly = true)
    public List<Producto> listarPorGenero(String genero) {
        return productoRepository.findByGeneroIgnoreCase(genero);
    }

    @Transactional(readOnly = true)
    public List<Producto> listarPorGeneroYCategoria(String genero, Long idCategoria) {
        return productoRepository.findByGeneroIgnoreCaseAndCategoriaIdCategoria(genero, idCategoria);
    }

    @Transactional(readOnly = true)
    public Producto obtenerProductoPorId(Long id) {
        return productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
    }

    @Transactional
    public Producto actualizarProducto(Long id, Producto productoActualizado) {

        Producto producto = obtenerProductoPorId(id);

        producto.setNombre(productoActualizado.getNombre());
        producto.setDescripcion(productoActualizado.getDescripcion());
        producto.setPrecio(productoActualizado.getPrecio());
        producto.setColor(productoActualizado.getColor());
        producto.setGenero(productoActualizado.getGenero());
        producto.setImagenes(productoActualizado.getImagenes());

        Long idCategoria = productoActualizado.getCategoria().getIdCategoria();

        Categoria categoria = categoriaRepository.findById(idCategoria)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        producto.setCategoria(categoria);

        if (productoActualizado.getTallas() != null && !productoActualizado.getTallas().isEmpty()) {
            producto.getTallas().clear();
            for (ProductoTalla pt : productoActualizado.getTallas()) {
                pt.setProducto(producto);
                producto.getTallas().add(pt);
            }
        }

        return productoRepository.save(producto);
    }

    @Transactional
    public void eliminarProducto(Long id) {
        productoRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<Producto> listarTopProductos(int limite) {
        List<Producto> top = detallePedidoRepository.findTopProductos();
        if (top.size() > limite) {
            top = top.subList(0, limite);
        }
        return top;
    }

    @Transactional(readOnly = true)
    public List<Producto> listarUltimosPorGenero(String genero) {
        return productoRepository.findTop4ByGeneroIgnoreCaseOrderByIdProductoDesc(genero);
    }

    @Transactional(readOnly = true)
    public List<Producto> listarUltimosPorCategoria(Long idCategoria) {
        return productoRepository.findTop4ByCategoriaIdCategoriaOrderByIdProductoDesc(idCategoria);
    }

    @Transactional(readOnly = true)
    public List<Producto> filtrar(Optional<String> busqueda, Optional<String> genero, Optional<Long> categoria) {
        List<Producto> productos = productoRepository.findAll();

        if (busqueda.isPresent() && !busqueda.get().isEmpty()) {
            productos = productos.stream()
                    .filter(p -> p.getNombre().toLowerCase().contains(busqueda.get().toLowerCase()))
                    .collect(Collectors.toList());
        }

        if (genero.isPresent() && !genero.get().isEmpty()) {
            productos = productos.stream()
                    .filter(p -> p.getGenero().equalsIgnoreCase(genero.get()))
                    .collect(Collectors.toList());
        }

        if (categoria.isPresent()) {
            productos = productos.stream()
                    .filter(p -> p.getCategoria().getIdCategoria().equals(categoria.get()))
                    .collect(Collectors.toList());
        }

        return productos;
    }
}