
import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import { parseExcelData } from './utils/excelParser';
import { generateInvoicePDF, generateBulkPDF } from './utils/pdfGenerator';
import './styles.css';

function App() {
  const [invoices, setInvoices] = useState([]);
  const [view, setView] = useState('upload'); // 'upload', 'list', 'preview'
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const handleFileUpload = async (file) => {
    try {
      const data = await parseExcelData(file);
      setInvoices(data);
      setView('list');
    } catch (error) {
      console.error("Error parsing file:", error);
      alert("Error parsing Excel file. Please check the console.");
    }
  };

  const handleInvoiceClick = (invoice) => {
    setSelectedInvoice(invoice);
    setView('preview');
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Invoice Generator</h1>
        <div className="header-actions">
          {view === 'list' && (
            <button onClick={() => generateBulkPDF(invoices)} className="nav-btn primary">Download All PDF</button>
          )}
          {view !== 'upload' && (
            <button onClick={() => setView('upload')} className="nav-btn">Upload New</button>
          )}
        </div>
      </header>

      <main className="app-content">
        {view === 'upload' && (
          <div className="upload-view fade-in">
            <h2>Upload Invoice Data</h2>
            <FileUpload onFileUpload={handleFileUpload} />
          </div>
        )}

        {view === 'list' && (
          <div className="invoice-list-view fade-in">
            <h2>Processed Invoices ({invoices.length})</h2>
            <div className="invoice-grid">
              {invoices.map((inv) => (
                <div key={inv.invoiceNumber} className="invoice-card" onClick={() => handleInvoiceClick(inv)}>
                  <div className="card-header">
                    <h3>#{inv.invoiceNumber}</h3>
                    <span className="date">{inv.date}</span>
                  </div>
                  <p className="customer">{inv.customerName}</p>
                  <p className="item-count">{inv.items.length} Items</p>
                  <p className="total">Total: ${inv.items.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'preview' && selectedInvoice && (
          <div className="invoice-preview-view fade-in">
            <button onClick={() => setView('list')} className="back-btn">← Back to List</button>
            <div className="preview-container">
              <div className="preview-header">
                <h2>Invoice #{selectedInvoice.invoiceNumber}</h2>
                <button className="download-btn" onClick={() => generateInvoicePDF(selectedInvoice)}>Download PDF</button>
              </div>

              <div className="invoice-details">
                <p><strong>Date:</strong> {selectedInvoice.date}</p>
                <p><strong>Customer:</strong> {selectedInvoice.customerName}</p>
                <p><strong>Address:</strong> {selectedInvoice.billToAddress}</p>
              </div>

              <table className="invoice-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.description}</td>
                      <td>{item.quantity}</td>
                      <td>{item.unitPrice}</td>
                      <td>{item.lineTotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
