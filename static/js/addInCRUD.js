
function startAdding() {
    const row = document.getElementById("add-row");
    row.style.display = "table-row";
}

async function addNew(route) { //Recibe una ruta para post, sin /api. Por ejemplo /alumno
    const row = document.getElementById("add-row");

    // Llenamos un form data con los datos del insert nuevo
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

    const response = await fetch(`/api/${route}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData)
    });

    if (response.ok) {
        location.reload();
    } else {
        alert("Error al agregar el elemento");
    }
}

function cancelAdding() {
    const row = document.getElementById("add-row");
    row.querySelectorAll("input").forEach(input => {
        input.value = "";
    });
    row.style.display = "none";
}