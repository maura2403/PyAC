-- Tabla Modalidad
CREATE TABLE IF NOT EXISTS pyac.modalidad (
    modalidad varchar(120) PRIMARY KEY, -- Eventual, Fijo, Mensual
    descuento NUMERIC NOT NULL, -- Eventual: 1, Mensual: 0.8, Fijo: 0.9
    activo BOOLEAN -- Campo que se usa para borrado lógico. Activo = 1 significa no borrado.
);
GRANT SELECT, INSERT, UPDATE, DELETE ON pyac.modalidad TO pyac_admin;
