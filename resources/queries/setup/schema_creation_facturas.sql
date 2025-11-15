create table pyac.facturas (
    dni integer,
    fecha_de_emision date,
    precio numeric (18, 2),
    fecha_de_pago date,
    primary key(dni, fecha_de_emision),
    foreign key (dni) references pyac.alumnos(dni) on update cascade
);

grant select, insert, update, delete on pyac.facturas to pyac_admin;