import React from "react";

import { Outlet } from "react-router-dom";
import Header from "./Header";
import NavBar from "./NavBar";

export default function LayoutAdmin() {
  return (
    <div className="wrapper">
      {/* Navbar */}
      <Header />
      {/* /.navbar */}
      {/* Main Sidebar Container */}
      <NavBar />
      {/* Content Wrapper. Contains page content */}
      <Outlet />
      {/* /.content-wrapper */}
      <footer className="main-footer">
        <strong>
          Copyright © 2014-2021 <a href="https://adminlte.io">AdminLTE.io</a>.
        </strong>
        All rights reserved.
        <div className="float-right d-none d-sm-inline-block">
          <b>Version</b> 3.1.0
        </div>
      </footer>
      {/* Control Sidebar */}
      <aside className="control-sidebar control-sidebar-dark">
        {/* Control sidebar content goes here */}
      </aside>
      {/* /.control-sidebar */}
    </div>
  );
}
