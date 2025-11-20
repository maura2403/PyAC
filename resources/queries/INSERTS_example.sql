-- -----------------------------
-- Modalidad
-- -----------------------------

DELETE FROM pyac.modalidad;
INSERT INTO pyac.modalidad(modalidad, descuento) VALUES
('Eventual', 1.0),   -- 1 = sin descuento
('Mensual', 0.8),    -- 20% off
('Fijo', 0.9);       -- 10% off

-- -----------------------------
-- Nivel
-- -----------------------------
DELETE FROM pyac.nivel;

INSERT INTO pyac.nivel(nivel, precioDiario) VALUES
('Jardín', 2000.0),
('Primaria', 2500.0),
('Secundaria', 3000.0);

-- -----------------------------
-- Curso
-- -----------------------------
DELETE FROM pyac.curso;

INSERT INTO pyac.curso(curso, nivel) VALUES
('Salita de 1', 'Jardín'),
('Salita de 2', 'Jardín'),
('Salita de 3', 'Jardín'),
('Salita de 4', 'Jardín'),
('Salita de 5', 'Jardín'),

('1ro A', 'Primaria'),
('1ro B', 'Primaria'),
('1ro C', 'Primaria'),
('2do A', 'Primaria'),
('2do B', 'Primaria'),
('2do C', 'Primaria'),
('3ro A', 'Primaria'),
('3ro B', 'Primaria'),
('3ro C', 'Primaria'),

('4to A', 'Secundaria'),
('4to B', 'Secundaria'),
('4to C', 'Secundaria'),
('5to A', 'Secundaria'),
('5to B', 'Secundaria'),
('5to C', 'Secundaria'),
('6to A', 'Secundaria'),
('6to B', 'Secundaria'),
('6to C', 'Secundaria');

-- -----------------------------
-- Alumno
-- -----------------------------

DELETE FROM pyac.alumno;

INSERT INTO pyac.alumno(dni, nombre, apellido, cursoActual, modalidadActual, CUITRespPagos) VALUES
(43573030, 'Alicia', 'González', '6to B', 'Eventual', NULL),
(41234567, 'Juan', 'Fernández', '5to A', 'Mensual', NULL),
(39876543, 'Sofía', 'Pérez', '4to C', 'Eventual', NULL),
(40123456, 'Martín', 'López', '3ro A', 'Mensual', NULL),
(42345678, 'Camila', 'Rodríguez', '2do B', 'Fijo', NULL),
(41237890, 'Tomás', 'Sánchez', '1ro C', 'Mensual', NULL),
(43456789, 'Lucía', 'Ramírez', '5to B', 'Eventual', NULL),
(41567890, 'Emiliano', 'Torres', '6to A', 'Fijo', NULL),
(39812345, 'Valentina', 'Ruiz', '3ro B', 'Mensual', NULL),
(40987654, 'Agustina', 'Moreno', '4to A', 'Eventual', NULL),
(42349876, 'Lucas', 'Flores', '2do A', 'Mensual', NULL),
(41234568, 'Julián', 'Vega', '6to C', 'Fijo', NULL),
(43451234, 'Milagros', 'Castro', '4to C', 'Mensual', NULL),
(40129876, 'Bruno', 'Domínguez', '4to B', 'Eventual', NULL),
(42345679, 'Catalina', 'Molina', '1ro A', 'Fijo', NULL);



-- -----------------------------
-- Asistencia
-- -----------------------------
DELETE FROM pyac.asistencia;

INSERT INTO pyac.asistencia(dni, fecha) VALUES
(43573030, '2025-10-01'),
(41234567, '2025-10-01'),
(39876543, '2025-10-01'),
(40123456, '2025-10-01'),
(42345678, '2025-10-01');



-- -----------------------------
-- Factura
-- -----------------------------
DELETE FROM pyac.factura;

INSERT INTO pyac.factura(
    dni, fechaEmision, esMensual, montoEmitido,
    modalidadAplicable, nivelAplicable, cursoAplicable,
    pagado, fechaPago, montoPagado, descuentoAplicado
)
VALUES
(43573030, '2025-10-01', TRUE, 3000.0, 'Eventual', 'Secundaria', '6to B', TRUE, '2025-10-25', 3000.0, 0.0),
(41234567, '2025-10-01', TRUE, 3000.0, 'Mensual', 'Secundaria', '5to A', FALSE, NULL, NULL, 300.0),
(39876543, '2025-10-01', TRUE, 3000.0, 'Eventual', 'Secundaria', '4to C', TRUE, '2025-10-22', 3000.0, 0.0),
(40123456, '2025-10-01', TRUE, 2500.0, 'Mensual', 'Primaria', '3ro A', TRUE, '2025-10-23', 2500.0, 250.0),
(42345678, '2025-10-01', TRUE, 2500.0, 'Fijo', 'Primaria', '2do B', FALSE, NULL, NULL, 500.0);
