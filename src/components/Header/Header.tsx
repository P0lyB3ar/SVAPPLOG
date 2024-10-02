import React, { useState } from 'react';
import ErrorContainer from '../ErrorContainer/ErrorContainer';
import './Header.css';
import Burger from '../SideBar/BurgerMenu'; // Ensure correct path
import Menu from '../SideBar/Menu'; // Ensure correct path

const Header: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div className="header">
      <Burger open={open} setOpen={setOpen} /> {/* Ensure it is visible and positioned */}
      <Menu open={open} setOpen={setOpen} />
      <div className="logo">
        <img src="src/assets/logo.png" alt="Logo" />
      </div>
      <ErrorContainer />
    </div>
  );
};

export default Header;
