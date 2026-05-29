package com.tiendaropa.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "productos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idProducto;

    @NotBlank(message = "El nombre del producto es obligatorio")
    @Column(nullable = false)
    private String nombre;

    @Size(max = 500, message = "La descripción no puede superar los 500 caracteres")
    @Column(length = 500)
    private String descripcion;

    @NotNull(message = "El precio es obligatorio")
    @DecimalMin(value = "0.01", message = "El precio debe ser mayor a 0")
    @Column(nullable = false)
    private BigDecimal precio;

    @ManyToOne
    @JoinColumn(name = "id_categoria")
    private Categoria categoria;

    @NotBlank(message = "El color es obligatorio")
    private String color;

    @NotBlank(message = "El género es obligatorio")
    @Column(nullable = false)
    private String genero;

    @Column(columnDefinition = "TEXT")
    private String imagenes;

    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ProductoTalla> tallas;

    @Transient
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    public String getImagenUrl() {
        if (this.imagenes == null || this.imagenes.isEmpty()) return null;
        try {
            String trimmed = this.imagenes.trim();
            if (trimmed.startsWith("[\"")) {
                int start = trimmed.indexOf("\"") + 1;
                int end = trimmed.indexOf("\"", start);
                if (start > 0 && end > start) {
                    return trimmed.substring(start, end);
                }
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }
}
