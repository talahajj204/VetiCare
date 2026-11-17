import { useEffect, useMemo, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";

import {
  FaEye,
  FaPen,
  FaTrash,
  FaSearch,
  FaTimes,
  FaImage,
  FaFileExcel,
  FaGripVertical,
} from "react-icons/fa";

import * as XLSX from "xlsx";

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} from "../api/categoriesApi";

function sortCategories(records) {
  return [...records].sort(
    (a, b) =>
      Number(a.sortOrder) - Number(b.sortOrder) ||
      String(a.title || "").localeCompare(
        String(b.title || "")
      ) ||
      a.id - b.id
  );
}

function emptyCategory(sortOrder = "") {
  return {
    title: "",
    image: "",
    description: "",
    sortOrder,
  };
}

function buildPayload(data) {
  const title = String(data.title || "").trim();
  const description = String(data.description || "").trim();
  const rawOrder = String(data.sortOrder ?? "").trim();
  const sortOrder = Number(rawOrder);

  if (!title) {
    throw new Error("Please enter a category title.");
  }

  if (title.length > 200) {
    throw new Error(
      "Category title must not exceed 200 characters."
    );
  }

  if (description.length > 4000) {
    throw new Error(
      "Description must not exceed 4000 characters."
    );
  }

  if (
    !rawOrder ||
    !Number.isInteger(sortOrder) ||
    sortOrder < 0 ||
    sortOrder > 2147483647
  ) {
    throw new Error(
      "Sort order must be a non-negative whole number."
    );
  }

  return {
    title,
    image: String(data.image || ""),
    description,
    sortOrder,
  };
}

