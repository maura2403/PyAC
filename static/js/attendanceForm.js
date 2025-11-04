function updateAttendanceActionButton(dni, changeToDelete){
    const fila = document.querySelector(`tr[data-id="${dni}"]`);
    const attendanceButtonCell = fila.querySelector('td[attendanceActionButton]');
    attendanceButtonCell.innerHTML =
        changeToDelete
            ? `<button type="button" onclick="removeAttendance('${dni}')">Eliminar presente</button>`
            : `<button type="button" onclick="addAttendance('${dni}')">Agregar presente</button>`;
}

async function addAttendance(dni) {
    const response = await fetch('/api/presentes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dni: dni, fecha: `${fecha}` })
    });

    if (response.ok) {
        updateAttendanceActionButton(dni, true);
    } else {
        alert("Error agregar presente del alumno");
    }
}

async function removeAttendance(dni) {            
    if (confirm(`¿Desea eliminar el presente del alumno con DNI: ${dni} en la fecha ${fecha}?`)) {
        const response = await fetch(`/api/presentes/?dni=${dni}&fecha=${fecha}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            updateAttendanceActionButton(dni, false);
        }
        else {
            alert("Error al eliminar presente del alumno");
        }
    }
}