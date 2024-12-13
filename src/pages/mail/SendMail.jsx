import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import mailService from "./../../services/mailService";
import $ from "jquery";
import "summernote/dist/summernote-lite.css";
import "summernote/dist/summernote-lite.js";

export default function SendMail() {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const handleSendEmail = async (e) => {
    e.preventDefault();
    try {
      const response = await mailService.sendMail({
        subject,
        content,
      });
      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "Emails sent successfully!",
          showConfirmButton: false,
          timer: 1500,
        });
        setSubject("");
        setContent("");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error sending emails",
        text:
          error.response?.data?.message ||
          "An error occurred while sending emails.",
      });
    }
  };
  useEffect(() => {
    $("#compose-textarea").summernote({
      height: 300,
      callbacks: {
        onChange: function (contents, $editable) {
          setContent(contents);
        },
      },
    });
  }, []);
  return (
    <div className="content-wrapper" style={{ minHeight: "1302.4px" }}>
      {/* Content Header (Page header) */}
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Compose</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <Link to="#">Home</Link>
                </li>
                <li className="breadcrumb-item active">Compose</li>
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
            <div className="col-md-3">
              <Link
                to="mailbox.html"
                className="btn btn-primary btn-block mb-3"
              >
                Back to Inbox
              </Link>
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Folders</h3>
                  <div className="card-tools">
                    <button
                      type="button"
                      className="btn btn-tool"
                      data-card-widget="collapse"
                    >
                      <i className="fas fa-minus" />
                    </button>
                  </div>
                </div>
                <div className="card-body p-0">
                  <ul className="nav nav-pills flex-column">
                    <li className="nav-item active">
                      <Link to="#" className="nav-link">
                        <i className="fas fa-inbox mx-2" /> Inbox
                        <span className="badge bg-primary float-right">12</span>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link to="#" className="nav-link">
                        <i className="far fa-envelope mx-2" /> Sent
                      </Link>
                    </li>
                  </ul>
                </div>
                {/* /.card-body */}
              </div>
              {/* /.card */}

              {/* /.card */}
            </div>
            {/* /.col */}
            <div className="col-md-9">
              <form onSubmit={handleSendEmail}>
                <div className="card card-primary card-outline">
                  <div className="card-header">
                    <h3 className="card-title">Compose New Message</h3>
                  </div>
                  {/* /.card-header */}

                  <div className="card-body">
                    <div className="form-group">
                      <input
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="form-control"
                        placeholder="Subject:"
                      />
                    </div>
                    <div className="form-group">
                      {" "}
                      <textarea
                        id="compose-textarea"
                        className="form-control"
                        value={content}
                        style={{ display: "none" }}
                      />{" "}
                    </div>
                  </div>

                  {/* /.card-body */}
                  <div className="card-footer">
                    <div className="float-right">
                      <button type="submit" className="btn btn-primary mx-2">
                        <i className="far fa-envelope mx-2" /> Send
                      </button>
                    </div>
                    <button type="reset" className="btn btn-default">
                      <i className="fas fa-times mx-2" /> Discard
                    </button>
                  </div>
                  {/* /.card-footer */}
                </div>
              </form>
              {/* /.card */}
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
