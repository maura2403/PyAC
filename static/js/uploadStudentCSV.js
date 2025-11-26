async function handleUpload(fileInput, tableName) {
    const file = fileInput.files[0];
 
    if (!file) { alert('Seleccioná un CSV'); return; }
 
    const text = await file.text();
 
    try {
        const response = await fetch(`/api/${tableName}/csv`, {
            method: 'POST',
            headers: { 'Content-Type': 'text/csv' },
            body: text
        });
        if (response.ok) {
            alert('Datos enviados correctamente');
        } else {
            alert('Error al enviar los datos');
        }
    } catch (err) {
        console.error(err);
        alert('Error de red o servidor');
    }
}
