import jsPDF from 'jspdf';
import 'jspdf-autotable';

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

    // Company Details (Should be customized)
    doc.setFontSize(10);
    doc.text("My Company Name", 14, 40);
    doc.text("123 Business Rd", 14, 45);
    doc.text("City, State, Zip", 14, 50);

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
    const tableColumn = ["Description", "Quantity", "Unit Price", "Total"];
    const tableRows = [];

    invoice.items.forEach(item => {
        const itemData = [
            item.description,
            item.quantity,
            `$${Number(item.unitPrice).toFixed(2)}`,
            `$${item.lineTotal.toFixed(2)}`
        ];
        tableRows.push(itemData);
    });

    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 95,
        theme: 'plain', // Cleaner look
        styles: {
            fontSize: 10,
            cellPadding: 4,
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
        doc.text("My Company Name", 14, 40);
        doc.text("123 Business Rd", 14, 45);
        doc.text("City, State, Zip", 14, 50);

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
        const tableColumn = ["Description", "Quantity", "Unit Price", "Total"];
        const tableRows = [];

        invoice.items.forEach(item => {
            const itemData = [
                item.description,
                item.quantity,
                `$${Number(item.unitPrice).toFixed(2)}`,
                `$${item.lineTotal.toFixed(2)}`
            ];
            tableRows.push(itemData);
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 95,
            theme: 'plain',
            styles: {
                fontSize: 10,
                cellPadding: 4,
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
