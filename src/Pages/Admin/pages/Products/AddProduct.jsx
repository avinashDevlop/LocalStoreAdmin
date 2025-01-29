import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { Button, Card, Form, InputGroup, Image, Modal } from "react-bootstrap";
import { useDropzone } from "react-dropzone";
import { FaRupeeSign } from "react-icons/fa";
import {
  FaTimes,
  FaCloudUploadAlt,
  FaExclamationTriangle,
} from "react-icons/fa";
import "../../../../firebase";
import api from "../../../../api";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { toast, ToastContainer } from "react-toastify";
import { useLocation } from "react-router-dom";

const storage = getStorage();

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

const unitOptions = [
  { value: "kg", label: "kg" },
  { value: "g", label: "g" },
  { value: "L", label: "L" },
  { value: "ml", label: "ml" },
  { value: "pieces", label: "pieces" },
  { value: "dozen", label: "dozen" },
];

const AdvancedProductForm = () => {
  const navigate = useNavigate();
  const [productData, setProductData] = useState({
    name: "",
    price: "",
    category: null,
    quantity: "",
    unit: "",
    description: "",
    brand: "",
    stock: true,
    bestSelling: false, 
    tags: [],
  });

  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const location = useLocation();
  const editingProduct = location.state?.product || null;

  const [isEditing] = useState(!!editingProduct);
  useEffect(() => {
    if (editingProduct) {
      setProductData({
        name: editingProduct.name,
        price: editingProduct.price,
        category:
          categories.find((cat) => cat.value === editingProduct.category) ||
          null,
        quantity: editingProduct.quantity,
        unit: editingProduct.unit,
        description: editingProduct.description,
        brand: editingProduct.brand,
        stock: editingProduct.stock,
        bestSelling: editingProduct.bestSelling,
        tags: editingProduct.tags || [],
      });

      // Set existing images for preview
      setImages(
        editingProduct.images.map((url) => ({
          preview: url,
          existing: true, // Mark as existing image
        }))
      );
    }
  }, [editingProduct]);

  // Advanced validation
  const validateForm = () => {
    const newErrors = {};
    if (!productData.name.trim()) newErrors.name = "Product name is required";
    if (!productData.price || parseFloat(productData.price) <= 0) {
      newErrors.price = "Valid price is required";
    }
    if (!productData.category) newErrors.category = "Category is required";
    if (!productData.quantity || parseInt(productData.quantity) <= 0) {
      newErrors.quantity = "Valid quantity is required";
    }
    if (images.length === 0) {
      newErrors.images = "At least one product image is required";
    }
    if (!productData.description.trim()) {
      newErrors.description = "Product description is required";
    }
    return newErrors;
  };

  // Enhanced input handling
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Advanced image handling with drag & drop
  const onDrop = useCallback((acceptedFiles) => {
    const newImages = acceptedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
    }));
    setImages((prev) => [...prev, ...newImages]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
    },
    maxSize: 5242880, // 5MB
  });

  const removeImage = (index) => {
    setImages((prev) => {
      const updatedImages = [...prev];
      URL.revokeObjectURL(updatedImages[index].preview);
      updatedImages.splice(index, 1);
      return updatedImages;
    });
  };

  // Preview modal
  const handleImagePreview = (image) => {
    setSelectedImage(image);
    setShowPreview(true);
  };

  // Enhanced form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate the form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      if (isEditing) {
        // Step 1: Find images to delete
        const existingImages = images.filter((image) => image.existing).map((img) => img.preview);
        const removedImages = editingProduct.images.filter(
          (existingImage) => !existingImages.includes(existingImage)
        );
      
        // Step 2: Delete removed images from Firebase Storage
        await Promise.all(
          removedImages.map(async (imageUrl) => {
            const fileRef = ref(storage, imageUrl); // Reference the file by its URL
            await deleteObject(fileRef).catch((error) => {
              console.error("Error deleting file:", error);
            });
          })
        );
      }      
      // Step 1: Upload only new images to Firebase Storage
      const newImageUrls = await Promise.all(
        images
          .filter((image) => !image.existing) // Only process new images
          .map(async (image) => {
            if (!image?.file || !image.file.name ) throw new Error("Invalid image data");
            const storageRef = ref(
              storage,
              `Products/${productData.category?.value}/${productData.name}/${image.file.name}`
            );
            const uploadTask = uploadBytesResumable(storageRef, image.file);
            await new Promise((resolve, reject) => {
              uploadTask.on(
                "state_changed",
                null,
                (error) => {
                  console.error("Upload failed:", error);
                  reject(error);
                },
                resolve
              );
            });
            return await getDownloadURL(uploadTask.snapshot.ref);
          })
      );

      // Combine new uploads with existing images
      const combinedImageUrls = [
        ...images
          .filter((image) => image.existing)
          .map((image) => image.preview), // Existing images
        ...newImageUrls, // New uploads
      ];

      // Step 2: Send product data to Firebase Realtime Database
      const data = {
        ...productData,
        category: productData.category?.value,
        images: combinedImageUrls,
      };

      if (isEditing) {
        await api.put(`/Products/${data.category}/${data.name}.json`, data);
        toast.success("Product updated successfully!", {
          onClose: () => navigate(`/Admin/AdminViewProduct`),
        });
      } else {
        await api.put(`/Products/${data.category}/${data.name}.json`, data);
        toast.success("Product added successfully!");
      }

      // Reset form
      setProductData({
        name: "",
        price: "",
        category: null,
        quantity: "",
        unit: "",
        description: "",
        brand: "",
        stock: true,
        bestSelling: false, 
        tags: [],
      });
      setImages([]);
    } catch (error) {
      console.error("Error submitting product:", error);
      toast.error("Error submitting product", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-4">
      <h4 className="mb-4">
        <span className="text-lg font-medium">Product /</span>{" "}
        {isEditing ? "Edit Product" : "Add New Product"}
      </h4>
      <Card className="shadow-sm">
        <Card.Body>
          {errors.submit && (
            <div
              className="alert alert-danger d-flex align-items-center"
              role="alert"
            >
              <FaExclamationTriangle className="me-2" />
              {errors.submit}
            </div>
          )}
          <Form>
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Product Name*</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={productData.name}
                    disabled={isEditing}
                    onChange={(e) => {
                      const capitalizeWords = (str) =>
                        str.replace(/\b\w/g, (char) => char.toUpperCase());
                      setProductData((prev) => ({
                        ...prev,
                        name: capitalizeWords(e.target.value),
                      }));
                    }}
                    isInvalid={!!errors.name}
                    placeholder="Enter product name"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Category*</Form.Label>
                  <Select
                    options={categories}
                    value={productData.category}
                    onChange={(selectedOption) =>
                      setProductData((prev) => ({
                        ...prev,
                        category: selectedOption,
                      }))
                    }
                    placeholder="Select a category"
                    className={errors.category ? "is-invalid" : ""}
                  />
                  {errors.category && (
                    <div className="invalid-feedback d-block">
                      {errors.category}
                    </div>
                  )}
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Price*</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <FaRupeeSign />
                    </InputGroup.Text>
                    <Form.Control
                      name="price"
                      type="number"
                      step="0.01"
                      value={productData.price}
                      onChange={handleInputChange}
                      isInvalid={!!errors.price}
                      placeholder="Enter price"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.price}
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Quantity*</Form.Label>
                  <InputGroup>
                    <Form.Control
                      name="quantity"
                      type="number"
                      value={productData.quantity}
                      onChange={handleInputChange}
                      isInvalid={!!errors.quantity}
                      placeholder="Enter quantity"
                    />
                    <Form.Group className="mb-3">
                      <Select
                        options={unitOptions}
                        value={
                          productData.unit
                            ? {
                                value: productData.unit,
                                label: unitOptions.find(
                                  (option) => option.value === productData.unit
                                )?.label,
                              }
                            : null
                        }
                        onChange={(selectedOption) =>
                          setProductData((prev) => ({
                            ...prev,
                            unit: selectedOption.value,
                          }))
                        }
                        placeholder="unit"
                        styles={{
                          control: (base) => ({ ...base, maxWidth: "140px" }),
                        }}
                      />
                      {errors.unit && (
                        <div className="text-danger mt-1">{errors.unit}</div>
                      )}
                    </Form.Group>
                    <Form.Control.Feedback type="invalid">
                      {errors.quantity}
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
              </div>
            </div>
            <div className="row">
              <div className="col-md-4">
                <Form.Group className="mb-3">
                  <Form.Label>Brand</Form.Label>
                  <Form.Control
                    name="brand"
                    value={productData.brand}
                    onChange={handleInputChange}
                    placeholder="Enter brand name"
                  />
                </Form.Group>
              </div>

              <div className="col-md-8">
                <Form.Group className="mb-3">
                  <Form.Label>Description*</Form.Label>
                  <Form.Control
                    name="description"
                    value={productData.description}
                    onChange={handleInputChange}
                    as="textarea"
                    rows={2}
                    isInvalid={!!errors.description}
                    placeholder="Enter product description"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.description}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Product Images*</Form.Label>
              <div
                {...getRootProps()}
                className={`dropzone border rounded p-3 text-center ${
                  isDragActive ? "bg-light" : ""
                } ${errors.images ? "border-danger" : ""}`}
              >
                <input {...getInputProps()} />
                <FaCloudUploadAlt className="h1 text-muted" />
                <p className="mb-0">
                  {isDragActive
                    ? "Drop the files here..."
                    : "Drag & drop images here, or click to select files"}
                </p>
                <small className="text-muted">
                  Maximum file size: 5MB. Accepted formats: JPEG, PNG, GIF
                </small>
              </div>
              {errors.images && (
                <div className="text-danger small mt-1">{errors.images}</div>
              )}

              <div className="d-flex flex-wrap gap-2 mt-2">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className="position-relative"
                    style={{ width: "100px", height: "100px" }}
                  >
                    <Image
                      src={image.preview}
                      alt={`Preview ${index}`}
                      className="w-100 h-100 object-fit-cover rounded"
                      onClick={() => handleImagePreview(image)}
                      style={{ cursor: "pointer" }}
                    />
                    <Button
                      variant="danger"
                      size="sm"
                      className="position-absolute top-0 end-0 rounded-circle p-0"
                      style={{ width: "20px", height: "20px" }}
                      onClick={() => removeImage(index)}
                    >
                      <FaTimes size="12" />
                    </Button>
                  </div>
                ))}
              </div>
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="outline-secondary"
                onClick={() => {
                  setProductData({
                    name: "",
                    price: "",
                    category: null,
                    quantity: "",
                    unit: "",
                    description: "",
                    brand: "",
                    tags: [],
                  });
                  setImages([]);
                  setErrors({});
                }}
                disabled={isSubmitting}
              >
                Clear
              </Button>
              {isEditing && (
                <Button
                  variant="secondary"
                  className="me-2"
                  onClick={() => navigate("/Admin/AdminViewProduct")}
                >
                  Cancel
                </Button>
              )}
              <Button
                variant={isEditing ? "warning" : "primary"}
                onClick={(e) => handleSubmit(e)}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Submitting...
                  </>
                ) : isEditing ? (
                  "Update Product"
                ) : (
                  "Add Product"
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      <Modal show={showPreview} onHide={() => setShowPreview(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Image Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {selectedImage && (
            <Image
              src={selectedImage.preview}
              alt="Preview"
              className="img-fluid"
            />
          )}
        </Modal.Body>
      </Modal>
      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
};

export default AdvancedProductForm;
