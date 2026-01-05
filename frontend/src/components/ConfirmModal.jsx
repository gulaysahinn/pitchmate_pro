import { FiAlertCircle, FiX } from "react-icons/fi";

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Arka Plan Karartma */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal İçeriği */}
      <div className="relative bg-[#121217] border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-zoom-in overflow-hidden">
        {/* Dekoratif Işık */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-[50px] -mr-16 -mt-16" />

        <div className="flex flex-col items-center text-center relative z-10">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mb-6 border border-red-500/20">
            <FiAlertCircle size={32} />
          </div>

          <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">
            {title}
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">
            {message}
          </p>

          <div className="flex gap-4 w-full">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-widest transition-all border border-white/5"
            >
              İptal
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-6 py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-red-600/20"
            >
              Çıkış Yap
            </button>
          </div>
        </div>

        {/* Kapatma Çarpısı */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
        >
          <FiX size={20} />
        </button>
      </div>
    </div>
  );
};

export default ConfirmModal;
