# PyAC

Presente y A Comer!

## Integrantes

- Emiliano Testa Elesgaray
- Maura Roll
- Mauricio Romero Laino
- Juan Cruz Piedrabuena


## Cómo usar

### Pasos para correr el proyecto

1. Instalar las dependencias:

```bash
npm install
```

2. Asegurarse de que la base de datos PostgreSQL esté corriendo y que las variables de entorno estén configuradas:

```bash
source resources/local-sets.sh
```

3. Iniciar el servidor:

```bash
npm run server
```

4. Abrir el navegador en:

```
http://localhost:3000/app/menu
```

---

### Scripts disponibles

* **Compilar los archivos del proyecto** según la configuración de `tsconfig.json`:

```bash
npm run prepare
```

* **Compilar el proyecto e iniciar el servidor**:

```bash
npm run server
```

Luego de ejecutar este comando, el servidor estará disponible en:

```
http://localhost:3000/app/menu
```
