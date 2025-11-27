async function payInvoice(checkbox) {
    const row = checkbox.closest("tr");

    const dni = row.dataset.dni;
    const fecha_emision = row.dataset.fecha_emision.split("T")[0];
    const es_mensual = row.dataset.es_mensual;

    const pkParams = `dni=${encodeURIComponent(dni)}&fecha_de_emision=${encodeURIComponent(fecha_emision)}&es_mensual=${encodeURIComponent(es_mensual)}`;

    const updatedData = {
        pagado: checkbox.checked,
        fecha_de_pago: checkbox.checked ? new Date().toISOString().slice(0, 10) : null
    };

    const response = await fetch(`/api/factura?${pkParams}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData)
    });

    if (!response.ok) {
        alert("Error al actualizar el estado de pago de la factura.");
    }
}

async function downloadInvoice(button) {
    const row = button.closest("tr");
    const dni = row.dataset.dni;
    const fecha_emision = row.dataset.fecha_emision ? row.dataset.fecha_emision.split("T")[0] : '';
    const es_mensual = row.dataset.es_mensual === "true";

    const url = `/api/factura/descargar?dni=${encodeURIComponent(dni)}&fecha_de_emision=${encodeURIComponent(fecha_emision)}&es_mensual=${encodeURIComponent(es_mensual)}`;

    try {
        const response = await fetch(url, {
            credentials: 'same-origin'
        });
        if (!response.ok) {
            throw new Error('Error al generar la factura');
        }
        const html = await response.text();
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `factura_${dni}_${fecha_emision}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
    } catch (error) {
        alert('Error al descargar la factura');
        console.error(error);
    }
}