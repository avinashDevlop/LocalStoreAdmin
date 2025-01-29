import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Typography,
  IconButton,
  Box,
  Container,
} from "@mui/material";
import { CloudUpload as UploadIcon, Close as CloseIcon } from "@mui/icons-material";
import {
  getStorage,
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { getDatabase, ref as dbRef, onValue, set } from "firebase/database";
import { toast, ToastContainer } from "react-toastify";

const AppBannerUpload = () => {
  const [images, setImages] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const storage = getStorage(); // Firebase Storage instance
  const database = getDatabase(); // Firebase Realtime Database instance

  // Fetch images from Firebase Realtime Database
  const fetchImages = useCallback(async () => {
    try {
      const dbImagesRef = dbRef(database, "AppSettings/appBanner");
      onValue(dbImagesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const fetchedImages = data.map((url) => ({
            preview: url,
            existing: true, // Mark these as existing images
          }));
          setImages(fetchedImages);
        } else {
          setImages([]);
        }
      });
    } catch (error) {
      console.error("Error fetching images:", error);
      toast.error("Failed to fetch images. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  }, [database]); 

  // Fetch images on component mount and when banners are saved
  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const newImages = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      existing: false,
    }));
    setImages([...images, ...newImages]);
  };

  const removeImage = async (index) => {
    const imageToRemove = images[index];
    if (imageToRemove.existing) {
      try {
        const fileRef = storageRef(storage, imageToRemove.preview);
        await deleteObject(fileRef);
      } catch (error) {
        console.error("Error deleting file:", error);
      }
    }

    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
  };

  const saveImagesToFirebase = async () => {
    setIsSubmitting(true);
    try {
      const existingImages = images.filter((image) => image.existing).map((img) => img.preview);
      const newImages = images.filter((image) => !image.existing);

      const newImageUrls = await Promise.all(
        newImages.map(async (image) => {
          const storageRefPath = storageRef(storage, `AppSettings/appBanner/${image.file.name}`);
          const uploadTask = uploadBytesResumable(storageRefPath, image.file);
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

      const combinedImageUrls = [...existingImages, ...newImageUrls];

      await set(dbRef(database, "AppSettings/appBanner"), combinedImageUrls);

      toast.success("Images saved successfully!", {
        position: "top-right",
        autoClose: 3000,
      });

      // Refetch the updated images
      fetchImages();
    } catch (error) {
      console.error("Error saving images:", error);
      toast.error("Failed to save images. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md" className="mt-4">
      <Card>
        <CardHeader
          title={
            <Typography variant="h5" component="h2">
              App Banners
            </Typography>
          }
        />
        <CardContent>
          <Box
            sx={{
              border: 2,
              borderRadius: 2,
              borderColor: dragActive ? "primary.main" : "grey.300",
              borderStyle: "dashed",
              bgcolor: dragActive ? "primary.50" : "background.paper",
              p: 3,
              textAlign: "center",
            }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Box className="d-flex flex-column align-items-center">
              <UploadIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Drag & drop images here, or click to select files
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Maximum file size: 5MB. Accepted formats: JPEG, PNG, GIF, WebP
              </Typography>
              <input
                type="file"
                id="fileInput"
                className="d-none"
                accept="image/jpeg,image/png,image/gif,image/webp"
                multiple
                onChange={handleFileChange}
              />
              <Button
                variant="outlined"
                onClick={() => document.getElementById("fileInput").click()}
                startIcon={<UploadIcon />}
                sx={{ mt: 2 }}
              >
                Select Files
              </Button>
            </Box>
          </Box>

          {images.length > 0 && (
            <Box className="row mt-4 g-3">
              {images.map((image, index) => (
                <div key={index} className="col-md-6">
                  <Box sx={{ position: "relative" }}>
                    <img
                      src={image.preview}
                      alt={`App banner ${index + 1}`}
                      className="img-fluid rounded"
                      style={{ width: "100%", height: "200px", objectFit: "cover" }}
                    />
                    <IconButton
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        bgcolor: "background.paper",
                        "&:hover": { bgcolor: "grey.100" },
                      }}
                      onClick={() => removeImage(index)}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </div>
              ))}
            </Box>
          )}

          {images.length > 0 && (
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 3 }}
              onClick={saveImagesToFirebase}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Banners"}
            </Button>
          )}
        </CardContent>
      </Card>
      <ToastContainer position="top-right" autoClose={2000} />
    </Container>
  );
};

export default AppBannerUpload;
