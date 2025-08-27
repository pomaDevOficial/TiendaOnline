-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 24-08-2025 a las 20:14:41
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `tiendaonline`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categoria`
--

CREATE TABLE `categoria` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) DEFAULT NULL,
  `idestado` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `comprobante`
--

CREATE TABLE `comprobante` (
  `id` int(11) NOT NULL,
  `idventa` int(11) DEFAULT NULL,
  `igv` decimal(10,2) DEFAULT NULL,
  `descuento` decimal(10,2) DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  `idtipocomprobante` int(11) DEFAULT NULL,
  `numserie` varchar(255) DEFAULT NULL,
  `idestado` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalleventa`
--

CREATE TABLE `detalleventa` (
  `id` int(11) NOT NULL,
  `idpedidodetalle` int(11) DEFAULT NULL,
  `idventa` int(11) DEFAULT NULL,
  `precio_venta_real` decimal(10,2) DEFAULT NULL,
  `subtotal_real` decimal(10,2) DEFAULT NULL,
  `idestado` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estado`
--

CREATE TABLE `estado` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) DEFAULT NULL,
  `estado` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `estado`
--

INSERT INTO `estado` (`id`, `nombre`, `estado`) VALUES
(1, 'General', 0),
(2, 'REGISTRADO', 1),
(3, 'ACTUALIZADO', 1),
(4, 'ELIMINADO', 1),
(5, 'Usuario', 0),
(6, 'ACTIVO', 5),
(7, 'INACTIVO', 5);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `lote`
--

CREATE TABLE `lote` (
  `id` int(11) NOT NULL,
  `idproducto` int(11) DEFAULT NULL,
  `proveedor` varchar(255) DEFAULT NULL,
  `fechaingreso` datetime DEFAULT NULL,
  `idestado` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `lote_talla`
--

CREATE TABLE `lote_talla` (
  `id` int(11) NOT NULL,
  `idlote` int(11) DEFAULT NULL,
  `idtalla` int(11) DEFAULT NULL,
  `esGenero` int(11) DEFAULT NULL,
  `stock` int(11) DEFAULT NULL,
  `preciocosto` decimal(10,2) DEFAULT NULL,
  `precioventa` decimal(10,2) DEFAULT NULL,
  `idestado` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `marca`
--

CREATE TABLE `marca` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) DEFAULT NULL,
  `idestado` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `metodo_pago`
--

CREATE TABLE `metodo_pago` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `idestado` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `movimientolote`
--

CREATE TABLE `movimientolote` (
  `id` int(11) NOT NULL,
  `idlote_talla` int(11) DEFAULT NULL,
  `tipomovimiento` varchar(255) DEFAULT NULL,
  `cantidad` int(11) DEFAULT NULL,
  `fechamovimiento` datetime DEFAULT NULL,
  `idestado` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedido`
--

CREATE TABLE `pedido` (
  `id` int(11) NOT NULL,
  `idpersona` int(11) DEFAULT NULL,
  `idmetodopago` int(11) DEFAULT NULL,
  `fechaoperacion` datetime DEFAULT NULL,
  `idestado` int(11) DEFAULT NULL,
  `totalimporte` decimal(10,2) DEFAULT NULL,
  `adjunto` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedido_detalle`
--

CREATE TABLE `pedido_detalle` (
  `id` int(11) NOT NULL,
  `idpedido` int(11) DEFAULT NULL,
  `idlote_talla` int(11) DEFAULT NULL,
  `cantidad` decimal(10,2) DEFAULT NULL,
  `precio` decimal(10,2) DEFAULT NULL,
  `subtotal` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `persona`
--

CREATE TABLE `persona` (
  `id` int(11) NOT NULL,
  `idtipopersona` int(11) DEFAULT NULL,
  `nombres` varchar(255) DEFAULT NULL,
  `apellidos` varchar(255) DEFAULT NULL,
  `idtipoidentidad` int(11) DEFAULT NULL,
  `nroidentidad` varchar(255) DEFAULT NULL,
  `correo` varchar(255) DEFAULT NULL,
  `telefono` varchar(255) DEFAULT NULL,
  `idestado` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `persona`
--

INSERT INTO `persona` (`id`, `idtipopersona`, `nombres`, `apellidos`, `idtipoidentidad`, `nroidentidad`, `correo`, `telefono`, `idestado`) VALUES
(2, 1, 'Jonatan', 'Nicolao Ruiz', 1, '76538102', 'jonatan@gmail.com', '994837634', 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto`
--

CREATE TABLE `producto` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) DEFAULT NULL,
  `idcategoria` int(11) DEFAULT NULL,
  `idmarca` int(11) DEFAULT NULL,
  `idestado` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol`
--

CREATE TABLE `rol` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) DEFAULT NULL,
  `idestado` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `rol`
--

INSERT INTO `rol` (`id`, `nombre`, `idestado`) VALUES
(1, 'ADMINISTRADOR', 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `talla`
--

CREATE TABLE `talla` (
  `id` int(11) NOT NULL,
  `nombre` varchar(20) DEFAULT NULL,
  `idestado` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tiposerie`
--

CREATE TABLE `tiposerie` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) DEFAULT NULL,
  `idestado` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo_comprobante`
--

CREATE TABLE `tipo_comprobante` (
  `id` int(11) NOT NULL,
  `idtiposerie` int(11) DEFAULT NULL,
  `nombre` varchar(255) DEFAULT NULL,
  `idestado` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id` int(11) NOT NULL,
  `idrol` int(11) DEFAULT NULL,
  `idpersona` int(11) DEFAULT NULL,
  `usuario` varchar(255) DEFAULT NULL,
  `contrasenia` varchar(255) DEFAULT NULL,
  `idestado` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id`, `idrol`, `idpersona`, `usuario`, `contrasenia`, `idestado`) VALUES
(4, 1, 2, 'jonatan', '$2b$10$mkGwobaSv54jfw5on/VUyei6qPUXIPYpdIBZJl.HTxricNuqvYtUS', 6);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `venta`
--

CREATE TABLE `venta` (
  `id` int(11) NOT NULL,
  `fechaventa` datetime DEFAULT NULL,
  `idusuario` int(11) DEFAULT NULL,
  `idpedido` int(11) DEFAULT NULL,
  `idestado` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `categoria`
--
ALTER TABLE `categoria`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_categoria_idestado_estado` (`idestado`);

