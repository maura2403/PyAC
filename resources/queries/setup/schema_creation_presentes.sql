create table pyac.presentes (
    dni integer primary key,
    fecha date primary key,
    foreign key (dni) references pyac.alumnos(dni) on update cascade
);

grant select, insert, update, delete on pyac.presentes to pyac_admin;