import React,{ useState } from 'react';
import { Outlet } from 'react-router-dom';
import OfflinePopup from '../../../OfflinePopup';
import { Offline } from 'react-detect-offline';
import NavBar from "./Components/Header";
import SideBar from "./Components/SideNav";
import './Layout.css';
const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="Layout">
      <NavBar onToggleSidebar={toggleSidebar} />
      <div className="dashboard-container">
        <div>
          <SideBar isOpen={isSidebarOpen} />
        </div>
        <div className="dashboard-content">
          <Outlet />
        </div>
      </div>
      <Offline>
        <OfflinePopup />
      </Offline>
    </div>
  );
};

export default Layout;