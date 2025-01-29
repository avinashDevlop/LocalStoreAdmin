import React, { useState, useEffect } from "react";
import { FaRupeeSign } from "react-icons/fa";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  Container,
  Box,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
} from "@mui/material";
import { Search } from "lucide-react";
import api from "../../../../api";
import "./Stock.css";

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [stockFilter, setStockFilter] = useState("All"); // State for stock filter

  useEffect(() => {
    api
      .get(`/Products.json`)
      .then((response) => {
        const data = response.data;
        const fetchedCategories = Object.keys(data);
        setCategories([...fetchedCategories]);
      })
      .catch((error) => console.error("Error fetching categories:", error));
  }, []);

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
                category,
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
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase());
    const matchesStock =
      stockFilter === "All" ||
      (stockFilter === "In Stock" && product.stock) ||
      (stockFilter === "Out of Stock" && !product.stock);
    return matchesSearch && matchesStock;
  });

  return (
    <>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <div className="header-section">
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
            <h4 className="mb-4">
              <span className="text-lg font-medium">Product /</span> Stock
            </h4>
            <FormControl component="fieldset">
              <RadioGroup
                row
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
              >
                <FormControlLabel value="All" control={<Radio />} label="All" />
                <FormControlLabel
                  value="In Stock"
                  control={<Radio />}
                  label="In Stock"
                />
                <FormControlLabel
                  value="Out of Stock"
                  control={<Radio />}
                  label="Out of Stock"
                />
              </RadioGroup>
            </FormControl>
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
              style={{
                backgroundColor: selectedCategory === "All" ? "#1976d2" : "",
                color: selectedCategory === "All" ? "#fff" : "",
              }}
            >
              All
              {/* Hide the count when a category other than "All" is selected */}
              {selectedCategory === "All" && (
                <span className="categoryProductCount">
                  {filteredProducts.length}
                </span>
              )}
            </button>
            {categories.map((category) => {
              const categoryProductsCount = products.filter((product) => {
                const matchesCategory =
                  selectedCategory === "All" || product.category === category;
                const matchesStock =
                  stockFilter === "All" ||
                  (stockFilter === "In Stock" && product.stock) ||
                  (stockFilter === "Out of Stock" && !product.stock);
                return matchesCategory && matchesStock;
              }).length;

              return (
                <button
                  key={category}
                  className={`category-btn ${
                    selectedCategory === category ? "active" : ""
                  }`}
                  onClick={() => setSelectedCategory(category)}
                  style={{
                    backgroundColor:
                      selectedCategory === category ? "#1976d2" : "",
                    color: selectedCategory === category ? "#fff" : "",
                  }}
                >
                  {category}{" "}
                  <span
                    className="categoryProductCount"
                    style={{
                      display:
                        selectedCategory === category ? "inline-block" : "none",
                    }}
                  >
                    {categoryProductsCount}
                  </span>
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
                        <FaRupeeSign style={{ marginRight: "4px" }} />
                        {product.price}
                      </TableCell>
                      <TableCell>
                        `{product.quantity} {product.unit}`
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={!!product.stock}
                          disabled
                          classes={{
                            thumb: product.stock
                              ? "switch-thumb-checked"
                              : "switch-thumb-unchecked",
                            track: product.stock
                              ? "switch-track-checked"
                              : "switch-track-unchecked",
                          }}
                        />
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
