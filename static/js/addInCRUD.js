
function startAdding() {
    const row = document.getElementById("add-student-row");
    row.style.display = "table-row";
}

async function addNew() {
    const row = document.getElementById("add-student-row");

    // Llenamos un form data con los datos del alumno nuevo
    const newData = {};
    row.querySelectorAll("td").forEach(td => {
        const key = td.dataset.key;
        if (!key) { return; }
        const input = td.querySelector("input");
        newData[key] = input.value === "" ? null : input.value;
    });

    row.querySelectorAll("input").forEach(input => {
        input.value = "";
    });

    const response = await fetch("/api/alumnos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData)
    });

    if (response.ok) {
        location.reload();
    } else {
        alert("Error al agregar el alumno");
    }
}

function cancelAdding() {
    const row = document.getElementById("add-student-row");
    row.querySelectorAll("input").forEach(input => {
        input.value = "";
    });
    row.style.display = "none";
}