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
        <button class="confirm" onclick="confirmEdit(this)">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z" stroke="currentColor" stroke-width="1.5"></path>
                <path d="M8.5 12.5L10.5 14.5L15.5 9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
        </button>
        <button class="delete" onclick="cancelEdit(this)">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.5 9.50026H14.0385C15.9502 9.50026 17.5 11.05 17.5 12.9618C17.5 14.8736 15.9502 16.4233 14.0385 16.4233H9.5M6.5 9.50026L8.75 7.42334M6.5 9.50026L8.75 11.5772" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> 
                <path d="M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z" stroke="currentColor" stroke-width="1.5"></path>
            </svg>
        </button>
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
        <button class="edit" onclick="startEditing(this)">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 10.5V12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2H13.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path> 
                <path d="M16.652 3.45506L17.3009 2.80624C18.3759 1.73125 20.1188 1.73125 21.1938 2.80624C22.2687 3.88124 22.2687 5.62415 21.1938 6.69914L20.5449 7.34795M16.652 3.45506C16.652 3.45506 16.7331 4.83379 17.9497 6.05032C19.1662 7.26685 20.5449 7.34795 20.5449 7.34795M16.652 3.45506L10.6872 9.41993C10.2832 9.82394 10.0812 10.0259 9.90743 10.2487C9.70249 10.5114 9.52679 10.7957 9.38344 11.0965C9.26191 11.3515 9.17157 11.6225 8.99089 12.1646L8.41242 13.9M20.5449 7.34795L14.5801 13.3128C14.1761 13.7168 13.9741 13.9188 13.7513 14.0926C13.4886 14.2975 13.2043 14.4732 12.9035 14.6166C12.6485 14.7381 12.3775 14.8284 11.8354 15.0091L10.1 15.5876M10.1 15.5876L8.97709 15.9619C8.71035 16.0508 8.41626 15.9814 8.21744 15.7826C8.01862 15.5837 7.9492 15.2897 8.03811 15.0229L8.41242 13.9M10.1 15.5876L8.41242 13.9" stroke="currentColor" stroke-width="1.5"></path>
            </svg>
        </button>
        <button class="delete" onclick="deleteRow(this)">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.1709 4C9.58273 2.83481 10.694 2 12.0002 2C13.3064 2 14.4177 2.83481 14.8295 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path> 
                <path d="M20.5001 6H3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
                <path d="M18.8332 8.5L18.3732 15.3991C18.1962 18.054 18.1077 19.3815 17.2427 20.1907C16.3777 21 15.0473 21 12.3865 21H11.6132C8.95235 21 7.62195 21 6.75694 20.1907C5.89194 19.3815 5.80344 18.054 5.62644 15.3991L5.1665 8.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path> 
                <path d="M9.5 11L10 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
                <path d="M14.5 11L14 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
            </svg>
        </button>
    `;
}