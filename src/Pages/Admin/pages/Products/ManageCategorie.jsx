import React, { useState, useEffect } from "react";
import { FaRupeeSign } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Switch,
  Container,
  IconButton,
  Box,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { Search } from "lucide-react";
import api from "../../../../api";
import "./ManageCatg.css";
import { getStorage, ref, deleteObject } from "firebase/storage";

const CategoryManagement = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [editingProductId, setEditingProductId] = useState(null);
  const [editedProduct, setEditedProduct] = useState({});

  // Fetch categories
  useEffect(() => {
    api
      .get(`/Products.json`)
      .then((response) => {
        const data = response.data;
        const fetchedCategories = Object.keys(data); // Get category names
        setCategories([...fetchedCategories]); // Include "All" option
      })
      .catch((error) => console.error("Error fetching categories:", error));
  }, []);

  // Fetch products based on selected category
  useEffect(() => {
    if (selectedCategory !== "All") {
      api
        .get(`/Products/${selectedCategory}.json`)
        .then((response) => {
          const categoryData = response.data || {};
          const fetchedProducts = Object.keys(categoryData).map((key) => ({
            ...categoryData[key],
            id: key,
          }));
          setProducts(fetchedProducts);
        })
        .catch((error) => console.error("Error fetching products:", error));
    } else {
      api
        .get(`/Products.json`)
        .then((response) => {
          const data = response.data || {};
          const allProducts = [];
          Object.keys(data).forEach((category) => {
            const categoryData = data[category];
            Object.keys(categoryData).forEach((productKey) => {
              allProducts.push({
                ...categoryData[productKey],
                id: productKey,
                category: category, // Include category for reference
              });
            });
          });
          setProducts(allProducts);
        })
        .catch((error) => console.error("Error fetching all products:", error));
    }
  }, [selectedCategory]);

  const filteredProducts = products.filter((product) => {
    const name = product?.name || "";
    const search = searchTerm || "";
    return name.toLowerCase().includes(search.toLowerCase());
  });

  // Enable editing for a specific product
  const handleEditClick = (product) => {
    setEditingProductId(product.id);
    setEditedProduct({ ...product });
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setEditedProduct((prev) => ({ ...prev, [field]: value }));
  };

  // Save updated product to the database
  const handleSaveClick = (product) => {
    const { id, category, ...updatedData } = editedProduct;

    api
      .patch(`/Products/${product.category}/${product.id}.json`, updatedData)
      .then(() => {
        // Update local state
        setProducts((prev) =>
          prev.map((prod) =>
            prod.id === product.id ? { ...prod, ...updatedData } : prod
          )
        );
        setEditingProductId(null); // Exit editing mode
      })
      .catch((error) => console.error("Error updating product:", error));
  };

  const handleDeleteClick = (product) => {
    // Show a confirmation toast
    toast(
      <div>
        <span>Are you sure you want to delete this product?</span>
        <div className="action-buttons">
          <button
            className="delete-button"
            onClick={() => {
              handleDeleteConfirm(product);
              toast.dismiss();
            }}
          >
            Delete
          </button>
          <button className="cancel-button" onClick={() => toast.dismiss()}>
            Cancel
          </button>
        </div>
      </div>,
      {
        position: "top-right",
        autoClose: false, // Don't auto-close the toast
        closeButton: false, // Remove the default close button
      }
    );
  };

  const handleDeleteConfirm = (product) => {
    const storage = getStorage(); // Initialize Firebase Storage
  
    // Delete product data from the database
    api
      .delete(`/Products/${product.category}/${product.name}.json`)
      .then(() => {
        toast.success("Product deleted successfully!", {
          autoClose: 2000,
        });
  
        // Delete associated images from Firebase Storage
        if (product.images && product.images.length > 0) {
          product.images.forEach((imageUrl) => {
            const imageRef = ref(storage, imageUrl);
  
            // Delete image
            deleteObject(imageRef)
              .then(() => {
                console.log(`Image ${imageUrl} deleted successfully.`);
              })
              .catch((error) => {
                console.error(`Failed to delete image ${imageUrl}:`, error);
              });
          });
        }
  
        // Update local state
        setProducts(products.filter((p) => p.id !== product.id));
      })
      .catch((error) => {
        toast.error("Failed to delete product!");
        console.error("Error deleting product:", error);
      });
  };

  return (
    <>
      <ToastContainer />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <div className="header-section">
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
            <h4 className="mb-4">
              <span className="text-lg font-medium">Product /</span> Manage
              Categories
            </h4>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate("/Admin/AdminAddProduct")}
            >
              Add Product
            </Button>
          </Box>
          <div className="search-container">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              className="search-input"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="categories">
            <button
              key="all"
              className={`category-btn ${
                selectedCategory === "All" ? "active" : ""
              }`}
              onClick={() => setSelectedCategory("All")}
            >
              All{" "}
              {selectedCategory === "All" && (
                <span className="categoryProductCount">{products.length}</span>
              )}
            </button>
            {categories.map((category) => {
              const categoryProductsCount = products.filter(
                (product) => product.category === category
              ).length;
              return (
                <button
                  key={category}
                  className={`category-btn ${
                    selectedCategory === category ? "active" : ""
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}{" "}
                  {selectedCategory === category && (
                    <span className="categoryProductCount">
                      {categoryProductsCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>SI no.</TableCell>
                  <TableCell>Image</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Stock Status</TableCell>
                  <TableCell>Edit</TableCell>
                  <TableCell>Delete</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No products found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product, index) => (
                    <TableRow key={product.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            style={{
                              width: "50px",
                              height: "50px",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <img
                            src="https://via.placeholder.com/50"
                            alt="placeholder"
                            style={{
                              width: "50px",
                              height: "50px",
                              objectFit: "cover",
                            }}
                          />
                        )}
                      </TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>
                        {editingProductId === product.id ? (
                          <>
                            <FaRupeeSign style={{ marginRight: "4px" }} />
                            <input
                              type="number"
                              value={editedProduct.price || ""}
                              onChange={(e) =>
                                handleInputChange("price", e.target.value)
                              }
                              className="editable-input price-input"
                            />
                          </>
                        ) : (
                          <>
                            <FaRupeeSign style={{ marginRight: "4px" }} />
                            {product.price}
                          </>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingProductId === product.id ? (
                          <>
                            <input
                              type="number"
                              value={editedProduct.quantity || ""}
                              onChange={(e) =>
                                handleInputChange("quantity", e.target.value)
                              }
                              className="editable-input quantity-input"
                            />
                            <select
                              value={editedProduct.unit || ""}
                              onChange={(e) =>
                                handleInputChange("unit", e.target.value)
                              }
                              className="editable-select"
                            >
                              <option value="kg">kg</option>
                              <option value="g">g</option>
                              <option value="L">L</option>
                              <option value="ml">ml</option>
                              <option value="pieces">pieces</option>
                              <option value="dozen">dozen</option>
                            </select>
                          </>
                        ) : (
                          `${product.quantity} ${product.unit}`
                        )}
                      </TableCell>

                      <TableCell>
                        {editingProductId === product.id ? (
                          <Switch
                            checked={!!editedProduct.stock}
                            onChange={(e) =>
                              handleInputChange("stock", e.target.checked)
                            }
                            className={
                              editedProduct.stock
                                ? "switch-checked"
                                : "switch-unchecked"
                            }
                          />
                        ) : (
                          <Switch
                            checked={!!product.stock}
                            disabled
                            className={
                              product.stock
                                ? "switch-checked"
                                : "switch-unchecked"
                            }
                          />
                        )}
                      </TableCell>

                      <TableCell>
                        {editingProductId === product.id ? (
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleSaveClick(product)}
                          >
                            Save
                          </Button>
                        ) : (
                          <IconButton
                            color="primary"
                            onClick={() => handleEditClick(product)}
                          >
                            <EditIcon />
                          </IconButton>
                        )}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          sx={{ color: "red" }}
                          onClick={() => handleDeleteClick(product)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
    </>
  );
};

export default CategoryManagement;
