-- Crear base de datos y usuarios
DROP ROLE IF EXISTS pyac_owner;
DROP USER IF EXISTS pyac_admin;

CREATE ROLE pyac_owner;
CREATE USER pyac_admin PASSWORD 'cambiar_esta_clave';

CREATE DATABASE pyac_db OWNER pyac_owner;
GRANT CONNECT ON DATABASE pyac_db TO pyac_admin;