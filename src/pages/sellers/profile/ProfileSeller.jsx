import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import profileService from "../../../services/profileService";

export default function ProfileSeller() {
  const sellerId = JSON.parse(localStorage.getItem("user")).id;
  const [shopInfo, setShopInfo] = useState(null);
  const [previewImage, setPreviewImage] = useState(null); // Thêm state mới
  useEffect(() => {
    profileService.getShopInfo(sellerId).then((res) => {
      setShopInfo(res.data);
    });
  }, []);

  // Thêm hàm xử lý khi chọn file
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  return (
    <div className="content-wrapper" style={{ minHeight: "1604.8px" }}>
      {/* Content Header (Page header) */}
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Shop Profile</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <Link to="#">Home</Link>
                </li>
                <li className="breadcrumb-item active">User Profile</li>
              </ol>
            </div>
          </div>
        </div>
        {/* /.container-fluid */}
      </section>
      {/* Main content */}
      <section className="content">
        <div className="container-fluid">
          <div className="row justify-content-center">
        
            <div className="col-md-6">
                
              {/* Profile Image */}
              <div className="card card-info card-outline">
                
                <div className="card-body box-profile">
                  <div className="d-flex justify-content-end">
                    <Link className="text-dark">
                      <i class="fa-solid fa-pen"></i>
                    </Link>
                  </div>
                  <div className="text-center">
                    <img
                      className="profile-user-img img-fluid img-circle"
                      src={previewImage || shopInfo?.shop.logo_url}
                      alt="Userprofilepicture"
                    />
                    <div className="mt-2">
                      <input
                        type="file"
                        id="logo-upload"
                        accept="image/*"
                        className="d-none"
                        onChange={handleImageChange}
                      />
                      <label
                        htmlFor="logo-upload"
                        className="btn btn-sm btn-info"
                      >
                        <small>
                          {" "}
                          <i class="fa-regular fa-image "></i>
                          &emsp;Đổi ảnh đại diện
                        </small>
                      </label>
                    </div>
                  </div>
                  <h3 className="profile-username text-center">
                    {shopInfo?.shop.shop_name}
                  </h3>

                  <ul className="list-group list-group-unbordered mb-3">
                    <li className="list-group-item">
                      <b>Followers</b>{" "}
                      <Link className="float-right">
                        {shopInfo?.followers_count}
                      </Link>
                    </li>
                    <li className="list-group-item">
                      <b>Products</b>{" "}
                      <Link className="float-right">
                        {shopInfo?.products_count}
                      </Link>
                    </li>
                    <li className="list-group-item">
                      <b>Favorites</b>{" "}
                      <Link className="float-right">13,287</Link>
                    </li>
                  </ul>
                </div>
                {/* /.card-body */}
              </div>
              {/* /.card */}
              {/* About Me Box */}
              <div className="card card-info">
                <div className="card-header">
                  <h3 className="card-title">About Me</h3>
                </div>
                {/* /.card-header */}
                <div className="card-body">
                  <strong>
                    <i className="fas fa-book mr-1" /> Name
                  </strong>
                  <p className="text-muted">{shopInfo?.shop.owner.name}</p>
                  <hr />
                  <strong>
                    <i className="fas fa-map-marker-alt mr-1" /> Location
                  </strong>
                  <p className="text-muted">{shopInfo?.shop.owner.address}</p>
                  <hr />
                  <strong>
                    <i className="fas fa-pencil-alt mr-1" /> Phone Number
                  </strong>
                  <p className="text-muted">
                    {shopInfo?.shop.owner.phone_number}
                  </p>
                  <hr />
                </div>
                {/* /.card-body */}
              </div>
              {/* /.card */}
            </div>
            {/* /.col */}

            {/* /.col */}
          </div>
          {/* /.row */}
        </div>
        {/* /.container-fluid */}
      </section>
      {/* /.content */}
    </div>
  );
}
