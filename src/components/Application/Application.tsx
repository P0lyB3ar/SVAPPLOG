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

  useEffect(() => {
    fetch("http://localhost:8000/list-applications", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("jwtToken")}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => setApplications(data.applications || []))
      .catch(console.error);
  }, []);

  const fetchSuggestions = async (
    endpoint: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    try {
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("jwtToken")}`,
        },
      });
      const data = await response.json();
      setter(data.items || []);
    } catch (error) {
      console.error(`Failed to fetch from ${endpoint}`, error);
    }
  };

  useEffect(() => {
    fetchSuggestions("/list-dictionary", setDictionaries);
    fetchSuggestions("/user-dashboard", setUsers);
  }, []);

  const handleCreateApplication = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      applicationName,
      dictionaryName,
      userName,
    };

    fetch("/create-application", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("jwtToken")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((data) => {
        // You can handle the response here if necessary
      })
      .catch(console.error);
  };

  return (
    <PageWrapper>
      <Container>
        <Typography sx={{ ...textStyle, fontSize: "3rem" }}>
          Create Application
        </Typography>
        {/* You can remove the <form> tag */}
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
              label="Add Dictionary (optional)"
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
              label="Add User (optional)"
              variant="outlined"
              fullWidth
              sx={{ ...overlineStyle, marginTop: "20px", width: "80%" }}
            />
          )}
        />
        <Button
          type="button" // Use type="button" since we're not submitting a form
          variant="contained"
          disabled={!applicationName}
          onClick={handleCreateApplication} // Trigger the function directly
          sx={{ marginTop: "20px", fontSize: "1.1rem" }}
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
            <ListItem key={index}>
              <Avatar>
                <FolderIcon />
              </Avatar>
              <ListItemText primary={app} />
              <IconButton>
                <DeleteIcon />
              </IconButton>
            </ListItem>
          ))}
        </List>
      </Container>
    </PageWrapper>
  );
};

export default ApplicationsPage;
