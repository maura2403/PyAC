
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