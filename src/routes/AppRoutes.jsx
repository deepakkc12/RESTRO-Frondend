import React from "react";
import {  Route, Routes } from "react-router-dom";
import PublicRoute from "./PublicRoute";
import PrivateRoute from "./PrivateRoute";
import {  routes } from "./RolebasedRoutes";
import { useSelector } from "react-redux";
import LoginPage from "../pages/Public/Login";

import SuperAdminLogin from "../pages/HeadOffice/Login"
import NotFound from "../pages/Public/NotFound";

import RestaurantPOS from "../pages/Private/Table/TableList";
import Menu from "../pages/Private/Menu/Menu";
import TableLayout from "../pages/Private/Table/TableLayout";
import TableLayoutBuilder from "../components/Others/TableBuilder";
import MenuDetailView from "../pages/Private/MenuDetail/MenuDetail";
// import GridBillingSystem from "../pages/Private/GridBilling/GridBilling";
import Landing from "../pages/Landing";
import CustomerBill from "../pages/Public/CustomerBill";
import DbViewer from "../pages/Public/DbViewer";
import WebhookTrigger from "../pages/Public/WebhookTest";
import APITestUI from "../pages/Public/ApiTEst";
import CustomerDisplay from "../pages/Private/CustomerPosDisplay/CustomerPosDisplay";
import WebSocketPage from "../pages/Public/Webscket";
import SalesComparisonChart from "../pages/DshBd";

function AppRoutes() {

  const user = useSelector(state=>state.auth.user); // Get the authentication status

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute restricted={false}>
            <LoginPage />
          </PublicRoute>
        }
      />
       <Route
        path="/login-ho"
        element={
          <PublicRoute restricted={false}>
            <SuperAdminLogin />
          </PublicRoute>
        }
      />

       {/* Private routes that require authentication */}
       {user &&
          routes[user.role].map((route, index) => (
            <Route
              key={index}
              path={route.path}
              element={<PrivateRoute route={route} />}
            />
          ))
          
          }

     {/* <Route path="/menu" element= {<Menu/>}/>
     <Route path="/table" element= {<TableLayout/>}/>
     <Route path="/menu-detail/:skuId" element= {<MenuDetailView/>}/> */}

     <Route path="/table-builder/:kotType" element= {<TableLayoutBuilder/>}/>
     
     <Route path="/back-display" element= {<CustomerDisplay/>}/>

     <Route path="/review/:salesId" element= {<CustomerBill/>}/>

     <Route path="/" element= {<Landing/>}/>

     <Route path="/dbview" element= {<DbViewer/>}/>
     <Route path="/hook" element= {<WebhookTrigger/>}/>
     <Route path="/test-api" element= {<APITestUI/>}/>
     <Route path="/wb" element= {<WebSocketPage/>}/>
     <Route path="/dshbd" element= {<SalesComparisonChart/>}/>

      <Route path="*" element={<LoginPage/>} />

    </Routes>
  );
}

export default AppRoutes;
