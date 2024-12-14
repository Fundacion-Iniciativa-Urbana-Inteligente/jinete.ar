import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext'; // Importar contexto del usuario

const Login = () => {
  const [formState, setFormState] = useState({
    phone: '',
    password: '',
    otp: '',
    newPassword: '',
    step: 1, // Maneja pasos: 1=Solicitar OTP, 2=Validar OTP, 3=Restablecer contraseña
  });
  const [error, setError] = useState('');
  const { setUser } = useContext(UserContext); // Obtener el setter del usuario desde el contexto
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  // Manejar inicio de sesión
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Resetear error previo
    try {
      const response = await fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formState.phone,
          password: formState.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al iniciar sesión.');
      }

      const data = await response.json();

      // Guardar el usuario en el contexto y en localStorage
      setUser({ name: data.name }); // Actualiza el contexto global
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({ name: data.name }));

      alert(data.message);
      navigate('/'); // Redirigir a la página principal
    } catch (error) {
      console.error('Error en el inicio de sesión:', error);
      setError(error.message);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('http://localhost:8080/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formState.phone }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al solicitar OTP.');
      }

      alert('OTP enviado con éxito.');
      setFormState({ ...formState, step: 2 }); // Pasar al siguiente paso
    } catch (error) {
      setError(error.message);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('http://localhost:8080/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formState.phone,
          otp: formState.otp,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al validar OTP.');
      }

      alert('OTP validado con éxito.');
      setFormState({ ...formState, step: 3 }); // Pasar al siguiente paso
    } catch (error) {
      setError(error.message);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('http://localhost:8080/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formState.phone,
          newPassword: formState.newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al restablecer la contraseña.');
      }

      alert('Contraseña restablecida con éxito.');
      setFormState({ ...formState, step: 1 }); // Volver al inicio de sesión
      navigate('/login');
    } catch (error) {
      setError(error.message);
    }
  };

  const renderForm = () => {
    switch (formState.step) {
      case 1:
        return (
          <form onSubmit={handleForgotPassword}>
            <h3>Recuperar Contraseña</h3>
            <input
              type="text"
              placeholder="Teléfono"
              name="phone"
              value={formState.phone}
              onChange={handleChange}
              required
            />
            <button type="submit">Enviar OTP</button>
          </form>
        );
      case 2:
        return (
          <form onSubmit={handleVerifyOtp}>
            <h3>Validar OTP</h3>
            <input
              type="text"
              placeholder="Código OTP"
              name="otp"
              value={formState.otp}
              onChange={handleChange}
              required
            />
            <button type="submit">Validar</button>
          </form>
        );
      case 3:
        return (
          <form onSubmit={handleResetPassword}>
            <h3>Restablecer Contraseña</h3>
            <input
              type="password"
              placeholder="Nueva Contraseña"
              name="newPassword"
              value={formState.newPassword}
              onChange={handleChange}
              required
            />
            <button type="submit">Restablecer Contraseña</button>
          </form>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <h2>Iniciar Sesión</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {formState.step === 1 ? (
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Teléfono"
            name="phone"
            value={formState.phone}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            name="password"
            value={formState.password}
            onChange={handleChange}
            required
          />
          <button type="submit">Iniciar Sesión</button>
          <button type="button" onClick={() => setFormState({ ...formState, step: 1 })}>
            ¿Olvidaste tu contraseña?
          </button>
        </form>
      ) : (
        renderForm()
      )}
    </div>
  );
};

export default Login;
