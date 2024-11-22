import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import {
  Typography,
  Button,
  TextField,
  Autocomplete,
  IconButton,
  Tooltip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
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

const ListContainer = styled("div")({
  display: "flex",
  justifyContent: "center",
  flexDirection: "column",
  width: "100%",
  alignItems: "center",
  maxHeight: "555px",
  overflowY: "auto",
  marginTop: "40px",
});

const StyledListItem = styled(ListItem)(() => ({
  width: "100%",
  maxWidth: 600,
  marginTop: "10px",
  marginBottom: "10px",
  fontSize: "1.2rem",
}));

const textStyle = {
  color: "#ffffff",
  fontSize: "0.9rem",
  fontWeight: "bold",
};

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

const StyledAutocomplete = styled(Autocomplete)(() => ({
  width: "80%",
}));

const OrganisationsPage: React.FC = () => {
  const [organisationName, setOrganisationName] = useState("");
  const [applicationName, setApplicationName] = useState("");
  const [dictionaryName, setDictionaryName] = useState("");
  const [userName, setUserName] = useState("");
  const [organisations, setOrganisations] = useState<string[]>([]);
  const [applications, setApplications] = useState<string[]>([]);
  const [dictionaries, setDictionaries] = useState<string[]>([]);
  const [users, setUsers] = useState<string[]>([]);

  // Fetch organisations
  useEffect(() => {
    const fetchOrganisations = async () => {
      try {
        const response = await fetch("http://localhost:8000/list-organisations", {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("jwtToken")}`,
          },
        });
        const data = await response.json();
        setOrganisations(data.organisations || []);
      } catch (error) {
        console.error("Failed to fetch organisations", error);
      }
    };
    fetchOrganisations();
  }, []);

  // Fetch suggestions for applications, dictionaries, and users
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
      setter(data.items || []); // Adjust based on the API response structure
    } catch (error) {
      console.error(`Failed to fetch from ${endpoint}`, error);
    }
  };

  useEffect(() => {
    fetchSuggestions("http://localhost:8000/list-application", setApplications);
    fetchSuggestions("http://localhost:8000/list-dictionary", setDictionaries);
    fetchSuggestions("http://localhost:8000/user-dashboard", setUsers);
  }, []);

  const handleCreateOrganisation = async () => {
    try {
      const payload = {
        organisationName,
        applicationName,
        dictionaryName,
        userName,
      };

      const response = await fetch("http://localhost:8000/create-organisation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("jwtToken")}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setOrganisations((prev) => [...prev, data.organisationName]);
        setOrganisationName("");
        setApplicationName("");
        setDictionaryName("");
        setUserName("");
        alert("Organisation created successfully!");
      } else {
        console.error("Failed to create organisation");
        alert("Error creating organisation.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred. Please try again.");
    }
  };

  const handleDeleteOrganisation = async (orgName: string) => {
    try {
      const response = await fetch(`http://localhost:8000//delete-organisation/${orgName}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("jwtToken")}`,
        },
      });
      if (response.ok) {
        setOrganisations((prev) =>
          prev.filter((organisation) => organisation !== orgName)
        );
      } else {
        console.error("Failed to delete organisation");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <PageWrapper>
      <Container>
        <Typography sx={{ ...textStyle, fontSize: "3rem" }}>
          Create Organisation
        </Typography>
        <TextField
          label="Organisation Name"
          variant="outlined"
          fullWidth
          value={organisationName}
          onChange={(e) => setOrganisationName(e.target.value)}
          sx={{ ...overlineStyle, marginTop: "20px", width: "80%" }}
        />
        <StyledAutocomplete
          freeSolo
          options={applications}
          value={applicationName}
          onInputChange={(e, newValue) => setApplicationName(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Add Application (optional)"
              variant="outlined"
              fullWidth
              sx={{ ...overlineStyle, marginTop: "20px", width: "80%" }}
            />
          )}
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
          variant="contained"
          onClick={handleCreateOrganisation}
          disabled={!organisationName}
          sx={{ marginTop: "20px", fontSize: "1.1rem" }}
        >
          Create
        </Button>
      </Container>

      <Container>
        <Typography sx={{ ...textStyle, fontSize: "3rem" }}>
          Your Organisations
        </Typography>
        <ListContainer>
          <List>
            {organisations.map((org, index) => (
              <StyledListItem
                key={index}
                secondaryAction={
                  <Tooltip title="Delete">
                    <IconButton onClick={() => handleDeleteOrganisation(org)}>
                      <DeleteIcon sx={{ color: "white" }} />
                    </IconButton>
                  </Tooltip>
                }
              >
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      backgroundColor: "rgb(212, 244, 255)",
                      height: "50px",
                      width: "50px",
                    }}
                  >
                    <FolderIcon sx={{ color: "grey" }} />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={org}
                  primaryTypographyProps={{
                    ...textStyle,
                    fontSize: "1.3rem",
                  }}
                />
              </StyledListItem>
            ))}
          </List>
        </ListContainer>
      </Container>
    </PageWrapper>
  );
};

export default OrganisationsPage;
