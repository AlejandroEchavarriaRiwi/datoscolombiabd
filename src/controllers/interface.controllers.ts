import { RowData } from "../models/functions.js";

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

function createPagination(totalPages: number, currentPage: number): string {
    let paginationHTML = '<div class="pagination">';
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `<button ${i === currentPage ? 'class="active"' : ''} onclick="goToPage(${i})">${i}</button>`;
    }
    paginationHTML += '</div>';
    return paginationHTML;
}

export { createTable, createPagination };
