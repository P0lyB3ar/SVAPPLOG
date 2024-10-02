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

const PageWrapper = styled("div")({
  backgroundColor: "#ffffff",
  minHeight: "100vh",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  padding: "20px",
  boxSizing: "border-box",
});

const Container = styled("div")({
  backgroundColor: "rgb(212, 244, 255)",
  padding: "20px",
  marginTop: "70px",
  marginLeft: "30px",
  marginRight: "30px",
  borderRadius: "8px",
  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
  width: "800px",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  maxHeight: "810px",
  overflow: "auto",
});

const StyledListItem = styled(ListItem)({
  width: "100%",
  maxWidth: 600,
  marginTop: "10px",
  marginLeft: "10px",
  marginBottom: "10px",
  marginRight: "200px",
  fontSize: "1.2rem",
});

const MainDictionary: React.FC = () => {
  const [dictionaryName, setDictionaryName] = useState("");
  const [actions, setActions] = useState<string[]>([""]);
  const [selectedDictionary, setSelectedDictionary] = useState<string | null>(null);
  const [dictionaries, setDictionaries] = useState<DictionaryItem[]>([]); // State to store fetched dictionaries

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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Dictionary Name:", dictionaryName);
    console.log("Actions:", actions);
  };

  const handleDictionarySelect = (dictName: string) => {
    setSelectedDictionary(dictName);
  };

  const handleDeselectDictionary = () => {
    setSelectedDictionary(null);
  };

  const handleEditClick = () => {
    if (selectedDictionary) {
      // Handle the edit logic here
    }
  };

  // Function to fetch dictionaries and update the state
  const fetchData = async () => {
    const url = "http://localhost:8000/list-dictionaries"; // Adjust the URL accordingly

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "*/*",
          "Accept-Language": "en-US,en;q=0.5",
          Authorization: `Bearer ${sessionStorage.getItem("jwtToken")}`,
          "Content-Type": "application/json",
          Connection: "keep-alive",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json(); // Parse the response data
      setDictionaries(data.dictionaries); // Update state with the fetched dictionaries
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  // Use useEffect to fetch data when the component mounts
  useEffect(() => {
    fetchData();
  }, []); // Empty dependency array ensures this runs once when the component mounts

  return (
    <PageWrapper>
      {/* Left Container for List */}
      <Container>
        <Typography sx={{ mt: 2, mb: 2, fontSize: "2rem" }} variant="h4" component="div" style={{ fontSize: "50px" }}>
          Dictionaries List
        </Typography>
        <List dense={false}>
          {dictionaries.map((dict, index) => (
            <StyledListItem
              key={index}
              selected={selectedDictionary === dict.name}
              onClick={() =>
                selectedDictionary === dict.name ? handleDeselectDictionary() : handleDictionarySelect(dict.name)
              }
              secondaryAction={
                <Tooltip title="Delete">
                  <IconButton>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              }
            >
              <ListItemAvatar>
                <Avatar sx={{ width: 45, height: 45, backgroundColor: "rgb(212, 244, 255)" }}>
                  <FolderIcon sx={{ fontSize: "2rem", color: "grey" }} />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={dict.name} primaryTypographyProps={{ fontSize: "1.5rem" }} />
            </StyledListItem>
          ))}
        </List>

        {/* Conditionally render the Edit Dictionary button */}
        {selectedDictionary && (
          <Button href="./editdictionary" variant="contained" size="large" style={{ marginTop: "20px", fontSize: "20px" }} onClick={handleEditClick}>
            Edit Dictionary
          </Button>
        )}
      </Container>

      {/* Right Container for Form */}
      <Container>
        <Typography sx={{ mt: 2, mb: 2, fontSize: "2rem" }} variant="h4" component="div">
          Create Dictionary
        </Typography>
        <form onSubmit={handleSubmit} style={{ width: "100%", marginTop: "30px" }}>
          <TextField
            label="Dictionary Name"
            variant="outlined"
            size="medium"
            fullWidth
            value={dictionaryName}
            onChange={(e) => setDictionaryName(e.target.value)}
            required
            InputLabelProps={{
              required: false,
            }}
            style={{ width: 300 }}
          />
          <div id="actions">
            {actions.map((action, index) => (
              <div key={index} style={{ display: "flex", gap: "30px", marginTop: "30px", marginLeft: "230px" }}>
                <TextField
                  label={`Action ${index + 1}`}
                  variant="outlined"
                  size="medium"
                  fullWidth
                  value={action}
                  onChange={(e) => handleActionChange(index, e.target.value)}
                  required
                  InputLabelProps={{
                    required: false,
                  }}
                  style={{ width: 300 }}
                />
                <Button variant="contained" size="small" onClick={() => deleteActionField(index)} style={{ fontSize: "20px" }}>
                  Delete Action
                </Button>
              </div>
            ))}
          </div>

          <Button type="button" variant="contained" size="small" onClick={addActionField} style={{ marginTop: "20px", fontSize: "20px", width: "160px", marginRight: "78px" }}>
            Add Action
          </Button>

          <Button variant="contained" size="small" type="submit" style={{ marginTop: "20px", fontSize: "20px" }}>
            Create Dictionary
          </Button>
        </form>
      </Container>
    </PageWrapper>
  );
};

export default MainDictionary;
