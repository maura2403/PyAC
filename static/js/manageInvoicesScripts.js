async function payInvoice(invoiceButton) {
    const row = invoiceButton.closest("tr");

    // Las PK están guardadas en data attributes del <tr>
    const dni = row.dataset.dni;
    const fechaemision = row.dataset.fechaemision.split("T")[0]; // Me quedo solo con la fecha sin la hora.
    const esmensual = row.dataset.esmensual;

    // Genero query params sabiendo que la pk compuesta de factura es dni y fechaemision
    const pkParams = `dni=${encodeURIComponent(dni)}&fechaemision=${encodeURIComponent(fechaemision)}&esmensual=${encodeURIComponent(esmensual)}`;

    // Datos específicos que quiero actualizar
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

// registerPaidInvoice.js
// Contiene: payInvoice(button) + lógica de filtros y ordenamiento
document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.getElementById('invoices-tbody');
  if (!tbody) return;

  // Guardamos clones de las filas en el orden original
  const originalRows = Array.from(tbody.querySelectorAll('tr')).map(r => r.cloneNode(true));

  const filtroEl = document.getElementById('filtroSinPagar');
  const ordenarEl = document.getElementById('ordenarPor');
  const resetBtn = document.getElementById('resetOrden');

  filtroEl.addEventListener('change', () => applyFiltersAndSort(originalRows));
  ordenarEl.addEventListener('change', () => applyFiltersAndSort(originalRows));
  resetBtn.addEventListener('click', (e) => {
    e.preventDefault();
    ordenarEl.value = '';
    filtroEl.checked = false;
    renderRows(originalRows);
  });
});

function renderRows(rowClones) {
  const tbody = document.getElementById('invoices-tbody');
  // limpieza
  while (tbody.firstChild) tbody.removeChild(tbody.firstChild);
  // append clones (cloning again to keep originalNodes intact)
  rowClones.forEach(r => tbody.appendChild(r.cloneNode(true)));
}

function applyFiltersAndSort(originalRows) {
  const filtroEl = document.getElementById('filtroSinPagar');
  const ordenarEl = document.getElementById('ordenarPor');

  // Empezamos desde los clones originales
  let rows = originalRows.map(r => r.cloneNode(true));

  // FILTRO: solo impagas
  if (filtroEl.checked) {
    rows = rows.filter(row => {
      // dataset.pagado puede ser "true"/"false" o boolean
      const pagadoRaw = row.dataset.pagado;
      const pagado = (pagadoRaw === 'true' || pagadoRaw === true || pagadoRaw === '1' || pagadoRaw === 1);
      return !pagado;
    });
  }

  // ORDENAMIENTO
  const ordenarPor = ordenarEl.value;
  if (ordenarPor) {
    rows.sort((a, b) => {
      const va = a.dataset[ordenarPor];
      const vb = b.dataset[ordenarPor];

      if (ordenarPor === 'fechaemision') {
        // parsear como fecha (funciona con ISO strings)
        const da = new Date(va);
        const db = new Date(vb);
        return da - db;
      }

      if (ordenarPor === 'dni') {
        // numeric comparison
        return Number(va) - Number(vb);
      }

      // fallback lexicográfico
      return String(va).localeCompare(String(vb));
    });
  }

  renderRows(rows);
}