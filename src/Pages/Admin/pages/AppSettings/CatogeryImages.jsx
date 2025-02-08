import React, { useState, useEffect, useCallback } from "react";
import {
  getStorage,
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { getDatabase, ref as dbRef, onValue, set } from "firebase/database";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ImageGallery = () => {
  const [images, setImages] = useState({});
  const [loading, setLoading] = useState({}); // Track loading state for each category

  const storage = getStorage(); // Firebase Storage instance
  const database = getDatabase(); // Firebase Realtime Database instance

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
    { value: "Mobile-accessories", label: "Mobile Accessories" },
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

  const handleImageUpload = (event, category) => {
    const file = event.target.files[0];
    if (file && category) {
      // Set loading state for this category
      setLoading((prev) => ({ ...prev, [category]: true }));

      // Check if an existing image is present for this category
      if (images[category]?.name) {
        const previousImageRef = storageRef(
          storage,
          `AppSettings/categoryImages/${category}/${images[category].name}`
        );

        // Delete the existing image from Firebase Storage
        deleteObject(previousImageRef).catch((error) => {
          console.error("Error deleting previous image:", error);
        });
      }

      // Upload the new image
      const storageRefPath = storageRef(
        storage,
        `AppSettings/categoryImages/${category}/${file.name}`
      );
      const uploadTask = uploadBytesResumable(storageRefPath, file);

      uploadTask.on(
        "state_changed",
        null,
        (error) => {
          console.error("Upload failed:", error);
          toast.error(`Failed to upload image for ${category}`);
          setLoading((prev) => ({ ...prev, [category]: false })); // Stop loading
        },
        async () => {
          // Get the download URL after upload is complete
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          // Save the new image URL to Firebase Realtime Database
          await set(dbRef(database, `AppSettings/categoryImages/${category}`), {
            url: downloadURL,
            name: file.name,
          });

          // Update the local state
          setImages((prev) => ({
            ...prev,
            [category]: {
              url: downloadURL,
              name: file.name,
            },
          }));

          toast.success(`Image uploaded for ${category}`);
          setLoading((prev) => ({ ...prev, [category]: false })); // Stop loading
        }
      );
    }
  };

  // Remove image
  const removeImage = async (category) => {
    if (images[category]) {
      const imageRef = storageRef(
        storage,
        `AppSettings/categoryImages/${category}/${images[category].name}`
      );

      try {
        // Delete image from Firebase Storage
        await deleteObject(imageRef);

        // Remove image from Firebase Realtime Database
        await set(dbRef(database, `AppSettings/categoryImages/${category}`), null);

        // Update the local state
        setImages((prev) => {
          const updatedImages = { ...prev };
          delete updatedImages[category];
          return updatedImages;
        });

        toast.success(`Image removed for ${category}`);
      } catch (error) {
        console.error("Error removing image:", error);
        toast.error(`Failed to remove image for ${category}`);
      }
    }
  };

  // Fetch images from Firebase Realtime Database
  const fetchImages = useCallback(() => {
    const dbImagesRef = dbRef(database, "AppSettings/categoryImages");

    onValue(dbImagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setImages(data);
      } else {
        setImages({});
      }
    });
  }, [database]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  return (
    <div className="container py-4">
      <ToastContainer />
      <h4 className="mb-4">
        <span className="text-lg font-medium">App Settings /</span> Category Images
      </h4>

      <div className="row g-4">
        {categories.map((category) => (
          <div key={category.value} className="col-md-4">
            <div className="card shadow-sm">
              <div className="card-header bg-light">
                <h6 className="mb-0">{category.label}</h6>
              </div>
              <div className="card-body text-center">
                {loading[category.value] ? (
                  <div
                    className="d-flex align-items-center justify-content-center"
                    style={{
                      width: "100%",
                      height: "200px",
                      background: "#f8f9fa",
                    }}
                  >
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : images[category.value]?.url ? (
                  <div className="position-relative">
                    <img
                      src={images[category.value].url}
                      alt={images[category.value].name}
                      className="img-fluid rounded shadow-sm mb-3"
                      style={{
                        width: "100%",
                        height: "200px",
                        objectFit: "cover",
                      }}
                    />
                    <button
                      className="btn btn-sm btn-light position-absolute top-0 end-0 m-2"
                      onClick={() => removeImage(category.value)}
                    >
                      <i className="bi bi-trash text-danger"></i>
                    </button>
                  </div>
                ) : (
                  <p className="text-muted">No image uploaded</p>
                )}
                <div className="d-grid">
                  <input
                    type="file"
                    id={`imageUpload-${category.value}`}
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, category.value)}
                    className="d-none"
                  />
                  <label
                    htmlFor={`imageUpload-${category.value}`}
                    className="btn btn-primary"
                  >
                    {images[category.value] ? "Update Image" : "Upload Image"}
                  </label>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;
