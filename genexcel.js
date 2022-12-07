const Excel = require('exceljs');
const fs = require("fs");

async function readExcel() {

    let workbook = await new Excel.Workbook().xlsx.readFile(`testfile1.xlsx`);

    workbook.worksheets.forEach(worksheet => {
        let lastpart = lastPart(worksheet);
        if (lastpart === "md") {
            extractTable(workbook, worksheet.name);
        }
    })
}


function lastPart(worksheet) {
    let parts = worksheet.name.split("_");
    let lastpart = parts.length > 1 && parts.pop();
    return lastpart;
}

function extractTable(workbook, sheetName) {
    const worksheet = workbook.getWorksheet(sheetName);
    var lines = []

    const tableCols = []
    const headerCells = []
    const headerLines = []
    characterRange('A', 'X').forEach(colName => {
        let rowName = 1;
        let cellValue = getCellValue(worksheet, colName, rowName);
        if (cellValue) {
            let alignment = worksheet.getCell(`${colName}${rowName}`).style.alignment;
            if (!alignment) {
                headerLines.push("----")
            } else {
                let horizAlignment = alignment.horizontal;
                if (horizAlignment === "right") {
                    headerLines.push("----:")
                } else if (horizAlignment === "center") {
                    headerLines.push(":----:")
                } else {
                    headerLines.push("----")
                }
            }
            tableCols.push(colName)
            headerCells.push(`**${cellValue}**`)
        }
    })

    lines.push(`|${headerCells.join('|')}|`)
    lines.push(`|${headerLines.join('|')}|`)

    var row = 2;
    while (getCellValue(worksheet, `A`, row)) {
        const values = [];
        tableCols.forEach(colName => {
            values.push(getCellValue(worksheet, colName, row))
        })
        lines.push(`|${values.join('|')}|`)
        row++;
    }

    console.log("")


    /*
      line.push(cell.result)
      lines.push(line)
    */

    let md = lines.join("\n");
    console.log(md)
    console.log("done")
    const mdFilename = writeMarkdown(sheetName, md);
}


function characterRange(from = 'A', to = 'X') {
    return Array.from(String.fromCharCode(...[...Array(to.charCodeAt(0) - from.charCodeAt(0) + 1).keys()].map(i => i + from.charCodeAt(0))));
}

function getCellValue(worksheet, colName, rowName) {
    let cell = worksheet.getCell(`${colName}${rowName}`);
    var v = null;

    if (cell.formula) {
        if (cell.result) {
            v = cell.result
        }
    } else {
        v = cell.value
    }

    if (v instanceof Date) {
        const dLength = countCharInstance(cell.numFmt, "d");
        const mLength = countCharInstance(cell.numFmt, "m");
        const yLength = countCharInstance(cell.numFmt, "y");

        var fa = [];
        range(0, dLength).forEach(value => fa.push('D'))
        fa.push('.')
        range(0, mLength).forEach(value => fa.push('M'))
        fa.push('.')
        range(0, yLength).forEach(value => fa.push('Y'))

        if (cell.numFmt === 'mm-dd-yy') {
            f = "DD.MM.YYYY"
        } else {

            f = fa.join('')
        }


        v = moment(v).format(f);
    }
    if (v && Number(cell.numFmt) === 0 && !isNaN(v)) {
        let digits = cell.numFmt.split(".");
        let fractionDigits = 0;
        if (digits.length > 1) {
            fractionDigits = digits[1].length;
        }


        v = new Intl.NumberFormat('en-IN', {
            maximumFractionDigits: fractionDigits,
            minimumFractionDigits: fractionDigits
        })
            .format(v)
            .replaceAll(",", " ")
            .replaceAll(".", ",")


    }
    return v
}


function writeMarkdown(sheetName, md) {
    let mdFilename = `${sheetName}.md`;
    fs.writeFileSync(mdFilename, md);
    return mdFilename;
  }

module.exports = { readExcel }