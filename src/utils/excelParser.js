import * as XLSX from 'xlsx';

export const parseExcelData = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

                const invoices = {};

                jsonData.forEach((row) => {
                    // Skip empty rows or rows without invoice number (assuming __EMPTY_3 is Inv#)
                    // Adjust keys based on actual data inspection:
                    // Inv #: __EMPTY_3
                    // Date: __EMPTY_2
                    // Customer: __EMPTY_8
                    // PO #: __EMPTY_15 (looks like PO#...)
                    // Item Desc: __EMPTY_18
                    // Qty: __EMPTY_19
                    // Rate/Price: __EMPTY_20

                    const invNum = row['__EMPTY_3'];
                    if (!invNum) return;

                    if (!invoices[invNum]) {
                        invoices[invNum] = {
                            invoiceNumber: invNum,
                            date: row['__EMPTY_2'],
                            customerName: row['__EMPTY_8'],
                            poNumber: row['__EMPTY_15'],
                            billToAddress: row['__EMPTY_11'] + ', ' + row['__EMPTY_12'] + ', ' + row['__EMPTY_13'] + ' ' + row['__EMPTY_14'], // Address consolidation guess
                            items: []
                        };
                    }

                    invoices[invNum].items.push({
                        description: row['__EMPTY_18'],
                        quantity: row['__EMPTY_19'],
                        unitPrice: row['__EMPTY_20'],
                        lineTotal: (Number(row['__EMPTY_19']) || 0) * (Number(row['__EMPTY_20']) || 0) // rough calc
                    });
                });

                const invoiceList = Object.values(invoices);
                resolve(invoiceList);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
};
