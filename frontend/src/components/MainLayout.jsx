import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const MainLayout = () => {
  return (
    <div className="flex w-full h-screen bg-[#09090b] text-white overflow-hidden">
      {/* Sol taraf: Sabit Menü */}
      <Sidebar />

      {/* Sağ taraf: Değişen İçerik */}
      <main className="flex-1 h-full overflow-hidden relative">
        <Outlet /> {/* Burası Dashboard, History veya Result olacak */}
      </main>
    </div>
  );
};

export default MainLayout;
