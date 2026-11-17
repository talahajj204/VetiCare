import { useMemo, useRef, useState } from "react";
import { FaPlus, FaTimes, FaTrash } from "react-icons/fa";
import { createSupplierInvoice } from "../api/supplierInvoicesApi";
import { getProducts } from "../api/productsApi";

function emptyLine() {
  return {
    id: crypto.randomUUID(),
    mode: "existing",
    categoryId: "",
    productId: "",
    productSearch: "",
    name: "",
    quantity: "",
    purchasePrice: "",
    taxable: false,
  };
}

function localDate() {
  const date = new Date();

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

const roundMoney = (value) =>
  Math.round((value + Number.EPSILON) * 100) / 100;

function hasTwoDecimals(value) {
  return (
    Math.abs(value * 100 - Math.round(value * 100)) < 0.000001
  );
}

export default function SupplierStockInvoice({
  products = [],
  categories = [],
  onClose,
  onSaved,
}) {
  const [supplier, setSupplier] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [date, setDate] = useState(localDate);
  const [notes, setNotes] = useState("");
  const [taxRate, setTaxRate] = useState("0");
  const [lines, setLines] = useState(() => [emptyLine()]);
  const [isSaving, setIsSaving] = useState(false);
  const [savedInvoice, setSavedInvoice] = useState(null);
  const [error, setError] = useState("");

  const savingRef = useRef(false);
  const savedRef = useRef(false);

  const isLocked = isSaving || Boolean(savedInvoice);

  const updateLine = (id, changes) => {
    if (savingRef.current || savedRef.current) return;

    setLines((current) =>
      current.map((line) =>
        line.id === id ? { ...line, ...changes } : line
      )
    );
  };

  const changeMode = (id, mode) => {
    updateLine(id, {
      mode,
      productId: "",
      productSearch: "",
      name: "",
      purchasePrice: "",
    });
  };

  const changeCategory = (id, categoryId) => {
    updateLine(id, {
      categoryId,
      productId: "",
      productSearch: "",
      purchasePrice: "",
    });
  };

  const getLineProducts = (line) =>
    products.filter(
      (product) =>
        !line.categoryId ||
        String(product.categoryId) === String(line.categoryId)
    );

  const productLabel = (product) =>
    `${product.name} (#${product.id})`;

  const searchProduct = (line, value) => {
    const product = getLineProducts(line).find(
      (item) => productLabel(item) === value
    );

    updateLine(line.id, {
      productSearch: value,
      productId: product ? String(product.id) : "",
      purchasePrice: product
        ? String(Number(product.purchasePrice) || 0)
        : "",
    });
  };

  const totals = useMemo(() => {
    const rate = Number(taxRate) || 0;

    let subtotal = 0;
    let tax = 0;

    for (const line of lines) {
      const lineSubtotal = roundMoney(
        (Number(line.quantity) || 0) *
          (Number(line.purchasePrice) || 0)
      );

      subtotal += lineSubtotal;

      if (line.taxable) {
        tax += roundMoney((lineSubtotal * rate) / 100);
      }
    }

    return {
      subtotal: roundMoney(subtotal),
      tax: roundMoney(tax),
      total: roundMoney(subtotal + tax),
    };
  }, [lines, taxRate]);

  const closeModal = () => {
    if (!savingRef.current) {
      onClose();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (savingRef.current || savedRef.current) return;

    savingRef.current = true;
    setIsSaving(true);
    setError("");

    let invoiceWasSaved = false;

    try {
      const supplierName = supplier.trim();
      const number = invoiceNumber.trim();

      if (!supplierName || supplierName.length > 200) {
        throw new Error(
          "Enter a supplier name of 200 characters or fewer."
        );
      }

      if (!number || number.length > 100) {
        throw new Error(
          "Enter an invoice number of 100 characters or fewer."
        );
      }

      if (!date) {
        throw new Error("Please select the invoice date.");
      }

      if (notes.length > 4000) {
        throw new Error(
          "Notes must be 4000 characters or fewer."
        );
      }

      const rate = Number(taxRate);

      if (
        String(taxRate).trim() === "" ||
        !Number.isFinite(rate) ||
        rate < 0 ||
        rate > 100 ||
        !hasTwoDecimals(rate)
      ) {
        throw new Error(
          "TVA rate must be between 0 and 100, " +
            "with at most two decimal places."
        );
      }

      if (lines.length < 1 || lines.length > 200) {
        throw new Error(
          "An invoice must contain between 1 and 200 items."
        );
      }

      const newNames = new Set();

      const items = lines.map((line, index) => {
        const quantity = Number(line.quantity);
        const purchasePrice = Number(line.purchasePrice);
        const prefix = `Item ${index + 1}:`;

        if (
          String(line.quantity).trim() === "" ||
          !Number.isInteger(quantity) ||
          quantity < 1 ||
          quantity > 2147483647
        ) {
          throw new Error(
            `${prefix} enter a valid positive whole quantity.`
          );
        }

        if (
          String(line.purchasePrice).trim() === "" ||
          !Number.isFinite(purchasePrice) ||
          purchasePrice < 0 ||
          !hasTwoDecimals(purchasePrice)
        ) {
          throw new Error(
            `${prefix} enter a valid purchase price ` +
              "with at most two decimal places."
          );
        }

        const item = {
          productId: null,
          categoryId: null,
          productName: "",
          quantity,
          purchasePrice,
          isTaxable: Boolean(line.taxable),
        };

        if (line.mode === "existing") {
          const product = products.find(
            (record) =>
              String(record.id) === String(line.productId)
          );

          if (!product) {
            throw new Error(
              `${prefix} select an existing product.`
            );
          }

          item.productId = product.id;
        } else {
          const category = categories.find(
            (record) =>
              String(record.id) === String(line.categoryId)
          );

          if (!category) {
            throw new Error(
              `${prefix} select a valid category.`
            );
          }

          const name = line.name.trim();

          if (!name || name.length > 200) {
            throw new Error(
              `${prefix} enter a product name of ` +
                "200 characters or fewer."
            );
          }

          const nameKey = name.toLowerCase();

          const alreadyExists = products.some(
            (product) =>
              product.name.trim().toLowerCase() === nameKey
          );

          if (alreadyExists || newNames.has(nameKey)) {
            throw new Error(
              `${prefix} "${name}" already exists or is ` +
                "repeated on this invoice."
            );
          }

          newNames.add(nameKey);

          item.categoryId = category.id;
          item.productName = name;
        }

        return item;
      });

      const invoice = await createSupplierInvoice({
        supplierName,
        invoiceNumber: number,
        date,
        notes: notes.trim(),
        taxRate: rate,
        items,
      });

      invoiceWasSaved = true;
      savedRef.current = true;
      setSavedInvoice(invoice);

      window.dispatchEvent(
        new Event("vetClinicSupplierInvoicesUpdated")
      );

      // Read the actual stock quantities after the database save.
      const updatedProducts = await getProducts();

      await onSaved(updatedProducts);
    } catch (saveError) {
      if (invoiceWasSaved) {
        setError(
          "The invoice was saved successfully, but refreshing " +
            "the product list failed. Close this window and " +
            "refresh the page. Do not add the invoice again."
        );
      } else {
        setError(
          saveError.message || "Could not save invoice."
        );
      }
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };  return (
    <div
      className="stock-invoice-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          closeModal();
        }
      }}
    >
      <style>{`
        .stock-invoice-overlay {
          position: fixed;
          inset: 0;
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: rgba(16, 24, 40, .48);
          backdrop-filter: blur(2px);
        }

        .stock-invoice-overlay * {
          box-sizing: border-box;
        }

        .stock-invoice-modal {
          width: min(1180px, 96vw);
          max-height: 92dvh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border-radius: 15px;
          background: #ffffff;
          color: #344054;
          box-shadow: 0 22px 55px rgba(16, 24, 40, .25);
        }

        .stock-invoice-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          padding: 22px 26px;
          background: #55b8b4;
        }

        .stock-invoice-header h2 {
          margin: 0;
          color: #ffffff;
          font-size: 23px;
          font-weight: 700;
        }

        .stock-invoice-header p {
          margin: 6px 0 0;
          color: rgba(255, 255, 255, .95);
          font-size: 13px;
          line-height: 1.6;
        }

        .stock-invoice-header .stock-invoice-close {
          position: static;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 34px;
          width: 34px;
          min-width: 34px;
          height: 34px;
          margin: 0;
          padding: 0;
          border: 0;
          border-radius: 50%;
          background: #ffffff;
          color: #52706e;
          cursor: pointer;
        }

        .stock-invoice-form {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: 0;
          overflow: hidden;
        }

        .stock-invoice-body {
          padding: 24px 26px;
          overflow-y: auto;
          min-height: 0;
        }

        .stock-invoice-fields {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px 22px;
        }

        .stock-invoice-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 0;
        }

        .stock-invoice-field-wide {
          grid-column: 1 / -1;
        }

        .stock-invoice-field > label {
          margin: 0;
          color: #344054;
          font-size: 13px;
          font-weight: 700;
        }

        .stock-invoice-modal input:not([type="checkbox"]),
        .stock-invoice-modal select,
        .stock-invoice-modal textarea {
          width: 100%;
          min-width: 0;
          height: 42px;
          margin: 0;
          padding: 10px 12px;
          border: 1px solid #dce7e6;
          border-radius: 8px;
          outline: none;
          background: #ffffff;
          color: #344054;
          font-family: inherit;
          font-size: 13px;
        }

        .stock-invoice-modal textarea {
          height: 65px;
          resize: vertical;
          line-height: 1.5;
        }

        .stock-invoice-modal input:focus,
        .stock-invoice-modal select:focus,
        .stock-invoice-modal textarea:focus {
          border-color: #159f9f;
          box-shadow: 0 0 0 2px rgba(21, 159, 159, .08);
        }

        .stock-invoice-items-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin: 25px 0 12px;
        }

        .stock-invoice-items-heading h3 {
          margin: 0;
          color: #344054;
          font-size: 15px;
        }

        .stock-invoice-items-heading span {
          color: #667085;
          font-size: 12px;
        }

        .stock-invoice-table-scroll {
          overflow-x: auto;
          border: 1px solid #e4eceb;
          border-radius: 9px;
        }

        .stock-invoice-table {
          width: 100%;
          min-width: 990px;
          border-collapse: collapse;
          table-layout: fixed;
        }

        .stock-invoice-table th {
          padding: 12px 9px;
          background: #55b8b4;
          color: #ffffff;
          text-align: left;
          font-size: 12px;
          font-weight: 700;
        }

        .stock-invoice-table td {
          padding: 12px 9px;
          border-bottom: 1px solid #eef3f2;
          vertical-align: middle;
        }

        .stock-invoice-table tbody tr:last-child td {
          border-bottom: 0;
        }

        .stock-invoice-table th:nth-child(1) {
          width: 140px;
        }

        .stock-invoice-table th:nth-child(2) {
          width: 165px;
        }

        .stock-invoice-table th:nth-child(3) {
          width: auto;
        }

        .stock-invoice-table th:nth-child(4) {
          width: 85px;
        }

        .stock-invoice-table th:nth-child(5) {
          width: 115px;
        }

        .stock-invoice-table th:nth-child(6) {
          width: 90px;
        }

        .stock-invoice-table th:nth-child(7) {
          width: 55px;
          text-align: center;
        }

        .stock-invoice-table th:nth-child(8) {
          width: 45px;
        }

        .stock-invoice-line-total {
          font-size: 13px;
          font-weight: 700;
          white-space: nowrap;
        }

        .stock-invoice-tax-cell {
          text-align: center;
        }

        .stock-invoice-tax-cell input {
          width: 17px;
          height: 17px;
          margin: 0;
          accent-color: #159f9f;
          cursor: pointer;
        }

        .stock-invoice-table .stock-invoice-remove {
          position: static;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          min-width: 28px;
          height: 32px;
          margin: 0;
          padding: 0;
          border: 0;
          border-radius: 6px;
          background: #fff5f4;
          color: #d92d20;
          cursor: pointer;
        }

        .stock-invoice-modal .stock-invoice-add-line {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          height: 40px;
          margin: 12px 0 0;
          padding: 0 15px;
          border: 1px solid #bfe2df;
          border-radius: 8px;
          background: #f2fbfa;
          color: #159f9f;
          font-family: inherit;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .stock-invoice-error {
          margin: 16px 0 0;
          padding: 11px 13px;
          border: 1px solid #f3cbc8;
          border-radius: 8px;
          background: #fff5f4;
          color: #b42318;
          font-size: 13px;
          line-height: 1.6;
        }

        .stock-invoice-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 22px;
          padding: 19px 26px;
          border-top: 1px solid #e4eceb;
          background: #fafcfc;
        }

        .stock-invoice-totals {
          display: flex;
          flex-wrap: wrap;
          gap: 25px;
        }

        .stock-invoice-totals span {
          display: block;
          margin-bottom: 6px;
          color: #667085;
          font-size: 11px;
        }

        .stock-invoice-totals strong {
          display: block;
          color: #344054;
          font-size: 17px;
        }

        .stock-invoice-totals > div:last-child strong {
          color: #159f9f;
        }

        .stock-invoice-buttons {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .stock-invoice-buttons button {
          width: auto;
          min-width: 105px;
          height: 42px;
          margin: 0;
          padding: 0 17px;
          border: 1px solid #d0d5dd;
          border-radius: 7px;
          background: #ffffff;
          color: #475467;
          font-family: inherit;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .stock-invoice-buttons .stock-invoice-save {
          border-color: #159f9f;
          background: #159f9f;
          color: #ffffff;
        }

        .stock-invoice-modal button:disabled {
          opacity: .55;
          cursor: not-allowed;
        }

        @media (max-width: 700px) {
          .stock-invoice-overlay {
            padding: 10px;
          }

          .stock-invoice-modal {
            width: 100%;
            max-height: 95dvh;
          }

          .stock-invoice-header {
            padding: 18px;
          }

          .stock-invoice-header h2 {
            font-size: 20px;
          }

          .stock-invoice-body {
            padding: 18px;
          }

          .stock-invoice-fields {
            grid-template-columns: 1fr;
            gap: 15px;
          }

          .stock-invoice-footer {
            padding: 17px 18px;
          }

          .stock-invoice-totals {
            gap: 18px;
          }

          .stock-invoice-buttons {
            width: 100%;
            justify-content: flex-end;
          }
        }
      `}</style>

      <div
        className="stock-invoice-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="stock-invoice-title"
      >
        <div className="stock-invoice-header">
          <div>
            <h2 id="stock-invoice-title">
              Supplier Stock Invoice
            </h2>

            <p>
              Restock existing products or add new products
              on the same invoice.
            </p>
          </div>

          <button
            type="button"
            className="stock-invoice-close"
            onClick={closeModal}
            disabled={isSaving}
            aria-label="Close invoice"
          >
            <FaTimes />
          </button>
        </div>

        <form
          className="stock-invoice-form"
          onSubmit={handleSubmit}
          aria-busy={isSaving}
        >
          <div className="stock-invoice-body">
            <div className="stock-invoice-fields">
              <div className="stock-invoice-field">
                <label htmlFor="stock-invoice-supplier">
                  Supplier
                </label>

                <input
                  id="stock-invoice-supplier"
                  type="text"
                  placeholder="Enter supplier name"
                  value={supplier}
                  maxLength={200}
                  onChange={(event) =>
                    setSupplier(event.target.value)
                  }
                  disabled={isLocked}
                  required
                />
              </div>

              <div className="stock-invoice-field">
                <label htmlFor="stock-invoice-number">
                  Invoice Number
                </label>

                <input
                  id="stock-invoice-number"
                  type="text"
                  placeholder="Supplier invoice #"
                  value={invoiceNumber}
                  maxLength={100}
                  onChange={(event) =>
                    setInvoiceNumber(event.target.value)
                  }
                  disabled={isLocked}
                  required
                />
              </div>

              <div className="stock-invoice-field">
                <label htmlFor="stock-invoice-date">
                  Date
                </label>

                <input
                  id="stock-invoice-date"
                  type="date"
                  value={date}
                  onChange={(event) =>
                    setDate(event.target.value)
                  }
                  disabled={isLocked}
                  required
                />
              </div>

              <div className="stock-invoice-field">
                <label htmlFor="stock-invoice-tax-rate">
                  TVA Rate (%)
                </label>

                <input
                  id="stock-invoice-tax-rate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={taxRate}
                  onChange={(event) =>
                    setTaxRate(event.target.value)
                  }
                  disabled={isLocked}
                  required
                />
              </div>

              <div className="stock-invoice-field stock-invoice-field-wide">
                <label htmlFor="stock-invoice-notes">
                  Notes
                </label>

                <textarea
                  id="stock-invoice-notes"
                  placeholder="Delivery note, batch, or other reference"
                  value={notes}
                  maxLength={4000}
                  onChange={(event) =>
                    setNotes(event.target.value)
                  }
                  disabled={isLocked}
                />
              </div>
            </div>

            <div className="stock-invoice-items-heading">
              <h3>Items</h3>
              <span>Number of items: {lines.length}</span>
            </div>

            <div className="stock-invoice-table-scroll">
              <table className="stock-invoice-table">
                <thead>
                  <tr>
                    <th>Product Type</th>
                    <th>Category</th>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Purchase Price</th>
                    <th>Total</th>
                    <th>TVA</th>
                    <th aria-label="Remove item" />
                  </tr>
                </thead>

                <tbody>
                  {lines.map((line, index) => {
                    const lineProducts = getLineProducts(line);

                    const lineTotal =
                      (Number(line.quantity) || 0) *
                      (Number(line.purchasePrice) || 0);

                    return (
                      <tr key={line.id}>
                        <td>
                          <select
                            value={line.mode}
                            onChange={(event) =>
                              changeMode(
                                line.id,
                                event.target.value
                              )
                            }
                            disabled={isLocked}
                            aria-label={`Item ${index + 1} type`}
                          >
                            <option value="existing">
                              Existing Product
                            </option>

                            <option value="new">
                              New Product
                            </option>
                          </select>
                        </td>

                        <td>
                          <select
                            value={line.categoryId}
                            onChange={(event) =>
                              changeCategory(
                                line.id,
                                event.target.value
                              )
                            }
                            disabled={isLocked}
                            required={line.mode === "new"}
                            aria-label={`Item ${index + 1} category`}
                          >
                            <option value="">
                              {line.mode === "new"
                                ? "Select category"
                                : "All categories"}
                            </option>

                            {categories.map((category) => (
                              <option
                                key={category.id}
                                value={String(category.id)}
                              >
                                {category.title}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td>
                          {line.mode === "existing" ? (
                            <>
                              <input
                                type="text"
                                list={`stock-products-${line.id}`}
                                placeholder="Search and select product..."
                                value={line.productSearch}
                                onChange={(event) =>
                                  searchProduct(
                                    line,
                                    event.target.value
                                  )
                                }
                                disabled={isLocked}
                                aria-label={`Item ${index + 1} product`}
                                autoComplete="off"
                                required
                              />

                              <datalist
                                id={`stock-products-${line.id}`}
                              >
                                {lineProducts.map((product) => (
                                  <option
                                    key={product.id}
                                    value={productLabel(product)}
                                  />
                                ))}
                              </datalist>
                            </>
                          ) : (
                            <input
                              type="text"
                              placeholder="Enter new product name"
                              value={line.name}
                              maxLength={200}
                              onChange={(event) =>
                                updateLine(line.id, {
                                  name: event.target.value,
                                })
                              }
                              disabled={isLocked}
                              aria-label={`Item ${index + 1} name`}
                              required
                            />
                          )}
                        </td>

                        <td>
                          <input
                            type="number"
                            min="1"
                            max="2147483647"
                            step="1"
                            placeholder="0"
                            value={line.quantity}
                            onChange={(event) =>
                              updateLine(line.id, {
                                quantity: event.target.value,
                              })
                            }
                            disabled={isLocked}
                            aria-label={`Item ${index + 1} quantity`}
                            required
                          />
                        </td>

                        <td>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            value={line.purchasePrice}
                            onChange={(event) =>
                              updateLine(line.id, {
                                purchasePrice: event.target.value,
                              })
                            }
                            disabled={isLocked}
                            aria-label={`Item ${index + 1} purchase price`}
                            required
                          />
                        </td>

                        <td className="stock-invoice-line-total">
                          ${roundMoney(lineTotal).toFixed(2)}
                        </td>

                        <td className="stock-invoice-tax-cell">
                          <input
                            type="checkbox"
                            checked={line.taxable}
                            onChange={(event) =>
                              updateLine(line.id, {
                                taxable: event.target.checked,
                              })
                            }
                            disabled={isLocked}
                            aria-label={`Apply TVA to item ${index + 1}`}
                          />
                        </td>

                        <td>
                          <button
                            type="button"
                            className="stock-invoice-remove"
                            disabled={
                              isLocked || lines.length === 1
                            }
                            onClick={() => {
                              if (
                                savingRef.current ||
                                savedRef.current
                              ) {
                                return;
                              }

                              setLines((current) =>
                                current.filter(
                                  (item) => item.id !== line.id
                                )
                              );
                            }}
                            aria-label={`Remove item ${index + 1}`}
                            title="Remove item"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              className="stock-invoice-add-line"
              disabled={isLocked || lines.length >= 200}
              onClick={() => {
                if (
                  savingRef.current ||
                  savedRef.current
                ) {
                  return;
                }

                setLines((current) => [
                  ...current,
                  emptyLine(),
                ]);
              }}
            >
              <FaPlus />
              Add Item
            </button>

            {error && (
              <p className="stock-invoice-error" role="alert">
                {error}
              </p>
            )}
          </div>

          <div className="stock-invoice-footer">
            <div className="stock-invoice-totals">
              <div>
                <span>Total before TVA</span>
                <strong>
                  $
                  {Number(
                    savedInvoice?.subtotal ?? totals.subtotal
                  ).toFixed(2)}
                </strong>
              </div>

              <div>
                <span>Total TVA</span>
                <strong>
                  $
                  {Number(
                    savedInvoice?.taxTotal ?? totals.tax
                  ).toFixed(2)}
                </strong>
              </div>

              <div>
                <span>Total after TVA</span>
                <strong>
                  $
                  {Number(
                    savedInvoice?.total ?? totals.total
                  ).toFixed(2)}
                </strong>
              </div>
            </div>

            <div className="stock-invoice-buttons">
              <button
                type="button"
                onClick={closeModal}
                disabled={isSaving}
              >
                {savedInvoice ? "Close" : "Cancel"}
              </button>

              <button
                type="submit"
                className="stock-invoice-save"
                disabled={isLocked}
              >
                {isSaving
                  ? "Saving..."
                  : savedInvoice
                    ? "Saved"
                    : "Add Invoice"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}