--
-- Indices de la tabla `comprobante`
--
ALTER TABLE `comprobante`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_comprobante_idestado_estado` (`idestado`),
  ADD KEY `fk_comprobante_idventa_venta` (`idventa`),
  ADD KEY `fk_comprobante_idtipocomprobante_tipocomprobante` (`idtipocomprobante`);

--
-- Indices de la tabla `detalleventa`
--
ALTER TABLE `detalleventa`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_detalleventa_idestado_estado` (`idestado`),
  ADD KEY `fk_detalleventa_idpedidodetalle_pedidodetalle` (`idpedidodetalle`),
  ADD KEY `fk_detalleventa_idventa_venta` (`idventa`);

--
-- Indices de la tabla `estado`
--
ALTER TABLE `estado`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `lote`
--
ALTER TABLE `lote`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_lote_idestado_estado` (`idestado`),
  ADD KEY `fk_lote_idproducto_producto` (`idproducto`);

--
-- Indices de la tabla `lote_talla`
--
ALTER TABLE `lote_talla`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_lote_talla_idestado_estado` (`idestado`),
  ADD KEY `fk_lote_talla_idlote_lote` (`idlote`),
  ADD KEY `fk_lote_talla_idtalla_talla` (`idtalla`);

--
-- Indices de la tabla `marca`
--
ALTER TABLE `marca`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_marca_idestado_estado` (`idestado`);

--
-- Indices de la tabla `metodo_pago`
--
ALTER TABLE `metodo_pago`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_metodopago_idestado_estado` (`idestado`);

--
-- Indices de la tabla `movimientolote`
--
ALTER TABLE `movimientolote`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_movimientolote_idestado_estado` (`idestado`),
  ADD KEY `fk_movimientolote_idlote_talla_lote_talla` (`idlote_talla`);

--
-- Indices de la tabla `pedido`
--
ALTER TABLE `pedido`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_pedido_idestado_estado` (`idestado`),
  ADD KEY `fk_pedido_idpersona_persona` (`idpersona`),
  ADD KEY `fk_pedido_idmetodopago_metodopago` (`idmetodopago`);

--
-- Indices de la tabla `pedido_detalle`
--
ALTER TABLE `pedido_detalle`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_pedido_detalle_idpedido_pedido` (`idpedido`),
  ADD KEY `fk_pedido_detalle_idlote_talla_lote_talla` (`idlote_talla`);

--
-- Indices de la tabla `persona`
--
ALTER TABLE `persona`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_persona_idestado_estado` (`idestado`);

--
-- Indices de la tabla `producto`
--
ALTER TABLE `producto`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_producto_idestado_estado` (`idestado`),
  ADD KEY `fk_producto_idcategoria_categoria` (`idcategoria`),
  ADD KEY `fk_producto_idmarca_marca` (`idmarca`);

--
-- Indices de la tabla `rol`
--
ALTER TABLE `rol`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_rol_idestado_estado` (`idestado`);

