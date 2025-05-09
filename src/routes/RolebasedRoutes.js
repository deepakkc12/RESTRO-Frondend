import { useSelector } from "react-redux";
import Dashboard from "../pages/HeadOffice/Dashboard/Dashboard";
import BranchList from "../pages/HeadOffice/pages/Branches/BranchList/BranchList";
import BranchUsers from "../pages/HeadOffice/pages/Branches/BranchUsers";
import BranchSalesReport from "../pages/HeadOffice/pages/Branches/SalesSummery/BranchSales";
import HomeDeliveryDetails from "../pages/HeadOffice/pages/HomedeliveryReports/Details";
import HomeDeliveryReport from "../pages/HeadOffice/pages/HomedeliveryReports/HomeDeliveryReport";
import ApprovedPriceReqs from "../pages/HeadOffice/pages/PriceRevision/ApprovedRequests/ApprovedRequests";
import PendingPriceReqs from "../pages/HeadOffice/pages/PriceRevision/PendingRequests/PendingReqs";
import PurchaseSummeryReport from "../pages/HeadOffice/pages/Purchase/PurchaseSummery";
import HoSalesSummary from "../pages/HeadOffice/pages/SalesSummery/SalesSumery";
import UnBilledKotReport from "../pages/HeadOffice/pages/UnbilledKot/UnbilledKotSumery";
import V2ItemList from "../pages/HeadOffice/pages/V2Items/V2ItemsList";
import VendorList from "../pages/HeadOffice/pages/Vendors/VendorList";
import AdminPanel from "../pages/Private/AdminPanel/AdminPanel";
import CashCounterList from "../pages/Private/C-CntrList/CahsCounterList";
import CashCounter from "../pages/Private/CashCounter/CashCounter";
import ChangePassword from "../pages/Private/ChangePassword/ChangePassword";
import CloseCounter from "../pages/Private/CloseCounter/CloseCounter";
import CustomerManager from "../pages/Private/CustomerManagement/CustomerManagement";
import CustomerDisplay from "../pages/Private/CustomerPosDisplay/CustomerPosDisplay";
import DatabaseBackup from "../pages/Private/DbBackup/DbBackup";
import EanManagement from "../pages/Private/EanManagement/EanManagement";
// import CustomerPosDisplay from "../pages/Private/CustomerPosDisplay/CustomerPosDisplay"
// import GridBillingSystem from "../pages/Private/GridBilling/GridBilling";
import Home from "../pages/Private/Home/Home";
import ManiMenu from "../pages/Private/Home/Menu/Menu";
import MenuItemList from "../pages/Private/Home/Menu/MenuItems";
import InwardList from "../pages/Private/Inward/InwardList";
import Menu from "../pages/Private/Menu/Menu";
import MenuDetailView from "../pages/Private/MenuDetail/MenuDetail";
import MenuWithSideBar from "../pages/Private/MenuWithOneSideBar/NewMenuUi";
import ActiveOrders from "../pages/Private/Orders/ActiveOrders";
import PaymentList from "../pages/Private/Payments/PaymentList";
import PreferenceManager from "../pages/Private/PreferenceManager.jsx/PreferenceManager";
import PriceManagement from "../pages/Private/PriceManagement/PriceManagement";
import PrinterManagement from "../pages/Private/PrinterManagement/PrinterManager";
import ReportsDashboard from "../pages/Private/ReportDashboard/ReportDashboard";
import SettingsPage from "../pages/Private/Settings/Settings";
import TableLayout from "../pages/Private/Table/TableLayout";
import TableList from "../pages/Private/Table/TableList";
import TenderOrders from "../pages/Private/Tender/TenderOrders";
import TodaySalesList from "../pages/Private/TodaySales/TodaySales";
import UserManager from "../pages/Private/UserManager/UserManager";
import DynamicMenuWrapper from "../Features/others/DynamicMenu";
import HoTaxSummary from "../pages/HeadOffice/pages/TaxSummary/TaxSummary";
import ItemsList from "../pages/HeadOffice/pages/ProductCreation/PendingProducts/PendingProducts";
import CustomerOutwardList from "../pages/Private/CustomerOutstandings/CustomerList";



export const routes = {
  employee: [
    { path: "menu",element: DynamicMenuWrapper},
    { path: "menu/:tableCode", element: Menu },
    { path: "table", element: TableList },
    { path: "menu-detail/:skuId", element: MenuDetailView },
    // { path: "grid", element: GridBillingSystem },
    { path: "reports", element: ReportsDashboard },
    { path: "active-orders", element: ActiveOrders },
    { path: "categories", element: ManiMenu },
    { path: "category/:categoryCode", element: MenuItemList },
    { path: "home", element: Home },
    { path: "tender-list", element: TenderOrders },
    { path: "sales-list", element: TodaySalesList },
    { path: "cash-counter/:cartId", element: CashCounter },
    { path: "admin-panel", element: AdminPanel },
    { path: "preference-manager", element: PreferenceManager },
    { path: "back-display", element: CustomerDisplay },
    { path: "setings", element: SettingsPage },
    { path: "close-counter", element: CloseCounter },
    { path: "change-password", element: ChangePassword },
    { path: "ean-manager", element: EanManagement },
    { path: "printer-manager", element: PrinterManagement },
    { path: "price-manager", element: PriceManagement },
    { path: "user-manager", element: UserManager },
    { path: "customer-manager", element: CustomerManager },
    { path: "backup", element: DatabaseBackup },
    { path: "inwards", element: InwardList },
    { path: "payments", element: PaymentList },
    { path: "customer-outstanding", element: CustomerOutwardList },

    { path: "cash-counter/list", element: CashCounterList },



    // { path: "inwards", element: InwardList },



    // <Route path="/categories" element={<CategoriesPage />} />
    // <Route path="/menu/:categoryCode" element={<MenuPage />} />
  ],
  superAdmin: [
    { path: "ho/dashboard", element: Dashboard },
    { path: "ho/branch/summery", element: BranchSalesReport },
    { path: "/ho/branch/list", element: BranchList },
    { path: "/ho/branch/details", element: BranchUsers },
    { path: "/ho/purchase-summery", element: PurchaseSummeryReport },
    { path: "/ho/unbilled-kot", element: UnBilledKotReport },
    { path: "/ho/home-delivery-summery", element: HomeDeliveryReport },
    { path: "/ho/vendors/list", element: VendorList },
    { path: "/ho/approved/price-requests", element: ApprovedPriceReqs },
    { path: "/ho/pending/price-requests", element: PendingPriceReqs },
    { path: "/ho/sales-summery", element: HoSalesSummary },
    { path: "/ho/tax-summery", element: HoTaxSummary },
    { path: "/ho/product-creation", element: ItemsList },
    
    { path: "/ho/v2-items-list", element: V2ItemList },

    
    

  ],
};

export const roles = {
  employee: "employee",
  superAdmin: "superAdmin",
};
