-- =========================================================
-- BASE DE DATOS - Tienda Ropa StyloStore
-- =========================================================

DROP DATABASE IF EXISTS tienda_ropa_db;
CREATE DATABASE tienda_ropa_db;
USE tienda_ropa_db;

-- =========================================================
-- TABLA USUARIOS
-- =========================================================

CREATE TABLE usuarios (
    id_usuario BIGINT AUTO_INCREMENT PRIMARY KEY,
    correo VARCHAR(255) NOT NULL UNIQUE,
    nombre VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol ENUM('ADMIN','CLIENTE') DEFAULT 'CLIENTE'
) ENGINE=InnoDB;

-- =========================================================
-- TABLA CATEGORIAS
-- =========================================================

CREATE TABLE categorias (
    id_categoria BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE,
    descripcion VARCHAR(255)
) ENGINE=InnoDB;

-- =========================================================
-- TABLA PRODUCTOS
-- =========================================================

CREATE TABLE productos (
    id_producto BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion VARCHAR(500),
    precio DECIMAL(10,2) NOT NULL,
    color VARCHAR(255),
    genero ENUM('HOMBRE','MUJER','UNISEX') DEFAULT 'UNISEX',
    imagenes TEXT,
    id_categoria BIGINT NOT NULL,
    CONSTRAINT FK_producto_categoria
        FOREIGN KEY (id_categoria)
        REFERENCES categorias(id_categoria)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_productos_genero ON productos(genero);
CREATE INDEX idx_productos_nombre ON productos(nombre);
CREATE INDEX idx_productos_categoria ON productos(id_categoria);

-- =========================================================
-- TABLA PRODUCTO_TALLAS (tallas individuales por producto)
-- =========================================================

CREATE TABLE producto_tallas (
    id_talla BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_producto BIGINT NOT NULL,
    talla VARCHAR(50) NOT NULL,
    stock INT NOT NULL,
    CONSTRAINT FK_producto_talla
        FOREIGN KEY (id_producto)
        REFERENCES productos(id_producto)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_producto_tallas_producto ON producto_tallas(id_producto);
CREATE UNIQUE INDEX idx_producto_talla_unica ON producto_tallas(id_producto, talla);

-- =========================================================
-- TABLA CARRITOS
-- =========================================================

CREATE TABLE carritos (
    id_carrito BIGINT AUTO_INCREMENT PRIMARY KEY,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    id_usuario BIGINT NOT NULL,
    CONSTRAINT FK_carrito_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE UNIQUE INDEX idx_carrito_usuario ON carritos(id_usuario);

-- =========================================================
-- TABLA DETALLE CARRITO
-- =========================================================

CREATE TABLE detalle_carrito (
    id_detalle_carrito BIGINT AUTO_INCREMENT PRIMARY KEY,
    cantidad INT NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    talla VARCHAR(50),
    id_carrito BIGINT NOT NULL,
    id_producto BIGINT NOT NULL,
    CONSTRAINT FK_detalle_carrito
        FOREIGN KEY (id_carrito)
        REFERENCES carritos(id_carrito)
        ON DELETE CASCADE,
    CONSTRAINT FK_detalle_producto
        FOREIGN KEY (id_producto)
        REFERENCES productos(id_producto)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE UNIQUE INDEX idx_detalle_carrito_producto ON detalle_carrito(id_carrito, id_producto, talla);

-- =========================================================
-- TABLA PEDIDOS
-- =========================================================

CREATE TABLE pedidos (
    id_pedido BIGINT AUTO_INCREMENT PRIMARY KEY,
    fecha_pedido DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado ENUM(
        'PENDIENTE',
        'EN_PROCESO',
        'ENVIADO',
        'ENTREGADO',
        'CANCELADO'
    ) DEFAULT 'PENDIENTE',
    total DECIMAL(10,2) NOT NULL,
    id_usuario BIGINT NOT NULL,
    CONSTRAINT FK_pedido_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_pedidos_usuario ON pedidos(id_usuario);
CREATE INDEX idx_pedidos_estado ON pedidos(estado);

-- =========================================================
-- TABLA DETALLE PEDIDO
-- =========================================================

CREATE TABLE detalle_pedido (
    id_detalle_pedido BIGINT AUTO_INCREMENT PRIMARY KEY,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    talla VARCHAR(50),
    id_pedido BIGINT NOT NULL,
    id_producto BIGINT NOT NULL,
    CONSTRAINT FK_detallepedido_pedido
        FOREIGN KEY (id_pedido)
        REFERENCES pedidos(id_pedido)
        ON DELETE CASCADE,
    CONSTRAINT FK_detallepedido_producto
        FOREIGN KEY (id_producto)
        REFERENCES productos(id_producto)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================================================
-- INSERTAR CATEGORIAS
-- =========================================================

INSERT INTO categorias (nombre, descripcion) VALUES
('Polos',     'Polos casuales y formales'),
('Zapatillas','Zapatillas deportivas y urbanas'),
('Poleras',   'Poleras y hoodies'),
('Gorras',    'Gorras New Era y urbanas'),
('Jeans',     'Jeans y pantalones'),
('Casacas',   'Casacas y chaquetas');

-- =========================================================
-- INSERTAR PRODUCTOS
-- =========================================================

INSERT INTO productos (nombre, descripcion, precio, color, genero, imagenes, id_categoria) VALUES
('Polo Oversize Negro',       'Polo oversize de algodón premium',                  59.90,  'Negro',  'HOMBRE', '["https://www.migamarra.pe/cdn/shop/files/skeep_fotos_tamano_app_2.058_423f0163-212b-4b50-a2fd-01243b6d5b49.jpg?v=1752437987&width=600"]', 1),
('Polera Nike Sportswear',    'Polera deportiva Nike Club Fleece',                 99.90,  'Negro',  'HOMBRE', '["https://d3fvqmu2193zmz.cloudfront.net/items_2/uid_commerces.1/uid_items_2.2025050922092540744/1500x1500/682271AE19C92-Polera-Sportswear-Hombre-Club-Bb.webp"]', 3),
('Zapatillas Urban Sport',    'Zapatillas modernas urbanas cuero sintético',      149.90,  'Blanco', 'UNISEX',  '["https://simple.ripley.com.pe/product/_next/image?url=https%3A%2F%2Frimage.ripley.com.pe%2Fhome.ripley%2FAttachment%2FMKP%2F1344%2FPMP20001278566%2Ffull_image-1.jpeg&w=640&q=100","https://simple.ripley.com.pe/product/_next/image?url=https%3A%2F%2Frimage.ripley.com.pe%2Fhome.ripley%2FAttachment%2FMKP%2F1344%2FPMP20001278566%2Ffull_image-2.jpeg&w=640&q=100","https://simple.ripley.com.pe/product/_next/image?url=https%3A%2F%2Frimage.ripley.com.pe%2Fhome.ripley%2FAttachment%2FMKP%2F1344%2FPMP20001278566%2Ffull_image-3.jpeg&w=640&q=100"]', 2),
('Blusa Satinada Zara Mujer', 'Blusa satinada elegante manga larga',              129.90,  'Blanco', 'MUJER',  '["https://static.zara.net/assets/public/2283/f27e/e36e4802aa25/b8b6a913f9d2/07969952710-p/07969952710-p.jpg?ts=1776935548481&w=750"]', 1),
('Nike Revolution 7 Mujer',   'Zapatillas running Nike mujer suela amortiguada',   259.90,  'Rosa',   'MUJER',  '["https://bboys.pe/cdn/shop/files/FB7689-600_0.jpg?v=1753373363","https://bboys.pe/cdn/shop/files/FB7689-600_1.jpg?v=1753373363","https://bboys.pe/cdn/shop/files/FB7689-600_2.jpg?v=1753373363"]', 2),
('Jean Skinny Levis Mujer',   'Jean skinny tiro alto elástico',                   189.90,  'Azul',   'MUJER',  '["https://levisperu.vtexassets.com/arquivos/ids/553780-800-auto?v=638662847121000000&width=800&height=auto&aspect=true"]', 5),
('Casaca Puma Hombre Ess',    'Casaca deportiva Puma Essential',                  219.90,  'Gris',   'HOMBRE', '["https://oechsle.vteximg.com.br/arquivos/ids/21112539-1000-1000/2885040.jpg?v=638824269939500000"]', 6),
('Adidas Runfalcon 5 Hombre', 'Zapatillas running Adidas con mediasuela Cloudfoam',199.90,  'Negro',  'HOMBRE', '["https://assets.adidas.com/images/w_600,f_auto,q_auto/39016994181c4fc1a492629f9673e74a_faec/Zapatillas_de_Running_Runfalcon_5_Negro_IE8828_db01_standard.jpg","https://assets.adidas.com/images/w_600,f_auto,q_auto/39016994181c4fc1a492629f9673e74a_faec/Zapatillas_de_Running_Runfalcon_5_Negro_IE8828_db02_standard.jpg","https://assets.adidas.com/images/w_600,f_auto,q_auto/39016994181c4fc1a492629f9673e74a_faec/Zapatillas_de_Running_Runfalcon_5_Negro_IE8828_db03_standard.jpg"]', 2),
('Gorra New Era NY Yankees',  'Gorra urbana unisex 9FIFTY snapback',                99.90,  'Negro',  'UNISEX',  '["https://dbz8g93w027an.cloudfront.net/245641-home_default/gorra-new-york-yankees-mlb-9fifty-black.jpg"]', 4),
('Nike Sportswear Club','Polera Nike algodón premium fit urbano',359.00,'Negro','HOMBRE','["https://www.nike.com.pe/on/demandware.static/-/Sites-catalog-equinox/default/dwba18244e/images/hi-res/198486893633_1_20251219-mrtPeru.jpg"]', 3),
('Adidas Essentials Hoodie',
 'Polera con capucha Premium Essentials',
 299.00,
 'Negro',
 'HOMBRE',
 '["https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/f32f2bca3f2c40e9acaaa5ee4847fe12_9366/Polera_con_capucha_Premium_Essentials_Negro_JC9572_21_model.jpg"]',
 3),
('Zara Satin Shirt Woman',
 'Blusa satinada elegante manga larga Zara',
 239,
 'Vino',
 'MUJER',
 '["https://static.zara.net/assets/public/ce26/a484/4c66424f8437/32906c614d8a/08741258681-p/08741258681-p.jpg?ts=1758883980386&w=750"]',
 1),
('Puma Essentials Track Jacket',
 'Casaca deportiva Puma',
 279.90,
 'Gris',
 'HOMBRE',
 '["https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_2000,h_2000/global/586696/01/mod01/fnd/VNM/fmt/png/Essentials-Track-Jacket-Men"]',
 6),
('Levis 501 Original Fit',
 'Jean Levis 501 fit clásico denim premium',
 229.90,
 'Azul',
 'HOMBRE',
 '["https://levisperu.vtexassets.com/arquivos/ids/415963-800-auto?v=638652048165570000&width=800&height=auto&aspect=true"]',
 5),
('New Era MLB Boston Red Sox',
 'Gorra 59Fifty MLB Boston Red Sox State Stitch Navy',
 229.90,
 'Negro',
 'UNISEX',
 '["https://dbz8g93w027an.cloudfront.net/247053-superlarge_default/Gorra-59Fifty-MLB-Boston-Red-Sox-State-Stitch-Navy.jpg"]',
 4),
('Converse Chuck Taylor All Star',
 'Zapatillas Converse clásicas caña alta',
 269.90,
 'Negro',
 'UNISEX',
 '["https://oechsle.vteximg.com.br/arquivos/ids/14038096-1000-1000/166939.jpg?v=638138120470500000","https://oechsle.vteximg.com.br/arquivos/ids/14038096-1000-1000/166939_2.jpg?v=638138120470500000","https://oechsle.vteximg.com.br/arquivos/ids/14038096-1000-1000/166939_3.jpg?v=638138120470500000","https://oechsle.vteximg.com.br/arquivos/ids/14038096-1000-1000/166939_4.jpg?v=638138120470500000"]',
 2),
('Under Armour Rival Fleece Hoodie',
 'Polera Under Armour fleece deportiva',
 239.90,
 'Gris',
 'HOMBRE',
 '["https://xcdn.next.co.uk/common/items/default/default/itemimages/3_4Ratio/product/lge/D61910s.jpg?im=Resize,width=750"]',
 3),
('Nike Air Max Excee Mujer',
 'Zapatillas Nike Air Max diseño moderno',
 399.90,
 'Blanco/Rosado',
 'MUJER',
 '["https://plazavea.vteximg.com.br/arquivos/ids/30371578-1000-1000/imageUrl_1.jpg?v=638715691225700000","https://plazavea.vteximg.com.br/arquivos/ids/30371578-1000-1000/imageUrl_2.jpg?v=638715691225700000","https://plazavea.vteximg.com.br/arquivos/ids/30371578-1000-1000/imageUrl_3.jpg?v=638715691225700000"]',
 2),
('Converse x Hello Kitty And Friends',
 'Converse x Hello Kitty And Friends Chuck Taylor All Star Cinnamoroll',
 379.90,
 'Celeste',
 'Mujer',
 '["https://www.converse.com.pe/media/catalog/product/z/a/zapatilla-mujer-conversexsanriochucktaylorallstar-web20262026-a17698c-0_2_zp9onloyrml8vyuk.jpg?quality=80&bg-color=255,255,255&fit=bounds&height=1000&width=1000&canvas=1000:1000"]',
 2),
('Zara Mom Fit Jeans',
 'Jean mom fit tiro alto estilo urbano',
 159.90,
 'Celeste',
 'MUJER',
 '["https://static.zara.net/assets/public/f502/5bf3/46fa47799f4c/34c40b4a59a9/08727947400-e1/08727947400-e1.jpg?ts=1774967840665&w=750"]',
 5);

-- =========================================================
-- INSERTAR TALLAS POR PRODUCTO
-- =========================================================

INSERT INTO producto_tallas (id_producto, talla, stock) VALUES
-- Polo Oversize Negro (id=1)
(1, 'S',  10),
(1, 'M',  18),
(1, 'L',  15),
(1, 'XL',  8),
-- Polera Nike (id=2)
(2, 'S',   5),
(2, 'M',   8),
(2, 'L',   7),
(2, 'XL',  4),
-- Zapatillas Urban (id=3)
(3, '38',  6),
(3, '40', 10),
(3, '42', 12),
(3, '44',  8),
-- Blusa Satinada (id=4)
(4, 'S',   8),
(4, 'M',  20),
(4, 'L',  12),
-- Nike Revolution 7 (id=5)
(5, '36',  4),
(5, '38', 10),
(5, '40',  8),
-- Jean Skinny Levis (id=6)
(6, '26',  8),
(6, '28', 12),
(6, '30', 15),
(6, '32', 10),
(6, '34',  6),
-- Casaca Puma (id=7)
(7, 'S',   4),
(7, 'M',   7),
(7, 'L',   5),
-- Adidas Runfalcon 5 (id=8)
(8, '38',  5),
(8, '40',  8),
(8, '42', 10),
(8, '44',  6),
-- Gorra New Era (id=9)
(9, 'STD', 14),
-- Nike Sportswear Club
(10,'S',12),
(10,'M',20),
(10,'L',18),
(10,'XL',10),

-- Adidas Essentials Hoodie
(11,'S',8),
(11,'M',14),
(11,'L',12),
(11,'XL',7),

-- Zara Satin Shirt Woman
(12,'XS',5),
(12,'S',10),
(12,'M',14),
(12,'L',9),

-- Puma Essentials Track Jacket
(13,'S',7),
(13,'M',11),
(13,'L',9),
(13,'XL',5),

-- Levis 501 Original Fit
(14,'28',8),
(14,'30',14),
(14,'32',12),
(14,'34',8),
(14,'36',4),

-- New Era MLB Boston Red Sox
(15,'7',4),
(15,'7 1/4',6),
(15,'7 1/2',5),
(15,'7 3/4',3),

-- Converse Chuck Taylor All Star
(16,'38',6),
(16,'39',8),
(16,'40',12),
(16,'41',10),
(16,'42',8),
(16,'43',5),

-- Under Armour Rival Fleece Hoodie
(17,'S',6),
(17,'M',10),
(17,'L',9),
(17,'XL',5),

-- Nike Air Max Excee Mujer
(18,'35',3),
(18,'36',6),
(18,'37',9),
(18,'38',8),
(18,'39',5),

-- Converse x Hello Kitty And Friends
(19,'35',4),
(19,'36',7),
(19,'37',9),
(19,'38',8),
(19,'39',5),

-- Zara Mom Fit Jeans
(20,'24',4),
(20,'26',8),
(20,'28',12),
(20,'30',10),
(20,'32',6);

-- =========================================================
-- INSERTAR USUARIOS
-- password = "password123" (BCrypt)
-- =========================================================

INSERT INTO usuarios (correo, nombre, password, rol) VALUES
('admin@gmail.com',  'Administrador',     '$2a$10$twhW4PDY4wJppQHS03i59eJjZfGTSolBqq3vhrAp6UR3Whhh2Rg0W', 'ADMIN'),
('esau@gmail.com','Esau Lechuga',      '$2a$10$nMJNBvojJz7vWtKmQzb0zuclzIM38NvxjZkARORAaQH4Y3fpKdrk.', 'CLIENTE'),
('josue@gmail.com','Josue Olivera',      '$2a$10$nMJNBvojJz7vWtKmQzb0zuclzIM38NvxjZkARORAaQH4Y3fpKdrk.', 'CLIENTE'),
('xd@gmail.com','Jose Lavado',      '$2a$10$nMJNBvojJz7vWtKmQzb0zuclzIM38NvxjZkARORAaQH4Y3fpKdrk.', 'CLIENTE'),
('luis@gmail.com',   'Luis García Torres','$2a$10$FXGPgfgqIYcJWplZ/njWFOjpqJg9AKhjY25SoyEOohOVTq1T8tdWC', 'CLIENTE'),
('maria@gmail.com',  'María Fernández López','$2a$10$FXGPgfgqIYcJWplZ/njWFOjpqJg9AKhjY25SoyEOohOVTq1T8tdWC', 'CLIENTE');

-- =========================================================
-- CREAR CARRITOS PARA CADA USUARIO
-- =========================================================

INSERT INTO carritos (id_usuario) VALUES
(1),  -- Admin
(2),  -- Cliente Demo
(3),  -- Luis
(4);  -- María

-- =========================================================
-- INSERTAR DETALLE CARRITO (carrito demo con talla)
-- =========================================================

INSERT INTO detalle_carrito (cantidad, subtotal, talla, id_carrito, id_producto) VALUES
(1, 59.90,  'M', 1, 1);  -- Admin tiene 1 polo talla M en su carrito

-- =========================================================
-- INSERTAR PEDIDOS (historial de compras)
-- =========================================================

INSERT INTO pedidos (estado, total, id_usuario) VALUES
('ENTREGADO', 119.80, 2),  -- Cliente Demo
('ENTREGADO', 249.80, 3),  -- Luis
('EN_PROCESO', 89.90, 4),  -- María
('ENTREGADO', 159.90, 4),  -- María
('ENTREGADO', 199.90, 3),  -- Luis (segundo pedido)
('ENTREGADO', 519.80, 2);  -- Cliente Demo (segundo pedido)

-- =========================================================
-- INSERTAR DETALLE PEDIDOS (con talla)
-- =========================================================

INSERT INTO detalle_pedido (cantidad, precio_unitario, subtotal, talla, id_pedido, id_producto) VALUES
-- Pedido 1: Cliente Demo - 2 Polos talla M
(2, 59.90,  119.80, 'M',  1, 1),

-- Pedido 2: Luis - 1 Zapatillas Urban talla 42 + 1 Polera Nike talla L
(1, 149.90, 149.90, '42', 2, 3),
(1, 99.90,   99.90, 'L',  2, 2),

-- Pedido 3: María - 1 Jean Levis talla 30
(1, 89.90,   89.90, '30', 3, 6),

-- Pedido 4: María - 1 Nike Revolution 7 talla 38
(1, 159.90, 159.90, '38', 4, 5),

-- Pedido 5: Luis - 1 Adidas Runfalcon 5 talla 42
(1, 199.90, 199.90, '42', 5, 8),

-- Pedido 6: Cliente Demo - 1 Casaca Puma talla M + 1 Gorra New Era STD + 1 Blusa Satinada talla M
(1, 219.90, 219.90, 'M',  6, 7),
(1, 99.90,   99.90, 'STD',6, 9),
(1, 129.90, 129.90, 'M',  6, 4),
(1, 59.90,   59.90, 'XL', 6, 1),
(1, 99.90,   99.90, 'L',  6, 2);

-- =========================================================
-- CONSULTAS DE VERIFICACION
-- =========================================================
use tienda_ropa_db;
SELECT 'USUARIOS' AS ''; SELECT * FROM usuarios;
SELECT 'CATEGORIAS' AS ''; SELECT * FROM categorias;
SELECT 'PRODUCTOS' AS ''; SELECT * FROM productos;
SELECT 'PRODUCTO_TALLAS' AS ''; SELECT * FROM producto_tallas;
SELECT 'CARRITOS' AS ''; SELECT * FROM carritos;
SELECT 'DETALLE_CARRITO' AS ''; SELECT * FROM detalle_carrito;
SELECT 'PEDIDOS' AS ''; SELECT * FROM pedidos;
SELECT 'DETALLE_PEDIDO' AS ''; SELECT * FROM detalle_pedido;
