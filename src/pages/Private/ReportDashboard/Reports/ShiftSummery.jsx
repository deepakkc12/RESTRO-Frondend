import TableLayout from "../../../../components/Table/TableLayout";
import { getRequest } from "../../../../services/apis/requests";
import {
  convertDateFormat,
  formatDateToDDMMYYYY,
} from "../../../../utils/helper";
import DailySalesChart from "../Graphs/DailySalesGraph";
import ShiftCloseGraphs from "../Graphs/ShifCloseGraph";
import React, { useEffect, useState } from "react";

function ShiftCloseReports() {
  const [data, setData] = useState([]);

  const [loading, setLoading] = useState(false);

  const headers = [
    { key: "slNo", label: "Sl.No" },
    { key: "DOT", label: "Date" },
    { key: "TOT", label: "Time" },

    { key: "LoginCode", label: "User" },

    {
      key: "Cash",
      label: "Cash",
      style: (row) => {
        if (parseInt(row?.Cash) !== parseInt(row?.ActualCash))
          return "bg-red-500 text-white";
      },
    },
    { key: "ActualCash", label: "Actual Cash" },
    {
      key: "Card",
      label: "Card",
      style: (row) => {
        if (parseInt(row?.Card) !== parseInt(row?.ActualCard))
          return "bg-red-500 text-white";
      },
    },
    { key: "ActualCard", label: "ActualCard" },
    {
      key: "Wallet1",
      label: "Wallet1",
      style: (row) => {
        if (parseInt(row?.Wallet1) !== parseInt(row?.ActualWallet1))
          return "bg-red-500 text-white";
      },
    },
    { key: "ActualWallet1", label: "ActualWallet1" },
    {
      key: "Wallet2",
      label: "Wallet2",
      style: (row) => {
        if (parseInt(row?.Wallet2) !== parseInt(row?.ActualWallet2))
          return "bg-red-500 text-white";
      },
    },
    { key: "ActualWallet2", label: "ActualWallet2" },
    { key: "ActualSaleseBillNo", label: "SaleseBills" },

    { key: "PurchaseBillNo", label: "Purchase Bills" },
    { key: "PurchaseAmount", label: "Purchase Amount" },
    { key: "CreditPurchase", label: "Credit purchase" },
    // { key: "Card", label: "Card" },

    // { key: "Digitel/Bank", label: "Digital/Bank" },
  ];

  const [date, setDate] = useState(new Date());

  const getData = async () => {
    setLoading(true);
    const formated_date = date
      ? formatDateToDDMMYYYY(date)
      : formatDateToDDMMYYYY(new Date());

    console.log(formated_date);
    const response = await getRequest(
      `reports/shift-summery/?date=${formated_date}`
    );
    const formatedData = response.data.map((row) => ({
      ...row,
      DOT: convertDateFormat(row.DOT),
      Cash:parseFloat(row.Cash).toFixed(2),
      ActualCash:parseFloat(row.ActualCash).toFixed(2),
      ActualCard:parseFloat(row.ActualCard).toFixed(2),
      Wallet1:parseFloat(row.Wallet1).toFixed(2),
      Wallet2:parseFloat(row.Wallet2).toFixed(2),

      ActualWallet2:parseFloat(row.ActualWallet2).toFixed(2),
      PurchaseAmount:parseFloat(row.PurchaseAmount).toFixed(2),
      CreditPurchase:parseFloat(row.CreditPurchase).toFixed(2),
      ActualWallet1:parseFloat(row.ActualWallet1).toFixed(2),


    }));
    setData(formatedData);
    // setData(response.data);

    setLoading(false);
  };

  const onChangeDate = (date) => {
    setDate(date);
  };

  useEffect(() => {
    getData();
    console.log(date);
  }, [date]);
  return (
    <div className="p-4 space-y-8">
      {/* <ShiftCloseReportsChart/> */}

      <TableLayout
        loading={loading}
        datePickerOptions={{
          showDatePicker: true,
          pickerType: "single",
        }}
        onDateRangeChange={onChangeDate}
        headers={headers}
        data={data}
        title="Shift Close Reports"
      />
      {/* <ShiftCloseGraphs data={data} /> */}
    </div>
  );
}

export default ShiftCloseReports;
