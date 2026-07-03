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
-- INSERTAR PRODUCTOS (orden mezclado)
-- =========================================================

INSERT INTO productos (nombre, descripcion, precio, color, genero, imagenes, id_categoria) VALUES
('Polo Oversize Negro', 'Polo oversize de algodón premium', 59.90, 'Negro', 'HOMBRE', '["https://www.migamarra.pe/cdn/shop/files/skeep_fotos_tamano_app_2.058_423f0163-212b-4b50-a2fd-01243b6d5b49.jpg?v=1752437987&width=600"]', 1),

('Nike Revolution 7 Mujer', 'Zapatillas running Nike mujer suela amortiguada', 259.90, 'Rosa', 'MUJER', '["https://bboys.pe/cdn/shop/files/FB7689-600_0.jpg?v=1753373363","https://bboys.pe/cdn/shop/files/FB7689-600_1.jpg?v=1753373363","https://bboys.pe/cdn/shop/files/FB7689-600_2.jpg?v=1753373363"]', 2),

('Casaca Puma Hombre Ess', 'Casaca deportiva Puma Essential', 219.90, 'Gris', 'HOMBRE', '["https://oechsle.vteximg.com.br/arquivos/ids/21112539-1000-1000/2885040.jpg?v=638824269939500000"]', 6),

('Nike Sportswear Essential', 'T-Shirts Manga Corta Urbano Mujer', 79.90, 'Negro', 'MUJER', '["https://www.nike.com.pe/dw/image/v2/BJKZ_PRD/on/demandware.static/-/Sites-catalog-equinox/default/dwde9a1c09/images/hi-res/191888970797_1_20230714120000-mrtPeru.jpeg?sw=800&sh=800","https://www.nike.com.pe/dw/image/v2/BJKZ_PRD/on/demandware.static/-/Sites-catalog-equinox/default/dwe3623a2f/images/hi-res/191888970797_2_20230714120000-mrtPeru.jpeg?sw=800&sh=800"]', 1),

('Adidas Runfalcon 5 Hombre', 'Zapatillas running Adidas con mediasuela Cloudfoam', 199.90, 'Negro', 'HOMBRE', '["https://assets.adidas.com/images/w_600,f_auto,q_auto/39016994181c4fc1a492629f9673e74a_faec/Zapatillas_de_Running_Runfalcon_5_Negro_IE8828_db01_standard.jpg","https://triathlonperu.vtexassets.com/arquivos/ids/395739/IE8828_12.jpg?v=638554470674100000","https://passarelape.vtexassets.com/arquivos/ids/1545997/Zapatillas-Deportivas-Adidas-Hombres-Ie8812-Runfalcon-5-NEGRO-NEGRO-7.5-2.jpg?v=638760910579800000"]', 2),

('Converse x Hello Kitty And Friends', 'Converse x Hello Kitty And Friends Chuck Taylor All Star Cinnamoroll', 379.90, 'Celeste', 'MUJER', '["https://www.converse.com.pe/media/catalog/product/z/a/zapatilla-mujer-conversexsanriochucktaylorallstar-web20262026-a17698c-0_2_zp9onloyrml8vyuk.jpg?quality=80&bg-color=255,255,255&fit=bounds&height=1000&width=1000&canvas=1000:1000","https://f.fcdn.app/imgs/2bfd13/www.inbox.com.pe/inbope/999e/webp/catalogo/COA17698C_2763_3/1000x1000/zapatillas-converse-converse-x-hello-kitty-and-friends-chuck-taylor-all-star-cinnamoroll-unisex-sky-blue.jpg","https://f.fcdn.app/imgs/d714a9/www.inbox.com.pe/inbope/6c09/webp/catalogo/COA17698C_2763_2/1000x1000/zapatillas-converse-converse-x-hello-kitty-and-friends-chuck-taylor-all-star-cinnamoroll-unisex-sky-blue.jpg"]', 2),

