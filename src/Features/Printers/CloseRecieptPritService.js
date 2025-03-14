import { Currency } from "../../utils/constants";

class ThermalPrinterService {
    async printReceipt(data, user) {
      try {
        // Generate the receipt HTML
        const receiptContent = this.generateReceiptHTML(data, user);
        
        // Create a hidden iframe
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        
        // Write content to iframe
        const iframeDoc = iframe.contentWindow.document;
        iframeDoc.write(`
          <html>
            <head>
              <title>Print Receipt</title>
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
                .difference-positive {
                  color: #008000;
                }
                .difference-negative {
                  color: #FF0000;
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
    
    generateReceiptHTML(data,user) {
      const formatAmount = (amount) => Number(amount || 0).toFixed(2);
      const calculateDifference = (actual, system) => {
        const diff = Number(actual) - Number(system);
        return {
          value: formatAmount(Math.abs(diff)),
          isPositive: diff >= 0
        };
      };

      // Calculate differences
      const cashDiff = calculateDifference(data.ActualCash, data.Cash);
      const cardDiff = calculateDifference(data.ActualCard, data.Card);
      const eWalletDiff = calculateDifference(data.ActualWallet2, data.Wallet2);
      const qrDiff = calculateDifference(data.ActualWallet1, data.Wallet1);
      
      return `
        <div class="center bold double">SHIFT CLOSING REPORT</div>
        <div class="center">${new Date().toLocaleString()}</div>
        <div class="center">${user.branchName}</div>
        <div class="center">Cashier: ${user.username}</div>
        <div class="line"></div>


        <div class="details">
          <div class="detail-row">
            <div class="detail-label">Cash Declared</div>
            <span class="detail-value">${Currency} ${formatAmount(data.Cash)}</span>
          </div>
          <div class="detail-row">
            <div class="detail-label">System Cash</div>
            <span class="detail-value">${Currency} ${formatAmount(data.ActualCash)}</span>
          </div>
          <div class="detail-row">
            <div class="detail-label">Difference</div>
            <span class="detail-value ${cashDiff.isPositive ? 'difference-positive' : 'difference-negative'}">
              ${Currency} ${cashDiff.value}
            </span>
          </div>
        </div>

        <div class="line"></div>
        <div class="details">
          <div class="detail-row">
            <div class="detail-label">Bank Declaration</div>
            <span class="detail-value">${Currency} ${formatAmount(data.Card)}</span>
          </div>
          <div class="detail-row">
            <div class="detail-label">System Bank</div>
            <span class="detail-value">${Currency} ${formatAmount(data.ActualCard)}</span>
          </div>
          <div class="detail-row">
            <div class="detail-label">Difference</div>
            <span class="detail-value ${cardDiff.isPositive ? 'difference-positive' : 'difference-negative'}">
              ${Currency} ${cardDiff.value}
            </span>
          </div>
        </div>

        <div class="line"></div>
        <div class="details">
          <div class="detail-row">
            <div class="detail-label">Declared e-Wallet</div>
            <span class="detail-value">${Currency} ${formatAmount(data.Wallet2)}</span>
          </div>
          <div class="detail-row">
            <div class="detail-label">System e-Wallet</div>
            <span class="detail-value">${Currency} ${formatAmount(data.ActualWallet2)}</span>
          </div>
          <div class="detail-row">
            <div class="detail-label">Difference</div>
            <span class="detail-value ${eWalletDiff.isPositive ? 'difference-positive' : 'difference-negative'}">
              ${Currency} ${eWalletDiff.value}
            </span>
          </div>
        </div>

        <div class="line"></div>
        <div class="details">
          <div class="detail-row">
            <div class="detail-label">Declared QR</div>
            <span class="detail-value">${Currency} ${formatAmount(data.Wallet1)}</span>
          </div>
          <div class="detail-row">
            <div class="detail-label">System QR</div>
            <span class="detail-value">${Currency} ${formatAmount(data.ActualWallet1)}</span>
          </div>
          <div class="detail-row">
            <div class="detail-label">Difference</div>
            <span class="detail-value ${qrDiff.isPositive ? 'difference-positive' : 'difference-negative'}">
              ${Currency} ${qrDiff.value}
            </span>
          </div>
        </div>



        <div class="line"></div>
        <div class="center">End of Report</div>
        <div class="center">${data.DOT}</div>
      `;
    }
}

const printerService = new ThermalPrinterService();
export default printerService;


// <div class="line"></div>
// <div class="bold">ADDITIONAL DETAILS</div>
// <div class="details">
//   <div class="detail-row">
//     <div class="detail-label">Total Sales</div>
//     <span class="detail-value">RM ${formatAmount(data.TOT)}</span>
//   </div>
//   <div class="detail-row">
//     <div class="detail-label">Actual Sales Bill No</div>
//     <span class="detail-value">${data.ActualSaleseBillNo}</span>
//   </div>
//   <div class="detail-row">
//     <div class="detail-label">Purchase Amount</div>
//     <span class="detail-value">RM ${formatAmount(data.PurchaseAmount)}</span>
//   </div>
//   <div class="detail-row">
//     <div class="detail-label">Purchase Bill No</div>
//     <span class="detail-value">${data.PurchaseBillNo}</span>
//   </div>
// </div>