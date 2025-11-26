async function handleCheckbox(checkbox) {
    const row = checkbox.closest("tr");
    const dni = row.querySelectorAll("td")[0].innerHTML;
    const data = {
        dni : dni,
        dia_de_la_semana : checkbox.dataset.day
    };

    let response;
    if (checkbox.checked) {
        response = await handleTrue(data);
    }
    else {
        response = await handleFalse(data);
    }

    if (response.ok) {
        location.reload();
    }
    else {
        alert("Error al actualizar el alumno.");
    }
}

async function handleTrue(data) {
    const response = await fetch(`/api/alumno_fijo`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    return response;
}

async function handleFalse(data) {
    const response = await fetch(`/api/alumno_fijo?dni=${data.dni}&dia_de_la_semana=${data.dia_de_la_semana}`, {
        method: 'DELETE',
        headers: { "Content-Type": "application/json" }
    });
    return response;
}