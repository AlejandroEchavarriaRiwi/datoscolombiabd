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
                    rowData[column.name] = parseInt(value.split('.')[0], 10);
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
    return data.filter(row =>
        Object.values(row).some(value =>
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
    );
}

// Evento principal
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.querySelector('#file') as HTMLInputElement;
    const searchInput = document.querySelector('#search') as HTMLInputElement;
    let allData: RowData[] = [];

    fileInput.addEventListener('change', async (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
            try {
                const content = await readCSV(file);
                allData = processCSV(content);
                const tableHTML = createTable(allData);
                const searchContainer = document.querySelector("#searchContainer") as HTMLDivElement || null;

                if (searchContainer) {
                    const title = document.createElement('h3');
                    title.innerText = "Resultado:";
                    searchContainer.insertBefore(title, searchContainer.firstChild);

                    const tableContainer = document.getElementById('table');
                    if (tableContainer) {
                        tableContainer.innerHTML = tableHTML;
                    }
                }
            } catch (error) {
                console.error('Error al procesar el archivo:', error);
                alert('Error al procesar el archivo. Asegúrate de que tenga el formato correcto.');
            }
        }
    });

    searchInput.addEventListener('input', (event) => {
        const searchTerm = (event.target as HTMLInputElement).value;
        const filteredData = filterData(allData, searchTerm);
        const tableHTML = createTable(filteredData);
        const tableContainer = document.getElementById('table');
        if (tableContainer) {
            tableContainer.innerHTML = tableHTML;
        }
    });
});