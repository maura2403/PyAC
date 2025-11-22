async function deleteRow(deleteButtonElement) { // Recibe la ruta para hacer el DELETE y las primary keys de la entidad.
    console.log("LLEGUE");
    const row = deleteButtonElement.closest("tr");
    console.log("ROW", row);
    const route = JSON.parse(deleteButtonElement.dataset.route);
    const primaryKeys = JSON.parse(deleteButtonElement.dataset.pks);

    const pkParams = primaryKeys.map(key => {
        const value = row.dataset[key]; // asumimos que cada td o el tr tiene dataset con la PK
        return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    }).join('&');

    if (confirm(`¿Eliminar elemento?`)) {
        const response = await fetch(`/api/${route}?${pkParams}`, { method: 'DELETE' });
        if (response.ok) {
            location.reload();
        }
        else {
            alert("Error al eliminar el registro");
        }
    }
}

