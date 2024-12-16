import React, { createContext, useState } from 'react';
export const UserContext = /*#__PURE__*/createContext();
export const UserProvider = ({
  children
}) => {
  const [user, setUser] = useState(null); // Estado para almacenar la información del usuario

  return /*#__PURE__*/React.createElement(UserContext.Provider, {
    value: {
      user,
      setUser
    }
  }, children);
};