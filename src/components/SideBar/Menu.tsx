import React from "react";
import styled from "styled-components";

// Define the type for the props of StyledMenu
interface StyledMenuProps {
  open: boolean;
}

// Define the type for the props of the Menu component
interface MenuProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

// Styled component with TypeScript types
const StyledMenu = styled.nav<StyledMenuProps>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: #003C43;
  transform: ${({ open }) => (open ? "translateX(0)" : "translateX(-100%)")};
  height: calc(100vh - 60px); /* Adjust height to account for header height */
  width: 13rem;
  text-align: left;
  padding: 2rem;
  position: fixed; /* Ensure menu is fixed on the screen */
  top: 65px; /* Adjust this value to the height of your header */
  left: 0;
  transition: transform 0.3s ease-in-out;
  z-index: 1000; /* Ensure it's below the logo but above other content */

  @media (max-width: 576px) {
    width: 35%;
    top: 65px; /* Adjust for mobile header height if different */
  }

  a {
    font-size: 1.5rem;
    text-transform: uppercase;
    padding: 1.5rem 0;
    font-weight: bold;
    letter-spacing: 0.5rem;
    color: #0d0c1d;
    text-decoration: none;
    transition: color 0.3s linear;

    @media (max-width: 576px) {
      font-size: 1.5rem;
      text-align: center;
    }

    &:hover {
      color: #343078;
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
    </StyledMenu>
  );
};

export default Menu;
