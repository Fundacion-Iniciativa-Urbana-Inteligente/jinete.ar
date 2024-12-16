import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../Context/UserContext'; // Importar contexto del usuario

const Login = () => {
  const [formState, setFormState] = useState({
    phone: '',
    password: '',
    otp: '',
    newPassword: '',
    step: 1 // Maneja pasos: 1=Solicitar OTP, 2=Validar OTP, 3=Restablecer contraseña
  });
  const [error, setError] = useState('');
  const {
    setUser
  } = useContext(UserContext); // Obtener el setter del usuario desde el contexto
  const navigate = useNavigate();
  const handleChange = e => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value
    });
  };

  // Manejar inicio de sesión
  const handleLogin = async e => {
    e.preventDefault();
    setError(''); // Resetear error previo
    try {
      const response = await fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone: formState.phone,
          password: formState.password
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al iniciar sesión.');
      }
      const data = await response.json();

      // Guardar el usuario en el contexto y en localStorage
      setUser({
        name: data.name
      }); // Actualiza el contexto global
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        name: data.name
      }));
      alert(data.message);
      navigate('/'); // Redirigir a la página principal
    } catch (error) {
      console.error('Error en el inicio de sesión:', error);
      setError(error.message);
    }
  };
  const handleForgotPassword = async e => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('http://localhost:8080/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone: formState.phone
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al solicitar OTP.');
      }
      alert('OTP enviado con éxito.');
      setFormState({
        ...formState,
        step: 2
      }); // Pasar al siguiente paso
    } catch (error) {
      setError(error.message);
    }
  };
  const handleVerifyOtp = async e => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('http://localhost:8080/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone: formState.phone,
          otp: formState.otp
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al validar OTP.');
      }
      alert('OTP validado con éxito.');
      setFormState({
        ...formState,
        step: 3
      }); // Pasar al siguiente paso
    } catch (error) {
      setError(error.message);
    }
  };
  const handleResetPassword = async e => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('http://localhost:8080/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone: formState.phone,
          newPassword: formState.newPassword
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al restablecer la contraseña.');
      }
      alert('Contraseña restablecida con éxito.');
      setFormState({
        ...formState,
        step: 1
      }); // Volver al inicio de sesión
      navigate('/login');
    } catch (error) {
      setError(error.message);
    }
  };
  const renderForm = () => {
    switch (formState.step) {
      case 1:
        return /*#__PURE__*/React.createElement("form", {
          onSubmit: handleForgotPassword
        }, /*#__PURE__*/React.createElement("h3", null, "Recuperar Contrase\xF1a"), /*#__PURE__*/React.createElement("input", {
          type: "text",
          placeholder: "Tel\xE9fono",
          name: "phone",
          value: formState.phone,
          onChange: handleChange,
          required: true
        }), /*#__PURE__*/React.createElement("button", {
          type: "submit"
        }, "Enviar OTP"));
      case 2:
        return /*#__PURE__*/React.createElement("form", {
          onSubmit: handleVerifyOtp
        }, /*#__PURE__*/React.createElement("h3", null, "Validar OTP"), /*#__PURE__*/React.createElement("input", {
          type: "text",
          placeholder: "C\xF3digo OTP",
          name: "otp",
          value: formState.otp,
          onChange: handleChange,
          required: true
        }), /*#__PURE__*/React.createElement("button", {
          type: "submit"
        }, "Validar"));
      case 3:
        return /*#__PURE__*/React.createElement("form", {
          onSubmit: handleResetPassword
        }, /*#__PURE__*/React.createElement("h3", null, "Restablecer Contrase\xF1a"), /*#__PURE__*/React.createElement("input", {
          type: "password",
          placeholder: "Nueva Contrase\xF1a",
          name: "newPassword",
          value: formState.newPassword,
          onChange: handleChange,
          required: true
        }), /*#__PURE__*/React.createElement("button", {
          type: "submit"
        }, "Restablecer Contrase\xF1a"));
      default:
        return null;
    }
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, "Iniciar Sesi\xF3n"), error && /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'red'
    }
  }, error), formState.step === 1 ? /*#__PURE__*/React.createElement("form", {
    onSubmit: handleLogin
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "Tel\xE9fono",
    name: "phone",
    value: formState.phone,
    onChange: handleChange,
    required: true
  }), /*#__PURE__*/React.createElement("input", {
    type: "password",
    placeholder: "Contrase\xF1a",
    name: "password",
    value: formState.password,
    onChange: handleChange,
    required: true
  }), /*#__PURE__*/React.createElement("button", {
    type: "submit"
  }, "Iniciar Sesi\xF3n"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setFormState({
      ...formState,
      step: 1
    })
  }, "\xBFOlvidaste tu contrase\xF1a?")) : renderForm());
};
export default Login;