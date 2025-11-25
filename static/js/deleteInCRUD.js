async function deleteRow(deleteButtonElement) {
    const row = deleteButtonElement.closest("tr");
    const pkParams = [];

    row.querySelectorAll("td").forEach(td => {
        const key = td.dataset.key;
        if (!key) { return; }
        const value = td.innerHTML === "" ? null : td.innerHTML;
        if (td.dataset.id === "true") {
            pkParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
        }
    });

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

