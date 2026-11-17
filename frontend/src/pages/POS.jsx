import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

import { createOwner } from "../api/ownersApi";
import {
  getPosProducts as getProducts,
  getPosCategories as getCategories,
} from "../api/posCatalogApi";
import { createSale } from "../api/salesApi";
import { getClinicOptions } from "../data/clinicOptionsApi";

import {
  getHeldSales,
  getHeldSale,
  holdSale,
  getPendingDeliveries,
  markSaleDelivered,
  getRefundableSales,
  refundSale,
} from "../api/posOperationsApi";

import {
  FaSearch,
  FaShoppingCart,
  FaTrash,
  FaMinus,
  FaPlus,
  FaBoxOpen,
  FaTimes,
  FaCheckCircle,
  FaChevronDown,
  FaUser,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

import {
  FiTruck,
  FiRotateCcw,
  FiCornerUpLeft,
  FiPause,
} from "react-icons/fi";

const USD_TO_LBP = 89500;

const emptyOwner = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  emergencyContact: "",
  notes: "",
  status: "active",
};

const money = (value) => Number(value || 0).toFixed(2);

const displayDate = (value) =>
  new Date(value).toLocaleString();

function POS() {
  const navigate = useNavigate();

  const [inventoryProducts, setInventoryProducts] = useState([]);
  const [inventoryCategories, setInventoryCategories] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [inventoryError, setInventoryError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All categories");

  const [ownerSearch, setOwnerSearch] = useState("");
  const [selectedOwnerId, setSelectedOwnerId] = useState(null);
  const [showAddOwnerModal, setShowAddOwnerModal] = useState(false);
  const [newOwner, setNewOwner] = useState({ ...emptyOwner });
  const [isSavingOwner, setIsSavingOwner] = useState(false);

  const [cart, setCart] = useState([]);
  const [heldSaleId, setHeldSaleId] = useState(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [amountReceived, setAmountReceived] = useState("");
  const [amountReceivedLbp, setAmountReceivedLbp] = useState("");
  const [discount, setDiscount] = useState("0");
  const [hasDelivery, setHasDelivery] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentMethodsLoading, setPaymentMethodsLoading] =
    useState(true);
  const [paymentMethodsError, setPaymentMethodsError] = useState("");

  const [saleComplete, setSaleComplete] = useState(false);
  const [lastSale, setLastSale] = useState(null);
  const [saleNotice, setSaleNotice] = useState("");
  const [checkoutError, setCheckoutError] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);

  const [isBusy, setIsBusy] = useState(false);
  const [busyAction, setBusyAction] = useState("");

  const [actionModal, setActionModal] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [modalNotice, setModalNotice] = useState("");
  const [deliveryTab, setDeliveryTab] = useState("sales");
  const [heldSales, setHeldSales] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [refundableSales, setRefundableSales] = useState([]);

  const [selectedRefundSale, setSelectedRefundSale] = useState(null);
  const [refundQuantities, setRefundQuantities] = useState({});
  const [refundReason, setRefundReason] = useState("");

  const busyRef = useRef(false);
  const savingOwnerRef = useRef(false);
  const saleRequestIdRef = useRef(null);
  const holdRequestIdRef = useRef(null);
  const refundRequestIdRef = useRef(null);
  const modalControllerRef = useRef(null);

  const startAction = (name) => {
    if (busyRef.current) return false;

    busyRef.current = true;
    setIsBusy(true);
    setBusyAction(name);
    return true;
  };

  const endAction = () => {
    busyRef.current = false;
    setIsBusy(false);
    setBusyAction("");
  };

  useEffect(() => {
    let controller;
    let disposed = false;

    const refreshInventory = async () => {
      if (busyRef.current) return;

      controller?.abort();
      controller = new AbortController();
      const signal = controller.signal;

      setInventoryLoading(true);

      try {
        const [loadedProducts, loadedCategories] =
          await Promise.all([
            getProducts({ signal }),
            getCategories({ signal }),
          ]);

        if (disposed || signal.aborted) return;

        setInventoryProducts(loadedProducts);
        setInventoryCategories(loadedCategories);
        setInventoryError("");
      } catch (error) {
        if (!disposed && !signal.aborted) {
          setInventoryError(
            error.message || "Unable to load products."
          );
        }
      } finally {
        if (!disposed && !signal.aborted) {
          setInventoryLoading(false);
        }
      }
    };

    refreshInventory();

    window.addEventListener("focus", refreshInventory);
    window.addEventListener(
      "vetClinicProductsUpdated",
      refreshInventory
    );
    window.addEventListener(
      "vetClinicCategoriesUpdated",
      refreshInventory
    );

    return () => {
      disposed = true;
      controller?.abort();

      window.removeEventListener("focus", refreshInventory);
      window.removeEventListener(
        "vetClinicProductsUpdated",
        refreshInventory
      );
      window.removeEventListener(
        "vetClinicCategoriesUpdated",
        refreshInventory
      );
    };
  }, []);

  useEffect(() => {
    let controller;
    let disposed = false;

    const loadMethods = async () => {
      controller?.abort();
      controller = new AbortController();
      const signal = controller.signal;

      setPaymentMethodsLoading(true);

      try {
        const options = await getClinicOptions({
          listKey: "pos.paymentMethods",
          signal,
        });

        if (disposed || signal.aborted) return;

        const methods = [
          ...new Set(
            options
              .filter((option) => option.isActive)
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((option) => option.value)
          ),
        ];

        setPaymentMethods(methods);
        setPaymentMethodsError("");

        setPaymentMethod((current) =>
          methods.includes(current)
            ? current
            : methods[0] || ""
        );
      } catch (error) {
        if (!disposed && !signal.aborted) {
          setPaymentMethods([]);
          setPaymentMethodsError(error.message);
        }
      } finally {
        if (!disposed && !signal.aborted) {
          setPaymentMethodsLoading(false);
        }
      }
    };

    loadMethods();

    window.addEventListener("focus", loadMethods);
    window.addEventListener("clinicOptionsUpdated", loadMethods);

    return () => {
      disposed = true;
      controller?.abort();

      window.removeEventListener("focus", loadMethods);
      window.removeEventListener(
        "clinicOptionsUpdated",
        loadMethods
      );
    };
  }, []);

  useEffect(
    () => () => modalControllerRef.current?.abort(),
    []
  );

  const products = useMemo(
    () =>
      inventoryProducts
        .filter((product) => product.showOnPOS === true)
        .map((product) => ({
          id: product.id,
          name: String(product.name || ""),
          category: String(product.category || ""),
          price: Number(product.sellingPrice) || 0,
          stock: Math.max(0, Number(product.quantity) || 0),
          image: product.image || "",
        })),
    [inventoryProducts]
  );

  const categories = useMemo(() => {
    const sorted = [...inventoryCategories].sort(
      (a, b) =>
        (Number(a.sortOrder) || 0) -
          (Number(b.sortOrder) || 0) ||
        String(a.title || "").localeCompare(
          String(b.title || "")
        )
    );

    return [
      "All categories",
      ...new Set(
        sorted
          .map((item) => String(item.title || "").trim())
          .filter(Boolean)
      ),
    ];
  }, [inventoryCategories]);

  useEffect(() => {
    if (!categories.includes(category)) {
      setCategory("All categories");
    }
  }, [categories, category]);

  const filteredProducts = useMemo(() => {
    const value = search.trim().toLowerCase();

    return products.filter(
      (product) =>
        (!value ||
          product.name.toLowerCase().includes(value) ||
          product.category.toLowerCase().includes(value)) &&
        (category === "All categories" ||
          product.category === category)
    );
  }, [products, search, category]);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const discountNumber = Math.min(
    Math.max(Number(discount) || 0, 0),
    subtotal
  );

  const total = Math.max(subtotal - discountNumber, 0);
  const received = Math.max(Number(amountReceived) || 0, 0);
  const receivedLbp = Math.max(Number(amountReceivedLbp) || 0, 0);
  const totalPaid = received + receivedLbp / USD_TO_LBP;
  const change = Math.max(totalPaid - total, 0);
  const totalLbp = total * USD_TO_LBP;

  const cartLocked = isBusy || checkoutOpen || Boolean(actionModal);

  const validateAmounts = (values) => {
    if (
      values.some(
        (value) =>
          !Number.isFinite(value) ||
          value < 0 ||
          Math.abs(value * 100 - Math.round(value * 100)) >
            0.000001
      )
    ) {
      throw new Error(
        "Enter valid amounts with at most two decimal places."
      );
    }
  };

  const resetCart = () => {
    setCart([]);
    setHeldSaleId(null);
    setOwnerSearch("");
    setSelectedOwnerId(null);
    setDiscount("0");
    setAmountReceived("");
    setAmountReceivedLbp("");
    setHasDelivery(false);
  };

  const clearCart = () => {
    if (cartLocked || busyRef.current) return;

    // A failed checkout may already have reached the server.
    if (saleRequestIdRef.current || holdRequestIdRef.current) {
      window.alert(
        "A previous request has not been confirmed. " +
          "Retry it before clearing this cart."
      );
      return;
    }

    resetCart();
  };

  const addToCart = (product) => {
    if (
      cartLocked ||
      busyRef.current ||
      inventoryLoading ||
      inventoryError ||
      product.stock <= 0
    ) {
      return;
    }

    setCart((current) => {
      const existing = current.find(
        (item) => item.id === product.id
      );

      if (existing) {
        if (existing.quantity >= product.stock) return current;

        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...current, { ...product, quantity: 1 }];
    });
  };

  const increaseQuantity = (id) => {
    if (cartLocked || inventoryLoading || inventoryError) return;

    const product = products.find((item) => item.id === id);
    if (!product) return;

    setCart((current) =>
      current.map((item) =>
        item.id === id && item.quantity < product.stock
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQuantity = (id) => {
    if (cartLocked) return;

    setCart((current) =>
      current
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const deleteItem = (id) => {
    if (cartLocked) return;

    setCart((current) =>
      current.filter((item) => item.id !== id)
    );
  };

  const openAddOwner = () => {
    if (cartLocked) return;

    setNewOwner({ ...emptyOwner });
    setShowAddOwnerModal(true);
  };

  const handleNewOwnerChange = (event) => {
    if (savingOwnerRef.current) return;

    const { name, value } = event.target;
    setNewOwner((current) => ({ ...current, [name]: value }));
  };

  const handleAddOwner = async (event) => {
    event.preventDefault();
    if (savingOwnerRef.current) return;

    savingOwnerRef.current = true;
    setIsSavingOwner(true);

    try {
      const owner = await createOwner(newOwner);

      setOwnerSearch(`${owner.firstName} ${owner.lastName}`);
      setSelectedOwnerId(owner.id);
      setShowAddOwnerModal(false);
      setNewOwner({ ...emptyOwner });

      window.dispatchEvent(new Event("vetClinicOwnersUpdated"));
    } catch (error) {
      window.alert(error.message);
    } finally {
      savingOwnerRef.current = false;
      setIsSavingOwner(false);
    }
  };

  const refreshStock = async () => {
    const latest = await getProducts();
    setInventoryProducts(latest);
    setInventoryError("");

    window.dispatchEvent(
      new CustomEvent("vetClinicProductsUpdated", {
        detail: latest,
      })
    );

    return latest;
  };

  const buildCurrentCart = (items, latest) =>
    items.map((item) => {
      const id = item.productId ?? item.id;
      const product = latest.find((record) => record.id === id);

      if (
        !product ||
        !product.showOnPOS ||
        Number(product.quantity) < item.quantity
      ) {
        throw new Error(
          `"${item.productName || item.name}" is unavailable ` +
            "or has insufficient stock."
        );
      }

      return {
        id: product.id,
        name: product.name,
        category: product.category,
        price: Number(product.sellingPrice),
        stock: Number(product.quantity),
        image: product.image || "",
        quantity: item.quantity,
      };
    });

  const openCheckout = async () => {
    if (!cart.length || !startAction("checkout")) return;

    try {
      if (holdRequestIdRef.current) {
        throw new Error(
          "Retry the previous Hold request before checkout."
        );
      }

      const latest = await refreshStock();
      const updatedCart = buildCurrentCart(cart, latest);

      setCart(updatedCart);
      setCheckoutError("");

      if (!saleRequestIdRef.current) {
        setAmountReceived("");
        setAmountReceivedLbp("");
        setPaymentMethod(paymentMethods[0] || "");
      }

      setCheckoutOpen(true);
    } catch (error) {
      window.alert(error.message);
    } finally {
      endAction();
    }
  };

  const closeCheckout = () => {
    if (!busyRef.current) setCheckoutOpen(false);
  };

  const handleExactPayment = () => {
    if (busyRef.current) return;
    setAmountReceived(total.toFixed(2));
    setAmountReceivedLbp("");
  };

  const addQuickUsd = (amount) => {
    if (busyRef.current) return;
    setAmountReceived((current) =>
      ((Number(current) || 0) + amount).toFixed(2)
    );
  };

  const addQuickLbp = (amount) => {
    if (busyRef.current) return;
    setAmountReceivedLbp((current) =>
      String((Number(current) || 0) + amount)
    );
  };

  const finishSale = async () => {
    if (!cart.length || !startAction("sale")) return;

    setCheckoutError("");

    try {
      validateAmounts([
        Number(discount || 0),
        Number(amountReceived || 0),
        Number(amountReceivedLbp || 0),
      ]);

      if (
        paymentMethodsLoading ||
        paymentMethodsError ||
        !paymentMethods.includes(paymentMethod)
      ) {
        throw new Error(
          paymentMethodsError ||
            "Select a payment method configured in Settings."
        );
      }

      if (totalPaid + 0.000001 < total) {
        throw new Error(
          "Amount received is less than the amount due."
        );
      }

      saleRequestIdRef.current ??= crypto.randomUUID();

      const sale = await createSale({
        requestId: saleRequestIdRef.current,
        heldSaleId,
        ownerId: selectedOwnerId,
        customerName: ownerSearch.trim() || "Walk-in Customer",
        paymentMethod,
        hasDelivery,
        discount: discountNumber,
        receivedUsd: received,
        receivedLbp: receivedLbp,
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      });

      saleRequestIdRef.current = null;
      setLastSale(sale);
      setCheckoutOpen(false);
      setSaleComplete(true);
      setSaleNotice("");
      resetCart();

      window.dispatchEvent(new Event("vetClinicPOSSalesUpdated"));

      try {
        await refreshStock();
      } catch {
        const message =
          "The sale was saved. Refresh the page to update stock.";

        setInventoryError(message);
        setSaleNotice(message);
      }
    } catch (error) {
      setCheckoutError(error.message || "Could not complete sale.");
    } finally {
      endAction();
    }
  };

  const handleHold = async () => {
    if (!cart.length || !startAction("hold")) return;

    try {
      if (saleRequestIdRef.current) {
        throw new Error(
          "Retry the previous checkout before holding this cart."
        );
      }

      if (heldSaleId) {
        throw new Error(
          "This cart is already held. Complete checkout, " +
            "or clear the cart to leave it in Recall."
        );
      }

      validateAmounts([Number(discount || 0)]);

      holdRequestIdRef.current ??= crypto.randomUUID();

      await holdSale({
        requestId: holdRequestIdRef.current,
        ownerId: selectedOwnerId,
        customerName: ownerSearch.trim() || "Walk-in Customer",
        hasDelivery,
        discount: discountNumber,
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      });

      holdRequestIdRef.current = null;
      resetCart();
    } catch (error) {
      window.alert(error.message || "Could not hold the cart.");
    } finally {
      endAction();
    }
  };

  const openActionModal = async (type) => {
    if (busyRef.current) return;

    modalControllerRef.current?.abort();
    const controller = new AbortController();
    modalControllerRef.current = controller;
    const signal = controller.signal;

    setActionModal(type);
    setModalLoading(true);
    setModalError("");
    setModalNotice("");
    setSelectedRefundSale(null);
    setRefundQuantities({});
    setRefundReason("");
    setDeliveryTab("sales");

    try {
      if (type === "delivery") {
        const records = await getPendingDeliveries({ signal });
        if (!signal.aborted) setDeliveries(records);
      } else if (type === "recall") {
        const records = await getHeldSales({ signal });
        if (!signal.aborted) setHeldSales(records);
      } else if (type === "refund") {
        const records = await getRefundableSales({ signal });
        if (!signal.aborted) setRefundableSales(records);
      }
    } catch (error) {
      if (!signal.aborted) setModalError(error.message);
    } finally {
      if (!signal.aborted) setModalLoading(false);
    }
  };

  const closeActionModal = () => {
    if (busyRef.current) return;

    modalControllerRef.current?.abort();
    setActionModal(null);
  };

  const handleRecall = () => openActionModal("recall");
  const handleRefund = () => openActionModal("refund");

  const recallHeldSale = async (id) => {
    if (!startAction("recall")) return;

    setModalError("");

    try {
      if (
        cart.length ||
        saleRequestIdRef.current ||
        holdRequestIdRef.current
      ) {
        throw new Error(
          "Complete, hold, or clear the current cart first."
        );
      }

      const [held, latest] = await Promise.all([
        getHeldSale(id),
        getProducts(),
      ]);

      const recalledCart = buildCurrentCart(held.items, latest);

      setInventoryProducts(latest);
      setInventoryError("");
      setCart(recalledCart);
      setHeldSaleId(held.id);
      setOwnerSearch(held.customerName);
      setSelectedOwnerId(held.ownerId);
      setDiscount(String(held.discount));
      setHasDelivery(held.hasDelivery);
      setAmountReceived("");
      setAmountReceivedLbp("");
      setActionModal(null);
    } catch (error) {
      setModalError(error.message || "Could not recall sale.");
    } finally {
      endAction();
    }
  };

  const completeDelivery = async (id) => {
    if (!startAction("delivery")) return;

    setModalError("");
    setModalNotice("");

    try {
      await markSaleDelivered(id);

      setDeliveries((current) =>
        current.filter((sale) => sale.id !== id)
      );

      setModalNotice("Delivery marked as completed.");

      window.dispatchEvent(new Event("vetClinicPOSSalesUpdated"));
    } catch (error) {
      setModalError(error.message);
    } finally {
      endAction();
    }
  };

  const selectRefundSale = (sale) => {
    if (busyRef.current) return;

    if (refundRequestIdRef.current) {
      setModalError(
        "Retry the current refund before selecting another sale."
      );
      return;
    }

    setSelectedRefundSale(sale);
    setRefundQuantities({});
    setRefundReason("");
    setModalError("");
    setModalNotice("");
  };

  const submitRefund = async (event) => {
    event.preventDefault();

    if (!selectedRefundSale || !startAction("refund")) return;

    setModalError("");
    setModalNotice("");

    try {
      const reason = refundReason.trim();

      if (!reason || reason.length > 1000) {
        throw new Error(
          "Enter a refund reason of 1000 characters or fewer."
        );
      }

      const items = [];

      for (const item of selectedRefundSale.items) {
        const raw = refundQuantities[item.saleItemId] ?? "";
        const quantity = Number(raw);

        if (raw === "" || quantity === 0) continue;

        if (
          !Number.isInteger(quantity) ||
          quantity < 0 ||
          quantity > item.remainingQuantity
        ) {
          throw new Error(
            `Enter a valid return quantity for "${item.productName}".`
          );
        }

        items.push({
          saleItemId: item.saleItemId,
          quantity,
        });
      }

      if (!items.length) {
        throw new Error("Select at least one quantity to refund.");
      }

      refundRequestIdRef.current ??= crypto.randomUUID();

      const refund = await refundSale({
        requestId: refundRequestIdRef.current,
        saleId: selectedRefundSale.id,
        reason,
        items,
      });

      refundRequestIdRef.current = null;
      setSelectedRefundSale(null);
      setRefundQuantities({});
      setRefundReason("");
      setModalNotice(
        `Refund #${refund.id} recorded: $${money(refund.total)}.`
      );

      window.dispatchEvent(new Event("vetClinicPOSSalesUpdated"));

      try {
        const [latest, availableSales] = await Promise.all([
          getProducts(),
          getRefundableSales(),
        ]);

        setInventoryProducts(latest);
        setInventoryError("");
        setRefundableSales(availableSales);

        window.dispatchEvent(
          new CustomEvent("vetClinicProductsUpdated", {
            detail: latest,
          })
        );
      } catch {
        setRefundableSales([]);
        setInventoryError(
          "The refund was saved. Refresh the page to update stock."
        );
        setModalError(
          "The refund was saved, but the lists could not be " +
            "refreshed. Refresh the page before continuing."
        );
      }
    } catch (error) {
      setModalError(error.message || "Could not record refund.");
    } finally {
      endAction();
    }
  };

  const handleLogout = () => {
    if (busyRef.current) return;
    setAccountOpen(false);
    navigate("/");
  };  const dismissOperations = () => {
    if (refundRequestIdRef.current) {
      setModalError(
        "Retry the current refund before closing this window."
      );
      return;
    }

    closeActionModal();
  };

  return (
    <div className="dashboard-layout pos-dashboard-layout">
      <Sidebar />

      <main className="pos-main">
        <style>{`
          .pos-dashboard-layout {
            min-height: 100dvh;
            display: flex;
            background: #f8fafb;
          }

          .pos-dashboard-layout .pos-main {
            flex: 1;
            min-width: 0;
            height: 100dvh;
            overflow: hidden;
            background: #f8fafb;
            color: #344054;
          }

          .pos-main *,
          .pos-modal-overlay * {
            box-sizing: border-box;
          }

          .pos-main button,
          .pos-main input,
          .pos-main textarea,
          .pos-main select {
            font-family: inherit;
          }

          .pos-main button {
            cursor: pointer;
          }

          .pos-main button:disabled {
            opacity: .5;
            cursor: not-allowed;
          }

          .pos-main button:focus-visible {
            outline: 2px solid #237d7b;
            outline-offset: 2px;
          }

          @media (min-width: 769px) {
            html body #root .dashboard-layout.pos-dashboard-layout {
              --pos-sidebar-space: var(--vet-sidebar-open-width, 260px);
              width: 100% !important;
              max-width: 100% !important;
              min-width: 0 !important;
              margin-left: 0 !important;
              padding-left: var(--pos-sidebar-space) !important;
              box-sizing: border-box !important;
              transition: padding-left .25s ease;
            }

            html body #root .dashboard-layout.pos-dashboard-layout:has(> .sidebar.sidebar-pos-collapsed) {
              --pos-sidebar-space: var(--vet-sidebar-closed-width, 72px);
            }

            html body #root .pos-dashboard-layout > .pos-main {
              position: relative !important;
              left: auto !important;
              right: auto !important;
              flex: 1 1 0 !important;
              width: 0 !important;
              min-width: 0 !important;
              max-width: 100% !important;
              margin: 0 !important;
              transform: none !important;
            }
          }

          .pos-topbar {
            height: 64px;
            padding: 0 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            background: #fff;
            border-bottom: 1px solid #e5eceb;
            position: relative;
            z-index: 50;
          }

          .pos-page-title {
            margin: 0;
            color: #344054;
            font-size: 19px;
            font-weight: 700;
          }

          .pos-account-wrapper { position: relative; }

          .pos-account-button {
            border: 0 !important;
            background: transparent !important;
            padding: 5px 7px !important;
            display: flex !important;
            align-items: center;
            gap: 9px;
            border-radius: 8px !important;
            width: auto !important;
          }

          .pos-account-button:hover { background: #f5f9f8 !important; }

          .pos-staff-avatar {
            width: 35px;
            height: 35px;
            border-radius: 50%;
            background: #e7f7f5;
            color: #159f9f;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: 700;
          }

          .pos-staff-info { text-align: left; line-height: 1.25; }
          .pos-staff-name { color: #344054; font-size: 11px; font-weight: 700; }
          .pos-staff-role { color: #98a2b3; font-size: 9px; margin-top: 2px; }
          .pos-account-arrow { color: #98a2b3; font-size: 9px; }

          .pos-account-menu {
            position: absolute;
            top: calc(100% + 7px);
            right: 0;
            width: 190px;
            padding: 6px;
            background: #fff;
            border: 1px solid #e3eae9;
            border-radius: 9px;
            box-shadow: 0 12px 35px rgba(16,24,40,.13);
            z-index: 500;
          }

          .pos-account-menu-header {
            padding: 9px 10px 10px;
            border-bottom: 1px solid #edf1f1;
          }

          .pos-account-menu button {
            width: 100%;
            border: 0;
            background: transparent;
            padding: 9px 10px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            gap: 8px;
            color: #475467;
            font-size: 11px;
          }

          .pos-account-menu button:hover { background: #f5f9f8; }

          .pos-content {
            height: calc(100dvh - 64px);
            display: grid;
            grid-template-columns: minmax(0, 1fr) 320px;
            min-width: 0;
          }

          .pos-products-section {
            min-width: 0;
            padding: 14px 16px 20px;
            overflow-y: auto;
          }

          .pos-tools { display: flex; gap: 9px; margin-bottom: 13px; }

          .pos-search-box {
            flex: 1;
            min-width: 0;
            height: 40px;
            padding: 0 12px;
            display: flex;
            align-items: center;
            gap: 8px;
            border: 1px solid #dce7e6;
            border-radius: 8px;
            background: #fff;
          }

          .pos-search-box svg { color: #159f9f; font-size: 13px; flex-shrink: 0; }

          .pos-search-box input {
            width: 100%;
            min-width: 0;
            border: 0;
            outline: none;
            background: transparent;
            color: #344054;
            font-size: 12px;
            margin: 0;
            padding: 0;
          }

          html body #root .pos-products-section .pos-category-tabs {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 8px;
            width: 100%;
            min-width: 0;
            margin-bottom: 14px;
            padding: 2px 0 7px;
          }

          html body #root .pos-category-tabs .pos-category-tab {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex: 0 0 auto;
            width: auto;
            min-width: 0;
            min-height: 34px;
            margin: 0;
            padding: 7px 15px;
            border: 1px solid #dce7e6;
            border-radius: 20px;
            background: #fff;
            color: #475467;
            font-size: 12px;
            font-weight: 600;
            line-height: 1.3;
            box-shadow: none;
            max-width: 100%;
            overflow-wrap: anywhere;
          }

          html body #root .pos-category-tabs .pos-category-tab:hover {
            background: #eef9f8;
            border-color: #54b7b5;
            color: #237d7b;
          }

          html body #root .pos-category-tabs .pos-category-tab-active,
          html body #root .pos-category-tabs .pos-category-tab-active:hover {
            background: #54b7b5;
            border-color: #54b7b5;
            color: #fff;
            -webkit-text-fill-color: #fff;
          }

          .pos-products-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(145px, 1fr));
            gap: 10px;
          }

          .pos-product-card {
            min-width: 0;
            min-height: 205px;
            padding: 11px;
            border: 1px solid #dfe8e7;
            border-radius: 10px;
            background: #fff;
            display: flex;
            flex-direction: column;
            transition: .15s ease;
          }

          .pos-product-card:hover {
            border-color: #9ed9d5;
            box-shadow: 0 5px 15px rgba(16,24,40,.06);
          }

          .pos-product-image {
            height: 105px;
            width: 100%;
            border-radius: 7px;
            background: #f4f8f8;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #a8b6b5;
            font-size: 22px;
            overflow: hidden;
          }

          .pos-product-image img { display: block; width: 100%; height: 100%; object-fit: contain; }
          .pos-product-name { margin-top: 8px; color: #344054; font-size: 12px; font-weight: 700; line-height: 1.4; overflow-wrap: anywhere; }
          .pos-product-category { margin-top: 3px; color: #98a2b3; font-size: 10px; overflow-wrap: anywhere; }

          .pos-product-bottom {
            margin-top: auto;
            padding-top: 8px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 5px;
          }

          .pos-product-price { color: #159f9f; font-size: 13px; font-weight: 800; }
          .pos-product-stock { color: #98a2b3; font-size: 10px; }

          .pos-add-button {
            width: 30px !important;
            min-width: 30px !important;
            height: 30px !important;
            padding: 0 !important;
            border: 0 !important;
            border-radius: 50% !important;
            background: #e8f7f5 !important;
            color: #159f9f !important;
            display: flex !important;
            align-items: center;
            justify-content: center;
          }

          .pos-cart-panel {
            min-width: 0;
            height: 100%;
            background: #fff;
            border-left: 1px solid #e3eae9;
            display: flex;
            flex-direction: column;
          }

          .pos-cart-header { padding: 14px; border-bottom: 1px solid #edf1f1; }
          .pos-cart-header h2 { margin: 0 0 10px; color: #344054; font-size: 15px; }
          .pos-owner-control { display: flex; align-items: center; gap: 8px; min-width: 0; }

          .pos-owner-name {
            flex: 1;
            min-width: 0;
            min-height: 38px;
            padding: 10px;
            border: 1px solid #dfe7e7;
            border-radius: 7px;
            color: #475467;
            font-size: 11px;
            overflow-wrap: anywhere;
          }

          .pos-owner-add {
            width: 34px !important;
            min-width: 34px !important;
            height: 36px !important;
            padding: 0 !important;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #bfe2df !important;
            border-radius: 7px !important;
            background: #eff9f8 !important;
            color: #159f9f !important;
          }

          .pos-cart-body { flex: 1; min-height: 0; overflow-y: auto; padding: 10px 13px; }
          .pos-empty-cart { height: 100%; min-height: 180px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #98a2b3; text-align: center; }
          .pos-empty-icon { width: 62px; height: 62px; border-radius: 50%; background: #eff9f8; color: #159f9f; display: flex; align-items: center; justify-content: center; font-size: 23px; margin-bottom: 10px; }
          .pos-empty-cart strong { color: #475467; font-size: 12px; }
          .pos-empty-cart span { margin-top: 4px; font-size: 11px; }

          .pos-cart-item { padding: 11px 0; border-bottom: 1px solid #edf1f1; }
          .pos-cart-item-name { color: #344054; font-size: 12px; font-weight: 700; overflow-wrap: anywhere; }
          .pos-cart-item-row { margin-top: 7px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 7px; }
          .pos-cart-price { color: #159f9f; font-size: 11px; font-weight: 700; }
          .pos-cart-controls { display: flex; align-items: center; gap: 4px; }

          .pos-quantity-button,
          .pos-delete-button {
            width: 29px !important;
            min-width: 29px !important;
            height: 29px !important;
            padding: 0 !important;
            border: 1px solid #dfe7e7 !important;
            border-radius: 5px !important;
            background: #fff !important;
            display: flex !important;
            align-items: center;
            justify-content: center;
            font-size: 10px !important;
            color: #475467 !important;
          }

          .pos-delete-button { color: #d92d20 !important; }
          .pos-cart-quantity { min-width: 22px; text-align: center; color: #344054; font-size: 12px; font-weight: 700; }

          .pos-cart-footer { padding: 12px 13px; border-top: 1px solid #e3eae9; background: #fff; }
          .pos-summary-row { margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between; gap: 10px; color: #667085; font-size: 12px; }
          .pos-summary-row.total { color: #344054; font-size: 14px; font-weight: 700; margin-bottom: 13px; }

          .pos-checkout-btn,
          .pos-clear-btn,
          .pos-hold-btn {
            width: 100% !important;
            min-height: 41px;
            margin: 0 0 8px;
            padding: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            border-radius: 8px !important;
            font-size: 12px;
            font-weight: 600;
          }

          .pos-checkout-btn { border: 1px solid #159f9f !important; background: #159f9f !important; color: #fff !important; }
          .pos-hold-btn { border: 1px solid #dfe7e7 !important; background: #fff !important; color: #475467 !important; }
          .pos-clear-btn { border: 0 !important; background: #f8fafb !important; color: #667085 !important; min-height: 30px; }

          .pos-bottom-actions {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 6px;
            margin-top: 5px;
          }

          .pos-main .pos-bottom-action {
            width: 100%;
            min-width: 0;
            min-height: 40px;
            margin: 0;
            padding: 8px 4px;
            border: 1px solid #dfe7e7;
            border-radius: 8px;
            background: #fff;
            color: #202b36;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
            font-size: 11px;
            font-weight: 600;
          }

          .pos-bottom-action svg { width: 18px; height: 18px; flex: 0 0 18px; stroke-width: 1.8; }
          .pos-main .pos-bottom-action:hover { background: #eff9f8; border-color: #9ed9d5; }
          .pos-held-note { margin: 8px 0 0; font-size: 11px; color: #159f9f; }

          .pos-feedback {
            margin: 0 0 12px;
            padding: 11px 13px;
            border: 1px solid #f3cbc8;
            border-radius: 8px;
            background: #fff5f4;
            color: #b42318;
            font-size: 12px;
            line-height: 1.6;
            overflow-wrap: anywhere;
            white-space: pre-line;
          }

          .pos-feedback.success { color: #237d7b; background: #eef9f8; border-color: #bfe2df; }
          .pos-empty-message { margin: 0; padding: 28px 12px; color: #98a2b3; text-align: center; font-size: 13px; line-height: 1.6; }

          .pos-modal-overlay {
            position: fixed;
            inset: 0;
            z-index: 10000;
            padding: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(16,24,40,.45);
            backdrop-filter: blur(3px);
            overflow: hidden;
          }

          .pos-checkout-reference,
          .pos-operation-modal,
          .pos-owner-modal,
          .pos-success-card {
            min-width: 0;
            max-width: 100%;
            max-height: calc(100dvh - 40px);
            background: #fff;
            border: 1px solid #e3eae9;
            border-radius: 14px;
            box-shadow: 0 20px 55px rgba(16,24,40,.2);
            overflow: hidden;
          }

          .pos-checkout-reference { width: 930px; display: flex; flex-direction: column; }
          .pos-operation-modal { width: 650px; display: flex; flex-direction: column; }
          .pos-owner-modal { width: 600px; display: flex; flex-direction: column; }

          .pos-reference-checkout-header,
          .pos-operation-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            flex-shrink: 0;
            padding: 19px 22px;
            background: #55b8b4;
            color: #fff;
          }

          .pos-reference-checkout-header h2,
          .pos-operation-header h2 { margin: 0; font-size: 20px; color: #fff; }
          .pos-reference-checkout-header p { margin: 5px 0 0; font-size: 12px; color: #fff; }

          .pos-main .pos-reference-close {
            position: static;
            display: flex;
            align-items: center;
            justify-content: center;
            flex: 0 0 32px;
            width: 32px;
            height: 32px;
            margin: 0;
            padding: 0;
            border: 0;
            border-radius: 50%;
            background: rgba(255,255,255,.16);
            color: #fff;
          }

          .pos-reference-checkout-body {
            display: grid;
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
            min-height: 0;
            overflow-y: auto;
          }

          .pos-financial-panel,
          .pos-reference-payment { padding: 22px; min-width: 0; }
          .pos-financial-panel { background: #f8fbfb; border-right: 1px solid #e4eceb; }
          .pos-reference-checkout-body h3 { margin: 0 0 15px; color: #344054; font-size: 14px; }

          .pos-financial-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
          .pos-financial-field { min-width: 0; }
          .pos-financial-field label,
          .pos-reference-field label,
          .pos-owner-field label { display: block; margin-bottom: 8px; color: #667085; font-size: 12px; }

          .pos-financial-value { padding: 11px 10px; min-height: 40px; background: #fff; border: 1px solid #e3eae9; border-radius: 7px; font-size: 13px; overflow-wrap: anywhere; }

          .pos-checkout-reference input:not([type="checkbox"]),
          .pos-owner-modal input,
          .pos-owner-modal textarea,
          .pos-refund-form input,
          .pos-refund-form textarea {
            width: 100%;
            min-width: 0;
            padding: 10px 11px;
            margin: 0;
            border: 1px solid #dce7e6;
            border-radius: 7px;
            background: #fff;
            color: #344054;
            font-size: 13px;
            outline: none;
            font-family: inherit;
          }

          .pos-main input:focus,
          .pos-main textarea:focus { border-color: #55b8b4; }

          .pos-reference-total-box { margin-top: 18px; padding: 17px; background: #e9f7f5; border-radius: 9px; display: flex; flex-direction: column; gap: 7px; color: #237d7b; }
          .pos-reference-total-box span { font-size: 12px; }
          .pos-reference-total-box strong { font-size: 25px; }
          .pos-delivery-checkbox { display: flex; align-items: center; gap: 8px; margin: 17px 0; color: #475467; font-size: 12px; }
          .pos-delivery-checkbox input { width: 16px; height: 16px; margin: 0; accent-color: #159f9f; }

          .pos-checkout-items-mini { margin-top: 20px; }
          .pos-checkout-mini-item { display: flex; justify-content: space-between; gap: 12px; padding: 10px 0; border-bottom: 1px solid #e3eae9; font-size: 12px; overflow-wrap: anywhere; }
          .pos-checkout-mini-item span { display: block; margin-top: 5px; color: #98a2b3; }

          .pos-reference-amount-due { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 13px; border-radius: 8px; background: #eff9f8; margin-bottom: 18px; font-size: 12px; }
          .pos-reference-amount-due strong { color: #159f9f; font-size: 20px; }

          .pos-received-title { margin-bottom: 9px; font-size: 12px; color: #667085; }

          .pos-reference-payment-methods { display: flex; flex-wrap: wrap; gap: 7px; margin-bottom: 18px; }

          .pos-reference-payment-methods button,
          .pos-reference-quick-payments button {
            width: auto;
            min-width: 0;
            margin: 0;
            padding: 8px 11px;
            border: 1px solid #dce7e6;
            border-radius: 7px;
            background: #fff;
            color: #475467;
            font-size: 11px;
          }

          .pos-reference-payment-methods button.active { border-color: #159f9f; background: #159f9f; color: #fff; }
          .pos-reference-field { margin-bottom: 18px; }
          .pos-reference-quick-payments { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
          .pos-reference-payment-summary { border-top: 1px solid #e3eae9; padding-top: 13px; }
          .pos-reference-payment-summary > div { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 10px; font-size: 12px; color: #667085; }
          .pos-reference-payment-summary strong { color: #344054; }

          .pos-reference-checkout-footer,
          .pos-owner-footer {
            display: flex;
            justify-content: flex-end;
            flex-wrap: wrap;
            gap: 10px;
            padding: 15px 22px;
            border-top: 1px solid #e3eae9;
            flex-shrink: 0;
            background: #fff;
          }

          .pos-reference-checkout-footer button,
          .pos-owner-footer button,
          .pos-operation-button,
          .pos-success-button {
            width: auto;
            margin: 0;
            min-height: 39px;
            padding: 10px 16px;
            border: 1px solid #dce7e6;
            border-radius: 7px;
            background: #fff;
            color: #475467;
            font-size: 12px;
            font-weight: 600;
          }

          .pos-main .pos-complete-sale,
          .pos-main .pos-operation-button.primary,
          .pos-main .pos-success-button {
            background: #159f9f;
            border-color: #159f9f;
            color: #fff;
          }

          .pos-operation-body { padding: 22px; overflow-y: auto; min-height: 0; }
          .pos-delivery-tabs { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; padding: 6px; margin-bottom: 18px; border-radius: 9px; background: #f3f6f6; }

          .pos-delivery-tabs button {
            width: 100%;
            min-width: 0;
            margin: 0;
            padding: 10px;
            border: 0;
            border-radius: 7px;
            background: transparent;
            color: #475467;
            font-size: 13px;
          }

          .pos-delivery-tabs button.active { background: #159f9f; color: #fff; }

          .pos-operation-row {
            padding: 13px;
            margin-bottom: 10px;
            border: 1px solid #e3eae9;
            border-radius: 9px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 12px;
          }

          .pos-operation-row > div { min-width: 0; flex: 1 1 180px; }
          .pos-operation-row strong { display: block; color: #344054; font-size: 13px; overflow-wrap: anywhere; }
          .pos-operation-row span { display: block; margin-top: 5px; color: #98a2b3; font-size: 11px; line-height: 1.5; overflow-wrap: anywhere; }
          .pos-refund-form h3 { font-size: 14px; margin: 0 0 15px; }
          .pos-refund-item { padding: 13px 0; border-bottom: 1px solid #e3eae9; display: grid; grid-template-columns: minmax(0, 1fr) 90px; align-items: center; gap: 14px; }
          .pos-refund-item strong { display: block; font-size: 12px; overflow-wrap: anywhere; }
          .pos-refund-item span { display: block; margin-top: 5px; font-size: 11px; color: #98a2b3; line-height: 1.5; }
          .pos-refund-item label { display: block; font-size: 10px; margin-bottom: 6px; color: #667085; }
          .pos-refund-reason { display: block; margin: 18px 0 8px; font-size: 12px; }
          .pos-refund-form textarea { min-height: 80px; resize: vertical; }
          .pos-refund-help { color: #667085; font-size: 11px; line-height: 1.6; margin: 12px 0; }
          .pos-refund-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 9px; margin-top: 18px; }

          .pos-owner-form { overflow-y: auto; padding: 20px 22px; }
          .pos-owner-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
          .pos-owner-field { min-width: 0; }
          .pos-owner-field.wide { grid-column: 1 / -1; }
          .pos-owner-modal textarea { min-height: 75px; resize: vertical; }
          .pos-owner-footer { padding: 18px 0 0; margin-top: 18px; }

          .pos-success-card { width: 390px; padding: 30px 25px; text-align: center; overflow-y: auto; }
          .pos-success-icon { font-size: 48px; color: #159f9f; }
          .pos-success-card h2 { color: #344054; font-size: 21px; margin: 15px 0 10px; }
          .pos-success-card p { color: #667085; font-size: 13px; line-height: 1.6; }
          .pos-success-button { margin-top: 12px; }

          @media (max-width: 1100px) {
            .pos-content { grid-template-columns: minmax(0, 1fr) 300px; }
            .pos-products-grid { grid-template-columns: repeat(auto-fill, minmax(125px, 1fr)); }
          }

          @media (max-width: 950px) {
            html body #root .pos-dashboard-layout > .pos-main {
              height: auto !important;
              min-height: 100dvh;
              overflow: visible;
            }

            .pos-content { height: auto; grid-template-columns: minmax(0, 1fr); }
            .pos-products-section { overflow: visible; }
            .pos-cart-panel { height: auto; border-left: 0; border-top: 1px solid #e3eae9; }
            .pos-cart-body { max-height: 360px; flex: none; }
            .pos-empty-cart { min-height: 150px; }
            .pos-products-grid { grid-template-columns: repeat(auto-fill, minmax(145px, 1fr)); }
            .pos-bottom-action { min-height: 44px !important; font-size: 12px !important; }
          }

          @media (max-width: 768px) {
            html body #root .dashboard-layout.pos-dashboard-layout {
              display: block;
              width: 100% !important;
              min-width: 0 !important;
              max-width: 100% !important;
              padding-left: 0 !important;
              margin-left: 0 !important;
            }

            html body #root .pos-dashboard-layout > .pos-main {
              width: 100% !important;
              min-width: 0 !important;
              margin-left: 0 !important;
            }

            .pos-topbar { padding-left: 62px; padding-right: 12px; }
            .pos-reference-checkout-body { grid-template-columns: minmax(0, 1fr); }
            .pos-financial-panel { border-right: 0; border-bottom: 1px solid #e3eae9; }
            .pos-modal-overlay { padding: 12px; }

            .pos-checkout-reference,
            .pos-operation-modal,
            .pos-owner-modal,
            .pos-success-card {
              max-height: calc(100dvh - 24px);
            }

            .pos-reference-checkout-header,
            .pos-operation-header { padding: 16px; }
            .pos-financial-panel,
            .pos-reference-payment,
            .pos-operation-body,
            .pos-owner-form { padding: 16px; }
          }

          @media (max-width: 420px) {
            .pos-products-section { padding: 12px; }
            .pos-products-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
            .pos-product-card { padding: 9px; min-height: 195px; }
            .pos-product-image { height: 90px; }
            .pos-staff-info { display: none; }
            .pos-owner-grid { grid-template-columns: minmax(0, 1fr); }
            .pos-financial-grid { gap: 10px; }
            .pos-reference-checkout-footer { padding: 12px 16px; }
            .pos-reference-checkout-footer button { flex: 1; }
            .pos-operation-row .pos-operation-button { width: 100%; }
          }
        `}</style>

        <header className="pos-topbar">
          <h1 className="pos-page-title">POS</h1>

          <div className="pos-account-wrapper">
            <button
              type="button"
              className="pos-account-button"
              onClick={() => setAccountOpen(!accountOpen)}
              disabled={isBusy}
            >
              <div className="pos-staff-avatar">CS</div>
              <div className="pos-staff-info">
                <div className="pos-staff-name">Clinic Staff</div>
                <div className="pos-staff-role">Staff</div>
              </div>
              <FaChevronDown className="pos-account-arrow" />
            </button>

            {accountOpen && (
              <div className="pos-account-menu">
                <div className="pos-account-menu-header">
                  <div className="pos-staff-name">Clinic Staff</div>
                  <div className="pos-staff-role">Staff Account</div>
                </div>

                <button
                  type="button"
                  onClick={() => setAccountOpen(false)}
                >
                  <FaUser /> Profile
                </button>

                <button
                  type="button"
                  onClick={() => setAccountOpen(false)}
                >
                  <FaCog /> Settings
                </button>

                <button type="button" onClick={handleLogout}>
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="pos-content">
          <section className="pos-products-section">
            <div className="pos-tools">
              <div className="pos-search-box">
                <FaSearch />
                <input
                  type="search"
                  placeholder="Search products..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  aria-label="Search products"
                />
              </div>
            </div>

            <div
              className="pos-category-tabs"
              role="group"
              aria-label="Product categories"
            >
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`pos-category-tab ${
                    category === item ? "pos-category-tab-active" : ""
                  }`}
                  aria-pressed={category === item}
                  onClick={() => setCategory(item)}
                >
                  {item === "All categories" ? "All" : item}
                </button>
              ))}
            </div>

            {inventoryError && (
              <p className="pos-feedback" role="alert">
                {inventoryError}
              </p>
            )}

            {inventoryLoading ? (
              <p className="pos-empty-message">Loading products...</p>
            ) : inventoryError ? null : (
              <>
                <div className="pos-products-grid">
                  {filteredProducts.map((product) => {
                    const quantityInCart =
                      cart.find((item) => item.id === product.id)
                        ?.quantity || 0;

                    const canAdd =
                      !cartLocked && product.stock > quantityInCart;

                    return (
                      <div
                        className="pos-product-card"
                        key={product.id}
                        role="group"
                        aria-label={product.name}
                        onClick={() => {
                          if (canAdd) addToCart(product);
                        }}
                        style={{
                          cursor: canAdd ? "pointer" : "default",
                        }}
                      >
                        <div className="pos-product-image">
                          {product.image ? (
                            <img src={product.image} alt={product.name} />
                          ) : (
                            <FaBoxOpen />
                          )}
                        </div>

                        <div className="pos-product-name">
                          {product.name}
                        </div>

                        <div className="pos-product-category">
                          {product.category}
                        </div>

                        <div className="pos-product-bottom">
                          <div>
                            <div className="pos-product-price">
                              ${money(product.price)}
                            </div>
                            <div className="pos-product-stock">
                              Stock: {product.stock}
                            </div>
                          </div>

                          <button
                            type="button"
                            className="pos-add-button"
                            disabled={!canAdd}
                            aria-label={`Add ${product.name} to cart`}
                            onClick={(event) => {
                              event.stopPropagation();
                              addToCart(product);
                            }}
                          >
                            <FaPlus />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {filteredProducts.length === 0 && (
                  <div className="pos-empty-message">
                    <FaBoxOpen />
                    <p>No products found.</p>
                  </div>
                )}
              </>
            )}
          </section>

          <aside className="pos-cart-panel">
            <div className="pos-cart-header">
              <h2>Cart</h2>

              <div className="pos-owner-control">
                <div className="pos-owner-name">
                  {ownerSearch || "Walk-in Customer"}
                </div>
                <button
                  type="button"
                  className="pos-owner-add"
                  onClick={openAddOwner}
                  disabled={cartLocked}
                  title="Add Owner"
                  aria-label="Add Owner"
                >
                  <FaPlus />
                </button>
              </div>

              {heldSaleId && (
                <p className="pos-held-note">
                  Recalled cart #{heldSaleId}
                </p>
              )}
            </div>

            <div className="pos-cart-body">
              {cart.length === 0 ? (
                <div className="pos-empty-cart">
                  <div className="pos-empty-icon">
                    <FaShoppingCart />
                  </div>
                  <strong>Your cart is empty</strong>
                  <span>Add products to get started</span>
                </div>
              ) : (
                cart.map((item) => (
                  <div className="pos-cart-item" key={item.id}>
                    <div className="pos-cart-item-name">{item.name}</div>
                    <div className="pos-cart-item-row">
                      <div className="pos-cart-price">
                        ${money(item.price)} × {item.quantity}
                      </div>

                      <div className="pos-cart-controls">
                        <button
                          type="button"
                          className="pos-quantity-button"
                          onClick={() => decreaseQuantity(item.id)}
                          disabled={cartLocked}
                          aria-label={`Decrease ${item.name} quantity`}
                        >
                          <FaMinus />
                        </button>

                        <span className="pos-cart-quantity">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          className="pos-quantity-button"
                          onClick={() => increaseQuantity(item.id)}
                          disabled={
                            cartLocked ||
                            inventoryLoading ||
                            Boolean(inventoryError) ||
                            item.quantity >=
                              (products.find(
                                (product) => product.id === item.id
                              )?.stock || 0)
                          }
                          aria-label={`Increase ${item.name} quantity`}
                        >
                          <FaPlus />
                        </button>

                        <button
                          type="button"
                          className="pos-delete-button"
                          onClick={() => deleteItem(item.id)}
                          disabled={cartLocked}
                          aria-label={`Remove ${item.name}`}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pos-cart-footer">
              <div className="pos-summary-row">
                <span>Subtotal (USD)</span>
                <strong>${money(subtotal)}</strong>
              </div>

              <div className="pos-summary-row">
                <span>Equivalent (LBP)</span>
                <strong>
                  {(subtotal * USD_TO_LBP).toLocaleString("en-US", {
                    maximumFractionDigits: 0,
                  })} LBP
                </strong>
              </div>

              <div className="pos-summary-row total">
                <span>Total</span>
                <strong>${money(subtotal)}</strong>
              </div>

              <button
                type="button"
                className="pos-checkout-btn"
                onClick={openCheckout}
                disabled={
                  !cart.length ||
                  cartLocked ||
                  inventoryLoading ||
                  Boolean(inventoryError)
                }
              >
                <FaShoppingCart />
                {busyAction === "checkout" ? "Checking..." : "Checkout"}
              </button>

              <button
                type="button"
                className="pos-hold-btn"
                onClick={handleHold}
                disabled={!cart.length || cartLocked}
              >
                <FiPause />
                {busyAction === "hold" ? "Holding..." : "Hold"}
              </button>

              <button
                type="button"
                className="pos-clear-btn"
                onClick={clearCart}
                disabled={!cart.length || cartLocked}
              >
                Clear cart
              </button>

              <div className="pos-bottom-actions">
                <button
                  type="button"
                  className="pos-bottom-action"
                  onClick={() => openActionModal("delivery")}
                  disabled={cartLocked}
                >
                  <FiTruck />
                  Delivery
                </button>

                <button
                  type="button"
                  className="pos-bottom-action"
                  onClick={handleRecall}
                  disabled={cartLocked}
                >
                  <FiRotateCcw />
                  Recall
                </button>

                <button
                  type="button"
                  className="pos-bottom-action"
                  onClick={handleRefund}
                  disabled={cartLocked}
                >
                  <FiCornerUpLeft />
                  Refund
                </button>
              </div>
            </div>
          </aside>
        </div>

        {showAddOwnerModal && (
          <div className="pos-modal-overlay">
            <div
              className="pos-owner-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="pos-owner-title"
            >
              <div className="pos-operation-header">
                <h2 id="pos-owner-title">Add Owner</h2>
                <button
                  type="button"
                  className="pos-reference-close"
                  onClick={() => setShowAddOwnerModal(false)}
                  disabled={isSavingOwner}
                  aria-label="Close"
                >
                  <FaTimes />
                </button>
              </div>

              <form className="pos-owner-form" onSubmit={handleAddOwner}>
                <div className="pos-owner-grid">
                  {[
                    ["firstName", "First Name", "text", true],
                    ["lastName", "Last Name", "text", true],
                    ["email", "Email", "email", true],
                    ["phone", "Phone", "tel", true],
                    ["address", "Address", "text", false],
                    ["emergencyContact", "Emergency Contact", "text", false],
                  ].map(([name, label, type, required]) => (
                    <div className="pos-owner-field" key={name}>
                      <label htmlFor={`pos-owner-${name}`}>{label}</label>
                      <input
                        id={`pos-owner-${name}`}
                        type={type}
                        name={name}
                        placeholder={`Enter ${label.toLowerCase()}`}
                        value={newOwner[name]}
                        onChange={handleNewOwnerChange}
                        disabled={isSavingOwner}
                        required={required}
                      />
                    </div>
                  ))}

                  <div className="pos-owner-field wide">
                    <label htmlFor="pos-owner-notes">Notes</label>
                    <textarea
                      id="pos-owner-notes"
                      name="notes"
                      value={newOwner.notes}
                      onChange={handleNewOwnerChange}
                      disabled={isSavingOwner}
                      placeholder="Enter owner notes..."
                    />
                  </div>
                </div>

                <div className="pos-owner-footer">
                  <button
                    type="button"
                    onClick={() => setShowAddOwnerModal(false)}
                    disabled={isSavingOwner}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="pos-complete-sale"
                    disabled={isSavingOwner}
                  >
                    {isSavingOwner ? "Saving..." : "Add Owner"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {checkoutOpen && (
          <div className="pos-modal-overlay">
            <div
              className="pos-checkout-reference"
              role="dialog"
              aria-modal="true"
              aria-labelledby="pos-checkout-title"
            >
              <div className="pos-reference-checkout-header">
                <div>
                  <h2 id="pos-checkout-title">Checkout</h2>
                  <p>Complete your transaction</p>
                </div>
                <button
                  type="button"
                  className="pos-reference-close"
                  onClick={closeCheckout}
                  disabled={isBusy}
                  aria-label="Close checkout"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="pos-reference-checkout-body">
                <div className="pos-financial-panel">
                  <h3>Financial Summary</h3>

                  <div className="pos-financial-grid">
                    <div className="pos-financial-field">
                      <label>Subtotal (USD)</label>
                      <div className="pos-financial-value">
                        ${money(subtotal)}
                      </div>
                    </div>

                    <div className="pos-financial-field">
                      <label htmlFor="pos-discount">Discount (USD)</label>
                      <input
                        id="pos-discount"
                        type="number"
                        min="0"
                        max={subtotal}
                        step="0.01"
                        value={discount}
                        onChange={(event) => setDiscount(event.target.value)}
                        disabled={isBusy}
                      />
                    </div>

                    <div className="pos-financial-field">
                      <label>Discount Applied</label>
                      <div className="pos-financial-value">
                        ${money(discountNumber)}
                      </div>
                    </div>

                    <div className="pos-financial-field">
                      <label>Total (LBP)</label>
                      <div className="pos-financial-value">
                        {totalLbp.toLocaleString("en-US", {
                          maximumFractionDigits: 0,
                        })} LBP
                      </div>
                    </div>
                  </div>

                  <div className="pos-reference-total-box">
                    <span>Total Amount Due</span>
                    <strong>${money(total)}</strong>
                  </div>

                  <label className="pos-delivery-checkbox">
                    <input
                      type="checkbox"
                      checked={hasDelivery}
                      onChange={(event) =>
                        setHasDelivery(event.target.checked)
                      }
                      disabled={isBusy}
                    />
                    Delivery Order
                  </label>

                  <div className="pos-checkout-items-mini">
                    <h3>Order Items</h3>
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="pos-checkout-mini-item"
                      >
                        <div>
                          <strong>{item.name}</strong>
                          <span>
                            ${money(item.price)} × {item.quantity}
                          </span>
                        </div>
                        <strong>
                          ${money(item.price * item.quantity)}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pos-reference-payment">
                  <h3>Payment Details</h3>
                  <div className="pos-reference-amount-due">
                    <span>Amount Due</span>
                    <strong>${money(total)}</strong>
                  </div>

                  <div className="pos-received-title">
                    Payment Method
                  </div>

                  {paymentMethodsError && (
                    <p className="pos-feedback" role="alert">
                      {paymentMethodsError}
                    </p>
                  )}

                  {paymentMethodsLoading && (
                    <p className="pos-empty-message">
                      Loading payment methods...
                    </p>
                  )}

                  {!paymentMethodsLoading &&
                    !paymentMethodsError &&
                    !paymentMethods.length && (
                      <p className="pos-feedback">
                        Add an active payment method in Settings.
                      </p>
                    )}

                  <div className="pos-reference-payment-methods">
                    {paymentMethods.map((method) => (
                      <button
                        key={method}
                        type="button"
                        className={paymentMethod === method ? "active" : ""}
                        onClick={() => setPaymentMethod(method)}
                        disabled={isBusy}
                      >
                        {method}
                      </button>
                    ))}
                  </div>

                  <div className="pos-reference-field">
                    <label htmlFor="pos-received-usd">
                      Amount Received (USD)
                    </label>
                    <input
                      id="pos-received-usd"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={amountReceived}
                      onChange={(event) =>
                        setAmountReceived(event.target.value)
                      }
                      disabled={isBusy}
                    />

                    <div className="pos-reference-quick-payments">
                      <button
                        type="button"
                        onClick={handleExactPayment}
                        disabled={isBusy}
                      >
                        Exact
                      </button>

                      {[5, 10, 20, 50, 100].map((amount) => (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => addQuickUsd(amount)}
                          disabled={isBusy}
                        >
                          +${amount}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pos-reference-field">
                    <label htmlFor="pos-received-lbp">
                      Amount Received (LBP)
                    </label>
                    <input
                      id="pos-received-lbp"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0"
                      value={amountReceivedLbp}
                      onChange={(event) =>
                        setAmountReceivedLbp(event.target.value)
                      }
                      disabled={isBusy}
                    />

                    <div className="pos-reference-quick-payments">
                      {[100000, 500000, 1000000].map((amount) => (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => addQuickLbp(amount)}
                          disabled={isBusy}
                        >
                          +{amount.toLocaleString("en-US")}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pos-reference-payment-summary">
                    <div>
                      <span>Total Paid</span>
                      <strong>${money(totalPaid)}</strong>
                    </div>
                    <div>
                      <span>Remaining</span>
                      <strong>${money(Math.max(total - totalPaid, 0))}</strong>
                    </div>
                    <div>
                      <span>Change</span>
                      <strong>${money(change)}</strong>
                    </div>
                  </div>

                  {checkoutError && (
                    <p className="pos-feedback" role="alert">
                      {checkoutError}
                    </p>
                  )}
                </div>
              </div>

              <div className="pos-reference-checkout-footer">
                <button
                  type="button"
                  onClick={closeCheckout}
                  disabled={isBusy}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="pos-complete-sale"
                  onClick={finishSale}
                  disabled={
                    isBusy ||
                    paymentMethodsLoading ||
                    Boolean(paymentMethodsError) ||
                    !paymentMethods.includes(paymentMethod) ||
                    totalPaid + 0.000001 < total
                  }
                >
                  {busyAction === "sale" ? "Saving..." : "Complete Sale"}
                </button>
              </div>
            </div>
          </div>
        )}

        {actionModal && (
          <div className="pos-modal-overlay">
            <div
              className="pos-operation-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="pos-operation-title"
            >
              <div className="pos-operation-header">
                <h2 id="pos-operation-title">
                  {actionModal === "delivery"
                    ? "Delivery"
                    : actionModal === "recall"
                      ? "Held sales"
                      : "Refund a sale"}
                </h2>

                <button
                  type="button"
                  className="pos-reference-close"
                  onClick={dismissOperations}
                  disabled={isBusy}
                  aria-label="Close"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="pos-operation-body">
                {actionModal === "delivery" && (
                  <div className="pos-delivery-tabs">
                    <button
                      type="button"
                      className={deliveryTab === "orders" ? "active" : ""}
                      onClick={() => setDeliveryTab("orders")}
                      disabled={isBusy}
                    >
                      Orders
                    </button>
                    <button
                      type="button"
                      className={deliveryTab === "sales" ? "active" : ""}
                      onClick={() => setDeliveryTab("sales")}
                      disabled={isBusy}
                    >
                      Sales
                    </button>
                  </div>
                )}

                {modalError && (
                  <p className="pos-feedback" role="alert">
                    {modalError}
                  </p>
                )}

                {modalNotice && (
                  <p className="pos-feedback success" role="status">
                    {modalNotice}
                  </p>
                )}

                {modalLoading ? (
                  <p className="pos-empty-message">Loading...</p>
                ) : (
                  <>
                    {actionModal === "delivery" &&
                      deliveryTab === "orders" && (
                        <p className="pos-empty-message">
                          Order delivery is not available yet.
                        </p>
                      )}

                    {actionModal === "delivery" &&
                      deliveryTab === "sales" && (
                        <>
                          {!modalError && deliveries.length === 0 && (
                            <p className="pos-empty-message">
                              No sales waiting for delivery.
                            </p>
                          )}

                          {deliveries.map((sale) => (
                            <div className="pos-operation-row" key={sale.id}>
                              <div>
                                <strong>
                                  Sale #{sale.id} · {sale.customerName}
                                </strong>
                                <span>
                                  {displayDate(sale.createdAt)}
                                </span>
                                <span>
                                  ${money(sale.total)} · {sale.deliveryStatus}
                                </span>
                              </div>

                              <button
                                type="button"
                                className="pos-operation-button primary"
                                onClick={() => completeDelivery(sale.id)}
                                disabled={isBusy}
                              >
                                {busyAction === "delivery"
                                  ? "Saving..."
                                  : "Mark delivered"}
                              </button>
                            </div>
                          ))}
                        </>
                      )}

                    {actionModal === "recall" && (
                      <>
                        {!modalError && heldSales.length === 0 && (
                          <p className="pos-empty-message">No held sales.</p>
                        )}

                        {heldSales.map((held) => (
                          <div className="pos-operation-row" key={held.id}>
                            <div>
                              <strong>
                                #{held.id} · {held.customerName}
                              </strong>
                              <span>{displayDate(held.createdAt)}</span>
                              <span>
                                {held.items.reduce(
                                  (sum, item) => sum + item.quantity,
                                  0
                                )} items
                                {held.hasDelivery ? " · Delivery" : ""}
                              </span>
                            </div>

                            <button
                              type="button"
                              className="pos-operation-button primary"
                              onClick={() => recallHeldSale(held.id)}
                              disabled={isBusy}
                            >
                              {busyAction === "recall"
                                ? "Loading..."
                                : "Recall"}
                            </button>
                          </div>
                        ))}
                      </>
                    )}

                    {actionModal === "refund" &&
                      !selectedRefundSale && (
                        <>
                          {!modalError && refundableSales.length === 0 && (
                            <p className="pos-empty-message">
                              No refundable sales.
                            </p>
                          )}

                          {refundableSales.map((sale) => (
                            <div className="pos-operation-row" key={sale.id}>
                              <div>
                                <strong>
                                  Sale #{sale.id} · {sale.customerName}
                                </strong>
                                <span>{displayDate(sale.createdAt)}</span>
                                <span>
                                  Total: ${money(sale.total)}
                                  {" · "}Refunded: ${money(sale.refundedTotal)}
                                </span>
                              </div>

                              <button
                                type="button"
                                className="pos-operation-button"
                                onClick={() => selectRefundSale(sale)}
                                disabled={isBusy}
                              >
                                Select
                              </button>
                            </div>
                          ))}
                        </>
                      )}

                    {actionModal === "refund" && selectedRefundSale && (
                      <form className="pos-refund-form" onSubmit={submitRefund}>
                        <h3>
                          Sale #{selectedRefundSale.id}
                          {" · "}{selectedRefundSale.customerName}
                        </h3>

                        {selectedRefundSale.items.map((item) => (
                          <div className="pos-refund-item" key={item.saleItemId}>
                            <div>
                              <strong>{item.productName}</strong>
                              <span>
                                Sold: {item.soldQuantity}
                                {" · "}Returned: {item.refundedQuantity}
                                {" · "}Available: {item.remainingQuantity}
                              </span>
                            </div>

                            <div>
                              <label htmlFor={`refund-${item.saleItemId}`}>
                                Return qty
                              </label>
                              <input
                                id={`refund-${item.saleItemId}`}
                                type="number"
                                min="0"
                                max={item.remainingQuantity}
                                step="1"
                                placeholder="0"
                                value={
                                  refundQuantities[item.saleItemId] ?? ""
                                }
                                onChange={(event) =>
                                  setRefundQuantities((current) => ({
                                    ...current,
                                    [item.saleItemId]: event.target.value,
                                  }))
                                }
                                disabled={isBusy || !item.remainingQuantity}
                              />
                            </div>
                          </div>
                        ))}

                        <label
                          htmlFor="pos-refund-reason"
                          className="pos-refund-reason"
                        >
                          Refund reason
                        </label>

                        <textarea
                          id="pos-refund-reason"
                          value={refundReason}
                          onChange={(event) =>
                            setRefundReason(event.target.value)
                          }
                          maxLength={1000}
                          placeholder="Enter the reason for this refund"
                          disabled={isBusy}
                          required
                        />

                        <p className="pos-refund-help">
                          The refund uses the original sale prices and
                          discount. Returned quantities are added back
                          to stock.
                        </p>

                        <div className="pos-refund-actions">
                          <button
                            type="button"
                            className="pos-operation-button"
                            disabled={isBusy}
                            onClick={() => {
                              if (refundRequestIdRef.current) {
                                setModalError(
                                  "Retry the current refund before going back."
                                );
                                return;
                              }

                              setSelectedRefundSale(null);
                              setModalError("");
                            }}
                          >
                            Back
                          </button>

                          <button
                            type="submit"
                            className="pos-operation-button primary"
                            disabled={isBusy}
                          >
                            {busyAction === "refund"
                              ? "Saving..."
                              : "Confirm refund"}
                          </button>
                        </div>
                      </form>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {saleComplete && (
          <div className="pos-modal-overlay">
            <div
              className="pos-success-card"
              role="dialog"
              aria-modal="true"
              aria-labelledby="pos-success-title"
            >
              <FaCheckCircle className="pos-success-icon" />
              <h2 id="pos-success-title">Sale Completed!</h2>
              <p>Your transaction was completed successfully.</p>

              {lastSale && (
                <>
                  <p>Sale ID: {lastSale.id}</p>
                  <p>Total: ${money(lastSale.total)}</p>
                  <p>Change: ${money(lastSale.change)}</p>
                </>
              )}

              {saleNotice && (
                <p className="pos-feedback" role="alert">
                  {saleNotice}
                </p>
              )}

              <button
                type="button"
                className="pos-success-button"
                onClick={() => setSaleComplete(false)}
                disabled={isBusy}
              >
                Continue
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default POS;