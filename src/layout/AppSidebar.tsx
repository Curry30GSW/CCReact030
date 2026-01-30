import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";

import {
  CalenderIcon,
  ChevronDownIcon,
  TableIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  {
    icon: <TableIcon />,
    name: "Cartera Castigada",
    path: "/",
  },
  {
    icon: <CalenderIcon />,
    name: "Reportes y Análisis",
    path: "/resumen",
  }
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    navItems.forEach((nav, index) => {
      if (nav.subItems) {
        nav.subItems.forEach((subItem) => {
          if (isActive(subItem.path)) {
            setOpenSubmenu({
              type: "main",
              index,
            });
            submenuMatched = true;
          }
        });
      }
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: "main") => (
    <ul className="flex flex-col gap-2">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${openSubmenu?.type === menuType && openSubmenu?.index === index
                ? "bg-gradient-to-r from-[#1a3a2f]/10 to-[#005E56]/10 border-l-4 border-[#005E56] text-[#005E56] dark:text-[#005E56] dark:bg-gray-800"
                : "hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300"
                } cursor-pointer ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
                } transition-all duration-200`}
            >
              <span
                className={`menu-item-icon-size ${openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "text-[#005E56] dark:text-[#005E56]"
                  : "text-gray-600 dark:text-gray-300 group-hover:text-[#005E56] dark:group-hover:text-[#005E56]"
                  }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text font-medium">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && nav.subItems && (
                <ChevronDownIcon
                  className={`ml-auto w-4 h-4 transition-transform duration-200 ${openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                    ? "rotate-180 text-[#005E56] dark:text-[#005E56]"
                    : "text-gray-400 dark:text-gray-300"
                    }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${isActive(nav.path)
                  ? "bg-gradient-to-r from-[#1a3a2f]/10 to-[#005E56]/10 border-l-4 border-[#005E56] text-[#005E56] dark:text-white dark:bg-gray-800"
                  : "hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300"
                  } transition-all duration-200`}
              >
                <span
                  className={`menu-item-icon-size ${isActive(nav.path)
                    ? "text-[#005E56] dark:text-white"
                    : "text-gray-600 dark:text-gray-300 group-hover:text-[#005E56] dark:group-hover:text-white"
                    }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text font-medium">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-1 space-y-1 ml-11">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${isActive(subItem.path)
                        ? "bg-[#005E56]/10 text-[#005E56] dark:text-[#005E56] font-medium dark:bg-gray-800"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300"
                        }`}
                    >
                      <span className={`w-1 h-1 rounded-full mr-3 ${isActive(subItem.path) ? 'bg-[#005E56] dark:bg-[#005E56]' : 'bg-gray-400 dark:bg-gray-500'}`}></span>
                      {subItem.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-4 left-0 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200/50 dark:border-gray-700 
        ${isExpanded || isMobileOpen
          ? "w-[280px]"
          : isHovered
            ? "w-[280px]"
            : "w-[85px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo y título */}
      <div
        className={`py-6 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
          }`}
      >
        <Link
          to="/"
          className="flex flex-col items-center gap-3 text-center"
        >
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <div className="relative">
                <img
                  src="/images/logo/coopserp.png"
                  alt="Logo Coopserp"
                  className="w-[250px] h-auto"
                />
                <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#005E56] to-transparent dark:via-[#4fd1c7]"></div>
              </div>

              <div className="mt-4 text-center">
                <span className="text-md font-semibold text-[#005E56] dark:text-[#4fd1c7]">
                  Sistema Jurídico
                </span>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Gestión de Cartera Castigada
                </p>
                <div className="mt-3 h-0.5 w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700"></div>
              </div>
            </>
          ) : (
            <div className="relative">
              <img
                src="/images/logo/coopserp.png"
                alt="Logo"
                className="w-12 h-12"
              />
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 h-0.5 w-8 bg-gradient-to-r from-transparent via-[#005E56] to-transparent dark:via-[#4fd1c7]"></div>
            </div>
          )}
        </Link>
      </div>

      {/* Navegación */}
      <div className="flex-1 overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-1">
            <div>
              <h2
                className={`mb-3 text-xs font-semibold uppercase tracking-wider flex items-center leading-[20px] text-gray-500 dark:text-gray-400 ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  <>
                    <span className="mr-2 h-3 w-0.5 bg-[#005E56] dark:bg-[#4fd1c7]"></span>
                    MÓDULOS
                  </>
                ) : (
                  <span className="h-6 w-0.5 bg-[#005E56] dark:bg-[#4fd1c7]"></span>
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>
          </div>
        </nav>
      </div>

      {/* Información de versión o estado - AL FINAL */}
      <div className={`mt-auto border-t border-gray-200/50 dark:border-gray-700 ${!isExpanded && !isHovered && !isMobileOpen ? 'px-2' : 'px-4'}`}>
        <div className={`py-4 text-center ${!isExpanded && !isHovered && !isMobileOpen ? 'flex flex-col items-center' : ''}`}>
          {(isExpanded || isHovered || isMobileOpen) ? (
            <>
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs font-medium text-[#005E56] dark:text-green-400">
                  Sistema Activo
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Versión 1.0.0
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500">
                © {new Date().getFullYear()} COOPSERP
              </p>
            </>
          ) : (
            // Versión mini para sidebar colapsado
            <div className="flex flex-col items-center space-y-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <p className="text-[8px] text-gray-400 dark:text-gray-500 text-center">
                v1.0
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;