import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import FolderIcon from "@mui/icons-material/Folder";
import DeleteIcon from "@mui/icons-material/Delete";
import { Button, TextField } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import Cookies from "js-cookie";

// Define the type for the dictionary items
interface DictionaryItem {
  name: string;
  data: { [key: number]: string };
}

// Define the props interface for MainDictionary
interface MainDictionaryProps {
  dictionaries: DictionaryItem[];
}

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

const ActionsContainer = styled("div")({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  maxHeight: "525px",
  overflowY: "auto",
  marginTop: "20px",
  alignItems: "center",
  paddingRight: "10px",
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
  marginLeft: "10px",
  marginBottom: "10px",
  marginRight: "200px",
  fontSize: "1.2rem",
}));

const Footer = styled("div")({
  marginTop: "15px",
  display: "flex",
  justifyContent: "center",
  gap: "20px",
});

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

const MainDictionary: React.FC<MainDictionaryProps> = () => {
  const [dictionaryName, setDictionaryName] = useState("");
  const [actions, setActions] = useState<string[]>([""]);
  const [selectedDictionary, setSelectedDictionary] = useState<string | null>(
    null
  );
  const [allDictionaries, setAllDictionaries] = useState<DictionaryItem[]>([]);
  const [error, setError] = useState<string | null>(null); // Error state

  const jwtToken = Cookies.get("jwt"); // Get JWT token from the cookies

  // Fetch dictionaries from the backend on initial load (GET request)
  useEffect(() => {
    const fetchDictionaries = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/list-dictionaries", 
          {
            headers: {
              "Authorization": `Bearer ${jwtToken}`, // Include JWT token in the header
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched data:", data);
          if (data && Array.isArray(data.dictionaries)) {
            setAllDictionaries(data.dictionaries);
          } else {
            console.error("Unexpected data format:", data);
          }
        } else {
          console.error("Error fetching dictionaries:", response.status);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchDictionaries();
  }, [jwtToken]);

  const handleActionChange = (index: number, value: string) => {
    const newActions = [...actions];
    newActions[index] = value;
    setActions(newActions);
  };

  const addActionField = () => {
    setActions([...actions, ""]);
  };

  const deleteActionField = (index: number) => {
    const newActions = actions.filter((_, i) => i !== index);
    setActions(newActions);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Prepare the data object with numeric keys (0, 1, 2, ...)
    const data: { [key: number]: string } = {};
    actions.forEach((action, index) => {
      if (action.trim()) {
        data[index] = action;  // Use the index as the key
      }
    });

    const newDictionary = {
      name: dictionaryName,
      data: data,
    };

    try {
      const response = await fetch(
        "http://localhost:8000/create-dictionary", 
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jwtToken}`, // Add JWT token to the header
          },
          body: JSON.stringify(newDictionary), // Send the new dictionary data
        }
      );

      if (response.ok) {
        const createdDictionary = await response.json();
        console.log("Dictionary created:", createdDictionary);

        // Add the new dictionary to the state
        setAllDictionaries((prev) => [...prev, createdDictionary]);

        // Clear form inputs
        setDictionaryName("");
        setActions([""]);
        setError(null);
      } else if (response.status === 409) {
        setError("Dictionary name already exists");
      } else {
        setError("Failed to create dictionary");
      }

      // Clear the error after 3 seconds
      setTimeout(() => setError(null), 3000);
    } catch (error) {
      console.error("Error creating dictionary:", error);
      setError("An error occurred while creating the dictionary");

      // Clear the error after 3 seconds
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDictionarySelect = (dictName: string) => {
    setSelectedDictionary(dictName);
  };

  const handleDeselectDictionary = () => {
    setSelectedDictionary(null);
  };

  const handleDeleteDictionary = async (dictName: string) => {
    try {
      const response = await fetch(
        `http://localhost:8000/delete-dictionary/${dictName}`, 
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${jwtToken}`, // Include JWT token for deletion
          },
        }
      );
  
      if (response.ok) {
        // Remove the dictionary from the state if delete is successful
        setAllDictionaries((prevDictionaries) =>
          prevDictionaries.filter((dict) => dict.name !== dictName)
        );
        console.log(`Dictionary ${dictName} deleted successfully`);
      } else {
        console.error("Error deleting dictionary:", response.status);
      }
    } catch (error) {
      console.error("Error deleting dictionary:", error);
    }
  };  

  return (
    <PageWrapper>
      <Container>
        <Typography sx={{ ...textStyle, fontSize: "3rem" }}>
          Create Dictionary
        </Typography>
        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <TextField
            label="Dictionary Name"
            variant="outlined"
            fullWidth
            value={dictionaryName}
            onChange={(e) => setDictionaryName(e.target.value)}
            required
            sx={{ ...overlineStyle, marginTop: 2.5, width: 450 }}
          />
          <ActionsContainer>
            {actions.map((action, index) => (
              <div
                key={index}
                style={{ display: "flex", gap: "20px", marginTop: "20px" }}
              >
                <TextField
                  label={`Action ${index + 1}`}
                  variant="outlined"
                  fullWidth
                  value={action}
                  onChange={(e) => handleActionChange(index, e.target.value)}
                  sx={{ ...overlineStyle, width: 350 }}
                />
                {actions.length > 1 && (
                  <Tooltip title="Delete">
                    <IconButton
                      color="error"
                      onClick={() => deleteActionField(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </div>
            ))}
            <Button onClick={addActionField} variant="contained">
              Add Action
            </Button>
          </ActionsContainer>

          {error && (
            <Typography sx={{ color: "red", fontSize: "1rem", marginTop: 2 }}>
              {error}
            </Typography>
          )}

          <Footer>
            <Button type="submit" variant="contained">
              Create Dictionary
            </Button>
          </Footer>
        </form>

        <ListContainer>
          <Typography sx={{ ...textStyle, fontSize: "2rem" }}>
            All Dictionaries
          </Typography>
          <List>
            {allDictionaries.map((dict) => (
              <StyledListItem key={dict.name}>
                <ListItemAvatar>
                  <Avatar>
                    <FolderIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={dict.name}
                  secondary={
                    selectedDictionary === dict.name
                      ? "Selected"
                      : "Click to select"
                  }
                />
                <Tooltip title="Delete">
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteDictionary(dict.name)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </StyledListItem>
            ))}
          </List>
        </ListContainer>
      </Container>
    </PageWrapper>
  );
};

export default MainDictionary;
