import { convertDateFormat, formatDateToDDMMYYYY } from "../../../../utils/helper";
import { jsPDF } from "jspdf";
import "jspdf-autotable"; // Required for autoTable functionality

export const generateReport = (branch, data, startDate, endDate) => {
  console.log("Generating report for branch:", branch);
  try {
    // Create PDF document with better margins
    const doc = new jsPDF('portrait', 'mm', 'a4');
    
    // Define page dimensions and margins
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - (2 * margin);
    
    // Header section - Branch Name (centered and larger)
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0); // Black text
    doc.text(branch.Name || 'Branch Name', pageWidth / 2, 25, { align: 'center' });
    
    // Address formatting
    let currentY = 32;
    if(branch.Address) {
      const addressLines = branch.Address.split(',').map(line => line.trim()).filter(line => line);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      addressLines.forEach((line) => {
        doc.text(line, pageWidth / 2, currentY, { align: 'center' });
        currentY += 4;
      });
    }
    
    // Date range information
    const fromDate = startDate ? formatDateToMalaysia(startDate) : formatDateToMalaysia(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    const toDate = endDate ? formatDateToMalaysia(endDate) : formatDateToMalaysia(new Date());
    
    currentY += 8;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Report Period: ${fromDate} to ${toDate}`, pageWidth / 2, currentY, { align: 'center' });
    currentY += 4;
    doc.text(`Duration: ${calculateDaysDifference(fromDate, toDate)} days`, pageWidth / 2, currentY, { align: 'center' });
    
    // Report title
    currentY += 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('SST Report', pageWidth / 2, currentY, { align: 'center' });
    
    // Calculate totals
    const totalTaxable = data.reduce((sum, row) => {
      const value = parseFloat(row.TotalTaxable) || 0;
      return sum + value;
    }, 0);
    
    const totalTax = data.reduce((sum, row) => {
      const value = parseFloat(row.TotalTax) || 0;
      return sum + value;
    }, 0);
    
    const totalGross = data.reduce((sum, row) => {
      const value = parseFloat(row.GrossAmount) || 0;
      return sum + value;
    }, 0);
    
    // Table starting position
    const tableStartY = currentY + 12;
    
    // Simple data table without fancy colors
    doc.autoTable({
      head: [['S.No.', 'Invoice Number', 'Invoice Date', 'Taxable Amount (RM)', 'Tax Amount (RM)', 'Gross Amount (RM)']],
      body: [
        ...data.map((row, index) => [
          (index + 1).toString(),
          row.InvoiceNo || 'N/A',
          row.InvoiceDate,
          formatCurrency(row.TotalTaxable),
          formatCurrency(row.TotalTax),
          formatCurrency(row.GrossAmount)
        ]),
        // Total row
        [
          'TOTAL',
          '',
          '',
          formatCurrency(totalTaxable),
          formatCurrency(totalTax),
          formatCurrency(totalGross)
        ]
      ],
      startY: tableStartY,
      styles: {
        fontSize: 9,
        cellPadding: 4,
        lineColor: [0, 0, 0], // Black borders
        lineWidth: 0.3,
        textColor: [0, 0, 0], // Black text
        fillColor: [255, 255, 255] // White background
      },
      headStyles: {
        fillColor: [240, 240, 240], // Light gray header
        textColor: [0, 0, 0], // Black text
        fontStyle: 'bold',
        fontSize: 9,
        cellPadding: 5,
        halign: 'center'
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 }, // S.No.
        1: { halign: 'left', cellWidth: 42 },   // Invoice Number
        2: { halign: 'center', cellWidth: 25 }, // Invoice Date
        3: { halign: 'right', cellWidth: 32 },  // Taxable Amount
        4: { halign: 'right', cellWidth: 28 },  // Tax Amount
        5: { halign: 'right', cellWidth: 32 }   // Gross Amount
      },
      // Style the total row
      didParseCell: function(data) {
        if (data.row.index === data.table.body.length - 1) {
          data.cell.styles.fillColor = [220, 220, 220]; // Light gray for total row
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.textColor = [0, 0, 0];
        }
      },
      margin: { left: margin, right: margin },
      tableWidth: contentWidth,
      theme: 'grid'
    });
    
    // Footer section
    const footerY = pageHeight - 35;
    
    // Footer separator line
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY - 8, pageWidth - margin, footerY - 8);
    
    // Footer content
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    
    const currentDate = formatDateToMalaysia(new Date());
    const branchName = branch.Name || 'Branch';
    const fileName = `Tax_Report_${sanitizeFileName(branchName)}_${currentDate.replace(/\//g, '-')}`;
    
    // Left side footer
    doc.text('This is a system-generated report.', margin, footerY);
    doc.text(`Report ID: ${fileName}`, margin, footerY + 5);
    
    // Right side footer
    doc.text('Page 1 of 1', pageWidth - margin, footerY, { align: 'right' });
    
    const footerTime = new Date().toLocaleString('en-MY', {
      timeZone: 'Asia/Kuala_Lumpur',
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    doc.text(`Generated: ${footerTime} (MYT)`, pageWidth - margin, footerY + 5, { align: 'right' });
    
    // Simple border around the page
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(12, 12, pageWidth - 24, pageHeight - 24);
    
    // Save the PDF
    doc.save(`${fileName}.pdf`);
    
    return doc;
    
  } catch (error) {
    console.error("Error generating PDF report:", error);
    alert("Error generating PDF report. Please check the console for details.");
    throw error;
  }
};

// Helper function to format date for Malaysia (DD/MM/YYYY)
const formatDateToMalaysia = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

// Helper function to format currency values
const formatCurrency = (value) => {
  const numValue = parseFloat(value) || 0;
  return numValue.toLocaleString('en-MY', {
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2
  });
};

// Helper function to sanitize filename
const sanitizeFileName = (fileName) => {
  if (!fileName) return 'Unknown';
  return fileName.replace(/[^a-zA-Z0-9\s]/g, '_').replace(/\s+/g, '_');
};

// Helper function to calculate days difference
const calculateDaysDifference = (fromDate, toDate) => {
  try {
    if (!fromDate || !toDate) return 0;
    
    // Convert DD/MM/YYYY to YYYY-MM-DD for proper parsing
    const parseDate = (dateStr) => {
      if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
          return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        }
      }
      return new Date(dateStr);
    };
    
    const from = parseDate(fromDate);
    const to = parseDate(toDate);
    
    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      return 0;
    }
    
    const timeDiff = Math.abs(to.getTime() - from.getTime());
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  } catch (error) {
    console.error('Error calculating days difference:', error);
    return 0;
  }
};