import React, { useEffect, useState } from "react";
import templateService from "../../../services/templateService";
import { urlImage } from "../../../config";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { Toast } from "bootstrap";

export default function TemplateList() {
  const [templates, setTemplates] = React.useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTemplates = async (page = 1) => {
    try {
      setLoading(true);
      const response = await templateService.getTemplates();
      if (response.data.success) {
        setTemplates(response.data.data);
        setError(null);
      } else {
        setError("Không thể tải danh sách sản phẩm");
      }
    } catch (err) {
      setError("Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleDeleteTemplate = async (id) => {
    const result = await Swal.fire({
      title: "Confirm deletion?",
      text: "You cannot undo once deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      const response = await templateService.deleteTemplate(id);
      if (response.data.success) {
        Toast.fire({
          icon: "success",
          title: "Deleted successfully!",
        });
      }
      fetchTemplates();
    }
  };

  return (
    <div className="content-wrapper">
      {/* Content Header (Page header) */}
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Template</h1>
            </div>
            <div className="col-sm-6">
              <ol className="float-sm-right">
                <button className="btn btn-block btn-primary">
                  + Create Template
                </button>
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
            <div className="col-12">
              <div className="search-container-template">
                <input
                  type="search"
                  className="search-input-template"
                  placeholder="Search templates..."
                />
              </div>
              <div className="templates-grid-template">
                {templates.map((template) => (
                  <div key={template.id} className="template-card-template">
                    <img
                      src={urlImage + template.image}
                      alt={template.template_name}
                      className="template-image"
                    />
                    <div className="template-info">
                      <h4>{template.template_name}</h4>
                      <p>ID: {template.id}</p>
                    </div>
                    <div className="template-actions-template">
                      <Link
                        to={`/seller/templates/update-template/${template.id}`}
                        className="action-btn edit-btn-template"
                      >
                        <i className="fas fa-edit"></i>
                      </Link>
                      <button
                        className="action-btn delete-btn-template"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                      <button className="action-btn clone-btn-template">
                        <i className="fas fa-clone"></i>
                      </button>
                    </div>
                  </div>
                ))}
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
