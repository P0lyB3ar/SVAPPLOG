import React, { ReactNode, useState, useEffect } from "react";
import styled from "styled-components";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { Database, RefreshCw } from "lucide-react";
import Result from "./Result";
import Cookies from "js-cookie";

const StyledMain = styled.div`
  background: #010409;
  height: 100vh;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Container = styled.div`
  margin-top: 20px;
  margin-bottom: 20px;
  background: #151b23;
  padding: 24px;
  max-width: 1850px;
  box-sizing: border-box;
  width: 95%;
  border-radius: 12px;
  max-height: 95vh;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const Title = styled.h1`
  color: #ffffff;
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Controls = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const StyledSelect = styled(Select)`
  & .MuiSelect-select {
    padding: 10px 14px;
    min-width: 200px;
  }
  
  & .MuiOutlinedInput-notchedOutline {
    border-color: #30363d;
  }
  
  &:hover .MuiOutlinedInput-notchedOutline {
    border-color: #58a6ff;
  }
  
  &.Mui-focused .MuiOutlinedInput-notchedOutline {
    border-color: #58a6ff;
  }
`;

const StyledButton = styled(Button)`
  background-color: #238636 !important;
  text-transform: none !important;
  font-weight: 600 !important;
  padding: 8px 16px !important;
  
  &:hover {
    background-color: #2ea043 !important;
  }
`;

const ErrorMessage = styled.div`
  color: #f85149;
  background: rgba(248, 81, 73, 0.1);
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 16px;
`;

interface Application {
  name: string;
  secret: string;
}

const Main: React.FC<{ children?: ReactNode }> = ({ children }) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<string>("");
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const checkAuth = () => {
    const token = Cookies.get("jwt_token");
    if (!token) {
      setError("Authentication required. Please log in.");
      return false;
    }
    return true;
  };

  // Fetch applications on mount
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        if (!checkAuth()) return;

        const token = Cookies.get("jwt_token");
        const response = await fetch("http://localhost:8000/list-applications", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (result.applications) {
          setApplications(result.applications);
        } else {
          setError(result.message || "No applications found");
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to fetch applications");
      }
    };

    fetchApplications();
  }, []);

  // Fetch logs for the selected application
  const fetchLogs = async () => {
    if (!selectedApplication) {
      setError("Please select an application");
      return;
    }

    setLoading(true);
    setError("");
    setLogs([]);

    try {
      if (!checkAuth()) return;

      const token = Cookies.get("jwt_token");
      const application = applications.find((app) => app.name === selectedApplication);
      
      if (!application) {
        throw new Error("Application not found");
      }

      const response = await fetch("http://localhost:8000/read", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationSecret: application.secret,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const logsData = await response.json();
      if (logsData.length > 0) {
        setLogs(logsData);
      } else {
        setError("No logs found for the selected application");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to fetch logs");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    // Replace with your actual login page URL
    window.location.href = "/login";
  };

  return (
    <StyledMain>
      <Container>
        <Header>
          <Title>
            <Database size={24} />
            Log Explorer
          </Title>
        </Header>

        {error && (
          <ErrorMessage>
            {error}
            {error.includes("Authentication required") && (
              <div style={{ marginTop: "8px" }}>
                <Button 
                  variant="contained" 
                  size="small"
                  onClick={handleLoginRedirect}
                >
                  Go to Login
                </Button>
              </div>
            )}
          </ErrorMessage>
        )}

        <Controls>
          <StyledSelect
            value={selectedApplication}
            onChange={(e) => {
              setSelectedApplication(e.target.value as string);
              setError("");
            }}
            displayEmpty
            sx={{
              color: "white",
              backgroundColor: "#0D1117",
              "& .MuiSvgIcon-root": {
                color: "white",
              },
            }}
          >
            <MenuItem value="">Select Application</MenuItem>
            {applications.map((app) => (
              <MenuItem key={app.name} value={app.name}>
                {app.name}
              </MenuItem>
            ))}
          </StyledSelect>

          <StyledButton
            variant="contained"
            onClick={fetchLogs}
            disabled={loading || !selectedApplication}
            startIcon={<RefreshCw size={18} className={loading ? "animate-spin" : ""} />}
          >
            {loading ? "Fetching..." : "Fetch Logs"}
          </StyledButton>
        </Controls>

        <Result logs={logs} loading={loading} />
      </Container>
    </StyledMain>
  );
};

export default Main;