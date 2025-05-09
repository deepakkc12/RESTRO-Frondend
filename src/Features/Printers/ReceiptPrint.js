import { Currency } from "../../utils/constants";

class ReceiptPrinterService {
    async printReceiptVoucher(receiptData, user) {
      try {
        // Generate the receipt HTML
        const receiptContent = this.generateReceiptHTML(receiptData, user);
        
        // Create a hidden iframe
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        
        // Write content to iframe
        const iframeDoc = iframe.contentWindow.document;
        iframeDoc.write(`
          <html>
            <head>
              <title>Receipt Voucher</title>
              <style>
                @page {
                  margin: 0;
                  size: 70mm auto;
                }
                body {
                  font-family: 'Courier New', monospace;
                  width: 70mm;
                  margin: 0 auto;
                  padding: 10px;
                  box-sizing: border-box;
                }
                .center { 
                  text-align: center;
                  width: 100%;
                }
                .bold { font-weight: bold; }
                .double {
                  font-size: 1.2em;
                  margin: 5px 0;
                }
                .line {
                  border-top: 1px dashed #000;
                  margin: 10px 0;
                  width: 100%;
                }
                .details { 
                  margin: 8px 0;
                  width: 100%;
                }
                .detail-row {
                  display: flex;
                  justify-content: space-between;
                  margin: 4px 0;
                  width: 100%;
                }
                .detail-label {
                  flex: 1;
                  padding-right: 10px;
                }
                .detail-value {
                  text-align: right;
                  margin-left: auto;
                  padding-right: 5px;
                  min-width: 60px;
                }
                .receipt-id {
                  font-size: 0.9em;
                  color: #666;
                }
                .customer-info {
                  margin: 8px 0;
                }
                .remarks {
                  font-style: italic;
                  margin: 8px 0;
                  word-wrap: break-word;
                }
                @media print {
                  .no-print { display: none; }
                  body { 
                    width: 70mm;
                    margin: 0 auto;
                    position: relative;
                  }
                  @page {
                    margin: 0;
                    size: 70mm auto;
                  }
                }
              </style>
            </head>
            <body>${receiptContent}</body>
          </html>
        `);
        iframeDoc.close();

        await new Promise(resolve => {
          if (iframeDoc.readyState === 'complete') {
            resolve();
          } else {
            iframe.onload = resolve;
          }
        });

        const win = iframe.contentWindow;
        try {
          win.focus();
          win.document.execCommand('print', false, null);
        } catch (e) {
          win.print();
        }

        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);

        return true;
      } catch (error) {
        console.error('Printing error:', error);
        throw error;
      }
    }
    
    generateReceiptHTML(data, user) {
      const formatAmount = (amount) => Number(amount || 0).toFixed(2);
      const formatDate = (date) => new Date(date).toLocaleString();
      const receiptId = data.receiptId || `R-${new Date().getTime().toString().slice(-6)}`;
      
      return `
        <div class="center bold double">RECEIPT VOUCHER</div>
        <div class="center">${formatDate(data.date || new Date())}</div>
        <div class="center">${user.branchName}</div>
        <div class="center">Staff: ${user.username}</div>
        
        <div class="line"></div>

        <div class="customer-info">
          <div class="center bold">Customer Details</div>
          <div class="center">${data.customerName || 'Unknown'}</div>
          <div class="center">Phone: ${data.CustomerMobile || '-'}</div>
        </div>

        <div class="line"></div>

        <div class="details">
          <div class="detail-row">
            <div class="detail-label">Payment Type</div>
            <span class="detail-value">${data.paymentTypeName || '-'}</span>
          </div>
          <div class="detail-row bold">
            <div class="detail-label">Received Amount</div>
            <span class="detail-value">${Currency} ${formatAmount(data.amount)}</span>
          </div>
          <div class="detail-row">
            <div class="detail-label">Total Due</div>
            <span class="detail-value">${Currency} ${formatAmount(data.totalDue || 0)}</span>
          </div>
          <div class="detail-row">
            <div class="detail-label">Balance</div>
            <span class="detail-value">${Currency} ${formatAmount((data.totalDue || 0) - (data.amount || 0))}</span>
          </div>
        </div>

        <div class="line"></div>
        
        <div class="details">
          <div class="center bold">Remarks</div>
          <div class="remarks center">
            ${data.remarks || 'No remarks'}
          </div>
        </div>

        <div class="line"></div>
        <div class="center">Generated on ${formatDate(new Date())}</div>
        <div class="center">Thank you for your payment!</div>
        <div class="center">End of Receipt</div>
      `;
    }
}

const receiptPrinterService = new ReceiptPrinterService();
export default receiptPrinterService;