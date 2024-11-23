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

interface DictionaryItem {
  name: string;
}

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
  const [allDictionaries, setAllDictionaries] = useState<DictionaryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDictionaries = async () => {
      try {
        const response = await fetch("http://localhost:8000/list-dictionaries");
        if (response.ok) {
          const data = await response.json();
          if (data && Array.isArray(data.dictionaries)) {
            setAllDictionaries(data.dictionaries);
          }
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

    const newDictionary = {
      name: dictionaryName,
      actions: actions.filter((action) => action.trim() !== "") // Filter out empty actions
    };

    if (newDictionary.actions.length === 0) {
      setError("At least one action is required");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/create-dictionary", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newDictionary),
      });

      if (response.ok) {
        const result = await response.json();
        setAllDictionaries((prev) => [...prev, result]);
        setDictionaryName("");
        setActions([""]);
        setError(null);
      } else {
        const errorResponse = await response.json();
        setError(errorResponse.error || "Failed to create dictionary");
        setTimeout(() => setError(null), 3000);
      }
    } catch (error) {
      setError("An error occurred while creating the dictionary");
      setTimeout(() => setError(null), 3000);
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
            sx={{ ...overlineStyle, marginTop: 2.5, width: "80%" }}
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
                    fontSize: "96%",
                    height: "20%",
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
                fontSize: "96%",
              }}
              variant="contained"
              onClick={addActionField}
            >
              Add Action
            </Button>
            <Button
              sx={{
                padding: "2px 10px",
                minWidth: "auto",
                fontSize: "96%",
              }}
              variant="contained"
              disabled={!dictionaryName}
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
          {allDictionaries.length === 0 ? (
            <Typography
              sx={{ ...textStyle, marginTop: 20, fontSize: "2rem" }}
            >
              No dictionaries found
            </Typography>
          ) : (
            <List sx={{ ...textStyle, marginTop: "15px" }}>
              {allDictionaries.map((dict, index) => (
                <StyledListItem key={index}>
                  <ListItemAvatar>
                    <Avatar>
                      <FolderIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={dict.name}
                    secondary={`Created ${new Date()}`}
                  />
                  <Tooltip title="Delete">
                    <IconButton
                      sx={{ color: "#ff3838" }}
                      aria-label="delete"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </StyledListItem>
              ))}
            </List>
          )}
        </ListContainer>
      </Container>
    </PageWrapper>
  );
};

export default MainDictionary;
