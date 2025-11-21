-- Tabla Asistencia
CREATE TABLE IF NOT EXISTS pyac.asistencia (
    dni INT NOT NULL,
    fecha DATE NOT NULL,
    PRIMARY KEY (dni, fecha),
    FOREIGN KEY (dni) REFERENCES pyac.alumno(dni)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON pyac.asistencia TO pyac_admin;
