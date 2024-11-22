import React from "react";
import styled from "styled-components";

interface StyledMenuProps {
  open: boolean;
}

interface MenuProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const StyledMenu = styled.nav<StyledMenuProps>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: #0d1117;
  transform: ${({ open }) => (open ? "translateX(0)" : "translateX(-100%)")};
  height: calc(100vh - 60px);
  width: 12rem;
  text-align: left;
  padding: 2rem;
  position: fixed;
  top: 65px;
  left: 0;
  transition: transform 0.2s ease-in-out;
  z-index: 1000;

  @media (max-width: 576px) {
    width: 35%;
    top: 65px;
  }

  a {
    font-size: 1.3rem;
    font-weight: bold;
    text-transform: uppercase;
    padding: 1.3rem 0;
    letter-spacing: 0.3rem;
    color: #7cc0d4;
    text-decoration: none;
    transition: color 0.1s linear;
    cursor: pointer;

    @media (max-width: 576px) {
      font-size: 1.5rem;
      text-align: center;
    }

    &:hover {
      color: #ffffff;
    }
  }
`;

const Menu: React.FC<MenuProps> = ({ open, setOpen }) => {
  return (
    <StyledMenu open={open}>
      <a href="/main" onClick={() => setOpen(false)}>
        Home
      </a>
      <a href="./dictionary" onClick={() => setOpen(false)}>
        Dictionary
      </a>
      <a href="./application" onClick={() => setOpen(false)}>
        Application
      </a>
      <a href="./organisation" onClick={() => setOpen(false)}>
        Organisation
      </a>
      <a href="./users" onClick={() => setOpen(false)}>
        Users
      </a>
    </StyledMenu>
  );
};

export default Menu;
