import React, { useState, useEffect } from 'react';
import api from '../../../../api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DeliveryPartnerAccounts = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  // Fetch delivery partners data
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const response = await api.get('Accounts/DeliveryPartner.json');
        if (response.data) {
          const partnersArray = Object.entries(response.data).map(([phoneNumber, data]) => ({
            id: phoneNumber,
            ...data.profile
          }));
          setPartners(partnersArray);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching partners:', error);
        toast.error('Failed to load delivery partners');
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  const generateNewPassword = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    let password = '';
    
    // Generate alternating letter and number (3 pairs)
    for (let i = 0; i < 3; i++) {
      const randomLetter = letters.charAt(Math.floor(Math.random() * letters.length));
      const randomNumber = numbers.charAt(Math.floor(Math.random() * numbers.length));
      password += randomLetter + randomNumber;
    }
    
    return password;
  };

  const handleEditClick = (partnerId) => {
    setEditingId(partnerId);
  };

  const handlePasswordUpdate = async (partnerId) => {
    try {
      const newPassword = generateNewPassword();
      
      // Update password in Firebase
      await api.patch(
        `Accounts/DeliveryPartner/${partnerId}/profile/account.json`,
        { password: newPassword }
      );

      // Update local state
      setPartners(partners.map(partner => 
        partner.id === partnerId 
          ? { ...partner, account: { ...partner.account, password: newPassword } }
          : partner
      ));

      setEditingId(null);
      toast.success('Password updated successfully!');
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Failed to update password');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid bg-light min-vh-100 py-5">
      <div className="container bg-white rounded shadow p-4">
        <h2 className="text-center mb-4">Delivery Partner Accounts</h2>
        
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-primary">
              <tr>
                <th scope="col" className="text-center">#</th>
                <th scope="col">Profile Image</th>
                <th scope="col">Name</th>
                <th scope="col">User ID</th>
                <th scope="col">Password</th>
                <th scope="col" className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {partners.map((partner, index) => (
                <tr key={partner.id}>
                  <td className="text-center">{index + 1}</td>
                  <td>
                    <img 
                      src={partner.documents?.profileImage || '/api/placeholder/40/40'} 
                      alt="Profile" 
                      className="rounded-circle"
                      style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                    />
                  </td>
                  <td>
                    {`${partner.personalInfo?.firstName} ${partner.personalInfo?.lastName}`}
                  </td>
                  <td>{partner.account?.userId}</td>
                  <td>
                    {editingId === partner.id ? (
                      <div className="d-flex align-items-center">
                        <span className="me-2">Generating new password...</span>
                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    ) : (
                      <span className="font-monospace">{partner.account?.password}</span>
                    )}
                  </td>
                  <td className="text-center">
                    {editingId !== partner.id && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          handleEditClick(partner.id);
                          handlePasswordUpdate(partner.id);
                        }}
                      >
                        <i className="bi bi-arrow-clockwise me-1"></i>
                        Reset Password
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default DeliveryPartnerAccounts;