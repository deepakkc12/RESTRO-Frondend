import AdminPanelHeader from "../../../components/Headers/AdminPanelHeader";
import ReportHeader from "../../../components/Headers/ReportHeader";
import DailySalesChart from "./Graphs/DailySalesGraph";
import BearerWiseReport from "./Reports/BearerWise";
import CreditSaleReports from "./Reports/CreditSale/CreditSaleReports";
import DailySales from "./Reports/DailySales";
import Homedelivery from "./Reports/Homedelivery/HomeDelivery";
import HomedeliverySummery from "./Reports/Homedelivery/Summery";
import InvoiceDetails from "./Reports/InvoiceDetails";
import ItemWiseReport from "./Reports/ItemWiseReport";
import ItemReport from "./Reports/ItemWiseReport";
import ShiftCloseReports from "./Reports/ShiftSummery";
import DailyTableWiseSales from "./Reports/TableWiseSummery";
import {
  BarChart2,
  Clipboard,
  DollarSign,
  Users,
  Briefcase,
  ShieldCheck,
  FileText,
  TrendingUp,
  Menu,
  X,
  Truck,
  CreditCard,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

// Placeholder components for reports
const NotConfiguredReport = ({ reportName }) => (
  <div className="p-6 flex flex-col items-center justify-center text-center">
    <h2 className="text-2xl font-semibold text-gray-600 mb-4">
      Report Not Configured
    </h2>
    <p className="text-gray-500">{`"${reportName}" is currently under development.`}</p>
  </div>
);
const ReportCategories = [
  {
    id: "sales",
    name: "Sales Reports",
    icon: BarChart2,
    subReports: [
      {
        name: "Shift Close Report",
        Component: ShiftCloseReports,
        isVisible: true,
      },
      {
        name: "Daily Table wise Summary",
        Component: DailyTableWiseSales,
        isVisible: true,
      },
      {
        name: "Daily Sales",
        Component: DailySales,
        isVisible: true,
      },
      {
        name: "Invoice Details",
        Component: InvoiceDetails,
        isVisible: true,
      },
      {
        name: "Item Wise Report",
        Component: ItemReport,
        isVisible: true,
      },
      {
        name: "Bearer Wise Report",
        Component: BearerWiseReport,
        isVisible: true,
      },
      
    ],
  },
  
  {
    id: "homedelivery",
    name: "Homedelivery Reports",
    icon: Truck,
    subReports: [
      {
        name: "Homedelivery Summery",
        Component:HomedeliverySummery ,
        isVisible: true,
      },
      {
        name: "Homedelivery Reports",
        Component:Homedelivery ,
        isVisible: true,
      },
      
    ],
  },
  {
    id: "creditsale",
    name: "Credit Sale Reports",
    icon: CreditCard,
    subReports: [
      {
        name: "Credit sale Reports",
        Component: CreditSaleReports,
        isVisible: true,
      },
      
    ],
  },
  {
    id: "inventory",
    name: "Inventory Reports",
    icon: Clipboard,
    subReports: [
      {
        name: "Stock Usage Report",
        Component: null,
        isVisible: true,
      },
      {
        name: "Stock Level Report",
        Component: null,
        isVisible: true,
      },
      {
        name: "Wastage Report",
        Component: null,
        isVisible: true,
      },
      {
        name: "Purchase and Vendor Report",
        Component: null,
        isVisible: true,
      },
    ],
  },

  {
    id: "financial",
    name: "Financial Reports",
    icon: DollarSign,
    subReports: [
      {
        name: "Tax Reports",
        Component: null,
        isVisible: true,
      },
      {
        name: "Expense Report",
        Component: null,
        isVisible: true,
      },
      {
        name: "Payment Mode Reports",
        Component: null,
        isVisible: true,
      },
    ],
  },
  {
    id: "customer",
    name: "Customer Reports",
    icon: Users,
    subReports: [
      {
        name: "Customer Feedback Report",
        Component: null,
        isVisible: true,
      },
      {
        name: "Loyalty Program Reports",
        Component: null,
        isVisible: true,
      },
      {
        name: "Repeat Customers Report",
        Component: null,
        isVisible: true,
      },
    ],
  },
  {
    id: "employee",
    name: "Employee Performance",
    icon: Briefcase,
    subReports: [
      {
        name: "Order Handling Report",
        Component: null,
        isVisible: true,
      },
      {
        name: "Tips Report",
        Component: null,
        isVisible: true,
      },
    ],
  },
  {
    id: "operational",
    name: "Operational Reports",
    icon: TrendingUp,
    subReports: [
      {
        name: "Table Turnover Report",
        Component: null,
        isVisible: true,
      },
      {
        name: "Order Time Report",
        Component: null,
        isVisible: true,
      },
      {
        name: "Kitchen Performance Report",
        Component: null,
        isVisible: true,
      },
    ],
  },
  {
    id: "audit",
    name: "Audit & Security",
    icon: ShieldCheck,
    subReports: [
      {
        name: "Void/Cancelled Order Report",
        Component: null,
        isVisible: true,
      },
      {
        name: "Cash Drawer Report",
        Component: null,
        isVisible: true,
      },
      {
        name: "Shift Reports",
        Component: null,
        isVisible: true,
      },
    ],
  },
];

const ReportsDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState(() => {
    const categoryParam = searchParams.get("category");
    return categoryParam &&
      ReportCategories.find((cat) => cat.id === categoryParam)
      ? categoryParam
      : ReportCategories[0].id;
  });
  const [selectedSubReport, setSelectedSubReport] = useState(() => {
    const reportParam = searchParams.get("report");
    const category = ReportCategories.find(
      (cat) => cat.id === selectedCategory
    );
    return reportParam &&
      category?.subReports.find((sub) => sub.name === reportParam)
      ? reportParam
      : category?.subReports[0].name;
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    setSearchParams({
      category: selectedCategory,
      report: selectedSubReport,
    });
  }, [selectedCategory, selectedSubReport, setSearchParams]);

  const handleSelectedCategory = (categoryId) => {
    setSelectedCategory(categoryId);
    const category = ReportCategories.find((cat) => cat.id === categoryId);
    const subCategory = category.subReports[0].name;
    setSelectedSubReport(subCategory);
  };

  const renderReportContent = () => {
    if (!selectedSubReport) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div>
            <h2 className="text-2xl font-semibold">Customize Your Report</h2>
            <p>Select a report category and specific report to get started</p>
          </div>
        </div>
      );
    }

    const selectedCategory = ReportCategories.find((cat) =>
      cat.subReports.some((sub) => sub.name === selectedSubReport)
    );

    const selectedReportConfig = selectedCategory?.subReports.find(
      (sub) => sub.name === selectedSubReport
    );

    if (selectedReportConfig?.Component) {
      const ReportComponent = selectedReportConfig.Component;
      return <ReportComponent />;
    }

    return <NotConfiguredReport reportName={selectedSubReport} />;
  };

  useEffect(() => {
    const categoryParam = searchParams.get("category");
    const reportParam = searchParams.get("report");

    if (categoryParam) {
      const category = ReportCategories.find((cat) => cat.id === categoryParam);
      if (category) {
        setSelectedCategory(categoryParam);
        if (reportParam) {
          const subReport = category.subReports.find(
            (sub) => sub.name === reportParam
          );
          if (subReport) {
            setSelectedSubReport(reportParam);
          }
        }
      }
    }
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-green-50 flex flex-col">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white z-50">
        {/* Add your ReportHeader content here */}
        <AdminPanelHeader />
      </header>

      {/* Main container with fixed sidebar and scrollable content */}
      <div className="flex flex-1 mt-16">
        {/* Hamburger Menu Toggle */}
        <button
          onClick={toggleSidebar}
          className="fixed z-50 top-4 left-4 bg-green-100 shadow-md rounded-full p-2 hover:bg-green-200 transition-all"
        >
          {isSidebarOpen ? (
            <X className="w-6 h-6 text-green-700" />
          ) : (
            <Menu className="w-6 h-6 text-green-700" />
          )}
        </button>

        {/* Fixed Sidebar */}
        <aside
          className={`fixed top-16 bottom-0 w-48 border-r border-green-200 bg-white py-4 flex flex-col transition-all duration-300 ease-in-out z-40 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <nav className="flex-1 flex flex-col items-center space-y-2 overflow-y-auto">
            {ReportCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  handleSelectedCategory(category.id);
                }}
                className={`w-full p-3 rounded-lg transition-all duration-200 group relative flex items-center space-x-2 ${
                  selectedCategory === category.id
                    ? "bg-green-100 text-green-700"
                    : "text-green-800 hover:bg-green-50"
                }`}
              >
                <category.icon className="w-5 h-5 text-green-600" />
                <span className="text-sm font-semibold truncate">
                  {category.name}
                </span>
                {selectedCategory === category.id && (
                  <div className="absolute right-0 w-1 h-8 bg-green-600 rounded-l-full transform -translate-y-1/2" />
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content area - scrollable */}
        <main
          className={`absolute inset-y-0 top-16 right-0 left-0 overflow-y-auto transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "left-48" : "left-0"
          } p-6 bg-green-25`}
        >
          {/* Sub-reports section */}
          <div className="mb-6 flex space-x-4 overflow-x-auto pb-4  top-0 bg-green-25 z-30">
            {ReportCategories.find(
              (cat) => cat.id === selectedCategory
            )?.subReports.map((subReport) => (
              <button
                key={subReport.name}
                onClick={() => setSelectedSubReport(subReport.name)}
                className={`px-4 py-2 rounded-lg transition-all duration-200 whitespace-nowrap ${
                  selectedSubReport === subReport.name
                    ? "bg-green-600 text-white"
                    : "bg-white text-green-800 hover:bg-green-100 shadow-sm border border-green-200"
                }`}
              >
                {subReport.name}
              </button>
            ))}
          </div>

          {/* Report content area */}
          <div className="bg-white rounded-lg shadow-md border border-green-100 min-h-[calc(100vh-250px)]">
            {renderReportContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReportsDashboard;
