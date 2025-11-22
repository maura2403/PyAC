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
(43573030, 'Alicia', 'González', '6to B', 'Eventual', '20-43573030-1'),
(41234567, 'Juan', 'Fernández', '5to A', 'Mensual', '20-41234567-2'),
(39876543, 'Sofía', 'Pérez', '4to C', 'Eventual', '27-39876543-3'),
(40123456, 'Martín', 'López', '3ro A', 'Mensual', '27-40123456-4'),
(42345678, 'Camila', 'Rodríguez', '2do B', 'Fijo', '20-42345678-5'),
(41237890, 'Tomás', 'Sánchez', '1ro C', 'Mensual', '20-41237890-6'),
(43456789, 'Lucía', 'Ramírez', '5to B', 'Eventual', '27-43456789-7'),
(41567890, 'Emiliano', 'Torres', '6to A', 'Fijo', '20-41567890-8'),
(39812345, 'Valentina', 'Ruiz', '3ro B', 'Mensual', '27-39812345-9'),
(40987654, 'Agustina', 'Moreno', '4to A', 'Eventual', '20-40987654-1'),
(42349876, 'Lucas', 'Flores', '2do A', 'Mensual', '20-42349876-2'),
(41234568, 'Julián', 'Vega', '6to C', 'Fijo', '27-41234568-3'),
(43451234, 'Milagros', 'Castro', '4to C', 'Mensual', '20-43451234-4'),
(40129876, 'Bruno', 'Domínguez', '4to B', 'Eventual', '27-40129876-5'),
(42345679, 'Catalina', 'Molina', '1ro A', 'Fijo', '20-42345679-6');




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
    dni, fechaEmision, esMensual, monto,
    pagado, fechaPago
)
VALUES
(43573030, '2025-10-01', TRUE, 3000.0, TRUE, '2025-10-25'),
(41234567, '2025-10-01', TRUE, 3000.0, FALSE, NULL),
(39876543, '2025-10-01', TRUE, 3000.0, TRUE, '2025-10-22'),
(40123456, '2025-10-01', TRUE, 2500.0, TRUE, '2025-10-23'),
(42345678, '2025-10-01', TRUE, 2500.0, FALSE, NULL);
