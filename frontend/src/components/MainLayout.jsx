import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const MainLayout = () => {
  // 🟢 Durumu burada tanımlıyoruz
  const [collapsed, setCollapsed] = useState(
    localStorage.getItem("sidebarCollapsed") === "true"
  );

  return (
    <div className="flex min-h-screen bg-[#09090b]">
      {/* 🟢 setCollapsed prop olarak Sidebar'a gönderilmeli */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <main
        className={`flex-1 transition-all duration-300 ${
          collapsed ? "pl-20" : "pl-64"
        }`}
      >
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
