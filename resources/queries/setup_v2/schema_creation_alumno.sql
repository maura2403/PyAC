set role to pyac_owner;
drop schema if exists pyac cascade;
create schema pyac;
grant usage on schema pyac to pyac_admin;

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