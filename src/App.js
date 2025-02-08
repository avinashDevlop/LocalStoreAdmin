import React ,{useEffect}from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './Pages/login/Login'; // Path to your LoginPage component
import { autoOrderAssignment } from './Pages/Admin/pages/Orders/autoOrderAssignment';
//admin
import AdminLayout from "./Pages/Admin/Layout/Layout"
import AdminAnalytics from "./Pages/Admin/pages/Dashboard/Analytics"

import AddProduct from "./Pages/Admin/pages/Products/AddProduct"
import ViewProduct from "./Pages/Admin/pages/Products/ViewProducts"
import ManageCategories from './Pages/Admin/pages/Products/ManageCategorie';
import Stock from "./Pages/Admin/pages/Products/Stock"

import AppBanner from "./Pages/Admin/pages/AppSettings/AppBanner"
import CatogeryImg from "./Pages/Admin/pages/AppSettings/CatogeryImages"

import NewOrders from "./Pages/Admin/pages/Orders/NewOrders";
import AcceptedOrders from "./Pages/Admin/pages/Orders/AcceptedOrders"

import AddDeliveryPartner from "./Pages/Admin/pages/DeliveryPartner/AddDeliveryPartner";
import DeliveryPartner from "./Pages/Admin/pages/DeliveryPartner/DeliveryPartner";
 
import AddShopStore from "./Pages/Admin/pages/ShopPartner/AddShopStore";
import ShopPartners from './Pages/Admin/pages/ShopPartner/ShopPartner';

import DeliveryPartnerAccount from './Pages/Admin/pages/Accounts/DeliveryPartnerAccount';
import StorePartnerAccounts from './Pages/Admin/pages/Accounts/StoreAccount';
function App() { 

// Start the automated assignment system when your app initializes
useEffect(() => {
  autoOrderAssignment.start();
  
  // Clean up when component unmounts
  return () => {
    autoOrderAssignment.stop();
  };
}, []);

  return (
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LoginPage />} />

          {/* Private Routes */}
          <Route path="/Admin" element={  <AdminLayout /> } >
               <Route index element={<AdminAnalytics />} />
               <Route path="AdminAnalytics" element={<AdminAnalytics />} />
               <Route path="AdminAddProduct" element={<AddProduct />} />
               <Route path="AdminViewProduct" element={<ViewProduct />} />
               <Route path="AdminManageCategories" element={<ManageCategories />} />
               <Route path="AdminStock" element={<Stock />} />
               <Route path="AdminShopBanner" element={<AppBanner />} />
               <Route path="AdminCatogeryImg" element={<CatogeryImg />} />
               <Route path="NewOrders" element={<NewOrders />} />
               <Route path="AcceptedOrders" element={<AcceptedOrders />} />
               <Route path="AddDeliveryPartner" element={<AddDeliveryPartner />} />
                <Route path="DeliveryPartner" element={<DeliveryPartner />} />

                <Route path="AddShopStore" element={<AddShopStore />} />
                <Route path="ShopPartners" element={<ShopPartners />} />

                <Route path="DeliveryPartnerAccount" element={<DeliveryPartnerAccount />} />
                <Route path="StorePartnerAccounts" element={<StorePartnerAccounts />} />
          </Route>
        </Routes>
      </Router>
  );
}

export default App;
