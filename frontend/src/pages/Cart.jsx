import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaShoppingCart,
  FaMinus,
  FaPlus,
  FaTrash,
  FaPaw,
  FaTruck,
  FaStore,
  FaCreditCard,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaPhone,
  FaUser,
  FaClipboardList,
} from "react-icons/fa";

const DEFAULT_COLORS = {
  primaryColor: "#159f9f",
  secondaryColor: "#11797b",
  lightColor: "#e9f8f6",
  borderColor: "#dfe8e7",
  backgroundColor: "#ffffff",
  textColor: "#344054",
  buttonColor: "#159f9f",
  buttonTextColor: "#ffffff",
};

function readColors() {
  try {
    const settings = JSON.parse(
      localStorage.getItem("storeSettings") || "{}"
    );

    return {
      ...DEFAULT_COLORS,
      ...(settings.storeColors || {}),
    };
  } catch {
    return DEFAULT_COLORS;
  }
}

function readCart() {
  try {
    const saved = JSON.parse(
      localStorage.getItem("vetClinicStoreCart") || "[]"
    );

    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

const money = (value) => Number(value || 0).toFixed(2);

function readStoreBranding() {
  try {
    const settings = JSON.parse(
      localStorage.getItem("storeSettings") || "{}"
    );

    return {
      name:
        typeof settings?.storeName === "string"
          ? settings.storeName
          : "",
      logo:
        typeof settings?.storeBanner === "string"
          ? settings.storeBanner
          : "",
    };
  } catch {
    return { name: "", logo: "" };
  }
}

function Cart() {
  const navigate = useNavigate();

  const [branding, setBranding] = useState(readStoreBranding);
  const [cart, setCart] = useState(readCart);
  const [colors, setColors] = useState(readColors);
  const [checkoutStarted, setCheckoutStarted] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState("delivery");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    details: "",
    notes: "",
  });

  useEffect(() => {
    const refreshColors = () => {
      setColors(readColors());
      setBranding(readStoreBranding());
    };

    const refreshCart = () => setCart(readCart());

    const refreshStorage = () => {
      refreshColors();
      refreshCart();
    };

    window.addEventListener("storeSettingsUpdated", refreshColors);
    window.addEventListener("cartUpdated", refreshCart);
    window.addEventListener("storage", refreshStorage);

    return () => {
      window.removeEventListener("storeSettingsUpdated", refreshColors);
      window.removeEventListener("cartUpdated", refreshCart);
      window.removeEventListener("storage", refreshStorage);
    };
  }, []);

  const pageColors = {
    "--cart-primary": colors.primaryColor,
    "--cart-secondary": colors.secondaryColor,
    "--cart-light": colors.lightColor,
    "--cart-border": colors.borderColor,
    "--cart-background": colors.backgroundColor,
    "--cart-text": colors.textColor,
    "--cart-button": colors.buttonColor,
    "--cart-button-text": colors.buttonTextColor,
  };

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (sum, item) =>
          sum + Number(item.price || 0) * Number(item.quantity || 0),
        0
      ),
    [cart]
  );

  const deliveryFee =
    deliveryMethod === "delivery" && cart.length > 0 ? 5 : 0;

  const total = subtotal + deliveryFee;

  const totalItems = cart.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  const saveCart = (newCart) => {
    setCart(newCart);

    localStorage.setItem(
      "vetClinicStoreCart",
      JSON.stringify(newCart)
    );

    window.dispatchEvent(new Event("cartUpdated"));
  };

  const increaseQuantity = (productId) => {
    const updated = cart.map((item) => {
      if (String(item.id) !== String(productId)) return item;

      const quantity = Number(item.quantity || 0);
      const stock = Number(item.stock);

      if (Number.isFinite(stock) && stock > 0 && quantity >= stock) {
        return item;
      }

      return { ...item, quantity: quantity + 1 };
    });

    saveCart(updated);
  };

  const decreaseQuantity = (productId) => {
    const updated = cart
      .map((item) =>
        String(item.id) === String(productId)
          ? { ...item, quantity: Number(item.quantity || 0) - 1 }
          : item
      )
      .filter((item) => Number(item.quantity) > 0);

    saveCart(updated);
  };

  const removeItem = (productId) => {
    saveCart(
      cart.filter((item) => String(item.id) !== String(productId))
    );
  };

  const clearCart = () => saveCart([]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const startCheckout = () => {
    if (!cart.length) return;

    setCheckoutStarted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const placeOrder = (event) => {
    event.preventDefault();

    if (!formData.fullName.trim()) {
      alert("Please enter your full name.");
      return;
    }

    if (!formData.phone.trim()) {
      alert("Please enter your phone number.");
      return;
    }

    if (
      deliveryMethod === "delivery" &&
      !formData.address.trim()
    ) {
      alert("Please enter your delivery address.");
      return;
    }

    const order = {
      id: `ORD-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString(),
      customer: {
        fullName: formData.fullName,
        phone: formData.phone,
      },
      deliveryMethod,
      address:
        deliveryMethod === "delivery"
          ? formData.address
          : "Clinic Pickup",
      addressDetails: formData.details,
      notes: formData.notes,
      paymentMethod,
      items: cart,
      subtotal,
      deliveryFee,
      total,
      status: "Pending",
    };

    let existingOrders = [];

    try {
      const stored = JSON.parse(
        localStorage.getItem("vetClinicStoreOrders") || "[]"
      );
      existingOrders = Array.isArray(stored) ? stored : [];
    } catch {
      existingOrders = [];
    }

    localStorage.setItem(
      "vetClinicStoreOrders",
      JSON.stringify([order, ...existingOrders])
    );

    localStorage.removeItem("vetClinicStoreCart");
    setCart([]);
    window.dispatchEvent(new Event("cartUpdated"));
    setOrderComplete(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const Header = () => (
    <header className="cart-header">
      <div
        className="cart-logo"
        onClick={() => navigate("/store")}
      >
        {branding.logo && (
          <img
            src={branding.logo}
            alt={branding.name || "Store logo"}
            className="cart-brand-image"
          />
        )}

        <span>{branding.name}</span>
      </div>

      <div className="cart-header-right">
        <button
          type="button"
          className="cart-orders-button"
          onClick={() => navigate("/orders")}
        >
          <FaClipboardList />
          My Orders
        </button>

        {!orderComplete && (
          <div className="cart-header-cart">
            <FaShoppingCart />
            <span>{totalItems}</span>
          </div>
        )}
      </div>
    </header>
  );

  if (orderComplete) {
    return (
      <div className="cart-page" style={pageColors}>
        <style>{styles}</style>
        <Header />

        <main className="cart-success-wrapper">
          <div className="cart-success-card">
            <div className="cart-success-icon">
              <FaCheckCircle />
            </div>

            <h1>Order Placed!</h1>
            <p>Your order has been received successfully.</p>

            <div className="cart-success-total">
              <span>Order Total</span>
              <strong>${money(total)}</strong>
            </div>

            <button
              type="button"
              className="cart-primary-button"
              onClick={() => navigate("/orders")}
            >
              View My Orders
            </button>

            <button
              type="button"
              className="cart-secondary-button"
              onClick={() => navigate("/store")}
            >
              Continue Shopping
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="cart-page" style={pageColors}>
      <style>{styles}</style>
      <Header />

      <main className="cart-container">
        <button
          type="button"
          className="cart-back-button"
          onClick={() =>
            checkoutStarted
              ? setCheckoutStarted(false)
              : navigate("/store")
          }
        >
          <FaArrowLeft />

          <span>
            {checkoutStarted ? "Back to cart" : "Continue shopping"}
          </span>
        </button>

        {!checkoutStarted ? (
          <>
            <div className="cart-page-heading">
              <div>
                <h1>Your Cart</h1>
                <p>
                  {totalItems} {totalItems === 1 ? "item" : "items"} in
                  your cart
                </p>
              </div>

              {cart.length > 0 && (
                <button
                  type="button"
                  className="cart-clear-button"
                  onClick={clearCart}
                >
                  <FaTrash />
                  Clear cart
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="cart-empty">
                <div className="cart-empty-icon">
                  <FaShoppingCart />
                </div>

                <h2>Your cart is empty</h2>
                <p>
                  Browse our store and add products for your pet.
                </p>

                <button
                  type="button"
                  className="cart-primary-button"
                  onClick={() => navigate("/store")}
                >
                  Browse Products
                </button>
              </div>
            ) : (
              <div className="cart-layout">
                <section className="cart-items-card">
                  <div className="cart-card-title">
                    <FaShoppingCart />
                    <div>
                      <h2>Shopping Cart</h2>
                      <p>Review your selected products.</p>
                    </div>
                  </div>

                  <div className="cart-items-list">
                    {cart.map((item) => {
                      const stock = Number(item.stock);
                      const reachedStock =
                        Number.isFinite(stock) &&
                        stock > 0 &&
                        Number(item.quantity) >= stock;

                      return (
                        <div className="cart-item" key={item.id}>
                          <div className="cart-item-image">
                            {item.image ? (
                              <img src={item.image} alt={item.name} />
                            ) : (
                              <FaPaw />
                            )}
                          </div>

                          <div className="cart-item-info">
                            <h3>{item.name}</h3>
                            <span>{item.category}</span>
                            <strong>${money(item.price)}</strong>
                          </div>

                          <div className="cart-item-actions">
                            <div className="cart-quantity">
                              <button
                                type="button"
                                aria-label="Decrease quantity"
                                onClick={() =>
                                  decreaseQuantity(item.id)
                                }
                              >
                                <FaMinus />
                              </button>

                              <span>{item.quantity}</span>

                              <button
                                type="button"
                                aria-label="Increase quantity"
                                onClick={() =>
                                  increaseQuantity(item.id)
                                }
                                disabled={reachedStock}
                              >
                                <FaPlus />
                              </button>
                            </div>

                            <strong className="cart-item-total">
                              $
                              {money(
                                Number(item.price || 0) *
                                  Number(item.quantity || 0)
                              )}
                            </strong>

                            <button
                              type="button"
                              className="cart-delete"
                              aria-label="Remove product"
                              title="Remove product"
                              onClick={() => removeItem(item.id)}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <aside className="cart-summary">
                  <h2>Order Summary</h2>

                  <div className="cart-summary-line">
                    <span>Subtotal</span>
                    <strong>${money(subtotal)}</strong>
                  </div>

                  <div className="cart-summary-line">
                    <span>Delivery</span>
                    <span>Calculated at checkout</span>
                  </div>

                  <div className="cart-summary-divider" />

                  <div className="cart-summary-total">
                    <span>Total</span>
                    <strong>${money(subtotal)}</strong>
                  </div>

                  <button
                    type="button"
                    className="cart-primary-button"
                    onClick={startCheckout}
                  >
                    Proceed to Checkout
                  </button>

                  <button
                    type="button"
                    className="cart-secondary-button"
                    onClick={() => navigate("/store")}
                  >
                    Continue Shopping
                  </button>

                  <div className="cart-secure-note">
                    <FaCheckCircle />
                    Secure clinic checkout
                  </div>
                </aside>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="cart-page-heading">
              <div>
                <h1>Checkout</h1>
                <p>Complete your order information.</p>
              </div>
            </div>

            <div className="checkout-progress">
              <div className="checkout-step active">
                <span>1</span>Contact
              </div>
              <div className="checkout-progress-line active" />
              <div className="checkout-step active">
                <span>2</span>Delivery
              </div>
              <div className="checkout-progress-line active" />
              <div className="checkout-step active">
                <span>3</span>Payment
              </div>
              <div className="checkout-progress-line" />
              <div className="checkout-step">
                <span>4</span>Review
              </div>
            </div>

            <form className="checkout-layout" onSubmit={placeOrder}>
              <div className="checkout-left">
                <section className="checkout-card">
                  <div className="checkout-card-heading">
                    <div className="checkout-heading-icon">
                      <FaUser />
                    </div>
                    <div>
                      <h2>Contact Information</h2>
                      <p>Tell us who this order is for.</p>
                    </div>
                  </div>

                  <div className="checkout-fields two">
                    <div className="checkout-field">
                      <label htmlFor="cart-full-name">
                        Full Name *
                      </label>

                      <div className="checkout-input-icon">
                        <FaUser />
                        <input
                          id="cart-full-name"
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          placeholder="Enter full name"
                        />
                      </div>
                    </div>

                    <div className="checkout-field">
                      <label htmlFor="cart-phone">Phone *</label>

                      <div className="checkout-input-icon">
                        <FaPhone />
                        <input
                          id="cart-phone"
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+961"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <section className="checkout-card">
                  <div className="checkout-card-heading">
                    <div className="checkout-heading-icon">
                      <FaTruck />
                    </div>
                    <div>
                      <h2>Delivery Method</h2>
                      <p>Choose delivery or clinic pickup.</p>
                    </div>
                  </div>

                  <div className="delivery-options">
                    <button
                      type="button"
                      className={`delivery-option ${
                        deliveryMethod === "delivery" ? "active" : ""
                      }`}
                      onClick={() => setDeliveryMethod("delivery")}
                    >
                      <span className="delivery-radio">
                        <span />
                      </span>

                      <span className="delivery-option-icon">
                        <FaTruck />
                      </span>

                      <span>
                        <strong>Home Delivery</strong>
                        <p>Delivered to your address</p>
                      </span>

                      <b>$5.00</b>
                    </button>

                    <button
                      type="button"
                      className={`delivery-option ${
                        deliveryMethod === "pickup" ? "active" : ""
                      }`}
                      onClick={() => setDeliveryMethod("pickup")}
                    >
                      <span className="delivery-radio">
                        <span />
                      </span>

                      <span className="delivery-option-icon">
                        <FaStore />
                      </span>

                      <span>
                        <strong>Clinic Pickup</strong>
                        <p>Pick up from Vet Clinic</p>
                      </span>

                      <b>Free</b>
                    </button>
                  </div>

                  {deliveryMethod === "delivery" && (
                    <div className="checkout-address">
                      <div className="checkout-field">
                        <label htmlFor="cart-address">
                          Delivery Address *
                        </label>

                        <div className="checkout-input-icon">
                          <FaMapMarkerAlt />
                          <input
                            id="cart-address"
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="Area / city"
                          />
                        </div>
                      </div>

                      <div className="checkout-field">
                        <label htmlFor="cart-details">
                          Address Details
                        </label>
                        <input
                          id="cart-details"
                          type="text"
                          name="details"
                          value={formData.details}
                          onChange={handleInputChange}
                          placeholder="Street, building, floor..."
                        />
                      </div>
                    </div>
                  )}
                </section>

                <section className="checkout-card">
                  <div className="checkout-card-heading">
                    <div className="checkout-heading-icon">
                      <FaCreditCard />
                    </div>
                    <div>
                      <h2>Payment</h2>
                      <p>Choose your payment method.</p>
                    </div>
                  </div>

                  <div className="payment-options">
                    <button
                      type="button"
                      className={`payment-option ${
                        paymentMethod === "cash" ? "active" : ""
                      }`}
                      onClick={() => setPaymentMethod("cash")}
                    >
                      <span className="payment-radio">
                        <span />
                      </span>
                      <span>
                        <strong>Cash on Delivery / Pickup</strong>
                        <p>Pay when you receive your order.</p>
                      </span>
                    </button>

                    <button
                      type="button"
                      className={`payment-option ${
                        paymentMethod === "card" ? "active" : ""
                      }`}
                      onClick={() => setPaymentMethod("card")}
                    >
                      <span className="payment-radio">
                        <span />
                      </span>
                      <span>
                        <strong>Card at Clinic</strong>
                        <p>Pay by card when collecting your order.</p>
                      </span>
                    </button>
                  </div>
                </section>

                <section className="checkout-card">
                  <div className="checkout-card-heading">
                    <div className="checkout-heading-icon">
                      <FaClipboardList />
                    </div>
                    <div>
                      <h2>Order Notes</h2>
                      <p>Add optional instructions.</p>
                    </div>
                  </div>

                  <div className="checkout-field">
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Any special instructions for your order..."
                      rows={4}
                    />
                  </div>
                </section>
              </div>

              <aside className="checkout-summary">
                <h2>Order Summary</h2>

                <div className="checkout-products">
                  {cart.map((item) => (
                    <div className="checkout-product" key={item.id}>
                      <div className="checkout-product-image">
                        {item.image ? (
                          <img src={item.image} alt={item.name} />
                        ) : (
                          <FaPaw />
                        )}
                        <span>{item.quantity}</span>
                      </div>

                      <div className="checkout-product-info">
                        <strong>{item.name}</strong>
                        <span>{item.category}</span>
                      </div>

                      <b>
                        $
                        {money(
                          Number(item.price || 0) *
                            Number(item.quantity || 0)
                        )}
                      </b>
                    </div>
                  ))}
                </div>

                <div className="checkout-summary-divider" />

                <div className="cart-summary-line">
                  <span>Subtotal</span>
                  <strong>${money(subtotal)}</strong>
                </div>

                <div className="cart-summary-line">
                  <span>
                    {deliveryMethod === "delivery"
                      ? "Delivery"
                      : "Clinic Pickup"}
                  </span>
                  <strong>
                    {deliveryFee === 0
                      ? "Free"
                      : `$${money(deliveryFee)}`}
                  </strong>
                </div>

                <div className="checkout-summary-divider" />

                <div className="cart-summary-total">
                  <span>Total</span>
                  <strong>${money(total)}</strong>
                </div>

                <button type="submit" className="cart-primary-button">
                  <FaCheckCircle />
                  Place Order
                </button>

                <div className="checkout-safe">
                  <FaCheckCircle />
                  Your order information is securely processed.
                </div>
              </aside>
            </form>
          </>
        )}
      </main>
    </div>
  );
}const styles = `
/* PAGE / GLOBAL BUTTON RESET */

.cart-page,
.cart-page * {
  box-sizing: border-box;
}

.cart-page {
  min-height: 100vh;
  width: 100%;
  overflow-x: hidden;
  background: #f7faf9;
  color: var(--cart-text);
  font-family: Arial, Helvetica, sans-serif;
}

.cart-page button {
  font-family: inherit;
  box-sizing: border-box;
  opacity: 1;
  visibility: visible;
  text-decoration: none;
  line-height: 1.3;
  transform: none;
}

.cart-page button svg {
  display: inline-block;
  flex-shrink: 0;
  vertical-align: middle;
}

.cart-page button:focus-visible {
  outline: 2px solid var(--cart-primary);
  outline-offset: 3px;
}

/* HEADER */

.cart-page .cart-header {
  height: 70px;
  padding: 0 5%;
  background: var(--cart-background);
  border-bottom: 1px solid var(--cart-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.cart-page .cart-logo {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  color: var(--cart-secondary);
  font-size: 19px;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
}

.cart-page .cart-logo > svg {
  color: var(--cart-primary);
  font-size: 29px;
}

.cart-page .cart-logo .cart-brand-image {
  display: block;
  width: 29px;
  height: 29px;
  object-fit: contain;
  flex-shrink: 0;
}

.cart-page .cart-logo b {
  color: var(--cart-primary);
}

.cart-page .cart-header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cart-page button.cart-orders-button {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 8px !important;
  width: auto !important;
  min-width: 0 !important;
  max-width: max-content !important;
  height: 39px !important;
  min-height: 39px !important;
  margin: 0 !important;
  padding: 0 14px !important;
  flex: 0 0 auto !important;
  border: 1px solid var(--cart-border) !important;
  border-radius: 7px !important;
  background: var(--cart-background) !important;
  color: var(--cart-text) !important;
  font-size: 11px !important;
  font-weight: 700 !important;
  white-space: nowrap;
  cursor: pointer;
  transition: background .2s, color .2s, border-color .2s;
}

.cart-page button.cart-orders-button svg {
  font-size: 13px;
}

.cart-page button.cart-orders-button:hover {
  background: var(--cart-light) !important;
  color: var(--cart-secondary) !important;
  border-color: var(--cart-primary) !important;
}

.cart-page .cart-header-cart {
  min-width: 43px;
  height: 39px;
  padding: 0 10px;
  border-radius: 7px;
  background: var(--cart-light);
  color: var(--cart-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  font-size: 12px;
  font-weight: 800;
}

.cart-page .cart-header-cart svg {
  font-size: 15px;
}

/* CONTAINER / BACK BUTTON */

.cart-page .cart-container {
  width: min(1250px, 92%);
  margin: 0 auto;
  padding: 28px 0 60px;
}

.cart-page button.cart-back-button {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: flex-start !important;
  gap: 9px !important;
  width: fit-content !important;
  min-width: 0 !important;
  max-width: max-content !important;
  height: auto !important;
  min-height: 28px !important;
  margin: 0 0 22px !important;
  padding: 3px 0 !important;
  flex: 0 0 auto !important;
  border: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
  color: #667085 !important;
  font-size: 11px !important;
  font-weight: 700 !important;
  white-space: nowrap;
  cursor: pointer;
  transition: color .2s;
}

.cart-page button.cart-back-button svg {
  font-size: 13px;
}

.cart-page button.cart-back-button:hover {
  background: transparent !important;
  color: var(--cart-primary) !important;
}

/* PAGE HEADING / CLEAR CART */

.cart-page .cart-page-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 23px;
}

.cart-page .cart-page-heading h1 {
  margin: 0;
  color: var(--cart-text);
  font-size: 28px;
  font-weight: 800;
  line-height: 1.2;
}

.cart-page .cart-page-heading p {
  margin: 7px 0 0;
  color: #98a2b3;
  font-size: 11px;
}

.cart-page button.cart-clear-button {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 7px !important;
  width: auto !important;
  min-width: 0 !important;
  max-width: max-content !important;
  height: 34px !important;
  min-height: 34px !important;
  margin: 0 !important;
  padding: 0 13px !important;
  flex: 0 0 auto !important;
  align-self: flex-end;
  border: 1px solid #f0cccc !important;
  border-radius: 7px !important;
  background: #ffffff !important;
  color: #d92d20 !important;
  font-size: 11px !important;
  font-weight: 700 !important;
  white-space: nowrap;
  cursor: pointer;
  transition: background .2s, border-color .2s, color .2s;
}

.cart-page button.cart-clear-button svg {
  font-size: 12px;
}

.cart-page button.cart-clear-button:hover {
  background: #fff1f0 !important;
  border-color: #d92d20 !important;
  color: #b42318 !important;
}

/* CART LAYOUT */

.cart-page .cart-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 330px;
  gap: 20px;
  align-items: start;
}

.cart-page .cart-items-card,
.cart-page .cart-summary,
.cart-page .checkout-card,
.cart-page .checkout-summary {
  min-width: 0;
  border: 1px solid var(--cart-border);
  border-radius: 12px;
  background: var(--cart-background);
}

.cart-page .cart-card-title {
  padding: 18px 20px;
  border-bottom: 1px solid var(--cart-border);
  display: flex;
  align-items: center;
  gap: 11px;
}

.cart-page .cart-card-title > svg {
  color: var(--cart-primary);
  font-size: 19px;
  flex-shrink: 0;
}

.cart-page .cart-card-title h2 {
  margin: 0;
  color: var(--cart-text);
  font-size: 14px;
}

.cart-page .cart-card-title p {
  margin: 4px 0 0;
  color: #98a2b3;
  font-size: 10px;
}

.cart-page .cart-items-list {
  padding: 0 20px;
}

.cart-page .cart-item {
  min-height: 120px;
  padding: 18px 0;
  border-bottom: 1px solid var(--cart-border);
  display: grid;
  grid-template-columns: 90px minmax(0, 1fr) auto;
  gap: 15px;
  align-items: center;
}

.cart-page .cart-item:last-child {
  border-bottom: 0;
}

.cart-page .cart-item-image {
  width: 90px;
  height: 85px;
  border-radius: 8px;
  background: #f4f8f7;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a2b9b6;
  font-size: 32px;
  overflow: hidden;
}

.cart-page .cart-item-image img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cart-page .cart-item-info {
  min-width: 0;
}

.cart-page .cart-item-info h3 {
  margin: 0;
  color: var(--cart-text);
  font-size: 12px;
  overflow-wrap: anywhere;
}

.cart-page .cart-item-info span {
  display: block;
  margin-top: 5px;
  color: #98a2b3;
  font-size: 10px;
}

.cart-page .cart-item-info strong {
  display: block;
  margin-top: 10px;
  color: var(--cart-primary);
  font-size: 12px;
}

.cart-page .cart-item-actions {
  display: flex;
  align-items: center;
  gap: 18px;
}

/* QUANTITY BUTTONS */

.cart-page .cart-quantity {
  height: 35px;
  border: 1px solid var(--cart-border);
  border-radius: 7px;
  display: inline-flex;
  align-items: center;
  flex: 0 0 auto;
  overflow: hidden;
  background: var(--cart-background);
}

.cart-page .cart-quantity button {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 34px !important;
  min-width: 34px !important;
  max-width: 34px !important;
  height: 33px !important;
  min-height: 33px !important;
  margin: 0 !important;
  padding: 0 !important;
  flex: 0 0 34px !important;
  border: 0 !important;
  border-radius: 0 !important;
  background: var(--cart-background) !important;
  color: #667085 !important;
  font-size: 11px !important;
  cursor: pointer;
}

.cart-page .cart-quantity button svg {
  font-size: 10px;
}

.cart-page .cart-quantity button:hover:not(:disabled) {
  background: var(--cart-light) !important;
  color: var(--cart-primary) !important;
}

.cart-page .cart-quantity button:disabled {
  opacity: .35;
  cursor: not-allowed;
}

.cart-page .cart-quantity span {
  width: 30px;
  flex: 0 0 30px;
  text-align: center;
  color: var(--cart-text);
  font-size: 11px;
  font-weight: 700;
}

.cart-page .cart-item-total {
  min-width: 60px;
  color: var(--cart-text);
  font-size: 12px;
  text-align: right;
}

.cart-page button.cart-delete {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 33px !important;
  min-width: 33px !important;
  max-width: 33px !important;
  height: 33px !important;
  min-height: 33px !important;
  margin: 0 !important;
  padding: 0 !important;
  flex: 0 0 33px !important;
  border: 0 !important;
  border-radius: 7px !important;
  background: #fff1f0 !important;
  color: #d92d20 !important;
  cursor: pointer;
}

.cart-page button.cart-delete svg {
  font-size: 13px;
}

.cart-page button.cart-delete:hover {
  background: #fee4e2 !important;
  color: #b42318 !important;
}

/* ORDER SUMMARY */

.cart-page .cart-summary,
.cart-page .checkout-summary {
  padding: 20px;
  position: sticky;
  top: 90px;
}

.cart-page .cart-summary h2,
.cart-page .checkout-summary h2 {
  margin: 0 0 22px;
  color: var(--cart-text);
  font-size: 15px;
}

.cart-page .cart-summary-line {
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  color: #667085;
  font-size: 11px;
}

.cart-page .cart-summary-line strong {
  color: var(--cart-text);
  text-align: right;
}

.cart-page .cart-summary-divider,
.cart-page .checkout-summary-divider {
  height: 1px;
  margin: 17px 0;
  background: var(--cart-border);
}

.cart-page .cart-summary-total {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: var(--cart-text);
  font-size: 13px;
  font-weight: 700;
}

.cart-page .cart-summary-total strong {
  color: var(--cart-primary);
  font-size: 21px;
}

/* PRIMARY BUTTON */

.cart-page button.cart-primary-button {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 8px !important;
  width: 100% !important;
  min-width: 0 !important;
  max-width: 100% !important;
  height: 43px !important;
  min-height: 43px !important;
  margin: 0 !important;
  padding: 0 15px !important;
  flex: 0 0 auto !important;
  border: 1px solid var(--cart-button) !important;
  border-radius: 7px !important;
  background: var(--cart-button) !important;
  color: var(--cart-button-text) !important;
  font-size: 11px !important;
  font-weight: 800 !important;
  text-align: center;
  cursor: pointer;
  transition: filter .2s, box-shadow .2s;
}

.cart-page button.cart-primary-button svg {
  font-size: 14px;
}

.cart-page button.cart-primary-button:hover {
  background: var(--cart-button) !important;
  color: var(--cart-button-text) !important;
  border-color: var(--cart-button) !important;
  filter: brightness(.9);
  box-shadow: 0 4px 12px rgba(0,0,0,.09);
}

/* CONTINUE SHOPPING BUTTON */

.cart-page button.cart-secondary-button {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 8px !important;
  width: 100% !important;
  min-width: 0 !important;
  max-width: 100% !important;
  height: 41px !important;
  min-height: 41px !important;
  margin: 9px 0 0 !important;
  padding: 0 15px !important;
  flex: 0 0 auto !important;
  border: 1px solid var(--cart-border) !important;
  border-radius: 7px !important;
  background: var(--cart-background) !important;
  color: var(--cart-text) !important;
  font-size: 11px !important;
  font-weight: 700 !important;
  text-align: center;
  cursor: pointer;
  transition:
    background .2s,
    color .2s,
    border-color .2s;
}

.cart-page button.cart-secondary-button:hover {
  background: var(--cart-light) !important;
  color: var(--cart-secondary) !important;
  border-color: var(--cart-primary) !important;
}

.cart-page .cart-secure-note,
.cart-page .checkout-safe {
  margin-top: 16px;
  color: #98a2b3;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  font-size: 9px;
  text-align: center;
}

.cart-page .cart-secure-note svg,
.cart-page .checkout-safe svg {
  color: var(--cart-primary);
  font-size: 12px;
  flex-shrink: 0;
}

/* EMPTY CART */

.cart-page .cart-empty {
  min-height: 390px;
  padding: 25px;
  border: 1px solid var(--cart-border);
  border-radius: 12px;
  background: var(--cart-background);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.cart-page .cart-empty-icon {
  width: 70px;
  height: 70px;
  margin-bottom: 16px;
  border-radius: 50%;
  background: var(--cart-light);
  color: var(--cart-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.cart-page .cart-empty h2 {
  margin: 0;
  color: var(--cart-text);
  font-size: 17px;
}

.cart-page .cart-empty p {
  margin: 8px 0 20px;
  color: #98a2b3;
  font-size: 11px;
}

.cart-page .cart-empty button.cart-primary-button {
  width: auto !important;
  min-width: 155px !important;
}

/* CHECKOUT PROGRESS */

.cart-page .checkout-progress {
  max-width: 700px;
  margin: 0 auto 28px;
  display: flex;
  align-items: center;
}

.cart-page .checkout-step {
  min-width: 70px;
  color: #98a2b3;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  font-size: 9px;
  font-weight: 700;
}

.cart-page .checkout-step span {
  width: 27px;
  height: 27px;
  border: 1px solid var(--cart-border);
  border-radius: 50%;
  background: var(--cart-background);
  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-page .checkout-step.active {
  color: var(--cart-primary);
}

.cart-page .checkout-step.active span {
  border-color: var(--cart-primary);
  background: var(--cart-primary);
  color: #ffffff;
}

.cart-page .checkout-progress-line {
  flex: 1;
  height: 1px;
  margin-bottom: 19px;
  background: var(--cart-border);
}

.cart-page .checkout-progress-line.active {
  background: var(--cart-primary);
}

/* CHECKOUT */

.cart-page .checkout-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 350px;
  gap: 20px;
  align-items: start;
}

.cart-page .checkout-left {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.cart-page .checkout-card {
  padding: 20px;
}

.cart-page .checkout-card-heading {
  margin-bottom: 19px;
  display: flex;
  align-items: center;
  gap: 11px;
}

.cart-page .checkout-heading-icon {
  width: 35px;
  height: 35px;
  flex: 0 0 35px;
  border-radius: 8px;
  background: var(--cart-light);
  color: var(--cart-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
}

.cart-page .checkout-card-heading h2 {
  margin: 0;
  color: var(--cart-text);
  font-size: 13px;
}

.cart-page .checkout-card-heading p {
  margin: 4px 0 0;
  color: #98a2b3;
  font-size: 10px;
}

.cart-page .checkout-fields.two {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.cart-page .checkout-field {
  width: 100%;
  min-width: 0;
}

.cart-page .checkout-field label {
  display: block;
  margin-bottom: 6px;
  color: var(--cart-text);
  font-size: 10px;
  font-weight: 700;
}

.cart-page .checkout-field input,
.cart-page .checkout-field textarea {
  display: block;
  width: 100%;
  min-width: 0;
  border: 1px solid var(--cart-border);
  border-radius: 7px;
  background: var(--cart-background);
  color: var(--cart-text);
  outline: none;
  font-family: inherit;
  font-size: 11px;
}

.cart-page .checkout-field input {
  height: 42px;
  padding: 0 12px;
}

.cart-page .checkout-field textarea {
  padding: 12px;
  resize: vertical;
}

.cart-page .checkout-field input:focus,
.cart-page .checkout-field textarea:focus {
  border-color: var(--cart-primary);
  box-shadow: 0 0 0 3px var(--cart-light);
}

.cart-page .checkout-input-icon {
  position: relative;
}

.cart-page .checkout-input-icon > svg {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #98a2b3;
  font-size: 13px;
  pointer-events: none;
}

.cart-page .checkout-input-icon input {
  padding-left: 34px;
}

/* DELIVERY OPTIONS */

.cart-page .delivery-options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.cart-page button.delivery-option {
  display: grid !important;
  grid-template-columns: auto auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 9px;
  width: 100% !important;
  min-width: 0 !important;
  min-height: 80px !important;
  margin: 0 !important;
  padding: 12px !important;
  border: 1px solid var(--cart-border) !important;
  border-radius: 8px !important;
  background: var(--cart-background) !important;
  color: var(--cart-text) !important;
  text-align: left;
  cursor: pointer;
}

.cart-page button.delivery-option:hover {
  border-color: var(--cart-primary) !important;
  background: var(--cart-light) !important;
  color: var(--cart-text) !important;
}

.cart-page button.delivery-option.active {
  border-color: var(--cart-primary) !important;
  background: var(--cart-light) !important;
}

.cart-page .delivery-radio,
.cart-page .payment-radio {
  width: 15px;
  height: 15px;
  flex: 0 0 15px;
  border: 1px solid #cfd9d8;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-page .delivery-option.active .delivery-radio,
.cart-page .payment-option.active .payment-radio {
  border-color: var(--cart-primary);
}

.cart-page .delivery-option.active .delivery-radio span,
.cart-page .payment-option.active .payment-radio span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--cart-primary);
}

.cart-page .delivery-option-icon {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  background: var(--cart-light);
  color: var(--cart-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.cart-page .delivery-option strong {
  display: block;
  color: var(--cart-text);
  font-size: 10px;
}

.cart-page .delivery-option p {
  margin: 3px 0 0;
  color: #98a2b3;
  font-size: 9px;
}

.cart-page .delivery-option b {
  color: var(--cart-primary);
  font-size: 10px;
  white-space: nowrap;
}

.cart-page .checkout-address {
  margin-top: 15px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

/* PAYMENT OPTIONS */

.cart-page .payment-options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.cart-page button.payment-option {
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
  width: 100% !important;
  min-width: 0 !important;
  min-height: 70px !important;
  margin: 0 !important;
  padding: 13px !important;
  border: 1px solid var(--cart-border) !important;
  border-radius: 8px !important;
  background: var(--cart-background) !important;
  color: var(--cart-text) !important;
  text-align: left;
  cursor: pointer;
}

.cart-page button.payment-option:hover {
  border-color: var(--cart-primary) !important;
  background: var(--cart-light) !important;
  color: var(--cart-text) !important;
}

.cart-page button.payment-option.active {
  border-color: var(--cart-primary) !important;
  background: var(--cart-light) !important;
}

.cart-page .payment-option strong {
  display: block;
  color: var(--cart-text);
  font-size: 10px;
}

.cart-page .payment-option p {
  margin: 4px 0 0;
  color: #98a2b3;
  font-size: 9px;
}

/* CHECKOUT PRODUCTS */

.cart-page .checkout-products {
  max-height: 300px;
  overflow-y: auto;
}

.cart-page .checkout-product {
  padding: 10px 0;
  border-bottom: 1px solid var(--cart-border);
  display: grid;
  grid-template-columns: 43px minmax(0, 1fr) auto;
  gap: 9px;
  align-items: center;
}

.cart-page .checkout-product-image {
  width: 43px;
  height: 43px;
  border-radius: 7px;
  background: #f3f7f6;
  color: #9db4b1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  font-size: 18px;
}

.cart-page .checkout-product-image img {
  width: 100%;
  height: 100%;
  border-radius: 7px;
  object-fit: cover;
}

.cart-page .checkout-product-image > span {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 17px;
  height: 17px;
  border-radius: 50%;
  background: var(--cart-primary);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 700;
}

.cart-page .checkout-product-info {
  min-width: 0;
}

.cart-page .checkout-product-info strong {
  display: block;
  color: var(--cart-text);
  font-size: 10px;
  overflow-wrap: anywhere;
}

.cart-page .checkout-product-info span {
  display: block;
  margin-top: 3px;
  color: #98a2b3;
  font-size: 9px;
}

.cart-page .checkout-product > b {
  color: var(--cart-text);
  font-size: 10px;
}

/* SUCCESS PAGE */

.cart-page .cart-success-wrapper {
  min-height: calc(100vh - 70px);
  padding: 40px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-page .cart-success-card {
  width: min(420px, 100%);
  padding: 40px;
  border: 1px solid var(--cart-border);
  border-radius: 15px;
  background: var(--cart-background);
  text-align: center;
  box-shadow: 0 15px 40px rgba(16,24,40,.06);
}

.cart-page .cart-success-icon {
  width: 70px;
  height: 70px;
  margin: 0 auto 18px;
  border-radius: 50%;
  background: var(--cart-light);
  color: var(--cart-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
}

.cart-page .cart-success-card h1 {
  margin: 0;
  color: var(--cart-text);
  font-size: 24px;
}

.cart-page .cart-success-card > p {
  margin: 8px 0 22px;
  color: #98a2b3;
  font-size: 11px;
}

.cart-page .cart-success-total {
  margin-bottom: 20px;
  padding: 14px;
  border-radius: 8px;
  background: var(--cart-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  color: var(--cart-text);
  font-size: 11px;
}

.cart-page .cart-success-total strong {
  color: var(--cart-primary);
  font-size: 18px;
}

/* RESPONSIVE */

@media (max-width: 900px) {
  .cart-page .cart-layout,
  .cart-page .checkout-layout {
    grid-template-columns: minmax(0, 1fr);
  }

  .cart-page .cart-summary,
  .cart-page .checkout-summary {
    position: static;
  }

  .cart-page .delivery-options,
  .cart-page .payment-options {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 650px) {
  .cart-page .cart-header {
    padding: 0 4%;
  }

  .cart-page .cart-container {
    width: 92%;
  }

  .cart-page .cart-page-heading h1 {
    font-size: 25px;
  }

  .cart-page .cart-item {
    grid-template-columns: 70px minmax(0, 1fr);
    gap: 12px;
  }

  .cart-page .cart-item-image {
    width: 70px;
    height: 70px;
  }

  .cart-page .cart-item-actions {
    grid-column: 1 / -1;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 12px;
  }

  .cart-page .checkout-fields.two,
  .cart-page .checkout-address {
    grid-template-columns: minmax(0, 1fr);
  }

  .cart-page .checkout-progress {
    overflow-x: auto;
    padding-bottom: 8px;
  }

  .cart-page button.cart-orders-button {
    padding: 0 10px !important;
  }

  .cart-page .cart-logo {
    font-size: 16px;
  }

  .cart-page .cart-logo > svg {
    font-size: 25px;
  }
}
`;

export default Cart;