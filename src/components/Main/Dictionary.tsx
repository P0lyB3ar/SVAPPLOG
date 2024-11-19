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

// Define the type for the dictionary items
interface DictionaryItem {
  name: string;
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

  // Fetch dictionaries from the backend on initial load (GET request)
  useEffect(() => {
    const fetchDictionaries = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/list-dictionaries"
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
  }, []);

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

    // Prepare the data object without the dictionary_id
    const data = actions.reduce<{ [key: string]: string[] }>((acc, action) => {
      acc[action] = [action];
      return acc;
    }, {});

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
          },
          body: JSON.stringify(newDictionary),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Dictionary created:", data);
        // Once the backend returns the new dictionary with dictionary_id, update state
        setAllDictionaries((prev) => [...prev, data]);
        setError(null); // Clear error on success
      } else {
        console.error("Error creating dictionary:", response.status);
        setError("Failed to create dictionary");

        // Clear the error after 2 seconds
        setTimeout(() => setError(null), 3000);
      }
    } catch (error) {
      console.error("Error sending data:", error);
      setError("An error occurred while creating the dictionary");

      // Clear the error after 2 seconds
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
        `http://localhost:8000/delete-dictionary/${dictName}`, // Adjust the URL to match your API
        {
          method: "DELETE",
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
                  required
                  sx={{ ...overlineStyle, marginBottom: "10px", width: 500 }}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => deleteActionField(index)}
                  sx={{
                    padding: "2px 10px",
                    minWidth: "auto",
                    fontSize: "1.2rem",
                    height: "35px",
                    marginTop: "10px",
                  }}
                >
                  Delete Action
                </Button>
              </div>
            ))}
          </ActionsContainer>
          {error && (
            <Typography
              sx={{ color: "red", fontSize: "1rem", marginTop: "5px" }}
            >
              {error}
            </Typography>
          )}
          <Footer>
            <Button
              sx={{
                padding: "2px 10px",
                minWidth: "auto",
                fontSize: "1.2rem",
                marginTop: "",
              }}
              variant="contained"
              onClick={addActionField}
            >
              Add Action
            </Button>
            <Button
              sx={{ padding: "2px 10px", minWidth: "auto", fontSize: "1.2rem" }}
              variant="contained"
              type="submit"
            >
              Submit
            </Button>
          </Footer>
        </form>
      </Container>

      <Container>
        <Typography sx={{ ...textStyle, fontSize: "3rem" }}>
          Dictionaries List
        </Typography>
        <ListContainer>
          <List>
            {allDictionaries.map((dict, index) => (
              <StyledListItem
                key={index}
                selected={selectedDictionary === dict.name}
                onClick={() =>
                  selectedDictionary === dict.name
                    ? handleDeselectDictionary()
                    : handleDictionarySelect(dict.name)
                }
                secondaryAction={
                  <Tooltip title="Delete">
                    <IconButton
                      onClick={() => handleDeleteDictionary(dict.name)}
                    >
                      <DeleteIcon
                        sx={{ color: "white", height: "40px", width: "40px" }}
                      />
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
                      marginRight: "15px",
                    }}
                  >
                    <FolderIcon
                      sx={{ height: "35px", width: "35px", color: "grey" }}
                    />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={dict.name}
                  primaryTypographyProps={{ ...textStyle, fontSize: "1.3rem" }}
                />
              </StyledListItem>
            ))}
          </List>
        </ListContainer>
        {selectedDictionary && (
          <Button
            href={`/editdictionary/${selectedDictionary}`}
            variant="contained"
            size="large"
          >
            Edit Dictionary
          </Button>
        )}
      </Container>
    </PageWrapper>
  );
};

export default MainDictionary;
