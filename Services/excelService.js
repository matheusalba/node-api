const ExcelJS = require('exceljs');

async function gerarExcel(usuarios){

    const workbook = new ExcelJS.Workbook()

    const worksheet = workbook.addWorksheet('Usuários')

    worksheet.columns = [
        {header:'ID', key: 'id', width: 10 },
        {header: 'Nomeeeee', key: 'nome', width: 30 }
    ];

    worksheet.addRows(usuarios.rows);

    return workbook
}

module.exports = {
    gerarExcel
}