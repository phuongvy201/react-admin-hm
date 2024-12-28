import React, { useEffect, useState } from "react";
import Select from "react-select";
import categoryService from "../../../services/categoryService";
import templateService from "../../../services/templateService";
import {
  COLOR_OPTIONS,
  SIZE_OPTIONS,
  TYPE_OPTIONS,
} from "../../../constants/productConstants";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

const renderSelect = (options, placeholder, setNewOptionValues) => (
  <Select
    options={options.map((option) => ({
      value: option.value,
      label: option.label || option.value,
    }))}
    isMulti
    placeholder={placeholder}
    onChange={(selectedOptions) => {
      const values = selectedOptions.map((option) => option.value).join(", ");
      setNewOptionValues(values);
    }}
  />
);

export default function AddTemplate() {
  const [categories, setCategories] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [options, setOptions] = useState([]);
  const [newOptionName, setNewOptionName] = useState(null);
  const [newOptionValues, setNewOptionValues] = useState("");
  const [colorImages, setColorImages] = useState({});
  const [variants, setVariants] = useState([]);
  const [selectedOptionType, setSelectedOptionType] = useState(null);
  const [templateName, setTemplateName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getFlatCategories();
        const categoryOptions = response.data.data.map((category) => ({
          value: category.id,
          label: category.name,
        }));
        setCategories(categoryOptions);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFiles([file]);
    }
  };

  const removeFile = (fileToRemove) => {
    setSelectedFiles((prevFiles) =>
      prevFiles.filter((file) => file !== fileToRemove)
    );
  };
  const handleImageLinkChange = (event) => {
    const link = event.target.value;
    setSelectedFiles([link]);
  };

  const renderSelectedFiles = () => {
    return selectedFiles.map((file, index) => (
      <div
        key={index}
        style={{
          position: "relative",
          width: "120px",
          height: "120px",
          border: "2px solid #ddd",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <img
          src={URL.createObjectURL(file)}
          alt="preview"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <button
          onClick={() => removeFile(file)}
          style={{
            position: "absolute",
            top: "5px",
            right: "5px",
            background: "rgba(255, 255, 255, 0.8)",
            border: "none",
            borderRadius: "50%",
            width: "25px",
            height: "25px",
            fontSize: "18px",
            color: "#ff4444",
            cursor: "pointer",
          }}
        >
          ×
        </button>
      </div>
    ));
  };

  const addOption = () => {
    if (newOptionName && newOptionValues) {
      const valuesArray = newOptionValues
        .split(",")
        .map((value) => value.trim());

      // Tạo một đối tượng cho option mới
      const newOption = {
        name: newOptionName.label,
        values: valuesArray,
        price: [], // Giá mặc định
        image: [], // Hình ảnh mặc định
      };

      setOptions((prevOptions) => [...prevOptions, newOption]);

      setNewOptionName(null);
      setNewOptionValues([]);
      createVariants(newOptionName.label, valuesArray);
      console.log(newOption);
      setSelectedOptionType(null); // Đặt lại loại tùy chọn
    }
  };

  const createVariants = (optionName, values) => {
    const newVariants = values.map((value) => ({
      variant: `${optionName} / ${value}`,
      price: optionName.toLowerCase() === "size" ? 100 : "",
      quantity: 100,
      image:
        optionName.toLowerCase() === "color" ? colorImages[value] || "" : "",
    }));
    setVariants((prevVariants) => [...prevVariants, ...newVariants]);
  };

  const handleColorImageUpload = (variantName, index) => (event) => {
    const file = event.target.files[0];
    if (file) {
      const newImage = URL.createObjectURL(file);
      setVariants((prevVariants) =>
        prevVariants.map((v, i) =>
          i === index ? { ...v, image: newImage } : v
        )
      );
    }
  };

  const removeVariant = (index) => {
    setVariants((prevVariants) => prevVariants.filter((_, i) => i !== index));
  };
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      // Validate dữ liệu đầu vào
      if (!templateName || !description || !selectedCategory) {
        toast.error("Vui lòng điền đầy đủ thông tin cơ bản");
        return;
      }

      if (selectedFiles.length === 0) {
        toast.error("Vui lòng chọn ảnh cho template");
        return;
      }

      if (variants.length === 0) {
        toast.error("Vui lòng thêm ít nhất một biến thể");
        return;
      }

      // Tạo FormData object
      const formData = new FormData();

      // Thêm thông tin cơ bản
      formData.append("template_name", templateName);
      formData.append("description", description);
      formData.append("category_id", selectedCategory.value);

      // Thêm ảnh chính của template
      if (selectedFiles) {
        formData.append("image", selectedFiles[0]);
      }

      // Xử lý và thêm các biến thể
      for (const [index, variant] of variants.entries()) {
        try {
          const [name, value] = variant.variant
            .split("/")
            .map((part) => part.trim());

          formData.append(`template_values[${index}][name]`, name);
          formData.append(`template_values[${index}][value]`, value);

          // Thêm mã màu nếu variant là color
          if (name.toLowerCase() === "color") {
            const colorOption = COLOR_OPTIONS.find(
              (color) => color.value === value
            );
            if (colorOption) {
              formData.append(
                `template_values[${index}][value_color]`,
                colorOption.color
              );
            }
          }

          // Thêm giá bổ sung
          const additionalPrice = variant.price || 0;
          formData.append(
            `template_values[${index}][additional_price]`,
            additionalPrice
          );

          // Xử lý ảnh của biến thể
          if (variant.image) {
            // Append URL trực tiếp vào formData
            formData.append(
              `template_values[${index}][image_url]`,
              variant.image
            );
          }
        } catch (error) {
          console.error(`Error processing variant ${index}:`, error);
          toast.error(`Lỗi xử lý biến thể ${index + 1}`);
          return;
        }
      }

      // Log để kiểm tra dữ liệu trước khi gửi
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      // Gửi request
      const response = await templateService.postTemplates(formData);

      // Xử lý kết quả
      if (response.data) {
        Toast.fire({
          icon: "success",
          title: "Tạo template thành công!",
        });
        // Reset form
        setTemplateName("");
        setDescription("");
        setSelectedCategory(null);
        setSelectedFiles([]);
        setVariants([]);

        // Chuyển hướng về trang danh sách template (nếu cần)
        // navigate('/templates');
      }
    } catch (error) {
      console.error("Error creating template:", error);
      Toast.fire({
        icon: "error",
        title: "Có lỗi xảy ra khi tạo template",
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
              <h1>Create Template</h1>
            </div>
          </div>
        </div>
      </section>
      {/* Main content */}
      <section className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  <form
                    noValidate
                    encType="multipart/form-data"
                    onSubmit={handleSubmit}
                  >
                    {/* Product Name and Base Price */}
                    <div className="row mb-4">
                      <div className="col-md-12">
                        <div className="form-group">
                          <label>Product Template Name</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter product name"
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)} // Sử dụng onChange
                            formcontrolname="name"
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
                        placeholder="Enter product description"
                        formcontrolname="description"
                        defaultValue={""}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)} // Sử dụng onChange
                      />
                    </div>
                    {/* Category */}
                    <div className="form-group mb-4">
                      <label>Category</label>
                      <Select
                        options={categories}
                        value={selectedCategory}
                        onChange={setSelectedCategory}
                        placeholder="Search or select a category"
                        isClearable
                      />
                    </div>
                    {/* Product Images */}
                    <div className="form-group mb-4">
                      <label>Product Image (Paste image URL)</label>
                      <input
                        type="text"
                        className="form-control"
                        
                        placeholder="Paste image URL here"
                        onChange={handleImageLinkChange}
                      />
                      <div
                        id="imagePreview"
                        className="text-center text-muted mt-2"
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "10px",
                        }}
                      >
                        {selectedFiles.map((file, index) => (
                          <div
                            key={index}
                            style={{
                              position: "relative",
                              width: "120px",
                              height: "120px",
                              border: "2px solid #ddd",
                              borderRadius: "8px",
                              overflow: "hidden",
                            }}
                          >
                            <img
                              src={file}
                              alt="preview"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                            <button
                              onClick={() => removeFile(file)}
                              style={{
                                position: "absolute",
                                top: "5px",
                                right: "5px",
                                background: "rgba(255, 255, 255, 0.8)",
                                border: "none",
                                borderRadius: "50%",
                                width: "25px",
                                height: "25px",
                                fontSize: "18px",
                                color: "#ff4444",
                                cursor: "pointer",
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Size Chart Image */}
                    {/* <div className="form-group mb-4">
                      <label>Size Chart Image</label>
                      <div className="input-group">
                        <input
                          type="file"
                          className="d-none"
                          accept="image/*"
                          id="sizeChartInput"
                          onChange={handleSizeChartSelect}
                        />
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() =>
                            document.getElementById("sizeChartInput").click()
                          }
                        >
                          Select Size Chart Image
                        </button>
                        <span className="ml-2 align-middle" id="sizeChartName">
                          {sizeChartName}
                        </span>
                      </div>
                      <div
                        id="sizeChartPreview"
                        className="text-center text-muted mt-2"
                      >
                        {renderSizeChartPreview()}
                      </div>
                    </div> */}
                    {/* Product Video */}
                    {/* <div className="form-group mb-4">
                      <label>Product Video (MP4, max 10MB)</label>
                      <div className="input-group">
                        <input
                          type="file"
                          className="d-none"
                          accept="video/mp4"
                        />
                        <button type="button" className="btn btn-primary">
                          Select Video
                        </button>
                        <span className="ml-2 align-middle">
                          No file selected
                        </span>
                      </div>
                    </div> */}
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
                            value={newOptionName}
                            onChange={(selectedOption) => {
                              setNewOptionName(selectedOption);
                              setSelectedOptionType(selectedOption.value);
                              setNewOptionValues("");
                            }}
                            placeholder="Select an option name"
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Values</label>
                          {selectedOptionType === "color" ? (
                            renderSelect(
                              COLOR_OPTIONS,
                              "Select colors",
                              setNewOptionValues
                            )
                          ) : selectedOptionType === "size" ? (
                            renderSelect(
                              SIZE_OPTIONS,
                              "Select sizes",
                              setNewOptionValues
                            )
                          ) : selectedOptionType === "type" ? (
                            renderSelect(
                              TYPE_OPTIONS,
                              "Select types",
                              setNewOptionValues
                            )
                          ) : (
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Select an option name first"
                              disabled
                            />
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-success mb-4"
                      onClick={addOption}
                    >
                      Add Option
                    </button>
                    {/* Options Section */}
                    {/* <div className="mt-4">
                      <h3 className="h5">Options</h3>
                      <ul className="list-unstyled">
                        {options.map((option, index) => (
                          <li
                            key={index}
                            className="d-flex justify-content-between align-items-center mb-3"
                          >
                            <div>
                              <strong>{option.name}:</strong>{" "}
                              {option.values.join(", ")}
                            </div>
                            <div>
                              <button type="button" className="btn btn-primary">
                                Edit
                              </button>
                              <button
                                type="button"
                                className="btn btn-primary mx-2"
                              >
                                Add Images
                              </button>
                              <button type="button" className="btn btn-danger">
                                ×
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div> */}
                    {/* Variants Section */}
                    <div className="mt-4">
                      <div className="table-responsive">
                        <table className="table table-bordered">
                          <thead className="bg-light">
                            <tr>
                              <th>Variant</th>
                              <th>Price/Image</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {variants.map((variant, index) => (
                              <tr key={index}>
                                <td>{variant.variant}</td>
                                <td>
                                  {variant.variant
                                    .toLowerCase()
                                    .includes("color") ? (
                                    <>
                                      <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Paste image URL here"
                                        value={variant.image || ""}
                                        onChange={(e) => {
                                          const newImageLink = e.target.value;
                                          setVariants((prevVariants) =>
                                            prevVariants.map((v, i) =>
                                              i === index
                                                ? { ...v, image: newImageLink }
                                                : v
                                            )
                                          );
                                        }}
                                      />
                                      {variant.image && (
                                        <img
                                          src={variant.image}
                                          alt="Variant"
                                          style={{
                                            objectFit: "cover",
                                            marginTop: "10px",
                                            width: "50px",
                                            height: "50px",
                                            marginLeft: "10px",
                                          }}
                                        />
                                      )}
                                    </>
                                  ) : (
                                    <input
                                      type="number"
                                      className="form-control"
                                      value={variant.price}
                                      onChange={(e) => {
                                        const newPrice = e.target.value;
                                        setVariants((prevVariants) =>
                                          prevVariants.map((v, i) =>
                                            i === index
                                              ? { ...v, price: newPrice }
                                              : v
                                          )
                                        );
                                      }}
                                    />
                                  )}
                                </td>

                                <td>
                                  <button
                                    type="button"
                                    className="btn btn-danger btn-sm"
                                    onClick={() => removeVariant(index)}
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
                    <button type="submit" className="btn btn-success btn-block">
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
