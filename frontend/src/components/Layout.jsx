import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-[#09090b] font-sans text-white">
      {/* 1. Sidebar Bileşeni (Sabit) */}
      <Sidebar />

      {/* 2. İçerik Alanı (Dinamik) */}
      {/* ml-64: Sidebar genişliği (16rem/256px) kadar soldan boşluk bırakır */}
      <main className="flex-1 ml-64 p-8 transition-all duration-300">
        {children}
      </main>
    </div>
  );
};

export default Layout;
