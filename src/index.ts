// controlador.ts
import { RowData, processCSV, filterData, paginateData } from './models/functions.js';
import { createTable, createPagination } from './controllers/interface.controllers.js';

let allData: RowData[] = [];
let currentPage = 1;
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
        const paginationHTML = createPagination(totalPages, currentPage);
        paginationContainer.innerHTML = paginationHTML;
    }
}

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

async function readCSV(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result as string);
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
    });
}
