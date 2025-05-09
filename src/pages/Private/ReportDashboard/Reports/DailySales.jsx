import TableLayout from "../../../../components/Table/TableLayout";
import { getRequest } from "../../../../services/apis/requests";
import { Currency } from "../../../../utils/constants";
import { formatDateToDDMMYYYY } from "../../../../utils/helper";
import DailySalesChart from "../Graphs/DailySalesGraph";
import React, { useEffect, useState } from "react";

function DailySales() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState({
    totalCash: 0,
    totalDigitalBank: 0,
    totalBillAmount: 0,
    totalCredit: 0,
    numberOfNOB: 0,
  });

  const headers = [
    { key: "slNo", label: "Sl.No" },
    { key: "InvoiceNo", label: "InvoiceNo" },
    { key: "Details", label: "Details" },
    // { key: "TableName", label: "Table"},
    // { key: "Details", label: "Details" },
    { key: "TotalBillAmount", label: "TotalBillAmount" },
    { key: "Cash", label: "Cash" },
    { key: "Digitel/Bank", label: "Digital/Bank" },
    { key: "CreditAmount", label: "Credit" },
  ];

  const [date, setDate] = useState(new Date());

  const calculateMetrics = (data) => {
    const totalCash = data.reduce((sum, item) => sum + parseFloat(item.Cash || 0), 0);
    const totalDigitalBank = data.reduce((sum, item) => sum + parseFloat(item["Digitel/Bank"] || 0), 0);
    const totalBillAmount = data.reduce((sum, item) => sum + parseFloat(item.TotalBillAmount || 0), 0);
    const totalCredit = data.reduce((sum, item) => sum + parseFloat(item.CreditAmount || 0), 0);
    const numberOfNOB = data.length;

    setMetrics({
      totalCash,
      totalDigitalBank,
      totalBillAmount,
      totalCredit,
      numberOfNOB,
    });
  };

  const getData = async () => {
    setLoading(true);
    const formated_date = date ? formatDateToDDMMYYYY(date) : formatDateToDDMMYYYY(new Date());

    console.log(formated_date);
    const response = await getRequest(`reports/daily-sales-summery/?date=${formated_date}`);

    const formatedData = response.data.map((data) => {
      return {
        ...data,
        CreditAmount: parseFloat(data.CreditAmount).toFixed(2),
      };
    });
    setData(formatedData);
    calculateMetrics(formatedData);
    setLoading(false);
  };

  const onChangeDate = (date) => {
    setDate(date);
  };

  useEffect(() => {
    getData();
    console.log(date);
  }, [date]);

  // Format currency values
  const formatCurrency = (amount) => {

    
    return Currency+amount.toFixed(2)
  };

  return (
    <div className="p-4">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Bill Amount</h3>
          <p className="text-xl font-semibold text-gray-800">{formatCurrency(metrics.totalBillAmount)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">Total NOB</h3>
          <p className="text-xl font-semibold text-gray-800">{metrics.numberOfNOB}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Cash</h3>
          <p className="text-xl font-semibold text-gray-800">{formatCurrency(metrics.totalCash)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Digital/Bank</h3>
          <p className="text-xl font-semibold text-gray-800">{formatCurrency(metrics.totalDigitalBank)}</p>
        </div>
       
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Credit</h3>
          <p className="text-xl font-semibold text-gray-800">{formatCurrency(metrics.totalCredit)}</p>
        </div>
        
      </div>

      <TableLayout
        loading={loading}
        datePickerOptions={{
          showDatePicker: true,
          pickerType: "single",
        }}
        onDateRangeChange={onChangeDate}
        headers={headers}
        data={data}
        title="Daily Sales"
      />
    </div>
  );
}

export default DailySales;