import React from "react";
import backgroundImage from '/images/logo/F2.jpg';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: `url('${backgroundImage}')` }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-xs"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center p-4 lg:p-8">
        {/* Cambia mx-auto por ml-0 para quitar el margen automático */}
        <div className="w-full">
          <div className="flex flex-col lg:flex-row items-start lg:items-center">
            {/* Formulario de login - Quita lg:pr-12 y ajusta el ancho */}
            <div className="w-full lg:w-5/12 xl:w-3/12">
              {children}
            </div>
          </div>

          {/* Footer fijo en la parte inferior */}
          <footer className="absolute bottom-6 left-0 right-0 text-center text-white/80 text-md">
            <p>© Coopserp | Cartera Castigada • Desarrollado por COOPSERP</p>
            <div className="flex justify-center gap-6 mt-2">
              <a
                href="https://www.coopserp.com/wp1/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/100 hover:text-white transition-colors"
              >
                Página WEB
              </a>
              <a
                href="http://intranet.coopserp.com/wp/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/100 hover:text-white transition-colors"
              >
                Intranet
              </a>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}