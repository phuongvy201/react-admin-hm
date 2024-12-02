import React, { useEffect, useState } from "react";
import postService from "../../services/postService";
import { Link } from "react-router-dom";
import { urlImage } from "../../config";
import Toast from "sweetalert2";
import Swal from "sweetalert2";
export default function PostList() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      const response = await postService.getAllPost();
      console.log(response);
      if (response.data.status === "success") {
        setPosts(response.data.data);
      }
    } catch (err) {
      setError("Không thể tải danh sách sản phẩm");
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
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th style={{ width: 10 }}>ID</th>
                        <th style={{ width: 250 }}>Post</th>
                        <th style={{ width: 150 }}>Seller</th>
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
                          <td>{post.user && <div>{post.user.name}</div>}</td>
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
                                  post.status ? "fa-toggle-on" : "fa-toggle-off"
                                }`}
                              />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
