import { useMemo, useState } from "react";
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

function Cart() {
  const navigate = useNavigate();

  // =========================================
  // LOAD CART
  // =========================================

  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem(
        "vetClinicStoreCart"
      );

      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });

  const [checkoutStarted, setCheckoutStarted] =
    useState(false);

  const [orderComplete, setOrderComplete] =
    useState(false);

  const [deliveryMethod, setDeliveryMethod] =
    useState("delivery");

  const [paymentMethod, setPaymentMethod] =
    useState("cash");

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    details: "",
    notes: "",
  });

  // =========================================
  // TOTALS
  // =========================================

  const subtotal = useMemo(() => {
    return cart.reduce(
      (total, item) =>
        total + item.price * item.quantity,
      0
    );
  }, [cart]);

  const deliveryFee =
    deliveryMethod === "delivery" &&
    cart.length > 0
      ? 5
      : 0;

  const total = subtotal + deliveryFee;

  const totalItems = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // =========================================
  // SAVE CART
  // =========================================

  const saveCart = (newCart) => {
    setCart(newCart);

    localStorage.setItem(
      "vetClinicStoreCart",
      JSON.stringify(newCart)
    );
  };

  // =========================================
  // QUANTITY
  // =========================================

  const increaseQuantity = (productId) => {
    const updatedCart = cart.map((item) => {
      if (item.id !== productId) {
        return item;
      }

      if (item.quantity >= item.stock) {
        return item;
      }

      return {
        ...item,
        quantity: item.quantity + 1,
      };
    });

    saveCart(updatedCart);
  };

  const decreaseQuantity = (productId) => {
    const updatedCart = cart
      .map((item) =>
        item.id === productId
          ? {
              ...item,
              quantity: item.quantity - 1,
            }
          : item
      )
      .filter((item) => item.quantity > 0);

    saveCart(updatedCart);
  };

  const removeItem = (productId) => {
    const updatedCart = cart.filter(
      (item) => item.id !== productId
    );

    saveCart(updatedCart);
  };

  const clearCart = () => {
    saveCart([]);
  };

  // =========================================
  // FORM
  // =========================================

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // =========================================
  // CHECKOUT
  // =========================================

  const startCheckout = () => {
    if (cart.length === 0) {
      return;
    }

    setCheckoutStarted(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
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
      id: `ORD-${Date.now()
        .toString()
        .slice(-6)}`,

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

    // SAVE ORDER

    try {
      const existingOrders =
        JSON.parse(
          localStorage.getItem(
            "vetClinicStoreOrders"
          )
        ) || [];

      localStorage.setItem(
        "vetClinicStoreOrders",
        JSON.stringify([
          order,
          ...existingOrders,
        ])
      );
    } catch {
      localStorage.setItem(
        "vetClinicStoreOrders",
        JSON.stringify([order])
      );
    }

    // CLEAR CART

    localStorage.removeItem(
      "vetClinicStoreCart"
    );

    setCart([]);

    setOrderComplete(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================================
  // SUCCESS
  // =========================================

  if (orderComplete) {
    return (
      <div className="cart-page">
        <style>{styles}</style>

        <header className="cart-header">
          <div
            className="cart-logo"
            onClick={() => navigate("/store")}
          >
            <FaPaw />

            <span>
              Vet <b>Clinic</b>
            </span>
          </div>

          <button
            type="button"
            className="cart-orders-button"
            onClick={() => navigate("/orders")}
          >
            <FaClipboardList />
            My Orders
          </button>
        </header>

        <main className="cart-success-wrapper">
          <div className="cart-success-card">
            <div className="cart-success-icon">
              <FaCheckCircle />
            </div>

            <h1>Order Placed!</h1>

            <p>
              Your order has been received
              successfully.
            </p>

            <div className="cart-success-total">
              <span>Order Total</span>

              <strong>
                ${total.toFixed(2)}
              </strong>
            </div>

            <button
              type="button"
              className="cart-primary-button"
              onClick={() =>
                navigate("/orders")
              }
            >
              View My Orders
            </button>

            <button
              type="button"
              className="cart-secondary-button"
              onClick={() =>
                navigate("/store")
              }
            >
              Continue Shopping
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <style>{styles}</style>

      {/* =====================================
          HEADER
      ====================================== */}

      <header className="cart-header">
        <div
          className="cart-logo"
          onClick={() => navigate("/store")}
        >
          <FaPaw />

          <span>
            Vet <b>Clinic</b>
          </span>
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

          <div className="cart-header-cart">
            <FaShoppingCart />

            <span>{totalItems}</span>
          </div>
        </div>
      </header>

      <main className="cart-container">
        {/* =====================================
            PAGE TOP
        ====================================== */}

        <button
          type="button"
          className="cart-back-button"
          onClick={() => {
            if (checkoutStarted) {
              setCheckoutStarted(false);
            } else {
              navigate("/store");
            }
          }}
        >
          <FaArrowLeft />

          {checkoutStarted
            ? "Back to cart"
            : "Continue shopping"}
        </button>

        {!checkoutStarted ? (
          <>
            <div className="cart-page-heading">
              <div>
                <h1>Your Cart</h1>

                <p>
                  {totalItems}{" "}
                  {totalItems === 1
                    ? "item"
                    : "items"}{" "}
                  in your cart
                </p>
              </div>

              {cart.length > 0 && (
                <button
                  type="button"
                  className="cart-clear-button"
                  onClick={clearCart}
                >
                  Clear cart
                </button>
              )}
            </div>

            {/* =================================
                EMPTY CART
            ================================== */}

            {cart.length === 0 ? (
              <div className="cart-empty">
                <div className="cart-empty-icon">
                  <FaShoppingCart />
                </div>

                <h2>Your cart is empty</h2>

                <p>
                  Browse our store and add products
                  for your pet.
                </p>

                <button
                  type="button"
                  className="cart-primary-button"
                  onClick={() =>
                    navigate("/store")
                  }
                >
                  Browse Products
                </button>
              </div>
            ) : (
              /* =================================
                 CART
              ================================== */

              <div className="cart-layout">
                <section className="cart-items-card">
                  <div className="cart-card-title">
                    <FaShoppingCart />

                    <div>
                      <h2>Shopping Cart</h2>

                      <p>
                        Review your selected products.
                      </p>
                    </div>
                  </div>

                  <div className="cart-items-list">
                    {cart.map((item) => (
                      <div
                        className="cart-item"
                        key={item.id}
                      >
                        <div className="cart-item-image">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                            />
                          ) : (
                            <FaPaw />
                          )}
                        </div>

                        <div className="cart-item-info">
                          <h3>{item.name}</h3>

                          <span>
                            {item.category}
                          </span>

                          <strong>
                            ${item.price.toFixed(2)}
                          </strong>
                        </div>

                        <div className="cart-item-actions">
                          <div className="cart-quantity">
                            <button
                              type="button"
                              onClick={() =>
                                decreaseQuantity(
                                  item.id
                                )
                              }
                            >
                              <FaMinus />
                            </button>

                            <span>
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                increaseQuantity(
                                  item.id
                                )
                              }
                              disabled={
                                item.quantity >=
                                item.stock
                              }
                            >
                              <FaPlus />
                            </button>
                          </div>

                          <strong className="cart-item-total">
                            $
                            {(
                              item.price *
                              item.quantity
                            ).toFixed(2)}
                          </strong>

                          <button
                            type="button"
                            className="cart-delete"
                            onClick={() =>
                              removeItem(item.id)
                            }
                            title="Remove product"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* =============================
                    SUMMARY
                ============================== */}

                <aside className="cart-summary">
                  <h2>Order Summary</h2>

                  <div className="cart-summary-line">
                    <span>Subtotal</span>

                    <strong>
                      ${subtotal.toFixed(2)}
                    </strong>
                  </div>

                  <div className="cart-summary-line">
                    <span>Delivery</span>

                    <span>
                      Calculated at checkout
                    </span>
                  </div>

                  <div className="cart-summary-divider" />

                  <div className="cart-summary-total">
                    <span>Total</span>

                    <strong>
                      ${subtotal.toFixed(2)}
                    </strong>
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
                    onClick={() =>
                      navigate("/store")
                    }
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
          /* =====================================
             CHECKOUT
          ====================================== */

          <>
            <div className="cart-page-heading">
              <div>
                <h1>Checkout</h1>

                <p>
                  Complete your order information.
                </p>
              </div>
            </div>

            {/* PROGRESS */}

            <div className="checkout-progress">
              <div className="checkout-step active">
                <span>1</span>
                Contact
              </div>

              <div className="checkout-progress-line active" />

              <div className="checkout-step active">
                <span>2</span>
                Delivery
              </div>

              <div className="checkout-progress-line active" />

              <div className="checkout-step active">
                <span>3</span>
                Payment
              </div>

              <div className="checkout-progress-line" />

              <div className="checkout-step">
                <span>4</span>
                Review
              </div>
            </div>

            <form
              className="checkout-layout"
              onSubmit={placeOrder}
            >
              <div className="checkout-left">
                {/* CONTACT */}

                <section className="checkout-card">
                  <div className="checkout-card-heading">
                    <div className="checkout-heading-icon">
                      <FaUser />
                    </div>

                    <div>
                      <h2>
                        Contact Information
                      </h2>

                      <p>
                        Tell us who this order is for.
                      </p>
                    </div>
                  </div>

                  <div className="checkout-fields two">
                    <div className="checkout-field">
                      <label>
                        Full Name *
                      </label>

                      <div className="checkout-input-icon">
                        <FaUser />

                        <input
                          type="text"
                          name="fullName"
                          value={
                            formData.fullName
                          }
                          onChange={
                            handleInputChange
                          }
                          placeholder="Enter full name"
                        />
                      </div>
                    </div>

                    <div className="checkout-field">
                      <label>
                        Phone *
                      </label>

                      <div className="checkout-input-icon">
                        <FaPhone />

                        <input
                          type="tel"
                          name="phone"
                          value={
                            formData.phone
                          }
                          onChange={
                            handleInputChange
                          }
                          placeholder="+961"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* DELIVERY METHOD */}

                <section className="checkout-card">
                  <div className="checkout-card-heading">
                    <div className="checkout-heading-icon">
                      <FaTruck />
                    </div>

                    <div>
                      <h2>
                        Delivery Method
                      </h2>

                      <p>
                        Choose delivery or clinic
                        pickup.
                      </p>
                    </div>
                  </div>

                  <div className="delivery-options">
                    <button
                      type="button"
                      className={`delivery-option ${
                        deliveryMethod ===
                        "delivery"
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        setDeliveryMethod(
                          "delivery"
                        )
                      }
                    >
                      <div className="delivery-radio">
                        <span />
                      </div>

                      <div className="delivery-option-icon">
                        <FaTruck />
                      </div>

                      <div>
                        <strong>
                          Home Delivery
                        </strong>

                        <p>
                          Delivered to your
                          address
                        </p>
                      </div>

                      <b>$5.00</b>
                    </button>

                    <button
                      type="button"
                      className={`delivery-option ${
                        deliveryMethod ===
                        "pickup"
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        setDeliveryMethod(
                          "pickup"
                        )
                      }
                    >
                      <div className="delivery-radio">
                        <span />
                      </div>

                      <div className="delivery-option-icon">
                        <FaStore />
                      </div>

                      <div>
                        <strong>
                          Clinic Pickup
                        </strong>

                        <p>
                          Pick up from Vet Clinic
                        </p>
                      </div>

                      <b>Free</b>
                    </button>
                  </div>

                  {deliveryMethod ===
                    "delivery" && (
                    <div className="checkout-address">
                      <div className="checkout-field">
                        <label>
                          Delivery Address *
                        </label>

                        <div className="checkout-input-icon">
                          <FaMapMarkerAlt />

                          <input
                            type="text"
                            name="address"
                            value={
                              formData.address
                            }
                            onChange={
                              handleInputChange
                            }
                            placeholder="Area / city"
                          />
                        </div>
                      </div>

                      <div className="checkout-field">
                        <label>
                          Address Details
                        </label>

                        <input
                          type="text"
                          name="details"
                          value={
                            formData.details
                          }
                          onChange={
                            handleInputChange
                          }
                          placeholder="Street, building, floor..."
                        />
                      </div>
                    </div>
                  )}
                </section>

                {/* PAYMENT */}

                <section className="checkout-card">
                  <div className="checkout-card-heading">
                    <div className="checkout-heading-icon">
                      <FaCreditCard />
                    </div>

                    <div>
                      <h2>Payment</h2>

                      <p>
                        Choose your payment
                        method.
                      </p>
                    </div>
                  </div>

                  <div className="payment-options">
                    <button
                      type="button"
                      className={`payment-option ${
                        paymentMethod === "cash"
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        setPaymentMethod("cash")
                      }
                    >
                      <span className="payment-radio">
                        <span />
                      </span>

                      <div>
                        <strong>
                          Cash on Delivery /
                          Pickup
                        </strong>

                        <p>
                          Pay when you receive
                          your order.
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      className={`payment-option ${
                        paymentMethod === "card"
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        setPaymentMethod("card")
                      }
                    >
                      <span className="payment-radio">
                        <span />
                      </span>

                      <div>
                        <strong>
                          Card at Clinic
                        </strong>

                        <p>
                          Pay by card when
                          collecting your order.
                        </p>
                      </div>
                    </button>
                  </div>
                </section>

                {/* NOTES */}

                <section className="checkout-card">
                  <div className="checkout-card-heading">
                    <div className="checkout-heading-icon">
                      <FaClipboardList />
                    </div>

                    <div>
                      <h2>Order Notes</h2>

                      <p>
                        Add optional instructions.
                      </p>
                    </div>
                  </div>

                  <div className="checkout-field">
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={
                        handleInputChange
                      }
                      placeholder="Any special instructions for your order..."
                      rows="4"
                    />
                  </div>
                </section>
              </div>

              {/* =================================
                  CHECKOUT SUMMARY
              ================================== */}

              <aside className="checkout-summary">
                <h2>Order Summary</h2>

                <div className="checkout-products">
                  {cart.map((item) => (
                    <div
                      className="checkout-product"
                      key={item.id}
                    >
                      <div className="checkout-product-image">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                          />
                        ) : (
                          <FaPaw />
                        )}

                        <span>
                          {item.quantity}
                        </span>
                      </div>

                      <div className="checkout-product-info">
                        <strong>
                          {item.name}
                        </strong>

                        <span>
                          {item.category}
                        </span>
                      </div>

                      <b>
                        $
                        {(
                          item.price *
                          item.quantity
                        ).toFixed(2)}
                      </b>
                    </div>
                  ))}
                </div>

                <div className="checkout-summary-divider" />

                <div className="cart-summary-line">
                  <span>Subtotal</span>

                  <strong>
                    ${subtotal.toFixed(2)}
                  </strong>
                </div>

                <div className="cart-summary-line">
                  <span>
                    {deliveryMethod ===
                    "delivery"
                      ? "Delivery"
                      : "Clinic Pickup"}
                  </span>

                  <strong>
                    {deliveryFee === 0
                      ? "Free"
                      : `$${deliveryFee.toFixed(
                          2
                        )}`}
                  </strong>
                </div>

                <div className="checkout-summary-divider" />

                <div className="cart-summary-total">
                  <span>Total</span>

                  <strong>
                    ${total.toFixed(2)}
                  </strong>
                </div>

                <button
                  type="submit"
                  className="cart-primary-button"
                >
                  <FaCheckCircle />
                  Place Order
                </button>

                <div className="checkout-safe">
                  <FaCheckCircle />

                  Your order information is
                  securely processed.
                </div>
              </aside>
            </form>
          </>
        )}
      </main>
    </div>
  );
}

// =========================================
// CSS
// =========================================

const styles = `
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
  }

  .cart-page {
    min-height: 100vh;
    background: #f7faf9;
    color: #344054;
    font-family: Arial, Helvetica, sans-serif;
  }

  .cart-header {
    height: 70px;
    padding: 0 5%;
    background: #ffffff;
    border-bottom: 1px solid #e5eceb;

    display: flex;
    align-items: center;
    justify-content: space-between;

    position: sticky;
    top: 0;
    z-index: 100;
  }

  .cart-logo {
    display: flex;
    align-items: center;
    gap: 9px;

    color: #176d6a;
    font-size: 19px;
    font-weight: 800;

    cursor: pointer;
  }

  .cart-logo > svg {
    color: #159f9f;
    font-size: 25px;
  }

  .cart-logo b {
    color: #159f9f;
  }

  .cart-header-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .cart-orders-button {
    min-height: 38px;
    padding: 0 14px;

    border: 1px solid #dfe8e7;
    border-radius: 7px;

    background: #ffffff;
    color: #475467;

    display: flex;
    align-items: center;
    gap: 7px;

    font-size: 10px;
    font-weight: 700;

    cursor: pointer;
  }

  .cart-orders-button:hover {
    border-color: #159f9f;
    color: #159f9f;
  }

  .cart-header-cart {
    min-width: 42px;
    height: 38px;

    padding: 0 10px;

    border-radius: 7px;

    background: #e9f8f6;
    color: #159f9f;

    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;

    font-size: 11px;
    font-weight: 700;
  }

  .cart-container {
    width: min(1250px, 92%);
    margin: 0 auto;
    padding: 28px 0 60px;
  }

  .cart-back-button {
    padding: 0;
    margin-bottom: 24px;

    border: 0;
    background: transparent;

    color: #667085;

    display: flex;
    align-items: center;
    gap: 8px;

    font-size: 10px;
    font-weight: 600;

    cursor: pointer;
  }

  .cart-back-button:hover {
    color: #159f9f;
  }

  .cart-page-heading {
    margin-bottom: 23px;

    display: flex;
    align-items: flex-end;
    justify-content: space-between;
  }

  .cart-page-heading h1 {
    margin: 0;

    color: #27364a;
    font-size: 28px;
  }

  .cart-page-heading p {
    margin: 6px 0 0;

    color: #98a2b3;
    font-size: 11px;
  }

  .cart-clear-button {
    padding: 8px 12px;

    border: 1px solid #f0cccc;
    border-radius: 6px;

    background: #ffffff;
    color: #d92d20;

    font-size: 9px;
    font-weight: 600;

    cursor: pointer;
  }

  /* =================================
     CART
  ================================= */

  .cart-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 330px;

    gap: 20px;
    align-items: start;
  }

  .cart-items-card,
  .cart-summary,
  .checkout-card,
  .checkout-summary {
    border: 1px solid #e1e9e8;
    border-radius: 12px;

    background: #ffffff;
  }

  .cart-card-title {
    padding: 18px 20px;

    border-bottom: 1px solid #edf1f1;

    display: flex;
    align-items: center;
    gap: 11px;
  }

  .cart-card-title > svg {
    color: #159f9f;
  }

  .cart-card-title h2 {
    margin: 0;

    color: #344054;
    font-size: 14px;
  }

  .cart-card-title p {
    margin: 4px 0 0;

    color: #98a2b3;
    font-size: 9px;
  }

  .cart-items-list {
    padding: 0 20px;
  }

  .cart-item {
    min-height: 120px;
    padding: 18px 0;

    border-bottom: 1px solid #edf1f1;

    display: grid;
    grid-template-columns: 90px minmax(0, 1fr) auto;

    gap: 15px;
    align-items: center;
  }

  .cart-item:last-child {
    border-bottom: 0;
  }

  .cart-item-image {
    width: 90px;
    height: 85px;

    border-radius: 8px;

    background: #f4f8f7;

    display: flex;
    align-items: center;
    justify-content: center;

    color: #a2b9b6;
    font-size: 27px;

    overflow: hidden;
  }

  .cart-item-image img {
    width: 100%;
    height: 100%;

    object-fit: cover;
  }

  .cart-item-info h3 {
    margin: 0;

    color: #344054;
    font-size: 12px;
  }

  .cart-item-info span {
    display: block;

    margin-top: 5px;

    color: #98a2b3;
    font-size: 9px;
  }

  .cart-item-info strong {
    display: block;

    margin-top: 10px;

    color: #159f9f;
    font-size: 12px;
  }

  .cart-item-actions {
    display: flex;
    align-items: center;
    gap: 18px;
  }

  .cart-quantity {
    height: 34px;

    border: 1px solid #dfe7e7;
    border-radius: 7px;

    display: flex;
    align-items: center;

    overflow: hidden;
  }

  .cart-quantity button {
    width: 32px;
    height: 100%;

    border: 0;
    background: #ffffff;

    color: #667085;

    display: flex;
    align-items: center;
    justify-content: center;

    font-size: 8px;

    cursor: pointer;
  }

  .cart-quantity button:hover:not(:disabled) {
    background: #eef9f8;
    color: #159f9f;
  }

  .cart-quantity button:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .cart-quantity span {
    width: 30px;

    text-align: center;

    font-size: 10px;
    font-weight: 700;
  }

  .cart-item-total {
    min-width: 60px;

    color: #344054;
    font-size: 12px;

    text-align: right;
  }

  .cart-delete {
    width: 31px;
    height: 31px;

    border: 0;
    border-radius: 6px;

    background: #fff1f0;
    color: #d92d20;

    display: flex;
    align-items: center;
    justify-content: center;

    font-size: 10px;

    cursor: pointer;
  }

  /* =================================
     SUMMARY
  ================================= */

  .cart-summary,
  .checkout-summary {
    padding: 20px;

    position: sticky;
    top: 90px;
  }

  .cart-summary h2,
  .checkout-summary h2 {
    margin: 0 0 22px;

    color: #344054;
    font-size: 15px;
  }

  .cart-summary-line {
    margin-bottom: 14px;

    display: flex;
    align-items: center;
    justify-content: space-between;

    gap: 15px;

    color: #667085;
    font-size: 10px;
  }

  .cart-summary-line strong {
    color: #344054;
  }

  .cart-summary-divider,
  .checkout-summary-divider {
    height: 1px;

    margin: 17px 0;

    background: #edf1f1;
  }

  .cart-summary-total {
    margin-bottom: 20px;

    display: flex;
    align-items: center;
    justify-content: space-between;

    color: #344054;
    font-size: 13px;
    font-weight: 700;
  }

  .cart-summary-total strong {
    color: #159f9f;
    font-size: 21px;
  }

  .cart-primary-button {
    width: 100%;
    min-height: 42px;

    padding: 10px 15px;

    border: 0;
    border-radius: 7px;

    background: #159f9f;
    color: #ffffff;

    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;

    font-size: 10px;
    font-weight: 700;

    cursor: pointer;
  }

  .cart-primary-button:hover {
    background: #118887;
  }

  .cart-secondary-button {
    width: 100%;
    min-height: 40px;

    margin-top: 9px;

    border: 1px solid #dfe7e7;
    border-radius: 7px;

    background: #ffffff;
    color: #667085;

    font-size: 10px;
    font-weight: 600;

    cursor: pointer;
  }

  .cart-secondary-button:hover {
    border-color: #159f9f;
    color: #159f9f;
  }

  .cart-secure-note,
  .checkout-safe {
    margin-top: 16px;

    color: #98a2b3;

    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;

    font-size: 8px;
  }

  .cart-secure-note svg,
  .checkout-safe svg {
    color: #159f9f;
  }

  /* =================================
     EMPTY
  ================================= */

  .cart-empty {
    min-height: 390px;

    border: 1px solid #e1e9e8;
    border-radius: 12px;

    background: #ffffff;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    text-align: center;
  }

  .cart-empty-icon {
    width: 70px;
    height: 70px;

    margin-bottom: 16px;

    border-radius: 50%;

    background: #eaf8f7;
    color: #159f9f;

    display: flex;
    align-items: center;
    justify-content: center;

    font-size: 25px;
  }

  .cart-empty h2 {
    margin: 0;

    color: #344054;
    font-size: 17px;
  }

  .cart-empty p {
    margin: 7px 0 20px;

    color: #98a2b3;
    font-size: 10px;
  }

  .cart-empty .cart-primary-button {
    width: auto;
    min-width: 150px;
  }

  /* =================================
     CHECKOUT PROGRESS
  ================================= */

  .checkout-progress {
    max-width: 700px;

    margin: 0 auto 28px;

    display: flex;
    align-items: center;
  }

  .checkout-step {
    min-width: 70px;

    color: #98a2b3;

    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;

    font-size: 8px;
    font-weight: 700;
  }

  .checkout-step span {
    width: 27px;
    height: 27px;

    border: 1px solid #dce5e4;
    border-radius: 50%;

    background: #ffffff;

    display: flex;
    align-items: center;
    justify-content: center;
  }

  .checkout-step.active {
    color: #159f9f;
  }

  .checkout-step.active span {
    border-color: #159f9f;

    background: #159f9f;
    color: #ffffff;
  }

  .checkout-progress-line {
    flex: 1;
    height: 1px;

    margin-bottom: 19px;

    background: #dce5e4;
  }

  .checkout-progress-line.active {
    background: #159f9f;
  }

  /* =================================
     CHECKOUT
  ================================= */

  .checkout-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 350px;

    gap: 20px;
    align-items: start;
  }

  .checkout-left {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .checkout-card {
    padding: 20px;
  }

  .checkout-card-heading {
    margin-bottom: 19px;

    display: flex;
    align-items: center;
    gap: 11px;
  }

  .checkout-heading-icon {
    width: 35px;
    height: 35px;

    border-radius: 8px;

    background: #e9f8f6;
    color: #159f9f;

    display: flex;
    align-items: center;
    justify-content: center;

    font-size: 12px;
  }

  .checkout-card-heading h2 {
    margin: 0;

    color: #344054;
    font-size: 13px;
  }

  .checkout-card-heading p {
    margin: 4px 0 0;

    color: #98a2b3;
    font-size: 9px;
  }

  .checkout-fields.two {
    display: grid;
    grid-template-columns: repeat(2, 1fr);

    gap: 12px;
  }

  .checkout-field {
    width: 100%;
  }

  .checkout-field label {
    display: block;

    margin-bottom: 6px;

    color: #475467;
    font-size: 9px;
    font-weight: 700;
  }

  .checkout-field input,
  .checkout-field textarea {
    width: 100%;

    border: 1px solid #dfe7e7;
    border-radius: 7px;

    background: #ffffff;

    color: #344054;

    outline: none;

    font-family: inherit;
    font-size: 10px;
  }

  .checkout-field input {
    height: 42px;

    padding: 0 12px;
  }

  .checkout-field textarea {
    padding: 12px;

    resize: vertical;
  }

  .checkout-field input:focus,
  .checkout-field textarea:focus {
    border-color: #159f9f;

    box-shadow: 0 0 0 3px rgba(21, 159, 159, 0.07);
  }

  .checkout-input-icon {
    position: relative;
  }

  .checkout-input-icon > svg {
    position: absolute;

    left: 12px;
    top: 50%;

    transform: translateY(-50%);

    color: #98a2b3;
    font-size: 10px;
  }

  .checkout-input-icon input {
    padding-left: 33px;
  }

  /* DELIVERY */

  .delivery-options {
    display: grid;
    grid-template-columns: repeat(2, 1fr);

    gap: 10px;
  }

  .delivery-option {
    min-height: 80px;

    padding: 12px;

    border: 1px solid #dfe7e7;
    border-radius: 8px;

    background: #ffffff;

    display: grid;
    grid-template-columns: auto auto 1fr auto;

    gap: 9px;
    align-items: center;

    text-align: left;

    cursor: pointer;
  }

  .delivery-option.active {
    border-color: #159f9f;

    background: #f3fbfa;
  }

  .delivery-radio,
  .payment-radio {
    width: 15px;
    height: 15px;

    border: 1px solid #cfd9d8;
    border-radius: 50%;

    display: flex;
    align-items: center;
    justify-content: center;
  }

  .delivery-option.active .delivery-radio,
  .payment-option.active .payment-radio {
    border-color: #159f9f;
  }

  .delivery-option.active .delivery-radio span,
  .payment-option.active .payment-radio span {
    width: 7px;
    height: 7px;

    border-radius: 50%;

    background: #159f9f;
  }

  .delivery-option-icon {
    width: 30px;
    height: 30px;

    border-radius: 6px;

    background: #eaf8f7;
    color: #159f9f;

    display: flex;
    align-items: center;
    justify-content: center;

    font-size: 11px;
  }

  .delivery-option strong {
    display: block;

    color: #344054;
    font-size: 9px;
  }

  .delivery-option p {
    margin: 3px 0 0;

    color: #98a2b3;
    font-size: 7px;
  }

  .delivery-option b {
    color: #159f9f;
    font-size: 9px;
  }

  .checkout-address {
    margin-top: 15px;

    display: grid;
    grid-template-columns: 1fr 1fr;

    gap: 12px;
  }

  /* PAYMENT */

  .payment-options {
    display: grid;
    grid-template-columns: 1fr 1fr;

    gap: 10px;
  }

  .payment-option {
    padding: 13px;

    border: 1px solid #dfe7e7;
    border-radius: 8px;

    background: #ffffff;

    display: flex;
    align-items: center;
    gap: 10px;

    text-align: left;

    cursor: pointer;
  }

  .payment-option.active {
    border-color: #159f9f;

    background: #f3fbfa;
  }

  .payment-option strong {
    display: block;

    color: #344054;
    font-size: 9px;
  }

  .payment-option p {
    margin: 4px 0 0;

    color: #98a2b3;
    font-size: 7px;
  }

  /* CHECKOUT PRODUCTS */

  .checkout-products {
    max-height: 300px;

    overflow-y: auto;
  }

  .checkout-product {
    padding: 10px 0;

    border-bottom: 1px solid #edf1f1;

    display: grid;
    grid-template-columns: 43px 1fr auto;

    gap: 9px;
    align-items: center;
  }

  .checkout-product-image {
    width: 43px;
    height: 43px;

    border-radius: 7px;

    background: #f3f7f6;
    color: #9db4b1;

    display: flex;
    align-items: center;
    justify-content: center;

    position: relative;
  }

  .checkout-product-image img {
    width: 100%;
    height: 100%;

    border-radius: 7px;

    object-fit: cover;
  }

  .checkout-product-image > span {
    position: absolute;

    top: -5px;
    right: -5px;

    width: 16px;
    height: 16px;

    border-radius: 50%;

    background: #159f9f;
    color: #ffffff;

    display: flex;
    align-items: center;
    justify-content: center;

    font-size: 7px;
    font-weight: 700;
  }

  .checkout-product-info strong {
    display: block;

    color: #344054;
    font-size: 9px;
  }

  .checkout-product-info span {
    display: block;

    margin-top: 3px;

    color: #98a2b3;
    font-size: 7px;
  }

  .checkout-product > b {
    color: #344054;
    font-size: 9px;
  }

  /* SUCCESS */

  .cart-success-wrapper {
    min-height: calc(100vh - 70px);

    padding: 40px 20px;

    display: flex;
    align-items: center;
    justify-content: center;
  }

  .cart-success-card {
    width: min(420px, 100%);

    padding: 40px;

    border: 1px solid #e1e9e8;
    border-radius: 15px;

    background: #ffffff;

    text-align: center;

    box-shadow: 0 15px 40px rgba(16, 24, 40, 0.06);
  }

  .cart-success-icon {
    width: 70px;
    height: 70px;

    margin: 0 auto 18px;

    border-radius: 50%;

    background: #e8f8f5;
    color: #159f9f;

    display: flex;
    align-items: center;
    justify-content: center;

    font-size: 29px;
  }

  .cart-success-card h1 {
    margin: 0;

    color: #344054;
    font-size: 24px;
  }

  .cart-success-card > p {
    margin: 8px 0 22px;

    color: #98a2b3;
    font-size: 10px;
  }

  .cart-success-total {
    margin-bottom: 20px;

    padding: 14px;

    border-radius: 8px;

    background: #f4faf9;

    display: flex;
    align-items: center;
    justify-content: space-between;

    color: #667085;
    font-size: 10px;
  }

  .cart-success-total strong {
    color: #159f9f;
    font-size: 18px;
  }

  /* RESPONSIVE */

  @media (max-width: 900px) {
    .cart-layout,
    .checkout-layout {
      grid-template-columns: 1fr;
    }

    .cart-summary,
    .checkout-summary {
      position: static;
    }

    .delivery-options,
    .payment-options {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 650px) {
    .cart-item {
      grid-template-columns: 70px 1fr;
    }

    .cart-item-image {
      width: 70px;
      height: 70px;
    }

    .cart-item-actions {
      grid-column: 1 / -1;

      justify-content: flex-end;
    }

    .checkout-fields.two,
    .checkout-address {
      grid-template-columns: 1fr;
    }

    .checkout-progress {
      overflow-x: auto;
    }

    .cart-orders-button {
      padding: 0 9px;
    }
  }
`;

export default Cart;