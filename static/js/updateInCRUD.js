function startEditing(editButtonElement) {
    const row = editButtonElement.closest("tr");

    // Transformamos los campos en campos editables y nos guardamos los valores viejos
    row.querySelectorAll("td").forEach(td => {
        const value = td.textContent;
        td.innerHTML = `<input type="text" value="${value}">`;
        td.setAttribute("data-og", value);
        td.setAttribute("data-id", td.dataset.id);
    });

    // Agarramos el td de los botones y ponemos los de confirmar y cancelar
    const buttonsTd = row.querySelector("td:last-child");
    buttonsTd.innerHTML = `
        <button class="confirm" onclick="confirmEdit(this)"></button>
        <button class="delete" onclick="cancelEdit(this)"></button>
    `;
}

async function confirmEdit(confirmButton) {
    const row = confirmButton.closest("tr");
    const pkParams = [];

    // Llenamos un form data con los datos nuevos
    const updatedData = {};
    row.querySelectorAll("td").forEach(td => {
        const key = td.dataset.key;
        if (!key) { return; }
        const input = td.querySelector("input");
        const value = input.value === "" ? null : input.value;
        if (td.dataset.id === "true") {
            pkParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(td.dataset.og)}`);
        }
        updatedData[key] = value;
    });

    const response = await fetch(`/api/${route}?${pkParams}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData)
    });

    if (response.ok) {
        location.reload();
    }
    else {
        alert("Error al actualizar el alumno");
    }
}

function cancelEdit(cancelButtonElement) {
    const row = cancelButtonElement.closest("tr");

    // Recuperamos los valores originales
    row.querySelectorAll("td").forEach(td => {
        td.textContent = td.dataset.og;
    });

    // Volvemos a poner los botones de editar y borrar
    const buttonsTd = row.querySelector("td:last-child");
    buttonsTd.innerHTML = `
        <button class="edit" onclick="startEditing(this)">E</button>
        <button class="delete" onclick="deleteRow(this)">D</button>
    `;
}