('Gorra New Era NY Yankees', 'Gorra urbana unisex 9FIFTY snapback', 99.90, 'Negro', 'UNISEX', '["https://dbz8g93w027an.cloudfront.net/245641-home_default/gorra-new-york-yankees-mlb-9fifty-black.jpg","https://rimage.ripley.com.pe/home.ripley/Attachment/MKP/3733/PMP00003586401/imagen4-2.jpeg"]', 4),

('Nike Sportswear Phoenix Fleece', 'Polera con gorro oversized cropped Henley para mujer', 223.90, 'Azul', 'MUJER', '["https://www.nike.com.pe/on/demandware.static/-/Sites-catalog-equinox/default/dwbbb9fda5/images/hi-res/198488100241_1_20260202-mrtPeru.jpg","https://www.nike.com.pe/on/demandware.static/-/Sites-catalog-equinox/default/dwecc673a4/images/hi-res/198488100241_2_20260202-mrtPeru.jpg"]', 3),

('Levis 501 Original Fit', 'Jean Levis 501 fit clásico denim premium', 229.90, 'Azul', 'HOMBRE', '["https://levisperu.vtexassets.com/arquivos/ids/415963-800-auto?v=638652048165570000&width=800&height=auto&aspect=true"]', 5),

('GORRA NEW ERA PARA MUJER', 'ALGODÓN WMNS LEAGUE ESS NEYYAN', 119.90, 'Lavanda', 'MUJER', '["https://home.ripley.com.pe/Attachment/WOP_5/2015298964895/2015298964895_2.jpg","https://home.ripley.com.pe/Attachment/WOP_5/2015298964895/2015298964895-3.jpg"]', 4),

('Polera Nike Sportswear', 'Polera deportiva Nike Club Fleece', 99.90, 'Negro', 'HOMBRE', '["https://d3fvqmu2193zmz.cloudfront.net/items_2/uid_commerces.1/uid_items_2.2025050922092540744/1500x1500/682271AE19C92-Polera-Sportswear-Hombre-Club-Bb.webp"]', 3),

('Casaca acolchada con capucha', 'Casaca acolchada con capucha Essentials para mujer', 186.90, 'Negro', 'MUJER', '["https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_750,h_750/global/685231/01/mod01/fnd/EEA/fmt/png/Chaqueta-acolchada-con-capucha-Essentials-para-mujer","https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_750,h_750/global/685231/01/mod02/fnd/EEA/fmt/png/Chaqueta-acolchada-con-capucha-Essentials-para-mujer"]', 6),

('Zapatillas Urban Sport', 'Zapatillas modernas urbanas cuero sintético', 149.90, 'Blanco', 'UNISEX', '["https://simple.ripley.com.pe/product/_next/image?url=https%3A%2F%2Frimage.ripley.com.pe%2Fhome.ripley%2FAttachment%2FMKP%2F1344%2FPMP20001278566%2Ffull_image-1.jpeg&w=640&q=100","https://d3fvqmu2193zmz.cloudfront.net/items_2/uid_commerces.1/uid_items_2.2025050714585430313/1500x1500/681BBD7C46B9B-Zapatillas-Urbanas-Hombre-Court-Classic-Clean.webp","https://d3fvqmu2193zmz.cloudfront.net/items_2/uid_commerces.1/uid_items_2.2025050714585430052/1500x1500/681BB1971ECF2-Zapatillas-Urbanas-Mujer-Court-Lally.webp"]', 2),

('Polo deportivo Mujer PUMA', 'Polo deportivo Mujer PUMA ESS No. 1 Logo Tee', 59.90, 'Negro', 'MUJER', '["https://media.falabella.com/falabellaPE/20782856_1/w=1200,h=1200,fit=pad","https://media.falabella.com/falabellaPE/20782856_2/w=1200,h=1200,fit=pad"]', 1),

