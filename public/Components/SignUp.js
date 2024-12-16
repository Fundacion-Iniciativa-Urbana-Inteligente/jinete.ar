import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState({
    email: false,
    phone: false
  }); // Para errores específicos
  const navigate = useNavigate();

  // Función para manejar el registro
  const handleSignUp = async e => {
    e.preventDefault();
    setError(''); // Limpiar mensajes de error generales
    setFieldError({
      email: false,
      phone: false
    }); // Limpiar mensajes de errores específicos

    try {
      const response = await fetch('http://localhost:8080/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (!response.ok) {
        const errorData = await response.json();

        // Manejar duplicados
        if (response.status === 400 && errorData.message) {
          if (errorData.message.includes('email')) {
            setFieldError(prev => ({
              ...prev,
              email: true
            }));
          } else if (errorData.message.includes('phone')) {
            setFieldError(prev => ({
              ...prev,
              phone: true
            }));
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
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, "Registro"), error && /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'red'
    }
  }, error), /*#__PURE__*/React.createElement("form", {
    onSubmit: handleSignUp
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "Nombre",
    value: formData.name,
    onChange: e => setFormData({
      ...formData,
      name: e.target.value
    }),
    required: true
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "Tel\xE9fono",
    value: formData.phone,
    onChange: e => setFormData({
      ...formData,
      phone: e.target.value
    }),
    required: true
  }), fieldError.phone && /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'red'
    }
  }, "El n\xFAmero de tel\xE9fono ya est\xE1 registrado.")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("input", {
    type: "email",
    placeholder: "Correo Electr\xF3nico",
    value: formData.email,
    onChange: e => setFormData({
      ...formData,
      email: e.target.value
    }),
    required: true
  }), fieldError.email && /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'red'
    }
  }, "El correo electr\xF3nico ya est\xE1 registrado.")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("input", {
    type: "password",
    placeholder: "Contrase\xF1a",
    value: formData.password,
    onChange: e => setFormData({
      ...formData,
      password: e.target.value
    }),
    required: true
  })), /*#__PURE__*/React.createElement("button", {
    type: "submit"
  }, "Registrar")));
};
export default SignUp;