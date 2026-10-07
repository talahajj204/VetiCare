import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";

import {
  FaEye,
  FaPen,
  FaTrash,
  FaSearch,
  FaTimes,
  FaImage,
  FaFileExcel,
} from "react-icons/fa";

import * as XLSX from "xlsx";

function Categories() {
  const STORAGE_KEY = "vetClinicCategories";

  // =====================================================
  // DEFAULT STORE CATEGORIES
  // These are the categories used by the Store.
  // Admin can edit title, image, description and order.
  // =====================================================

  const defaultCategories = [
    {
      id: 1,
      title: "Food",
      image: "",
      description: "Food and nutrition products for pets.",
      sortOrder: 1,
    },
    {
      id: 2,
      title: "Care",
      image: "",
      description: "Everyday care products for pets.",
      sortOrder: 2,
    },
    {
      id: 3,
      title: "Hygiene",
      image: "",
      description: "Pet hygiene and cleaning products.",
      sortOrder: 3,
    },
    {
      id: 4,
      title: "Accessories",
      image: "",
      description: "Accessories and everyday essentials for pets.",
      sortOrder: 4,
    },
    {
      id: 5,
      title: "Supplements",
      image: "",
      description: "Supplements that support pet health and wellness.",
      sortOrder: 5,
    },
    {
      id: 6,
      title: "Grooming",
      image: "",
      description: "Grooming products for pet care and cleanliness.",
      sortOrder: 6,
    },
    {
      id: 7,
      title: "Toys",
      image: "",
      description: "Fun toys and entertainment products for pets.",
      sortOrder: 7,
    },
    {
      id: 8,
      title: "Treats",
      image: "",
      description: "Tasty treats and rewards for pets.",
      sortOrder: 8,
    },
    {
      id: 9,
      title: "Beds",
      image: "",
      description: "Comfortable beds and sleeping products for pets.",
      sortOrder: 9,
    },
    {
      id: 10,
      title: "Bowls",
      image: "",
      description: "Food and water bowls for pets.",
      sortOrder: 10,
    },
    {
      id: 11,
      title: "Dental Care",
      image: "",
      description: "Dental hygiene and oral care products for pets.",
      sortOrder: 11,
    },
    {
      id: 12,
      title: "Pet Essentials",
      image: "",
      description: "Essential everyday products for pets.",
      sortOrder: 12,
    },
  ];

  // =====================================================
  // LOAD CATEGORIES
  // =====================================================

  const loadCategories = () => {
    try {
      const savedCategories =
        localStorage.getItem(STORAGE_KEY);

      if (savedCategories) {
        const parsedCategories =
          JSON.parse(savedCategories);

        if (Array.isArray(parsedCategories)) {
          /*
            OLD VERSION MIGRATION

            If localStorage still contains the old five
            categories from the previous Categories.jsx,
            automatically replace them with the 12 Store
            categories.

            IMPORTANT:
            We only replace the exact old default data.
            If the admin has already created/edited their
            own categories, we keep their data.
          */

          const oldDefaultTitles = [
            "Medical Supplies",
            "Vaccines",
            "Medications",
            "Pet Food",
            "Pet Accessories",
          ];

          const savedTitles = parsedCategories
            .map((category) =>
              String(category.title || "").trim()
            )
            .filter(Boolean);

          const isOldDefaultData =
            parsedCategories.length === 5 &&
            oldDefaultTitles.every((title) =>
              savedTitles.includes(title)
            );

          if (isOldDefaultData) {
            localStorage.setItem(
              STORAGE_KEY,
              JSON.stringify(defaultCategories)
            );

            return defaultCategories;
          }

          return parsedCategories;
        }
      }
    } catch (error) {
      console.error(
        "Error loading categories:",
        error
      );
    }

    /*
      First time opening Categories:
      save the 12 Store categories immediately.
    */

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(defaultCategories)
    );

    return defaultCategories;
  };

  // =====================================================
  // STATES
  // =====================================================

  const [categories, setCategories] =
    useState(loadCategories);

  const [search, setSearch] = useState("");

  const [showAddModal, setShowAddModal] =
    useState(false);

  const [showViewModal, setShowViewModal] =
    useState(false);

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState(null);

  const [
    categoryToDelete,
    setCategoryToDelete,
  ] = useState(null);

  const getEmptyCategory = () => ({
    title: "",
    image: "",
    description: "",
    sortOrder: "",
  });

  const [newCategory, setNewCategory] =
    useState(getEmptyCategory());

  // =====================================================
  // SAVE CATEGORIES
  // =====================================================

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(categories)
    );

    /*
      Home.jsx listens to this event.

      This means:
      Add Category -> Store updates
      Edit Category -> Store updates
      Change Image -> Store updates
      Delete Category -> Store updates
      Change Sort Order -> Store updates
    */

    window.dispatchEvent(
      new CustomEvent(
        "vetClinicCategoriesUpdated",
        {
          detail: categories,
        }
      )
    );
  }, [categories]);

  // =====================================================
  // SORT CATEGORIES
  // =====================================================

  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => {
      const orderA =
        Number(a.sortOrder) || 0;

      const orderB =
        Number(b.sortOrder) || 0;

      if (orderA !== orderB) {
        return orderA - orderB;
      }

      return String(a.title || "").localeCompare(
        String(b.title || "")
      );
    });
  }, [categories]);

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredCategories = useMemo(() => {
    const value =
      search.trim().toLowerCase();

    if (!value) {
      return sortedCategories;
    }

    return sortedCategories.filter(
      (category) => {
        return (
          String(category.title || "")
            .toLowerCase()
            .includes(value) ||
          String(category.description || "")
            .toLowerCase()
            .includes(value) ||
          String(category.sortOrder).includes(
            value
          )
        );
      }
    );
  }, [search, sortedCategories]);

  // =====================================================
  // INPUT HANDLERS
  // =====================================================

  const handleNewCategoryChange = (e) => {
    const { name, value } = e.target;

    setNewCategory((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleEditCategoryChange = (e) => {
    const { name, value } = e.target;

    setSelectedCategory((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // IMAGE
  // =====================================================

  const convertImageToBase64 = (
    file,
    callback
  ) => {
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      callback(reader.result);
    };

    reader.onerror = () => {
      alert(
        "Could not read this image. Please try another image."
      );
    };

    reader.readAsDataURL(file);
  };

  const handleNewImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    convertImageToBase64(
      file,
      (imageData) => {
        setNewCategory((previous) => ({
          ...previous,
          image: imageData,
        }));
      }
    );

    e.target.value = "";
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    convertImageToBase64(
      file,
      (imageData) => {
        setSelectedCategory(
          (previous) => ({
            ...previous,
            image: imageData,
          })
        );
      }
    );

    e.target.value = "";
  };

  const removeNewImage = () => {
    setNewCategory((previous) => ({
      ...previous,
      image: "",
    }));
  };

  const removeEditImage = () => {
    setSelectedCategory((previous) => ({
      ...previous,
      image: "",
    }));
  };

  // =====================================================
  // ADD CATEGORY
  // =====================================================

  const handleAddCategory = (e) => {
    e.preventDefault();

    const title =
      newCategory.title.trim();

    if (!title) return;

    const alreadyExists =
      categories.some(
        (category) =>
          String(category.title || "")
            .trim()
            .toLowerCase() ===
          title.toLowerCase()
      );

    if (alreadyExists) {
      alert(
        "This category already exists."
      );

      return;
    }

    const category = {
      id: Date.now(),
      title,
      image:
        newCategory.image || "",
      description:
        newCategory.description.trim(),
      sortOrder:
        Number(newCategory.sortOrder) ||
        0,
    };

    setCategories((previous) => [
      ...previous,
      category,
    ]);

    setNewCategory(
      getEmptyCategory()
    );

    setShowAddModal(false);
  };

  // =====================================================
  // VIEW CATEGORY
  // =====================================================

  const handleViewCategory = (
    category
  ) => {
    setSelectedCategory({
      ...category,
    });

    setShowViewModal(true);
  };

  // =====================================================
  // EDIT CATEGORY
  // =====================================================

  const handleEditCategory = (
    category
  ) => {
    setSelectedCategory({
      ...category,
    });

    setShowEditModal(true);
  };

  const handleUpdateCategory = (e) => {
    e.preventDefault();

    if (!selectedCategory) return;

    const title =
      selectedCategory.title.trim();

    if (!title) return;

    const alreadyExists =
      categories.some(
        (category) =>
          category.id !==
            selectedCategory.id &&
          String(category.title || "")
            .trim()
            .toLowerCase() ===
            title.toLowerCase()
      );

    if (alreadyExists) {
      alert(
        "This category already exists."
      );

      return;
    }

    const updatedCategory = {
      ...selectedCategory,

      title,

      image:
        selectedCategory.image || "",

      description:
        selectedCategory.description.trim(),

      sortOrder:
        Number(
          selectedCategory.sortOrder
        ) || 0,
    };

    setCategories((previous) =>
      previous.map((category) =>
        category.id ===
        updatedCategory.id
          ? updatedCategory
          : category
      )
    );

    setShowEditModal(false);

    setSelectedCategory(null);
  };

  // =====================================================
  // DELETE CATEGORY
  // =====================================================

  const openDeleteModal = (
    category
  ) => {
    setCategoryToDelete(category);

    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setCategoryToDelete(null);

    setShowDeleteModal(false);
  };

  const confirmDeleteCategory = () => {
    if (!categoryToDelete) return;

    setCategories((previous) =>
      previous.filter(
        (category) =>
          category.id !==
          categoryToDelete.id
      )
    );

    closeDeleteModal();
  };

  // =====================================================
  // EXPORT
  // =====================================================

  const handleExport = () => {
    const exportData =
      sortedCategories.map(
        (category) => ({
          "Category Title":
            category.title,

          Description:
            category.description,

          "Sort Order":
            category.sortOrder,
        })
      );

    const worksheet =
      XLSX.utils.json_to_sheet(
        exportData
      );

    const workbook =
      XLSX.utils.book_new();

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

  // =====================================================
  // CATEGORY FORM
  // =====================================================

  const renderCategoryForm = (
    data,
    onChange,
    onImageChange,
    onRemoveImage
  ) => (
    <>
      <div className="category-form-group">
        <label>
          Category Title
        </label>

        <input
          type="text"
          name="title"
          placeholder="Enter category title"
          value={data.title || ""}
          onChange={onChange}
          required
        />
      </div>

      <div className="category-form-group">
        <label>
          Category Image
        </label>

        {data.image ? (
          <div className="category-image-preview-box">
            <img
              src={data.image}
              alt={
                data.title ||
                "Category"
              }
              className="category-image-preview"
            />

            <div className="category-image-preview-actions">
              <label className="category-change-image-button">
                <FaImage />

                Change Image

                <input
                  type="file"
                  accept="image/*"
                  onChange={
                    onImageChange
                  }
                />
              </label>

              <button
                type="button"
                className="category-remove-image-button"
                onClick={
                  onRemoveImage
                }
              >
                <FaTrash />
                Remove
              </button>
            </div>
          </div>
        ) : (
          <label className="category-image-upload">
            <FaImage className="category-upload-icon" />

            <span>
              Upload Category Image
            </span>

            <input
              type="file"
              accept="image/*"
              onChange={
                onImageChange
              }
            />
          </label>
        )}
      </div>

      <div className="category-form-group">
        <label>
          Description
        </label>

        <textarea
          name="description"
          placeholder="Enter category description"
          value={
            data.description || ""
          }
          onChange={onChange}
          rows="4"
        />
      </div>

      <div className="category-form-group">
        <label>
          Sort Order
        </label>

        <input
          type="number"
          name="sortOrder"
          min="0"
          placeholder="Example: 1"
          value={
            data.sortOrder ?? ""
          }
          onChange={onChange}
          required
        />

        <small>
          Lower numbers will appear
          first.
        </small>
      </div>
    </>
  );

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main categories-page">
        <style>{`
          /* =====================================================
             PAGE
          ===================================================== */

          .categories-page {
            padding-bottom: 40px;
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

          /* =====================================================
             HEADER BUTTONS
          ===================================================== */

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

          .categories-export-button:hover {
            background: #f0fafa;
          }

          .category-add-button {
            border: 1px solid #159f9f;
            background: #159f9f;
            color: white;
          }

          .category-add-button:hover {
            background: #118b8b;
          }

          /* =====================================================
             SEARCH
          ===================================================== */

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
            border: none;
            background: transparent;
            color: #98a2b3;
            cursor: pointer;
          }

          /* =====================================================
             TABLE
          ===================================================== */

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
            min-width: 850px;
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

          /* =====================================================
             ACTION ICONS
          ===================================================== */

          .category-action-buttons {
            display: flex;
            align-items: center;
            gap: 9px;
          }

          .category-action-buttons button {
            width: 42px;
            height: 42px;
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

          .category-view-button:hover {
            background: #f5fafa;
          }

          .category-edit-button {
            border: 1px solid #a9dcd8;
            background: #f2fbfa;
            color: #159f9f;
          }

          .category-edit-button:hover {
            background: #e4f8f6;
          }

          .category-delete-button {
            border: 1px solid #f3c0bc;
            background: #fff5f4;
            color: #d92d20;
          }

          .category-delete-button:hover {
            background: #ffebe9;
          }

          .category-empty-state {
            text-align: center;
            padding: 45px !important;
            color: #98a2b3 !important;
          }

          /* =====================================================
             MODAL OVERLAY
          ===================================================== */

          .category-modal-overlay {
            position: fixed;
            inset: 0;
            z-index: 9999;

            display: flex;
            align-items: center;
            justify-content: center;

            padding: 20px;

            background: rgba(16, 24, 40, 0.48);
            backdrop-filter: blur(2px);
          }

          /* =====================================================
             MODAL
          ===================================================== */

          .category-modal {
            width: min(720px, 95vw);
            max-height: 90vh;
            overflow-y: auto;

            background: white;
            border-radius: 15px;

            box-shadow:
              0 22px 55px
              rgba(16, 24, 40, 0.25);
          }

          /* =====================================================
             MODAL HEADER
          ===================================================== */

          .category-modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;

            padding: 24px 30px;

            background: #55b8b4;
            border-radius: 15px 15px 0 0;
          }

          .category-modal-header-text {
            min-width: 0;
          }

          .category-modal-header h2 {
            margin: 0;

            color: white;

            font-size: 25px;
            line-height: 1.2;
            font-weight: 700;

            white-space: nowrap;
          }

          .category-modal-header p {
            margin: 5px 0 0;

            color: rgba(255, 255, 255, 0.95);

            font-size: 14px;
          }

          .category-modal-close {
            width: 36px;
            height: 36px;
            min-width: 36px;

            padding: 0;

            border: none;
            border-radius: 50%;

            background: white;
            color: #52706e;

            font-size: 18px;
            line-height: 1;

            display: flex;
            align-items: center;
            justify-content: center;

            cursor: pointer;

            transition: 0.2s ease;
          }

          .category-modal-close:hover {
            transform: scale(1.04);
            background: #f5fafa;
          }

          /* =====================================================
             MODAL BODY
          ===================================================== */

          .category-modal form,
          .category-modal-body {
            padding: 28px 32px 30px;
          }

          .category-form-group {
            margin-bottom: 19px;
          }

          .category-form-group label {
            display: block;

            margin-bottom: 7px;

            color: #344054;

            font-size: 14px;
            font-weight: 700;
          }

          .category-form-group input,
          .category-form-group textarea {
            width: 100%;

            border: 1px solid #cfe1df;
            border-radius: 8px;

            padding: 12px 13px;

            color: #344054;

            outline: none;

            font-family: inherit;
            font-size: 14px;

            box-sizing: border-box;

            background: white;
          }

          .category-form-group input {
            height: 46px;
          }

          .category-form-group textarea {
            resize: vertical;
            min-height: 105px;
          }

          .category-form-group input:focus,
          .category-form-group textarea:focus {
            border-color: #159f9f;

            box-shadow:
              0 0 0 2px
              rgba(21, 159, 159, 0.08);
          }

          .category-form-group small {
            display: block;

            margin-top: 6px;

            color: #98a2b3;

            font-size: 11px;
          }

          /* =====================================================
             IMAGE UPLOAD
          ===================================================== */

          .category-image-upload {
            min-height: 115px;

            border: 1px dashed #a9c9c7;
            border-radius: 9px;

            background: #fbfdfd;

            display: flex !important;
            flex-direction: column;
            align-items: center;
            justify-content: center;

            gap: 9px;

            color: #52706e !important;

            cursor: pointer;
          }

          .category-upload-icon {
            font-size: 29px;
          }

          .category-image-upload span {
            font-weight: 700;
          }

          .category-image-upload input,
          .category-change-image-button input {
            display: none;
          }

          .category-image-preview-box {
            display: flex;
            align-items: center;

            gap: 18px;

            padding: 13px;

            border: 1px solid #e3eceb;
            border-radius: 9px;

            background: #fbfdfd;
          }

          .category-image-preview {
            width: 100px;
            height: 100px;

            border-radius: 9px;

            object-fit: cover;

            border: 1px solid #dfe9e8;
          }

          .category-image-preview-actions {
            display: flex;
            flex-wrap: wrap;

            gap: 9px;
          }

          .category-change-image-button,
          .category-remove-image-button {
            display: inline-flex !important;
            align-items: center;
            justify-content: center;

            gap: 7px;

            min-height: 38px;

            padding: 0 13px;

            border-radius: 7px;

            font-size: 12px !important;
            font-weight: 700;

            cursor: pointer;

            margin: 0 !important;
          }

          .category-change-image-button {
            border: 1px solid #bfe2df;

            background: #f2fbfa;

            color: #159f9f !important;
          }

          .category-remove-image-button {
            border: 1px solid #f3cbc8;

            background: #fff5f4;

            color: #d92d20;
          }
          /* =====================================================
          MODAL BUTTONS
       ===================================================== */

       .category-form-actions {
         display: flex;
         align-items: center;
         justify-content: flex-end;
         gap: 10px;

         margin-top: 25px;
         padding-top: 20px;

         border-top: 1px solid #eef2f2;
       }

       .category-cancel-button,
       .category-save-button {
         min-width: 110px;
         height: 42px;

         padding: 0 17px;

         border-radius: 7px;

         font-size: 13px;
         font-weight: 700;

         cursor: pointer;

         transition: 0.2s ease;
       }

       .category-cancel-button {
         border: 1px solid #d0d5dd;

         background: white;

         color: #475467;
       }

       .category-cancel-button:hover {
         background: #f8fafc;
       }

       .category-save-button {
         border: 1px solid #159f9f;

         background: #159f9f;

         color: white;
       }

       .category-save-button:hover {
         background: #118b8b;
       }

       /* =====================================================
          VIEW CATEGORY
       ===================================================== */

       .category-view-image-wrapper {
         width: 100%;

         display: flex;
         align-items: center;
         justify-content: center;

         margin-bottom: 25px;
       }

       .category-view-image {
         width: 170px;
         height: 170px;

         object-fit: cover;

         border-radius: 13px;

         border: 1px solid #e1e9e8;
       }

       .category-view-placeholder {
         width: 170px;
         height: 170px;

         border-radius: 13px;

         border: 1px dashed #b8cfcd;

         background: #f7fbfb;

         color: #98a2b3;

         display: flex;
         flex-direction: column;
         align-items: center;
         justify-content: center;

         gap: 10px;
       }

       .category-view-placeholder svg {
         font-size: 35px;
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
       }

       /* =====================================================
          DELETE MODAL
       ===================================================== */

       .category-delete-dialog {
         width: min(460px, 95vw);

         background: white;

         border-radius: 14px;

         overflow: hidden;

         box-shadow:
           0 20px 55px
           rgba(16, 24, 40, 0.25);
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
         height: 40px;

         padding: 0 15px;

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

       /* =====================================================
          RESPONSIVE
       ===================================================== */

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
       }
     `}</style>

     {/* =====================================================
         PAGE HEADER
     ===================================================== */}

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
         >
           <FaFileExcel />
           Export
         </button>

         <button
           type="button"
           className="category-add-button"
           onClick={() => {
             setNewCategory(getEmptyCategory());
             setShowAddModal(true);
           }}
         >
           + Add Category
         </button>
       </div>
     </div>

     {/* =====================================================
         SEARCH
     ===================================================== */}

     <div className="categories-search-row">
       <div className="categories-search-box">
         <FaSearch className="categories-search-icon" />

         <input
           type="text"
           placeholder="Search categories..."
           value={search}
           onChange={(e) => setSearch(e.target.value)}
         />

         {search && (
           <button
             type="button"
             className="categories-clear-search"
             onClick={() => setSearch("")}
             title="Clear search"
           >
             <FaTimes />
           </button>
         )}
       </div>
     </div>

     {/* =====================================================
         CATEGORIES TABLE
     ===================================================== */}

     <div className="categories-table-container">
       <div className="categories-table-scroll">
         <table className="categories-table">
           <thead>
             <tr>
               <th>Category</th>
               <th>Description</th>
               <th>Sort Order</th>
               <th>Actions</th>
             </tr>
           </thead>

           <tbody>
             {filteredCategories.length > 0 ? (
               filteredCategories.map((category) => (
                 <tr key={category.id}>
                   <td>
                     <div className="category-title-cell">
                       {category.image ? (
                         <img
                           src={category.image}
                           alt={category.title}
                           className="category-table-image"
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
                       {category.sortOrder}
                     </span>
                   </td>

                   <td>
                     <div className="category-action-buttons">
                       <button
                         type="button"
                         className="category-view-button"
                         title="View"
                         onClick={() =>
                           handleViewCategory(category)
                         }
                       >
                         <FaEye />
                       </button>

                       <button
                         type="button"
                         className="category-edit-button"
                         title="Edit"
                         onClick={() =>
                           handleEditCategory(category)
                         }
                       >
                         <FaPen />
                       </button>

                       <button
                         type="button"
                         className="category-delete-button"
                         title="Delete"
                         onClick={() =>
                           openDeleteModal(category)
                         }
                       >
                         <FaTrash />
                       </button>
                     </div>
                   </td>
                 </tr>
               ))
             ) : (
               <tr>
                 <td
                   colSpan="4"
                   className="category-empty-state"
                 >
                   No categories found.
                 </td>
               </tr>
             )}
           </tbody>
         </table>
       </div>
     </div>

     {/* =====================================================
         ADD CATEGORY MODAL
     ===================================================== */}

     {showAddModal && (
       <div
         className="category-modal-overlay"
         onMouseDown={(e) => {
           if (e.target === e.currentTarget) {
             setShowAddModal(false);
           }
         }}
       >
         <div className="category-modal">
           <div className="category-modal-header">
             <div className="category-modal-header-text">
               <h2>Add Category</h2>

               <p>
                 Create a new product category for your store.
               </p>
             </div>

             <button
               type="button"
               className="category-modal-close"
               onClick={() => setShowAddModal(false)}
               title="Close"
             >
               <FaTimes />
             </button>
           </div>

           <form onSubmit={handleAddCategory}>
             {renderCategoryForm(
               newCategory,
               handleNewCategoryChange,
               handleNewImageChange,
               removeNewImage
             )}

             <div className="category-form-actions">
               <button
                 type="button"
                 className="category-cancel-button"
                 onClick={() => {
                   setShowAddModal(false);
                   setNewCategory(getEmptyCategory());
                 }}
               >
                 Cancel
               </button>

               <button
                 type="submit"
                 className="category-save-button"
               >
                 Add Category
               </button>
             </div>
           </form>
         </div>
       </div>
     )}

     {/* =====================================================
         VIEW CATEGORY MODAL
     ===================================================== */}

     {showViewModal && selectedCategory && (
       <div
         className="category-modal-overlay"
         onMouseDown={(e) => {
           if (e.target === e.currentTarget) {
             setShowViewModal(false);
             setSelectedCategory(null);
           }
         }}
       >
         <div className="category-modal">
           <div className="category-modal-header">
             <div className="category-modal-header-text">
               <h2>View Category</h2>

               <p>
                 View category information and store details.
               </p>
             </div>

             <button
               type="button"
               className="category-modal-close"
               onClick={() => {
                 setShowViewModal(false);
                 setSelectedCategory(null);
               }}
               title="Close"
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
               <strong>
                 {selectedCategory.title}
               </strong>
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
                 onClick={() => {
                   setShowViewModal(false);
                   setSelectedCategory(null);
                 }}
               >
                 Close
               </button>

               <button
                 type="button"
                 className="category-save-button"
                 onClick={() => {
                   const category = {
                     ...selectedCategory,
                   };

                   setShowViewModal(false);

                   setSelectedCategory(category);

                   setShowEditModal(true);
                 }}
               >
                 Edit Category
               </button>
             </div>
           </div>
         </div>
       </div>
     )}

     {/* =====================================================
         EDIT CATEGORY MODAL
     ===================================================== */}

     {showEditModal && selectedCategory && (
       <div
         className="category-modal-overlay"
         onMouseDown={(e) => {
           if (e.target === e.currentTarget) {
             setShowEditModal(false);
             setSelectedCategory(null);
           }
         }}
       >
         <div className="category-modal">
           <div className="category-modal-header">
             <div className="category-modal-header-text">
               <h2>Edit Category</h2>

               <p>
                 Update category information displayed in your
                 store.
               </p>
             </div>

             <button
               type="button"
               className="category-modal-close"
               onClick={() => {
                 setShowEditModal(false);
                 setSelectedCategory(null);
               }}
               title="Close"
             >
               <FaTimes />
             </button>
           </div>

           <form onSubmit={handleUpdateCategory}>
             {renderCategoryForm(
               selectedCategory,
               handleEditCategoryChange,
               handleEditImageChange,
               removeEditImage
             )}

             <div className="category-form-actions">
               <button
                 type="button"
                 className="category-cancel-button"
                 onClick={() => {
                   setShowEditModal(false);
                   setSelectedCategory(null);
                 }}
               >
                 Cancel
               </button>

               <button
                 type="submit"
                 className="category-save-button"
               >
                 Save Changes
               </button>
             </div>
           </form>
         </div>
       </div>
     )}

     {/* =====================================================
         DELETE CATEGORY MODAL
     ===================================================== */}

     {showDeleteModal && categoryToDelete && (
       <div
         className="category-modal-overlay"
         onMouseDown={(e) => {
           if (e.target === e.currentTarget) {
             closeDeleteModal();
           }
         }}
       >
         <div className="category-delete-dialog">
           <div className="category-delete-dialog-header">
             <h3>Delete Category</h3>

             <button
               type="button"
               className="category-delete-small-close"
               onClick={closeDeleteModal}
               title="Close"
             >
               <FaTimes />
             </button>
           </div>

           <div className="category-delete-dialog-body">
             <div className="category-delete-icon">
               <FaTrash />
             </div>

             <p>
               Are you sure you want to delete{" "}
               <strong>
                 {categoryToDelete.title}
               </strong>
               ?
               <br />
               This category will also disappear from the
               store's Shop by Category section.
             </p>

             <div className="category-delete-actions">
               <button
                 type="button"
                 className="category-delete-cancel"
                 onClick={closeDeleteModal}
               >
                 Cancel
               </button>

               <button
                 type="button"
                 className="category-delete-confirm"
                 onClick={confirmDeleteCategory}
               >
                 Delete Category
               </button>
             </div>
           </div>
         </div>
       </div>
     )}
   </main>
 </div>
);
}

export default Categories;