('Nike Sportswear Club', 'Polera Nike algodón premium fit urbano', 359.00, 'Negro', 'HOMBRE', '["https://www.nike.com.pe/on/demandware.static/-/Sites-catalog-equinox/default/dwba18244e/images/hi-res/198486893633_1_20251219-mrtPeru.jpg","https://www.nike.com.pe/dw/image/v2/BJKZ_PRD/on/demandware.static/-/Sites-catalog-equinox/default/dwe598439b/images/hi-res/198486893633_4_20251219-mrtPeru.jpg?sw=800&sh=800","https://www.nike.com.pe/dw/image/v2/BJKZ_PRD/on/demandware.static/-/Sites-catalog-equinox/default/dw58d1c72d/images/hi-res/198486893633_5_20251219-mrtPeru.jpg?sw=800&sh=800"]', 3),

('Zara Mom Fit Jeans', 'Jean mom fit tiro alto estilo urbano', 159.90, 'Celeste', 'MUJER', '["https://static.zara.net/assets/public/f502/5bf3/46fa47799f4c/34c40b4a59a9/08727947400-e1/08727947400-e1.jpg?ts=1774967840665&w=750"]', 5),

('Adidas Essentials Hoodie', 'Polera con capucha Premium Essentials', 299.00, 'Negro', 'HOMBRE', '["https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/f32f2bca3f2c40e9acaaa5ee4847fe12_9366/Polera_con_capucha_Premium_Essentials_Negro_JC9572_21_model.jpg"]', 3),

('POLERA MUJER PUMA', 'PUMA BETTER ESSENTIALS HOODIE FL ALGODÓN NEGRO', 199.90, 'Negro', 'MUJER', '["https://home.ripley.com.pe/Attachment/WOP_5/2020341903356/2020341903356_2.jpg","https://home.ripley.com.pe/Attachment/WOP_5/2020341903356/2020341903356-1.jpg"]', 3),

('New Era MLB Boston Red Sox', 'Gorra 59Fifty MLB Boston Red Sox State Stitch Navy', 229.90, 'Negro', 'UNISEX', '["https://dbz8g93w027an.cloudfront.net/247053-superlarge_default/Gorra-59Fifty-MLB-Boston-Red-Sox-State-Stitch-Navy.jpg","https://dbz8g93w027an.cloudfront.net/247061-superlarge_default/Gorra-59Fifty-MLB-Boston-Red-Sox-State-Stitch-Navy.jpg"]', 4),

('Nike Windrunner', 'Casaca de tejido Woven holgada de cierre completo con protección UV para mujer', 379.90, 'Azul Marino Militar/Blanco', 'MUJER', '["https://www.nike.com.pe/on/demandware.static/-/Sites-catalog-equinox/default/dw40805bdd/images/hi-res/197596543124_1_20240819-mrtPeru.jpg","https://www.nike.com.pe/on/demandware.static/-/Sites-catalog-equinox/default/dw6b780029/images/hi-res/197596543124_5_20240819-mrtPeru.jpg"]', 6),

('Zara Satin Shirt Woman', 'Blusa satinada elegante manga larga Zara', 239.00, 'Vino', 'MUJER', '["https://static.zara.net/assets/public/ce26/a484/4c66424f8437/32906c614d8a/08741258681-p/08741258681-p.jpg?ts=1758883980386&w=750"]', 1),

('Puma Essentials Track Jacket', 'Casaca deportiva Puma', 279.90, 'Gris', 'HOMBRE', '["https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_2000,h_2000/global/586696/01/mod01/fnd/VNM/fmt/png/Essentials-Track-Jacket-Men"]', 6),

('Converse Chuck Taylor All Star', 'Zapatillas Converse clásicas caña alta', 269.90, 'Negro', 'UNISEX', '["https://oechsle.vteximg.com.br/arquivos/ids/14038096-1000-1000/166939.jpg?v=638138120470500000","https://oechsle.vteximg.com.br/arquivos/ids/14038098-1000-1000/166939_2.jpg?v=638138120395600000","https://oechsle.vteximg.com.br/arquivos/ids/14038097-1000-1000/166939_1.jpg?v=638138120468000000"]', 2),

