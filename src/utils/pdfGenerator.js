import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateInvoicePDF = (invoice) => {
    const doc = new jsPDF();

    // Company Logo/Header (Placeholder)
    doc.setFontSize(22);
    doc.text("INVOICE", 105, 20, { align: "center" });

    doc.setFontSize(10);
    doc.text("My Company Name", 14, 30);
    doc.text("123 Business Rd", 14, 35);
    doc.text("City, State, Zip", 14, 40);

    // Invoice Details
    doc.text(`Invoice #: ${invoice.invoiceNumber}`, 140, 30);
    doc.text(`Date: ${invoice.date}`, 140, 35);
    doc.text(`PO #: ${invoice.poNumber || 'N/A'}`, 140, 40);

    // Bill To
    doc.text("Bill To:", 14, 55);
    doc.setFont("helvetica", "bold");
    doc.text(invoice.customerName, 14, 60);
    doc.setFont("helvetica", "normal");
    const splitAddress = doc.splitTextToSize(invoice.billToAddress || "", 60);
    doc.text(splitAddress, 14, 65);

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
        startY: 85,
        theme: 'grid',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [22, 33, 62] } // Match app theme color
    });

    // Total
    const finalY = doc.lastAutoTable.finalY + 10;
    const totalAmount = invoice.items.reduce((sum, item) => sum + item.lineTotal, 0);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Grand Total: $${totalAmount.toFixed(2)}`, 140, finalY);

    // Footer
    doc.setFontSize(10);
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

        // Company Logo/Header (Placeholder)
        doc.setFontSize(22);
        doc.text("INVOICE", 105, 20, { align: "center" });

        doc.setFontSize(10);
        doc.text("My Company Name", 14, 30);
        doc.text("123 Business Rd", 14, 35);
        doc.text("City, State, Zip", 14, 40);

        // Invoice Details
        doc.text(`Invoice #: ${invoice.invoiceNumber}`, 140, 30);
        doc.text(`Date: ${invoice.date}`, 140, 35);
        doc.text(`PO #: ${invoice.poNumber || 'N/A'}`, 140, 40);

        // Bill To
        doc.text("Bill To:", 14, 55);
        doc.setFont("helvetica", "bold");
        doc.text(invoice.customerName, 14, 60);
        doc.setFont("helvetica", "normal");
        const splitAddress = doc.splitTextToSize(invoice.billToAddress || "", 60);
        doc.text(splitAddress, 14, 65);

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
            startY: 85,
            theme: 'grid',
            styles: { fontSize: 9 },
            headStyles: { fillColor: [22, 33, 62] }
        });

        // Total
        const finalY = doc.lastAutoTable.finalY + 10;
        const totalAmount = invoice.items.reduce((sum, item) => sum + item.lineTotal, 0);

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(`Grand Total: $${totalAmount.toFixed(2)}`, 140, finalY);

        // Footer
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("Thank you for your business!", 105, 280, { align: "center" });
    });

    doc.save(`All_Invoices.pdf`);
};
