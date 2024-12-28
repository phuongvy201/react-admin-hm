import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import authService from "../../services/authService";
import profileService from "../../services/profileService";
import { urlImage } from "./../../config";
import logo from "../../assets/imgs/bluprinter logo.png";

export default function NavBar() {
  const sellerId = JSON.parse(localStorage.getItem("user")).id;
  // const token = localStorage.getItem("token");
  // alert(token);
  const [shopInfo, setShopInfo] = useState(null);
  const [activeMenus, setActiveMenus] = useState({
    order: false,
    product: false,
    post: false,
    discount: false,
  });

  const toggleMenu = (menuName) => {
    setActiveMenus((prev) => {
      const newActiveMenus = Object.keys(prev).reduce((acc, key) => {
        acc[key] = key === menuName ? !prev[key] : false;
        return acc;
      }, {});
      return newActiveMenus;
    });
  };

  useEffect(() => {
    if (sellerId) {
      profileService
        .getShopInfo(sellerId)
        .then((res) => {
          setShopInfo(res.data);
        })
        .catch((err) => {
          console.error("Error fetching shop info:", err);
        });
    }
  }, [sellerId]);
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await authService.logout();

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
    }
  };

  return (
    <>
      <aside className="main-sidebar sidebar-dark-primary elevation-4">
        {/* Brand Logo */}
        <Link to="index3.html" className="brand-link">
          <img
            src={logo}
            alt="AdminLTE Logo"
            className="brand-image  elevation-3"
            style={{ opacity: ".8" }}
          />
          <span className="brand-text font-weight-light">Seller HM</span>
        </Link>
        {/* Sidebar */}
        <div className="sidebar os-host os-theme-light os-host-overflow os-host-overflow-y os-host-resize-disabled os-host-scrollbar-horizontal-hidden os-host-transition">
          <div className="os-resize-observer-host observed">
            <div
              className="os-resize-observer"
              style={{ left: 0, right: "auto" }}
            />
          </div>
          <div
            className="os-size-auto-observer observed"
            style={{ height: "calc(100% + 1px)", float: "left" }}
          >
            <div className="os-resize-observer" />
          </div>
          <div
            className="os-content-glue"
            style={{ margin: "0px -8px", width: 249, height: 438 }}
          />
          <div className="os-padding">
            <div
              className="os-viewport os-viewport-native-scrollbars-invisible"
              style={{ overflowY: "scroll" }}
            >
              <div
                className="os-content"
                style={{ padding: "0px 8px", height: "100%", width: "100%" }}
              >
                {/* Sidebar user panel (optional) */}
                <div className="user-panel mt-3 pb-3 mb-3 d-flex">
                  <div className="image">
                    {shopInfo?.shop?.logo_url ? (
                      <img
                        src={urlImage + shopInfo.shop.logo_url}
                        className="img-circle elevation-2"
                        alt="UserImage"
                        style={{
                          objectFit: "cover",
                          width: "30px",
                          height: "30px",
                        }}
                      />
                    ) : (
                      ""
                    )}
                  </div>
                  <div className="info">
                    <Link to="/seller/profile" className="d-block">
                      {shopInfo?.shop.shop_name}
                    </Link>
                  </div>
                </div>
                {/* SidebarSearch Form */}
                {/* Sidebar Menu */}
                <nav className="mt-2">
                  <ul
                    className="nav nav-pills nav-sidebar flex-column"
                    data-widget="treeview"
                    role="menu"
                    data-accordion="false"
                  >
                    {/* Add icons to the links using the .nav-icon class
         with font-awesome or any other icon font library */}
                    <li className="nav-item">
                      <Link
                        to="/seller/orders"
                        onClick={() => toggleMenu("order")}
                        className={`nav-link ${
                          activeMenus.order ? "active" : ""
                        }`}
                      >
                        <i className="nav-icon fa-regular fa-file-lines" />
                        <p>
                          Order
                          <span className="right badge badge-danger">New</span>
                        </p>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link
                        onClick={() => toggleMenu("template")}
                        className={`nav-link ${
                          activeMenus.template ? "active" : ""
                        }`}
                      >
                        <i className="fa-solid fa-box-open nav-icon" />
                        <p>
                          Template
                          <i className="fas fa-angle-left right" />
                        </p>
                      </Link>
                      <ul
                        className="nav nav-treeview"
                        style={{
                          display: activeMenus.template ? "block" : "none",
                        }}
                      >
                        <li className="nav-item">
                          <Link to="/seller/templates" className="nav-link">
                            <i className="far fa-circle nav-icon" />
                            <p>Template List</p>
                          </Link>
                        </li>
                        <li className="nav-item">
                          <Link
                            to="/seller/templates/add-template"
                            className="nav-link"
                          >
                            <i className="far fa-circle nav-icon" />
                            <p>Add Template</p>
                          </Link>
                        </li>
                      </ul>
                    </li>
                    <li className="nav-item">
                      <Link
                        onClick={() => toggleMenu("product")}
                        className={`nav-link ${
                          activeMenus.product ? "active" : ""
                        }`}
                      >
                        <i className="fa-solid fa-box-open nav-icon" />
                        <p>
                          Product
                          <i className="fas fa-angle-left right" />
                        </p>
                      </Link>
                      <ul
                        className="nav nav-treeview"
                        style={{
                          display: activeMenus.product ? "block" : "none",
                        }}
                      >
                        <li className="nav-item">
                          <Link to="/seller/products" className="nav-link">
                            <i className="far fa-circle nav-icon" />
                            <p>Product List</p>
                          </Link>
                        </li>
                        {/* <li className="nav-item">
                          <Link to="/seller/addproduct" className="nav-link">
                            <i className="far fa-circle nav-icon" />
                            <p>Add Product</p>
                          </Link>
                        </li> */}
                      </ul>
                    </li>

                    <li className="nav-item">
                      <Link
                        onClick={() => toggleMenu("post")}
                        className={`nav-link ${
                          activeMenus.post ? "active" : ""
                        }`}
                      >
                        <i className="fa-solid fa-file nav-icon" />
                        <p>
                          Post
                          <i className="fas fa-angle-left right" />
                        </p>
                      </Link>
                      <ul
                        className="nav nav-treeview"
                        style={{ display: activeMenus.post ? "block" : "none" }}
                      >
                        <li className="nav-item">
                          <Link to="/seller/posts" className="nav-link">
                            <i className="far fa-circle nav-icon" />
                            <p>Post List</p>
                          </Link>
                        </li>
                        <li className="nav-item">
                          <Link to="/seller/addPost" className="nav-link">
                            <i className="far fa-circle nav-icon" />
                            <p>Add Post</p>
                          </Link>
                        </li>
                      </ul>
                    </li>

                    <li className="nav-item">
                      <Link
                        onClick={() => toggleMenu("discount")}
                        className={`nav-link ${
                          activeMenus.discount ? "active" : ""
                        }`}
                      >
                        <i className="fa-solid fa-percent nav-icon" />
                        <p>
                          Discount
                          <i className="fas fa-angle-left right" />
                        </p>
                      </Link>
                      <ul
                        className="nav nav-treeview"
                        style={{
                          display: activeMenus.discount ? "block" : "none",
                        }}
                      >
                        <li className="nav-item">
                          <Link to="/seller/discounts" className="nav-link">
                            <i className="far fa-circle nav-icon" />
                            <p>Discount List</p>
                          </Link>
                        </li>
                        <li className="nav-item">
                          <Link to="/seller/addDiscount" className="nav-link">
                            <i className="far fa-circle nav-icon" />
                            <p>Add Discount</p>
                          </Link>
                        </li>
                      </ul>
                    </li>
                    <li className="nav-item">
                      <Link
                        to="/seller/updateProfile"
                        onClick={() => toggleMenu("profile")}
                        className={`nav-link ${
                          activeMenus.profile ? "active" : ""
                        }`}
                      >
                        <i className="nav-icon fa-regular fa-file-lines" />
                        <p>Shop Profile</p>
                      </Link>
                    </li>
                    <li className="nav-header">LABELS</li>
                    <li className="nav-item">
                      <Link to="#" className="nav-link">
                        <i className="nav-icon far fa-circle text-danger" />
                        <p className="text">Important</p>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link to="#" className="nav-link">
                        <i className="nav-icon far fa-circle text-warning" />
                        <p>Warning</p>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link to="#" className="nav-link">
                        <i className="nav-icon far fa-circle text-info" />
                        <p>Informational</p>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link onClick={handleLogout} className="nav-link">
                        <i className="fa-solid fa-right-from-bracket nav-icon" />
                        <p>Logout</p>
                      </Link>
                    </li>
                  </ul>
                </nav>
                {/* /.sidebar-menu */}
              </div>
            </div>
          </div>
          <div className="os-scrollbar os-scrollbar-horizontal os-scrollbar-unusable os-scrollbar-auto-hidden">
            <div className="os-scrollbar-track">
              <div
                className="os-scrollbar-handle"
                style={{ width: "100%", transform: "translate(0px, 0px)" }}
              />
            </div>
          </div>
          <div className="os-scrollbar os-scrollbar-vertical os-scrollbar-auto-hidden">
            <div className="os-scrollbar-track">
              <div
                className="os-scrollbar-handle"
                style={{ height: "64.9408%", transform: "translate(0px, 0px)" }}
              />
            </div>
          </div>
          <div className="os-scrollbar-corner" />
        </div>
        {/* /.sidebar */}
      </aside>
    </>
  );
}
