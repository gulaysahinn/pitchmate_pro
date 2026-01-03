import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const Layout = () => {
  return (
    <div className="flex w-full h-screen bg-[#09090b] text-white overflow-hidden">
      {/* --- SIDEBAR KUTUSU --- */}
      {/* "w-64" genişliği BURADA veriliyor. Eğer bu olmazsa Sidebar görünmez. */}
      {/* "hidden md:block" kısmını şimdilik siliyorum ki her boyutta görünsün, test edelim */}
      <aside className="w-64 h-full flex-shrink-0 border-r border-white/5">
        <Sidebar />
      </aside>

      {/* --- İÇERİK ALANI --- */}
      <main className="flex-1 h-full overflow-y-auto relative scroll-smooth p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
