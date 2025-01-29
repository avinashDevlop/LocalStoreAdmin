import React, { useState } from 'react';

// Add Bootstrap CSS and icons in your HTML:
// <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
// <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" rel="stylesheet">

const OrdersDashboard = () => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Sample data with the expanded structure
  const orders = [
    {
      orderId: "E2DNHH",
      orderDate: "2025/January/13_01:32:31",
      status: "pending",
      address: {
        firstName: "Avinash",
        lastName: "developer",
        area: "Kancharapalem",
        city: "Pulvendula",
        district: "Kadapa",
        state: "Andhra Pradesh - 516390",
        doorNo: "45-55-77",
        street: "Kaparada",
        landmark: "Near bus stand",
        isSelected: true,
        id: "Kaparada"
      },
      delivery: {
        charge: 29,
        estimatedTime: "1-2 hours",
        method: "Normal Delivery"
      },
      items: [
        {
          name: "Onion",
          category: "Vegetables",
          description: "onions are very specie",
          price: 59,
          quantity: 1,
          totalPrice: 59,
          unit: "kg"
        },
        {
          name: "Tomato",
          category: "Vegetables",
          price: 35,
          quantity: 1,
          totalPrice: 35,
          unit: "kg"
        }
      ],
      payment: {
        method: "cod",
        status: "pending"
      },
      pricing: {
        deliveryCharge: 29,
        subtotal: 94,
        total: 123
      },
      userId: "+916304810135"
    }
  ];

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      pending: "bg-warning",
      delivered: "bg-success",
      processing: "bg-info",
      cancelled: "bg-danger"
    };
    return `badge ${statusClasses[status] || 'bg-secondary'}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString.replace(/_/g, ' '));
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRowClick = (order) => {
    setSelectedOrder(order);
    setShowDetails(true);
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch = order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${order.address.firstName} ${order.address.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="container-fluid py-4">
      {/* Header Section */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-3">
              <h4 className="mb-0">Orders Dashboard</h4>
            </div>
            <div className="col-md-9">
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-search"></i>
                    </span>
                    <input
                      type="search"
                      className="form-control"
                      placeholder="Search orders..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <select 
                    className="form-select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>S.No</th>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Delivery</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, index) => (
                  <tr key={order.orderId} className="cursor-pointer">
                    <td>{index + 1}</td>
                    <td>
                      <strong>#{order.orderId}</strong>
                    </td>
                    <td>
                      {order.address.firstName} {order.address.lastName}
                      <br />
                      <small className="text-muted">{order.userId}</small>
                    </td>
                    <td>
                      <small>{formatDate(order.orderDate)}</small>
                    </td>
                    <td>
                      <small>
                        {order.items.map(item => `${item.quantity}${item.unit} ${item.name}`).join(", ")}
                      </small>
                    </td>
                    <td>
                      <small>{order.delivery.method}</small>
                      <br />
                      <small className="text-muted">{order.delivery.estimatedTime}</small>
                    </td>
                    <td>
                      <strong>₹{order.pricing.total}</strong>
                      <br />
                      <small className="text-muted">
                        (₹{order.pricing.subtotal} + ₹{order.pricing.deliveryCharge})
                      </small>
                    </td>
                    <td>
                      <span className="text-uppercase">{order.payment.method}</span>
                      <br />
                      <small className={`badge bg-${order.payment.status === 'pending' ? 'warning' : 'success'}`}>
                        {order.payment.status}
                      </small>
                    </td>
                    <td>
                      <span className={getStatusBadgeClass(order.status)}>
                        {order.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleRowClick(order)}
                      >
                        <i className="bi bi-eye"></i> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      <div 
        className="modal fade" 
        id="orderDetailsModal" 
        tabIndex="-1"
        show={showDetails}
        onHide={() => setShowDetails(false)}
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                Order Details #{selectedOrder?.orderId}
              </h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setShowDetails(false)}
              ></button>
            </div>
            {selectedOrder && (
              <div className="modal-body">
                <div className="row g-4">
                  {/* Customer Details */}
                  <div className="col-md-6">
                    <div className="card h-100">
                      <div className="card-body">
                        <h6 className="card-title">
                          <i className="bi bi-person"></i> Customer Details
                        </h6>
                        <hr />
                        <p className="mb-1">
                          <strong>Name:</strong> {selectedOrder.address.firstName} {selectedOrder.address.lastName}
                        </p>
                        <p className="mb-1">
                          <strong>Phone:</strong> {selectedOrder.userId}
                        </p>
                        <p className="mb-1">
                          <strong>Address:</strong><br />
                          {selectedOrder.address.doorNo}, {selectedOrder.address.street}<br />
                          {selectedOrder.address.area}, {selectedOrder.address.city}<br />
                          {selectedOrder.address.district}, {selectedOrder.address.state}<br />
                          <small className="text-muted">Landmark: {selectedOrder.address.landmark}</small>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="col-md-6">
                    <div className="card h-100">
                      <div className="card-body">
                        <h6 className="card-title">
                          <i className="bi bi-bag"></i> Order Details
                        </h6>
                        <hr />
                        <p className="mb-1">
                          <strong>Order Date:</strong> {formatDate(selectedOrder.orderDate)}
                        </p>
                        <p className="mb-1">
                          <strong>Delivery Method:</strong> {selectedOrder.delivery.method}
                        </p>
                        <p className="mb-1">
                          <strong>Estimated Time:</strong> {selectedOrder.delivery.estimatedTime}
                        </p>
                        <p className="mb-1">
                          <strong>Payment Method:</strong> {selectedOrder.payment.method.toUpperCase()}
                        </p>
                        <p className="mb-1">
                          <strong>Status:</strong> 
                          <span className={getStatusBadgeClass(selectedOrder.status)} style={{marginLeft: '0.5rem'}}>
                            {selectedOrder.status.toUpperCase()}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="col-12">
                    <div className="card">
                      <div className="card-body">
                        <h6 className="card-title">
                          <i className="bi bi-cart"></i> Items
                        </h6>
                        <hr />
                        <div className="table-responsive">
                          <table className="table table-sm">
                            <thead>
                              <tr>
                                <th>Item</th>
                                <th>Category</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th>Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedOrder.items.map((item, index) => (
                                <tr key={index}>
                                  <td>
                                    {item.name}
                                    {item.description && (
                                      <small className="text-muted d-block">
                                        {item.description}
                                      </small>
                                    )}
                                  </td>
                                  <td>{item.category}</td>
                                  <td>{item.quantity}{item.unit}</td>
                                  <td>₹{item.price}</td>
                                  <td>₹{item.totalPrice}</td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot className="table-light">
                              <tr>
                                <td colSpan="4" className="text-end">
                                  <strong>Subtotal:</strong>
                                </td>
                                <td>₹{selectedOrder.pricing.subtotal}</td>
                              </tr>
                              <tr>
                                <td colSpan="4" className="text-end">
                                  <strong>Delivery Charge:</strong>
                                </td>
                                <td>₹{selectedOrder.pricing.deliveryCharge}</td>
                              </tr>
                              <tr>
                                <td colSpan="4" className="text-end">
                                  <strong>Total:</strong>
                                </td>
                                <td><strong>₹{selectedOrder.pricing.total}</strong></td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowDetails(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersDashboard;  