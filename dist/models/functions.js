// Definir los tipos de datos esperados para cada columna
var ColumnType;
(function (ColumnType) {
    ColumnType[ColumnType["String"] = 0] = "String";
    ColumnType[ColumnType["Number"] = 1] = "Number";
    ColumnType[ColumnType["CodeWithSymbols"] = 2] = "CodeWithSymbols";
    ColumnType[ColumnType["RegionName"] = 3] = "RegionName";
})(ColumnType || (ColumnType = {}));
// Definir la estructura de las columnas
const columnStructure = [
    { name: 'REGION', type: ColumnType.RegionName },
    { name: 'CÓDIGO DANE DEL DEPARTAMENTO', type: ColumnType.CodeWithSymbols },
    { name: 'DEPARTAMENTO', type: ColumnType.String },
    { name: 'CÓDIGO DANE DEL MUNICIPIO', type: ColumnType.Number },
    { name: 'MUNICIPIO', type: ColumnType.String }
];
function processCSV(content) {
    const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
    const nonEmptyLines = lines.filter(line => line.trim() !== '');
    if (nonEmptyLines.length === 0) {
        throw new Error('El archivo CSV está vacío');
    }
    const headers = parseCSVLine(nonEmptyLines[0]);
    if (headers.length !== columnStructure.length) {
        throw new Error(`El archivo CSV debe tener exactamente ${columnStructure.length} columnas, pero tiene ${headers.length}`);
    }
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
        const rowData = {};
        columnStructure.forEach((column, index) => {
            const value = values[index].trim();
            if (value === '') {
                throw new Error(`La fila ${lineIndex + 2}, columna "${column.name}" está vacía`);
            }
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
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        if (line[i] === '"') {
            inQuotes = !inQuotes;
        }
        else if (line[i] === ',' && !inQuotes) {
            result.push(current);
            current = '';
        }
        else {
            current += line[i];
        }
    }
    result.push(current);
    return result;
}
// Función para filtrar los datos
function filterData(data, searchTerm) {
    const filteredData = data.filter(row => Object.values(row).some(value => value.toString().toLowerCase().includes(searchTerm.toLowerCase())));
    if (filteredData.length === 0) {
        alert(`${searchTerm} no se encuentra en la base de datos`);
    }
    return filteredData;
}
// Función para paginar los datos
function paginateData(data, pageSize, pageNumber) {
    const start = (pageNumber - 1) * pageSize;
    return data.slice(start, start + pageSize);
}
//funcion para procesar los datos a graficar
function processDataForChart(data) {
    const departamentos = new Map();
    data.forEach(row => {
        const departamento = row['DEPARTAMENTO'];
        departamentos.set(departamento, (departamentos.get(departamento) || 0) + 1);
    });
    return {
        labels: Array.from(departamentos.keys()),
        values: Array.from(departamentos.values())
    };
}
function convertToCSV(data) {
    if (data.length === 0)
        return '';
    const headers = Object.keys(data[0]);
    const csvRows = [
        headers.join(','), // Encabezados
        ...data.map(row => headers.map(header => {
            var _a;
            let cell = ((_a = row[header]) === null || _a === void 0 ? void 0 : _a.toString()) || '';
            // Escapar comillas dobles y envolver en comillas si es necesario
            cell = cell.includes(',') || cell.includes('"') || cell.includes('\n')
                ? `"${cell.replace(/"/g, '""')}"`
                : cell;
            return cell;
        }).join(','))
    ];
    return csvRows.join('\n');
}
function sortData(data, column, direction) {
    return [...data].sort((a, b) => {
        let valueA = a[column];
        let valueB = b[column];
        // Convertir a número si es posible
        if (!isNaN(Number(valueA)) && !isNaN(Number(valueB))) {
            valueA = Number(valueA);
            valueB = Number(valueB);
        }
        if (valueA < valueB)
            return direction === 'asc' ? -1 : 1;
        if (valueA > valueB)
            return direction === 'asc' ? 1 : -1;
        return 0;
    });
}
export { processCSV, filterData, paginateData, processDataForChart, convertToCSV, sortData };
