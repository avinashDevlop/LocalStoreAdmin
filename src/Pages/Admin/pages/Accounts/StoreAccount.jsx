import React, { useState, useEffect } from 'react';
import api from '../../../../api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const StorePartnerAccounts = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  // Fetch stores data
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await api.get('Accounts/Stores.json');
        if (response.data) {
          const storesArray = Object.entries(response.data).map(([phoneNumber, data]) => ({
            id: phoneNumber,
            ...data.profile
          }));
          setStores(storesArray);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching stores:', error);
        toast.error('Failed to load store partners');
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  const generateNewPassword = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    let password = '';
    
    for (let i = 0; i < 3; i++) {
      const randomLetter = letters.charAt(Math.floor(Math.random() * letters.length));
      const randomNumber = numbers.charAt(Math.floor(Math.random() * numbers.length));
      password += randomLetter + randomNumber;
    }
    
    return password;
  };

  const handlePasswordReset = async (storeId) => {
    try {
      setEditingId(storeId);
      const newPassword = generateNewPassword();
      
      await api.patch(
        `Accounts/Stores/${storeId}/profile/account.json`,
        { password: newPassword }
      );

      setStores(stores.map(store => 
        store.id === storeId 
          ? { ...store, account: { ...store.account, password: newPassword } }
          : store
      ));

      toast.success('Password reset successfully!');
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Failed to reset password');
    } finally {
      setEditingId(null);
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
        <h2 className="text-center mb-4">Store Partner Accounts</h2>
        
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-primary">
              <tr>
                <th scope="col" className="text-center">#</th>
                <th scope="col">Store Image</th>
                <th scope="col">Store Name</th>
                <th scope="col">Categories</th>
                <th scope="col">User ID</th>
                <th scope="col">Password</th>
                <th scope="col" className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((store, index) => (
                <tr key={store.id}>
                  <td className="text-center">{index + 1}</td>
                  <td>
                    <img 
                      src={store.documents?.storeImage || '/api/placeholder/50/50'} 
                      alt="Store" 
                      className="rounded"
                      style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                    />
                  </td>
                  <td>
                    <div>{store.storeInfo?.name}</div>
                    <small className="text-muted">{store.storeInfo?.ownerName}</small>
                  </td>
                  <td>
                    <div style={{ maxHeight: '100px', overflowY: 'auto' }}>
                      {store.categories?.map((category, idx) => (
                        <span
                          key={idx}
                          className="badge bg-primary me-1 mb-1"
                          style={{ fontSize: '0.8rem' }}
                        >
                          {category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>{store.account?.userId}</td>
                  <td>
                    {editingId === store.id ? (
                      <div className="d-flex align-items-center">
                        <span className="me-2">Resetting...</span>
                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    ) : (
                      <span className="font-monospace">{store.account?.password}</span>
                    )}
                  </td>
                  <td className="text-center">
                    {editingId !== store.id && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handlePasswordReset(store.id)}
                      >
                        <i className="bi bi-arrow-clockwise me-1"></i>
                        Reset
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

export default StorePartnerAccounts;