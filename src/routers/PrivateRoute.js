import { Navigate } from "react-router-dom";

const PrivateRoute = ({ element: Component, roles, ...rest }) => {
  const user = JSON.parse(localStorage.getItem("user")); // Giả sử vai trò người dùng được lưu trong localStorage

  if (!user) {
    // Nếu người dùng chưa đăng nhập, chuyển hướng tới trang đăng nhập
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(user.role)) {
    // Nếu người dùng không có vai trò yêu cầu, chuyển hướng tới trang không được phép truy cập hoặc trang chủ
    return <Navigate to="*" replace />;
  }

  return <Component {...rest} />;
};

export default PrivateRoute;
