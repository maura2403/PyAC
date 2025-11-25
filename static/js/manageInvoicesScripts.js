// manageInvoicesScripts.js
// Contiene: payInvoice(button) + lógica de filtros (DNI, solo impagas) + orden + 3 filtros de fecha

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

    // Guardamos el orden original (clones)
    const originalRows = Array.from(tbody.querySelectorAll('tr')).map(r => r.cloneNode(true));

    // Elementos de control
    const filtroEl = document.getElementById('filtroSinPagar');
    const ordenarEl = document.getElementById('ordenarPor');
    const resetBtn = document.getElementById('resetOrden');
    const busquedaEl = document.getElementById('busquedaDni');

    // Fecha filters
    const filterDateExact = document.getElementById('filterDateExact'); // date
    const filterMonth = document.getElementById('filterMonth'); // month (YYYY-MM)
    const filterYear = document.getElementById('filterYear'); // number (YYYY)

    // listeners
    filtroEl.addEventListener('change', () => applyFiltersAndSort(originalRows));
    ordenarEl.addEventListener('change', () => applyFiltersAndSort(originalRows));
    busquedaEl.addEventListener('input', () => applyFiltersAndSort(originalRows));

    filterDateExact.addEventListener('change', () => {
        // cuando se elige fecha exacta, limpiar month/year para evitar confusión opcional
        if (filterDateExact.value) {
            filterMonth.value = "";
            filterYear.value = "";
        }
        applyFiltersAndSort(originalRows);
    });

    filterMonth.addEventListener('change', () => {
        if (filterMonth.value) {
            filterDateExact.value = "";
            filterYear.value = "";
        }
        applyFiltersAndSort(originalRows);
    });

    filterYear.addEventListener('input', () => {
        if (filterYear.value) {
            filterDateExact.value = "";
            filterMonth.value = "";
        }
        applyFiltersAndSort(originalRows);
    });

    resetBtn.addEventListener('click', e => {
        e.preventDefault();
        ordenarEl.value = '';
        filtroEl.checked = false;
        busquedaEl.value = '';
        filterDateExact.value = '';
        filterMonth.value = '';
        filterYear.value = '';
        renderRows(originalRows);
    });
});

// Renderizar clones
function renderRows(rowClones) {
    const tbody = document.getElementById('invoices-tbody');
    while (tbody.firstChild) tbody.removeChild(tbody.firstChild);
    rowClones.forEach(r => tbody.appendChild(r.cloneNode(true)));
}

// Aplica filtros y orden sobre el array de filas originales
function applyFiltersAndSort(originalRows) {
    const filtroEl = document.getElementById('filtroSinPagar');
    const ordenarEl = document.getElementById('ordenarPor');
    const busquedaEl = document.getElementById('busquedaDni');

    const filterDateExact = document.getElementById('filterDateExact');
    const filterMonth = document.getElementById('filterMonth');
    const filterYear = document.getElementById('filterYear');

    // clonamos desde el original
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
    const prefix = (busquedaEl.value || "").trim();
    if (prefix !== "") {
        rows = rows.filter(row => {
            const dni = row.dataset.dni || "";
            return String(dni).startsWith(prefix);
        });
    }

    // FILTRO: fechas (prioridad exacta > month > year)
    const exact = (filterDateExact && filterDateExact.value) ? filterDateExact.value : "";
    const month = (filterMonth && filterMonth.value) ? filterMonth.value : ""; // "YYYY-MM"
    const year = (filterYear && filterYear.value) ? filterYear.value : ""; // "YYYY"

    if (exact) {
        rows = rows.filter(row => {
            const fechaRaw = row.dataset.fechaemision || "";
            const fecha = fechaRaw.split("T")[0];
            return fecha === exact;
        });
    } else if (month) {
        rows = rows.filter(row => {
            const fechaRaw = row.dataset.fechaemision || "";
            const fecha = fechaRaw.split("T")[0];
            return fecha.startsWith(month); // YYYY-MM
        });
    } else if (year) {
        rows = rows.filter(row => {
            const fechaRaw = row.dataset.fechaemision || "";
            const fecha = fechaRaw.split("T")[0];
            return fecha.startsWith(year); // YYYY
        });
    }

    // ORDENAMIENTO
    const ordenarPor = ordenarEl.value;
    if (ordenarPor) {
        rows.sort((a, b) => {
            const vaRaw = a.dataset[ordenarPor] || "";
            const vbRaw = b.dataset[ordenarPor] || "";

            if (ordenarPor === 'fechaemision') {
                const va = new Date(vaRaw.split("T")[0]);
                const vb = new Date(vbRaw.split("T")[0]);
                return va - vb;
            }
            if (ordenarPor === 'dni') {
                return Number(vaRaw) - Number(vbRaw);
            }
            return String(vaRaw).localeCompare(String(vbRaw));
        });
    }

    renderRows(rows);
}
