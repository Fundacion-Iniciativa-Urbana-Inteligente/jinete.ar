import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const Verify = () => {
  const { userId } = useParams();
  const [otp, setOtp] = useState('');
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, otp }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al verificar OTP.');
      }

      const data = await response.json();
      alert(data.message);
      navigate('/login'); // Redirige a la página de inicio de sesión
    } catch (error) {
      console.error('Error en la verificación:', error);
      alert(error.message);
    }
  };

  return (
    <div>
      <h2>Verificar Número</h2>
      <form onSubmit={handleVerify}>
        <input
          type="text"
          placeholder="Código OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />
        <button type="submit">Verificar</button>
      </form>
    </div>
  );
};

export default Verify;