function Categories() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");

  const [modal, setModal] = useState(null);
  const [selectedCategory, setSelectedCategory] =
    useState(null);

  const [newCategory, setNewCategory] =
    useState(emptyCategory);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [draggedId, setDraggedId] = useState(null);

  const savingRef = useRef(false);
  const categoriesRef = useRef([]);
  const dragRef = useRef(null);
  const tableRef = useRef(null);
  const mountedRef = useRef(false);

  const setRecords = (records) => {
    categoriesRef.current = records;
    setCategories(records);
  };

  const publishCategories = (records) => {
    const ordered = sortCategories(records);
    setRecords(ordered);

    window.dispatchEvent(
      new CustomEvent("vetClinicCategoriesUpdated", {
        detail: ordered,
      })
    );
  };

  useEffect(() => {
    mountedRef.current = true;
    const controller = new AbortController();

    const load = async () => {
      try {
        const records = await getCategories({
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;

        publishCategories(records);
        setError("");
      } catch (exception) {
        if (!controller.signal.aborted) {
          setError(
            exception.message || "Could not load categories."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      mountedRef.current = false;
      controller.abort();
    };
  }, []);

  const filteredCategories = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return categories;

    return categories.filter(
      (category) =>
        String(category.title || "")
          .toLowerCase()
          .includes(value) ||
        String(category.description || "")
          .toLowerCase()
          .includes(value) ||
        String(category.sortOrder).includes(value)
    );
  }, [categories, search]);

  const locked =
    isLoading ||
    isSaving ||
    isReordering ||
    draggedId !== null;

  const canReorder =
    !locked &&
    !modal &&
    !search.trim() &&
    categories.length > 1;

  const closeModal = () => {
    if (savingRef.current) return;

    setModal(null);
    setSelectedCategory(null);
  };

  const openAdd = () => {
    if (savingRef.current || locked) return;

    const lastOrder = Math.max(
      0,
      ...categoriesRef.current.map(
        (category) => Number(category.sortOrder) || 0
      )
    );

    setNewCategory(
      emptyCategory(
        Math.min(lastOrder + 1, 2147483647)
      )
    );

    setError("");
    setNotice("");
    setModal("add");
  };

  const openCategory = (category, type) => {
    if (savingRef.current || locked) return;

    setSelectedCategory({ ...category });
    setError("");
    setNotice("");
    setModal(type);
  };

  const handleFormChange = (event, editing) => {
    if (savingRef.current) return;

    const { name, value } = event.target;

    const setter = editing
      ? setSelectedCategory
      : setNewCategory;

    setter((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleImageChange = (event, editing) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || savingRef.current) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image.");
      return;
    }

    const categoryId = selectedCategory?.id;
    const reader = new FileReader();

    reader.onload = () => {
      if (
        !mountedRef.current ||
        savingRef.current ||
        typeof reader.result !== "string"
      ) {
        return;
      }

      const image = reader.result;

      if (editing) {
        setSelectedCategory((previous) =>
          previous?.id === categoryId
            ? { ...previous, image }
            : previous
        );
      } else {
        setNewCategory((previous) => ({
          ...previous,
          image,
        }));
      }
    };

    reader.onerror = () => {
      if (mountedRef.current) {
        setError("Could not read this image.");
      }
    };

    reader.readAsDataURL(file);
  };

  const removeImage = (editing) => {
    if (savingRef.current) return;

    const setter = editing
      ? setSelectedCategory
      : setNewCategory;

    setter((previous) => ({
      ...previous,
      image: "",
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (savingRef.current || isLoading) return;

    savingRef.current = true;
    setIsSaving(true);
    setError("");
    setNotice("");

    const editing = modal === "edit";

    try {
      const data = editing
        ? selectedCategory
        : newCategory;

      const payload = buildPayload(data);

      const saved = editing
        ? await updateCategory(data.id, payload)
        : await createCategory(payload);

      if (!mountedRef.current) return;

      const records = editing
        ? categoriesRef.current.map((category) =>
            category.id === saved.id ? saved : category
          )
        : [...categoriesRef.current, saved];

      publishCategories(records);
      setModal(null);
      setSelectedCategory(null);
      setNewCategory(emptyCategory());
      setNotice(
        editing ? "Category updated." : "Category added."
      );
    } catch (exception) {
      if (mountedRef.current) {
        setError(
          exception.message || "Could not save category."
        );
      }
    } finally {
      savingRef.current = false;

      if (mountedRef.current) {
        setIsSaving(false);
      }
    }
  };

  const confirmDelete = async () => {
    if (!selectedCategory || savingRef.current) return;

    savingRef.current = true;
    setIsSaving(true);
    setError("");
    setNotice("");

    try {
      const id = selectedCategory.id;

      await deleteCategory(id);

      if (!mountedRef.current) return;

      publishCategories(
        categoriesRef.current.filter(
          (category) => category.id !== id
        )
      );

      setModal(null);
      setSelectedCategory(null);
      setNotice("Category deleted.");
    } catch (exception) {
      if (mountedRef.current) {
        setError(
          exception.message || "Could not delete category."
        );
      }
    } finally {
      savingRef.current = false;

      if (mountedRef.current) {
        setIsSaving(false);
      }
    }
  };

  const saveOrder = async (previous, reordered) => {
    const changed = previous.some(
      (category, index) =>
        category.id !== reordered[index]?.id
    );

    if (!changed) {
      setRecords(previous);
      return;
    }

    savingRef.current = true;
    setIsReordering(true);
    setError("");
    setNotice("");

    setRecords(
      reordered.map((category, index) => ({
        ...category,
        sortOrder: index + 1,
      }))
    );

    try {
      const saved = await reorderCategories(
        reordered.map((category) => category.id)
      );

      if (!mountedRef.current) return;

      publishCategories(saved);
      setNotice("Category order saved.");
    } catch (exception) {
      if (!mountedRef.current) return;

      // Restore the last confirmed order first.
      setRecords(previous);

      let message =
        exception.message || "Could not save category order.";

      // The request may have reached the server even if
      // its response was lost. Reload the actual order.
      try {
        const actual = await getCategories();

        if (mountedRef.current) {
          publishCategories(actual);
        }
      } catch {
        message +=
          " Refresh the page to verify the saved order.";
      }

      if (mountedRef.current) {
        setError(message);
      }
    } finally {
      savingRef.current = false;

      if (mountedRef.current) {
        setIsReordering(false);
      }
    }
  };

  const startDrag = (event, categoryId) => {
    if (
      !canReorder ||
      savingRef.current ||
      dragRef.current ||
      !event.isPrimary ||
      event.button !== 0
    ) {
      return;
    }

    event.preventDefault();

    dragRef.current = {
      pointerId: event.pointerId,
      categoryId,
      previous: [...categoriesRef.current],
    };

    setDraggedId(categoryId);
    setError("");
    setNotice("");

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveDrag = (event) => {
    const drag = dragRef.current;

    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();

    const row = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest("tr[data-category-id]");

    if (row && tableRef.current?.contains(row)) {
      const targetId = Number(row.dataset.categoryId);
      const records = categoriesRef.current;

      const from = records.findIndex(
        (category) => category.id === drag.categoryId
      );

      const to = records.findIndex(
        (category) => category.id === targetId
      );

      if (from >= 0 && to >= 0 && from !== to) {
        const next = [...records];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);

        setRecords(next);
      }
    }

    if (event.clientY < 90) {
      window.scrollBy(0, -18);
    } else if (event.clientY > window.innerHeight - 90) {
      window.scrollBy(0, 18);
    }
  };

  const finishDrag = (event, cancelled = false) => {
    const drag = dragRef.current;

    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    const reordered = [...categoriesRef.current];

    dragRef.current = null;
    setDraggedId(null);

    if (
      event.currentTarget.hasPointerCapture(event.pointerId)
    ) {
      event.currentTarget.releasePointerCapture(
        event.pointerId
      );
    }

    if (cancelled) {
      setRecords(drag.previous);
      return;
    }

    void saveOrder(drag.previous, reordered);
  };

  const handleReorderKey = (event, categoryId) => {
    if (
      !canReorder ||
      savingRef.current ||
      !["ArrowUp", "ArrowDown"].includes(event.key)
    ) {
      return;
    }

    event.preventDefault();

    const previous = [...categoriesRef.current];
    const from = previous.findIndex(
      (category) => category.id === categoryId
    );

    const to =
      from + (event.key === "ArrowUp" ? -1 : 1);

    if (from < 0 || to < 0 || to >= previous.length) {
      return;
    }

    const next = [...previous];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);

    void saveOrder(previous, next);
  };

  const handleExport = () => {
    const exportData = categories.map((category) => ({
      "Category Title": category.title,
      Description: category.description,
      "Sort Order": category.sortOrder,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Categories"
    );

    XLSX.writeFile(
      workbook,
      "vet-clinic-categories.xlsx"
    );
  };

  const renderCategoryForm = (data, editing) => (
    <>
      <div className="category-form-group">
        <label>Category Title</label>

        <input
          type="text"
          name="title"
          placeholder="Enter category title"
          value={data.title || ""}
          onChange={(event) =>
            handleFormChange(event, editing)
          }
          maxLength={200}
          disabled={isSaving}
          required
        />
      </div>

      <div className="category-form-group">
        <label>Category Image</label>

        {data.image ? (
          <div className="category-image-preview-box">
            <img
              src={data.image}
              alt={data.title || "Category"}
              className="category-image-preview"
            />

            <div className="category-image-preview-actions">
              <label className="category-change-image-button">
                <FaImage />
                Change Image

                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    handleImageChange(event, editing)
                  }
                  disabled={isSaving}
                />
              </label>

              <button
                type="button"
                className="category-remove-image-button"
                onClick={() => removeImage(editing)}
                disabled={isSaving}
              >
                <FaTrash />
                Remove
              </button>
            </div>
          </div>
        ) : (
          <label className="category-image-upload">
            <FaImage className="category-upload-icon" />
            <span>Upload Category Image</span>

            <input
              type="file"
              accept="image/*"
              onChange={(event) =>
                handleImageChange(event, editing)
              }
              disabled={isSaving}
            />
          </label>
        )}
      </div>

      <div className="category-form-group">
        <label>Description</label>

        <textarea
          name="description"
          placeholder="Enter category description"
          value={data.description || ""}
          onChange={(event) =>
            handleFormChange(event, editing)
          }
          rows={4}
          maxLength={4000}
          disabled={isSaving}
        />
      </div>

      <div className="category-form-group">
        <label>Sort Order</label>

        <input
          type="number"
          name="sortOrder"
          min={0}
          max={2147483647}
          step={1}
          value={data.sortOrder ?? ""}
          onChange={(event) =>
            handleFormChange(event, editing)
          }
          disabled={isSaving}
          required
        />

        <small>
          Drag categories in the table to update their
          order automatically.
        </small>
      </div>
    </>
  );

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main categories-page">
        <div className="categories-page-header">
          <div className="categories-title">
            <h1>Categories</h1>
            <p>
              Manage product categories displayed in your store.
            </p>
          </div>

          <div className="categories-header-actions">
            <button
              type="button"
              className="categories-export-button"
              onClick={handleExport}
              disabled={locked}
            >
              <FaFileExcel />
              Export
            </button>

            <button
              type="button"
              className="category-add-button"
              disabled={locked}
              onClick={openAdd}
            >
              + Add Category
            </button>
          </div>
        </div>

        {!modal && error && (
          <div className="categories-error" role="alert">
            {error}
          </div>
        )}

        <div
          className="categories-order-status"
          role="status"
          aria-live="polite"
        >
          {isReordering
            ? "Saving category order..."
            : draggedId !== null
              ? "Move the category, then release to save."
              : notice ||
                (search.trim()
                  ? "Clear search to reorder categories."
                  : "Drag the grip beside a category to reorder. You can also focus it and use ↑ / ↓.")}
        </div>

        <div className="categories-search-row">
          <div className="categories-search-box">
            <FaSearch className="categories-search-icon" />

            <input
              type="search"
              aria-label="Search categories"
              placeholder="Search categories..."
              value={search}
              disabled={locked}
              onChange={(event) => {
                setSearch(event.target.value);
                setNotice("");
              }}
            />

            {search && (
              <button
                type="button"
                className="categories-clear-search"
                onClick={() => setSearch("")}
                title="Clear search"
                aria-label="Clear search"
                disabled={locked}
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>

        <div
          className="categories-table-container"
          aria-busy={isLoading || isReordering}
        >
          <div className="categories-table-scroll">
            <table
              className="categories-table"
              ref={tableRef}
            >
              <thead>
                <tr>
                  <th className="category-drag-column">
                    <span className="category-sr-only">
                      Reorder
                    </span>
                  </th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Sort Order</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="category-empty-state"
                    >
                      Loading categories...
                    </td>
                  </tr>
                ) : filteredCategories.length ? (
                  filteredCategories.map((category, index) => {
                    const dragging = draggedId === category.id;

                    return (
                      <tr
                        key={category.id}
                        data-category-id={category.id}
                        className={
                          dragging
                            ? "category-row-dragging"
                            : ""
                        }
                      >
                        <td className="category-drag-column">
                          <button
                            type="button"
                            className="category-drag-handle"
                            aria-label={`Reorder ${category.title}. Use up and down arrow keys to move.`}
                            title="Drag to reorder"
                            disabled={
                              isLoading ||
                              isSaving ||
                              isReordering ||
                              Boolean(search.trim()) ||
                              categories.length < 2
                            }
                            onPointerDown={(event) =>
                              startDrag(event, category.id)
                            }
                            onPointerMove={moveDrag}
                            onPointerUp={(event) =>
                              finishDrag(event)
                            }
                            onPointerCancel={(event) =>
                              finishDrag(event, true)
                            }
                            onLostPointerCapture={(event) =>
                              finishDrag(event, true)
                            }
                            onKeyDown={(event) =>
                              handleReorderKey(
                                event,
                                category.id
                              )
                            }
                            onDragStart={(event) =>
                              event.preventDefault()
                            }
                            onContextMenu={(event) =>
                              event.preventDefault()
                            }
                          >
                            <FaGripVertical />
                          </button>
                        </td>

                        <td>
                          <div className="category-title-cell">
                            {category.image ? (
                              <img
                                src={category.image}
                                alt={category.title}
                                className="category-table-image"
                                draggable={false}
                              />
                            ) : (
                              <div className="category-table-placeholder">
                                <FaImage />
                              </div>
                            )}

                            <strong>{category.title}</strong>
                          </div>
                        </td>

                        <td>
                          <div className="category-description-cell">
                            {category.description || "—"}
                          </div>
                        </td>

                        <td>
                          <span className="category-sort-order">
                            {draggedId !== null
                              ? index + 1
                              : category.sortOrder}
                          </span>
                        </td>

                        <td>
                          <div className="category-action-buttons">
                            <button
                              type="button"
                              className="category-view-button"
                              title="View"
                              aria-label={`View ${category.title}`}
                              disabled={locked}
                              onClick={() =>
                                openCategory(category, "view")
                              }
                            >
                              <FaEye />
                            </button>

                            <button
                              type="button"
                              className="category-edit-button"
                              title="Edit"
                              aria-label={`Edit ${category.title}`}
                              disabled={locked}
                              onClick={() =>
                                openCategory(category, "edit")
                              }
                            >
                              <FaPen />
                            </button>

                            <button
                              type="button"
                              className="category-delete-button"
                              title="Delete"
                              aria-label={`Delete ${category.title}`}
                              disabled={locked}
                              onClick={() =>
                                openCategory(category, "delete")
                              }
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="category-empty-state"
                    >
                      {error && !categories.length
                        ? "Could not load categories. Refresh to try again."
                        : "No categories found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {(modal === "add" ||
          (modal === "edit" && selectedCategory)) && (
          <div
            className="category-modal-overlay"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                closeModal();
              }
            }}
          >
            <div
              className="category-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="category-form-title"
            >
              <div className="category-modal-header">
                <div className="category-modal-header-text">
                  <h2 id="category-form-title">
                    {modal === "add"
                      ? "Add Category"
                      : "Edit Category"}
                  </h2>

                  <p>
                    {modal === "add"
                      ? "Create a new product category for your store."
                      : "Update category information displayed in your store."}
                  </p>
                </div>

                <button
                  type="button"
                  className="category-modal-close"
                  disabled={isSaving}
                  onClick={closeModal}
                  aria-label="Close"
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleSave}>
                {error && (
                  <div
                    className="categories-error"
                    role="alert"
                  >
                    {error}
                  </div>
                )}

                {renderCategoryForm(
                  modal === "edit"
                    ? selectedCategory
                    : newCategory,
                  modal === "edit"
                )}

                <div className="category-form-actions">
                  <button
                    type="button"
                    className="category-cancel-button"
                    disabled={isSaving}
                    onClick={closeModal}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="category-save-button"
                    disabled={isSaving}
                  >
                    {isSaving
                      ? "Saving..."
                      : modal === "add"
                        ? "Add Category"
                        : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {modal === "view" && selectedCategory && (
          <div
            className="category-modal-overlay"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                closeModal();
              }
            }}
          >
            <div
              className="category-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="category-view-title"
            >
              <div className="category-modal-header">
                <div className="category-modal-header-text">
                  <h2 id="category-view-title">
                    View Category
                  </h2>
                  <p>
                    View category information and store details.
                  </p>
                </div>

                <button
                  type="button"
                  className="category-modal-close"
                  onClick={closeModal}
                  aria-label="Close"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="category-modal-body">
                <div className="category-view-image-wrapper">
                  {selectedCategory.image ? (
                    <img
                      src={selectedCategory.image}
                      alt={selectedCategory.title}
                      className="category-view-image"
                    />
                  ) : (
                    <div className="category-view-placeholder">
                      <FaImage />
                      <span>No Image</span>
                    </div>
                  )}
                </div>

                <div className="category-detail-row">
                  <span>Category Title</span>
                  <strong>{selectedCategory.title}</strong>
                </div>

                <div className="category-detail-row">
                  <span>Description</span>
                  <strong>
                    {selectedCategory.description || "—"}
                  </strong>
                </div>

                <div className="category-detail-row">
                  <span>Sort Order</span>
                  <strong>
                    {selectedCategory.sortOrder}
                  </strong>
                </div>

                <div className="category-form-actions">
                  <button
                    type="button"
                    className="category-cancel-button"
                    onClick={closeModal}
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    className="category-save-button"
                    onClick={() => setModal("edit")}
                  >
                    Edit Category
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {modal === "delete" && selectedCategory && (
          <div
            className="category-modal-overlay"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                closeModal();
              }
            }}
          >
            <div
              className="category-delete-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="category-delete-title"
            >
              <div className="category-delete-dialog-header">
                <h3 id="category-delete-title">
                  Delete Category
                </h3>

                <button
                  type="button"
                  className="category-delete-small-close"
                  onClick={closeModal}
                  disabled={isSaving}
                  aria-label="Close"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="category-delete-dialog-body">
                {error && (
                  <div
                    className="categories-error"
                    role="alert"
                  >
                    {error}
                  </div>
                )}

                <div className="category-delete-icon">
                  <FaTrash />
                </div>

                <p>
                  Are you sure you want to delete{" "}
                  <strong>{selectedCategory.title}</strong>?
                  <br />
                  This category will also disappear from
                  the store's Shop by Category section.
                </p>

                <div className="category-delete-actions">
                  <button
                    type="button"
                    className="category-delete-cancel"
                    onClick={closeModal}
                    disabled={isSaving}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="category-delete-confirm"
                    onClick={confirmDelete}
                    disabled={isSaving}
                  >
                    {isSaving
                      ? "Deleting..."
                      : "Delete Category"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <style>{`
          .categories-page {
            padding-bottom: 40px;
          }

          .categories-page button,
          .categories-page input,
          .categories-page textarea {
            box-sizing: border-box;
          }

          .categories-page button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .categories-page-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            margin-bottom: 24px;
          }

          .categories-title h1 {
            margin: 0;
            color: #1d2939;
            font-size: 28px;
            font-weight: 700;
          }

          .categories-title p {
            margin: 7px 0 0;
            color: #667085;
            font-size: 14px;
          }

          .categories-header-actions {
            display: flex;
            align-items: center;
            gap: 10px;
            flex-shrink: 0;
          }

          .categories-export-button,
          .category-add-button {
            width: auto;
            min-width: 0;
            height: 40px;
            padding: 0 16px;
            border-radius: 7px;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 7px;
            white-space: nowrap;
            transition: 0.2s ease;
          }

          .categories-export-button {
            border: 1px solid #159f9f;
            background: white;
            color: #168b8b;
          }

          .categories-export-button:hover:not(:disabled) {
            background: #f0fafa;
          }

          .category-add-button {
            border: 1px solid #159f9f;
            background: #159f9f;
            color: white;
          }

          .category-add-button:hover:not(:disabled) {
            background: #118b8b;
          }

          .categories-error {
            margin-bottom: 16px;
            padding: 12px 14px;
            border: 1px solid #fecdca;
            border-radius: 8px;
            background: #fef3f2;
            color: #b42318;
            font-size: 13px;
            line-height: 1.6;
            overflow-wrap: anywhere;
          }

          .categories-order-status {
            min-height: 22px;
            margin-bottom: 14px;
            color: #11797b;
            font-size: 12px;
            line-height: 1.6;
          }

          .categories-search-row {
            margin-bottom: 20px;
          }

          .categories-search-box {
            position: relative;
            width: min(420px, 100%);
          }

          .categories-search-icon {
            position: absolute;
            left: 14px;
            top: 50%;
            transform: translateY(-50%);
            color: #98a2b3;
            font-size: 17px;
          }

          .categories-search-box input {
            width: 100%;
            height: 43px;
            padding: 0 42px;
            border: 1px solid #dce7e6;
            border-radius: 8px;
            outline: none;
            background: white;
            color: #344054;
            box-sizing: border-box;
          }

          .categories-search-box input:focus {
            border-color: #159f9f;
          }

          .categories-clear-search {
            position: absolute;
            right: 11px;
            top: 50%;
            transform: translateY(-50%);
            width: 27px;
            height: 27px;
            padding: 0;
            border: none;
            background: transparent;
            color: #98a2b3;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          }

          .categories-table-container {
            background: white;
            border: 1px solid #e4eceb;
            border-radius: 10px;
            overflow: hidden;
          }

          .categories-table-scroll {
            width: 100%;
            overflow-x: auto;
          }

          .categories-table {
            width: 100%;
            min-width: 900px;
            border-collapse: collapse;
          }

          .categories-table th {
            padding: 14px 18px;
            text-align: left;
            background: #f8fbfb;
            color: #667085;
            font-size: 12px;
            font-weight: 700;
            border-bottom: 1px solid #e4eceb;
          }

          .categories-table td {
            padding: 15px 18px;
            color: #344054;
            font-size: 13px;
            border-bottom: 1px solid #eef3f2;
            vertical-align: middle;
          }

          .categories-table tbody tr:last-child td {
            border-bottom: none;
          }

          .categories-table tbody tr:hover {
            background: #fbfdfd;
          }

          .categories-table .category-drag-column {
            width: 54px;
            padding-left: 12px;
            padding-right: 4px;
          }

          .category-drag-handle {
            width: 36px;
            height: 42px;
            padding: 0;
            border: 1px solid transparent;
            border-radius: 7px;
            background: transparent;
            color: #98a2b3;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: grab;
            touch-action: none;
            user-select: none;
            -webkit-user-select: none;
            -webkit-touch-callout: none;
          }

          .category-drag-handle svg {
            pointer-events: none;
            font-size: 18px;
          }

          .category-drag-handle:hover:not(:disabled),
          .category-drag-handle:focus-visible {
            background: #e8f7f7;
            color: #159f9f;
            border-color: #a9dcd8;
          }

          .category-drag-handle:focus-visible {
            outline: 2px solid #159f9f;
            outline-offset: 2px;
          }

          .category-row-dragging,
          .categories-table tbody tr.category-row-dragging:hover {
            background: #e8f7f7;
          }

          .category-row-dragging .category-drag-handle {
            cursor: grabbing;
            color: #11797b;
          }

          .category-title-cell {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .category-table-image,
          .category-table-placeholder {
            width: 52px;
            height: 52px;
            min-width: 52px;
            border-radius: 9px;
            border: 1px solid #e1eae9;
          }

          .category-table-image {
            object-fit: cover;
          }

          .category-table-placeholder {
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f3f7f7;
            color: #98a2b3;
          }

          .category-table-placeholder svg {
            font-size: 23px;
          }

          .category-description-cell {
            max-width: 340px;
            white-space: normal;
            line-height: 1.5;
            color: #667085;
            overflow-wrap: anywhere;
          }

          .category-sort-order {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 38px;
            height: 31px;
            padding: 0 10px;
            border-radius: 20px;
            background: #edf8f7;
            color: #16856f;
            font-size: 14px;
            font-weight: 700;
          }

          .category-action-buttons {
            display: flex;
            align-items: center;
            gap: 9px;
          }

          .category-action-buttons button {
            width: 42px;
            height: 42px;
            padding: 0;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: 0.2s ease;
          }

          .category-action-buttons button svg {
            font-size: 18px;
          }

          .category-view-button {
            border: 1px solid #d4e3e2;
            background: white;
            color: #52706e;
          }

          .category-view-button:hover:not(:disabled) {
            background: #f5fafa;
          }

          .category-edit-button {
            border: 1px solid #a9dcd8;
            background: #f2fbfa;
            color: #159f9f;
          }

          .category-edit-button:hover:not(:disabled) {
            background: #e4f8f6;
          }

          .category-delete-button {
            border: 1px solid #f3c0bc;
            background: #fff5f4;
            color: #d92d20;
          }

          .category-delete-button:hover:not(:disabled) {
            background: #ffebe9;
          }

          .category-empty-state {
            text-align: center;
            padding: 45px !important;
            color: #98a2b3 !important;
          }

          .category-modal-overlay {
            position: fixed;
            inset: 0;
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background: rgba(16,24,40,0.48);
            backdrop-filter: blur(2px);
          }

          .category-modal {
            width: min(720px, 95vw);
            max-height: 90vh;
            overflow-y: auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 22px 55px rgba(16,24,40,0.25);
          }

          .category-modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            padding: 24px 30px;
            background: #55b8b4;
          }

          .category-modal-header h2 {
            margin: 0;
            color: white;
            font-size: 25px;
            font-weight: 700;
          }

          .category-modal-header p {
            margin: 7px 0 0;
            color: rgba(255,255,255,0.9);
            font-size: 13px;
            line-height: 1.5;
          }

          .category-modal-close {
            width: 35px;
            min-width: 35px;
            height: 35px;
            padding: 0;
            border: none;
            border-radius: 50%;
            background: white;
            color: #52706e;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          }

          .category-modal form,
          .category-modal-body {
            padding: 28px 30px;
          }

          .category-form-group {
            margin-bottom: 20px;
          }

          .category-form-group > label {
            display: block;
            margin-bottom: 8px;
            color: #344054;
            font-size: 14px;
            font-weight: 700;
          }

          .category-form-group input:not([type="file"]),
          .category-form-group textarea {
            width: 100%;
            padding: 12px 14px;
            border: 1px solid #dce7e6;
            border-radius: 8px;
            outline: none;
            background: white;
            color: #344054;
            font-family: inherit;
            font-size: 13px;
          }

          .category-form-group input:not([type="file"]) {
            height: 44px;
          }

          .category-form-group textarea {
            resize: vertical;
            min-height: 100px;
          }

          .category-form-group input:focus,
          .category-form-group textarea:focus {
            border-color: #159f9f;
          }

          .category-form-group small {
            display: block;
            margin-top: 7px;
            color: #98a2b3;
            font-size: 12px;
            line-height: 1.5;
          }

          .category-form-group > .category-image-upload {
            min-height: 150px;
            margin-bottom: 0;
            border: 2px dashed #c5dfdc;
            border-radius: 10px;
            background: #f8fcfb;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 12px;
            color: #667085;
            cursor: pointer;
            font-size: 13px;
          }

          .category-upload-icon {
            color: #159f9f;
            font-size: 32px;
          }

          .category-image-upload input,
          .category-change-image-button input {
            display: none;
          }

          .category-image-preview-box {
            display: flex;
            align-items: center;
            gap: 20px;
            padding: 15px;
            border: 1px solid #e1eae9;
            border-radius: 10px;
            background: #f8fcfb;
          }

          .category-image-preview {
            width: 120px;
            height: 110px;
            border-radius: 9px;
            object-fit: cover;
          }

          .category-image-preview-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
          }

          .category-change-image-button,
          .category-remove-image-button {
            min-height: 36px;
            padding: 0 12px;
            border-radius: 7px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 7px;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
          }

          .category-change-image-button {
            border: 1px solid #a9dcd8;
            background: #f2fbfa;
            color: #159f9f;
          }

          .category-remove-image-button {
            border: 1px solid #f3c0bc;
            background: #fff5f4;
            color: #d92d20;
          }

          .category-form-actions {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 10px;
            margin-top: 25px;
          }

          .category-cancel-button,
          .category-save-button {
            min-width: 110px;
            min-height: 41px;
            padding: 10px 16px;
            border-radius: 7px;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
          }

          .category-cancel-button {
            border: 1px solid #d0d5dd;
            background: white;
            color: #475467;
          }

          .category-save-button {
            border: 1px solid #159f9f;
            background: #159f9f;
            color: white;
          }

          .category-view-image-wrapper {
            margin-bottom: 20px;
          }

          .category-view-image {
            width: 100%;
            max-height: 260px;
            object-fit: contain;
            border: 1px solid #e1eae9;
            border-radius: 10px;
            background: #f8fcfb;
          }

          .category-view-placeholder {
            min-height: 180px;
            border: 1px dashed #c5dfdc;
            border-radius: 10px;
            background: #f3f7f7;
            color: #98a2b3;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 10px;
          }

          .category-view-placeholder svg {
            font-size: 40px;
          }

          .category-view-placeholder span {
            font-size: 13px;
            font-weight: 700;
          }

          .category-detail-row {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 25px;
            padding: 15px 0;
            border-bottom: 1px solid #eef2f2;
          }

          .category-detail-row span {
            color: #667085;
            font-size: 13px;
          }

          .category-detail-row strong {
            max-width: 65%;
            color: #344054;
            font-size: 13px;
            font-weight: 700;
            text-align: right;
            line-height: 1.5;
            overflow-wrap: anywhere;
          }

          .category-delete-dialog {
            width: min(460px, 95vw);
            max-height: 90vh;
            overflow-y: auto;
            background: white;
            border-radius: 14px;
            box-shadow: 0 20px 55px rgba(16,24,40,0.25);
          }

          .category-delete-dialog-header {
            min-height: 65px;
            padding: 0 22px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
            background: #55b8b4;
          }

          .category-delete-dialog-header h3 {
            margin: 0;
            color: white;
            font-size: 20px;
            font-weight: 700;
          }

          .category-delete-small-close {
            width: 32px;
            min-width: 32px;
            height: 32px;
            padding: 0;
            border: none;
            border-radius: 50%;
            background: white;
            color: #52706e;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 15px;
            cursor: pointer;
          }

          .category-delete-dialog-body {
            padding: 28px;
          }

          .category-delete-icon {
            width: 54px;
            height: 54px;
            margin: 0 auto 17px;
            border-radius: 50%;
            background: #fff0ee;
            color: #d92d20;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 21px;
          }

          .category-delete-dialog-body p {
            margin: 0;
            color: #667085;
            text-align: center;
            font-size: 14px;
            line-height: 1.7;
          }

          .category-delete-dialog-body p strong {
            color: #344054;
          }

          .category-delete-actions {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 10px;
            margin-top: 25px;
          }

          .category-delete-cancel,
          .category-delete-confirm {
            min-width: 105px;
            min-height: 40px;
            padding: 10px 15px;
            border-radius: 7px;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
          }

          .category-delete-cancel {
            border: 1px solid #d0d5dd;
            background: white;
            color: #475467;
          }

          .category-delete-confirm {
            border: 1px solid #d92d20;
            background: #d92d20;
            color: white;
          }

          .category-sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0,0,0,0);
            white-space: nowrap;
            border: 0;
          }

          @media (max-width: 700px) {
            .categories-page-header {
              align-items: flex-start;
              flex-direction: column;
            }

            .categories-header-actions {
              width: 100%;
            }

            .categories-export-button,
            .category-add-button {
              flex: 1;
            }

            .category-modal-header {
              padding: 22px;
            }

            .category-modal-header h2 {
              font-size: 22px;
            }

            .category-modal form,
            .category-modal-body {
              padding: 22px;
            }

            .category-image-preview-box {
              align-items: flex-start;
              flex-direction: column;
            }

            .category-detail-row {
              flex-direction: column;
              gap: 5px;
            }

            .category-detail-row strong {
              max-width: 100%;
              text-align: left;
            }

            .category-modal-overlay {
              padding: 12px;
            }

            .category-form-actions,
            .category-delete-actions {
              flex-wrap: wrap;
            }
          }
        `}</style>
      </main>
    </div>
  );
}

export default Categories;