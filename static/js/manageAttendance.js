async function handleCheckbox(checkbox) {
    const row = checkbox.closest("tr");
    const dni = row.querySelectorAll("td")[0].innerHTML;
    const data = {
        dni : dni,
        sunday : sunday,
        weekDay : checkbox.dataset.day
    };

    let response;
    if (checkbox.checked) {
        response = await handleTrue(data);
    }
    else {
        response = await handleFalse(data);
    }

    if (!response.ok) {
        alert("Error al actualizar el alumno.");
    }
}

async function handleTrue(data) {
    const response = await fetch(`/api/asistencia`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    return response;
}

async function handleFalse(data) {
    const response = await fetch(`/api/asistencia?dni=${data.dni}&sunday=${data.sunday}&weekDay=${data.weekDay}`, {
        method: 'DELETE',
        headers: { "Content-Type": "application/json" }
    });
    return response;
}