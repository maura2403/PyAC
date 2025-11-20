async function deleteRow(deleteButtonElement) {
    const row = deleteButtonElement.closest("tr");
    const dni = row.dataset.id;
    if (confirm(`¿Desea eliminar al alumno con DNI: ${dni}?`)) {
        const response = await fetch(`/api/alumnos/?dni=${dni}`, { method: 'DELETE' });
        if (response.ok) {
            location.reload();
        }
        else {
            alert("Error al eliminar el alumno");
        }
    }
}

