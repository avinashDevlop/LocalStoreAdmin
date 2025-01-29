import React, { useState , useRef } from 'react';
import api from '../../../../api';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import app from '../../../../firebase';
import { toast, ToastContainer } from "react-toastify";

const DeliveryPartnerForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    countryCode: '+91',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    vehicleType: '',
    vehicleNumber: '', // Added vehicle number field
    licenseNumber: '',
    emergencyContact: '',
    profileImage: null,
    documents: {
      drivingLicense: null,
      idProof: null,
      vehicleRegistration: null
    }
  });
 
  const profileImageRef = useRef(null);
  const drivingLicenseRef = useRef(null);
  const idProofRef = useRef(null);
  const vehicleRegistrationRef = useRef(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const storage = getStorage(app);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (type === 'profile') {
      setFormData(prev => ({
        ...prev,
        profileImage: file
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [type]: file
        }
      }));
    }
  };

  const uploadFileToStorage = async (file, path) => {
    if (!file) return null;
    
    const fileRef = ref(storage, path);
    await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(fileRef);
    return downloadURL;
  };

  const validateForm = () => {
    let tempErrors = {};
    if (!formData.firstName) tempErrors.firstName = 'First name is required';
    if (!formData.lastName) tempErrors.lastName = 'Last name is required';
    if (!formData.phone) tempErrors.phone = 'Phone number is required';
    if (!formData.address) tempErrors.address = 'Address is required';
    if (!formData.city) tempErrors.city = 'City is required';
    if (!formData.zipCode) tempErrors.zipCode = 'ZIP code is required';
    if (!formData.vehicleType) tempErrors.vehicleType = 'Vehicle type is required';
    if (!formData.vehicleNumber) tempErrors.vehicleNumber = 'Vehicle number is required'; // Added validation
    if (!formData.licenseNumber) tempErrors.licenseNumber = 'License number is required';
    if (!formData.emergencyContact) tempErrors.emergencyContact = 'Emergency contact is required';
    if (!formData.profileImage) tempErrors.profileImage = 'Profile image is required';
    
    setSubmitError(Object.keys(tempErrors).length > 0 ? 'Please fill all required fields' : null);
    return Object.keys(tempErrors).length === 0;
  };

  const generatePassword = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    let password = '';
    
    // Generate alternating letter and number
    for (let i = 0; i < 3; i++) {
      const randomLetter = letters.charAt(Math.floor(Math.random() * letters.length));
      const randomNumber = numbers.charAt(Math.floor(Math.random() * numbers.length));
      password += randomLetter + randomNumber;
    }
    
    return password;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const phoneNumber = `${formData.countryCode}${formData.phone}`;
      const generatedPassword = generatePassword();

      // Upload files to Firebase Storage
      const profileImageUrl = await uploadFileToStorage(
        formData.profileImage,
        `Accounts/DeliveryPartner/${phoneNumber}/profile/documents/profileImage`
      );

      const drivingLicenseUrl = await uploadFileToStorage(
        formData.documents.drivingLicense,
        `Accounts/DeliveryPartner/${phoneNumber}/profile/documents/drivingLicense`
      );

      const idProofUrl = await uploadFileToStorage(
        formData.documents.idProof,
        `Accounts/DeliveryPartner/${phoneNumber}/profile/documents/idProof`
      );

      const vehicleRegistrationUrl = await uploadFileToStorage(
        formData.documents.vehicleRegistration,
        `Accounts/DeliveryPartner/${phoneNumber}/profile/documents/vehicleRegistration`
      );

      // Prepare data for submission
      const submissionData = {
        personalInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email || null,
          phoneNumber: phoneNumber,
          emergencyContact: formData.emergencyContact
        },
        address: {
          street: formData.address,
          city: formData.city,
          zipCode: formData.zipCode
        },
        vehicleInfo: {
          vehicleType: formData.vehicleType,
          vehicleNumber: formData.vehicleNumber, // Added to submission data
          licenseNumber: formData.licenseNumber
        },
        documents: {
          profileImage: profileImageUrl,
          drivingLicense: drivingLicenseUrl,
          idProof: idProofUrl,
          vehicleRegistration: vehicleRegistrationUrl
        },
        account:{
           userId: phoneNumber,
           role: 'deliveryPartner',
           password: generatedPassword 
        },
        timestamp: new Date().toISOString(),
        status: 'Offline',
      };

      // Submit to Firebase Realtime Database
      await api.put(
        `Accounts/DeliveryPartner/${phoneNumber}/profile.json`,
        submissionData
      );

      toast.success("Delivery Partner Registration successfully!");
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        countryCode: '+91',
        phone: '',
        address: '',
        city: '',
        zipCode: '',
        vehicleType: '',
        vehicleNumber: '', // Added to reset
        licenseNumber: '',
        emergencyContact: '',
        profileImage: null,
        documents: {
          drivingLicense: null,
          idProof: null,
          vehicleRegistration: null
        }
      });
      if (profileImageRef.current) profileImageRef.current.value = '';
        if (drivingLicenseRef.current) drivingLicenseRef.current.value = '';
        if (idProofRef.current) idProofRef.current.value = '';
        if (vehicleRegistrationRef.current) vehicleRegistrationRef.current.value = '';

    } catch (error) {
      console.error('Submission error:', error);
      setSubmitError('Failed to submit form. Please try again.');
      toast.error("Error submitting product", {
              position: "top-right",
              autoClose: 3000,
     });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-fluid bg-light min-vh-100 py-5">
      <h4 className="mb-4">
        <span className="fs-4 fw-medium">Delivery Partner /</span> Add Partner
      </h4>
      
      {submitError && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {submitError}
          <button type="button" className="btn-close" onClick={() => setSubmitError(null)}></button>
        </div>
      )}

      <div className="container bg-white rounded shadow p-4">
        <h2 className="text-center mb-4">Delivery Partner Registration</h2>
        
        <form onSubmit={handleSubmit}>
          {/* Personal Information Section */}
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <i className="bi bi-person-fill me-2"></i>
              Personal Information
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">First Name*</label>
                  <input
                    type="text"
                    className="form-control"
                    name="firstName"
                    placeholder="Enter first name"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Last Name*</label>
                  <input
                    type="text"
                    className="form-control"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter last name"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label">Country Code*</label>
                  <select 
                    className="form-select"
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleChange}
                    required
                  >
                    <option value="+91">+91</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Phone Number*</label>
                  <input
                    type="tel"
                    className="form-control"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter Phone Number"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <i className="bi bi-geo-alt-fill me-2"></i>
              Address Details
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label">Street Address*</label>
                  <input
                    type="text"
                    className="form-control"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter street address"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">City*</label>
                  <input
                    type="text"
                    className="form-control"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Enter city"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">ZIP Code*</label>
                  <input
                    type="text"
                    className="form-control"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    placeholder="Enter ZIP code"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Information Section */}
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <i className="bi bi-truck me-2"></i>
              Vehicle Details
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Vehicle Type*</label>
                  <select
                    className="form-select"
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Delivery Vehicle</option>
                    <option value="bike">Bike</option>
                    <option value="scooter">Scooter</option>
                    <option value="car">Car</option>
                    <option value="van">Van</option>
                    <option value="truck">Truck</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Vehicle Number*</label>
                  <input
                    type="text"
                    className="form-control"
                    name="vehicleNumber"
                    value={formData.vehicleNumber}
                    onChange={handleChange}
                    placeholder="Enter vehicle number"
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">License Number*</label>
                  <input
                    type="text"
                    className="form-control"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    placeholder="Enter license number"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Document Upload Section */}
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <i className="bi bi-file-earmark-text-fill me-2"></i>
              Document Upload
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label">Profile Photo*</label>
                  <div className="input-group">
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      placeholder="Enter emergency contact number"
                      onChange={(e) => handleFileChange(e, 'profile')}
                      ref={profileImageRef}
                      required
                    />
                    <span className="input-group-text"><i className="bi bi-camera-fill"></i></span>
                  </div>
                  <small className="text-muted">Upload a clear, recent photo</small>
                </div>
                
                <div className="col-md-4">
                  <label className="form-label">Driving License*</label>
                  <div className="input-group">
                    <input
                      type="file"
                      className="form-control"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, 'drivingLicense')}
                      ref={drivingLicenseRef}
                      required
                    />
                    <span className="input-group-text"><i className="bi bi-file-earmark-pdf-fill"></i></span>
                  </div>
                </div>

                <div className="col-md-4">
                  <label className="form-label">ID Proof*</label>
                  <div className="input-group">
                    <input
                      type="file"
                      className="form-control"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, 'idProof')}
                      ref={idProofRef}
                      required
                    />
                    <span className="input-group-text"><i className="bi bi-file-earmark-pdf-fill"></i></span>
                  </div>
                </div>

                <div className="col-md-4">
                  <label className="form-label">Vehicle Registration</label>
                  <div className="input-group">
                    <input
                      type="file"
                      className="form-control"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, 'vehicleRegistration')}
                      ref={vehicleRegistrationRef}
                    />
                    <span className="input-group-text"><i className="bi bi-file-earmark-pdf-fill"></i></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contact Section */}
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <i className="bi bi-telephone-fill me-2"></i>
              Emergency Contact
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <label className="form-label">Emergency Contact Number*</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="Enter emergency contact number"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="d-grid gap-2">
            <button 
              type="submit" 
              className="btn btn-primary btn-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Submitting...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle me-2"></i>
                  Submit Registration
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
};

export default DeliveryPartnerForm;