import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { Cropper } from "react-cropper";
import "cropperjs/dist/cropper.css";
import Swal from "sweetalert2";
import categoryService from "../../../services/categoryService";
import productService from "../../../services/productService";
import {
  COLOR_OPTIONS,
  EDITOR_CONFIG,
  IMAGE_DIMENSIONS,
  SIZE_OPTIONS,
  TYPE_OPTIONS,
} from "../../../constants/productConstants";
import { urlImage } from "../../../config";

export default function EditProduct() {
  const id = parseInt(useParams().id);
  const [categories, setCategories] = useState([]);
  const [description, setDescription] = useState("");
  const [product, setProduct] = useState({
    name: "",
    category_id: "",
    price: "",
    description: "",
    stock: "",
    status: "1",
    image: null,
    sizes: [],
    colors: [],
  });
  const [imagePreview, setImagePreview] = useState("");
  const [image, setImage] = useState("");
  const [cropData, setCropData] = useState("");
  const [cropper, setCropper] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [colorCropper, setColorCropper] = useState(null);
  const [showColorCropper, setShowColorCropper] = useState(false);
  const [selectedColorIndex, setSelectedColorIndex] = useState(null);
  const [imageUrl, setImageUrl] = useState("");

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
    const fetchProduct = async () => {
      try {
        const response = await productService.getProductById(id);
        const productData = response.data.data;
        setProduct(productData);
        setImagePreview(productData.image);

        // Lấy colors và sizes
        const colorsResponse = await productService.getProductColors(id);
        const sizesResponse = await productService.getProductSizes(id);
        const typesResponse = await productService.getProductTypes(id);

        // Thêm id vào mỗi color để theo dõi
        const colorsWithIds = colorsResponse.data.data.map((color) => ({
          ...color,
          id: color.id, // Đảm bảo lưu ID của color hiện có
        }));

        setProduct((prev) => ({
          ...prev,
          colors: colorsWithIds,
        }));

        setProduct((prev) => ({
          ...prev,
          sizes: sizesResponse.data.data,
        }));
        setProduct((prev) => ({
          ...prev,
          types: typesResponse.data.data,
        }));
        console.log(typesResponse);
      } catch (error) {
        toast.error("Không thể lấy thông tin sản phẩm");
      }
    };

    fetchProduct();
  }, [id]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleImageChange = (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };
  // Thêm useEffect để khởi tạo Toast
  useEffect(() => {
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

    window.Toast = Toast;
  }, []);

  const handleAddColor = () => {
    setProduct((prev) => ({
      ...prev,
      colors: [
        ...prev.colors,
        {
          color_value: "",
          color_code: "",
          image: null,
          imagePreview: null,
          // Không thêm id vì đây là color mới
        },
      ],
    }));
  };
  // Xử lý thêm size
  const handleAddSize = () => {
    const uniqueId = "size_" + Date.now();
    const newSizeBlock = (
      <div className="row mt-3" key={uniqueId}>
        <div className="col-sm-6">
          <select
            className="form-control select-option-size"
            style={{ width: "100%" }}
            data-select2-id="25"
            tabIndex="-1"
            aria-hidden="true"
          >
            <option selected>Choose a size</option>
            <option selected>Choose a size</option>
            {SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
        <div className="col-sm-6">
          <input type="text" className="form-control" placeholder="Price" />
        </div>
      </div>
    );

    setProduct((prev) => ({
      ...prev,
      sizes: [...prev.sizes, { size_value: "", price: "" }],
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("name", product.name);
      formData.append("category_id", product.category_id);
      formData.append("price", product.price);
      formData.append("description", description);
      formData.append("stock", product.stock);
      formData.append("status", product.status);
      const urlToFile = async (url, filename) => {
        try {
          const response = await fetch(url);
          const blob = await response.blob();
          return new File([blob], filename, { type: blob.type });
        } catch (error) {
          console.error("Lỗi chuyển đổi URL thành File:", error);
          return null;
        }
      };
      // Log dữ liệu cơ bản
      console.log("=== Dữ liệu cơ bản ===");
      console.log({
        name: product.name,
        category_id: product.category_id,
        price: product.price,
        description: description,
        stock: product.stock,
        status: product.status,
      });

      // Thêm các trường cơ bản
      Object.keys(product).forEach((key) => {
        if (key !== "colors" && key !== "sizes" && key !== "image") {
          formData.append(key, product[key]);
        }
      });

      // Log thông tin ảnh
      console.log("=== Thông tin ảnh ===");
      console.log("Image:", product.image);

      // Thêm ảnh nếu có
      if (product.image instanceof File) {
        formData.append("image", product.image);
      } else {
        // Nếu là URL, chuyển thành File
        const imageFile = await urlToFile(
          urlImage + product.image,
          "main-image.jpg"
        );
        if (imageFile) {
          formData.append("image", imageFile);
        }
      }

      // Xử lý colors và ảnh của colors
      const processedColors = await Promise.all(
        product.colors.map(async (color, index) => {
          let imageFile = null;

          if (color.image) {
            if (color.image instanceof File) {
              // Nếu đã là File thì giữ nguyên
              imageFile = color.image;
            } else if (color.imagePreview) {
              // Nếu có imagePreview (base64), chuyển thành File
              imageFile = await fetch(color.imagePreview)
                .then((res) => res.blob())
                .then(
                  (blob) =>
                    new File([blob], `color-${index}.jpg`, {
                      type: "image/jpeg",
                    })
                );
            } else if (typeof color.image === "string") {
              // Nếu là đường dẫn URL, tải về và chuyển thành File
              try {
                const response = await fetch(urlImage + color.image);
                const blob = await response.blob();
                imageFile = new File([blob], `color-${index}.jpg`, {
                  type: blob.type,
                });
              } catch (error) {
                console.error(`Lỗi khi xử lý ảnh màu ${index}:`, error);
              }
            }
          }

          // Thêm color data vào formData
          formData.append(`colors[${index}][color_value]`, color.color_value);
          formData.append(`colors[${index}][color_code]`, color.color_code);

          // Chỉ gửi id nếu color đã tồn tại
          if (color.id) {
            formData.append(`colors[${index}][id]`, color.id);
          }

          // Thêm file ảnh mới nếu có
          if (imageFile) {
            formData.append(`colors[${index}][image]`, imageFile);
          }

          return color;
        })
      );

      product.sizes.forEach((size, index) => {
        formData.append(`sizes[${index}][size_value]`, size.size_value);
        formData.append(`sizes[${index}][price]`, size.price);
      });
      product.types.forEach((type, index) => {
        formData.append(`types[${index}][type_value]`, type.type_value);
        formData.append(`types[${index}][price]`, type.price);
      });

      const response = await productService.updateProduct(id, formData);

      if (response.data.success) {
        // Thông báo thành công
        window.Toast.fire({
          icon: "success",
          title: "Cập nhật sản phẩm thành công!",
        }).then(() => {
          // Load lại trang sau khi toast biến mất
          window.location.reload();
        });
      }
    } catch (error) {
      console.error("Lỗi chi tiết:", error);

      window.Toast.fire({
        icon: "error",
        title:
          error.response?.status === 422
            ? "Vui lòng kiểm tra lại thông tin!"
            : "Có lỗi xảy ra khi cập nhật sản phẩm!",
      });
    }
  };
  const handleColorImageChange = (index, e) => {
    e.preventDefault();
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result);
        setShowColorCropper(true);
        setSelectedColorIndex(index);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleColorChange = (index, selectedColor) => {
    setProduct((prev) => ({
      ...prev,
      colors: prev.colors.map((color, i) =>
        i === index
          ? {
              ...color,
              color_value: selectedColor.value,
              color_code: selectedColor.color,
              id: color.id, // Giữ nguyên id nếu có
            }
          : color
      ),
    }));
  };
  const handleSizeChange = (index, value) => {
    setProduct((prev) => ({
      ...prev,
      sizes: prev.sizes.map((size, i) =>
        i === index ? { ...size, size_value: value } : size
      ),
    }));
  };

  const handlePriceChange = (index, value) => {
    setProduct((prev) => ({
      ...prev,
      sizes: prev.sizes.map((size, i) =>
        i === index ? { ...size, price: value } : size
      ),
    }));
  };
  const getCropData = () => {
    if (cropper) {
      const cropDataUrl = cropper.getCroppedCanvas().toDataURL();
      setCropData(cropDataUrl);
      setShowCropper(false);

      // Convert base64 to file
      const dataURLtoFile = (dataurl, filename) => {
        const arr = dataurl.split(",");
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
      };

      const croppedFile = dataURLtoFile(cropDataUrl, "cropped.png");
      setProduct((prev) => ({
        ...prev,
        image: croppedFile,
      }));
    }
  };
  const getColorCropData = () => {
    if (colorCropper && selectedColorIndex !== null) {
      const cropDataUrl = colorCropper.getCroppedCanvas().toDataURL();

      // Convert base64 to file
      const dataURLtoFile = (dataurl, filename) => {
        const arr = dataurl.split(",");
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
      };

      const croppedFile = dataURLtoFile(
        cropDataUrl,
        `color-${selectedColorIndex}.png`
      );

      setProduct((prev) => ({
        ...prev,
        colors: prev.colors.map((color, i) => {
          if (i === selectedColorIndex) {
            return {
              ...color,
              image: croppedFile,
              imagePreview: cropDataUrl,
              id: color.id, // Giữ nguyên id nếu có
            };
          }
          return color;
        }),
      }));

      setShowColorCropper(false);
    }
  };

  const handleRemoveColor = (indexToRemove) => {
    setProduct((prev) => ({
      ...prev,
      colors: prev.colors.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleRemoveType = (indexToRemove) => {
    setProduct((prev) => ({
      ...prev,
      types: prev.types.filter((_, index) => index !== indexToRemove),
    }));
  };

  const renderColorImage = (color, index) => {
    if (color.imagePreview) {
      return color.imagePreview;
    } else if (color.image instanceof File) {
      return URL.createObjectURL(color.image);
    } else if (color.image) {
      if (color.image.startsWith("http") || color.image.startsWith("https")) {
        return color.image;
      } else {
        return urlImage + color.image;
      }
    }
    return "https://cdn-icons-png.flaticon.com/128/179/179378.png";
  };

  const handleImageUrlChange = (e) => {
    setImageUrl(e.target.value);
  };

  const handleImageUploadFromUrl = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], "uploaded-image.jpg", { type: blob.type });
      setImage(URL.createObjectURL(file));
      setShowCropper(true);
    } catch (error) {
      console.error("Lỗi khi tải hình ảnh từ URL:", error);
      toast.error("Không thể tải hình ảnh từ URL");
    }
  };
  const handleAddType = () => {
    setProduct((prev) => ({
      ...prev,
      types: [...prev.types, { type_value: "", price: "" }],
    }));
  };
  const handleTypeChange = (index, value) => {
    setProduct((prev) => ({
      ...prev,
      types: prev.types.map((type, i) =>
        i === index ? { ...type, type_value: value } : type
      ),
    }));
  };
  const handleTypePriceChange = (index, value) => {
    setProduct((prev) => ({
      ...prev,
      types: prev.types.map((type, i) =>
        i === index ? { ...type, price: value } : type
      ),
    }));
  };
  const handleRemoveSize = (indexToRemove) => {
    setProduct((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((_, index) => index !== indexToRemove),
    }));
  };

  return (
    <div className="content-wrapper" style={{ minHeight: "228.4px" }}>
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Product Update</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <a href="/admin/addproduct">Home</a>
                </li>
                <li className="breadcrumb-item active">Product Add</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="content mb-3">
        <form>
          <div className="row">
            {/* Left Column */}
            <div className="col-md-6">
              <div className="card card-info">
                <div className="card-header">
                  <h3 className="card-title">Information Products</h3>
                </div>
                <div className="card-body">
                  {/* Product Name */}
                  <div className="form-group">
                    <label htmlFor="inputName">Product Name</label>
                    <input
                      type="text"
                      id="inputName"
                      value={product.name}
                      onChange={handleChange}
                      name="name"
                      className="form-control"
                      placeholder="Enter the product name"
                    />
                  </div>

                  {/* Product Description */}
                  <div className="form-group">
                    <label htmlFor="inputDescription">
                      Product Description
                    </label>
                    <CKEditor
                      editor={ClassicEditor}
                      config={EDITOR_CONFIG}
                      data={product.description}
                      name="description"
                      value={product.description}
                      onChange={(event, editor) => {
                        const data = editor.getData();
                        setDescription(data);
                      }}
                    />
                  </div>

                  {/* Category */}
                  <div className="form-group">
                    <label htmlFor="inputStatus">Category</label>
                    <select
                      id="inputStatus"
                      name="category_id"
                      value={product.category_id}
                      onChange={handleChange}
                      className="form-control custom-select"
                    >
                      <option selected disabled>
                        Select a category
                      </option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}{" "}
                          {/* name đã bao gồm dấu -- cho subcategories */}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status */}
                  <div className="form-group">
                    <label htmlFor="inputStatus">Status</label>
                    <select
                      id="selectStatus"
                      value={product.status}
                      onChange={handleChange}
                      name="status"
                      className="form-control custom-select"
                    >
                      <option value="1">Active</option>
                      <option value="0">Inactive</option>
                    </select>
                  </div>

                  {/* Avatar */}
                  <div className="form-group">
                    <label htmlFor="inputStatus">Avatar</label>
                    <div>
                      <div className="mb-4 d-flex justify-content-center">
                        <img
                          src={
                            product.image instanceof File
                              ? URL.createObjectURL(product.image)
                              : product.image?.startsWith("http")
                              ? product.image
                              : urlImage + product.image
                          }
                          alt="cropped"
                          style={{ width: "60%" }}
                        />
                      </div>
                      <div className="d-flex justify-content-center">
                        <div className="btn btn-info btn-md btn-rounded">
                          <label
                            className="form-label text-white m-1"
                            htmlFor="customFile1"
                          >
                            <small>Choose file</small>
                          </label>
                          <input
                            type="file"
                            className="form-control d-none"
                            id="customFile1"
                            onChange={handleImageChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="col-md-6">
              <div className="card card-info">
                <div className="card-header">
                  <h3 className="card-title">Detailed Information</h3>
                </div>
                <div className="card-body">
                  {/* Price and Quantity */}
                  <div className="form-group">
                    <label htmlFor="inputEstimatedBudget">
                      Applicable to all categories
                    </label>
                    <div className="row">
                      <div className="col-6">
                        <input
                          type="number"
                          name="price"
                          onChange={handleChange}
                          className="form-control"
                          placeholder="Price"
                          value={product.price}
                        />
                      </div>
                      <div className="col-6">
                        <input
                          type="text"
                          name="stock"
                          onChange={handleChange}
                          className="form-control"
                          placeholder="Quantity"
                          value={product.stock}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Color Selection */}
                  <div className="form-group">
                    <label htmlFor="inputEstimatedBudget">
                      Product Classification
                    </label>
                    <br />
                    <label>
                      <span>Color&nbsp;&nbsp;</span>
                      <button
                        type="button"
                        id="addColorButton"
                        className="btn btn-info btn-sm"
                        onClick={handleAddColor}
                      >
                        <small>Add Color</small>
                      </button>
                    </label>
                    <div id="color-container">
                      {Object.values(product.colors || {}).map(
                        (color, index) => (
                          <div key={index} className="row">
                            <div className="form-group col-12 col-sm-4 d-flex align-items-center mt-2">
                              <select
                                className="form-control select-option-color"
                                style={{ width: "100%" }}
                                value={color.color_value}
                                onChange={(e) => {
                                  const selectedColor = COLOR_OPTIONS.find(
                                    (opt) => opt.value === e.target.value
                                  );
                                  handleColorChange(index, selectedColor);
                                }}
                              >
                                <option value="">Choose a color</option>
                                {COLOR_OPTIONS.map((option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                    data-color={option.color}
                                  >
                                    {option.value}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="col-12 col-sm-7">
                              <div className="row">
                                <div className="col-sm-6 d-flex align-items-center">
                                  <input
                                    id={`upload_${index}`}
                                    type="file"
                                    className="form-control border-0 d-none"
                                    accept="image/*"
                                    onChange={(e) =>
                                      handleColorImageChange(index, e)
                                    }
                                  />
                                  <div className="input-group-append">
                                    <label
                                      htmlFor={`upload_${index}`}
                                      className="btn btn-light m-0 rounded-pill px-4"
                                    >
                                      <i className="fa fa-cloud-upload mr-2 text-muted"></i>
                                      <small className="text-uppercase font-weight-bold text-muted">
                                        Choose file
                                      </small>
                                    </label>
                                  </div>
                                </div>

                                <div className="col-sm-6">
                                  <div className="image-area mt-2">
                                    <img
                                      id={`img_upload_${index}`}
                                      src={renderColorImage(color, index)}
                                      alt=""
                                      className="img-fluid rounded shadow-sm mx-auto d-block"
                                      style={{
                                        width: "100px",
                                        height: "100px",
                                        objectFit: "cover",
                                        borderRadius: "8px",
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="col-12 col-sm-1 d-flex align-items-center">
                              <button
                                type="button"
                                aria-label="Close"
                                className="btn btn-block bg-gradient-danger btn-xs btn-close"
                                onClick={() => handleRemoveColor(index)}
                              >
                                <i className="fa-solid fa-xmark"></i>
                              </button>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* Size Selection */}
                  <div className="form-group">
                    <label>
                      <span>Size&nbsp;&nbsp;</span>
                      <button
                        type="button"
                        id="addSizeButton"
                        className="btn btn-info btn-sm"
                        onClick={handleAddSize}
                      >
                        <small>Add Size</small>
                      </button>
                    </label>
                    <div id="size-container">
                      {Object.values(product.sizes || {}).map((size, index) => (
                        <div className="row mt-3" key={index}>
                          <div className="col-sm-6">
                            <select
                              className="form-control select-option-size"
                              style={{ width: "100%" }}
                              data-select2-id={`size-${index}`}
                              tabIndex="-1"
                              aria-hidden="true"
                              value={size.size_value}
                              onChange={(e) =>
                                handleSizeChange(index, e.target.value)
                              }
                            >
                              <option value="">Choose a size</option>
                              {SIZE_OPTIONS.map((sizeOption) => (
                                <option
                                  key={sizeOption.value}
                                  value={sizeOption.value}
                                >
                                  {sizeOption.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="col-sm-5">
                            <input
                              type="number"
                              className="form-control"
                              placeholder="Price"
                              value={size.price}
                              onChange={(e) =>
                                handlePriceChange(index, e.target.value)
                              }
                            />
                          </div>
                          <div className="col-sm-1 d-flex align-items-center">
                            <button
                              type="button"
                              aria-label="Close"
                              className="btn btn-block bg-gradient-danger btn-xs btn-close"
                              onClick={() => handleRemoveSize(index)}
                            >
                              <i className="fa-solid fa-xmark"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>
                      <span>Type&nbsp;&nbsp;</span>
                      <button
                        type="button"
                        id="addTypeButton"
                        className="btn btn-info btn-sm"
                        onClick={handleAddType}
                      >
                        <small>Add Type</small>
                      </button>
                    </label>
                    <div id="type-container">
                      {Object.values(product.types || {}).map((type, index) => (
                        <div className="row mt-3" key={index}>
                          <div className="col-sm-6">
                            <select
                              className="form-control select-option-type"
                              style={{ width: "100%" }}
                              data-select2-id={`type-${index}`}
                              tabIndex="-1"
                              aria-hidden="true"
                              value={type.type_value}
                              onChange={(e) =>
                                handleTypeChange(index, e.target.value)
                              }
                            >
                              <option value="">Choose a type</option>
                              {TYPE_OPTIONS.map((typeOption) => (
                                <option
                                  key={typeOption.value}
                                  value={typeOption.value}
                                >
                                  {typeOption.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="col-sm-5">
                            <input
                              type="number"
                              className="form-control"
                              placeholder="Price"
                              value={type.price}
                              onChange={(e) =>
                                handleTypePriceChange(index, e.target.value)
                              }
                            />
                          </div>
                          <div className="col-sm-1 d-flex align-items-center">
                            <button
                              type="button"
                              aria-label="Close"
                              className="btn btn-block bg-gradient-danger btn-xs btn-close"
                              onClick={() => handleRemoveType(index)}
                            >
                              <i className="fa-solid fa-xmark"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="row">
            <div className="col-12 d-flex justify-content-end">
              <button
                type="submit"
                className="btn btn-success swalDefaultSuccess"
                onClick={handleSubmit}
              >
                Update Product
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* Modal Cropper cho ảnh chính */}
      {showCropper && (
        <div className="modal fade show" style={{ display: "block" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Crop Image</h5>
                <button
                  type="button"
                  className="close"
                  onClick={() => setShowCropper(false)}
                >
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <Cropper
                  style={{ height: 400, width: "100%" }}
                  initialAspectRatio={1}
                  aspectRatio={1}
                  preview=".img-preview"
                  src={image}
                  viewMode={1}
                  guides={true}
                  minCropBoxHeight={10}
                  minCropBoxWidth={10}
                  background={false}
                  responsive={true}
                  autoCropArea={1}
                  checkOrientation={false}
                  onInitialized={(instance) => {
                    setCropper(instance);
                  }}
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCropper(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={getCropData}
                >
                  Crop & Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cropper cho ảnh màu */}
      {showColorCropper && (
        <div className="modal fade show" style={{ display: "block" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Crop Color Image</h5>
                <button
                  type="button"
                  className="close"
                  onClick={() => setShowColorCropper(false)}
                >
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <Cropper
                  style={{ height: 400, width: "100%" }}
                  initialAspectRatio={1}
                  aspectRatio={1}
                  preview=".img-preview"
                  src={image}
                  viewMode={1}
                  guides={true}
                  minCropBoxHeight={IMAGE_DIMENSIONS.height}
                  minCropBoxWidth={IMAGE_DIMENSIONS.width}
                  cropBoxResizable={false}
                  background={false}
                  responsive={true}
                  autoCropArea={1}
                  checkOrientation={false}
                  onInitialized={(instance) => {
                    setColorCropper(instance);
                  }}
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowColorCropper(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={getColorCropData}
                >
                  Crop & Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
