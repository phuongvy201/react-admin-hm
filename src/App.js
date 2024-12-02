import { BrowserRouter, Route, Routes } from "react-router-dom";
import routerAdmin, { routerSeller } from "./routers";
import LayoutAdmin from "./layouts/layoutAdmin/LayoutAdmin";
import LayoutSeller from "./layouts/layoutSeller/LayoutSeller";
import Login from "./layouts/Login";
import PrivateRoute from "./routers/PrivateRoute";
import NotFound from "./components/NotFound";

function App() {
  return (
    <BrowserRouter>
      {" "}
      <Routes>
        {" "}
        <Route
          path="/admin"
          element={<PrivateRoute element={LayoutAdmin} roles={["admin"]} />}
        >
          {" "}
          {routerAdmin.map((route, index) => {
            const Page = route.component;
            return (
              <Route
                path={route.path}
                element={<PrivateRoute element={Page} roles={["admin"]} />}
                key={index}
              />
            );
          })}{" "}
        </Route>{" "}
        <Route
          path="/seller"
          element={<PrivateRoute element={LayoutSeller} roles={["employee"]} />}
        >
          {" "}
          {routerSeller.map((route, index) => {
            const Page = route.component;
            return (
              <Route
                path={route.path}
                element={<PrivateRoute element={Page} roles={["employee"]} />}
                key={index}
              />
            );
          })}{" "}
        </Route>{" "}
        <Route path="/login" element={<Login />} />{" "}
        <Route path="*" element={<NotFound />} />
      </Routes>{" "}
    </BrowserRouter>
  );
}

export default App;
