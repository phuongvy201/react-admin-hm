import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Toast from "sweetalert2";
import Swal from "sweetalert2";
import postService from "../../../services/postService";
import { urlImage } from "../../../config";
export default function SellerPostList() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await postService.getPostBySeller();
      console.log(response);
      if (response.data.success) {
        setPosts(response.data.data.items);
      }
    } catch (err) {
      setError("Unable to load product list");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);
  const handleUpdateStatus = async (id) => {
    try {
      const response = await postService.updateStatus(id);
      if (response.data.success) {
        setPosts(
          posts.map((post) => {
            if (post.id === id) {
              return {
                ...post,
                status: post.status === 1 ? 0 : 1,
              };
            }
            return post;
          })
        );
        Toast.fire({
          icon: "success",
          title: "Status update successful!",
        });
      }
    } catch (err) {
      Toast.fire({
        icon: "error",
        title:
          err.response?.data?.message ||
          "An error occurred while updating status!",
      });
      console.error("Error:", err);
    }
  };
  const handleDeleteDiscount = async (id) => {
    try {
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
        const response = await postService.delete(id);

        if (response.data.success) {
          Toast.fire({
            icon: "success",
            title: "Deleted successfully!",
          });

          // Gọi lại hàm load dữ liệu
          fetchProducts();
        }
      }
    } catch (err) {
      Toast.fire({
        icon: "error",
        title:
          err.response?.data?.message || "An error occurred while deleting!",
      });
      console.error("Error:", err);
    }
  };
  return (
    <div className="content-wrapper" style={{ minHeight: "1302.4px" }}>
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Post List</h1>
            </div>
          </div>
        </div>
      </section>
      <section className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  {posts.length === 0 ? (
                    <p>No posts available.</p>
                  ) : (
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th style={{ width: 10 }}>ID</th>
                          <th style={{ width: 250 }}>Post</th>
                          <th>Topic</th>
                          <th style={{ width: 200 }}>Created_at</th>
                          <th style={{ width: 200 }}>Operation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {posts.map((post) => (
                          <tr key={post.id}>
                            <td>{post.id}</td>
                            <td>
                              <div>
                                <Link
                                  to={`/post/${post.id}`}
                                  className="text-decoration-none text-dark mb-2"
                                >
                                  {post.title}
                                </Link>
                              </div>
                              {post.image && (
                                <div>
                                  <img
                                    className="img-fluid"
                                    style={{ maxHeight: "100px" }}
                                    src={urlImage + post.image}
                                    alt={post.name}
                                  />
                                </div>
                              )}
                            </td>
                            <td>{post.topic && post.topic.name}</td>
                            <td>
                              {new Date(post.created_at).toLocaleDateString()}
                            </td>
                            <td>
                              <button
                                className="btn btn-danger btn-sm mx-1"
                                title="Delete"
                                onClick={() => handleDeleteDiscount(post.id)}
                              >
                                <i className="fa-solid fa-trash-can" />
                              </button>

                              <button
                                className={`btn ${
                                  post.status ? "btn-success" : "btn-danger"
                                } btn-sm mx-1`}
                                onClick={() => handleUpdateStatus(post.id)}
                              >
                                <i
                                  className={`fa-solid ${
                                    post.status
                                      ? "fa-toggle-on"
                                      : "fa-toggle-off"
                                  }`}
                                />
                              </button>
                              <Link
                                to={`/seller/updatePost/${post.id}`}
                                className="btn btn-info btn-sm mx-1"
                                title="View"
                              >
                                <i className="fa-solid fa-pen-to-square"></i>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
                {/* <div className="card-footer clearfix">
                  <ul className="pagination pagination-md m-0 float-right">
                    <li
                      className={`page-item ${
                        pagination.current_page === 1 ? "disabled" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() =>
                          handlePageChange(pagination.current_page - 1)
                        }
                        disabled={pagination.current_page === 1}
                      >
                        «
                      </button>
                    </li>
  
                    {[...Array(pagination.last_page)].map((_, index) => (
                      <li
                        key={index + 1}
                        className={`page-item ${
                          pagination.current_page === index + 1 ? "active" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(index + 1)}
                        >
                          {index + 1}
                        </button>
                      </li>
                    ))}
  
                    <li
                      className={`page-item ${
                        pagination.current_page === pagination.last_page
                          ? "disabled"
                          : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() =>
                          handlePageChange(pagination.current_page + 1)
                        }
                        disabled={
                          pagination.current_page === pagination.last_page
                        }
                      >
                        »
                      </button>
                    </li>
                  </ul>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
