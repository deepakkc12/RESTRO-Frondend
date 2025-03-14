import React, { useEffect, useState } from "react";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell,
  ComposedChart,
  Area,
  ResponsiveContainer 
} from 'recharts';
import TableLayout from "../../../../../components/Table/TableLayout";
import { getRequest } from "../../../../../services/apis/requests";
import { formatDateToDDMMYYYY } from "../../../../../utils/helper";
import MainLayout from "../../../Layout/Layout";

function BranchSalesList() {
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setendDate] = useState(null);
  const [loading, setLoading] = useState(false);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const onChangeDate = (startDate, endDate) => {
    setStartDate(startDate);
    setendDate(endDate);
  };

  const headers = [
    { key: "Branch", label: "Branch" },
    { key: "InvoiceNo", label: "Invoice No" },
    { key: "InvoiceDate", label: "Invoice Date" },
    { key: "VoucherType", label: "Voucher Type" },
    { key: "PartyName", label: "Party Name" },
    { key: "Qty", label: "Quantity" },
    { key: "TotalBillAmount", label: "Total Bill Amount" }
  ];

  const getData = async () => {
    setLoading(true);

    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);

    const formated_startdate = startDate
      ? formatDateToDDMMYYYY(startDate)
      : formatDateToDDMMYYYY(weekAgo);
    const formated_endDate = endDate
      ? formatDateToDDMMYYYY(endDate)
      : formatDateToDDMMYYYY(today);

    const response = await getRequest(
      `ho/branch-wise-sales/?startDate=${formated_startdate}&endDate=${formated_endDate}`
    );

    const dataArray = Object.values(response.data).filter(item => typeof item === 'object');
    setData(dataArray);
    setLoading(false);
  };

  const prepareBranchSalesSummary = () => {
    const branchSalesSummary = data.reduce((acc, item) => {
      const existingBranch = acc.find(b => b.Branch === item.Branch);
      if (existingBranch) {
        existingBranch.TotalBillAmount += parseFloat(item.TotalBillAmount) || 0;
        existingBranch.Qty += parseFloat(item.Qty) || 0;
        existingBranch.Invoices += 1;
      } else {
        acc.push({
          Branch: item.Branch,
          TotalBillAmount: parseFloat(item.TotalBillAmount) || 0,
          Qty: parseFloat(item.Qty) || 0,
          Invoices: 1
        });
      }
      return acc;
    }, []);

    return branchSalesSummary;
  };

  const preparePartyTypeSummary = () => {
    return data.reduce((acc, item) => {
      const existingParty = acc.find(p => p.PartyName === item.PartyName);
      if (existingParty) {
        existingParty.TotalAmount += parseFloat(item.TotalBillAmount) || 0;
        existingParty.Qty += parseFloat(item.Qty) || 0;
      } else {
        acc.push({
          PartyName: item.PartyName,
          TotalAmount: parseFloat(item.TotalBillAmount) || 0,
          Qty: parseFloat(item.Qty) || 0
        });
      }
      return acc;
    }, []);
  };

  useEffect(() => {
    getData();
  }, [startDate, endDate]);
  
  const branchSalesSummary = prepareBranchSalesSummary();
  const partyTypeSummary = preparePartyTypeSummary();

  return (
    <MainLayout>
      <div className="p-4 space-y-6">
        
    
        <TableLayout
          loading={loading}
          datePickerOptions={{
            showDatePicker: true,
            pickerType: "range",
          }}
          onDateRangeChange={onChangeDate}
          headers={headers}
          data={data}
          title="Branch wise sales"
        />
      </div>
    </MainLayout>
  );
}

export default BranchSalesList;