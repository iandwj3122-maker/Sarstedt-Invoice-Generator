import * as XLSX from 'xlsx';

export const parseExcelData = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];

                // Use header:1 to get raw array of arrays
                const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

                console.log("Parsing Excel Data: Total Rows", jsonData.length);

                const invoices = {};

                // Data starts at index 5 (Row 6 in Excel)
                // Header is at index 4 (Row 5 in Excel)
                const START_ROW_INDEX = 5;

                for (let i = START_ROW_INDEX; i < jsonData.length; i++) {
                    const row = jsonData[i];
                    if (!row || row.length === 0) continue;

                    // Column Mapping verified via debug script:
                    // Index 3: Invoice #
                    // Index 2: Date
                    // Index 8: Customer Name
                    // Index 7: PO #
                    // Address: 10, 11, 12, 13, 14

                    const invNum = row[3];
                    if (!invNum) continue;

                    if (!invoices[invNum]) {
                        // Address Construction
                        const addrParts = [
                            row[10], // Room/Suite
                            row[11], // Addr 2
                            row[12], // City
                            row[13], // State
                            row[14]  // Zip
                        ].filter(Boolean).map(s => String(s).trim()).join(', ');

                        invoices[invNum] = {
                            invoiceNumber: String(invNum),
                            date: String(row[2]),
                            customerName: String(row[8] || 'Unknown Customer'),
                            poNumber: String(row[7] || ''),
                            billToAddress: addrParts,
                            // Hardcoded Company Info
                            companyName: "SARSTEDT",
                            companyAddress: "1025 St. James Church Road",
                            companyCityState: "Newton, NC 28658",
                            items: []
                        };
                    }

                    // Strict Line Item Mapping (No Calculations)
                    // Index 16: Line #
                    // Index 17: Product #
                    // Index 18: Description
                    // Index 19: Qty
                    // Index 20: Total Amt (Direct)
                    // Index 21: Carrier
                    // Index 22: Tracking

                    const qty = Number(row[19]) || 0;
                    const totalAmt = Number(row[20]) || 0;

                    // Ensure productNum, tracking, and carrier are strings and safe
                    const productNum = (row[17] !== undefined && row[17] !== null) ? String(row[17]) : '';
                    const carrier = (row[21] !== undefined && row[21] !== null) ? String(row[21]) : '';
                    const tracking = (row[22] !== undefined && row[22] !== null) ? String(row[22]) : '';

                    invoices[invNum].items.push({
                        lineNum: row[16],
                        productNum: productNum,
                        description: String(row[18] || ''),
                        quantity: qty,
                        carrier: carrier,
                        lineTotal: totalAmt,
                        tracking: tracking
                    });
                }

                console.log("Parsed Invoices:", Object.keys(invoices).length);
                resolve(Object.values(invoices));
            } catch (error) {
                console.error("Excel Parse Error:", error);
                reject(error);
            }
        };

        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
};
