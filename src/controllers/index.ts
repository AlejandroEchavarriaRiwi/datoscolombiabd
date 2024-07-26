import { RowData, processCSV, filterData, paginateData, processDataForChart, convertToCSV } from '../models/functions.js';
import { createTable, createPagination, initializeUI, createChart, downloadCSV } from './interface.controllers.js';
let allData: RowData[] = [];
let currentPage = 1;
let filteredData: RowData[] = []; // Variable para almacenar los datos filtrados actuales
const pageSize = 15;

function goToPage(pageNumber: number) {
    currentPage = pageNumber;
    const searchInput = document.querySelector('#search') as HTMLInputElement | null;
    const searchTerm = searchInput ? searchInput.value : '';
    const filteredData = filterData(allData, searchTerm);
    displayTable(filteredData);
}

function displayTable(data: RowData[]) {
    const tableContainer = document.getElementById('table');
    const paginationContainer = document.getElementById('pagination');

    if (tableContainer && paginationContainer) {
        const paginatedData = paginateData(data, pageSize, currentPage);
        const tableHTML = createTable(paginatedData);
        tableContainer.innerHTML = tableHTML;

        const totalPages = Math.ceil(data.length / pageSize);
        const paginationHTML = createPagination(totalPages, currentPage, goToPage);
        paginationContainer.innerHTML = paginationHTML;

        // Crear y actualizar el gráfico
        const chartData = processDataForChart(data);
        createChart(chartData);
    }
}

async function handleFileUpload(file: File) {
    try {
        const content = await readCSV(file);
        allData = processCSV(content);
        currentPage = 1;
        displayTable(allData);
    } catch (error) {
        alert(error);
    }
}

function handleFilter(searchTerm: string) {
    filteredData = filterData(allData, searchTerm);
    currentPage = 1;
    displayTable(filteredData);
}

function handleExport() {
    if (filteredData.length === 0) {
        alert('No hay datos para exportar');
        return;
    }
    const csv = convertToCSV(filteredData);
    const filename = `datos_filtrados_${new Date().toISOString()}.csv`;
    downloadCSV(csv, filename);
}

async function readCSV(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result as string);
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initializeUI(handleFileUpload, handleFilter, handleExport);
});

// Asignar la función goToPage al objeto window para que esté disponible globalmente
(window as any).goToPage = goToPage;