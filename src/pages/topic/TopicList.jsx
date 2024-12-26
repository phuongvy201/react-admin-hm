import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import postService from "../../services/postService";
import Swal from "sweetalert2";
import topicService from "../../services/topicService";
import Toast from "sweetalert2";

export default function TopicList() {
  const [topics, setTopics] = useState([]);
  const fetchTopics = async () => {
    try {
      const response = await postService.getTopics();
      setTopics(response.data.data); // Giả sử API trả về data trong response.data.data
    } catch (error) {
      console.error("Error fetching topics:", error);
    }
  };

  fetchTopics();
  useEffect(() => {
    fetchTopics();
  }, []);
  const handleDeleteProduct = async (id) => {
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
        const response = await topicService.deleteTopic(id);

        if (response.data.success) {
          Toast.fire({
            icon: "success",
            title: "Deleted successfully!",
          });
          fetchTopics();
          // Gọi lại hàm load dữ liệu
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
              <h1>Topic List</h1>
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
                  {topics.length === 0 ? (
                    <p>No topics available.</p>
                  ) : (
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th style={{ width: 10 }}>ID</th>
                          <th style={{ width: 250 }}>Name</th>
                          <th>Slug</th>
                          <th style={{ width: 200 }}>Created By</th>
                          <th style={{ width: 200 }}>Status</th>
                          <th style={{ width: 200 }}>Created At</th>
                          <th style={{ width: 200 }}>Operation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topics.map((topic) => (
                          <tr key={topic.id}>
                            <td>{topic.id}</td>
                            <td>
                              <Link
                                to={`/topic/${topic.id}`}
                                className="text-decoration-none text-dark mb-2"
                              >
                                {topic.name}
                              </Link>
                            </td>
                            <td>{topic.slug}</td>
                            <td>{topic.created_by}</td>
                            <td>{topic.status ? "Active" : "Inactive"}</td>
                            <td>
                              {new Date(topic.created_at).toLocaleDateString()}
                            </td>
                            <td>
                              <button
                                className="btn btn-danger btn-sm mx-1"
                                title="Delete"
                                onClick={() => handleDeleteProduct(topic.id)}
                              >
                                <i className="fa-solid fa-trash-can" />
                              </button>
                              <Link
                                to={`/topic/edit/${topic.id}`}
                                className="btn btn-info btn-sm mx-1"
                                title="Edit"
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
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
