import { useState } from 'react';
import { supabase } from '../../supabase';
import { Link, useNavigate } from 'react-router-dom';
import './css/Login.css'; // Asegúrate de que este archivo exista

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setError(error.message);
    } else {
      console.log("Login exitoso", data);
      navigate("/dashboard");
    }
  };

  return (
    <div className='login-container'>
      <div className="login-card">
        <h1 className='login-title'>
          Iniciar Sesión
        </h1>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className='login-form'>
          <div className="input-group">
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
              required
            />
          </div>
          
          <div className="input-group">
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="login-button"
          >
            Ingresar
          </button>
        </form>
        
        <div className="register-link-container">
          <Link 
            to="/register" 
            className="register-link"
          >
            ¿No tienes cuenta? Regístrate
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;