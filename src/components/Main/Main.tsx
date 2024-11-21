import React, { ReactNode, useEffect, useState } from "react";
import styled from "styled-components";
import ErrorContainer from "../ErrorContainer/ErrorContainer";
import Button from "@mui/material/Button";
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
        credentials: "include", // Include cookies in the request
      });

      // Check if the response is HTML (this is typically an error page)
      if (response.headers.get("content-type")?.includes("text/html")) {
        const errorHtml = await response.text();
        console.error("Received HTML instead of JSON:", errorHtml);
        alert("Server returned an error. Please check the console.");
        return;
      }

      // Try to parse the JSON response
      const data = await response.json();
      console.log("Fetched data:", data);

      // Format and set the data
      const formattedData = data.map((item: any) => ({
        ...item,
        timestamp: item.timestamp
          ? new Date(item.timestamp).toLocaleString('en-US', { timeZone: 'UTC' }) // Format the ISO timestamp
          : 'Invalid Timestamp', // Handle missing or invalid timestamps
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
            onClick={fetchData} // Trigger fetch on click
            style={{ fontSize: "20px", marginTop: "5px", marginBottom: "20px" }}
          >
            Fetch Data
          </Button>
        </div>
        {/* Pass the fetched data to Result component */}
        <Result rows={data} />
        {children}
      </Container>
    </StyledMain>
  );
};

export default Main;
