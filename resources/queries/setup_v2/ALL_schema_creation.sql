-- Crear base de datos (ejecutar por separado si da error en pgAdmin)
-- CREATE DATABASE pyac_db OWNER pyac_owner;

-- Usar el rol propietario
SET ROLE pyac_owner;

-- Crear schema
DROP SCHEMA IF EXISTS pyac CASCADE;
CREATE SCHEMA pyac;
GRANT USAGE ON SCHEMA pyac TO pyac_admin;
GRANT CREATE ON SCHEMA pyac TO pyac_admin; -- Esto permite al admin crear tablas. Lo uso para no tener que logear dos veces para crear la DB.
-- Le damos todos los privilegios al admin
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA pyac TO pyac_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA pyac
GRANT ALL PRIVILEGES ON TABLES TO pyac_admin;



-- -----------------------------
-- 2) Tablas
-- -----------------------------

-- Tabla Nivel
CREATE TABLE IF NOT EXISTS pyac.nivel (
    nivel VARCHAR(120) PRIMARY KEY,
    precioDiario NUMERIC NOT NULL
);

GRANT SELECT, INSERT, UPDATE, DELETE ON pyac.nivel TO pyac_admin;

-- Tabla Curso

CREATE TABLE IF NOT EXISTS pyac.curso (
    curso VARCHAR(120) PRIMARY KEY,
    nivel VARCHAR(120) NOT NULL,
    FOREIGN KEY (nivel) REFERENCES pyac.nivel(nivel)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON pyac.curso TO pyac_admin;

-- Tabla Modalidad
CREATE TABLE IF NOT EXISTS pyac.modalidad (
    modalidad varchar(120) PRIMARY KEY, -- Eventual, Fijo, Mensual
    descuento NUMERIC NOT NULL -- Eventual: 1, Mensual: 0.8, Fijo: 0.9
);
GRANT SELECT, INSERT, UPDATE, DELETE ON pyac.modalidad TO pyac_admin;


-- Tabla Alumno
CREATE TABLE IF NOT EXISTS pyac.alumno (
    dni INT PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    apellido VARCHAR(120) NOT NULL,
    cursoActual VARCHAR(120),
    modalidadActual VARCHAR(120),
    CUITRespPagos varchar(120), -- Cuit del responsable de pagos del alumno
    FOREIGN KEY (modalidadActual) REFERENCES pyac.modalidad(modalidad),
    FOREIGN KEY (cursoActual) REFERENCES pyac.curso(curso)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON pyac.alumno TO pyac_admin;


-- Tabla Alumno Fijo (Jerarquía - hereda de Alumno)
CREATE TABLE IF NOT EXISTS pyac.alumnofijo(
    dni INT PRIMARY KEY,
    lun BOOLEAN NOT NULL DEFAULT FALSE,
    mar BOOLEAN NOT NULL DEFAULT FALSE,
    mie BOOLEAN NOT NULL DEFAULT FALSE,
    jue BOOLEAN NOT NULL DEFAULT FALSE,
    vie BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (dni) REFERENCES pyac.alumno(dni)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON pyac.alumnofijo TO pyac_admin;

-- Tabla Asistencia
CREATE TABLE IF NOT EXISTS pyac.asistencia (
    dni INT NOT NULL,
    fecha DATE NOT NULL,
    PRIMARY KEY (dni, fecha),
    FOREIGN KEY (dni) REFERENCES pyac.alumno(dni)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON pyac.asistencia TO pyac_admin;

-- Tabla Factura
-- Guardamos datos estáticos en la factura en su mayoría en lugar dE FKs
-- porque es un documento estático
CREATE TABLE IF NOT EXISTS pyac.factura (
    dni INT NOT NULL,
    fechaEmision DATE NOT NULL,
    esMensual BOOLEAN NOT NULL,
    montoEmitido FLOAT NOT NULL,
    modalidadAplicable VARCHAR(120),
    nivelAplicable VARCHAR(120),
    cursoAplicable VARCHAR(120),
    pagado BOOLEAN NOT NULL DEFAULT FALSE,
    fechaPago DATE,
    montoPagado FLOAT,
    descuentoAplicado FLOAT NOT NULL,
    PRIMARY KEY (dni, fechaEmision, esMensual),
    FOREIGN KEY (dni, fechaEmision) REFERENCES pyac.asistencia(dni, fecha)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON pyac.factura TO pyac_admin;
/*
Facturas:
-> Mensual: Cuando marcamos un presente si ya existe factura en este mes no se hace nada.
-> Eventual: Se generan siempre.
-> Fijo: Cuando marcamos un presente.
--- Si no existe factura de fijo del mes la creamos.
--- Si es un día que no le corresponde le creamos una factura de eventual.
*/



CREATE TABLE IF NOT EXISTS pyac.usuario(
    idUsuario INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(120),
    usuario VARCHAR(120),
    email VARCHAR(120),
    passHash VARCHAR(250)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON pyac.usuario TO pyac_admin;