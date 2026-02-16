
import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import { parseExcelData } from './utils/excelParser';
import { generateInvoicePDF, generateBulkPDF } from './utils/pdfGenerator';
import './styles.css';

function App() {
  const [invoices, setInvoices] = useState([]);
  const [view, setView] = useState('upload'); // 'upload', 'list', 'preview'
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

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

  const handleDownloadSingle = async (invoice) => {
    setIsGenerating(true);
    try {
      await generateInvoicePDF(invoice);
    } catch (error) {
      console.error("PDF Generation Error:", error);
      alert(`Failed to generate PDF: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadBulk = async () => {
    setIsGenerating(true);
    try {
      await generateBulkPDF(invoices);
    } catch (error) {
      console.error("Bulk PDF Generation Error:", error);
      alert(`Failed to generate bulk PDF: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Invoice Generator</h1>
        <div className="header-actions">
          {view === 'list' && (
            <>
              <button onClick={() => setView('totals')} className="nav-btn">Job Totals</button>
              <button
                onClick={handleDownloadBulk}
                className="nav-btn primary"
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Download All PDF'}
              </button>
            </>
          )}
          {view !== 'upload' && (
            <button onClick={() => setView('upload')} className="nav-btn">Upload New</button>
          )}
        </div>
      </header>

      <main className="app-content">
        {view === 'upload' && (
          <div className="upload-view fade-in">
            <div className="upload-content">
              <h2>Upload Invoice Data</h2>
              <p>Drag and drop your Excel file to get started.</p>
              <FileUpload onFileUpload={handleFileUpload} />
            </div>
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

        {view === 'totals' && (
          <div className="invoice-list-view fade-in">
            <button onClick={() => setView('list')} className="back-btn">← Back to List</button>
            <h2>Job Totals Summary</h2>

            <div className="summary-cards">
              <div className="card">
                <h3>Total Invoices</h3>
                <p className="big-number">{invoices.length}</p>
              </div>
              <div className="card">
                <h3>Total Job Value</h3>
                <p className="big-number">
                  ${invoices.reduce((sum, inv) => sum + inv.items.reduce((s, i) => s + i.lineTotal, 0), 0).toFixed(2)}
                </p>
              </div>
            </div>

            <table className="invoice-table" style={{ marginTop: '20px' }}>
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.invoiceNumber} onClick={() => handleInvoiceClick(inv)} style={{ cursor: 'pointer' }}>
                    <td>{inv.invoiceNumber}</td>
                    <td>{inv.date}</td>
                    <td>{inv.customerName}</td>
                    <td>{inv.items.length}</td>
                    <td>${inv.items.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {view === 'preview' && selectedInvoice && (
          <div className="invoice-preview-view fade-in">
            <button onClick={() => setView('list')} className="back-btn">← Back to List</button>
            <div className="preview-container">
              <div className="preview-header">
                <h2>Invoice #{selectedInvoice.invoiceNumber}</h2>
                <button
                  className="download-btn"
                  onClick={() => handleDownloadSingle(selectedInvoice)}
                  disabled={isGenerating}
                >
                  {isGenerating ? 'Generating...' : 'Download PDF'}
                </button>
              </div>

              <div className="invoice-details">
                <div>
                  <p><strong>Customer</strong></p>
                  <p>{selectedInvoice.customerName}</p>
                  <br />
                  <p><strong>Bill To</strong></p>
                  <p>{selectedInvoice.billToAddress}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p><strong>Date</strong></p>
                  <p>{selectedInvoice.date}</p>
                  <br />
                  <p><strong>PO Number</strong></p>
                  <p>{selectedInvoice.poNumber || 'N/A'}</p>
                </div>
              </div>

              <table className="invoice-table">
                <thead>
                  <tr>
                    <th>Line</th>
                    <th>Product #</th>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Carrier</th>
                    <th>Tracking</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.lineNum}</td>
                      <td>{item.productNum}</td>
                      <td>{item.description}</td>
                      <td>{item.quantity}</td>
                      <td>{item.carrier}</td>
                      <td>{item.tracking}</td>
                      <td>${item.lineTotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="total-section" style={{ marginTop: '30px', textAlign: 'right' }}>
                <h3 className="total">Grand Total: ${selectedInvoice.items.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2)}</h3>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>INTERNAL USE ONLY</p>
      </footer>
    </div>
  );
}

export default App;
