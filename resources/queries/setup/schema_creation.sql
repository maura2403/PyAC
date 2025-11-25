-- (IMPORTANTE) Abrir conexión a la db con el usuario postgres para realizar estas operaciones
-- Una vez creadas las tablas se usa el usuario "pyac_admin"

-- Usar el rol propietario
SET ROLE pyac_owner;

-- Crear schema
DROP SCHEMA IF EXISTS pyac CASCADE;
CREATE SCHEMA pyac;
GRANT USAGE ON SCHEMA pyac TO pyac_admin;

-- Tabla Nivel
CREATE TABLE pyac.nivel (
    nivel VARCHAR(120) PRIMARY KEY,
    precio_diario NUMERIC(18, 2) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);
GRANT SELECT, INSERT, UPDATE, DELETE ON pyac.nivel TO pyac_admin;

-- Tabla Curso
CREATE TABLE pyac.curso (
    curso VARCHAR(120) PRIMARY KEY,
    nivel VARCHAR(120) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (nivel) REFERENCES pyac.nivel(nivel)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON pyac.curso TO pyac_admin;

-- Tabla Modalidad
CREATE TABLE pyac.modalidad (
    modalidad VARCHAR(120) PRIMARY KEY, -- Eventual, Fijo, Mensual
    descuento NUMERIC NOT NULL, -- Eventual: 1, Mensual: 0.8, Fijo: 0.9
    activo BOOLEAN NOT NULL DEFAULT TRUE
);
GRANT SELECT, INSERT, UPDATE, DELETE ON pyac.modalidad TO pyac_admin;

-- Tabla Alumno
CREATE TABLE pyac.alumno (
    dni INT PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    apellido VARCHAR(120) NOT NULL,
    curso VARCHAR(120) NOT NULL,
    modalidad VARCHAR(120) NOT NULL,
    cuit_responsable_de_pagos VARCHAR(120) NOT NULL, -- Cuit del responsable de pagos del alumno
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (modalidad) REFERENCES pyac.modalidad(modalidad) ON UPDATE CASCADE,
    FOREIGN KEY (curso) REFERENCES pyac.curso(curso) ON UPDATE CASCADE
);
GRANT SELECT, INSERT, UPDATE, DELETE ON pyac.alumno TO pyac_admin;

-- Tabla Alumno Fijo (Jerarquía - hereda de Alumno)
CREATE TABLE pyac.alumno_fijo(
    dni INT,
    dia_de_la_semana VARCHAR(120),
    PRIMARY KEY (dni, dia_de_la_semana),
    FOREIGN KEY (dni) REFERENCES pyac.alumno(dni) ON UPDATE CASCADE
);
GRANT SELECT, INSERT, UPDATE, DELETE ON pyac.alumno_fijo TO pyac_admin;

-- Tabla Asistencia
CREATE TABLE pyac.asistencia (
    dni INT,
    fecha DATE,
    PRIMARY KEY (dni, fecha),
    FOREIGN KEY (dni) REFERENCES pyac.alumno(dni) ON UPDATE CASCADE
);
GRANT SELECT, INSERT, UPDATE, DELETE ON pyac.asistencia TO pyac_admin;

-- Tabla Factura
CREATE TABLE pyac.factura (
    dni INT,
    fecha_de_emision DATE,
    es_mensual BOOLEAN,
    monto NUMERIC(18, 2) NOT NULL,
    pagado BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_de_pago DATE,
    PRIMARY KEY (dni, fecha_de_emision, es_mensual),
    FOREIGN KEY (dni, fecha_de_emision) REFERENCES pyac.asistencia(dni, fecha) ON UPDATE CASCADE
);
GRANT SELECT, INSERT, UPDATE, DELETE ON pyac.factura TO pyac_admin;

-- Tabla Usuario
CREATE TABLE pyac.usuario(
    id_usuario INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(120),
    usuario VARCHAR(120),
    email VARCHAR(120),
    password_hash VARCHAR(250)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON pyac.usuario TO pyac_admin;