('Jean Skinny Levis Mujer', 'Jean skinny tiro alto elástico', 189.90, 'Azul', 'MUJER', '["https://levisperu.vtexassets.com/arquivos/ids/553780-800-auto?v=638662847121000000&width=800&height=auto&aspect=true"]', 5),

('Under Armour Rival Fleece Hoodie', 'Polera Under Armour fleece deportiva', 239.90, 'Gris', 'HOMBRE', '["https://xcdn.next.co.uk/common/items/default/default/itemimages/3_4Ratio/product/lge/D61910s.jpg?im=Resize,width=750"]', 3),

('Nike Air Max Excee Mujer', 'Zapatillas Nike Air Max diseño moderno', 399.90, 'Blanco/Rosado', 'MUJER', '["https://plazavea.vteximg.com.br/arquivos/ids/30371578-1000-1000/imageUrl_1.jpg?v=638715691225700000","https://thn.pe/cdn/shop/files/CD5432-131_2.jpg?v=1732569096&width=713","https://thn.pe/cdn/shop/files/CD5432-131_3.jpg?v=1732569096&width=713"]', 2),

('Gorra Los Angeles Lakers', 'Gorra Los Angeles Lakers NBA 59Fifty Black', 199.90, 'Negro', 'HOMBRE', '["https://dbz8g93w027an.cloudfront.net/244588-superlarge_default/Gorra-Los-Angeles-Lakers-NBA-59Fifty-Black.jpg","https://dbz8g93w027an.cloudfront.net/244592-superlarge_default/Gorra-Los-Angeles-Lakers-NBA-59Fifty-Black.jpg"]', 4),

('Blusa Satinada Zara Mujer', 'Blusa satinada elegante manga larga', 129.90, 'Blanco', 'MUJER', '["https://static.zara.net/assets/public/2283/f27e/e36e4802aa25/b8b6a913f9d2/07969952710-p/07969952710-p.jpg?ts=1776935548481&w=750"]', 1),

('Gorra Chicago Bulls', 'Gorra Chicago Bulls NBA 9Fifty Black', 179.90, 'Negro', 'HOMBRE', '["https://dbz8g93w027an.cloudfront.net/252515-superlarge_default/Gorra-Chicago-Bulls-NBA-9Fifty-Black.jpg","https://dbz8g93w027an.cloudfront.net/252548-large_default_2x/Gorra-Chicago-Bulls-NBA-9Fifty-Black.jpg"]', 4),

('Polera con capucha ADIDAS', 'Polera con capucha Originals de básquet Unisex', 223.90, 'Negro', 'UNISEX', '["https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/16efeb32ed9e44dfb4393e4028887369_9366/Polera_con_capucha_Originals_de_basquet_Negro_JW8578_21_model.jpg","https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/22d170769b0b477fa49ad05b667f6ad9_9366/Polera_con_capucha_Originals_de_basquet_Negro_JW8578_23_hover_model.jpg"]', 3),

('Casaca Chaleco Active Quilt', 'Casaca pensada para moverte con libertad y marcar tu propio ritmo. Funcional, cómoda y con actitud, ideal para elevar cualquier outfit', 207.90, 'Negro', 'HOMBRE', '["https://www.converse.com.pe/media/catalog/product/c/a/casaca-hombre-converse-chalecoactivequilthombre-web-cnvsu26mjack1-001_1_omulvujmx0pieugi.jpg?quality=80&bg-color=255,255,255&fit=bounds&height=1000&width=1000&canvas=1000:1000","https://www.converse.com.pe/media/catalog/product/c/a/casaca-hombre-converse-chalecoactivequilthombre-web-cnvsu26mjack1-001_2_cxow4er70uj0k6vp.jpg"]', 6),

('CASACA DEPORTIVA ', 'CASACA DEPORTIVA HOMBRE ADIDAS GH4602 GRIS', 129.90, 'Gris', 'HOMBRE', '["https://rimage.ripley.com.pe/home.ripley/Attachment/WOP/1/2020251275888/full_image-2020251275888.jpg","https://rimage.ripley.com.pe/home.ripley/Attachment/WOP/1/2020251275888/image2-2020251275888.jpg"]', 6);
-- =========================================================
-- INSERTAR TALLAS POR PRODUCTO (IDs actualizados)
-- =========================================================

