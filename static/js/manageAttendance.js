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

function changeWeek(count) {
    const data = sunday.split("-").map(value => parseInt(value));
    const dateObj = new Date(data[0], data[1] - 1, data[2]);
    dateObj.setDate(dateObj.getDate() + count * 7);
    window.location.href = `/app/asistencia?day=${dateObj.getDate()}&month=${dateObj.getMonth()+1}&year=${dateObj.getFullYear()}`;
}