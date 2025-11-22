-- -----------------------------
-- Modalidad
-- -----------------------------
DELETE FROM pyac.modalidad;
INSERT INTO pyac.modalidad(modalidad, descuento, activo) VALUES
('Eventual', 1.0, TRUE),   -- 1 = sin descuento
('Mensual', 0.8, TRUE),    -- 20% off
('Fijo', 0.9, TRUE);       -- 10% off

-- -----------------------------
-- Nivel
-- -----------------------------
DELETE FROM pyac.nivel;
INSERT INTO pyac.nivel(nivel, precioDiario, activo) VALUES
('Jardín', 2000.0, TRUE),
('Primaria', 2500.0, TRUE),
('Secundaria', 3000.0, TRUE);

-- -----------------------------
-- Curso
-- -----------------------------
DELETE FROM pyac.curso;
INSERT INTO pyac.curso(curso, nivel, activo) VALUES
('Salita de 1', 'Jardín', TRUE),
('Salita de 2', 'Jardín', TRUE),
('Salita de 3', 'Jardín', TRUE),
('Salita de 4', 'Jardín', TRUE),
('Salita de 5', 'Jardín', TRUE),
('1ro A', 'Primaria', TRUE),
('1ro B', 'Primaria', TRUE),
('1ro C', 'Primaria', TRUE),
('2do A', 'Primaria', TRUE),
('2do B', 'Primaria', TRUE),
('2do C', 'Primaria', TRUE),
('3ro A', 'Primaria', TRUE),
('3ro B', 'Primaria', TRUE),
('3ro C', 'Primaria', TRUE),
('4to A', 'Secundaria', TRUE),
('4to B', 'Secundaria', TRUE),
('4to C', 'Secundaria', TRUE),
('5to A', 'Secundaria', TRUE),
('5to B', 'Secundaria', TRUE),
('5to C', 'Secundaria', TRUE),
('6to A', 'Secundaria', TRUE),
('6to B', 'Secundaria', TRUE),
('6to C', 'Secundaria', TRUE);

-- -----------------------------
-- Alumno
-- -----------------------------
DELETE FROM pyac.alumno;
INSERT INTO pyac.alumno(dni, nombre, apellido, cursoActual, modalidadActual, CUITRespPagos, activo) VALUES
(43573030, 'Alicia', 'González', '6to B', 'Eventual', '20-43573030-1', TRUE),
(41234567, 'Juan', 'Fernández', '5to A', 'Mensual', '20-41234567-2', TRUE),
(39876543, 'Sofía', 'Pérez', '4to C', 'Eventual', '27-39876543-3', TRUE),
(40123456, 'Martín', 'López', '3ro A', 'Mensual', '27-40123456-4', TRUE),
(42345678, 'Camila', 'Rodríguez', '2do B', 'Fijo', '20-42345678-5', TRUE),
(41237890, 'Tomás', 'Sánchez', '1ro C', 'Mensual', '20-41237890-6', TRUE),
(43456789, 'Lucía', 'Ramírez', '5to B', 'Eventual', '27-43456789-7', TRUE),
(41567890, 'Emiliano', 'Torres', '6to A', 'Fijo', '20-41567890-8', TRUE),
(39812345, 'Valentina', 'Ruiz', '3ro B', 'Mensual', '27-39812345-9', TRUE),
(40987654, 'Agustina', 'Moreno', '4to A', 'Eventual', '20-40987654-1', TRUE),
(42349876, 'Lucas', 'Flores', '2do A', 'Mensual', '20-42349876-2', TRUE),
(41234568, 'Julián', 'Vega', '6to C', 'Fijo', '27-41234568-3', TRUE),
(43451234, 'Milagros', 'Castro', '4to C', 'Mensual', '20-43451234-4', TRUE),
(40129876, 'Bruno', 'Domínguez', '4to B', 'Eventual', '27-40129876-5', TRUE),
(42345679, 'Catalina', 'Molina', '1ro A', 'Fijo', '20-42345679-6', TRUE);


-- -----------------------------
-- Asistencia
-- -----------------------------
DELETE FROM pyac.asistencia;

INSERT INTO pyac.asistencia(dni, fecha) VALUES
(43573030, '2025-12-01'),
(41234567, '2025-10-01'),
(39876543, '2025-09-14'),
(40123456, '2025-07-01'),
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
(43573030, '2025-12-01', TRUE, 3000.0, TRUE, '2025-10-25'),
(41234567, '2025-10-01', TRUE, 3000.0, FALSE, NULL),
(39876543, '2025-09-14', TRUE, 3000.0, TRUE, '2025-10-22'),
(40123456, '2025-07-01', TRUE, 2500.0, TRUE, '2025-10-23'),
(42345678, '2025-10-01', TRUE, 2500.0, FALSE, NULL);

-- INSERT into pyac.usuario(idusuario, nombre, usuario, email, passhash) 
-- VALUES (1, 'Admin', 'admin', 'admin@example.com', '$2b$10$mEn2UYPy.Ec/t56MukBlL.KH5Lo.TCIkWl6ael61w/0.ZnhjrmjL6');