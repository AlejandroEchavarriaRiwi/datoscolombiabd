export function createTable(data) {
    const headers = Object.keys(data[0]);
    let tableHTML = '<table><thead><tr>';
    headers.forEach(header => {
        tableHTML += `<th>${header}</th>`;
    });
    tableHTML += '</tr></thead><tbody>';
    data.forEach(row => {
        tableHTML += '<tr>';
        headers.forEach(header => {
            tableHTML += `<td>${row[header]}</td>`;
        });
        tableHTML += '</tr>';
    });
    tableHTML += '</tbody></table>';
    return tableHTML;
}
export function createPagination(totalPages, currentPage, goToPageFunction) {
    let paginationHTML = '<div class="pagination">';
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `<button ${i === currentPage ? 'class="active"' : ''} onclick="goToPage(${i})">${i}</button>`;
    }
    paginationHTML += '</div>';
    return paginationHTML;
}
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}
export function initializeUI(handleFileUpload, handleFilter) {
    const fileInput = document.querySelector('#file');
    const searchInput = document.querySelector('#search');
    if (fileInput && searchInput) {
        fileInput.addEventListener('change', (event) => {
            var _a;
            const file = (_a = event.target.files) === null || _a === void 0 ? void 0 : _a[0];
            if (file) {
                handleFileUpload(file);
            }
        });
        const debouncedHandleFilter = debounce((searchTerm) => {
            handleFilter(searchTerm);
        }, 300); // 300ms delay
        searchInput.addEventListener('input', (event) => {
            const searchTerm = event.target.value;
            debouncedHandleFilter(searchTerm);
        });
    }
    else {
        console.error('No se encontraron todos los elementos necesarios en el DOM');
    }
}
export function createChart(data) {
    var _a;
    const ctx = document.getElementById('municipiosChart');
    // Destruye el gráfico existente si hay uno
    if (Chart.getChart(ctx)) {
        (_a = Chart.getChart(ctx)) === null || _a === void 0 ? void 0 : _a.destroy();
    }
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                    label: 'Número de Municipios por Departamento',
                    data: data.values,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Número de Municipios'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Departamentos'
                    }
                }
            }
        }
    });
}
