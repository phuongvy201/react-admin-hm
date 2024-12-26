import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import authService from "../../services/authService";
import logo from "../../assets/imgs/bluprinter logo.png";

export default function NavBar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  // alert(token);
  const [activeMenus, setActiveMenus] = useState({
    category: false,
    post: false,
    product: false,
    staticPage: false,
    topic: false,
    seller: false,
  });

  const toggleMenu = (menuName) => {
    setActiveMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  const handleLogout = async () => {
    try {
      // Lấy token từ localStorage
      const token = localStorage.getItem("token");

      // Gọi API đăng xuất
      await authService.logout();

      // Xóa token khỏi localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Chuyển hướng về trang login
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
            width={100}
            height={100}
            className="brand-image  elevation-3"
            style={{}}
          />
          <span className="brand-text font-weight-light">HM ADMIN</span>
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
                    <img
                      src={
                        JSON.parse(localStorage.getItem("user")).avatar
                          ? JSON.parse(localStorage.getItem("user"))
                          : "https://lremanagementllc.com/wp-content/uploads/2019/06/default-avatar.png"
                      }
                      className="img-circle elevation-2"
                      alt="UserImage"
                    />
                  </div>
                  <div className="info">
                    <Link to="#" className="d-block">
                      {JSON.parse(localStorage.getItem("user")).name}
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
                      <Link to="/admin/orders" className="nav-link">
                        <i className="nav-icon fa-regular fa-file-lines" />
                        <p>
                          Order
                          <span className="right badge badge-danger">New</span>
                        </p>
                      </Link>
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
                          <i className="right fas fa-angle-left" />
                        </p>
                      </Link>
                      <ul
                        className="nav nav-treeview"
                        style={{
                          display: activeMenus.product ? "block" : "none",
                        }}
                      >
                        <li className="nav-item">
                          <Link to="/admin/products" className="nav-link">
                            <i className="far fa-circle nav-icon" />
                            <p>Product List</p>
                          </Link>
                        </li>
                      </ul>
                    </li>
                    <li className="nav-item">
                      <Link
                        onClick={() => toggleMenu("category")}
                        className={`nav-link ${
                          activeMenus.category ? "active" : ""
                        }`}
                      >
                        <i className="fa-solid fa-table-columns nav-icon" />
                        <p>
                          Category
                          <i className="right fas fa-angle-left" />
                        </p>
                      </Link>
                      <ul
                        className="nav nav-treeview"
                        style={{
                          display: activeMenus.category ? "block" : "none",
                        }}
                      >
                        <li className="nav-item">
                          <Link to="/admin/categories" className="nav-link">
                            <i className="far fa-circle nav-icon" />
                            <p>Category List</p>
                          </Link>
                        </li>
                        <li className="nav-item">
                          <Link to="/admin/addCategory" className="nav-link">
                            <i className="far fa-circle nav-icon" />
                            <p>Add Category</p>
                          </Link>
                        </li>
                        <li className="nav-item">
                          <Link
                            to="/admin/addPriceCategory"
                            className="nav-link"
                          >
                            <i className="far fa-circle nav-icon" />
                            <p>Add Price Category</p>
                          </Link>
                        </li>
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
                          <i className="right fas fa-angle-left" />
                        </p>
                      </Link>
                      <ul
                        className="nav nav-treeview"
                        style={{ display: activeMenus.post ? "block" : "none" }}
                      >
                        <li className="nav-item">
                          <Link to="/admin/posts" className="nav-link">
                            <i className="far fa-circle nav-icon" />
                            <p>Post List</p>
                          </Link>
                        </li>
                      </ul>
                    </li>
                    <li className="nav-item">
                      <Link to="#" className="nav-link">
                        <i className="fa-solid fa-file-lines nav-icon" />
                        <p>
                          Static Page
                          <i className="fas fa-angle-left right" />
                        </p>
                      </Link>
                      <ul className="nav nav-treeview">
                        <li className="nav-item">
                          <Link to="/admin/pages" className="nav-link">
                            <i className="far fa-circle nav-icon" />
                            <p>Page List</p>
                          </Link>
                        </li>
                        <li className="nav-item">
                          <Link to="/admin/addPage" className="nav-link">
                            <i className="far fa-circle nav-icon" />
                            <p>Add Page</p>
                          </Link>
                        </li>
                      </ul>
                    </li>
                    <li className="nav-item">
                      <Link to="#" className="nav-link">
                        <i className="fa-solid fa-folder nav-icon" />
                        <p>
                          Topic
                          <i className="fas fa-angle-left right" />
                        </p>
                      </Link>
                      <ul className="nav nav-treeview">
                        <li className="nav-item">
                          <Link
                            to="/admin/topics"
                            className="nav-link"
                          >
                            <i className="far fa-circle nav-icon" />
                            <p>Topic List</p>
                          </Link>
                        </li>
                        <li className="nav-item">
                          <Link to="/admin/addTopic" className="nav-link">
                            <i className="far fa-circle nav-icon" />
                            <p>Add Topic</p>
                          </Link>
                        </li>
                      </ul>
                    </li>
                    <li className="nav-item">
                      <Link to="#" className="nav-link">
                        <i className="fa-solid fa-folder nav-icon" />
                        <p>
                          Mail
                          <i className="fas fa-angle-left right" />
                        </p>
                      </Link>
                      <ul className="nav nav-treeview">
                        <li className="nav-item">
                          <Link to="/admin/sendMail" className="nav-link">
                            <i className="far fa-circle nav-icon" />
                            <p>Send Mail</p>
                          </Link>
                        </li>
                      </ul>
                    </li>
                    <li className="nav-item">
                      <Link to="/admin/discounts" className="nav-link">
                        <i className="fa-solid fa-percent nav-icon" />
                        <p>Discount</p>
                      </Link>
                    </li>
                    <li className="nav-header">SYSTEM</li>
                    <li className="nav-item">
                      <Link to="#" className="nav-link">
                        <i className="fa-solid fa-person-circle-check nav-icon" />
                        <p>
                          Seller
                          <i className="fas fa-angle-left right" />
                        </p>
                      </Link>
                      <ul className="nav nav-treeview">
                        <li className="nav-item">
                          <Link to="/admin/sellers" className="nav-link">
                            <i className="far fa-circle nav-icon" />
                            <p>Seller List</p>
                          </Link>
                        </li>
                        <li className="nav-item">
                          <Link to="/admin/addSeller" className="nav-link">
                            <i className="far fa-circle nav-icon" />
                            <p>Add Seller</p>
                          </Link>
                        </li>
                      </ul>
                    </li>
                    <li className="nav-item">
                      <Link to="/admin/customers" className="nav-link">
                        <i className="fa-solid fa-person-circle-plus nav-icon" />
                        <p>Customer</p>
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
                        <i className="fa-solid fa-right-from-bracket nav-icon"></i>
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
