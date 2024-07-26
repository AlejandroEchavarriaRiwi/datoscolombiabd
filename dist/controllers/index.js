var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { processCSV, filterData, paginateData, processDataForChart } from '../models/functions.js';
import { createTable, createPagination, initializeUI, createChart } from './interface.controllers.js';
let allData = [];
let currentPage = 1;
const pageSize = 15;
function goToPage(pageNumber) {
    currentPage = pageNumber;
    const searchInput = document.querySelector('#search');
    const searchTerm = searchInput ? searchInput.value : '';
    const filteredData = filterData(allData, searchTerm);
    displayTable(filteredData);
}
function displayTable(data) {
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
function handleFileUpload(file) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const content = yield readCSV(file);
            allData = processCSV(content);
            currentPage = 1;
            displayTable(allData);
        }
        catch (error) {
            alert(error);
        }
    });
}
function handleFilter(searchTerm) {
    const filteredData = filterData(allData, searchTerm);
    currentPage = 1;
    displayTable(filteredData);
}
function readCSV(file) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => { var _a; return resolve((_a = event.target) === null || _a === void 0 ? void 0 : _a.result); };
            reader.onerror = (error) => reject(error);
            reader.readAsText(file);
        });
    });
}
document.addEventListener('DOMContentLoaded', () => {
    initializeUI(handleFileUpload, handleFilter);
});
// Asignar la función goToPage al objeto window para que esté disponible globalmente
window.goToPage = goToPage;
