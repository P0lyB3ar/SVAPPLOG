import React, { ReactNode, useState } from "react";
import styled from "styled-components";
import ErrorContainer from "../ErrorContainer/ErrorContainer";
import Button from '@mui/material/Button';
import Result from "./Result";

const StyledMain = styled.div`
  background: #010409;
  height: 100vh;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Container = styled.div`
  margin-top: 160px;
  margin-bottom: 95px;
  background: #151b23;
  padding: 20px;
  max-width: 1850px;
  box-sizing: border-box;
  width: 100%;
  border-radius: 10px;
  max-height: 85%;
  overflow: hidden;
`;

interface MainProps {
  children?: ReactNode;
}

interface DataItem {
  id: number;
  user: string;
  type: string;
  timestamp: string;
  path: string;
}

const Main: React.FC<MainProps> = ({ children }) => {
  const [data, setData] = useState<DataItem[]>([]);

  const fetchData = async () => {
    const url = "http://localhost:8000/read?logs=all&dict=1&sort=";

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.headers.get("content-type")?.includes("text/html")) {
        const errorHtml = await response.text();
        console.error("Received HTML instead of JSON:", errorHtml);
        alert("Server returned an error. Please check the console.");
        return;
      }

      const data = await response.json();
      console.log("Fetched data:", data);

      const formattedData = data.map((item: any) => ({
        ...item,
        timestamp: item.timestamp
          ? new Date(item.timestamp).toLocaleString('en-US', { timeZone: 'UTC' }) // Format the ISO timestamp
          : 'Invalid Timestamp',
      }));

      setData(formattedData);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("An error occurred while fetching data. Please try again later.");
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
            onClick={fetchData}
            style={{ fontSize: "20px", marginTop: "5px", marginBottom: "20px" }}
          >
            Fetch Data
          </Button>
        </div>
        <Result rows={data} />
        {children}
      </Container>
    </StyledMain>
  );
};

export default Main;
