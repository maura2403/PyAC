// =======================
//  PAGAR FACTURA
// =======================
async function payInvoice(invoiceButton) {
    const row = invoiceButton.closest("tr");

    const dni = row.dataset.dni;
    const fechaemision = row.dataset.fechaemision.split("T")[0];
    const esmensual = row.dataset.esmensual;

    const pkParams = `dni=${encodeURIComponent(dni)}&fechaemision=${encodeURIComponent(fechaemision)}&esmensual=${encodeURIComponent(esmensual)}`;

    const updatedData = {
        pagado: true,
        fechapago: new Date().toISOString().slice(0, 10),
        dni: dni,
        fechaemision: fechaemision,
        esmensual: esmensual
    };

    const response = await fetch(`/api/factura?${pkParams}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData)
    });

    if (response.ok) {
        location.reload();
    } else {
        alert("Error al marcar la factura como pagada.");
    }
}

// =======================
//  FILTROS + ORDENAMIENTO
// =======================
document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.getElementById('invoices-tbody');
    if (!tbody) return;

    const originalRows = Array.from(tbody.querySelectorAll('tr')).map(r => r.cloneNode(true));

    const filtroEl = document.getElementById('filtroSinPagar');
    const ordenarEl = document.getElementById('ordenarPor');
    const resetBtn = document.getElementById('resetOrden');
    const busquedaEl = document.getElementById('busquedaDni');

    filtroEl.addEventListener('change', () => applyFiltersAndSort(originalRows));
    ordenarEl.addEventListener('change', () => applyFiltersAndSort(originalRows));
    busquedaEl.addEventListener('input', () => applyFiltersAndSort(originalRows));

    resetBtn.addEventListener('click', e => {
        e.preventDefault();
        ordenarEl.value = '';
        filtroEl.checked = false;
        busquedaEl.value = '';
        renderRows(originalRows);
    });
});

function renderRows(rowClones) {
    const tbody = document.getElementById('invoices-tbody');
    while (tbody.firstChild) tbody.removeChild(tbody.firstChild);
    rowClones.forEach(r => tbody.appendChild(r.cloneNode(true)));
}

function applyFiltersAndSort(originalRows) {
    const filtroEl = document.getElementById('filtroSinPagar');
    const ordenarEl = document.getElementById('ordenarPor');
    const busquedaEl = document.getElementById('busquedaDni');

    let rows = originalRows.map(r => r.cloneNode(true));

    // FILTRO: solo impagas
    if (filtroEl.checked) {
        rows = rows.filter(row => {
            const raw = row.dataset.pagado;
            const pagado = (raw === 'true' || raw === true || raw === '1' || raw === 1);
            return !pagado;
        });
    }

    // FILTRO: por DNI (prefijo)
    const prefix = busquedaEl.value.trim();
    if (prefix !== "") {
        rows = rows.filter(row => {
            const dni = row.dataset.dni || "";
            return dni.startsWith(prefix);
        });
    }

    // ORDENAMIENTO
    const ordenarPor = ordenarEl.value;
    if (ordenarPor) {
        rows.sort((a, b) => {
            const va = a.dataset[ordenarPor];
            const vb = b.dataset[ordenarPor];

            if (ordenarPor === 'fechaemision') {
                return new Date(va) - new Date(vb);
            }
            if (ordenarPor === 'dni') {
                return Number(va) - Number(vb);
            }

            return String(va).localeCompare(String(vb));
        });
    }

    renderRows(rows);
}
