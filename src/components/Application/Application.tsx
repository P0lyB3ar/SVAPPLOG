import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import {
  Typography,
  Button,
  TextField,
  Autocomplete,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Tooltip,
} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import DeleteIcon from "@mui/icons-material/Delete";

const PageWrapper = styled("div")({
  backgroundColor: "#010409",
  minHeight: "100vh",
  display: "flex",
  justifyContent: "space-between",
  padding: "0",
  boxSizing: "border-box",
  overflow: "hidden",
});

const Container = styled("div")({
  backgroundColor: "#151b23",
  padding: "20px",
  marginTop: "85px",
  marginLeft: "30px",
  marginRight: "30px",
  borderRadius: "8px",
  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
  width: "900px",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "flex-start",
  textAlign: "center",
  maxHeight: "calc(105vh - 150px)",
});

const StyledAutocomplete = styled(Autocomplete)(() => ({
  width: "80%",
}));

const overlineStyle = {
  "& .MuiInputLabel-root": {
    color: "#ffffff",
    fontSize: "0.8rem",
    fontWeight: "bold",
  },
  "& .MuiInputBase-root": {
    color: "#ffffff",
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "#ffffff",
    },
    "&:hover fieldset": {
      borderColor: "#1db954",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#1db954",
    },
  },
};

const StyledListItem = styled(ListItem)(() => ({
  width: "100%",
  maxWidth: 600,
  marginTop: "10px",
  marginLeft: "10px",
  marginBottom: "10px",
  marginRight: "200px",
  fontSize: "1.2rem",
}));

const textStyle = {
  color: "#ffffff",
  fontSize: "0.9rem",
  fontWeight: "bold",
};

const ApplicationsPage: React.FC = () => {
  const [applicationName, setApplicationName] = useState("");
  const [dictionaryName, setDictionaryName] = useState("");
  const [userName, setUserName] = useState("");
  const [applications, setApplications] = useState<string[]>([]);
  const [dictionaries, setDictionaries] = useState<string[]>([]);
  const [users, setUsers] = useState<string[]>([]);

  // Fetch applications
  const fetchApplications = async () => {
    try {
      const response = await fetch("http://localhost:8000/list-applications", {
        method: "GET",
        credentials: "include", // Include cookies in the request
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch applications");
      const data = await response.json();
      setApplications(data.applications || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  // Fetch dictionaries (names only)
  const fetchDictionaries = async () => {
    try {
      const response = await fetch("http://localhost:8000/list-dictionaries", {
        method: "GET",
        credentials: "include", // Include cookies in the request
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        const dictionaryNames = data.dictionaries?.map(
          (dict: { name: string }) => dict.name
        );
        setDictionaries(dictionaryNames || []);
      } else {
        console.error("Error fetching dictionaries:", response.status);
      }
    } catch (error) {
      console.error("Error fetching dictionaries:", error);
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:8000/user-dashboard", {
        method: "GET",
        credentials: "include", // Include cookies in the request
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      const userNames = data.users?.map((user: { username: string }) => user.username);
      setUsers(userNames || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    fetchApplications();
    fetchDictionaries();
    fetchUsers();
  }, []);

  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      applicationName: applicationName || "",
      dictionaryName: dictionaryName || "",
      userName: userName || "",
    };

    try {
      const response = await fetch("http://localhost:8000/create-application", {
        method: "POST",
        credentials: "include", // Include cookies in the request
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to create application");
      }

      alert("Application created successfully!");
      setApplicationName("");
      setDictionaryName("");
      setUserName("");
      fetchApplications(); // Refresh applications after successful creation
    } catch (error) {
      console.error("Error creating application:", error);
      alert(`Error creating application: ${error}`);
    }
  };

  const handleDeleteApplication = async (appName: string) => {
    try {
      const response = await fetch(`http://localhost:8000/delete-application/${appName}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setApplications((prevApps) =>
          prevApps.filter((app) => app !== appName)
        );
        console.log(`Application ${appName} deleted successfully`);
      } else {
        console.error("Error deleting application:", response.status);
      }
    } catch (error) {
      console.error("Error deleting application:", error);
    }
  };

  return (
    <PageWrapper>
      <Container>
        <Typography sx={{ ...textStyle, fontSize: "3rem" }}>
          Create Application
        </Typography>
        <TextField
          label="Application Name"
          variant="outlined"
          fullWidth
          value={applicationName}
          onChange={(e) => setApplicationName(e.target.value)}
          required
          sx={{ ...overlineStyle, marginTop: "20px", width: "80%" }}
        />
        <StyledAutocomplete
          freeSolo
          options={dictionaries}
          value={dictionaryName}
          onInputChange={(e, newValue) => setDictionaryName(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select Dictionary"
              variant="outlined"
              fullWidth
              sx={{ ...overlineStyle, marginTop: "20px", width: "80%" }}
            />
          )}
        />
        <StyledAutocomplete
          freeSolo
          options={users}
          value={userName}
          onInputChange={(e, newValue) => setUserName(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select User"
              variant="outlined"
              fullWidth
              sx={{ ...overlineStyle, marginTop: "20px", width: "80%" }}
            />
          )}
        />
        <Button
          type="button"
          variant="contained"
          disabled={!applicationName}
          onClick={handleCreateApplication}
          sx={{
            marginTop: "20px",
            fontSize: "1.1rem",
            backgroundColor: "#1A9B49",
          }}
        >
          Create
        </Button>
      </Container>
      <Container>
        <Typography sx={{ ...textStyle, fontSize: "3rem" }}>
          Your Applications
        </Typography>
        <List>
          {applications.map((app, index) => (
            <StyledListItem key={index}>
              <ListItemAvatar>
                <Avatar sx={{ backgroundColor: "#d4f4ff", height: 50, width: 50 }}>
                  <FolderIcon sx={{ color: "grey" }} />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={app}
                primaryTypographyProps={{ ...textStyle, fontSize: "1.3rem" }}
              />
              <Tooltip title="Delete">
                <IconButton onClick={() => handleDeleteApplication(app)}>
                  <DeleteIcon sx={{ color: "white", height: "40px", width: "40px" }} />
                </IconButton>
              </Tooltip>
            </StyledListItem>
          ))}
        </List>
      </Container>
    </PageWrapper>
  );
};

export default ApplicationsPage;
