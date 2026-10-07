import { useEffect, useMemo, useState } from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import StoreHeader from "./StoreHeader";

import {
  FaSearch,
  FaHeart,
  FaPaw,
  FaTimes,
  FaBoxOpen,
  FaCartPlus,
} from "react-icons/fa";

/* =========================================================
   PRODUCTS PAGE
========================================================= */

function Products() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const categoryFromUrl =
    searchParams.get("category");

  /* =========================================================
     PRODUCTS
  ========================================================= */

  const [products, setProducts] = useState([]);

  /* =========================================================
     CATEGORIES
  ========================================================= */

  const [categories, setCategories] = useState([]);

  /* =========================================================
     SEARCH + FILTER
  ========================================================= */

  const [search, setSearch] = useState("");

  const [category, setCategory] = useState(
    categoryFromUrl || "All categories"
  );

  /* =========================================================
     FAVORITES
  ========================================================= */

  const [favorites, setFavorites] = useState([]);

  /* =========================================================
     CART
  ========================================================= */

  const [cart, setCart] = useState(() => {
    try {
      const savedCart =
        localStorage.getItem("vetClinicStoreCart");

      return savedCart
        ? JSON.parse(savedCart)
        : [];
    } catch {
      return [];
    }
  });

  /* =========================================================
     LOAD PRODUCTS FROM INVENTORY
  ========================================================= */

  useEffect(() => {
    const loadProducts = () => {
      try {
        const saved =
          localStorage.getItem(
            "vetClinicProducts"
          );

        if (!saved) {
          setProducts([]);
          return;
        }

        const parsed = JSON.parse(saved);

        if (!Array.isArray(parsed)) {
          setProducts([]);
          return;
        }

        setProducts(parsed);
      } catch (error) {
        console.error(
          "Could not load store products:",
          error
        );

        setProducts([]);
      }
    };

    const handleProductsUpdated = (event) => {
      if (Array.isArray(event.detail)) {
        setProducts(event.detail);
        return;
      }

      loadProducts();
    };

    loadProducts();

    window.addEventListener(
      "vetClinicProductsUpdated",
      handleProductsUpdated
    );

    window.addEventListener(
      "storage",
      loadProducts
    );

    return () => {
      window.removeEventListener(
        "vetClinicProductsUpdated",
        handleProductsUpdated
      );

      window.removeEventListener(
        "storage",
        loadProducts
      );
    };
  }, []);

  /* =========================================================
     LOAD CATEGORIES FROM CATEGORIES.JSX
  ========================================================= */

  useEffect(() => {
    const sortCategories = (list) => {
      return [...list].sort((a, b) => {
        const orderA =
          Number(a.sortOrder) || 0;

        const orderB =
          Number(b.sortOrder) || 0;

        if (orderA !== orderB) {
          return orderA - orderB;
        }

        return String(a.title || "")
          .localeCompare(
            String(b.title || "")
          );
      });
    };

    const loadCategories = () => {
      try {
        const saved =
          localStorage.getItem(
            "vetClinicCategories"
          );

        if (!saved) {
          setCategories([]);
          return;
        }

        const parsed = JSON.parse(saved);

        if (!Array.isArray(parsed)) {
          setCategories([]);
          return;
        }

        setCategories(
          sortCategories(parsed)
        );
      } catch (error) {
        console.error(
          "Could not load categories:",
          error
        );

        setCategories([]);
      }
    };

    const handleCategoriesUpdated = (
      event
    ) => {
      if (Array.isArray(event.detail)) {
        setCategories(
          sortCategories(event.detail)
        );

        return;
      }

      loadCategories();
    };

    loadCategories();

    window.addEventListener(
      "vetClinicCategoriesUpdated",
      handleCategoriesUpdated
    );

    window.addEventListener(
      "storage",
      loadCategories
    );

    return () => {
      window.removeEventListener(
        "vetClinicCategoriesUpdated",
        handleCategoriesUpdated
      );

      window.removeEventListener(
        "storage",
        loadCategories
      );
    };
  }, []);

  /* =========================================================
     CATEGORY FROM URL
  ========================================================= */

  useEffect(() => {
    setCategory(
      categoryFromUrl ||
        "All categories"
    );
  }, [categoryFromUrl]);

  /* =========================================================
     SAVE CART
  ========================================================= */

  useEffect(() => {
    localStorage.setItem(
      "vetClinicStoreCart",
      JSON.stringify(cart)
    );

    window.dispatchEvent(
      new Event("cartUpdated")
    );
  }, [cart]);

  /* =========================================================
     PUBLIC STORE PRODUCTS
  ========================================================= */

  const storeProducts = useMemo(() => {
    return products.filter(
      (product) =>
        product.showOnStore === true
    );
  }, [products]);

  /* =========================================================
     FILTER PRODUCTS
  ========================================================= */

  const filteredProducts = useMemo(() => {
    const searchValue =
      search.toLowerCase().trim();

    return storeProducts.filter(
      (product) => {
        const productName =
          String(
            product.name || ""
          ).toLowerCase();

        const productCategory =
          String(
            product.category || ""
          ).toLowerCase();

        const productDescription =
          String(
            product.description || ""
          ).toLowerCase();

        const matchesSearch =
          !searchValue ||
          productName.includes(
            searchValue
          ) ||
          productCategory.includes(
            searchValue
          ) ||
          productDescription.includes(
            searchValue
          );

        const matchesCategory =
          category ===
            "All categories" ||
          product.category === category;

        return (
          matchesSearch &&
          matchesCategory
        );
      }
    );
  }, [
    storeProducts,
    search,
    category,
  ]);

  /* =========================================================
     FAVORITES
  ========================================================= */

  const toggleFavorite = (
    event,
    productId
  ) => {
    event.stopPropagation();

    setFavorites((current) =>
      current.includes(productId)
        ? current.filter(
            (id) => id !== productId
          )
        : [...current, productId]
    );
  };

  /* =========================================================
     PRODUCT STOCK
  ========================================================= */

  const getProductStock = (
    product
  ) => {
    return Number(product.quantity) || 0;
  };

  /* =========================================================
     PRODUCT PRICE
  ========================================================= */

  const getProductPrice = (
    product
  ) => {
    return (
      Number(
        product.sellingPrice
      ) || 0
    );
  };

  /* =========================================================
     OPEN PRODUCT DETAILS
  ========================================================= */

  const openProduct = (
    product
  ) => {
    navigate(
      `/products/${product.id}`
    );
  };

  /* =========================================================
     ADD TO CART
  ========================================================= */

  const addToCart = (
    event,
    product
  ) => {
    event.stopPropagation();

    const stock =
      getProductStock(product);

    if (stock <= 0) {
      return;
    }

    const price =
      getProductPrice(product);

    setCart(
      (currentCart) => {
        const existingItem =
          currentCart.find(
            (item) =>
              String(item.id) ===
              String(product.id)
          );

        if (existingItem) {
          if (
            Number(
              existingItem.quantity
            ) >= stock
          ) {
            return currentCart;
          }

          return currentCart.map(
            (item) =>
              String(item.id) ===
              String(product.id)
                ? {
                    ...item,

                    quantity:
                      Number(
                        item.quantity
                      ) + 1,

                    stock,

                    price,
                  }
                : item
          );
        }

        return [
          ...currentCart,

          {
            ...product,

            price,

            stock,

            quantity: 1,
          },
        ];
      }
    );
  };

  /* =========================================================
     KEYBOARD OPEN PRODUCT
  ========================================================= */

  const handleProductKeyDown = (
    event,
    product
  ) => {
    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();

      openProduct(product);
    }
  };

  /* =========================================================
     RETURN
  ========================================================= */

  return (
    <div className="products-page">

      <StoreHeader />

      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
        }

        button,
        input,
        select {
          font: inherit;
        }

        .products-page {
          --teal: #1aa6a6;
          --teal-dark: #11797b;
          --teal-light: #e8f7f7;
          --teal-soft: #f1fbfa;
          --text: #263b4f;
          --muted: #728197;
          --border: #dcebea;

          min-height: 100vh;

          background: #f8fbfa;

          color: var(--text);

          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }

        /* ==========================================
           PAGE HEADER
        ========================================== */

        .products-container {
          width: min(1400px, 92%);

          margin: 0 auto;

          padding:
            55px 0
            75px;
        }

        .products-heading {
          margin-bottom: 32px;
        }

        .products-heading-badge {
          display: inline-flex;

          align-items: center;

          gap: 7px;

          margin-bottom: 12px;

          padding: 7px 12px;

          border-radius: 30px;

          background:
            var(--teal-light);

          color:
            var(--teal-dark);

          font-size: 11px;

          font-weight: 800;
        }

        .products-heading h1 {
          margin:
            0 0 10px;

          color:
            var(--text);

          font-size:
            clamp(
              32px,
              4vw,
              48px
            );

          line-height: 1.05;

          letter-spacing:
            -1.5px;
        }

        .products-heading p {
          margin: 0;

          color:
            var(--muted);

          font-size: 14px;

          line-height: 1.7;
        }

        /* ==========================================
           TOOLBAR
        ========================================== */

        .products-toolbar {
          margin-bottom: 28px;

          padding: 18px;

          display: grid;

          grid-template-columns:
            1fr 230px;

          gap: 14px;

          border:
            1px solid
            var(--border);

          border-radius: 16px;

          background: white;

          box-shadow:
            0 8px 25px
            rgba(
              17,
              121,
              123,
              0.05
            );
        }

        /* SEARCH */

        .products-search {
          height: 48px;

          padding:
            0 15px;

          display: flex;

          align-items: center;

          gap: 10px;

          border:
            1px solid
            #dce7e6;

          border-radius: 11px;

          background: white;

          color: #98a2b3;

          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .products-search:focus-within {
          border-color:
            rgba(
              26,
              166,
              166,
              0.65
            );

          box-shadow:
            0 0 0 3px
            rgba(
              26,
              166,
              166,
              0.08
            );
        }

        .products-search > svg {
          flex-shrink: 0;

          color:
            var(--teal);

          font-size: 14px;
        }

        .products-search input {
          width: 100%;

          height: 100%;

          padding: 0;

          border: none;

          outline: none;

          background:
            transparent;

          color:
            var(--text);

          font-size: 13px;
        }

        .products-search input::placeholder {
          color: #a3adba;
        }

        .products-search-clear {
          width: 30px;

          height: 30px;

          padding: 0;

          flex-shrink: 0;

          border: none;

          border-radius: 50%;

          background:
            #f3f6f6;

          color: #8995a5;

          display: flex;

          align-items: center;

          justify-content: center;

          cursor: pointer;
        }

        .products-search-clear:hover {
          background:
            var(--teal-light);

          color:
            var(--teal-dark);
        }

        /* CATEGORY SELECT */

        .products-category-select {
          height: 48px;

          padding:
            0 14px;

          border:
            1px solid
            #dce7e6;

          border-radius: 11px;

          outline: none;

          background: white;

          color:
            var(--text);

          font-size: 12px;

          font-weight: 700;

          cursor: pointer;
        }

        .products-category-select:focus {
          border-color:
            var(--teal);

          box-shadow:
            0 0 0 3px
            rgba(
              26,
              166,
              166,
              0.08
            );
        }

        /* ==========================================
           RESULTS
        ========================================== */

        .products-results-row {
          margin-bottom: 18px;

          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 15px;
        }

        .products-results-count {
          color:
            #8290a3;

          font-size: 12px;
        }

        .products-results-count strong {
          color:
            var(--text);
        }

        .products-active-category {
          padding:
            7px 11px;

          border-radius: 30px;

          background:
            var(--teal-light);

          color:
            var(--teal-dark);

          font-size: 10px;

          font-weight: 800;
        }

        /* ==========================================
           PRODUCT GRID
        ========================================== */

        .products-grid {
          display: grid;

          grid-template-columns:
            repeat(4, 1fr);

          gap: 22px;
        }

        .product-card {
          position: relative;

          overflow: hidden;

          border:
            1px solid
            var(--border);

          border-radius: 17px;

          background: white;

          cursor: pointer;

          outline: none;

          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            border-color 0.2s ease;
        }

        .product-card:hover {
          transform:
            translateY(-4px);

          border-color:
            rgba(
              26,
              166,
              166,
              0.35
            );

          box-shadow:
            0 14px 32px
            rgba(
              17,
              121,
              123,
              0.10
            );
        }

        .product-card:focus-visible {
          border-color:
            var(--teal);

          box-shadow:
            0 0 0 3px
            rgba(
              26,
              166,
              166,
              0.12
            );
        }

        /* IMAGE */

        .product-image {
          height: 220px;

          position: relative;

          display: flex;

          align-items: center;

          justify-content: center;

          overflow: hidden;

          background:
            linear-gradient(
              135deg,
              #f1fbfa,
              #e6f7f6
            );
        }

        .product-image img {
          width: 100%;

          height: 100%;

          object-fit: cover;

          display: block;

          transition:
            transform 0.3s ease;
        }

        .product-card:hover
        .product-image img {
          transform:
            scale(1.025);
        }

        .product-image-placeholder {
          color: #75d2ce;

          font-size: 55px;
        }

        /* FAVORITE */

        .product-favorite {
          width: 38px;

          height: 38px;

          position: absolute;

          top: 13px;

          right: 13px;

          z-index: 3;

          padding: 0;

          border: none;

          border-radius: 50%;

          background: white;

          color: #b5c0ce;

          display: flex;

          align-items: center;

          justify-content: center;

          box-shadow:
            0 4px 12px
            rgba(
              0,
              0,
              0,
              0.07
            );

          cursor: pointer;

          transition:
            transform 0.2s ease,
            color 0.2s ease;
        }

        .product-favorite:hover {
          transform:
            scale(1.06);

          color: #e4576b;
        }

        .product-favorite.active {
          color: #e4576b;
        }

        /* ==========================================
           PRODUCT INFO
        ========================================== */

        .product-info {
          padding: 18px 20px 20px;
        }

        .product-name {
          min-height: 0;

          margin:
            0 0 7px;

          color:
            #34455a;

          font-size: 15px;

          font-weight: 800;

          line-height: 1.35;
        }

        .product-category {
          margin-bottom: 12px;

          color:
            #91a0b3;

          font-size: 11px;
        }

        /*
          NEW:
          price + stock + cart are all in one row.
          This removes the large empty space that
          was under the price/stock.
        */

        .product-action-row {
          width: 100%;

          display: grid;

          grid-template-columns:
            auto 1fr auto;

          align-items: center;

          gap: 10px;

          margin-top: 4px;
        }

        .product-price {
          color:
            var(--text);

          font-size: 17px;

          font-weight: 900;

          white-space: nowrap;
        }

        .product-stock {
          justify-self: end;

          padding:
            5px 9px;

          border-radius: 20px;

          background:
            #eaf9f3;

          color:
            #21865d;

          font-size: 9px;

          font-weight: 800;

          white-space: nowrap;
        }

        .product-stock.low {
          background:
            #fff6e5;

          color:
            #b7791f;
        }

        .product-stock.out {
          background:
            #fff0f0;

          color:
            #d92d20;
        }

        /* ==========================================
           CART ICON
        ========================================== */

        .product-add-cart {
          width: 42px;

          height: 42px;

          flex-shrink: 0;

          padding: 0;

          border: none;

          border-radius: 50%;

          background:
            var(--teal);

          color: white;

          display: flex;

          align-items: center;

          justify-content: center;

          font-size: 15px;

          cursor: pointer;

          box-shadow:
            0 6px 14px
            rgba(
              17,
              121,
              123,
              0.16
            );

          transition:
            background 0.2s ease,
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .product-add-cart:hover:not(:disabled) {
          background:
            var(--teal-dark);

          transform:
            translateY(-2px)
            scale(1.04);

          box-shadow:
            0 8px 18px
            rgba(
              17,
              121,
              123,
              0.22
            );
        }

        .product-add-cart:disabled {
          background: #d5dddd;

          color: #8b9898;

          cursor:
            not-allowed;

          box-shadow: none;
        }        /* ==========================================
        EMPTY
     ========================================== */

     .products-empty {
       grid-column: 1 / -1;

       min-height: 300px;

       padding: 50px 20px;

       border:
         1px dashed
         #cfdfde;

       border-radius: 18px;

       background: white;

       display: flex;

       flex-direction: column;

       align-items: center;

       justify-content: center;

       text-align: center;
     }

     .products-empty > svg {
       margin-bottom: 15px;

       color:
         #8ed8d4;

       font-size: 48px;
     }

     .products-empty h3 {
       margin:
         0 0 7px;

       color:
         var(--text);

       font-size: 18px;
     }

     .products-empty p {
       margin: 0;

       color:
         var(--muted);

       font-size: 12px;
     }

     /* ==========================================
        RESPONSIVE
     ========================================== */

     @media (max-width: 1100px) {
       .products-grid {
         grid-template-columns:
           repeat(3, 1fr);
       }
     }

     @media (max-width: 850px) {
       .products-toolbar {
         grid-template-columns:
           1fr;
       }

       .products-grid {
         grid-template-columns:
           repeat(2, 1fr);
       }
     }

     @media (max-width: 560px) {
       .products-container {
         width: 92%;

         padding-top: 35px;
       }

       .products-heading h1 {
         font-size: 32px;
       }

       .products-grid {
         grid-template-columns:
           1fr;
       }

       .products-results-row {
         align-items:
           flex-start;

         flex-direction:
           column;
       }

       .product-action-row {
         grid-template-columns:
           auto 1fr auto;

         gap: 8px;
       }

       .product-stock {
         justify-self: end;
       }
     }
   `}</style>

   {/* =====================================================
       CONTENT
   ===================================================== */}

   <main className="products-container">

     <div className="products-heading">

       <div className="products-heading-badge">
         <FaPaw />
         Pet Store
       </div>

       <h1>All Products</h1>

       <p>
         Browse our complete collection of
         pet care products.
       </p>

     </div>

     {/* ===================================================
         SEARCH + FILTER
     =================================================== */}

     <div className="products-toolbar">

       <div className="products-search">

         <FaSearch />

         <input
           type="text"
           placeholder="Search products..."
           value={search}
           onChange={(event) =>
             setSearch(
               event.target.value
             )
           }
         />

         {search && (
           <button
             type="button"
             className="products-search-clear"
             onClick={() =>
               setSearch("")
             }
             aria-label="Clear search"
           >
             <FaTimes />
           </button>
         )}

       </div>

       <select
         className="products-category-select"
         value={category}
         onChange={(event) =>
           setCategory(
             event.target.value
           )
         }
       >

         <option value="All categories">
           All categories
         </option>

         {categories.map(
           (categoryItem) => (
             <option
               key={categoryItem.id}
               value={
                 categoryItem.title
               }
             >
               {categoryItem.title}
             </option>
           )
         )}

       </select>

     </div>

     {/* ===================================================
         RESULTS INFO
     =================================================== */}

     <div className="products-results-row">

       <div className="products-results-count">
         Showing{" "}
         <strong>
           {filteredProducts.length}
         </strong>{" "}
         product
         {filteredProducts.length !== 1
           ? "s"
           : ""}
       </div>

       {category !==
         "All categories" && (
         <div className="products-active-category">
           {category}
         </div>
       )}

     </div>

     {/* ===================================================
         PRODUCTS
     =================================================== */}

     <div className="products-grid">

       {filteredProducts.length ===
       0 ? (

         <div className="products-empty">

           <FaBoxOpen />

           <h3>
             No products found
           </h3>

           <p>
             {storeProducts.length ===
             0
               ? "Products enabled for the Store from Admin will appear here."
               : "Try another search or category."}
           </p>

         </div>

       ) : (

         filteredProducts.map(
           (product) => {

             const isFavorite =
               favorites.includes(
                 product.id
               );

             const stock =
               getProductStock(
                 product
               );

             const price =
               getProductPrice(
                 product
               );

             return (
               <article
                 className="product-card"
                 key={product.id}
                 role="button"
                 tabIndex={0}
                 onClick={() =>
                   openProduct(
                     product
                   )
                 }
                 onKeyDown={(
                   event
                 ) =>
                   handleProductKeyDown(
                     event,
                     product
                   )
                 }
                 aria-label={`View ${product.name}`}
               >

                 {/* FAVORITE */}

                 <button
                   type="button"
                   className={`product-favorite ${
                     isFavorite
                       ? "active"
                       : ""
                   }`}
                   onClick={(
                     event
                   ) =>
                     toggleFavorite(
                       event,
                       product.id
                     )
                   }
                   aria-label={`Favorite ${product.name}`}
                 >
                   <FaHeart />
                 </button>

                 {/* IMAGE */}

                 <div className="product-image">

                   {product.image ? (
                     <img
                       src={
                         product.image
                       }
                       alt={
                         product.name
                       }
                     />
                   ) : (
                     <FaPaw className="product-image-placeholder" />
                   )}

                 </div>

                 {/* INFO */}

                 <div className="product-info">

                   <h3 className="product-name">
                     {product.name}
                   </h3>

                   <div className="product-category">
                     {product.category ||
                       "Uncategorized"}
                   </div>

                   {/* PRICE + STOCK + CART
                       ALL ON SAME LEVEL */}

                   <div className="product-action-row">

                     <span className="product-price">
                       $
                       {price.toFixed(
                         2
                       )}
                     </span>

                     <span
                       className={`product-stock ${
                         stock <= 0
                           ? "out"
                           : stock <= 5
                           ? "low"
                           : ""
                       }`}
                     >
                       {stock <= 0
                         ? "Out of stock"
                         : `${stock} in stock`}
                     </span>

                     <button
                       type="button"
                       className="product-add-cart"
                       disabled={
                         stock <= 0
                       }
                       onClick={(
                         event
                       ) =>
                         addToCart(
                           event,
                           product
                         )
                       }
                       aria-label={
                         stock > 0
                           ? `Add ${product.name} to cart`
                           : `${product.name} is out of stock`
                       }
                       title={
                         stock > 0
                           ? "Add to Cart"
                           : "Out of Stock"
                       }
                     >
                       <FaCartPlus />
                     </button>

                   </div>

                 </div>

               </article>
             );
           }
         )

       )}

     </div>

   </main>

 </div>
);
}

export default Products;