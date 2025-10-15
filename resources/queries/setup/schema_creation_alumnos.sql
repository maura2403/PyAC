set role to pyac_owner;
drop schema if exists pyac cascade;
create schema pyac;
grant usage on schema pyac to pyac_admin;

create table pyac.alumnos (
    dni integer primary key,
    apellido text not null,
    nombre text not null,
    curso text not null,
    modalidad text not null,
    responsable1 text,
    responsable2 text,
    responsable_de_pagos text not null
);

grant select, insert, update, delete on pyac.alumnos to pyac_admin;