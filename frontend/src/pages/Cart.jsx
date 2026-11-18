import { useEffect, useMemo, useRef, useState } from "react";
import {
  useNavigate,
  useOutletContext,
} from "react-router-dom";

import {
  createStoreOrder,
  createOrderTrackingToken,
  getStoreCheckoutSettings,
} from "../api/storeOrdersApi";

import { getPublicStoreSettings } from "../api/storeSettingsApi";

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

const money = (value) => Number(value || 0).toFixed(2);

function readArray(key) {
  try {
    const value = JSON.parse(
      localStorage.getItem(key) || "[]"
    );

    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function normalizeSettings(data = {}) {
  const colors = { ...DEFAULT_COLORS };

  Object.keys(colors).forEach((key) => {
    const value = data?.storeColors?.[key];

    if (
      typeof value === "string" &&
      /^#[0-9a-fA-F]{6}$/.test(value)
    ) {
      colors[key] = value;
    }
  });

  return {
    storeName:
      typeof data?.storeName === "string"
        ? data.storeName
        : "",
    storeBanner:
      typeof data?.storeBanner === "string"
        ? data.storeBanner
        : "",
    storeColors: colors,
  };
}

function Cart() {
  const navigate = useNavigate();
  const { clinicId, storeBasePath } = useOutletContext();

  const cartKey = `vetClinicStoreCart:${clinicId}`;
  const referencesKey =
    `vetClinicStoreOrderReferences:${clinicId}`;
  const pendingKey =
    `vetClinicPendingStoreOrder:${clinicId}`;

  const [cart, setCart] = useState(() => readArray(cartKey));

  const [brandingState, setBrandingState] = useState(() => ({
    clinicId: String(clinicId),
    data: normalizeSettings(),
  }));

  const settings =
    brandingState.clinicId === String(clinicId)
      ? brandingState.data
      : normalizeSettings();

  const [brandingError, setBrandingError] = useState("");

  const [checkoutStarted, setCheckoutStarted] =
    useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [savedOrder, setSavedOrder] = useState(null);
  const [deliveryMethod, setDeliveryMethod] =
    useState("pickup");
  const [paymentMethod, setPaymentMethod] =
    useState("cash");

  const [checkoutSettings, setCheckoutSettings] =
    useState(null);
  const [settingsLoading, setSettingsLoading] =
    useState(true);
  const [settingsError, setSettingsError] = useState("");
  const [error, setError] = useState("");
  const [successNotice, setSuccessNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingOrder, setPendingOrder] = useState(null);

  const submittingRef = useRef(false);
  const pendingRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    details: "",
    notes: "",
  });

  useEffect(() => {
    let controller = null;
    let disposed = false;

    setBrandingState({
      clinicId: String(clinicId),
      data: normalizeSettings(),
    });
    setBrandingError("");

    const loadSettings = async () => {
      controller?.abort();

      const currentController = new AbortController();
      controller = currentController;

      try {
        const result = await getPublicStoreSettings(
          clinicId,
          { signal: currentController.signal }
        );

        if (
          disposed ||
          currentController.signal.aborted
        ) {
          return;
        }

        setBrandingState({
          clinicId: String(clinicId),
          data: normalizeSettings(result),
        });
        setBrandingError("");
      } catch (exception) {
        if (
          disposed ||
          currentController.signal.aborted
        ) {
          return;
        }

        setBrandingError(
          exception.message ||
            "Unable to load store settings."
        );
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        loadSettings();
      }
    };

    loadSettings();

    window.addEventListener(
      "storeSettingsUpdated",
      loadSettings
    );
    window.addEventListener(
      "clinic-branding-updated",
      loadSettings
    );
    window.addEventListener("focus", loadSettings);

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {
      disposed = true;
      controller?.abort();

      window.removeEventListener(
        "storeSettingsUpdated",
        loadSettings
      );
      window.removeEventListener(
        "clinic-branding-updated",
        loadSettings
      );
      window.removeEventListener("focus", loadSettings);

      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, [clinicId]);

  useEffect(() => {
    const refreshCart = () => {
      if (!submittingRef.current && !pendingRef.current) {
        setCart(readArray(cartKey));
      }
    };

    const onStorage = (event) => {
      if (!event.key || event.key === cartKey) {
        refreshCart();
      }
    };

    window.addEventListener("cartUpdated", refreshCart);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("cartUpdated", refreshCart);
      window.removeEventListener("storage", onStorage);
    };
  }, [cartKey]);

  useEffect(() => {
    const controller = new AbortController();

    setSettingsLoading(true);
    setCheckoutSettings(null);
    setSettingsError("");

    getStoreCheckoutSettings(clinicId, {
      signal: controller.signal,
    })
      .then((value) => {
        if (controller.signal.aborted) return;

        setCheckoutSettings(value);
        setSettingsError("");

        setPaymentMethod((current) =>
          value.paymentMethods.includes(current)
            ? current
            : value.paymentMethods[0] || ""
        );

        setDeliveryMethod((current) =>
          value.deliveryAvailable ? current : "pickup"
        );
      })
      .catch((loadError) => {
        if (!controller.signal.aborted) {
          setSettingsError(loadError.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setSettingsLoading(false);
        }
      });

    return () => controller.abort();
  }, [clinicId]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(pendingKey);
      if (!raw) return;

      const pending = JSON.parse(raw);

      if (
        pending.clinicId !== clinicId ||
        typeof pending.token !== "string" ||
        !/^[a-fA-F0-9]{64}$/.test(pending.token) ||
        typeof pending.payload?.requestId !== "string" ||
        !Array.isArray(pending.payload.items)
      ) {
        throw new Error("Invalid pending order.");
      }

      pendingRef.current = pending;
      setPendingOrder(pending);
      setCheckoutStarted(true);

      setFormData({
        fullName: pending.payload.customerName || "",
        phone: pending.payload.customerPhone || "",
        address: pending.payload.address || "",
        details: pending.payload.addressDetails || "",
        notes: pending.payload.notes || "",
      });

      setDeliveryMethod(pending.payload.deliveryMethod);
      setPaymentMethod(pending.payload.paymentMethod);
    } catch {
      setError(
        "A pending order could not be read. " +
          "Do not submit a replacement until its status is checked."
      );
    }
  }, [clinicId, pendingKey]);

  const colors = settings.storeColors;

  const branding = {
    name: settings.storeName,
    logo: settings.storeBanner,
  };

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
          sum +
          Number(item.price || 0) *
            Number(item.quantity || 0),
        0
      ),
    [cart]
  );

  const deliveryFee =
    deliveryMethod === "delivery" &&
    checkoutSettings?.deliveryAvailable &&
    cart.length
      ? Number(checkoutSettings.deliveryFee)
      : 0;

  const total = subtotal + deliveryFee;

  const totalItems = cart.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  const formLocked = isSubmitting || Boolean(pendingOrder);

  const saveCart = (newCart) => {
    if (submittingRef.current || pendingRef.current) return;

    try {
      localStorage.setItem(cartKey, JSON.stringify(newCart));
      setCart(newCart);
      window.dispatchEvent(new Event("cartUpdated"));
    } catch {
      setError("The cart could not be saved in this browser.");
    }
  };

  const increaseQuantity = (productId) => {
    saveCart(
      cart.map((item) => {
        if (String(item.id) !== String(productId)) {
          return item;
        }

        const quantity = Number(item.quantity || 0);
        const stock = Number(item.stock);

        if (
          !Number.isInteger(quantity) ||
          quantity < 1 ||
          quantity >= 2147483647 ||
          (Number.isFinite(stock) && quantity >= stock)
        ) {
          return item;
        }

        return { ...item, quantity: quantity + 1 };
      })
    );
  };

  const decreaseQuantity = (productId) => {
    saveCart(
      cart
        .map((item) =>
          String(item.id) === String(productId)
            ? {
                ...item,
                quantity: Number(item.quantity) - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (productId) => {
    saveCart(
      cart.filter(
        (item) => String(item.id) !== String(productId)
      )
    );
  };

  const clearCart = () => saveCart([]);

  const handleInputChange = (event) => {
    if (formLocked) return;

    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const startCheckout = () => {
    if (
      !cart.length ||
      settingsLoading ||
      settingsError ||
      !checkoutSettings
    ) {
      return;
    }

    setCheckoutStarted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const placeOrder = async (event) => {
    event.preventDefault();

    if (submittingRef.current) return;

    submittingRef.current = true;
    setIsSubmitting(true);
    setError("");

    let acceptedOrder = null;

    try {
      let pending = pendingRef.current;

      if (!pending) {
        if (
          settingsLoading ||
          settingsError ||
          !checkoutSettings
        ) {
          throw new Error(
            settingsError ||
              "Checkout settings are still loading."
          );
        }

        if (!cart.length) {
          throw new Error("Your cart is empty.");
        }

        if (
          !formData.fullName.trim() ||
          !formData.phone.trim()
        ) {
          throw new Error(
            "Enter your name and phone number."
          );
        }

        if (
          formData.fullName.trim().length > 200 ||
          formData.phone.trim().length > 50 ||
          formData.address.trim().length > 500 ||
          formData.details.trim().length > 1000 ||
          formData.notes.trim().length > 4000
        ) {
          throw new Error(
            "One or more customer details exceed the allowed length."
          );
        }

        if (
          deliveryMethod === "delivery" &&
          (!checkoutSettings.deliveryAvailable ||
            !formData.address.trim())
        ) {
          throw new Error(
            "Choose an available delivery method " +
              "and enter a delivery address."
          );
        }

        if (
          !checkoutSettings.paymentMethods.includes(
            paymentMethod
          )
        ) {
          throw new Error(
            "Choose an available payment method."
          );
        }

        const items = cart.map((item) => {
          const productId = Number(item.id);
          const quantity = Number(item.quantity);

          if (
            !Number.isSafeInteger(productId) ||
            productId <= 0 ||
            productId > 2147483647 ||
            !Number.isInteger(quantity) ||
            quantity <= 0 ||
            quantity > 2147483647
          ) {
            throw new Error(
              "The cart contains an invalid product."
            );
          }

          return { productId, quantity };
        });

        pending = {
          clinicId,
          token: createOrderTrackingToken(),
          payload: {
            requestId: crypto.randomUUID(),
            customerName: formData.fullName.trim(),
            customerPhone: formData.phone.trim(),
            deliveryMethod,
            address: formData.address.trim(),
            addressDetails: formData.details.trim(),
            notes: formData.notes.trim(),
            paymentMethod,
            items,
          },
        };

        // Keep the same request available for safe retries.
        localStorage.setItem(
          pendingKey,
          JSON.stringify(pending)
        );

        pendingRef.current = pending;
        setPendingOrder(pending);
      }

      acceptedOrder = await createStoreOrder(
        clinicId,
        pending.payload,
        pending.token
      );

      const references = readArray(referencesKey);

      const updatedReferences = [
        {
          id: acceptedOrder.id,
          clinicId,
          trackingToken: pending.token,
        },
        ...references.filter(
          (reference) => reference.id !== acceptedOrder.id
        ),
      ];

      // Save tracking access before clearing retry information.
      localStorage.setItem(
        referencesKey,
        JSON.stringify(updatedReferences)
      );

      localStorage.removeItem(cartKey);
      localStorage.removeItem(pendingKey);

      pendingRef.current = null;
      setPendingOrder(null);
      setSavedOrder(acceptedOrder);
      setCart([]);
      setOrderComplete(true);

      window.dispatchEvent(new Event("cartUpdated"));
      window.dispatchEvent(
        new Event("vetClinicOrdersUpdated")
      );
      window.dispatchEvent(
        new Event("vetClinicProductsUpdated")
      );

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (saveError) {
      if (acceptedOrder) {
        setSavedOrder(acceptedOrder);
        setOrderComplete(true);

        setSuccessNotice(
          "Your order was saved, but this browser could not save " +
            "all tracking details. Keep order #" +
            acceptedOrder.id +
            ". Do not place the order again."
        );
      } else {
        if (saveError.status === 400) {
          try {
            localStorage.removeItem(pendingKey);
            pendingRef.current = null;
            setPendingOrder(null);
          } catch {
            // Keep the existing request if storage is unavailable.
          }
        }

        setError(
          saveError.message ||
            "Unable to confirm the order. Retry the same request."
        );
      }
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  if (orderComplete && savedOrder) {
    return (
      <div className="cart-page" style={pageColors}>
        <style>{styles}</style>

        <main className="cart-success-wrapper">
          <section className="cart-success-card">
            <div className="cart-success-icon">
              <FaCheckCircle />
            </div>

            <h1>Order Placed!</h1>
            <p>
              Your order #{savedOrder.id} has been received.
            </p>

            {successNotice && (
              <p className="cart-feedback" role="status">
                {successNotice}
              </p>
            )}

            <div className="cart-success-total">
              <span>Order Total</span>
              <strong>${money(savedOrder.total)}</strong>
            </div>

            <button
              type="button"
              className="cart-primary-button"
              onClick={() =>
                navigate(`${storeBasePath}/orders`)
              }
            >
              <FaClipboardList />
              View My Orders
            </button>

            <button
              type="button"
              className="cart-secondary-button"
              onClick={() => navigate(storeBasePath)}
            >
              Continue Shopping
            </button>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="cart-page" style={pageColors}>
      <style>{styles}</style>

      <main className="cart-container">
        <button
          type="button"
          className="cart-back-button"
          disabled={formLocked}
          onClick={() => {
            if (checkoutStarted) {
              setCheckoutStarted(false);
            } else {
              navigate(storeBasePath);
            }
          }}
        >
          <FaArrowLeft />
          {checkoutStarted
            ? "Back to Cart"
            : "Continue Shopping"}
        </button>

        {brandingError && (
          <div
            className="cart-feedback cart-feedback-error"
            role="alert"
          >
            {brandingError}
          </div>
        )}

        {error && (
          <div
            className="cart-feedback cart-feedback-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {settingsError && !pendingOrder && (
          <div
            className="cart-feedback cart-feedback-error"
            role="alert"
          >
            {settingsError}
          </div>
        )}

        {pendingOrder && (
          <div className="cart-feedback" role="status">
            <p>
              Your previous order is awaiting confirmation.
              Retry to check it without creating another order.
            </p>

            <button
              type="button"
              className="cart-secondary-button"
              onClick={placeOrder}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Checking Order..."
                : "Retry Order"}
            </button>
          </div>
        )}

        {!checkoutStarted ? (
          <>
            <div className="cart-heading">
              <div>
                <h1>Your Cart</h1>
                <p>
                  {totalItems}{" "}
                  {totalItems === 1 ? "item" : "items"} in
                  your cart
                </p>
              </div>

              {cart.length > 0 && (
                <button
                  type="button"
                  className="cart-clear-button"
                  onClick={clearCart}
                  disabled={formLocked}
                >
                  <FaTrash />
                  Clear Cart
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <section className="cart-empty">
                <div className="cart-empty-icon">
                  <FaShoppingCart />
                </div>

                <h2>Your cart is empty</h2>
                <p>
                  Explore our products and add your favorites.
                </p>

                <button
                  type="button"
                  className="cart-primary-button"
                  onClick={() =>
                    navigate(`${storeBasePath}/products`)
                  }
                >
                  Browse Products
                </button>
              </section>
            ) : (
              <div className="cart-layout">
                <section className="cart-items-card">
                  <div className="cart-card-title">
                    <FaShoppingCart />

                    <div>
                      <h2>Shopping Cart</h2>
                      <p>
                        Review your items before checkout.
                      </p>
                    </div>
                  </div>

                  <div className="cart-items-list">
                    {cart.map((item) => {
                      const stock = Number(item.stock);
                      const stockKnown =
                        item.stock !== null &&
                        item.stock !== undefined &&
                        Number.isFinite(stock);

                      return (
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
                            <span>{item.category}</span>
                            <strong>
                              ${money(item.price)}
                            </strong>
                          </div>

                          <div className="cart-item-actions">
                            <div className="cart-quantity">
                              <button
                                type="button"
                                aria-label={`Decrease ${item.name} quantity`}
                                onClick={() =>
                                  decreaseQuantity(item.id)
                                }
                                disabled={
                                  formLocked ||
                                  Number(item.quantity) <= 1
                                }
                              >
                                <FaMinus />
                              </button>

                              <span>{item.quantity}</span>

                              <button
                                type="button"
                                aria-label={`Increase ${item.name} quantity`}
                                onClick={() =>
                                  increaseQuantity(item.id)
                                }
                                disabled={
                                  formLocked ||
                                  (stockKnown &&
                                    Number(item.quantity) >=
                                      stock)
                                }
                              >
                                <FaPlus />
                              </button>
                            </div>

                            <strong className="cart-item-total">
                              $
                              {money(
                                Number(item.price) *
                                  Number(item.quantity)
                              )}
                            </strong>

                            <button
                              type="button"
                              className="cart-delete-button"
                              aria-label={`Remove ${item.name}`}
                              onClick={() =>
                                removeItem(item.id)
                              }
                              disabled={formLocked}
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
                    disabled={
                      formLocked ||
                      settingsLoading ||
                      Boolean(settingsError) ||
                      !checkoutSettings
                    }
                  >
                    <FaShoppingCart />
                    {settingsLoading
                      ? "Loading Checkout..."
                      : "Proceed to Checkout"}
                  </button>

                  <button
                    type="button"
                    className="cart-secondary-button"
                    onClick={() =>
                      navigate(`${storeBasePath}/products`)
                    }
                    disabled={formLocked}
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
            <div className="cart-heading">
              <div>
                <h1>Checkout</h1>
                <p>
                  Complete your details to place your order.
                </p>
              </div>
            </div>

            <div className="checkout-progress">
              <div className="checkout-progress-step active">
                <span>1</span>
                Contact
              </div>
              <div className="checkout-progress-line active" />

              <div className="checkout-progress-step active">
                <span>2</span>
                Delivery
              </div>
              <div className="checkout-progress-line" />

              <div className="checkout-progress-step">
                <span>3</span>
                Payment
              </div>
              <div className="checkout-progress-line" />

              <div className="checkout-progress-step">
                <span>4</span>
                Review
              </div>
            </div>

            <form
              className="checkout-layout"
              onSubmit={placeOrder}
              aria-busy={isSubmitting}
            >
              <div className="checkout-left">
                <section className="checkout-card">
                  <div className="checkout-card-heading">
                    <div className="checkout-heading-icon">
                      <FaUser />
                    </div>

                    <div>
                      <h2>Contact Information</h2>
                      <p>
                        How can we contact you about your
                        order?
                      </p>
                    </div>
                  </div>

                  <div className="checkout-fields two">
                    <div className="checkout-field">
                      <label htmlFor="checkout-full-name">
                        Full Name *
                      </label>

                      <div className="checkout-input-icon">
                        <FaUser />
                        <input
                          id="checkout-full-name"
                          type="text"
                          name="fullName"
                          placeholder="Enter your full name"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          autoComplete="name"
                          maxLength={200}
                          disabled={formLocked}
                          required
                        />
                      </div>
                    </div>

                    <div className="checkout-field">
                      <label htmlFor="checkout-phone">
                        Phone Number *
                      </label>

                      <div className="checkout-input-icon">
                        <FaPhone />
                        <input
                          id="checkout-phone"
                          type="tel"
                          name="phone"
                          placeholder="Enter your phone number"
                          value={formData.phone}
                          onChange={handleInputChange}
                          autoComplete="tel"
                          maxLength={50}
                          disabled={formLocked}
                          required
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
                      <p>
                        Choose how you would like to receive
                        your order.
                      </p>
                    </div>
                  </div>

                  <div className="delivery-options">
                    <button
                      type="button"
                      className={`delivery-option ${
                        deliveryMethod === "delivery"
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        setDeliveryMethod("delivery")
                      }
                      disabled={
                        formLocked ||
                        !checkoutSettings?.deliveryAvailable
                      }
                      aria-pressed={
                        deliveryMethod === "delivery"
                      }
                    >
                      <span className="delivery-radio">
                        {deliveryMethod === "delivery" && (
                          <span />
                        )}
                      </span>

                      <span className="delivery-icon">
                        <FaTruck />
                      </span>

                      <div>
                        <strong>Home Delivery</strong>
                        <p>
                          {checkoutSettings?.deliveryAvailable
                            ? "Delivered to your address"
                            : "Currently unavailable"}
                        </p>
                      </div>

                      <b>
                        {checkoutSettings?.deliveryAvailable
                          ? `$${money(
                              checkoutSettings.deliveryFee
                            )}`
                          : "—"}
                      </b>
                    </button>

                    <button
                      type="button"
                      className={`delivery-option ${
                        deliveryMethod === "pickup"
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        setDeliveryMethod("pickup")
                      }
                      disabled={formLocked}
                      aria-pressed={
                        deliveryMethod === "pickup"
                      }
                    >
                      <span className="delivery-radio">
                        {deliveryMethod === "pickup" && (
                          <span />
                        )}
                      </span>

                      <span className="delivery-icon">
                        <FaStore />
                      </span>

                      <div>
                        <strong>Clinic Pickup</strong>
                        <p>Pick up from the clinic</p>
                      </div>

                      <b>Free</b>
                    </button>
                  </div>

                  {deliveryMethod === "delivery" && (
                    <div className="checkout-address">
                      <div className="checkout-field">
                        <label htmlFor="checkout-address">
                          Delivery Address *
                        </label>

                        <div className="checkout-input-icon">
                          <FaMapMarkerAlt />

                          <input
                            id="checkout-address"
                            type="text"
                            name="address"
                            placeholder="City, street, building"
                            value={formData.address}
                            onChange={handleInputChange}
                            autoComplete="street-address"
                            maxLength={500}
                            disabled={formLocked}
                            required
                          />
                        </div>
                      </div>

                      <div className="checkout-field">
                        <label htmlFor="checkout-details">
                          Additional Address Details
                        </label>

                        <input
                          id="checkout-details"
                          type="text"
                          name="details"
                          placeholder="Floor, apartment, landmark"
                          value={formData.details}
                          onChange={handleInputChange}
                          maxLength={1000}
                          disabled={formLocked}
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
                      <h2>Payment Method</h2>
                      <p>Select an available payment method.</p>
                    </div>
                  </div>

                  <div className="payment-options">
                    {(
                      checkoutSettings?.paymentMethods || []
                    ).map((method) => (
                      <button
                        type="button"
                        key={method}
                        className={`payment-option ${
                          paymentMethod === method
                            ? "active"
                            : ""
                        }`}
                        onClick={() =>
                          setPaymentMethod(method)
                        }
                        disabled={formLocked}
                        aria-pressed={
                          paymentMethod === method
                        }
                      >
                        <span className="payment-radio">
                          {paymentMethod === method && (
                            <span />
                          )}
                        </span>

                        <div>
                          <strong>
                            {method === "cash"
                              ? "Cash"
                              : method}
                          </strong>
                          <p>
                            {method === "cash"
                              ? "Pay when you receive your order"
                              : "Selected payment method"}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>

                <section className="checkout-card">
                  <div className="checkout-card-heading">
                    <div className="checkout-heading-icon">
                      <FaClipboardList />
                    </div>

                    <div>
                      <h2>Order Notes</h2>
                      <p>Anything else we should know?</p>
                    </div>
                  </div>

                  <div className="checkout-field">
                    <textarea
                      name="notes"
                      rows={3}
                      placeholder="Add any special instructions..."
                      value={formData.notes}
                      onChange={handleInputChange}
                      maxLength={4000}
                      disabled={formLocked}
                      aria-label="Order notes"
                    />
                  </div>
                </section>
              </div>

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

                        <span>{item.quantity}</span>
                      </div>

                      <div className="checkout-product-info">
                        <strong>{item.name}</strong>
                        <span>{item.category}</span>
                      </div>

                      <b>
                        $
                        {money(
                          Number(item.price) *
                            Number(item.quantity)
                        )}
                      </b>
                    </div>
                  ))}
                </div>

                <div className="cart-summary-divider" />

                <div className="cart-summary-line">
                  <span>Subtotal</span>
                  <strong>${money(subtotal)}</strong>
                </div>

                <div className="cart-summary-line">
                  <span>
                    {deliveryMethod === "pickup"
                      ? "Clinic Pickup"
                      : "Delivery"}
                  </span>
                  <strong>
                    {deliveryFee > 0
                      ? `$${money(deliveryFee)}`
                      : "Free"}
                  </strong>
                </div>

                <div className="cart-summary-divider" />

                <div className="cart-summary-total">
                  <span>Total</span>
                  <strong>${money(total)}</strong>
                </div>

                <button
                  type="submit"
                  className="cart-primary-button"
                  disabled={
                    isSubmitting ||
                    (!pendingOrder &&
                      (settingsLoading ||
                        Boolean(settingsError) ||
                        !checkoutSettings ||
                        cart.length === 0 ||
                        !checkoutSettings.paymentMethods?.includes(
                          paymentMethod
                        )))
                  }
                >
                  <FaCheckCircle />
                  {isSubmitting
                    ? "Saving Order..."
                    : pendingOrder
                      ? "Retry Order"
                      : "Place Order"}
                </button>

                <div className="checkout-safe">
                  <FaCheckCircle />
                  Secure clinic checkout
                </div>
              </aside>
            </form>
          </>
        )}
      </main>
    </div>
  );
}

const styles = `
.cart-page,.cart-page *{box-sizing:border-box}
.cart-page{min-height:100vh;width:100%;overflow-x:hidden;background:var(--cart-background);color:var(--cart-text);font-family:Arial,Helvetica,sans-serif}
.cart-page button{font:inherit;visibility:visible;text-decoration:none;line-height:1.3;transform:none;cursor:pointer}
.cart-page button:disabled{opacity:.5!important;cursor:not-allowed!important}
.cart-page svg{display:inline-block;flex-shrink:0;vertical-align:middle}
.cart-page button:focus-visible{outline:2px solid var(--cart-primary);outline-offset:3px}
.cart-header{height:70px;padding:0 5%;background:var(--cart-background);border-bottom:1px solid var(--cart-border);display:flex;align-items:center;justify-content:space-between;gap:15px;position:sticky;top:0;z-index:100}
.cart-logo{display:inline-flex;align-items:center;gap:9px;color:var(--cart-secondary);font-size:19px;font-weight:800;cursor:pointer;min-width:0}
.cart-logo span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cart-brand-image{width:29px;height:29px;object-fit:contain;flex-shrink:0}
.cart-header-right{display:flex;align-items:center;gap:12px;flex-shrink:0}
.cart-orders-button{display:inline-flex!important;align-items:center;justify-content:center;gap:8px;width:auto!important;min-width:0;max-width:max-content;height:39px;margin:0!important;padding:0 14px!important;flex:0 0 auto;border:1px solid var(--cart-border)!important;border-radius:7px!important;background:var(--cart-background)!important;color:var(--cart-text)!important;font-size:11px!important;font-weight:700!important;white-space:nowrap}
.cart-orders-button:hover{background:var(--cart-light)!important;color:var(--cart-secondary)!important;border-color:var(--cart-primary)!important}
.cart-header-cart{min-width:43px;height:39px;padding:0 10px;border-radius:7px;background:var(--cart-light);color:var(--cart-primary);display:flex;align-items:center;justify-content:center;gap:7px;font-size:12px;font-weight:800}
.cart-header-cart svg{font-size:15px}
.cart-container{width:min(1250px,92%);margin:0 auto;padding:28px 0 60px}
.cart-back-button{display:inline-flex!important;align-items:center;gap:9px;width:fit-content!important;max-width:max-content;min-height:28px;margin:0 0 22px!important;padding:3px 0!important;border:0!important;border-radius:0!important;background:transparent!important;color:#667085!important;font-size:11px!important;font-weight:700!important}
.cart-back-button:hover{color:var(--cart-primary)!important}
.cart-heading{display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:16px;margin-bottom:23px}
.cart-heading h1{margin:0;font-size:28px;font-weight:800;line-height:1.2}
.cart-heading p{margin:7px 0 0;color:#98a2b3;font-size:11px}
.cart-clear-button{display:inline-flex!important;align-items:center;justify-content:center;gap:7px;width:auto!important;height:34px;padding:0 13px!important;border:1px solid #f0cccc!important;border-radius:7px!important;background:var(--cart-background)!important;color:#d92d20!important;font-size:11px!important;font-weight:700!important}
.cart-clear-button:hover{background:#fff1f0!important;border-color:#d92d20!important}
.cart-layout{display:grid;grid-template-columns:minmax(0,1fr) 330px;gap:20px;align-items:start}
.cart-items-card,.cart-summary,.checkout-card,.checkout-summary{min-width:0;border:1px solid var(--cart-border);border-radius:12px;background:var(--cart-background)}
.cart-card-title{padding:18px 20px;border-bottom:1px solid var(--cart-border);display:flex;align-items:center;gap:11px}
.cart-card-title>svg{color:var(--cart-primary);font-size:19px}
.cart-card-title h2{font-size:14px;margin:0}
.cart-card-title p{font-size:10px;color:#98a2b3;margin:5px 0 0}
.cart-items-list{padding:0 20px}
.cart-item{min-height:120px;padding:18px 0;border-bottom:1px solid var(--cart-border);display:grid;grid-template-columns:90px minmax(0,1fr) auto;gap:15px;align-items:center}
.cart-item:last-child{border-bottom:0}
.cart-item-image{width:90px;height:85px;border-radius:8px;background:var(--cart-light);display:flex;align-items:center;justify-content:center;color:var(--cart-primary);font-size:32px;overflow:hidden}
.cart-item-image img{width:100%;height:100%;object-fit:cover}
.cart-item-info{min-width:0}
.cart-item-info h3{font-size:12px;margin:0;overflow-wrap:anywhere}
.cart-item-info>span{display:block;font-size:10px;color:#98a2b3;margin-top:5px}
.cart-item-info>strong{display:block;color:var(--cart-primary);font-size:12px;margin-top:10px}
.cart-item-actions{display:flex;align-items:center;gap:18px}
.cart-quantity{height:35px;border:1px solid var(--cart-border);border-radius:7px;display:inline-flex;align-items:center;overflow:hidden;background:var(--cart-background)}
.cart-quantity button{width:34px!important;height:33px!important;padding:0!important;margin:0!important;border:0!important;border-radius:0!important;background:var(--cart-background)!important;color:var(--cart-text)!important;font-size:11px!important;display:flex!important;align-items:center;justify-content:center}
.cart-quantity button:hover{background:var(--cart-light)!important;color:var(--cart-primary)!important}
.cart-quantity span{width:30px;text-align:center;font-size:11px;font-weight:700}
.cart-item-total{min-width:60px;font-size:12px;text-align:right}
.cart-delete-button{width:33px!important;height:33px!important;padding:0!important;display:flex!important;align-items:center;justify-content:center;background:#fff1f0!important;color:#d92d20!important;border-radius:7px!important;border:0!important;font-size:11px!important}
.cart-delete-button:hover{background:#fee4e2!important}
.cart-summary,.checkout-summary{padding:20px;position:sticky;top:90px}
.cart-summary h2,.checkout-summary h2{font-size:15px;margin:0 0 22px}
.cart-summary-line{display:flex;align-items:center;justify-content:space-between;gap:15px;color:#667085;font-size:11px;margin-bottom:14px}
.cart-summary-line strong{color:var(--cart-text);text-align:right}
.cart-summary-divider{height:1px;margin:17px 0;background:var(--cart-border)}
.cart-summary-total{display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:13px;font-weight:700;margin-bottom:20px}
.cart-summary-total strong{color:var(--cart-primary);font-size:21px}
.cart-primary-button{display:flex!important;align-items:center;justify-content:center;gap:8px;width:100%!important;min-height:43px;padding:10px 15px!important;border:1px solid var(--cart-button)!important;border-radius:7px!important;background:var(--cart-button)!important;color:var(--cart-button-text)!important;font-size:11px!important;font-weight:800!important}
.cart-primary-button:not(:disabled):hover{filter:brightness(.9);box-shadow:0 4px 12px #0000000d}
.cart-secondary-button{display:flex!important;align-items:center;justify-content:center;gap:8px;width:100%!important;min-height:41px;margin-top:9px!important;padding:10px 15px!important;border:1px solid var(--cart-border)!important;border-radius:7px!important;background:var(--cart-background)!important;color:var(--cart-text)!important;font-size:11px!important;font-weight:700!important}
.cart-secondary-button:not(:disabled):hover{background:var(--cart-light)!important;color:var(--cart-secondary)!important;border-color:var(--cart-primary)!important}
.cart-secure-note,.checkout-safe{margin-top:16px;color:#98a2b3;display:flex;align-items:center;justify-content:center;gap:7px;font-size:9px;text-align:center}
.cart-secure-note svg,.checkout-safe svg{color:var(--cart-primary);font-size:12px}
.cart-empty{min-height:390px;padding:25px;border:1px solid var(--cart-border);border-radius:12px;background:var(--cart-background);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
.cart-empty-icon{width:70px;height:70px;border-radius:50%;background:var(--cart-light);color:var(--cart-primary);font-size:28px;display:flex;align-items:center;justify-content:center;margin-bottom:16px}
.cart-empty h2{font-size:17px;margin:0}
.cart-empty p{font-size:11px;color:#98a2b3;margin:8px 0 20px}
.cart-empty .cart-primary-button{width:auto!important;min-width:155px}
.checkout-progress{max-width:700px;margin:0 auto 28px;display:flex;align-items:center}
.checkout-progress-step{min-width:70px;color:#98a2b3;display:flex;flex-direction:column;align-items:center;gap:6px;font-size:9px;font-weight:700}
.checkout-progress-step>span{width:27px;height:27px;border-radius:50%;border:1px solid var(--cart-border);background:var(--cart-background);display:flex;align-items:center;justify-content:center}
.checkout-progress-step.active{color:var(--cart-primary)}
.checkout-progress-step.active>span{border-color:var(--cart-primary);background:var(--cart-primary);color:var(--cart-button-text)}
.checkout-progress-line{flex:1;height:1px;margin-bottom:19px;background:var(--cart-border)}
.checkout-progress-line.active{background:var(--cart-primary)}
.checkout-layout{display:grid;grid-template-columns:minmax(0,1fr) 350px;gap:20px;align-items:start}
.checkout-left{display:flex;flex-direction:column;gap:15px;min-width:0}
.checkout-card{padding:20px}
.checkout-card-heading{display:flex;align-items:center;gap:11px;margin-bottom:19px}
.checkout-heading-icon{width:35px;height:35px;flex-shrink:0;border-radius:8px;background:var(--cart-light);color:var(--cart-primary);font-size:15px;display:flex;align-items:center;justify-content:center}
.checkout-card-heading h2{font-size:13px;margin:0}
.checkout-card-heading p{font-size:10px;color:#98a2b3;margin:5px 0 0;line-height:1.5}
.checkout-fields.two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.checkout-field{width:100%;min-width:0}
.checkout-field label{display:block;margin-bottom:6px;color:var(--cart-text);font-size:10px;font-weight:700}
.checkout-field input,.checkout-field textarea{width:100%;border:1px solid var(--cart-border);border-radius:7px;background:var(--cart-background);color:var(--cart-text);font:inherit;font-size:11px;outline:none}
.checkout-field input{height:42px;padding:0 12px}
.checkout-field textarea{padding:12px;resize:vertical}
.checkout-field input:focus,.checkout-field textarea:focus{border-color:var(--cart-primary);box-shadow:0 0 0 3px var(--cart-light)}
.checkout-input-icon{position:relative}
.checkout-input-icon>svg{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#98a2b3;font-size:13px}
.checkout-input-icon input{padding-left:34px}
.delivery-options{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.delivery-option{display:grid!important;grid-template-columns:auto auto minmax(0,1fr) auto;align-items:center;gap:9px;width:100%!important;min-height:80px;padding:12px!important;border:1px solid var(--cart-border)!important;border-radius:8px!important;background:var(--cart-background)!important;color:var(--cart-text)!important;text-align:left}
.delivery-option:not(:disabled):hover,.delivery-option.active{border-color:var(--cart-primary)!important;background:var(--cart-light)!important}
.delivery-radio,.payment-radio{width:15px;height:15px;flex-shrink:0;border:1px solid #cfd9d8;border-radius:50%;display:flex;align-items:center;justify-content:center}
.active .delivery-radio,.active .payment-radio{border-color:var(--cart-primary)}
.delivery-radio>span,.payment-radio>span{width:7px;height:7px;border-radius:50%;background:var(--cart-primary)}
.delivery-icon{width:30px;height:30px;border-radius:6px;background:var(--cart-light);color:var(--cart-primary);font-size:14px;display:flex;align-items:center;justify-content:center}
.delivery-option strong{font-size:10px}
.delivery-option p{font-size:9px;color:#98a2b3;margin:5px 0 0;line-height:1.5}
.delivery-option b{color:var(--cart-primary);font-size:10px;white-space:nowrap}
.checkout-address{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:15px}
.payment-options{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.payment-option{display:flex!important;align-items:center;gap:10px;width:100%!important;min-height:70px;padding:13px!important;border:1px solid var(--cart-border)!important;border-radius:8px!important;background:var(--cart-background)!important;color:var(--cart-text)!important;text-align:left}
.payment-option:not(:disabled):hover,.payment-option.active{border-color:var(--cart-primary)!important;background:var(--cart-light)!important}
.payment-option strong{font-size:10px}
.payment-option p{font-size:9px;color:#98a2b3;margin:5px 0 0;line-height:1.5}
.checkout-products{max-height:300px;overflow-y:auto}
.checkout-product{padding:10px 0;border-bottom:1px solid var(--cart-border);display:grid;grid-template-columns:43px minmax(0,1fr) auto;gap:9px;align-items:center}
.checkout-product:last-child{border-bottom:0}
.checkout-product-image{width:43px;height:43px;border-radius:7px;background:var(--cart-light);color:var(--cart-primary);position:relative;display:flex;align-items:center;justify-content:center}
.checkout-product-image>svg{font-size:18px}
.checkout-product-image img{width:100%;height:100%;object-fit:cover;border-radius:7px}
.checkout-product-image>span{width:17px;height:17px;border-radius:50%;background:var(--cart-primary);color:var(--cart-button-text);position:absolute;top:-5px;right:-5px;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700}
.checkout-product-info{min-width:0}
.checkout-product-info strong{display:block;font-size:10px;overflow-wrap:anywhere}
.checkout-product-info>span{display:block;font-size:9px;color:#98a2b3;margin-top:3px}
.checkout-product>b{font-size:10px}
.cart-success-wrapper{min-height:calc(100vh - 70px);padding:40px 20px;display:flex;align-items:center;justify-content:center}
.cart-success-card{width:min(420px,100%);padding:40px;border:1px solid var(--cart-border);border-radius:15px;background:var(--cart-background);text-align:center;box-shadow:0 10px 35px #00000006}
.cart-success-icon{width:70px;height:70px;border-radius:50%;background:var(--cart-light);color:var(--cart-primary);font-size:30px;display:flex;align-items:center;justify-content:center;margin:0 auto 18px}
.cart-success-card h1{font-size:24px;margin:0 0 10px}
.cart-success-card>p{font-size:11px;color:#98a2b3;line-height:1.6;margin-bottom:24px}
.cart-success-total{background:var(--cart-light);padding:14px;border-radius:8px;display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:11px;margin-bottom:20px}
.cart-success-total strong{color:var(--cart-primary);font-size:18px}
.cart-feedback{padding:14px 16px;margin:0 0 18px;border:1px solid var(--cart-border);border-radius:8px;background:var(--cart-light);color:var(--cart-text);font-size:12px;line-height:1.6;overflow-wrap:anywhere}
.cart-feedback p{margin:0}
.cart-feedback .cart-secondary-button{width:auto!important}
.cart-feedback-error{background:#fff1f0;border-color:#f0cccc;color:#b42318}

@media(max-width:900px){
  .cart-layout,.checkout-layout{grid-template-columns:minmax(0,1fr)}
  .cart-summary,.checkout-summary{position:static}
  .delivery-options,.payment-options{grid-template-columns:minmax(0,1fr)}
}

@media(max-width:650px){
  .cart-header{padding:0 4%;gap:10px}
  .cart-header-right{gap:7px}
  .cart-container{width:92%}
  .cart-heading h1{font-size:25px}
  .cart-item{grid-template-columns:70px minmax(0,1fr);gap:12px}
  .cart-item-image{width:70px;height:70px}
  .cart-item-actions{grid-column:1/-1;justify-content:flex-end;flex-wrap:wrap;gap:12px}
  .checkout-fields.two,.checkout-address{grid-template-columns:minmax(0,1fr)}
  .checkout-progress{overflow-x:auto;padding-bottom:8px}
  .cart-orders-button{padding:0 10px!important}
  .cart-logo{font-size:16px}
  .cart-success-card{padding:30px 20px}
}
`;

export default Cart;