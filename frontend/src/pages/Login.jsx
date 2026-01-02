import React from "react";
import sunumImg from "/sunum.png";

const Login = () => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0f0f1a] via-[#121225] to-[#0b0b14] flex items-center justify-center px-6">
      {/* FLOAT ANİMASYONU */}
      <style>
        {`
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-12px); }
            100% { transform: translateY(0px); }
          }
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
        `}
      </style>

      <div className="max-w-6xl w-full flex rounded-3xl overflow-hidden">
        {/* SOL KUTU – LOGIN */}
        <div className="w-full lg:w-[45%] bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-2xl shadow-[0_0_40px_rgba(99,102,241,0.25)]">
          {/* LOGO / BAŞLIK */}
          <h1 className="text-3xl font-bold text-white mb-2">PitchMate</h1>
          <p className="text-gray-400 mb-8">AI Presentation Coach</p>

          {/* INPUTLAR */}
          <div className="space-y-5">
            <input
              type="text"
              placeholder="Kullanıcı adı"
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="password"
              placeholder="Şifre"
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* HATIRLA + UNUTTUM */}
          <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="accent-indigo-500" />
              Beni hatırla
            </label>
            <span className="hover:text-indigo-400 cursor-pointer">
              Şifremi unuttum
            </span>
          </div>

          {/* GİRİŞ BUTONU */}
          <button
            className="
              w-full mt-6 py-4 rounded-xl text-white font-bold
              bg-gradient-to-r from-indigo-500 to-purple-600
              hover:from-indigo-600 hover:to-purple-700
              shadow-lg shadow-indigo-500/40
              transition-all duration-300
              hover:scale-[1.01] active:scale-[0.98]
            "
          >
            Giriş Yap
          </button>

          {/* AYRAÇ */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-gray-500 text-xs tracking-widest uppercase">
              veya
            </span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          {/* GOOGLE */}
          <button
            className="
              w-full py-3 rounded-xl bg-white text-black font-semibold
              hover:bg-gray-100 transition
              hover:scale-[1.01] active:scale-[0.98]
            "
          >
            Google ile giriş yap
          </button>

          {/* KAYIT */}
          <p className="text-center text-gray-500 text-sm mt-6">
            Hesabın yok mu?{" "}
            <span className="text-indigo-400 hover:underline cursor-pointer">
              Kayıt ol
            </span>
          </p>
        </div>

        {/* SAĞ TARAF – GÖRSEL */}
        <div className="flex w-[55%] items-center justify-center relative">
          <img
            src={sunumImg}
            alt="Sunum"
            className="max-w-[80%] opacity-80 blur-[0.3px] animate-float"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
