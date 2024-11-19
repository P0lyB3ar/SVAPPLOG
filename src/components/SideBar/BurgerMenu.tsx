import React from "react";
import styled from "styled-components";

// Define the type for the props of StyledBurger
interface StyledBurgerProps {
  open: boolean;
}

// Define the type for the props of the Burger component
interface BurgerProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const StyledBurger = styled.button<StyledBurgerProps>`
  position: absolute;
  left: 1rem; /* Adjust to position the button in the header */
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: 3.5rem; /* Adjust size as needed */
  height: 2.3rem; /* Adjust size as needed */
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 1005; /* Ensure it appears above the menu and content but below the logo */

  &:focus {
    outline: none;
  }

  div {
    width: 3rem;
    padding: 3px;
    margin: 4px;
    height: 4px;
    background: ${({ open }) => (open ? "#7CC0D4" : "#1976d2")};
    border-radius: 10px;
    transition: all 0.3s linear;
    position: relative;
    transform-origin: 1px;

  }
`;

// Component with TypeScript props
const Burger: React.FC<BurgerProps> = ({ open, setOpen }) => {
  return (
    <StyledBurger open={open} onClick={() => setOpen(!open)}>
      <div />
      <div />
      <div />
    </StyledBurger>
  );
};

export default Burger;
