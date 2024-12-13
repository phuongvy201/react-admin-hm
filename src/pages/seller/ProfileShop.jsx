import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import profileService from "../../services/profileService";
import { urlImage } from "../../config";

export default function ProfileShop() {
  const { sellerId } = useParams();
  const [shopInfo, setShopInfo] = useState(null);
  const [loading, setLoading] = useState(true); // Thêm state loading

  useEffect(() => {
    profileService
      .getShopInfo(sellerId)
      .then((res) => {
        setShopInfo(res.data);
        setLoading(false); // Dữ liệu đã được tải xong
        console.log(res.data);
      })
      .catch((error) => {
        setLoading(false); // Dữ liệu tải lỗi
        console.error(error);
      });
  }, [sellerId]);

  // Nếu đang tải dữ liệu, hiển thị loading
  if (loading) {
    return (
      <div className="content-wrapper" style={{ minHeight: "1604.8px" }}>
        <section className="content-header">
          <div className="container-fluid">
            <h1>Loading...</h1>
          </div>
        </section>
      </div>
    );
  }

  // Nếu không có shopInfo hoặc shopInfo?.shop, hiển thị thông báo lỗi
  if (!shopInfo || !shopInfo?.shop) {
    return (
      <div className="content-wrapper" style={{ minHeight: "1604.8px" }}>
        <section className="content-header">
          <div className="container-fluid">
            <h1>Shop not found</h1>
            <p>
              Sorry, we couldn't find the shop information you're looking for.
            </p>
          </div>
        </section>
      </div>
    );
  }

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
                  <Link href="#">Home</Link>
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
          <div className="row">
            <div className="col-md-6">
              {/* Profile Image */}
              <div className="card card-primary card-outline">
                <div className="card-body box-profile">
                  <div
                    className="text-center"
                    style={{
                      backgroundImage: `url("${shopInfo?.shop?.banner_url}")`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    <img
                      className="profile-user-img img-fluid img-circle"
                      src={urlImage + shopInfo?.shop?.logo_url}
                      alt="Userprofilepicture"
                    />
                  </div>
                  <h3 className="profile-username text-center">
                    {shopInfo?.shop?.shop_name}
                  </h3>
                  <p className="text-muted text-center">
                    {shopInfo?.shop?.owner.name}
                  </p>
                  <ul className="list-group list-group-unbordered mb-3">
                    <li className="list-group-item">
                      <b>Followers</b>{" "}
                      <Link className="float-right">
                        {" "}
                        {shopInfo?.shop?.followers_count}
                      </Link>
                    </li>
                    <li className="list-group-item">
                      <b>Products</b>{" "}
                      <Link className="float-right">
                        {" "}
                        {shopInfo?.shop?.products_count}
                      </Link>
                    </li>
                  </ul>
                </div>
                {/* /.card-body */}
              </div>
              {/* /.card */}
            </div>
            <div className="col-md-6">
              <div className="card card-primary">
                <div className="card-header">
                  <h3 className="card-title">Owner Info</h3>
                </div>
                {/* /.card-header */}
                <div className="card-body">
                  <strong>
                    <i className="fas fa-book mr-1" /> Name
                  </strong>
                  <p className="text-muted">{shopInfo?.shop?.owner?.name}</p>

                  <hr />
                  <strong>
                    <i className="fas fa-map-marker-alt mr-1" /> Address
                  </strong>
                  <p className="text-muted">{shopInfo?.shop?.owner?.address}</p>
                  <hr />
                  <strong>
                    <i className="fas fa-pencil-alt mr-1" /> Phone
                  </strong>
                  <p className="text-muted">
                    {shopInfo?.shop?.owner?.phone_number}
                  </p>
                  <hr />
                </div>
                {/* /.card-body */}
              </div>
            </div>
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
