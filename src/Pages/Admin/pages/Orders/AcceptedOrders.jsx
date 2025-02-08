import React, { useState, useEffect, useCallback } from "react";
import { Package, Truck, Clock, MapPin, CreditCard, User } from "lucide-react";

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'accepted':
      return '#1976D2'; // Blue for accepted
    case 'in progress':
      return '#FF9800'; // Orange for in progress
    case 'preparing':
      return '#9C27B0'; // Purple for preparing
    case 'ready for pickup':
      return '#4CAF50'; // Green for ready
    case 'completed':
      return '#2E7D32'; // Dark green for completed
    default:
      return '#757575'; // Grey for unknown status
  }
};

const AcceptedOrdersDialog = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [deliveryPartners, setDeliveryPartners] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDeliveryPartnerInfo = async (deliveryPartnerId) => {
    try {
      const response = await fetch(
        `https://facialrecognitiondb-default-rtdb.firebaseio.com/Accounts/DeliveryPartner/${deliveryPartnerId}/profile/personalInfo.json`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching delivery partner info for ${deliveryPartnerId}:`, error);
      return null;
    }
  };

  const fetchAcceptedOrders = useCallback(async () => {
    try {
      const response = await fetch('https://facialrecognitiondb-default-rtdb.firebaseio.com/Orders/AcceptedOrders.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      if (!data) {
        setOrders([]);
        return;
      }

      const formattedOrders = Object.keys(data).map((key) => ({
        ...data[key],
        orderId: key,
      }));

      // Fetch delivery partner information for each order
      const deliveryPartnersInfo = {};
      await Promise.all(
        formattedOrders.map(async (order) => {
          if (order.deliveryPartnerId) {
            const partnerInfo = await fetchDeliveryPartnerInfo(order.deliveryPartnerId);
            if (partnerInfo) {
              deliveryPartnersInfo[order.deliveryPartnerId] = partnerInfo;
            }
          }
        })
      );

      setDeliveryPartners(deliveryPartnersInfo);

      setOrders(formattedOrders);
      setError(null);
    } catch (error) {
      console.error("Error fetching accepted orders:", error);
      setError("Failed to load accepted orders. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAcceptedOrders();
    
    const ordersRef = new EventSource('https://facialrecognitiondb-default-rtdb.firebaseio.com/Orders/AcceptedOrders.json');
    
    ordersRef.onmessage = (event) => {
      if (event.data) {
        fetchAcceptedOrders();
      }
    };

    return () => {
      ordersRef.close();
    };
  }, [fetchAcceptedOrders]);

  if (loading) {
    return (
      <div className="container py-4">
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  const handleOpenDialog = (order) => {
    setSelectedOrder(order);
    setShowDialog(true);
  };

  if (!orders.length) {
    return (
      <div className="container py-4">
        <h4 className="mb-4">
          <span className="fs-4 fw-medium">Product /</span> Accepted Orders
        </h4>
        <div className="card shadow-sm">
          <div className="card-body text-center py-5">
            <Package size={48} className="text-muted mb-3" />
            <h5 className="text-muted">No Accepted Orders</h5>
            <p className="text-muted mb-0">There are currently no accepted orders to display.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h4 className="mb-4">
        <span className="fs-4 fw-medium">Product /</span> Accepted Orders
      </h4>

      {/* Orders Container */}
      <div className="row g-4">
        {orders.map((order) => (
          <div key={order.orderId} className="col-12">
            <div
              className="card shadow-sm h-100 cursor-pointer"
              onClick={() => handleOpenDialog(order)}
              style={{ transition: "all 0.3s ease" }}
              onMouseOver={(e) =>
                (e.currentTarget.style.transform = "translateY(-2px)")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              <div className="card-body">
                <div className="row align-items-center">
                  {/* Order ID and Status */}
                  <div className="col-md-3">
                    <h5 className="card-title mb-1">Order #{order.orderId}</h5>
                    <p className="text-muted small mb-2">
                      {new Date(order.acceptedDate || order.orderDate).toLocaleString()}
                    </p>
                    {order.deliveryPartnerId && deliveryPartners[order.deliveryPartnerId] && (
                      <div className="d-flex align-items-center mt-2">
                        <User size={16} className="me-2 text-primary" />
                        <div className="small">
                          <strong>Delivery Partner:</strong><br />
                          {deliveryPartners[order.deliveryPartnerId].firstName} {deliveryPartners[order.deliveryPartnerId].lastName}<br />
                          <span className="text-muted">{deliveryPartners[order.deliveryPartnerId].phoneNumber}</span>
                        </div>
                      </div>
                    )} 
                  </div>
                  
                  {/* Delivery Info */}
                  <div className="col-md-3">
                    <div className="d-flex align-items-center mb-2">
                      <Truck className="me-2" size={18} />
                      <span>
                        {order.delivery?.method || "Standard Delivery"}
                      </span>
                    </div>
                    {order.delivery?.estimatedTime && (
                      <div className="d-flex align-items-center text-muted small">
                        <Clock className="me-2" size={18} />
                        <span>Est. Time: {order.delivery.estimatedTime}</span>
                      </div>
                    )}
                  </div>

                  {/* Address Preview */}
                  <div className="col-md-4">
                    <div className="small">
                      {order.address && (
                        <p className="mb-0">
                          <strong>
                            {order.address.firstName} {order.address.lastName}
                          </strong>
                          <br />
                          {order.address.doorNo}, {order.address.landmark},
                          <br />
                          {order.address.street}, {order.address.area},
                          <br />
                          {order.address.city}, {order.address.district},
                          <br />
                          {order.address.state}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Total Amount and Status */}
                  <div className="col-md-2 text-md-end d-flex flex-column justify-content-center align-items-end gap-2">
                    <span
                      className="badge"
                      style={{
                        backgroundColor: getStatusColor(order.status),
                        color: '#fff'
                      }}
                    >
                      {order.status}
                    </span>
                    <div className="fs-5 fw-bold">₹{order.pricing?.total}</div>
                    <small className="text-muted">
                      {order.payment?.method || "COD"}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Dialog */}
      {showDialog && selectedOrder && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              {/* Modal Header */}
              <div className="modal-header">
                <h5 className="modal-title">Accepted Order Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDialog(false)}
                ></button>
              </div>

              {/* Modal Body */}
              <div className="modal-body">
                {/* Order Status */}
                <div 
                  className="alert d-flex align-items-center"
                  style={{ 
                    backgroundColor: getStatusColor(selectedOrder.status),
                    color: '#fff'
                  }}
                >
                  <Package className="me-3" />
                  <div>
                    <strong>Status: {selectedOrder.status}</strong>
                    <br />
                    <small>Order: #{selectedOrder.orderId}</small>
                    <br />
                    <small>UserId: {selectedOrder.userId}</small>
                  </div>
                </div>

                {/* Delivery Information */}
                <div className="card mb-4">
                  <div className="card-body">
                    <div className="d-flex">
                      <Truck className="me-3" />
                      <div>
                        <h6 className="mb-2">Delivery Information</h6>
                        <p className="mb-0">
                          <strong>Method:</strong>{" "}
                          {selectedOrder.delivery?.method || "Not specified"}
                          <br />
                          <strong>Estimated Time:</strong>{" "}
                          {selectedOrder.delivery?.estimatedTime ||
                            "Not available"}
                          <br />
                          <strong>Delivery Charge:</strong> ₹
                          {selectedOrder.delivery?.charge || "0"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                {selectedOrder.address && (
                  <div className="card mb-4">
                    <div className="card-body">
                      <div className="d-flex">
                        <MapPin className="me-3" />
                        <div>
                          <h6 className="mb-2">Shipping Address</h6>
                          <p className="mb-0">
                            <strong>
                              {selectedOrder.address.firstName}{" "}
                              {selectedOrder.address.lastName}
                            </strong>
                            <br />
                            {selectedOrder.address.doorNo},{" "}
                            {selectedOrder.address.landmark},
                            <br />
                            {selectedOrder.address.street},{" "}
                            {selectedOrder.address.area},
                            <br />
                            {selectedOrder.address.city},{" "}
                            {selectedOrder.address.district},
                            <br />
                            {selectedOrder.address.state}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <div className="card mb-4">
                  <div className="card-header">
                    <h6 className="mb-0">Order Items</h6>
                  </div>
                  <div className="list-group list-group-flush">
                    {selectedOrder.items &&
                      Object.values(selectedOrder.items).map((item, index) => (
                        <div key={index} className="list-group-item">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="mb-1">{item.name}</h6>
                              <small className="text-muted">
                                {item.category}
                              </small>
                            </div>
                            <div className="text-end">
                              <h6 className="mb-1">₹{item.totalPrice}</h6>
                              <small className="text-muted">
                                {item.quantity} {item.unit}
                              </small>
                            </div>
                          </div>
                        </div>
                      ))}

                    {/* Total Items Price */}
                    {selectedOrder.items && (
                      <div className="list-group-item">
                        <div className="d-flex justify-content-between align-items-center">
                          <h6 className="mb-0">Total Items Price:</h6>
                          <h6 className="mb-0">
                            ₹
                            {Object.values(selectedOrder.items).reduce(
                              (acc, item) => acc + item.totalPrice,
                              0
                            )}
                          </h6>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Details */}
                <div className="card">
                  <div className="card-body">
                    <div className="d-flex">
                      <CreditCard className="me-3" />
                      <div className="flex-grow-1">
                        <h6 className="mb-3">Payment Details</h6>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Subtotal</span>
                          <span>₹{selectedOrder.pricing?.subtotal}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Delivery Charge</span>
                          <span>₹{selectedOrder.pricing?.deliveryCharge}</span>
                        </div>
                        <hr />
                        <div className="d-flex justify-content-between mb-2">
                          <strong>Total Amount</strong>
                          <strong>₹{selectedOrder.pricing?.total}</strong>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span>
                            Payment Method:{" "}
                            {selectedOrder.payment?.method || "COD"}
                          </span>
                          <span>
                            <em>{selectedOrder.payment?.status}</em>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary w-100"
                  onClick={() => setShowDialog(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );    
};

export default AcceptedOrdersDialog;