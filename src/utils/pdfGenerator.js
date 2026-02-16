import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const PRIMARY_RED = [226, 0, 26]; // #E2001A

export const generateInvoicePDF = (invoice) => {
    const doc = new jsPDF();

    // Header Background
    doc.setFillColor(...PRIMARY_RED);
    doc.rect(0, 0, 210, 30, 'F'); // Red header bar

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("INVOICE", 14, 20);

    // Reset Text Color
    doc.setTextColor(0, 0, 0);

    // Company Details
    doc.setFontSize(10);
    doc.text(invoice.companyName || "SARSTEDT", 14, 40);
    doc.text(invoice.companyAddress || "1025 St. James Church Road", 14, 45);
    doc.text(invoice.companyCityState || "Newton, NC 28658", 14, 50);

    // Invoice Details
    const rightColumnX = 140;
    doc.setFont("helvetica", "bold");
    doc.text(`Invoice #: ${invoice.invoiceNumber}`, rightColumnX, 40);
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${invoice.date}`, rightColumnX, 45);
    doc.text(`PO #: ${invoice.poNumber || 'N/A'}`, rightColumnX, 50);

    // Bill To
    doc.setFont("helvetica", "bold");
    doc.text("Bill To:", 14, 65);
    doc.setFont("helvetica", "normal");
    doc.text(invoice.customerName, 14, 72);

    const splitAddress = doc.splitTextToSize(invoice.billToAddress || "", 70);
    doc.text(splitAddress, 14, 78);

    // Table
    // "Price" removed as it is not in Excel
    const tableColumn = ["Line", "Product #", "Description", "Qty", "Carrier", "Tracking", "Total"];
    const tableRows = [];

    invoice.items.forEach(item => {
        const itemData = [
            item.lineNum || '',
            item.productNum || '',
            item.description,
            item.quantity,
            item.carrier || '',
            item.tracking || '',
            `$${item.lineTotal.toFixed(2)}`
        ];
        tableRows.push(itemData);
    });

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 95,
        theme: 'plain', // Cleaner look
        styles: {
            fontSize: 9, // Slightly smaller font to fit columns
            cellPadding: 3,
            lineColor: [220, 220, 220],
            lineWidth: 0.1
        },
        headStyles: {
            fillColor: PRIMARY_RED,
            textColor: [255, 255, 255],
            fontStyle: 'bold'
        },
        alternateRowStyles: {
            fillColor: [249, 249, 249]
        },
        columnStyles: {
            0: { cellWidth: 15 }, // Line
            1: { cellWidth: 25 }, // Product #
            2: { cellWidth: 50 }, // Description
            3: { cellWidth: 15 }, // Qty
            4: { cellWidth: 15 }, // Carrier
            5: { cellWidth: 35 }, // Tracking
            6: { cellWidth: 20 }  // Total
        }
    });

    // Total
    const finalY = doc.lastAutoTable.finalY + 15;
    const totalAmount = invoice.items.reduce((sum, item) => sum + item.lineTotal, 0);

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...PRIMARY_RED);
    doc.text(`Grand Total: $${totalAmount.toFixed(2)}`, rightColumnX, finalY);

    // Footer
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Thank you for your business!", 105, 280, { align: "center" });

    doc.save(`Invoice_${invoice.invoiceNumber}.pdf`);
};

export const generateBulkPDF = (invoices) => {
    const doc = new jsPDF();

    invoices.forEach((invoice, index) => {
        if (index > 0) {
            doc.addPage();
        }

        // Header Background
        doc.setFillColor(...PRIMARY_RED);
        doc.rect(0, 0, 210, 30, 'F');

        // Title
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text("INVOICE", 14, 20);

        // Reset Text Color
        doc.setTextColor(0, 0, 0);

        // Company Details
        doc.setFontSize(10);
        doc.text(invoice.companyName || "SARSTEDT", 14, 40);
        doc.text(invoice.companyAddress || "1025 St. James Church Road", 14, 45);
        doc.text(invoice.companyCityState || "Newton, NC 28658", 14, 50);

        // Invoice Details
        const rightColumnX = 140;
        doc.setFont("helvetica", "bold");
        doc.text(`Invoice #: ${invoice.invoiceNumber}`, rightColumnX, 40);
        doc.setFont("helvetica", "normal");
        doc.text(`Date: ${invoice.date}`, rightColumnX, 45);
        doc.text(`PO #: ${invoice.poNumber || 'N/A'}`, rightColumnX, 50);

        // Bill To
        doc.setFont("helvetica", "bold");
        doc.text("Bill To:", 14, 65);
        doc.setFont("helvetica", "normal");
        doc.text(invoice.customerName, 14, 72);

        const splitAddress = doc.splitTextToSize(invoice.billToAddress || "", 70);
        doc.text(splitAddress, 14, 78);

        // Table
        const tableColumn = ["Line", "Product #", "Description", "Qty", "Carrier", "Tracking", "Total"];
        const tableRows = [];

        invoice.items.forEach(item => {
            const itemData = [
                item.lineNum || '',
                item.productNum || '',
                item.description,
                item.quantity,
                item.carrier || '',
                item.tracking || '',
                `$${item.lineTotal.toFixed(2)}`
            ];
            tableRows.push(itemData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 95,
            theme: 'plain',
            styles: {
                fontSize: 9,
                cellPadding: 3,
                lineColor: [220, 220, 220],
                lineWidth: 0.1
            },
            headStyles: {
                fillColor: PRIMARY_RED,
                textColor: [255, 255, 255],
                fontStyle: 'bold'
            },
            alternateRowStyles: {
                fillColor: [249, 249, 249]
            },
            columnStyles: {
                0: { cellWidth: 15 }, // Line
                1: { cellWidth: 25 }, // Product #
                2: { cellWidth: 50 }, // Description
                3: { cellWidth: 15 }, // Qty
                4: { cellWidth: 15 }, // Carrier
                5: { cellWidth: 35 }, // Tracking
                6: { cellWidth: 20 }  // Total
            }
        });

        // Total
        const finalY = doc.lastAutoTable.finalY + 15;
        const totalAmount = invoice.items.reduce((sum, item) => sum + item.lineTotal, 0);

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...PRIMARY_RED);
        doc.text(`Grand Total: $${totalAmount.toFixed(2)}`, rightColumnX, finalY);

        // Footer
        doc.setTextColor(150, 150, 150);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text("Thank you for your business!", 105, 280, { align: "center" });
    });

    doc.save(`All_Invoices.pdf`);
};
