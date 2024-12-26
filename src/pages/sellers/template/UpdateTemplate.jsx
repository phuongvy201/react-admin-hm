import React, { useEffect, useState } from "react";
import Select from "react-select";
import categoryService from "../../../services/categoryService";
import templateService from "../../../services/templateService";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { urlImage } from "../../../config";
import Swal from "sweetalert2";
const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});
export default function UpdateTemplate() {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [options, setOptions] = useState([]);
  const [newOptionName, setNewOptionName] = useState(null);
  const [newOptionValues, setNewOptionValues] = useState("");
  const [colorImages, setColorImages] = useState({});
  const [variants, setVariants] = useState([]);
  const [selectedOptionType, setSelectedOptionType] = useState(null);
  const [templateName, setTemplateName] = useState("");
  const [description, setDescription] = useState("");
  const [originalImageUrl, setOriginalImageUrl] = useState("");

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
        toast.error("Không thể tải danh sách danh mục");
      }
    };

    fetchCategories();
  }, []);
  const addVariant = (name, value, price = 0, image = "") => {
    setVariants((prevVariants) => [
      ...prevVariants,
      {
        id: null, // ID sẽ là null cho biến thể mới
        variant: `${name} / ${value}`,
        price: price,
        image: image,
        newImage: null, // Để lưu file mới nếu có
      },
    ]);
  };
  useEffect(() => {
    const fetchTemplateData = async () => {
      try {
        setIsLoading(true);
        const response = await templateService.getTemplate(id);
        const template = response.data.data;

        // Cập nhật thông tin cơ bản
        setTemplateName(template.template_name);
        setDescription(template.description);
        setSelectedCategoryId(template.category_id);

        // Cập nhật selected category
        if (categories.length > 0) {
          const categoryOption = categories.find(
            (cat) => cat.value === template.category_id
          );
          console.log("Found category:", categoryOption); // Debug
          if (categoryOption) {
            setSelectedCategory(categoryOption);
          }
        }

        // Xử lý ảnh template
        if (template.image) {
          setOriginalImageUrl(urlImage + template.image);
          setSelectedFiles([urlImage + template.image]); // Sử dụng urlImage
        }

        // Xử lý template values
        const processedVariants = [];
        const groupedOptions = new Map();

        // Nhóm các template values theo name
        template.template_values.forEach((value) => {
          // Thêm vào groupedOptions để tạo options
          if (!groupedOptions.has(value.name)) {
            groupedOptions.set(value.name, []);
          }
          groupedOptions.get(value.name).push(value.value);

          // Tạo variant với đầy đủ thông tin
          processedVariants.push({
            id: value.id,
            variant: `${value.name} / ${value.value}`,
            price: value.additional_price,
            image: value.image_url ? urlImage + value.image_url : "",
            originalImage: value.image_url, // Lưu đường dẫn ảnh gốc
          });
        });

        // Cập nhật options
        const newOptions = Array.from(groupedOptions).map(([name, values]) => ({
          name,
          values,
        }));
        setOptions(newOptions);

        // Cập nhật variants
        setVariants(processedVariants);
      } catch (error) {
        console.error("Error fetching template:", error);
        toast.error("Không thể tải thông tin template");
      } finally {
        setIsLoading(false);
      }
    };

    if (id && categories.length > 0) {
      fetchTemplateData();
    }
  }, [id, categories]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFiles([file]);
      setOriginalImageUrl(""); // Xóa URL ảnh gốc khi có file mới
    }
  };

  const removeFile = (fileToRemove) => {
    setSelectedFiles([]);
    setOriginalImageUrl("");
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
          src={file instanceof File ? URL.createObjectURL(file) : file}
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

  const handleColorImageUpload = (variantName, index) => async (event) => {
    const file = event.target.files[0];
    if (file) {
      setVariants((prevVariants) =>
        prevVariants.map((v, i) =>
          i === index
            ? {
                ...v,
                image: URL.createObjectURL(file),
                newImage: file, // Lưu file mới để sử dụng khi submit
              }
            : v
        )
      );
    }
  };

  const removeVariant = (index) => {
    setVariants((prevVariants) => prevVariants.filter((_, i) => i !== index));
  };
  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("template_name", templateName);
    formData.append("description", description);
    formData.append("category_id", selectedCategoryId);

    if (selectedFiles.length > 0) {
      formData.append("image", selectedFiles[0]);
    }

    variants.forEach((variant, index) => {
      formData.append(`template_values[${index}][id]`, variant.id || "");
      formData.append(
        `template_values[${index}][name]`,
        variant.variant.split(" / ")[0]
      );
      formData.append(
        `template_values[${index}][value]`,
        variant.variant.split(" / ")[1]
      );
      formData.append(
        `template_values[${index}][additional_price]`,
        variant.price || 0
      );

      if (variant.newImage) {
        formData.append(
          `template_values[${index}][image_url]`,
          variant.newImage
        );
      }
    });

    // Gửi formData đến backend
    const response = await templateService.updateTemplate(id, formData);
    // Xử lý phản hồi từ server
    if (response.data.success) {
      Toast.fire({
        icon: "success",
        title: "Cập nhật template thành công!",
      });
      toast.success("Cập nhật template thành công!"); // Thêm thông báo thành công
    }
  };

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Cập nhật Template</h1>
            </div>
          </div>
        </div>
      </section>

      <section className="content">
        <div className="container-fluid">
          {isLoading ? (
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Đang tải...</span>
              </div>
            </div>
          ) : (
            <div className="row">
              <div className="col-12">
                <div className="card">
                  <div className="card-body">
                    <form onSubmit={handleSubmit}>
                      {/* Template Name */}
                      <div className="row mb-4">
                        <div className="col-md-12">
                          <div className="form-group">
                            <label>Tên Template</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Nhập tên template"
                              value={templateName}
                              onChange={(e) => setTemplateName(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="form-group mb-4">
                        <label>Mô tả</label>
                        <textarea
                          className="form-control"
                          rows={5}
                          placeholder="Nhập mô tả template"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                        />
                      </div>

                      {/* Category */}
                      <div className="form-group mb-4">
                        <label>Danh mục</label>
                        <Select
                          options={categories}
                          value={selectedCategory}
                          onChange={setSelectedCategory}
                          placeholder="Tìm hoặc chọn danh mục"
                          isClearable
                        />
                      </div>

                      {/* Current Image Preview */}
                      <div className="form-group mb-4">
                        <label>Ảnh Template</label>
                        <div className="input-group">
                          <input
                            type="file"
                            className="d-none"
                            accept="image/*"
                            id="fileInput"
                            onChange={handleFileSelect}
                          />
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() =>
                              document.getElementById("fileInput").click()
                            }
                          >
                            Chọn ảnh
                          </button>
                          <span className="ml-2 align-middle">
                            {selectedFiles.length === 0
                              ? "Chưa chọn ảnh"
                              : "Đã chọn 1 ảnh"}
                          </span>
                        </div>
                        <div className="mt-2">
                          {selectedFiles.length > 0 && renderSelectedFiles()}
                        </div>
                      </div>

                      {/* Variants Section */}
                      <div className="mt-4">
                        <h5>Biến thể sản phẩm</h5>
                        <div className="table-responsive">
                          <table className="table table-bordered">
                            <thead className="bg-light">
                              <tr>
                                <th>ID</th>
                                <th>Biến thể</th>
                                <th>Giá/Ảnh</th>
                                <th>Thao tác</th>
                              </tr>
                            </thead>
                            <tbody>
                              {variants.map((variant, index) => (
                                <tr key={variant.id || index}>
                                  <td>{variant.id || "Mới"}</td>
                                  <td>{variant.variant}</td>
                                  <td>
                                    {variant.variant
                                      .toLowerCase()
                                      .includes("color") ? (
                                      <div className="d-flex align-items-center">
                                        <input
                                          type="file"
                                          id={`fileInput-${index}`}
                                          accept="image/*"
                                          style={{ display: "none" }}
                                          onChange={handleColorImageUpload(
                                            variant.variant.split(" / ")[1],
                                            index
                                          )}
                                        />
                                        <label
                                          htmlFor={`fileInput-${index}`}
                                          className="btn btn-primary btn-sm mr-2"
                                        >
                                          {variant.image
                                            ? "Thay đổi ảnh"
                                            : "Thêm ảnh"}
                                        </label>
                                        {variant.image && (
                                          <img
                                            src={variant.image}
                                            alt={variant.variant}
                                            style={{
                                              width: "50px",
                                              height: "50px",
                                              objectFit: "cover",
                                              marginLeft: "10px",
                                            }}
                                          />
                                        )}
                                      </div>
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
                                      Xóa
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Thêm Biến Thể Mới */}

                      {/* Submit Button */}
                      <button
                        type="submit"
                        className="btn btn-success btn-block mt-4"
                      >
                        Cập nhật Template
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
