import React, { useState, useEffect } from "react";
import api from "../../../../api";
import { Search, ChevronLeft, ChevronRight, Edit } from "lucide-react";
import { FaRupeeSign } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./ProductView.css";

const ImageSlider = ({ images }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="image-slider">
      <img
        src={images[currentImageIndex]}
        alt="Product"
        className="slider-image"
      />
      <button onClick={prevImage} className="slider-btn prev">
        <ChevronLeft size={20} />
      </button>
      <button onClick={nextImage} className="slider-btn next">
        <ChevronRight size={20} />
      </button>
      <div className="slider-dots">
        {images.map((_, index) => (
          <button
            key={index}
            className={`dot ${currentImageIndex === index ? "active" : ""}`}
            onClick={() => setCurrentImageIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

const ProductView = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState(["All"]);

  useEffect(() => {
    // Fetch all categories
    api
      .get(`/Products.json`)
      .then((response) => {
        const data = response.data;
        const fetchedCategories = Object.keys(data);
        setCategories(["All", "Best Selling" , ...fetchedCategories]);
      })
      .catch((error) => console.error("Error fetching categories:", error));
  }, []);

  useEffect(() => {
    if (selectedCategory === "Best Selling") {
      // Fetch all products with bestSelling set to true
      api
        .get(`/Products.json`)
        .then((response) => {
          const data = response.data;
          const bestSellingProducts = [];
          Object.keys(data).forEach((category) => {
            const categoryData = data[category];
            Object.keys(categoryData).forEach((productKey) => {
              const product = categoryData[productKey];
              if (product.bestSelling) {
                bestSellingProducts.push({
                  ...product,
                  id: productKey,
                  category: category, // Include category information
                });
              }
            });
          });
          setProducts(bestSellingProducts);
        })
        .catch((error) =>
          console.error("Error fetching best-selling products:", error)
        );
    } else if (selectedCategory !== "All") {
      // Fetch products based on selected category
      api
        .get(`/Products/${selectedCategory}.json`)
        .then((response) => {
          const categoryData = response.data;
          const fetchedProducts = Object.keys(categoryData).map((key) => ({
            ...categoryData[key],
            id: key,
          }));
          setProducts(fetchedProducts);
        })
        .catch((error) => console.error("Error fetching products:", error));
    } else {
      // Fetch all products across all categories
      api
        .get(`/Products.json`)
        .then((response) => {
          const data = response.data;
          const allProducts = [];
          Object.keys(data).forEach((category) => {
            const categoryData = data[category];
            Object.keys(categoryData).forEach((productKey) => {
              allProducts.push({
                ...categoryData[productKey],
                id: productKey,
                category: category, // Include category information for display
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
    const description = product?.description || "";
    const search = searchTerm || "";

    const matchesSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      description.toLowerCase().includes(search.toLowerCase());

    return matchesSearch;
  });

  const editProduct = (product) => {
    navigate(`/Admin/AdminAddProduct`, { state: { product } });
  };

  const toggleBestSelling = async (product) => {
    try {
      const updatedValue = !product.bestSelling;
      await api.patch(
        `/Products/${product.category}/${product.name}.json`,
        { bestSelling: updatedValue }
      );
      // Update the local state to reflect the changes
      setProducts((prevProducts) =>
        prevProducts.map((p) =>
          p.id === product.id ? { ...p, bestSelling: updatedValue } : p
        )
      );
    } catch (error) {
      console.error("Error updating bestSelling status:", error);
    }
  };

  return (
    <div className="product-container">
      {/* Header Section */}
      <div className="header-section">
        <h4 className="mb-4">
          <span className="text-lg font-medium">Product /</span> View Product
        </h4>
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
          {categories.map((category) => (
            <button
              key={category}
              className={`category-btn ${
                selectedCategory === category ? "active" : ""
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Products Section */}
      <div className="products-section">
        <div className="products-grid">
          {filteredProducts.map((product) => (
            <div key={product.id} className="product-card">
              <div className="image-container">
                {!product.stock && <div className="stock-out">Stock Out</div>}
                <ImageSlider images={product.images || []} />
              </div>
              <div className="product-info">
                <div className="product-header">
                  <h4 className="product-name">{product.name}</h4>
                  <span className="product-price">
                    <FaRupeeSign />
                    {product.price}/
                    <div className="product-div">
                      <span className="product-quantity">
                        {product.quantity}
                      </span>
                      <span className="unit">{product.unit}</span>
                    </div>
                  </span>
                </div>
                <span className="product-category">{product.brand}</span>
                <p className="product-description">{product.description}</p>
                <div className="action-buttons">
                  <button
                    className="edit-btn"
                    onClick={() => editProduct(product)}
                  >
                    <Edit size={16} /> Edit
                  </button>
                  <button
                    className={`best-selling-btn ${
                      product.bestSelling ? "unmark-btn" : "mark-btn"
                    }`}
                    onClick={() => toggleBestSelling(product)}
                  >
                    {product.bestSelling ? "UnMark BestSale" : "Mark BestSale"}
                  </button>
                </div>
              </div>
            </div> 
          ))}
        </div>
        {filteredProducts.length === 0 && (
          <div className="no-results">
            No products found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductView;
