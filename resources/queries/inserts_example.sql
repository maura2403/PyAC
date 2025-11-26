DELETE FROM pyac.factura;
DELETE FROM pyac.asistencia;
DELETE FROM pyac.alumno_fijo;
DELETE FROM pyac.alumno;
DELETE FROM pyac.usuario;
DELETE FROM pyac.curso;
DELETE FROM pyac.modalidad;
DELETE FROM pyac.nivel;

INSERT INTO pyac.modalidad(modalidad, descuento) VALUES
('Eventual', 1.0),
('Mensual', 0.8),
('Fijo', 0.9);

INSERT INTO pyac.nivel(nivel, precio_diario) VALUES
('Jardín', 2000.0),
('Primaria', 2500.0);

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
('4to A', 'Primaria'),
('4to B', 'Primaria'),
('4to C', 'Primaria'),
('5to A', 'Primaria'),
('5to B', 'Primaria'),
('5to C', 'Primaria'),
('6to A', 'Primaria'),
('6to B', 'Primaria'),
('6to C', 'Primaria');

INSERT INTO pyac.alumno(dni, nombre, apellido, curso, modalidad, cuit_responsable_de_pagos) VALUES
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

INSERT INTO pyac.alumno_fijo(dni, dia_de_la_semana) VALUES
(42345678, 'Lunes'),
(42345678, 'Miercoles'),
(41567890, 'Martes'),
(41567890, 'Miercoles'),
(41234568, 'Lunes'),
(41234568, 'Martes'),
(42345679, 'Miercoles'),
(42345679, 'Viernes');