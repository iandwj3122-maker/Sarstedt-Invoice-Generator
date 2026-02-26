
import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import { parseExcelData } from './utils/excelParser';
import { generateInvoicePDF, generateBulkPDF } from './utils/pdfGenerator';
import './styles.css';

// Format a number as $X,XXX.XX
const formatMoney = (num) => {
  return '$' + Number(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// Format raw YYYYMMDD to M/D/YY for date range display
const formatShortDate = (rawDate) => {
  if (!rawDate || String(rawDate).length !== 8) return '';
  const str = String(rawDate);
  const m = parseInt(str.substring(4, 6), 10);
  const d = parseInt(str.substring(6, 8), 10);
  const y = str.substring(2, 4);
  return `${m}/${d}/${y}`;
};

function App() {
  const [invoices, setInvoices] = useState([]);
  const [view, setView] = useState('upload'); // 'upload', 'list', 'preview', 'totals'
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Sorting State
  const [sortField, setSortField] = useState('date'); // 'date', 'invoiceNumber', 'amount'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'

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

  // Sorting Logic
  const sortedInvoices = [...invoices].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'date') {
      // Sort chronologically using the raw YYYYMMDD strings
      comparison = String(a.rawDate || '').localeCompare(String(b.rawDate || ''));
    } else if (sortField === 'invoiceNumber') {
      comparison = String(a.invoiceNumber).localeCompare(String(b.invoiceNumber));
    } else if (sortField === 'amount') {
      const totalA = a.items.reduce((sum, item) => sum + item.lineTotal, 0);
      const totalB = b.items.reduce((sum, item) => sum + item.lineTotal, 0);
      comparison = totalA - totalB;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Invoice Forge</h1>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Processed Invoices ({invoices.length})</h2>
              <div className="sort-controls" style={{ display: 'flex', gap: '10px' }}>
                <select value={sortField} onChange={(e) => setSortField(e.target.value)} className="sort-select">
                  <option value="date">Sort by Date</option>
                  <option value="invoiceNumber">Sort by Invoice #</option>
                  <option value="amount">Sort by Amount</option>
                </select>
                <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="sort-select">
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </div>

            <div className="invoice-grid">
              {sortedInvoices.map((inv) => (
                <div key={inv.invoiceNumber} className="invoice-card" onClick={() => handleInvoiceClick(inv)}>
                  <div className="card-header">
                    <h3>#{inv.invoiceNumber}</h3>
                    <span className="date">{inv.date}</span>
                  </div>
                  <p className="customer">{inv.customerName}</p>
                  {inv.attnTo && <p className="attn-to" style={{ fontSize: '0.85em', color: '#666' }}>Attn: {inv.attnTo}</p>}
                  <p className="item-count">{inv.items.length} Items</p>
                  <p className="total">Total: {formatMoney(inv.items.reduce((sum, item) => sum + item.lineTotal, 0))}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'totals' && (() => {
          const rawDates = invoices.map(inv => String(inv.rawDate || '')).filter(d => d.length === 8).sort();
          const minDate = rawDates.length > 0 ? formatShortDate(rawDates[0]) : '';
          const maxDate = rawDates.length > 0 ? formatShortDate(rawDates[rawDates.length - 1]) : '';
          const dateRangeStr = minDate && maxDate ? `From ${minDate} to ${maxDate}` : '';
          const jobTotal = invoices.reduce((sum, inv) => sum + inv.items.reduce((s, i) => s + i.lineTotal, 0), 0);
          return (
            <div className="invoice-list-view fade-in">
              <button onClick={() => setView('list')} className="back-btn">← Back to List</button>
              <h2>Job Totals Summary</h2>
              {dateRangeStr && <p style={{ color: '#666', marginBottom: '15px' }}>{dateRangeStr}</p>}

              <div className="summary-cards">
                <div className="card">
                  <h3>Total Invoices</h3>
                  <p className="big-number">{invoices.length}</p>
                </div>
                <div className="card">
                  <h3>Total Job Value</h3>
                  <p className="big-number">
                    {formatMoney(jobTotal)}
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
                  {sortedInvoices.map((inv) => (
                    <tr key={inv.invoiceNumber} onClick={() => handleInvoiceClick(inv)} style={{ cursor: 'pointer' }}>
                      <td>{inv.invoiceNumber}</td>
                      <td>{inv.date}</td>
                      <td>{inv.customerName}</td>
                      <td>{inv.items.length}</td>
                      <td>{formatMoney(inv.items.reduce((sum, item) => sum + item.lineTotal, 0))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })()}

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
                  <p><strong>Ship To</strong></p>
                  <p>{selectedInvoice.billToAddress}</p>
                  {selectedInvoice.attnTo && (
                    <p style={{ marginTop: '5px' }}><strong>ATTN:</strong> {selectedInvoice.attnTo}</p>
                  )}
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
                      <td>{formatMoney(item.lineTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="total-section" style={{ marginTop: '30px', textAlign: 'right' }}>
                <h3 className="total">Grand Total: {formatMoney(selectedInvoice.items.reduce((sum, item) => sum + item.lineTotal, 0))}</h3>
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
