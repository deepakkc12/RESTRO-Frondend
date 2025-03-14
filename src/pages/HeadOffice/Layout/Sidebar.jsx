import React, { useState, useMemo } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { 
  ChevronDown, 
  UtensilsCrossed,
  Building2,
  Building,
  Truck,
  ReceiptText,
  OctagonX,
  ContactRound,
  BookOpenCheck,
  Weight,
  ShoppingBag
} from "lucide-react";

// Types for TypeScript support (optional)
const MENU_ITEMS = [
  {
    icon: <UtensilsCrossed size={20} />,
    text: "Dashboard",
    path: "/ho/dashboard"
  },
  {
    icon: <Weight size={20} />,
    text: "Sales Summary",
    path: "/ho/sales-summery"
  },
  {
    icon: <Building2 size={20} />,
    text: "Branch Wise Sales",
    path: "/ho/branch/summery"
  },
  {
    icon: <ReceiptText size={20} />,
    text: "Purchase Summary",
    path: "/ho/purchase-summery"
  },
  {
    icon: <OctagonX size={20} />,
    text: "Unbilled KOT Summary",
    path: "/ho/unbilled-kot"
  },
  {
    icon: <Truck size={20} />,
    text: "Homedelivery Summary",
    path: "/ho/home-delivery-summery"
  },
  {
    icon: <ContactRound size={20} />,
    text: "Vendors",
    path: "/ho/vendors/list"
  },
  {
    icon: <Building size={20} />,
    text: "Branch List",
    path: "/ho/branch/list"
  },
  {
    icon: <BookOpenCheck size={20} />,
    text: "Price Revisions",
    submenu: [
      { text: "Pending Requests", path: "/ho/pending/price-requests" },
      { text: "Approved Requests", path: "/ho/approved/price-requests" }
    ]
  },
  {
    icon: <ShoppingBag size={20} />,
    text: "V2 Items",
    path: "/ho/v2-items-list"
  }
] 

const SidebarItem = ({ 
  icon, 
  text, 
  path, 
  collapsed, 
  active, 
  children 
}) => {
  const [subMenuOpen, setSubMenuOpen] = useState(active);
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (children) {
      e.preventDefault();
      setSubMenuOpen(!subMenuOpen);
      
      const firstSubmenuPath = React.Children.toArray(children)[0]?.props?.path;
      if (firstSubmenuPath) {
        navigate(firstSubmenuPath);
      }
    }
  };

  return (
    <div className={`rounded-xl ${active ? "bg-orange-500/10" : ""} hover:bg-orange-500/5 cursor-pointer`}>
      {path ? (
        <Link to={path} className={`flex items-center px-4 py-2 ${collapsed ? "justify-center" : ""}`}>
          <div className={`p-2 rounded-full transition-colors duration-200 ${
            active ? "bg-orange-500 text-white" : "bg-orange-500/10"
          }`}>
            {icon}
          </div>
          {!collapsed && (
            <>
              <span className={`ml-2 flex-grow text-sm font-semibold ${
                active ? "text-orange-500" : "text-neutral-600"
              }`}>
                {text}
              </span>
              {children && (
                <ChevronDown
                  size={16}
                  className={`transform transition-transform duration-200 ${
                    subMenuOpen ? "rotate-180" : ""
                  }`}
                />
              )}
            </>
          )}
        </Link>
      ) : (
        <div
          className={`flex items-center px-4 py-2 ${collapsed ? "justify-center" : ""}`}
          onClick={handleClick}
        >
          <div className={`p-2 rounded-full transition-colors duration-200 ${
            active ? "bg-orange-500 text-white" : "bg-orange-500/10"
          }`}>
            {icon}
          </div>
          {!collapsed && (
            <>
              <span className={`ml-2 flex-grow text-sm font-semibold ${
                active ? "text-orange-500" : "text-neutral-600"
              }`}>
                {text}
              </span>
              {children && (
                <ChevronDown
                  size={16}
                  className={`transform transition-transform duration-200 ${
                    subMenuOpen ? "rotate-180" : ""
                  }`}
                />
              )}
            </>
          )}
        </div>
      )}
      {!collapsed && children && (
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
          subMenuOpen ? "max-h-96" : "max-h-0"
        }`}>
          {children}
        </div>
      )}
    </div>
  );
};

const SidebarSubItem = ({ text, path, active }) => (
  <Link
    to={path}
    className={`block pl-16 py-2 transition-colors duration-200 ease-in-out border-b ${
      active
        ? "text-orange-500 font-semibold"
        : "text-neutral-600 hover:text-orange-500"
    }`}
  >
    <span className={`text-sm ${active ? "font-semibold" : "font-medium"}`}>
      {text}
    </span>
  </Link>
);

const Sidebar = ({ open, collapsed, toggleSidebar }) => {
  const [hovering, setHovering] = useState(false);
  const location = useLocation();

  const menuItems = useMemo(() => MENU_ITEMS, []);

  return (
    <>
      <div
        className={`fixed inset-y-0 left-0 z-30 bg-white shadow-lg lg:relative lg:transform-none transition-all duration-300 ease-in-out h-screen flex flex-col
          ${open ? "transform translate-x-0" : "transform -translate-x-full"}
          ${collapsed ? (hovering ? "w-64" : "w-16") : "w-64"}`}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <div className={`flex-none text-center overflow-hidden border-b
          ${!collapsed || hovering ? "p-4" : "p-3"}`}>
          <div className="text-2xl font-bold text-orange-500">
            {!collapsed || hovering ? "HO" : "HO"}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-container">
          <div className="mt-2 space-y-1 px-2">
            {menuItems.map((item, index) => (
              <SidebarItem
                key={index}
                icon={item.icon}
                text={item.text}
                path={item.path}
                collapsed={collapsed && !hovering}
                active={item.path
                  ? location.pathname === item.path
                  : item.submenu?.some(subItem => location.pathname === subItem.path)
                }
              >
                {item.submenu?.map((subItem, subIndex) => (
                  <SidebarSubItem
                    key={subIndex}
                    text={subItem.text}
                    path={subItem.path}
                    active={location.pathname === subItem.path}
                  />
                ))}
              </SidebarItem>
            ))}
          </div>
        </nav>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

export default Sidebar;