INSERT INTO producto_tallas (id_producto, talla, stock) VALUES
(1, 'S',  10),
(1, 'M',  18),
(1, 'L',  15),
(1, 'XL',  8),

(2, '36',  4),
(2, '38', 10),
(2, '40',  8),

(3, 'S',   4),
(3, 'M',   7),
(3, 'L',   5),

(4, 'S',  15),
(4, 'M',  25),
(4, 'L',  20),
(4, 'XL', 10),

(5, '38',  5),
(5, '40',  8),
(5, '42', 10),
(5, '44',  6),

(6, '35',  4),
(6, '36',  7),
(6, '37',  9),
(6, '38',  8),
(6, '39',  5),

(7, 'STD', 14),

(8, 'S',   8),
(8, 'M',  12),
(8, 'L',  10),
(8, 'XL',  5),

(9, '28',  8),
(9, '30', 14),
(9, '32', 12),
(9, '34',  8),
(9, '36',  4),

(10, 'STD', 10),

(11, 'S',   5),
(11, 'M',   8),
(11, 'L',   7),
(11, 'XL',  4),

(12, 'S',   7),
(12, 'M',  12),
(12, 'L',   9),
(12, 'XL',  5),

(13, '38',  6),
(13, '40', 10),
(13, '42', 12),
(13, '44',  8),

(14, 'S',  12),
(14, 'M',  20),
(14, 'L',  15),
(14, 'XL',  8),

(15, 'S',  12),
(15, 'M',  20),
(15, 'L',  18),
(15, 'XL', 10),

(16, '24',  4),
(16, '26',  8),
(16, '28', 12),
(16, '30', 10),
(16, '32',  6),

(17, 'S',   8),
(17, 'M',  14),
(17, 'L',  12),
(17, 'XL',  7),

(18, 'S',  10),
(18, 'M',  15),
(18, 'L',  12),
(18, 'XL',  6),

(19, '7',     4),
(19, '7 1/4', 6),
(19, '7 1/2', 5),
(19, '7 3/4', 3),

(20, 'S',   6),
(20, 'M',  10),
(20, 'L',   8),
(20, 'XL',  4),

(21, 'XS',  5),
(21, 'S',  10),
(21, 'M',  14),
(21, 'L',   9),

(22, 'S',   7),
(22, 'M',  11),
(22, 'L',   9),
(22, 'XL',  5),

(23, '38',  6),
(23, '39',  8),
(23, '40', 12),
(23, '41', 10),
(23, '42',  8),
(23, '43',  5),

(24, '26',  8),
(24, '28', 12),
(24, '30', 15),
(24, '32', 10),
(24, '34',  6),

(25, 'S',   6),
(25, 'M',  10),
(25, 'L',   9),
(25, 'XL',  5),

(26, '35',  3),
(26, '36',  6),
(26, '37',  9),
(26, '38',  8),
(26, '39',  5),

(27, '7',     5),
(27, '7 1/4', 8),
(27, '7 1/2', 6),
(27, '7 3/4', 3),

(28, 'S',   8),
(28, 'M',  20),
(28, 'L',  12),

(29, 'STD', 12),

(30, 'S',  12),
(30, 'M',  18),
(30, 'L',  14),
(30, 'XL',  8),

(31, 'S',   4),
(31, 'M',   2),
(31, 'L',   9),

(32, 'S',   6),
(32, 'M',   10),
(32, 'L',   5);

-- =========================================================
-- INSERTAR USUARIOS
-- password = "password123" (BCrypt)
-- =========================================================

