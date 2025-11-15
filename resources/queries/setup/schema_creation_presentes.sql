create table pyac.presentes (
    dni integer,
    fecha date,
    primary key (dni, fecha),
    foreign key (dni) references pyac.alumnos(dni) on update cascade
);

grant select, insert, update, delete on pyac.presentes to pyac_admin;