import React, { useState, useRef } from "react";
import api from "../../../../api";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import app from "../../../../firebase";
import { toast, ToastContainer } from "react-toastify";

const StoreRegistrationForm = () => {
  const [formData, setFormData] = useState({
    storeName: "",
    ownerName: "",
    email: "",
    countryCode: "+91", 
    phone: "",
    alternatePhone: "",
    address: "",
    city: "",
    zipCode: "",
    googleMapUrl: "",
    categories: [],
    operatingHours: {
      opening: "",
      closing: "",
    },
    description: "",
    gstNumber: "",
    storeImage: null,
    documents: {
      shopLicense: null,
      gstCertificate: null,
      panCard: null,
    },
  });

  const storeImageRef = useRef(null);
  const shopLicenseRef = useRef(null);
  const gstCertificateRef = useRef(null);
  const panCardRef = useRef(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const storage = getStorage(app);

  const categories = [
    { value: "Fruits", label: "Fruits" },
    { value: "Vegetables", label: "Vegetables" },
    { value: "Dairy-eggs", label: "Dairy & Eggs" },
    { value: "Meat-seafood", label: "Meat & Seafood" },
    { value: "Bakery", label: "Bakery" },
    { value: "Pantry", label: "Pantry & Dry Goods" },
    { value: "Frozen", label: "Frozen Foods" },
    { value: "Beverages", label: "Beverages" },
    { value: "Snacks", label: "Snacks & Confectionery" },
    { value: "Household", label: "Household Items" },
    { value: "Personal-care", label: "Personal Care" },
    { value: "Baby-care", label: "Baby Care" },
    { value: "Pet-supplies", label: "Pet Supplies" },
    { value: "Organic", label: "Organic Foods" },
    { value: "Cleaning-supplies", label: "Cleaning Supplies" },
    { value: "Health-wellness", label: "Health & Wellness" },
    { value: "Stationery", label: "Stationery & Office Supplies" },
    { value: "Electronics", label: "Electronics & Accessories" },
    { value: "Home-decor", label: "Home Decor" },
    { value: "Toys-games", label: "Toys & Games" },
    { value: "Kitchen-essentials", label: "Kitchen Essentials" },
    { value: "Garden-supplies", label: "Garden Supplies" },
    { value: "Automotive", label: "Automotive" },
    { value: "Sports-outdoors", label: "Sports & Outdoors" },
    { value: "Books-magazines", label: "Books & Magazines" },
    { value: "Party-supplies", label: "Party Supplies" },
    { value: "Crafts-hobbies", label: "Crafts & Hobbies" },
    { value: "Luxury-items", label: "Luxury Items" },
    { value: "Seasonal", label: "Seasonal Items" },
    { value: "Travel-accessories", label: "Travel Accessories" },
    { value: "Footwear", label: "Footwear" },
    { value: "Clothing", label: "Clothing" },
    { value: "Jewelry", label: "Jewelry" },
    { value: "Hardware-tools", label: "Hardware & Tools" },
    { value: "Fitness-equipment", label: "Fitness Equipment" },
    { value: "Office-furniture", label: "Office Furniture" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested operatingHours object
    if (name.includes('operatingHours.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        operatingHours: {
          ...prev.operatingHours,
          [field]: value
        }
      }));
    } else {
      // Handle all other fields
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      categories: checked
        ? [...prev.categories, value]
        : prev.categories.filter((cat) => cat !== value),
    }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (type === "store") {
      setFormData((prev) => ({
        ...prev,
        storeImage: file,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        documents: {
          ...prev.documents,
          [type]: file,
        },
      }));
    }
  };

  const uploadFileToStorage = async (file, path) => {
    if (!file) return null;
    const fileRef = ref(storage, path);
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
  };

  const validateForm = () => {
    let tempErrors = {};
    if (!formData.storeName) tempErrors.storeName = "Store name is required";
    if (!formData.ownerName) tempErrors.ownerName = "Owner name is required";
    if (!formData.phone) tempErrors.phone = "Phone number is required";
    if (!formData.address) tempErrors.address = "Address is required";
    if (!formData.city) tempErrors.city = "City is required";
    if (!formData.zipCode) tempErrors.zipCode = "ZIP code is required";
    if (formData.categories.length === 0)
      tempErrors.categories = "At least one category is required";
    if (!formData.storeImage) tempErrors.storeImage = "Store image is required";

    setSubmitError(
      Object.keys(tempErrors).length > 0
        ? "Please fill all required fields"
        : null
    );
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
      const storeImageUrl = await uploadFileToStorage(
        formData.storeImage,
        `Accounts/Stores/${phoneNumber}/profile/documents/storeImage`
      );

      const shopLicenseUrl = await uploadFileToStorage(
        formData.documents.shopLicense,
        `Accounts/Stores/${phoneNumber}/profile/documents/shopLicense`
      );

      const gstCertificateUrl = await uploadFileToStorage(
        formData.documents.gstCertificate,
        `Accounts/Stores/${phoneNumber}/profile/documents/gstCertificate`
      );

      const panCardUrl = await uploadFileToStorage(
        formData.documents.panCard,
        `Accounts/Stores/${phoneNumber}/profile/documents/panCard`
      );

      // Prepare data for submission
      const submissionData = {
        storeInfo: {
          name: formData.storeName,
          ownerName: formData.ownerName,
          email: formData.email || null,
          phoneNumber: phoneNumber,
          alternatePhone: formData.alternatePhone || null,
          description: formData.description,
          gstNumber: formData.gstNumber,
          operatingHours: formData.operatingHours,
        },
        address: {
          street: formData.address,
          city: formData.city,
          zipCode: formData.zipCode,
          googleMapUrl: formData.googleMapUrl,
        },
        categories: formData.categories,
        documents: {
          storeImage: storeImageUrl,
          shopLicense: shopLicenseUrl,
          gstCertificate: gstCertificateUrl,
          panCard: panCardUrl,
        },
        account:{
          userId: phoneNumber,
          role: 'deliveryPartner',
          password: generatedPassword 
       },
        timestamp: new Date().toISOString(),
        status: "Active",
      };

      // Submit to Firebase
      await api.put(
        `Accounts/Stores/${phoneNumber}/profile.json`,
        submissionData
      );

      toast.success("Store registered successfully!");

      // Reset form
      setFormData({
        storeName: "",
        ownerName: "",
        email: "",
        countryCode: "+91",
        phone: "",
        alternatePhone: "",
        address: "",
        city: "",
        zipCode: "",
        googleMapUrl: "",
        categories: [],
        operatingHours: {
          opening: "",
          closing: "",
        },
        description: "",
        gstNumber: "",
        storeImage: null,
        documents: {
          shopLicense: null,
          gstCertificate: null,
          panCard: null,
        },
      });

      // Reset file inputs
      if (storeImageRef.current) storeImageRef.current.value = "";
      if (shopLicenseRef.current) shopLicenseRef.current.value = "";
      if (gstCertificateRef.current) gstCertificateRef.current.value = "";
      if (panCardRef.current) panCardRef.current.value = "";
    } catch (error) {
      console.error("Submission error:", error);
      setSubmitError("Failed to submit form. Please try again.");
      toast.error("Error registering store");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-fluid bg-light min-vh-100 py-5">
      <h4 className="mb-4">
        <span className="fs-4 fw-medium">Shop Partner /</span> Add Shop Store
      </h4>

      {submitError && (
        <div
          className="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          {submitError}
          <button
            type="button"
            className="btn-close"
            onClick={() => setSubmitError(null)}
          ></button>
        </div>
      )}

      <div className="container bg-white rounded shadow p-4">
        <h2 className="text-center mb-4">Store Registration</h2>

        <form onSubmit={handleSubmit}>
          {/* Store Information Section */}
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <i className="bi bi-shop me-2"></i>
              Store Information
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Store Name*</label>
                  <input
                    type="text"
                    className="form-control"
                    name="storeName"
                    value={formData.storeName}
                    onChange={handleChange}
                    placeholder="Enter store name"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Owner Name*</label>
                  <input
                    type="text"
                    className="form-control"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleChange}
                    placeholder="Enter owner name"
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
                    placeholder="Enter phone number"
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Alternate Phone Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    name="alternatePhone"
                    value={formData.alternatePhone}
                    onChange={handleChange}
                    placeholder="Enter alternate phone number"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">GST Number</label>
                  <input
                    type="text"
                    className="form-control"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleChange}
                    placeholder="Enter GST number"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Opening Time*</label>
                  <input
                    type="time"
                    className="form-control"
                    name="operatingHours.opening"
                    value={formData.operatingHours.opening}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Closing Time*</label>
                  <input
                    type="time"
                    className="form-control"
                    name="operatingHours.closing"
                    value={formData.operatingHours.closing}
                    onChange={handleChange}
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

                <div className="col-12">
                  <label className="form-label">Google Maps URL</label>
                  <input
                    type="url"
                    className="form-control"
                    name="googleMapUrl"
                    value={formData.googleMapUrl}
                    onChange={handleChange}
                    placeholder="Enter Google Maps URL"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Store Categories Section */}
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <i className="bi bi-tags-fill me-2"></i>
              Store Categories
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-12">
                  <label className="form-label">
                    Select Categories* (Select at least one)
                  </label>
                  <div className="row g-3">
                    {categories.map((category) => (
                      <div key={category.value} className="col-md-4 col-lg-3">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={category.value}
                            value={category.value}
                            checked={formData.categories.includes(
                              category.value
                            )}
                            onChange={handleCategoryChange}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={category.value}
                          >
                            {category.label}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Store Description */}
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <i className="bi bi-file-text-fill me-2"></i>
              Store Description
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-12">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Enter store description"
                  ></textarea>
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
                  <label className="form-label">Store Image*</label>
                  <div className="input-group">
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "store")}
                      ref={storeImageRef}
                      required
                    />
                    <span className="input-group-text">
                      <i className="bi bi-camera-fill"></i>
                    </span>
                  </div>
                  <small className="text-muted">
                    Upload a clear image of your store front
                  </small>
                </div>

                <div className="col-md-4">
                  <label className="form-label">Shop License*</label>
                  <div className="input-group">
                    <input
                      type="file"
                      className="form-control"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, "shopLicense")}
                      ref={shopLicenseRef}
                      required
                    />
                    <span className="input-group-text">
                      <i className="bi bi-file-earmark-pdf-fill"></i>
                    </span>
                  </div>
                </div>

                <div className="col-md-4">
                  <label className="form-label">GST Certificate</label>
                  <div className="input-group">
                    <input
                      type="file"
                      className="form-control"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, "gstCertificate")}
                      ref={gstCertificateRef}
                    />
                    <span className="input-group-text">
                      <i className="bi bi-file-earmark-pdf-fill"></i>
                    </span>
                  </div>
                </div>

                <div className="col-md-4">
                  <label className="form-label">PAN Card*</label>
                  <div className="input-group">
                    <input
                      type="file"
                      className="form-control"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, "panCard")}
                      ref={panCardRef}
                      required
                    />
                    <span className="input-group-text">
                      <i className="bi bi-file-earmark-pdf-fill"></i>
                    </span>
                  </div>
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
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Submitting...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle me-2"></i>
                  Register Store
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

export default StoreRegistrationForm;
