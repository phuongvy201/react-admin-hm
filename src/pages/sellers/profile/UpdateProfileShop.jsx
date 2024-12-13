import React, { useEffect, useState } from "react";
import { Cropper } from "react-cropper";
import { Link } from "react-router-dom";
import profileService from "../../../services/profileService";
import Swal from "sweetalert2";
import { urlImage } from "../../../config";

export default function UpdateProfileShop() {
  const [cropData, setCropData] = useState(""); // Kết quả ảnh đã cắt
  const [showCropper, setShowCropper] = useState(false); // Hiển thị modal
  const [image, setImage] = useState(null); // Lưu ảnh tải lên
  const [cropper, setCropper] = useState(null); // Instance của CropperJS

  const [name, setName] = useState(""); // Instance của CropperJS
  const [description, setDescription] = useState(""); // Instance của CropperJS
  const [logoUrl, setLogoUrl] = useState(null); // Instance của CropperJS
  const [bannerUrl, setBannerUrl] = useState(null); // Instance của CropperJS

  const [bannerImage, setBannerImage] = useState(null);
  const [bannerCropData, setBannerCropData] = useState("");
  const [bannerCropper, setBannerCropper] = useState();
  const [showBannerCropper, setShowBannerCropper] = useState(false);
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });
  useEffect(() => {
    const checkProfile = async () => {
      try {
        const response = await profileService.checkExistProfile();
        if (response.data.success) {
          const profileResponse = await profileService.getProfileShopInfo();
          setName(profileResponse.data.shop.shop_name);
          setDescription(profileResponse.data.shop.description);
          setLogoUrl(profileResponse.data.shop.logo_url);
          setBannerUrl(profileResponse.data.shop.banner_url);
        }
      } catch (error) {
        console.error("Error checking profile:", error.message);
      }
    };
    checkProfile();
  }, []);
  const getBannerSrc = () => {
    if (bannerCropData) {
      return bannerCropData;
    }
    if (bannerUrl) {
      return urlImage + bannerUrl;
    }
    return "https://cdn-icons-png.flaticon.com/128/179/179378.png";
  };
  const getLogoSrc = () => {
    if (cropData) {
      return cropData;
    }
    if (logoUrl) {
      return urlImage + logoUrl;
    }
    return "https://cdn-icons-png.flaticon.com/128/179/179378.png";
  };

  const handleImageChange = (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result); // Chuyển đổi file ảnh thành base64
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };
  const getCropData = () => {
    if (cropper) {
      setCropData(cropper.getCroppedCanvas().toDataURL());
      setShowCropper(false); // Đóng modal sau khi cắt
    }
  };
  const handleBannerImageChange = (e) => {
    e.preventDefault();
    let files;
    if (e.dataTransfer) {
      files = e.dataTransfer.files;
    } else if (e.target) {
      files = e.target.files;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setBannerImage(reader.result);
      setShowBannerCropper(true);
    };
    reader.readAsDataURL(files[0]);
  };
  const getBannerCropData = () => {
    if (bannerCropper) {
      setBannerCropData(bannerCropper.getCroppedCanvas().toDataURL());
      setShowBannerCropper(false);
    }
  };
  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1]; // Lấy mime type từ chuỗi base64
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    // Sử dụng mime type thực tế của file
    return new File([u8arr], filename, { type: mime });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const profileData = new FormData();

    if (cropData) {
      const logo_url = dataURLtoFile(cropData, "main-profile-image.png");
      profileData.append("logo_url", logo_url);
    }
    if (bannerCropData) {
      const banner_url = dataURLtoFile(
        bannerCropData,
        "main-profile-image.png"
      );
      profileData.append("banner_url", banner_url);
    }

    // Thêm các trường cơ bản
    profileData.append("shop_name", name);
    profileData.append("description", description);

    profileService
      .createProfile(profileData)
      .then((response) => {
        if (response.data.success) {
          // Thông báo thành công
          Toast.fire({
            icon: "success",
            title: "Create a successful shop profile!",
          });

          const mainImagePreview = document.querySelector(
            ".mb-4.d-flex.justify-content-center img"
          );
          if (mainImagePreview) {
            mainImagePreview.src =
              "https://cdn-icons-png.flaticon.com/128/179/179378.png";
          }

          // Reset file inputs
          const mainImageInput = document.getElementById("customFile1");
          if (mainImageInput) {
            mainImageInput.value = "";
          }

          // Scroll to top
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      })
      .catch((error) => {
        console.error("Error details:", error.response?.data); // Log chi tiết lỗi
        Toast.fire({
          icon: "error",
          title:
            error.response?.data?.message || "Có lỗi xảy ra khi thêm sản phẩm!",
        });
      });
  };
  return (
    <div className="content-wrapper" style={{ minHeight: "1604.8px" }}>
      {/* Content Header (Page header) */}
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Profile</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <Link to="#">Home</Link>
                </li>
                <li className="breadcrumb-item active">Update Profile</li>
              </ol>
            </div>
          </div>
        </div>
        {/* /.container-fluid */}
      </section>
      {/* Main content */}
      <section className="content">
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-8 mx-auto">
              <div className="card card-info">
                <div className="card-header">
                  <h3 className="card-title">Shop Information</h3>
                </div>
                <div className="card-body">
                  <div className="form-group">
                    <label htmlFor="inputName">Name</label>
                    <input
                      type="text"
                      id="inputName"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter a name"
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="inputPhone">Description</label>
                    <input
                      type="text"
                      id="inputPhone"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter a description"
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="inputCategoryLeader">Avatar Shop</label>
                    <div>
                      <div className="mb-4 d-flex justify-content-center">
                        <img
                          src={getLogoSrc()}
                          alt="cropped"
                          style={{ width: "40%" }}
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
                            placeholder="Choose a image"
                          />
                        </div>
                      </div>

                      {/* Modal Cropper */}
                      {showCropper && (
                        <div
                          className="modal fade show"
                          style={{ display: "block" }}
                        >
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
                    </div>
                  </div>
                  <div className="form-group">
                    {" "}
                    <label htmlFor="inputCategoryLeader">
                      Banner Shop
                    </label>{" "}
                    <div>
                      {" "}
                      <div className="mb-4 d-flex justify-content-center">
                        {" "}
                        <img
                          src={getBannerSrc()}
                          alt="banner"
                          style={{ width: "40%" }}
                        />
                      </div>{" "}
                      <div className="d-flex justify-content-center">
                        {" "}
                        <div className="btn btn-info btn-md btn-rounded">
                          {" "}
                          <label
                            className="form-label text-white m-1"
                            htmlFor="customFile2"
                          >
                            {" "}
                            <small>Choose file</small>{" "}
                          </label>{" "}
                          <input
                            type="file"
                            className="form-control d-none"
                            id="customFile2"
                            onChange={handleBannerImageChange}
                            placeholder="Choose a banner"
                          />{" "}
                        </div>{" "}
                      </div>{" "}
                      {/* Modal Cropper for Banner */}{" "}
                      {showBannerCropper && (
                        <div
                          className="modal fade show"
                          style={{ display: "block" }}
                        >
                          {" "}
                          <div className="modal-dialog modal-lg">
                            {" "}
                            <div className="modal-content">
                              {" "}
                              <div className="modal-header">
                                {" "}
                                <h5 className="modal-title">
                                  Crop Banner
                                </h5>{" "}
                                <button
                                  type="button"
                                  className="close"
                                  onClick={() => setShowBannerCropper(false)}
                                >
                                  {" "}
                                  <span>&times;</span>{" "}
                                </button>{" "}
                              </div>{" "}
                              <div className="modal-body">
                                {" "}
                                <Cropper
                                  style={{ height: 400, width: "100%" }}
                                  initialAspectRatio={16 / 9}
                                  aspectRatio={16 / 9}
                                  preview=".img-preview"
                                  src={bannerImage}
                                  viewMode={1}
                                  guides={true}
                                  minCropBoxHeight={10}
                                  minCropBoxWidth={10}
                                  background={false}
                                  responsive={true}
                                  autoCropArea={1}
                                  checkOrientation={false}
                                  onInitialized={(instance) => {
                                    setBannerCropper(instance);
                                  }}
                                />{" "}
                              </div>{" "}
                              <div className="modal-footer">
                                {" "}
                                <button
                                  type="button"
                                  className="btn btn-secondary"
                                  onClick={() => setShowBannerCropper(false)}
                                >
                                  {" "}
                                  Cancel{" "}
                                </button>{" "}
                                <button
                                  type="button"
                                  className="btn btn-danger"
                                  onClick={getBannerCropData}
                                >
                                  {" "}
                                  Crop & Save{" "}
                                </button>{" "}
                              </div>{" "}
                            </div>{" "}
                          </div>{" "}
                        </div>
                      )}{" "}
                    </div>{" "}
                  </div>
                </div>
                {/* /.card-body */}
              </div>
              {/* /.card */}
            </div>
          </div>
          <div className="row">
            <div className="col-12">
              <button type="submit" className="btn btn-success float-right">
                Create Shop
              </button>
            </div>
          </div>
        </form>
      </section>
      {/* /.content */}
    </div>
  );
}