--
-- Indices de la tabla `talla`
--
ALTER TABLE `talla`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_talla_idestado_estado` (`idestado`);

--
-- Indices de la tabla `tiposerie`
--
ALTER TABLE `tiposerie`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_tiposerie_idestado_estado` (`idestado`);

--
-- Indices de la tabla `tipo_comprobante`
--
ALTER TABLE `tipo_comprobante`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_tipocomprobante_idestado_estado` (`idestado`),
  ADD KEY `fk_tipocomprobante_idtiposerie_tiposerie` (`idtiposerie`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_usuario_idestado_estado` (`idestado`),
  ADD KEY `fk_usuario_idrol_rol` (`idrol`),
  ADD KEY `fk_usuario_idpersona_persona` (`idpersona`);

--
-- Indices de la tabla `venta`
--
ALTER TABLE `venta`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_venta_idestado_estado` (`idestado`),
  ADD KEY `fk_venta_idusuario_usuario` (`idusuario`),
  ADD KEY `fk_venta_idpedido_pedido` (`idpedido`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `categoria`
--
ALTER TABLE `categoria`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `comprobante`
--
ALTER TABLE `comprobante`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `detalleventa`
--
ALTER TABLE `detalleventa`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `estado`
--
ALTER TABLE `estado`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `lote`
--
ALTER TABLE `lote`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `lote_talla`
--
ALTER TABLE `lote_talla`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `marca`
--
ALTER TABLE `marca`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `metodo_pago`
--
ALTER TABLE `metodo_pago`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `movimientolote`
--
ALTER TABLE `movimientolote`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pedido`
--
ALTER TABLE `pedido`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pedido_detalle`
--
ALTER TABLE `pedido_detalle`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `persona`
--
ALTER TABLE `persona`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `producto`
--
ALTER TABLE `producto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `rol`
--
ALTER TABLE `rol`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `talla`
--
ALTER TABLE `talla`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tiposerie`
--
ALTER TABLE `tiposerie`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tipo_comprobante`
--
ALTER TABLE `tipo_comprobante`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `venta`
--
ALTER TABLE `venta`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `categoria`
--
ALTER TABLE `categoria`
  ADD CONSTRAINT `fk_categoria_idestado_estado` FOREIGN KEY (`idestado`) REFERENCES `estado` (`id`);

--
-- Filtros para la tabla `comprobante`
--
ALTER TABLE `comprobante`
  ADD CONSTRAINT `fk_comprobante_idestado_estado` FOREIGN KEY (`idestado`) REFERENCES `estado` (`id`),
  ADD CONSTRAINT `fk_comprobante_idtipocomprobante_tipocomprobante` FOREIGN KEY (`idtipocomprobante`) REFERENCES `tipo_comprobante` (`id`),
  ADD CONSTRAINT `fk_comprobante_idventa_venta` FOREIGN KEY (`idventa`) REFERENCES `venta` (`id`);

--
-- Filtros para la tabla `detalleventa`
--
ALTER TABLE `detalleventa`
  ADD CONSTRAINT `fk_detalleventa_idestado_estado` FOREIGN KEY (`idestado`) REFERENCES `estado` (`id`),
  ADD CONSTRAINT `fk_detalleventa_idpedidodetalle_pedidodetalle` FOREIGN KEY (`idpedidodetalle`) REFERENCES `pedido_detalle` (`id`),
  ADD CONSTRAINT `fk_detalleventa_idventa_venta` FOREIGN KEY (`idventa`) REFERENCES `venta` (`id`);

--
-- Filtros para la tabla `lote`
--
ALTER TABLE `lote`
  ADD CONSTRAINT `fk_lote_idestado_estado` FOREIGN KEY (`idestado`) REFERENCES `estado` (`id`),
  ADD CONSTRAINT `fk_lote_idproducto_producto` FOREIGN KEY (`idproducto`) REFERENCES `producto` (`id`);

--
-- Filtros para la tabla `lote_talla`
--
ALTER TABLE `lote_talla`
  ADD CONSTRAINT `fk_lote_talla_idestado_estado` FOREIGN KEY (`idestado`) REFERENCES `estado` (`id`),
  ADD CONSTRAINT `fk_lote_talla_idlote_lote` FOREIGN KEY (`idlote`) REFERENCES `lote` (`id`),
  ADD CONSTRAINT `fk_lote_talla_idtalla_talla` FOREIGN KEY (`idtalla`) REFERENCES `talla` (`id`);

--
-- Filtros para la tabla `marca`
--
ALTER TABLE `marca`
  ADD CONSTRAINT `fk_marca_idestado_estado` FOREIGN KEY (`idestado`) REFERENCES `estado` (`id`);

