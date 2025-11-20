

CREATE TABLE IF NOT EXISTS pyac.usuario(
    idUsuario INT PRIMARY KEY,
    nombre VARCHAR(120),
    usuario VARCHAR(120),
    email VARCHAR(120),
    passHash VARCHAR(250)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON pyac.usuario TO pyac_admin;