import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState({ email: false, phone: false }); // Para errores específicos
  const navigate = useNavigate();

  // Función para manejar el registro
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(''); // Limpiar mensajes de error generales
    setFieldError({ email: false, phone: false }); // Limpiar mensajes de errores específicos

    try {
      const response = await fetch('http://localhost:8080/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Manejar duplicados
        if (response.status === 400 && errorData.message) {
          if (errorData.message.includes('email')) {
            setFieldError((prev) => ({ ...prev, email: true }));
          } else if (errorData.message.includes('phone')) {
            setFieldError((prev) => ({ ...prev, phone: true }));
          }

          setError(errorData.message);
          return;
        }

        // Manejar otros errores
        throw new Error(errorData.message || 'Error al registrar usuario.');
      }

      const data = await response.json();
      alert(data.message);

      // Redirigir a la página de verificación con el userId
      navigate(`/verify/${data.userId}`);
    } catch (error) {
      console.error('Error en el registro:', error);
      setError(error.message);
    }
  };

  return (
    <div>
      <h2>Registro</h2>

      {/* Mostrar mensaje de error general */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSignUp}>
        {/* Campo Nombre */}
        <div>
          <input
            type="text"
            placeholder="Nombre"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        {/* Campo Teléfono */}
        <div>
          <input
            type="text"
            placeholder="Teléfono"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
          {/* Mostrar error específico de teléfono */}
          {fieldError.phone && <p style={{ color: 'red' }}>El número de teléfono ya está registrado.</p>}
        </div>

        {/* Campo Email */}
        <div>
          <input
            type="email"
            placeholder="Correo Electrónico"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          {/* Mostrar error específico de email */}
          {fieldError.email && <p style={{ color: 'red' }}>El correo electrónico ya está registrado.</p>}
        </div>

        {/* Campo Contraseña */}
        <div>
          <input
            type="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
        </div>

        {/* Botón Registrar */}
        <button type="submit">Registrar</button>
      </form>
    </div>
  );
};

export default SignUp;