--
-- Filtros para la tabla `metodo_pago`
--
ALTER TABLE `metodo_pago`
  ADD CONSTRAINT `fk_metodopago_idestado_estado` FOREIGN KEY (`idestado`) REFERENCES `estado` (`id`);

--
-- Filtros para la tabla `movimientolote`
--
ALTER TABLE `movimientolote`
  ADD CONSTRAINT `fk_movimientolote_idestado_estado` FOREIGN KEY (`idestado`) REFERENCES `estado` (`id`),
  ADD CONSTRAINT `fk_movimientolote_idlote_talla_lote_talla` FOREIGN KEY (`idlote_talla`) REFERENCES `lote_talla` (`id`);

--
-- Filtros para la tabla `pedido`
--
ALTER TABLE `pedido`
  ADD CONSTRAINT `fk_pedido_idestado_estado` FOREIGN KEY (`idestado`) REFERENCES `estado` (`id`),
  ADD CONSTRAINT `fk_pedido_idmetodopago_metodopago` FOREIGN KEY (`idmetodopago`) REFERENCES `metodo_pago` (`id`),
  ADD CONSTRAINT `fk_pedido_idpersona_persona` FOREIGN KEY (`idpersona`) REFERENCES `persona` (`id`);

--
-- Filtros para la tabla `pedido_detalle`
--
ALTER TABLE `pedido_detalle`
  ADD CONSTRAINT `fk_pedido_detalle_idlote_talla_lote_talla` FOREIGN KEY (`idlote_talla`) REFERENCES `lote_talla` (`id`),
  ADD CONSTRAINT `fk_pedido_detalle_idpedido_pedido` FOREIGN KEY (`idpedido`) REFERENCES `pedido` (`id`);

--
-- Filtros para la tabla `persona`
--
ALTER TABLE `persona`
  ADD CONSTRAINT `fk_persona_idestado_estado` FOREIGN KEY (`idestado`) REFERENCES `estado` (`id`);

--
-- Filtros para la tabla `producto`
--
ALTER TABLE `producto`
  ADD CONSTRAINT `fk_producto_idcategoria_categoria` FOREIGN KEY (`idcategoria`) REFERENCES `categoria` (`id`),
  ADD CONSTRAINT `fk_producto_idestado_estado` FOREIGN KEY (`idestado`) REFERENCES `estado` (`id`),
  ADD CONSTRAINT `fk_producto_idmarca_marca` FOREIGN KEY (`idmarca`) REFERENCES `marca` (`id`);

--
-- Filtros para la tabla `rol`
--
ALTER TABLE `rol`
  ADD CONSTRAINT `fk_rol_idestado_estado` FOREIGN KEY (`idestado`) REFERENCES `estado` (`id`);

--
-- Filtros para la tabla `talla`
--
ALTER TABLE `talla`
  ADD CONSTRAINT `fk_talla_idestado_estado` FOREIGN KEY (`idestado`) REFERENCES `estado` (`id`);

--
-- Filtros para la tabla `tiposerie`
--
ALTER TABLE `tiposerie`
  ADD CONSTRAINT `fk_tiposerie_idestado_estado` FOREIGN KEY (`idestado`) REFERENCES `estado` (`id`);

--
-- Filtros para la tabla `tipo_comprobante`
--
ALTER TABLE `tipo_comprobante`
  ADD CONSTRAINT `fk_tipocomprobante_idestado_estado` FOREIGN KEY (`idestado`) REFERENCES `estado` (`id`),
  ADD CONSTRAINT `fk_tipocomprobante_idtiposerie_tiposerie` FOREIGN KEY (`idtiposerie`) REFERENCES `tiposerie` (`id`);

--
-- Filtros para la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD CONSTRAINT `fk_usuario_idestado_estado` FOREIGN KEY (`idestado`) REFERENCES `estado` (`id`),
  ADD CONSTRAINT `fk_usuario_idpersona_persona` FOREIGN KEY (`idpersona`) REFERENCES `persona` (`id`),
  ADD CONSTRAINT `fk_usuario_idrol_rol` FOREIGN KEY (`idrol`) REFERENCES `rol` (`id`);

--
-- Filtros para la tabla `venta`
--
ALTER TABLE `venta`
  ADD CONSTRAINT `fk_venta_idestado_estado` FOREIGN KEY (`idestado`) REFERENCES `estado` (`id`),
  ADD CONSTRAINT `fk_venta_idpedido_pedido` FOREIGN KEY (`idpedido`) REFERENCES `pedido` (`id`),
  ADD CONSTRAINT `fk_venta_idusuario_usuario` FOREIGN KEY (`idusuario`) REFERENCES `usuario` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
