import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import api from "../../../../api";

const ShopPartners = () => {
  const [partners, setPartners] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const ViewButton = ({ href, text, icon }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="btn btn-outline-primary btn-sm text-decoration-none"
    >
      <i className={`bi ${icon} me-1`}></i>
      {text}
    </a>
  );
  
  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const response = await api.get('Accounts/Stores.json');
      if (response.data) {
        // Convert the object of objects into an array
        const partnersArray = Object.entries(response.data).map(([phone, data]) => ({
          phoneNumber: phone,
          ...data.profile
        }));
        setPartners(partnersArray);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching partners:", error);
      setLoading(false);
    }
  };

  const handleShowDetails = (partner) => {
    setSelectedPartner(partner);
    setShowModal(true);
  };

  const PartnerDetailsModal = ({ partner, show, onHide }) => {
    if (!partner) return null;

    return (
      <Modal show={show} onHide={onHide} size="lg">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>Partner Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Store Information */}
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <i className="bi bi-shop me-2"></i>
              Store Information
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4 text-center mb-3">
                  <img 
                    src={partner.documents.storeImage} 
                    alt="Store Front" 
                    className="img-fluid rounded shadow-sm"
                    style={{ 
                      maxHeight: '200px',
                      width: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
                <div className="col-md-8">
                  <div className="row">
                    <div className="col-md-6">
                      <p><strong>Store Name:</strong> {partner.storeInfo.name}</p>
                      <p><strong>Owner Name:</strong> {partner.storeInfo.ownerName}</p>
                      <p><strong>Email:</strong> {partner.storeInfo.email || 'N/A'}</p>
                    </div>
                    <div className="col-md-6">
                      <p><strong>Phone:</strong> {partner.storeInfo.phoneNumber}</p>
                      <p><strong>Alt. Phone:</strong> {partner.storeInfo.alternatePhone || 'N/A'}</p>
                      <p><strong>GST Number:</strong> {partner.storeInfo.gstNumber || 'N/A'}</p>
                    </div>
                  </div>
                  <p><strong>Operating Hours:</strong> {partner.storeInfo.operatingHours.opening} - {partner.storeInfo.operatingHours.closing}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Address Details */}
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <i className="bi bi-geo-alt-fill me-2"></i>
              Address Details
            </div>
            <div className="card-body">
              <p><strong>Street Address:</strong> {partner.address.street}</p>
              <p><strong>City:</strong> {partner.address.city}</p>
              <p><strong>ZIP Code:</strong> {partner.address.zipCode}</p>
              {partner.address.googleMapUrl && (
                <p className="mb-0">
                  <strong>Google Maps:</strong>{' '}
                  <ViewButton 
                    href={partner.address.googleMapUrl}
                    text="View Location"
                    icon="bi-geo-alt"
                  />
                </p>
              )}
            </div>
          </div>

          {/* Categories */}
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <i className="bi bi-tags-fill me-2"></i>
              Store Categories
            </div>
            <div className="card-body">
              <div className="d-flex flex-wrap gap-2">
                {partner.categories.map((category, index) => (
                  <span key={index} className="badge bg-secondary">
                    {category}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <i className="bi bi-file-text-fill me-2"></i>
              Store Description
            </div>
            <div className="card-body">
              <p>{partner.storeInfo.description || 'No description available.'}</p>
            </div>
          </div>

          {/* Documents */}
          <div className="card">
            <div className="card-header bg-primary text-white">
              <i className="bi bi-file-earmark-text-fill me-2"></i>
              Documents
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-12">
                  <div className="d-flex flex-column gap-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <strong>Shop License:</strong>
                      <ViewButton 
                        href={partner.documents.shopLicense}
                        text="View Document"
                        icon="bi-file-earmark-pdf"
                      />
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <strong>GST Certificate:</strong>
                      {partner.documents.gstCertificate ? (
                        <ViewButton 
                          href={partner.documents.gstCertificate}
                          text="View Document"
                          icon="bi-file-earmark-pdf"
                        />
                      ) : (
                        <span className="text-muted">N/A</span>
                      )}
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <strong>PAN Card:</strong>
                      <ViewButton 
                        href={partner.documents.panCard}
                        text="View Document"
                        icon="bi-file-earmark-pdf"
                      />
                    </div>
                  </div>
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>
          <span className="fs-4 fw-medium">Shop Partner /</span> Partner List
        </h4>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>SI No.</th>
                  <th>Profile Photo</th>
                  <th>Store Name</th>
                  <th>Total Orders</th>
                  <th>Categories</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  partners.map((partner, index) => (
                    <tr key={partner.phoneNumber}>
                      <td>{index + 1}</td>
                      <td>
                        <img
                          src={partner.documents.storeImage}
                          alt={partner.storeInfo.name}
                          className="rounded-circle"
                          style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                        />
                      </td>
                      <td>{partner.storeInfo.name}</td>
                      <td>0</td> {/* You'll need to implement order counting logic */}
                      <td>
                        <div className="d-flex flex-wrap gap-1">
                          {partner.categories.slice(0, 2).map((category, i) => (
                            <span key={i} className="badge bg-secondary">
                              {category}
                            </span>
                          ))}
                          {partner.categories.length > 2 && (
                            <span className="badge bg-secondary">
                              +{partner.categories.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`badge bg-${partner.status === 'Active' ? 'success' : 'danger'}`}>
                          {partner.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleShowDetails(partner)}
                        >
                          <i className="bi bi-eye-fill me-1"></i>
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <PartnerDetailsModal
        partner={selectedPartner}
        show={showModal}
        onHide={() => setShowModal(false)}
      />
    </div>
  );
};

export default ShopPartners;