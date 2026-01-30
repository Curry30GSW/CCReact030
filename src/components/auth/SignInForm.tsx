import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Swal from "sweetalert2";
import ReCAPTCHA from "react-google-recaptcha";
import { useAuth } from "../../context/AuthContext";

export default function SignInForm() {
  const { login, authenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTime, setBlockTime] = useState(0);
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");

  const navigate = useNavigate();
  const captchaRef = useRef<ReCAPTCHA>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Cargar credenciales guardadas al iniciar
  useEffect(() => {
    const rememberedUser = localStorage.getItem('rememberedUser');
    const rememberedPassword = localStorage.getItem('rememberedPassword');

    if (rememberedUser && rememberedPassword) {
      setUser(rememberedUser);
      setPassword(rememberedPassword);
    }
  }, []);

  // Manejar bloqueo del botón
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isBlocked && blockTime > 0) {
      interval = setInterval(() => {
        setBlockTime(prev => {
          if (prev <= 1) {
            setIsBlocked(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isBlocked, blockTime]);

  // Manejar Enter en el formulario
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !loading && !isBlocked) {
        e.preventDefault();
        handleLogin();
      }
    };

    const form = formRef.current;
    if (form) {
      form.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      if (form) {
        form.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [loading, isBlocked]);


  // Si ya está autenticado, redirigir al dashboard
  useEffect(() => {
    if (authenticated) {
      const timer = setTimeout(() => {
        navigate("/castigados", { replace: true });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [authenticated, navigate]);


  const handleCaptchaChange = (token: string | null) => {
    setCaptchaToken(token || "");
  };

  const bloquearBotonLogin = (segundos: number) => {
    setIsBlocked(true);
    setBlockTime(segundos);

    // Resetear captcha
    if (captchaRef.current) {
      captchaRef.current.reset();
    }
  };

  const handleLogin = async () => {
    // Validaciones
    if (!user.trim() || !password.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos vacíos',
        text: 'Por favor ingrese ambos campos.'
      });
      return;
    }

    if (!captchaToken) {
      Swal.fire({
        icon: 'warning',
        title: 'Captcha requerido',
        text: 'Por favor verifique que no es un robot.'
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user,
          password,
          captcha: captchaToken
        }),
        credentials: 'include'
      });

      const data = await response.json();

      // Manejar demasiados intentos
      if (response.status === 429) {
        Swal.fire({
          icon: 'warning',
          title: 'Demasiados intentos',
          text: data.message
        });

        // Extraer tiempo de bloqueo del mensaje
        const match = data.message.match(/en (\d+) segundos/);
        if (match) {
          const segundos = parseInt(match[1], 10);
          bloquearBotonLogin(segundos);
        }

        setLoading(false);
        return;
      }

      // Manejar error de credenciales
      if (!response.ok) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.message || 'Credenciales incorrectas.'
        }).then(() => {
          // Resetear captcha
          if (captchaRef.current) {
            captchaRef.current.reset();
          }
          setCaptchaToken("");
        });
        setLoading(false);
        return;
      }


      // Login exitoso
      Swal.fire({
        icon: 'success',
        title: 'Bienvenido',
        html: `Usuario <strong>${user.toUpperCase()}</strong> ingresado con éxito.`,
        timer: 2000,
        showConfirmButton: false
      }).then(() => {
        navigate("/castigados");
      });

      await login();

    } catch (error) {
      console.error('Error en el login:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al intentar ingresar.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 w-full max-w-md mx-auto">
      {/* Tarjeta de login */}
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Header de la tarjeta */}
        <div className="bg-[#005E56] py-4 px-6">
          <h4 className="text-white text-xl font-bold text-center">
            COOPSERP | Cartera Castigada
          </h4>
        </div>

        {/* Contenido del formulario */}
        <div className="p-6">
          <form ref={formRef} className="space-y-6">
            {/* Campo Usuario */}
            <div className="relative group">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Usuario
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  className="w-full px-4 py-3 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005E56] focus:border-transparent transition-all duration-300"
                  placeholder="Ingrese su usuario"
                  required
                  disabled={loading || isBlocked}
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div className="relative group">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005E56] focus:border-transparent transition-all duration-300 pr-12"
                  placeholder="Ingrese su contraseña"
                  required
                  disabled={loading || isBlocked}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-[#005E56] transition-colors"
                  disabled={loading || isBlocked}
                >
                  {showPassword ? (
                    <EyeCloseIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>


            {/* reCAPTCHA */}
            <div className="flex justify-center">
              <ReCAPTCHA
                ref={captchaRef}
                sitekey="6LcCHpYrAAAAAPF4CUkS4fUfXcE4rekGxIurhsk1"
                onChange={handleCaptchaChange}
                theme="light"
              />
            </div>

            {/* Botón de inicio de sesión */}
            <button
              ref={buttonRef}
              type="button"
              onClick={handleLogin}
              disabled={loading || isBlocked || !captchaToken}
              className="w-full py-3 text-white font-semibold rounded-lg bg-[#005E56] hover:bg-[#004a44] focus:outline-none focus:ring-2 focus:ring-[#005E56] focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isBlocked ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  </svg>
                  Bloqueado ({blockTime}s)
                </span>
              ) : loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Iniciando sesión...
                </span>
              ) : (
                "Iniciar Sesión"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}