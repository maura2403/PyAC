async function deleteStudent(deleteButtonElement) {
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

function startAddingStudent() {
    const row = document.getElementById("add-student-row");
    row.style.display = "table-row";
}

async function addNewStudent() {
    const row = document.getElementById("add-student-row");

    // Llenamos un form data con los datos del alumno nuevo
    const newData = {};
    row.querySelectorAll("td").forEach(td => {
        const key = td.dataset.key;
        if (!key) { return; }
        const input = td.querySelector("input");
        newData[key] = input.value;
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

function cancelAddingStudent() {
    const row = document.getElementById("add-student-row");
    row.querySelectorAll("input").forEach(input => {
        input.value = "";
    });
    row.style.display = "none";
}

function startEditingStudent(editButtonElement) {
    const row = editButtonElement.closest("tr");

    // Transformamos los campos en campos editables y nos guardamos los valores viejos
    row.querySelectorAll("td").forEach(td => {
        const value = td.textContent;
        td.innerHTML = `<input type="text" value="${value}">`;
        td.setAttribute("data-og", value);
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
    const id = row.dataset.id;

    // Llenamos un form data con los datos nuevos
    const updatedData = {};
    row.querySelectorAll("td").forEach(td => {
        const key = td.dataset.key;
        if (!key) { return; }
        const input = td.querySelector("input");
        updatedData[key] = input.value;
    });

    const response = await fetch(`/api/alumnos/?dni=${id}`, {
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
        <button class="edit" onclick="startEditingStudent(this)"></button>
        <button class="delete" onclick="deleteStudent(this)"></button>
    `;
}