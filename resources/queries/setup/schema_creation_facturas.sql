create table pyac.facturas (
    dni integer primary key,
    fecha_de_emision date primary key,
    precio numeric (18, 2),
    fecha_de_pago date,
    foreign key (dni) references pyac.alumnos(dni) on update cascade
);

grant select, insert, update, delete on pyac.facturas to pyac_admin;