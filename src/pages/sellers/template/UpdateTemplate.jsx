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
import { useParams } from "react-router-dom";
import { Modal } from "bootstrap";
import { urlImage } from "../../../config";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

export default function UpdateTemplate() {
  const { id } = useParams();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedValues, setSelectedValues] = useState([]);
  const [template, setTemplate] = useState(null);
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
  const [loading, setLoading] = useState(false);

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
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch template details
        const templateResponse = await templateService.getTemplate(id);
        const templateData = templateResponse.data.data;
        console.log("templateData", templateData);
        setTemplate(templateData);
        setImageUrl(templateData.image || "");

        // Set selected category
        setSelectedCategory({
          value: templateData.category.id,
          label: templateData.category.name,
        });

        setSelectedFiles(templateData.images || []);

        // Format options list từ attributes
        const formattedOptions = templateData.attributes.map((attr) => ({
          option: attr.name,
          values: attr.values.map((value) => ({
            value: value.value,
            label: value.value,
          })),
        }));
        setOptionsList(formattedOptions);

        // Tạo map của variants hiện có để dễ truy cập
        const existingVariantsMap = templateData.variants.reduce(
          (acc, variant) => {
            const variantKey = variant.attributes
              .map((attr) => attr.value)
              .sort() // Sắp xếp để đảm bảo thứ tự nhất quán
              .join(", ");
            acc[variantKey] = variant; // Lưu variant với hình ảnh
            return acc;
          },
          {}
        );

        // Tạo tất cả combinations có thể từ options
        const valuesList = formattedOptions.map((item) =>
          item.values.map((v) => v.label)
        );
        const combinations = generateCombinations(valuesList);

        // Tạo variants mới với dữ liệu từ existing variants nếu có
        const newVariants = combinations.map((combination) => {
          // Sắp xếp combination để đảm bảo thứ tự nhất quán
          const sortedCombination = combination.sort();
          const variantKey = sortedCombination.join(", ");
          const existingVariant = existingVariantsMap[variantKey];

          console.log("existingVariant", existingVariant); // Kiểm tra giá trị của existingVariant

          // Tìm kiếm trong dữ liệu mới để lấy thông tin chính xác
          const newVariantData = templateData.variants.find((variant) => {
            // Tách sku thành các phần và sắp xếp
            const sortedSkuParts = variant.sku.split("-").sort().join("-");
            // Tạo variantKey từ combination và sắp xếp
            const sortedVariantKeyParts = sortedCombination.join("-");

            return sortedSkuParts === sortedVariantKeyParts;
          });

          return {
            variant: variantKey,
            sku: existingVariant?.sku || variantKey.replace(/, /g, "-"),
            price: newVariantData?.price || "",
            quantity: newVariantData?.quantity || "",
            image: existingVariant?.image || "", // Đảm bảo lấy hình ảnh từ existingVariant
          };
        });

        setVariants(newVariants);
        console.log("newVariants", newVariants);

        // Fetch categories
        const categoriesResponse = await categoryService.getFlatCategories();
        setCategories(categoriesResponse.data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        Toast.fire({
          icon: "error",
          title: "Error loading template data",
        });
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);
  console.log("variants", variants);
  const handleImageUrlChange = (event) => {
    setImageUrl(event.target.value);
  };

  const handleImageUrlVariant = (key, url) => {
    setImages((prev) => ({
      ...prev,
      [key]: url,
    }));

    setVariants((prevVariants) =>
      prevVariants.map((variant) => {
        // Kiểm tra xem variant có chứa key không
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

      // Tạo map của variants cũ
      const existingVariantsMap = variants.reduce((acc, variant) => {
        acc[variant.variant] = variant;
        return acc;
      }, {});

      const newVariants = combinations.map((combination) => {
        // Sắp xếp combination để đảm bảo thứ tự nhất quán
        const sortedCombination = combination.sort();
        const variantKey = sortedCombination.join(", ");
        const existingVariant = existingVariantsMap[variantKey];

        console.log("existingVariant", existingVariant);

        // Tìm kiếm trong dữ liệu mới để lấy thông tin chính xác
        const newVariantData = template?.variants.find((variant) => {
          // Tách sku thành các phần và sắp xếp
          const sortedSkuParts = variant.sku.split("-").sort().join("-");
          // Tạo variantKey từ combination và sắp xếp
          const sortedVariantKeyParts = sortedCombination.join("-");

          return sortedSkuParts === sortedVariantKeyParts;
        });

        return {
          variant: variantKey,
          id: existingVariant?.id || null,
          sku:
            existingVariant?.sku ||
            variantKey.replace(/, /g, "-").toLowerCase(),
          price: existingVariant?.price || "",
          quantity: existingVariant?.quantity || "",
          image: existingVariant?.image || images[variantKey] || null,
        };
      });

      setVariants(newVariants);

      setSelectedOption(null);
      setSelectedValues([]);
    }
  };

  const handleImageUpload = (event) => {
    const newFiles = Array.from(event.target.files);
    if (selectedFiles.length + newFiles.length > 8) {
      Toast.fire({
        icon: "error",
        title: "You can only upload a maximum of 8 images.",
      });
      return;
    }
    setLoading(true);
    setSelectedFiles((prevFiles) => [...prevFiles, ...newFiles]);
    event.target.value = ""; // Reset giá trị của input file
    setLoading(false);
  };
  const handleRemoveImage = (index) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
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

  const handleRemoveVariant = (variantToRemove) => {
    setVariants(
      variants.filter((variant) => variant.variant !== variantToRemove.variant)
    );
  };

  const handleShowModal = (modalId) => {
    const modal = new Modal(document.getElementById(modalId));
    modal.show();
  };

  const getImageSource = (file) => {
    if (file instanceof File) {
      return URL.createObjectURL(file); // Trường hợp file mới upload
    } else if (file && file.url) {
      return urlImage + file.url; // Trường hợp ảnh từ server có file.url
    }
    return ""; // Trường hợp không hợp lệ
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Chuẩn bị dữ liệu attributes sử dụng forEach
      const attributes = [];
      optionsList.forEach((option) => {
        const values = [];
        option.values.forEach((v) => {
          values.push({
            value: v.label,
          });
        });

        attributes.push({
          name: option.option,
          values: values,
        });
      });

      // Chuẩn bị dữ liệu variants
      const formattedVariants = variants.map((variant) => {
        // Tách các thuộc tính từ chuỗi variant
        const attributeValues = variant.variant.split(", ").map((value) => {
          // Tìm tên thuộc tính tương ứng với giá trị
          const attributeName = optionsList.find((opt) =>
            opt.values.some((v) => v.label === value)
          )?.option;

          return {
            attribute_name: attributeName,
            value: value,
          };
        });

        // Chuẩn hóa SKU bằng cách sắp xếp các phần
        const sortedSkuParts = variant.sku.split("-").sort().join("-");

        return {
          sku: sortedSkuParts, // Sử dụng SKU đã được chuẩn hóa
          price: variant.price || 0,
          quantity: variant.quantity || 0,
          image: variant.image,
          attributes: attributeValues,
        };
      });

      // Tạo FormData để upload files
      const formData = new FormData();
      formData.append("name", template.name);
      formData.append("description", template.description);
      formData.append("category_id", selectedCategory.value);
      formData.append("base_price", template.base_price);

      // Thêm attributes và values theo cấu trúc mới
      attributes.forEach((attribute, index) => {
        formData.append(`attributes[${index}][name]`, attribute.name);
        attribute.values.forEach((value, valueIndex) => {
          formData.append(
            `attributes[${index}][values][${valueIndex}][value]`,
            value.value
          );
        });
      });

      // Thêm variants với việc phân tách dữ liệu
      formattedVariants.forEach((variant, index) => {
        formData.append(`variants[${index}][sku]`, variant.sku);
        formData.append(`variants[${index}][image]`, variant.image || "");

        // Phân tách giá và số lượng
        formData.append(`variants[${index}][price]`, variant.price);
        formData.append(`variants[${index}][quantity]`, variant.quantity);
        formData.append(`variants[${index}][image]`, variant.image || "");

        variant.attributes.forEach((attr, attrIndex) => {
          formData.append(
            `variants[${index}][attributes][${attrIndex}][attribute_name]`,
            attr.attribute_name
          );
          formData.append(
            `variants[${index}][attributes][${attrIndex}][value]`,
            attr.value
          );
        });
      });

      // Thêm các file ảnh mới
      selectedFiles.forEach((file, index) => {
        if (file instanceof File) {
          formData.append(`images[${index}]`, file);
        } else {
          formData.append(`images[${index}]`, file.url);
        }
      });

      const response = await templateService.updateTemplate(id, formData);

      if (response.data.success) {
        Toast.fire({
          icon: "success",
          title: "Template updated successfully",
        });
      }
    } catch (error) {
      console.error("Error updating template:", error);
      Toast.fire({
        icon: "error",
        title: error.response?.data?.message || "Error updating template",
      });
    }
  };

  return (
    <div className="content-wrapper">
      {/* Content Header (Page header) */}
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Update Product Template</h1>
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
                    {/* Product Name */}
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
                            defaultValue={template?.name}
                            onChange={(e) =>
                              setTemplate((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Base Price</label>
                          <input
                            type="number"
                            className="form-control"
                            placeholder="Enter base price"
                            defaultValue={template?.base_price}
                            onChange={(e) =>
                              setTemplate((prev) => ({
                                ...prev,
                                base_price: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="form-group mb-4">
                      <label>Description</label>
                      <CKEditor
                        editor={ClassicEditor}
                        data={template?.description}
                        onChange={(event, editor) => {
                          const data = editor.getData();
                          setTemplate((prev) => ({
                            ...prev,
                            description: data,
                          }));
                        }}
                        config={{
                          placeholder: "Enter product description",
                        }}
                      />
                    </div>

                    {/* Category */}
                    <div className="form-group mb-4">
                      <label>
                        Category <span className="text-danger">*</span>
                      </label>
                      <Select
                        options={categories.map((category) => ({
                          value: category.id,
                          label: category.name,
                        }))}
                        value={selectedCategory}
                        placeholder="Select a category"
                        onChange={(selected) => setSelectedCategory(selected)}
                      />
                    </div>

                    {/* Product Image */}
                    <div className="form-group mb-4">
                      <label>Product Images (max 8 images)</label>
                      <div className="input-group">
                        <input
                          type="file"
                          className="d-none"
                          accept="image/*"
                          multiple
                          id="fileInput"
                          onChange={(e) => handleImageUpload(e)}
                        />
                        <button
                          type="button"
                          className="btn btn-primary"
                          id="selectButton"
                          onClick={() =>
                            document.getElementById("fileInput").click()
                          }
                        >
                          Select Images
                        </button>
                        <span className="ml-2 align-middle" id="fileCount">
                          {selectedFiles.length} files selected
                        </span>
                      </div>
                      <div
                        id="imagePreview"
                        className="text-center text-muted mt-2"
                      >
                        {loading ? (
                          <div>Loading...</div>
                        ) : selectedFiles.length > 0 ? (
                          selectedFiles.map((file, index) => (
                            <div
                              key={index}
                              className="position-relative d-inline-block"
                            >
                              <img
                                src={getImageSource(file)}
                                alt={`preview-${index}`}
                                style={{
                                  width: "100px",
                                  height: "100px",
                                  objectFit: "cover",
                                  margin: "5px",
                                }}
                              />
                              <button
                                type="button"
                                className="btn btn-danger btn-sm position-absolute"
                                style={{ top: 0, right: 0 }}
                                onClick={() => handleRemoveImage(index)}
                              >
                                <i className="fa-solid fa-circle-xmark"></i>
                              </button>
                            </div>
                          ))
                        ) : (
                          "No images uploaded yet."
                        )}
                      </div>
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
                            defaultValue={template?.attributes}
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
                            defaultValue={template?.attributes}
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
                                onClick={() =>
                                  handleShowModal(`update-optionModal${index}`)
                                }
                              >
                                Edit
                              </button>
                              {/* Modal */}
                              <div
                                className="modal fade"
                                id={`update-optionModal${index}`}
                                tabIndex={-1}
                                aria-labelledby={`update-optionModalLabel${index}`}
                                aria-hidden="true"
                              >
                                <div className="modal-dialog">
                                  <div className="modal-content">
                                    <div className="modal-header">
                                      <h1
                                        className="modal-title fs-5"
                                        id={`update-optionModalLabel${index}`}
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

                                            // Cập nhật variants với việc giữ lại thông tin cũ
                                            const valuesList =
                                              updatedOptionsList.map((item) =>
                                                item.values.map((v) => v.label)
                                              );
                                            const combinations =
                                              generateCombinations(valuesList);

                                            // Tạo map của variants cũ để dễ truy cập
                                            const existingVariantsMap =
                                              variants.reduce(
                                                (acc, variant) => {
                                                  acc[variant.variant] =
                                                    variant;
                                                  return acc;
                                                },
                                                {}
                                              );

                                            const newVariants =
                                              combinations.map(
                                                (combination) => {
                                                  const variantKey =
                                                    combination.join(", ");
                                                  const existingVariant =
                                                    existingVariantsMap[
                                                      variantKey
                                                    ];

                                                  return {
                                                    variant: variantKey,
                                                    id:
                                                      existingVariant?.id ||
                                                      null,
                                                    sku:
                                                      existingVariant?.sku ||
                                                      variantKey
                                                        .replace(/, /g, "-")
                                                        .toLowerCase(),
                                                    price:
                                                      existingVariant?.price ||
                                                      "",
                                                    quantity:
                                                      existingVariant?.quantity ||
                                                      "",
                                                    image:
                                                      existingVariant?.image ||
                                                      null,
                                                  };
                                                }
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
                                        <input
                                          type="file"
                                          className="form-control d-none"
                                          accept="image/*"
                                          onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                              const reader = new FileReader();
                                              reader.onloadend = () => {
                                                handleImageUrlVariant(
                                                  size.label,
                                                  reader.result
                                                );
                                              };
                                              reader.readAsDataURL(file);
                                            }
                                          }}
                                          id={`fileInput-${size.label}`}
                                          data-label={size.label}
                                        />
                                        <label
                                          className="btn btn-sm btn-primary mx-2"
                                          htmlFor={`fileInput-${size.label}`}
                                        >
                                          Upload Image
                                        </label>
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
                        onClick={() =>
                          handleShowModal("update-bulk-price-modal")
                        }
                      >
                        Set Bulk Price
                      </button>

                      <div
                        className="modal fade"
                        id="update-bulk-price-modal"
                        data-bs-backdrop="static"
                        data-bs-keyboard="false"
                        tabIndex="-1"
                        aria-labelledby="update-bulk-price-modal-label"
                        aria-hidden="true"
                      >
                        <div className="modal-dialog">
                          <div className="modal-content">
                            <div className="modal-header">
                              <h5
                                className="modal-title"
                                id="update-bulk-price-modal-label"
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
                                <td>
                                  {variant.variant.split(", ").join(", ")}
                                </td>
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
                                    <span className="text-muted">No image</span>
                                  )}
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    className="form-control"
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
                                    placeholder="Enter price"
                                  />
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    className="form-control"
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
                                    placeholder="Enter quantity"
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
                      Update Product Template
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
