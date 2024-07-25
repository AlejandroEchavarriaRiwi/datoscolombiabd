// Definir la interfaz para los datos
interface RowData {
    [key: string]: string | number;
}

// Función para leer el archivo CSV
function readCSV(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result as string);
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
    });
}

// Definir los tipos de datos esperados para cada columna
enum ColumnType {
    String,
    Number,
    CodeWithSymbols,
    RegionName
}

// Definir la estructura de las columnas
const columnStructure: { name: string; type: ColumnType }[] = [
    { name: 'REGION', type: ColumnType.RegionName },
    { name: 'CÓDIGO DANE DEL DEPARTAMENTO', type: ColumnType.CodeWithSymbols },
    { name: 'DEPARTAMENTO', type: ColumnType.String },
    { name: 'CÓDIGO DANE DEL MUNICIPIO', type: ColumnType.Number },
    { name: 'MUNICIPIO', type: ColumnType.String }
];

function processCSV(content: string): RowData[] {
    const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
    const nonEmptyLines = lines.filter(line => line.trim() !== '');

    if (nonEmptyLines.length === 0) {
        throw new Error('El archivo CSV está vacío');
    }

    const headers = parseCSVLine(nonEmptyLines[0]);

    if (headers.length !== columnStructure.length) {
        throw new Error(`El archivo CSV debe tener exactamente ${columnStructure.length} columnas, pero tiene ${headers.length}`);
    }

    // Verificar que los nombres de las columnas coincidan con la estructura definida
    columnStructure.forEach((column, index) => {
        if (column.name.toLowerCase() !== headers[index].toLowerCase()) {
            throw new Error(`La columna ${index + 1} debe llamarse "${column.name}", pero se encontró "${headers[index]}"`);
        }
    });

    return nonEmptyLines.slice(1).map((line, lineIndex) => {
        const values = parseCSVLine(line);
        if (values.length !== columnStructure.length) {
            throw new Error(`La fila ${lineIndex + 2} debe tener exactamente ${columnStructure.length} valores, pero tiene ${values.length}`);
        }

        const rowData: RowData = {};

        columnStructure.forEach((column, index) => {
            const value = values[index].trim();

            if (value === '') {
                throw new Error(`La fila ${lineIndex + 2}, columna "${column.name}" está vacía`);
            }

            // Validaciones específicas para cada columna
            switch (column.type) {
                case ColumnType.Number:
                    if (!/^\d+(\.\d+)?$/.test(value)) {
                        throw new Error(`La fila ${lineIndex + 2}, columna "${column.name}" debe ser un número válido, pero se encontró "${value}"`);
                    }
                    rowData[column.name] = value; // Mantenemos el valor como string
                    break;
                case ColumnType.CodeWithSymbols:
                    rowData[column.name] = value;
                    break;
                case ColumnType.RegionName:
                case ColumnType.String:
                    // Permite letras, números, espacios, guiones, apóstrofos, comas, puntos y paréntesis
                    if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s\-',.()]+$/.test(value)) {
                        throw new Error(`La fila ${lineIndex + 2}, columna "${column.name}" contiene caracteres no permitidos: "${value}"`);
                    }
                    rowData[column.name] = value;
                    break;
            }
        });

        return rowData;
    });
}

function parseCSVLine(line: string): string[] {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        if (line[i] === '"') {
            inQuotes = !inQuotes;
        } else if (line[i] === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += line[i];
        }
    }
    result.push(current);

    return result;
}

// Función para crear la tabla HTML
function createTable(data: RowData[]): string {
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

// Función para filtrar los datos
function filterData(data: RowData[], searchTerm: string): RowData[] {
    // Revisa si en alguna fila se encuentra el termino buscado
    const filteredData = data.filter(row =>
        Object.values(row).some(value =>
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    // Muestra una alerta si no encuentra el termino buscado
    if (filteredData.length === 0) {
        alert(`${searchTerm} no se encuentra en la base de datos`);
    }

    return filteredData;
}

// Función para paginar los datos
function paginateData(data: RowData[], pageSize: number, pageNumber: number): RowData[] {
    const start = (pageNumber - 1) * pageSize;
    return data.slice(start, start + pageSize);
}

// Función para crear los botones de paginación
function createPagination(totalPages: number, currentPage: number): string {
    let paginationHTML = '<div class="pagination">';
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `<button ${i === currentPage ? 'class="active"' : ''} onclick="goToPage(${i})">${i}</button>`;
    }
    paginationHTML += '</div>';
    return paginationHTML;
}

let allData: RowData[] = [];
let currentPage = 1;
const pageSize = 15;

// Función para ir a una página específica
function goToPage(pageNumber: number) {
    currentPage = pageNumber;
    const searchInput = document.querySelector('#search') as HTMLInputElement | null;
    const searchTerm = searchInput ? searchInput.value : '';
    const filteredData = filterData(allData, searchTerm);
    displayTable(filteredData);
}

// Función para mostrar la tabla y la paginación
function displayTable(data: RowData[]) {
    const tableContainer = document.getElementById('table');
    const paginationContainer = document.getElementById('pagination');

    if (tableContainer && paginationContainer) {
        const paginatedData = paginateData(data, pageSize, currentPage);
        const tableHTML = createTable(paginatedData);
        tableContainer.innerHTML = tableHTML;

        const totalPages = Math.ceil(data.length / pageSize);
        const paginationHTML = createPagination(totalPages, currentPage);
        paginationContainer.innerHTML = paginationHTML;
    }
}

// Evento principal
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.querySelector('#file') as HTMLInputElement | null;
    const searchInput = document.querySelector('#search') as HTMLInputElement | null;
    const filterButton = document.querySelector('#filterButton') as HTMLButtonElement | null;

    if (fileInput && searchInput && filterButton) {
        fileInput.addEventListener('change', async (event) => {
            const file = (event.target as HTMLInputElement).files?.[0];
            if (file) {
                try {
                    const content = await readCSV(file);
                    allData = processCSV(content);
                    currentPage = 1;
                    displayTable(allData);
                } catch (error) {
                    alert(error);
                }
            }
        });

        filterButton.addEventListener('click', () => {
            const searchTerm = searchInput.value;
            const filteredData = filterData(allData, searchTerm);
            currentPage = 1;
            displayTable(filteredData);
        });
    } else {
        console.error('No se encontraron todos los elementos necesarios en el DOM');
    }
});

// Asignar la función goToPage al objeto window para que esté disponible globalmente
(window as any).goToPage = goToPage;