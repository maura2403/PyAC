async function deleteRow(deleteButtonElement) { // Recibe la ruta para hacer el DELETE y las primary keys de la entidad.
    console.log("LLEGUE");
    const row = deleteButtonElement.closest("tr");
    console.log("ROW", row);
    const route = JSON.parse(deleteButtonElement.dataset.route);
    const primaryKeys = JSON.parse(deleteButtonElement.dataset.pks);

const pkParams = primaryKeys.map(key => {
    // Buscar el td que tenga data-key = key dentro de la fila
    const td = row.querySelector(`td[data-key="${key}"]`);
    const value = td ? td.textContent.trim() : undefined;
    console.log(`${key} =`, value);
    return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
}).join('&');


    if (confirm(`¿Eliminar elemento?`)) {
        const response = await fetch(`/api${route}?${pkParams}`, { method: 'DELETE' });
        if (response.ok) {
            location.reload();
        }
        else {
            alert("Error al eliminar el registro");
        }
    }
}

