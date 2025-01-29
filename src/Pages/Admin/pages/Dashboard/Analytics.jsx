import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUp, ArrowDown, ShoppingBag, Truck, Users, DollarSign } from 'lucide-react';

const AnalyticsDashboard = () => {
  // Sample data - in real app, this would come from your backend
  const salesData = [
    { month: 'Jan', orders: 1200, revenue: 28000 },
    { month: 'Feb', orders: 1350, revenue: 32000 },
    { month: 'Mar', orders: 1500, revenue: 36000 },
    { month: 'Apr', orders: 1650, revenue: 40000 },
    { month: 'May', orders: 1800, revenue: 44000 },
    { month: 'Jun', orders: 2000, revenue: 48000 },
  ];

  const categoryData = [
    { name: 'Fruits', sales: 4200 },
    { name: 'Vegetables', sales: 3800 },
    { name: 'Dairy', sales: 3200 },
    { name: 'Beverages', sales: 2800 },
    { name: 'Snacks', sales: 2400 },
  ];

  const statsCards = [
    {
      title: "Total Orders",
      value: "2,543",
      change: "+12.5%",
      icon: ShoppingBag,
      isPositive: true,
      bgColor: "bg-primary"
    },
    {
      title: "Active Deliveries",
      value: "145",
      change: "+8.2%",
      icon: Truck,
      isPositive: true,
      bgColor: "bg-success"
    },
    {
      title: "Active Customers",
      value: "12,789",
      change: "+15.3%",
      icon: Users,
      isPositive: true,
      bgColor: "bg-info"
    },
    {
      title: "Revenue",
      value: "$48,320",
      change: "-2.4%",
      icon: DollarSign,
      isPositive: false,
      bgColor: "bg-warning"
    }
  ];

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col">
          <h1 className="h3 mb-4">Analytics Dashboard</h1>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        {statsCards.map((stat, index) => (
          <div key={index} className="col-12 col-md-6 col-lg-3">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="text-muted mb-2">{stat.title}</h6>
                    <h3 className="mb-2">{stat.value}</h3>
                    <div className="d-flex align-items-center">
                      {stat.isPositive ? 
                        <ArrowUp className="text-success" size={16} /> : 
                        <ArrowDown className="text-danger" size={16} />
                      }
                      <span className={`ms-1 ${stat.isPositive ? 'text-success' : 'text-danger'}`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className={`rounded-circle p-3 ${stat.bgColor}`}>
                    <stat.icon className="text-white" size={24} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="row g-4">
        {/* Revenue & Orders Trend */}
        <div className="col-12 col-lg-6">
          <div className="card h-100 shadow-sm">
            <div className="card-header bg-white">
              <h5 className="card-title mb-0">Revenue & Orders Trend</h5>
            </div>
            <div className="card-body">
              <div style={{ height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Line yAxisId="left" type="monotone" dataKey="orders" stroke="#0d6efd" />
                    <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#198754" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Category Performance */}
        <div className="col-12 col-lg-6">
          <div className="card h-100 shadow-sm">
            <div className="card-header bg-white">
              <h5 className="card-title mb-0">Category Performance</h5>
            </div>
            <div className="card-body">
              <div style={{ height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sales" fill="#0d6efd" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;