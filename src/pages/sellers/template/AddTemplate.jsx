import React, { useEffect, useState } from "react";
import Select from "react-select";
import {
  COLOR_OPTIONS,
  SIZE_OPTIONS,
  TYPE_OPTIONS,
} from "./../../../constants/productConstants";
import categoryService from "../../../services/categoryService";
import templateService from "../../../services/templateService";
import Swal from "sweetalert2";
import { Modal } from "bootstrap";

export default function AddTemplate() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedValues, setSelectedValues] = useState([]);
  const [imageOptionIndex, setImageOptionIndex] = useState(null);
  const [optionsList, setOptionsList] = useState([]);
  const [images, setImages] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [variants, setVariants] = useState([]);
  const [newPrice, setNewPrice] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [selectedForBulk, setSelectedForBulk] = useState([]);
  const [imageUrl, setImageUrl] = useState("");
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer);
      toast.addEventListener("mouseleave", Swal.resumeTimer);
    },
  });
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getFlatCategories();
        setCategories(response.data.data); // Giả sử API trả về data trong response.data.data
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleImageUrlChange = (event) => {
    setImageUrl(event.target.value);
  };

  const handleImageUrlVariant = (key, url) => {
    // Cập nhật images state
    setImages((prevImages) => ({
      ...prevImages,
      [key]: url,
    }));

    // Cập nhật variants state với URL hình ảnh mới
    setVariants((prevVariants) =>
      prevVariants.map((variant) => {
        if (variant.variant.includes(key)) {
          return {
            ...variant,
            image: url,
          };
        }
        return variant;
      })
    );
  };

  const handleOptionChange = (option) => {
    setSelectedOption(option);
    setSelectedValues([]);
  };

  const getValuesOptions = () => {
    switch (selectedOption?.value) {
      case "color":
        return COLOR_OPTIONS;
      case "size":
        return SIZE_OPTIONS;
      case "type":
        return TYPE_OPTIONS;
      default:
        return [];
    }
  };

  const handleAddOption = () => {
    if (selectedOption && selectedValues.length > 0) {
      const newOptionsList = [
        ...optionsList,
        { option: selectedOption.label, values: selectedValues },
      ];
      setOptionsList(newOptionsList);

      const valuesList = newOptionsList.map((item) =>
        item.values.map((v) => v.label)
      );
      const combinations = generateCombinations(valuesList);
      const newVariants = combinations.map((combination) => {
        const variantKey = combination.join(", ");
        return {
          variant: variantKey,
          price: "",
          quantity: "",
          image: images[variantKey] || null, // Đảm bảo hình ảnh được gán đúng
        };
      });
      setVariants(newVariants);

      setSelectedOption(null);
      setSelectedValues([]);
    }
  };

  const handleImageUpload = (key, event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Cập nhật images state
        setImages((prevImages) => ({
          ...prevImages,
          [key]: reader.result,
        }));

        // Cập nhật variants state với hình ảnh mới
        setVariants((prevVariants) =>
          prevVariants.map((variant) => {
            // Kiểm tra xem variant có chứa key không
            if (variant.variant.includes(key)) {
              return {
                ...variant,
                image: reader.result,
              };
            }
            return variant;
          })
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleImageUpload = (index) => {
    setImageOptionIndex(imageOptionIndex === index ? null : index);
  };

  const closeModal = () => setIsModalOpen(false);

  const generateCombinations = (arrays) => {
    if (arrays.length === 0) return [[]];
    const [first, ...rest] = arrays;
    const combinationsWithoutFirst = generateCombinations(rest);
    return first.flatMap((value) =>
      combinationsWithoutFirst.map((combination) => [value, ...combination])
    );
  };

  const handleBulkSelect = (option, selectedValues) => {
    setSelectedForBulk((prev) => ({
      ...prev,
      [option]: selectedValues,
    }));
  };

  const handleApply = () => {
    setVariants((prevVariants) =>
      prevVariants.map((variant) => {
        const variantParts = variant.variant.split(", ");
        const isSelected = variantParts.every((part) =>
          Object.values(selectedForBulk).flat().includes(part)
        );
        return isSelected
          ? { ...variant, price: newPrice, quantity: newQuantity }
          : variant;
      })
    );
    closeModal();
  };

  const handleDeleteOption = (indexToDelete) => {
    setOptionsList((prevOptions) =>
      prevOptions.filter((_, index) => index !== indexToDelete)
    );

    const updatedOptionsList = optionsList.filter(
      (_, index) => index !== indexToDelete
    );
    const valuesList = updatedOptionsList.map((item) =>
      item.values.map((v) => v.label)
    );

    if (valuesList.length > 0) {
      const combinations = generateCombinations(valuesList);
      const newVariants = combinations.map((combination) => ({
        variant: combination.join(", "),
        price: "",
        quantity: "",
        image: null,
      }));
      setVariants(newVariants);
    } else {
      setVariants([]);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Kiểm tra các trường cần thiết
    const errors = [];

    if (!document.querySelector('input[formcontrolname="name"]').value) {
      errors.push("Name is required.");
    }

    if (
      !document.querySelector('textarea[formcontrolname="description"]').value
    ) {
      errors.push("Description is required.");
    }

    if (!selectedCategory) {
      errors.push("Category is required.");
    }

    // Nếu có lỗi, hiển thị thông báo
    if (errors.length > 0) {
      errors.forEach((error) => {
        Toast.fire({
          icon: "error",
          title: error,
        });
      });
      return; // Dừng hàm nếu có lỗi
    }

    try {
      // Chuẩn bị dữ liệu attributes
      const attributesData = optionsList.map((option) => ({
        name: option.option,
      }));

      // Chuẩn bị dữ liệu variants
      const variantsData = variants.map((variant) => {
        const variantValues = variant.variant.split(", ");

        // Map các attributes cho mỗi variant
        const attributes = variantValues.map((value, index) => ({
          attribute_name: optionsList[index].option,
          value: value.trim(),
        }));

        return {
          sku: variant.variant.replace(/, /g, "-"),
          price: parseFloat(variant.price) || 0,
          quantity: parseInt(variant.quantity) || 0,
          image: variant.image || null,
          attributes: attributes,
        };
      });

      // Gửi tất cả dữ liệu trong một request
      const response = await templateService.postTemplates({
        name: document.querySelector('input[formcontrolname="name"]').value,
        description: document.querySelector(
          'textarea[formcontrolname="description"]'
        ).value,
        category_id: selectedCategory.value,
        base_price: parseFloat(
          document.querySelector('input[formcontrolname="basePrice"]').value
        ),
        image: imageUrl,
        attributes: attributesData,
        variants: variantsData, // Thêm variants vào request
      });

      if (response.status === 201) {
        console.log("Template created successfully:", response.data);
        Toast.fire({
          icon: "success",
          title: "Template created successfully",
        });
      }
    } catch (error) {
      console.error("Error creating template:", error);
      Toast.fire({
        icon: "error",
        title: "Error creating template",
      });
    }
  };

  const handleRemoveVariant = (variantToRemove) => {
    setVariants(
      variants.filter((variant) => variant.variant !== variantToRemove.variant)
    );
  };

  const handleShowModal = (modalId) => {
    const modal = new Modal(document.getElementById(modalId));
    modal.show();
  };

  return (
    <div className="content-wrapper">
      {/* Content Header (Page header) */}
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Add Product Template</h1>
            </div>
          </div>
        </div>
        {/* /.container-fluid */}
      </section>
      {/* Main content */}
      <section className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  <form noValidate encType="multipart/form-data">
                    {/* Product Name and Base Price */}
                    <div className="row mb-4">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>
                            Product Template Name{" "}
                            <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter product name"
                            formcontrolname="name"
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Base Price</label>
                          <input
                            type="number"
                            className="form-control"
                            min={0}
                            defaultValue={20}
                            placeholder="Enter base price"
                            formcontrolname="basePrice"
                          />
                        </div>
                      </div>
                    </div>
                    {/* Dimensions */}

                    {/* Description */}
                    <div className="form-group mb-4">
                      <label>Description</label>
                      <textarea
                        className="form-control"
                        rows={5}
                        defaultValue={"Update description here"}
                        placeholder="Enter product description"
                        formcontrolname="description"
                      />
                    </div>
                    {/* Category */}
                    <div className="form-group mb-4">
                      <label>Category</label>
                      <Select
                        options={categories.map((category) => ({
                          value: category.id,
                          label: category.name,
                        }))}
                        placeholder="Select a category"
                        onChange={(selected) => setSelectedCategory(selected)}
                      />
                    </div>
                    {/* Product Images */}
                    <div className="form-group mb-4">
                      <label>Product Image URL</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter image URL"
                        value={imageUrl}
                        onChange={handleImageUrlChange}
                      />
                      {imageUrl && (
                        <div className="mt-2">
                          <img
                            src={imageUrl}
                            alt="Product preview"
                            style={{ maxWidth: "200px" }}
                          />
                        </div>
                      )}
                    </div>
                    {/* Size Chart Image */}

                    {/* Options */}
                    <div className="row mb-4">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Option Name</label>
                          <Select
                            options={[
                              { value: "color", label: "Color" },
                              { value: "size", label: "Size" },
                              { value: "type", label: "Type" },
                            ]}
                            placeholder="Select an option name"
                            onChange={handleOptionChange}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Values</label>
                          <Select
                            options={getValuesOptions()}
                            isMulti
                            placeholder="Select values"
                            onChange={(selected) => setSelectedValues(selected)}
                          />
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-success mb-4"
                      onClick={handleAddOption}
                    >
                      Add Option
                    </button>
                    {/* Options Section */}
                    <div className="mt-4">
                      <h3 className="h4">Options</h3>
                      <ul className="list-unstyled">
                        {optionsList.map((item, index) => (
                          <li
                            key={index}
                            className="d-flex justify-content-between align-items-center mb-3"
                          >
                            <div>
                              <strong>{item.option}:</strong>{" "}
                              {item.values.map((v) => v.label).join(", ")}
                              {/* Button trigger modal */}
                              <button
                                type="button"
                                className="btn btn-primary mx-1"
                                data-bs-toggle="modal"
                                data-bs-target={`#add-optionModal${index}`}
                              >
                                Edit
                              </button>
                              {/* Modal */}
                              <div
                                className="modal fade"
                                id={`add-optionModal${index}`}
                                tabIndex={-1}
                                aria-labelledby={`add-optionModalLabel${index}`}
                                aria-hidden="true"
                              >
                                <div className="modal-dialog">
                                  <div className="modal-content">
                                    <div className="modal-header">
                                      <h1
                                        className="modal-title fs-5"
                                        id={`add-optionModalLabel${index}`}
                                      >
                                        Edit {item.option}
                                      </h1>
                                      <button
                                        type="button"
                                        className="btn-close"
                                        data-bs-dismiss="modal"
                                        aria-label="Close"
                                      >
                                        x
                                      </button>
                                    </div>
                                    <div className="modal-body">
                                      <div className="form-group">
                                        <label>Option Name</label>
                                        <Select
                                          value={{
                                            value: item.option.toLowerCase(),
                                            label: item.option,
                                          }}
                                          options={[
                                            { value: "color", label: "Color" },
                                            { value: "size", label: "Size" },
                                            { value: "type", label: "Type" },
                                          ]}
                                          isDisabled={true}
                                        />
                                      </div>

                                      <div className="form-group mt-3">
                                        <label>Values</label>
                                        <Select
                                          isMulti
                                          value={item.values}
                                          options={(() => {
                                            switch (item.option.toLowerCase()) {
                                              case "color":
                                                return COLOR_OPTIONS;
                                              case "size":
                                                return SIZE_OPTIONS;
                                              case "type":
                                                return TYPE_OPTIONS;
                                              default:
                                                return [];
                                            }
                                          })()}
                                          onChange={(selected) => {
                                            const updatedOptionsList = [
                                              ...optionsList,
                                            ];
                                            updatedOptionsList[index] = {
                                              ...updatedOptionsList[index],
                                              values: selected || [],
                                            };
                                            setOptionsList(updatedOptionsList);

                                            // Cập nhật variants
                                            const valuesList =
                                              updatedOptionsList.map((item) =>
                                                item.values.map((v) => v.label)
                                              );
                                            const combinations =
                                              generateCombinations(valuesList);
                                            const newVariants =
                                              combinations.map(
                                                (combination) => ({
                                                  variant:
                                                    combination.join(", "),
                                                  price: "",
                                                  quantity: "",
                                                  image: null,
                                                })
                                              );
                                            setVariants(newVariants);
                                          }}
                                        />
                                      </div>
                                    </div>
                                    <div className="modal-footer">
                                      <button
                                        type="button"
                                        className="btn btn-secondary"
                                        data-bs-dismiss="modal"
                                      >
                                        Close
                                      </button>
                                      <button
                                        data-bs-dismiss="modal"
                                        type="button"
                                        className="btn btn-primary"
                                      >
                                        Save changes
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <button
                                type="button"
                                className={`btn mx-1 ${
                                  imageOptionIndex === index
                                    ? "btn-info"
                                    : "btn-info"
                                }`}
                                onClick={() => toggleImageUpload(index)}
                              >
                                {imageOptionIndex === index
                                  ? "Remove Image"
                                  : "Add Image"}
                              </button>
                              <button
                                type="button"
                                className="btn btn-danger mx-1"
                                onClick={() => handleDeleteOption(index)}
                              >
                                x
                              </button>
                              <div className="mt-2">
                                {imageOptionIndex === index &&
                                  item.values.map((size) => (
                                    <div
                                      key={size.value}
                                      className="d-flex align-items-center mb-2"
                                    >
                                      <span className="mx-1">
                                        {size.label}:
                                      </span>
                                      <div className="d-flex align-items-center me-2">
                                        <input
                                          type="text"
                                          className="form-control"
                                          placeholder="Enter image URL"
                                          value={images[size.label] || ""}
                                          onChange={(e) =>
                                            handleImageUrlVariant(
                                              size.label,
                                              e.target.value
                                            )
                                          }
                                        />
                                        {images[size.label] && (
                                          <img
                                            src={images[size.label]}
                                            alt={size.label}
                                            style={{
                                              width: "100px",
                                              marginLeft: "10px",
                                              borderRadius: "5px",
                                            }}
                                          />
                                        )}
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {/* Variants Section */}
                    <div className="mt-4">
                      {/* <h3 className="h4 mb-4">
                        Variant Combinations. Current SKUs:
                        <span className="text-danger">6</span>
                        (Max 300 SKUs)
                      </h3> */}
                      <button
                        type="button"
                        className="btn btn-primary mb-4"
                        data-bs-toggle="modal"
                        data-bs-target="#add-bulk-price-modal"
                      >
                        Set Bulk Price
                      </button>

                      <div
                        className="modal fade"
                        id="add-bulk-price-modal"
                        data-bs-backdrop="static"
                        data-bs-keyboard="false"
                        tabIndex="-1"
                        aria-labelledby="add-bulk-price-modal-label"
                        aria-hidden="true"
                      >
                        <div className="modal-dialog">
                          <div className="modal-content">
                            <div className="modal-header">
                              <h5
                                className="modal-title"
                                id="add-bulk-price-modal-label"
                              >
                                Set Bulk Price and Quantity
                              </h5>
                              <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                              >
                                x
                              </button>
                            </div>
                            <div className="modal-body">
                              <p>
                                Hold Ctrl (Windows) or Cmd (Mac) to select
                                multiple options
                              </p>
                              {optionsList.map((item, index) => (
                                <div key={index}>
                                  <label>{item.option}</label>
                                  <select
                                    multiple
                                    className="form-control"
                                    onChange={(e) =>
                                      handleBulkSelect(
                                        item.option,
                                        Array.from(
                                          e.target.selectedOptions,
                                          (option) => option.value
                                        )
                                      )
                                    }
                                  >
                                    {item.values.map((value) => (
                                      <option
                                        key={value.value}
                                        value={value.label}
                                      >
                                        {value.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              ))}

                              <div>
                                <label>Set New Price</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Enter new price"
                                  value={newPrice}
                                  onChange={(e) => setNewPrice(e.target.value)}
                                />
                              </div>
                              <div>
                                <label>Set New Quantity</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Enter quantity"
                                  value={newQuantity}
                                  onChange={(e) =>
                                    setNewQuantity(e.target.value)
                                  }
                                />
                              </div>
                            </div>
                            <div className="modal-footer">
                              <button
                                type="button"
                                className="btn btn-secondary"
                                data-bs-dismiss="modal"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleApply}
                              >
                                Apply
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="table-responsive">
                        <table className="table table-bordered">
                          <thead className="bg-light">
                            <tr>
                              <th>Variant</th>
                              <th>Image</th>
                              <th>Price</th>
                              <th>Quantity</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {variants.map((variant, index) => (
                              <tr key={index}>
                                <td>{variant.variant}</td>
                                <td>
                                  {variant.image ? (
                                    <img
                                      src={variant.image}
                                      alt={variant.variant}
                                      style={{
                                        width: "50px",
                                        height: "50px",
                                        objectFit: "cover",
                                      }}
                                    />
                                  ) : (
                                    "No image"
                                  )}
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    className="form-control"
                                    defaultValue={20}
                                    value={variant.price}
                                    onChange={(e) =>

                                      setVariants(
                                        variants.map((v) =>
                                          v.variant === variant.variant
                                            ? { ...v, price: e.target.value }
                                            : v
                                        )
                                      )
                                    }
                                  />
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    className="form-control"
                                    defaultValue={100}
                                    value={variant.quantity}
                                    onChange={(e) =>
                                      setVariants(
                                        variants.map((v) =>
                                          v.variant === variant.variant
                                            ? { ...v, quantity: e.target.value }
                                            : v
                                        )
                                      )
                                    }
                                  />
                                </td>
                                <td>
                                  <button
                                    type="button"
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleRemoveVariant(variant)}
                                  >
                                    Remove
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="btn btn-success btn-block"
                      onClick={handleSubmit}
                    >
                      Create Product Template
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* /.container-fluid */}
      </section>
      {/* /.content */}
    </div>
  );
}
