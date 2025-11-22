-- Tabla Curso

CREATE TABLE IF NOT EXISTS pyac.curso (
    curso VARCHAR(120) PRIMARY KEY,
    nivel VARCHAR(120) NOT NULL,
    activo BOOLEAN, -- Campo que se usa para borrado lógico. Activo = 1 significa no borrado.
    FOREIGN KEY (nivel) REFERENCES pyac.nivel(nivel)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON pyac.curso TO pyac_admin;