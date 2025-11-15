create table pyac.niveles (
    nivel integer primary key,
    precio numeric (18, 2)
);

grant select, insert, update, delete on pyac.niveles to pyac_admin;