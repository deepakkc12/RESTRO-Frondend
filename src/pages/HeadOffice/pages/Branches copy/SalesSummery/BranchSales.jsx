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

function BranchSalesDashboard() {
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
        
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Branch Sales Bar Chart */}
          <div className="border col-span-2 bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-4">Total Sales by Branch</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={branchSalesSummary}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="Branch" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="TotalBillAmount" fill="#8884d8" name="Total Sales" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Branch Quantity Pie Chart */}
          <div className="border bg-white rounded-lg shadow-md p-4">
  <h2 className="text-lg font-semibold mb-4">Quantity Sold by Branch</h2>
  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie
        data={branchSalesSummary}
        cx="50%"
        cy="50%"
        labelLine={true}
        label={({ Branch, percent }) => `${Branch} (${(percent * 100).toFixed(0)}%)`}
        outerRadius={80}
        fill="#8884d8"
        dataKey="Qty"
      >
        {branchSalesSummary.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      {/* Customizing Tooltip */}
      <Tooltip
        formatter={(value, name, props) => [`${value}`, ` ${props.payload.Branch}`]}
        labelFormatter={(label) => ` ${label}`}
      />
      {/* Customizing Legend */}
      <Legend
        formatter={(value, entry) => entry.payload.Branch || value}
      />
    </PieChart>
  </ResponsiveContainer>
</div>


          {/* Party Type Sales Composition Chart */}
          {/* <div className="border rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-4">Sales by Party Type</h2>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={partyTypeSummary}>
                <XAxis dataKey="PartyName" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="TotalAmount" fill="#8884d8" stroke="#8884d8" />
                <Bar dataKey="Qty" barSize={20} fill="#413ea0" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Branch Invoice Count */}
          {/* <div className="border rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-4">Invoices by Branch</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={branchSalesSummary}>
                <XAxis dataKey="Branch" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Line type="monotone" dataKey="Invoices" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </div>  */}
        </div>
        <TableLayout
          loading={loading}
          datePickerOptions={{
            showDatePicker: true,
            pickerType: "range",
          }}
          onDateRangeChange={onChangeDate}
          headers={headers}
          data={data}
          title="Sales Dashboard"
        />
      </div>
    </MainLayout>
  );
}

export default BranchSalesDashboard;