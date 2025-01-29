import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import api from '../../../../api';

const DeliveryPartnerTable = () => {
  const [partners, setPartners] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeliveryPartners();
  }, []);

  const fetchDeliveryPartners = async () => {
    try {
      const response = await api.get('Accounts/DeliveryPartner.json');
      if (response.data) {
        const partnersArray = Object.entries(response.data).map(([phoneNumber, data]) => {
          // Ensure profile data exists
          const profile = data.profile || {};
          
          // Create safe order stats with default values
          const orderStats = {
            rejected: 0,
            cancelled: 0,
            total: 0,
            ...(data.orders || {}) // Merge existing order data if available
          };

          return {
            phoneNumber,
            ...profile,
            orderStats
          };
        });
        setPartners(partnersArray);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching delivery partners:', error);
      setLoading(false);
    }
  };

  const handleViewDetails = (partner) => {
    setSelectedPartner(partner);
    setShowModal(true);
  };

  const StatusBadge = ({ status }) => {
    const getBadgeClass = () => {
      switch (status?.toLowerCase()) {
        case 'online':
          return 'bg-success';
        case 'offline':
          return 'bg-secondary';
        case 'busy':
          return 'bg-warning';
        default:
          return 'bg-secondary';
      }
    };

    return (
      <span className={`badge ${getBadgeClass()}`}>
        {status || 'Offline'}
      </span>
    );
  };

  const DetailsModal = ({ partner, show, onHide }) => {
    if (!partner) return null;

    const {
      documents = {},
      personalInfo = {},
      address = {},
      vehicleInfo = {},
      orderStats = {}
    } = partner;

    return (
      <Modal show={show} onHide={onHide} size="lg">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>Partner Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Personal Information */}
          <div className="card mb-3">
            <div className="card-header bg-light">
              <h5 className="mb-0">
                <i className="bi bi-person-fill me-2"></i>
                Personal Information
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4 text-center mb-3">
                  <img 
                    src={documents.profileImage} 
                    alt="Profile" 
                    className="rounded-circle"
                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                  />
                </div>
                <div className="col-md-8">
                  <p><strong>Name:</strong> {personalInfo.firstName} {personalInfo.lastName}</p>
                  <p><strong>Email:</strong> {personalInfo.email || 'Not provided'}</p>
                  <p><strong>Phone:</strong> {personalInfo.phoneNumber}</p>
                  <p><strong>Emergency Contact:</strong> {personalInfo.emergencyContact}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Statistics */}
          <div className="card mb-3">
            <div className="card-header bg-light">
              <h5 className="mb-0">
                <i className="bi bi-graph-up me-2"></i>
                Order Statistics
              </h5>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-md-4">
                  <div className="border rounded p-3">
                    <h6>Total Orders</h6>
                    <h3 className="text-primary">{orderStats.total || 0}</h3>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="border rounded p-3">
                    <h6>Rejected Orders</h6>
                    <h3 className="text-danger">{orderStats.rejected || 0}</h3>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="border rounded p-3">
                    <h6>Cancelled Orders</h6>
                    <h3 className="text-warning">{orderStats.cancelled || 0}</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Address Details */}
          <div className="card mb-3">
            <div className="card-header bg-light">
              <h5 className="mb-0">
                <i className="bi bi-geo-alt-fill me-2"></i>
                Address Details
              </h5>
            </div>
            <div className="card-body">
              <p><strong>Street:</strong> {address.street || 'N/A'}</p>
              <p><strong>City:</strong> {address.city || 'N/A'}</p>
              <p><strong>ZIP Code:</strong> {address.zipCode || 'N/A'}</p>
            </div>
          </div>

          {/* Vehicle Details */}
          <div className="card mb-3">
            <div className="card-header bg-light">
              <h5 className="mb-0">
                <i className="bi bi-truck me-2"></i>
                Vehicle Details
              </h5>
            </div>
            <div className="card-body">
              <p><strong>Vehicle Type:</strong> {vehicleInfo.vehicleType || 'N/A'}</p>
              <p><strong>Vehicle Number:</strong> {vehicleInfo.vehicleNumber || 'N/A'}</p>
              <p><strong>License Number:</strong> {vehicleInfo.licenseNumber || 'N/A'}</p>
            </div>
          </div>

          {/* Documents */}
          <div className="card mb-3">
            <div className="card-header bg-light">
              <h5 className="mb-0">
                <i className="bi bi-file-earmark-text-fill me-2"></i>
                Documents
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4 mb-3">
                  <p><strong>Driving License</strong></p>
                  {documents.drivingLicense ? (
                    <a href={documents.drivingLicense} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-primary">
                      <i className="bi bi-eye-fill me-2"></i>View
                    </a>
                  ) : (
                    <span className="text-muted">Not available</span>
                  )}
                </div>
                <div className="col-md-4 mb-3">
                  <p><strong>ID Proof</strong></p>
                  {documents.idProof ? (
                    <a href={documents.idProof} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-primary">
                      <i className="bi bi-eye-fill me-2"></i>View
                    </a>
                  ) : (
                    <span className="text-muted">Not available</span>
                  )}
                </div>
                <div className="col-md-4 mb-3">
                  <p><strong>Vehicle Registration</strong></p>
                  {documents.vehicleRegistration ? (
                    <a href={documents.vehicleRegistration} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-primary">
                      <i className="bi bi-eye-fill me-2"></i>View
                    </a>
                  ) : (
                    <span className="text-muted">Not available</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-secondary" onClick={onHide}>
            Close
          </button>
        </Modal.Footer>
      </Modal>
    );
  };

  return (
    <div className="container-fluid bg-light min-vh-100 py-5">
      <div className="row mb-4">
        <div className="col">
          <h4>
            <span className="fs-4 fw-medium">Delivery Partner /</span> View Partners
          </h4>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>SI No.</th>
                    <th>Profile Photo</th>
                    <th>Name</th>
                    <th>Phone Number</th>
                    <th className="text-center">Rejected</th>
                    <th className="text-center">Cancelled</th>
                    <th className="text-center">Orders</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {partners.map((partner, index) => {
                    const { documents = {}, personalInfo = {}, orderStats = {} } = partner;
                    
                    return (
                      <tr key={partner.phoneNumber}>
                        <td>{index + 1}</td>
                        <td>
                          {documents.profileImage ? (
                            <img
                              src={documents.profileImage}
                              alt="Profile"
                              className="rounded-circle"
                              style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                            />
                          ) : (
                            <div 
                              className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white"
                              style={{ width: '40px', height: '40px' }}
                            >
                              <i className="bi bi-person-fill"></i>
                            </div>
                          )}
                        </td>
                        <td>{personalInfo.firstName} {personalInfo.lastName}</td>
                        <td>{personalInfo.phoneNumber}</td>
                        <td className="text-center">
                          <span className="badge bg-danger">
                            {orderStats.rejected || 0}
                          </span>
                        </td>
                        <td className="text-center">
                          <span className="badge bg-warning">
                            {orderStats.cancelled || 0}
                          </span>
                        </td>
                        <td className="text-center">
                          <span className="badge bg-primary">
                            {orderStats.total || 0}
                          </span>
                        </td>
                        <td>
                          <StatusBadge status={partner.status} />
                        </td>
                        <td>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleViewDetails(partner)}
                          >
                            <i className="bi bi-eye-fill me-1"></i>
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <DetailsModal
        partner={selectedPartner}
        show={showModal}
        onHide={() => setShowModal(false)}
      />
    </div>
  );
};

export default DeliveryPartnerTable;