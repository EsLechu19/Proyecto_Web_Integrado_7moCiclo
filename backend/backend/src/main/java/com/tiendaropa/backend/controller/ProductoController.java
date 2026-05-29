package com.tiendaropa.backend.controller;

import com.tiendaropa.backend.entity.Producto;
import com.tiendaropa.backend.service.ProductoService;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    @PostMapping
    public Producto crearProducto(@Valid @RequestBody Producto producto) {
        return productoService.crearProducto(producto);
    }

    @GetMapping
    public List<Producto> listarProductos() {
        return productoService.listarProductos();
    }

    @GetMapping("/{id}")
    public Producto obtenerProductoPorId(@PathVariable Long id) {
        return productoService.obtenerProductoPorId(id);
    }

    @PutMapping("/{id}")
    public Producto actualizarProducto(
            @PathVariable Long id,
            @Valid @RequestBody Producto producto) {

        return productoService.actualizarProducto(id, producto);
    }

    @DeleteMapping("/{id}")
    public void eliminarProducto(@PathVariable Long id) {
        productoService.eliminarProducto(id);
    }

    @GetMapping("/categoria/{idCategoria}")
    public List<Producto> listarPorCategoria(@PathVariable Long idCategoria) {
        return productoService.listarPorCategoria(idCategoria);
    }

    @GetMapping("/buscar")
    public List<Producto> buscarPorNombre(@RequestParam String nombre) {
        return productoService.buscarPorNombre(nombre);
    }

    @GetMapping("/color")
    public List<Producto> filtrarPorColor(@RequestParam String color) {
        return productoService.filtrarPorColor(color);
    }

    @GetMapping("/genero")
    public List<Producto> listarPorGenero(@RequestParam String genero) {
        return productoService.listarPorGenero(genero);
    }

    @GetMapping("/genero/{genero}/categoria/{idCategoria}")
    public List<Producto> listarPorGeneroYCategoria(
            @PathVariable String genero,
            @PathVariable Long idCategoria) {
        return productoService.listarPorGeneroYCategoria(genero, idCategoria);
    }

    @GetMapping("/top")
    public List<Producto> listarTopProductos(
            @RequestParam(defaultValue = "4") int limite) {
        return productoService.listarTopProductos(limite);
    }

    @GetMapping("/ultimos/genero")
    public List<Producto> listarUltimosPorGenero(@RequestParam String genero) {
        return productoService.listarUltimosPorGenero(genero);
    }

    @GetMapping("/ultimos/categoria/{idCategoria}")
    public List<Producto> listarUltimosPorCategoria(@PathVariable Long idCategoria) {
        return productoService.listarUltimosPorCategoria(idCategoria);
    }

    @GetMapping("/filtrar")
    public List<Producto> filtrar(
            @RequestParam Optional<String> busqueda,
            @RequestParam Optional<String> genero,
            @RequestParam Optional<Long> categoria) {
        return productoService.filtrar(busqueda, genero, categoria);
    }
}