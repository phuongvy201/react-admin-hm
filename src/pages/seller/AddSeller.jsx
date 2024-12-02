import React, { useState } from "react";
import { Link } from "react-router-dom";
import sellerService from "../../services/sellerService";
import Swal from "sweetalert2";
export default function AddSeller() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [gender, setGender] = useState("");
  const [status, setStatus] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    const sellerData = new FormData();
    sellerData.append("name", name);
    sellerData.append("phone_number", phone);
    sellerData.append("address", address);
    sellerData.append("gender", parseInt(gender));
    sellerData.append("status", parseInt(status));
    sellerData.append("email", email);
    sellerData.append("password", password);
    sellerData.append("role", "employee");
    sellerData.append("created_by", 1);
    sellerData.append("updated_by", 1);
    sellerService
      .createEmployee(sellerData)
      .then((response) => {
        if (response.data.success) {
          // Thông báo thành công
          Toast.fire({
            icon: "success",
            title: "Thêm nhân viên thành công!",
          });

          // Reset form

          // Reset description
          setName("");
          setPhone("");
          setAddress("");
          setGender("");
          setStatus(1);
          setEmail("");
          setPassword("");

          // Scroll to top
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      })
      .catch((error) => {
        console.error("Error details:", error.response?.data); // Log chi tiết lỗi
        Toast.fire({
          icon: "error",
          title:
            error.response?.data?.message || "Có lỗi xảy ra khi thêm nhân viên!",
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
              <h1>Seller Add</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <Link to="#">Home</Link>
                </li>
                <li className="breadcrumb-item active">Seller Add</li>
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
            <div className="col-md-6">
              <div className="card card-info">
                <div className="card-header">
                  <h3 className="card-title">Personal Information</h3>
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
                    <label htmlFor="inputPhone">Phone</label>
                    <input
                      type="number"
                      id="inputPhone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter a phone"
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="inputPhone">Address</label>
                    <input
                      type="text"
                      id="inputPhone"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter an address"
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="inputStatus">Gender</label>
                    <select
                      id="inputStatus"
                      className="form-control custom-select"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                    >
                      <option selected value="">
                        Select one
                      </option>
                      <option value="1">Male</option>
                      <option value="2">Female</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="inputStatus">Status</label>
                    <select
                      id="inputStatus"
                      className="form-control custom-select"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="1">Active</option>
                      <option value="2">Inactive</option>
                    </select>
                  </div>
                </div>
                {/* /.card-body */}
              </div>
              {/* /.card */}
            </div>
            <div className="col-md-6">
              <div className="card card-info">
                <div className="card-header">
                  <h3 className="card-title">Account Information</h3>
                </div>
                <div className="card-body">
                  <div className="form-group">
                    <label htmlFor="inputEmail">Email</label>
                    <input
                      type="email"
                      id="inputEmail"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter an email"
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="inputPassword">Password</label>
                    <input
                      type="password"
                      id="inputPassword"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter a password"
                      className="form-control"
                    />
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
                Create Seller
              </button>
            </div>
          </div>
        </form>
      </section>
      {/* /.content */}
    </div>
  );
}
