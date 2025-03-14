// import { BreadCrumb } from "../Others/BreadCrumb";
import { Header } from "./Header";
import Sidebar from "./Sidebar";
import React, { useState } from "react";

const MainLayout = ({ children, user }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    if (window.innerWidth < 1200) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  return (
    <>
      <div className="min-h-screen flex bg-gray-100">
        {/* Sidebar */}
        <Sidebar
          user={user}
          open={sidebarOpen}
          collapsed={sidebarCollapsed}
          toggleSidebar={toggleSidebar}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Fixed Header */}
          <Header toggleSidebar={toggleSidebar} />

          {/* Scrollable Content Area */}
          <main className="flex-1 relative bg-[#f6f9fb]">
            <div className="absolute inset-0 overflow-y-auto">
              {/* Breadcrumb */}
              {/* <BreadCrumb /> */}
              <div className="min-h-fit rounded-lg bg-gray-100">
                <div className="bg-primary-600 min-h-[100px] max-h-[100px]">
                  <div className="flex items-center px-4 py-3">
                    <div className="flex-1"></div>
                  </div>
                </div>
              </div>
              {/* Content Container */}
              <div className="flex  rounded-lg flex-col gap-8 -mt-10 px-6 pb-10">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default MainLayout;
