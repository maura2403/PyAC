-- Tabla Modalidad
CREATE TABLE IF NOT EXISTS pyac.modalidad (
    modalidad varchar(120) PRIMARY KEY, -- Eventual, Fijo, Mensual
    descuento NUMERIC NOT NULL -- Eventual: 1, Mensual: 0.8, Fijo: 0.9
);
GRANT SELECT, INSERT, UPDATE, DELETE ON pyac.modalidad TO pyac_admin;
