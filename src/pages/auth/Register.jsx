import { useState } from 'react';
import { supabase } from '../../supabase';
import { useNavigate, Link } from 'react-router-dom';
import './css/Register.css'; // Importar el archivo CSS

const Register = () => {
  const [usuario, setUsuario] = useState({
    name: "",
    email: "",
    password: "",
    type: "VENTAS",
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: usuario.email,
      password: usuario.password,
    });

    if (authError) {
      console.error("Error al registrar usuario:", authError.message);
      setError(authError.message);
      setLoading(false);
      return;
    }

    const userId = authData?.user?.id;

    if (userId) {
      const { error: dbError } = await supabase.from("users").insert([
        {
          id: userId,
          name: usuario.name,
          email: usuario.email,
          type: usuario.type,
        },
      ]);

      if (dbError) {
        console.error("Error al guardar datos del usuario:", dbError.message);
        setError(dbError.message);
        setLoading(false);
        return;
      }

      navigate("/login");
    }
    setLoading(false);
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h1 className="register-title">Registro</h1>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="register-form">
          <div className="input-group">
            <input
              type="text"
              placeholder="Nombre completo"
              value={usuario.name}
              onChange={(e) =>
                setUsuario({ ...usuario, name: e.target.value })
              }
              className="register-input"
              required
            />
          </div>

          <div className="input-group">
            <input
              type="email"
              placeholder="Correo electrónico"
              value={usuario.email}
              onChange={(e) =>
                setUsuario({ ...usuario, email: e.target.value })
              }
              className="register-input"
              required
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="Contraseña"
              value={usuario.password}
              onChange={(e) =>
                setUsuario({ ...usuario, password: e.target.value })
              }
              className="register-input"
              required
              minLength="6"
            />
          </div>

          <div className="input-group">
            <select
              value={usuario.type}
              onChange={(e) =>
                setUsuario({ ...usuario, type: e.target.value })
              }
              className="register-select"
              required
            >
              <option value="VENTAS">Ventas</option>
              <option value="INGENIERO">Ingeniero</option>
            </select>
          </div>

          <button 
            type="submit" 
            className={`register-button ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <div className="login-link-container">
          <Link to="/login" className="login-link">
            ¿Ya tienes cuenta? Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;