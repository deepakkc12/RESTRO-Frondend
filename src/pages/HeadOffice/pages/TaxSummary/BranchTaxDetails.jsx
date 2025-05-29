import TableLayout from "../../../../components/Table/TableLayout";
import { getRequest } from "../../../../services/apis/requests";
import React, { useEffect, useState } from "react";
import { convertDateFormat, formatDateToDDMMYYYY } from "../../../../utils/helper";
import { jsPDF } from "jspdf";
import "jspdf-autotable"; // Required for autoTable functionality
import { generateReport } from "./pdfGeneration";

function TaxDetails({branchCode, onBack, branchName, start = null, end = null, onChangeDate}) {

  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState(start);
  const [endDate, setendDate] = useState(end);
  const [loading, setLoading] = useState(false);
  const [branch, setBranch] = useState({});

  const getBranchDetails = async () => {
    try {
      const response = await getRequest(`branch/list/`);
      const branchDetails = response.data.find(branch => branch.Code == branchCode);
      if (!branchDetails) {
        console.error(`Branch with code ${branchCode} not found`);
        return;
      }
      setBranch(branchDetails);
    } catch (error) {
      console.error("Error fetching branch details:", error);
    }
  };

  useEffect(() => {
    getBranchDetails();
  }, [branchCode]);

  const onChangeDates = (startDate, endDate) => {
    setStartDate(startDate);
    setendDate(endDate);
    onChangeDate(startDate, endDate);
  };
  
  const headers = [
    { key: "slNo", label: "Sl.No" },
    { key: "InvoiceNo", label: "InvoiceNumber" },
    { key: "InvoiceDate", label: "InvoiceDate" },
    { key: "TotalTaxable", label: "TotalTaxable" },
    { key: "TotalTax", label: "TotalTax" },
    { key: "GrossAmount", label: "NetValue" },
  ];

  const getData = async () => {
    try {
      const today = new Date();
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);

      setLoading(true);
      const formated_startdate = startDate ? formatDateToDDMMYYYY(startDate) : formatDateToDDMMYYYY(weekAgo);
      const formated_endDate = endDate ? formatDateToDDMMYYYY(endDate) : formatDateToDDMMYYYY(today);
      
      const response = await getRequest(`ho/branch-tax-details/?startDate=${formated_startdate}&endDate=${formated_endDate}&branchCode=${branchCode}`);
      
      const formatedData = response.data.map(row => ({
        ...row,
        InvoiceDate: convertDateFormat(row.InvoiceDate)
      }));
      
      setData(formatedData);
    } catch (error) {
      console.error("Error fetching tax details:", error);
      // Handle error - maybe show a toast or set an error state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, [startDate, endDate, branchCode]); // Added branchCode to dependencies

  return (
    <div className="p-4">
      <TableLayout
        onBack={onBack}
        loading={loading}
        datePickerOptions={{
          showDatePicker: true,
          pickerType: "range",
        }}
        generateReport={() => generateReport(branch, data, startDate, endDate)}
        startDate={start}
        endDate={end}
        onDateRangeChange={onChangeDates}
        headers={headers}
        data={data}
        title={`Tax details in ${branchName}`}
      />
    </div>
  );
}

export default TaxDetails;