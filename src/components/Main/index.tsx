import React, { ReactNode, useEffect, useState } from "react";
import styled from "styled-components";
import ErrorContainer from "../ErrorContainer/ErrorContainer";
import Button from '@mui/material/Button';
import Result from "./Result";

const StyledMain = styled.div`
  background: #ffffff;
  height: 100vh;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Container = styled.div`
  margin-top: 160px;
  margin-bottom: 95px;
  background: rgb(212, 244, 255);
  padding: 20px;
  max-width: 1850px;
  box-sizing: border-box;
  width: 100%;
  border-radius: 10px;
  max-height: 50rem;
  overflow: hidden;
`;

interface MainProps {
  children?: ReactNode;
}

interface DataItem {
  id: number;
  user: string;
  type: string;
  timestamp: number;
  path: string;
}

const Main: React.FC<MainProps> = ({ children }) => {
  const [data, setData] = useState<DataItem[]>([]);

  useEffect(() => {
    const fetchButton = document.getElementById("fetchButton");
    const typeInput = document.getElementById("type");

    fetchButton?.addEventListener("click", fetchData);
    typeInput?.addEventListener("change", fetchData);

    return () => {
      fetchButton?.removeEventListener("click", fetchData);
      typeInput?.removeEventListener("change", fetchData);
    };
  }, []);

  const fetchData = async () => {
    const typeValue = (document.getElementById("type") as HTMLInputElement).value;
    const url = `http://localhost:8000/read?logs=all&dict=1&sort=${typeValue}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "*/*",
          Authorization: `Bearer ${sessionStorage.getItem("jwtToken")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const formattedData = data.map((item: DataItem) => ({
        ...item,
        timestamp: new Date(item.timestamp * 1000).toLocaleString(), // Format the timestamp
      }));
      setData(formattedData);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <StyledMain>
      <Container>
        <div className="item">
          <ErrorContainer />
          <Button
            variant="contained"
            size="large"
            type="submit"
            style={{ fontSize: "20px", marginTop: "5px", marginBottom: "20px" }}
            id="fetchButton"
          >
            Fetch Data
          </Button>
        </div>
        {/* Pass the data to the Result component */}
        <Result rows={data} />
        {children}
      </Container>
    </StyledMain>
  );
};

export default Main;
