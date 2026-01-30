// UserDropdown.tsx
import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext"

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();


  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleLogout = async () => {
    closeDropdown();

    const isDarkMode = document.documentElement.classList.contains('dark');

    const result = await Swal.fire({
      title: '¿Deseas cerrar sesión?',
      text: 'Tu sesión se cerrará y deberás iniciar sesión nuevamente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
      background: isDarkMode ? '#1f2937' : '#ffffff',
      color: isDarkMode ? '#e5e7eb' : '#111827',
      confirmButtonColor: '#005E56',
      cancelButtonColor: isDarkMode ? '#374151' : '#d33',
      customClass: {
        popup: isDarkMode ? 'rounded-xl' : '',
        title: 'text-lg font-semibold',
        htmlContainer: 'text-sm'
      }
    });

    if (!result.isConfirmed) return;

    try {
      await logout();
      window.location.href = '/auth';
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cerrar sesión correctamente.'
      });
    }
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center text-gray-700 dropdown-toggle dark:text-gray-400"
      >
        <span className="block mr-1 font-medium text-theme-xl text-warning-500 dark:text-warning-400 uppercase">
          {user ?? 'Usuario'}
        </span>

        <svg
          className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        <div>
          <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
            {user}
          </span>
          <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
            Sistema Cartera Castigada
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2 mt-3 font-medium text-gray-700 rounded-lg hover:bg-red-100 dark:text-gray-400 dark:hover:bg-red-600/20 text-theme-sm"
        >
          Cerrar Sesión
        </button>
      </Dropdown>
    </div>
  );
}