INSERT INTO usuarios (correo, nombre, password, rol) VALUES
('admin@gmail.com',  'Administrador',     '$2a$10$twhW4PDY4wJppQHS03i59eJjZfGTSolBqq3vhrAp6UR3Whhh2Rg0W', 'ADMIN'),
('esau@gmail.com',   'Esau Lechuga',      '$2a$10$nMJNBvojJz7vWtKmQzb0zuclzIM38NvxjZkARORAaQH4Y3fpKdrk.', 'CLIENTE'),
('josue@gmail.com',  'Josue Olivera',     '$2a$10$nMJNBvojJz7vWtKmQzb0zuclzIM38NvxjZkARORAaQH4Y3fpKdrk.', 'CLIENTE'),
('xd@gmail.com',     'Jose Lavado',       '$2a$10$nMJNBvojJz7vWtKmQzb0zuclzIM38NvxjZkARORAaQH4Y3fpKdrk.', 'CLIENTE'),
('luis@gmail.com',   'Luis García Torres','$2a$10$FXGPgfgqIYcJWplZ/njWFOjpqJg9AKhjY25SoyEOohOVTq1T8tdWC', 'CLIENTE'),
('maria@gmail.com',  'María Fernández López','$2a$10$FXGPgfgqIYcJWplZ/njWFOjpqJg9AKhjY25SoyEOohOVTq1T8tdWC', 'CLIENTE');

-- =========================================================
-- CREAR CARRITOS PARA CADA USUARIO
-- =========================================================

INSERT INTO carritos (id_usuario) VALUES
(1), (2), (3), (4), (5), (6);

-- =========================================================
-- INSERTAR DETALLE CARRITO (Admin: 1 Polo Oversize id=1 talla M)
-- =========================================================

INSERT INTO detalle_carrito (cantidad, subtotal, talla, id_carrito, id_producto) VALUES
(1, 59.90, 'M', 1, 1);

-- =========================================================
-- INSERTAR PEDIDOS (historial de compras)
-- =========================================================

INSERT INTO pedidos (estado, total, id_usuario) VALUES
('ENTREGADO', 119.80, 2),
('ENTREGADO', 249.80, 5),
('EN_PROCESO', 189.90, 6),
('ENTREGADO', 259.90, 6),
('ENTREGADO', 199.90, 5),
('ENTREGADO', 519.80, 2);

-- =========================================================
-- INSERTAR DETALLE PEDIDOS (IDs de productos actualizados)
-- =========================================================

INSERT INTO detalle_pedido (cantidad, precio_unitario, subtotal, talla, id_pedido, id_producto) VALUES
(2, 59.90,  119.80, 'M',   1, 1),
(1, 149.90, 149.90, '42',  2, 13),
(1, 99.90,   99.90, 'L',   2, 11),
(1, 189.90, 189.90, 'M',   3, 3),
(1, 259.90, 259.90, '38',  4, 2),
(1, 199.90, 199.90, '42',  5, 5),
(1, 219.90, 219.90, 'M',   6, 3),
(1, 99.90,   99.90, 'STD', 6, 7),
(1, 129.90, 129.90, 'M',   6, 28),
(1, 59.90,   59.90, 'XL',  6, 1),
(1, 99.90,   99.90, 'L',   6, 11);

-- =========================================================
-- CONSULTAS DE VERIFICACION
-- =========================================================
USE tienda_ropa_db;
SELECT 'USUARIOS' AS ''; SELECT * FROM usuarios;
SELECT 'CATEGORIAS' AS ''; SELECT * FROM categorias;
SELECT 'PRODUCTOS' AS ''; SELECT * FROM productos;
SELECT 'PRODUCTO_TALLAS' AS ''; SELECT * FROM producto_tallas;
SELECT 'CARRITOS' AS ''; SELECT * FROM carritos;
SELECT 'DETALLE_CARRITO' AS ''; SELECT * FROM detalle_carrito;
SELECT 'PEDIDOS' AS ''; SELECT * FROM pedidos;
SELECT 'DETALLE_PEDIDO' AS ''; SELECT * FROM detalle_pedido;
SELECT id_categoria, nombre FROM categorias;
