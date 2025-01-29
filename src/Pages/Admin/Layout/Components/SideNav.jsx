import React, { useState } from "react";
import { IoIosArrowForward } from "react-icons/io";
import { NavLink } from "react-router-dom";
import { MdDashboard } from "react-icons/md";
import { FaBoxOpen, FaRupeeSign, FaShuttleVan } from "react-icons/fa";
import { TbReport } from "react-icons/tb";
import { RiMailSendLine } from "react-icons/ri";
import { FiSettings } from "react-icons/fi"; 
import { MdManageAccounts } from "react-icons/md";
import { AnimatePresence, motion } from "framer-motion";
import SidebarMenu from "./SidebarMenu";
import { useNavigate } from "react-router-dom";
import "./SideNavCSS.css";

const routes = [
  {
    path: "/Dashboard",
    name: "Dashboard",
    icon: <MdDashboard />,
    subRoutes: [
      {
        path: "AdminAnalytics",
        name: "Analytics",
        icon: <IoIosArrowForward />,
      },
      {
        path: "SalesOverview",
        name: "Sales Overview",
        icon: <IoIosArrowForward />,
      },
    ],
  },
  {
    name: "Products",
    icon: <FaBoxOpen />,
    subRoutes: [
      {
        path: "AdminAddProduct",
        name: "Add Product",
        icon: <IoIosArrowForward />,
      },
      {
        path: "AdminViewProduct",
        name: "View Products",
        icon: <IoIosArrowForward />,
      },
      {
        path: "AdminManageCategories",
        name: "Manage Categories",
        icon: <IoIosArrowForward />,
      },
      {
        path: "AdminStock",
        name: "Stock",
        icon: <IoIosArrowForward />,
      },
    ],
  },
  {
    name: "Orders",
    icon: <FaBoxOpen />,
    subRoutes: [
      {
        path: "NewOrders",
        name: "New Orders",
        icon: <IoIosArrowForward />,
      },
      {
        path: "AcceptedOrders",
        name: "AcceptedOrders",
        icon: <IoIosArrowForward />,
      },
      {
        path: "OutForDelivery",
        name: "Out For Delivery",
        icon: <IoIosArrowForward />,
      },
      {
        path: "DeliveredOrders",
        name: "Delivered Orders",
        icon: <IoIosArrowForward />,
      },
      {
        path: "AllOrders",
        name: "All Orders",
        icon: <IoIosArrowForward />,
      },
    ],
  },
  {
    name: "Delivery partner",
    icon: <FaShuttleVan />,
    subRoutes: [
      {
        path: "AddDeliveryPartner",
        name: "Add Partner",
        icon: <IoIosArrowForward />,
      },
      {
        path: "DeliveryPartner",
        name: "Delivery Partner",
        icon: <IoIosArrowForward />,
      },
      {
        path: "CompletedDeliveries",
        name: "Completed Deliveries",
        icon: <IoIosArrowForward />,
      },
    ],
  },
  {
    name: "Shop Partner",
    icon: <FaShuttleVan />,
    subRoutes: [
      {
        path: "AddShopStore",
        name: "Add Shop Store",
        icon: <IoIosArrowForward />,
      },
      {
        path: "ShopPartners",
        name: "Shop Partners",
        icon: <IoIosArrowForward />,
      },
      {
        path: "CompletedDeliveries",
        name: "Completed Deliveries",
        icon: <IoIosArrowForward />,
      },
    ],
  },
  {
    path: "/Finance",
    name: "Finance",
    icon: <FaRupeeSign />,
    subRoutes: [
      {
        path: "Revenue",
        name: "Revenue Overview",
        icon: <IoIosArrowForward />,
      },
      {
        path: "PaymentSettings",
        name: "Payment Settings",
        icon: <IoIosArrowForward />,
      },
    ],
  },
  {
    path: "/Support",
    name: "Support",
    icon: <RiMailSendLine />,
    subRoutes: [
      {
        path: "ViewTickets",
        name: "View Tickets",
        icon: <IoIosArrowForward />,
      },
      {
        path: "FAQs",
        name: "FAQ Management",
        icon: <IoIosArrowForward />,
      },
    ],
  },
  {
    name: "Accounts",
    icon: <MdManageAccounts />,
    subRoutes: [
      {
        path: "DeliveryPartnerAccount",
        name: "Delivery Partners",
        icon: <IoIosArrowForward />,
      },
      {
        path: "StorePartnerAccounts",
        name: "Store Accounts",
        icon: <IoIosArrowForward />,
      },
      {
        path: "CustomerAccounts",
        name: "Customer Accounts",
        icon: <IoIosArrowForward />,
      },
    ],
  },
  {
    path: "Reports",
    name: "Reports",
    icon: <TbReport />,
    subRoutes: [
      {
        path: "SalesReports",
        name: "Sales Reports",
        icon: <IoIosArrowForward />,
      },
      {
        path: "DeliveryReports",
        name: "Delivery Reports",
        icon: <IoIosArrowForward />,
      },
      {
        path: "ProductPerformanceReports",
        name: "Product Performance",
        icon: <IoIosArrowForward />,
      },
    ],
  },
  {
    name: "CustApp Settings",
    icon: <FiSettings />,
    subRoutes: [
      {
        path: "AdminShopBanner",
        name: "Shop Banner",
        icon: <IoIosArrowForward />,
      },
      {
        path: "AdminCatogeryImg",
        name: "Catogery Images",
        icon: <IoIosArrowForward />,
      },
    ],
  },
];

const SideBar = ({ isOpen, children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
    closeMenu();
  };

  const showAnimation = {
    hidden: {
      width: 0,
      opacity: 0,
      transition: {
        duration: 0.5,
      },
    },
    show: {
      opacity: 1,
      width: "auto",
      transition: {
        duration: 0.5,
      },
    },
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <div
        className={`main-container ${isOpen ? "" : "sidebar-close"}`}
        style={{ overflow: "scroll", minHeight: "92vh", maxHeight: "100%" }}
      >
        <motion.div
          animate={{
            width: isOpen ? "195px" : "50px",
            transition: {
              duration: 0.1,
              type: "spring",
              damping: 15,
            },
          }}
          className={`sidebar `}
        >
          <section className="routes">
            {routes.map((route, index) => (
              <React.Fragment key={index}>
                {route.subRoutes ? (
                  <SidebarMenu
                    route={route}
                    showAnimation={showAnimation}
                    isOpen={isOpen}
                    isMenuOpen={isMenuOpen}
                    toggleMenu={() => setIsMenuOpen(!isMenuOpen)}
                    closeMenu={closeMenu}
                  />
                ) : (
                  <NavLink
                    to={route.path}
                    className="link"
                    activeClassName="active"
                    onClick={() => handleNavigation(route.path)}
                  >
                    <div className="icon">{route.icon}</div>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          variants={showAnimation}
                          initial="hidden"
                          animate="show"
                          exit="hidden"
                          className="link_text"
                        >
                          {route.name}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </NavLink>
                )}
              </React.Fragment>
            ))}
          </section>
        </motion.div>

        <main>{children}</main>
      </div>
    </>
  );
};

export default SideBar;
