import React, { useState, useEffect, useRef } from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Box, styled, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import DeleteIcon from "@mui/icons-material/Delete";
import { useParams } from "react-router-dom";

// Styled components
const CenteredWrapper = styled("div")({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "100vh",
  padding: "20px",
  boxSizing: "border-box",
  backgroundColor: "#010409",
});

const Container = styled("div")({
  backgroundColor: "#151b23",
  padding: "20px",
  borderRadius: "8px",
  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
  width: "900px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  maxHeight: "610px",
  height: "600px",
  overflow: "auto",
});

const DictionaryEdit: React.FC = () => {
  const [dictionaryData, setDictionaryData] = useState<{ [key: string]: string[] }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedValue, setEditedValue] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false); // To track save state
  const [isDeleting, setIsDeleting] = useState<boolean>(false); // To track delete state

  const { name } = useParams(); // Get the dictionary name from the URL
  const editRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchDictionary = async () => {
      try {
        const response = await fetch(`http://localhost:8000/dictionary/${name}`);
        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.error || "Failed to fetch dictionary");
          return;
        }

        const data = await response.json();
        console.log(data); // Debug log

        if (data && data.dictionary) {
          setDictionaryData(data.dictionary);
        } else {
          setError("Malformed dictionary data");
        }
      } catch (err) {
        console.error("Error fetching dictionary:", err);
        setError("An error occurred while fetching the dictionary");
      } finally {
        setLoading(false);
      }
    };

    if (name) {
      fetchDictionary();
    }
  }, [name]);

  // Enable editing function
  const enableEditing = (index: number, value: string) => {
    setEditingIndex(index);
    setEditedValue(value);
  };

  // Save changes function
  const saveChanges = async (index: number) => {
    const newDictionaryData = { ...dictionaryData };
    const key = Object.keys(dictionaryData)[index];

    // Optimistically update UI
    newDictionaryData[key][index] = editedValue;
    setDictionaryData(newDictionaryData);
    setEditingIndex(null);
    setIsSaving(true);

    try {
      const response = await fetch(`http://localhost:8000/update-dictionary`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: key,
          newActions: newDictionaryData[key],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || "Failed to update the dictionary");
        // Revert the UI update if the request fails
        const originalValue = dictionaryData[key][index];
        newDictionaryData[key][index] = originalValue;
        setDictionaryData(newDictionaryData);
      }
    } catch (error) {
      console.error("Error updating dictionary:", error);
      alert("An error occurred while updating the dictionary");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete function
  const handleDelete = async (index: number, key: string) => {
    const newDictionaryData = { ...dictionaryData };

    // Optimistically update the UI by removing the item from the list
    const deletedItem = newDictionaryData[key].splice(index, 1); 
    setDictionaryData(newDictionaryData);
    setIsDeleting(true);

    try {
      const response = await fetch(`http://localhost:8000/update-dictionary`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: key,
          newActions: newDictionaryData[key],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || "Failed to delete the item");
        
        // Revert the UI update if the request fails
        newDictionaryData[key].splice(index, 0, deletedItem[0]);
        setDictionaryData(newDictionaryData);
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("An error occurred while deleting the item");
      
      // Revert the UI update if the request fails
      newDictionaryData[key].splice(index, 0, deletedItem[0]);
      setDictionaryData(newDictionaryData);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <CenteredWrapper>
      <Container>
        <Button
          href="/dictionary"
          variant="contained"
          size="large"
          sx={{ alignSelf: "flex-start", marginBottom: "20px" }}
        >
          Back to all dictionaries
        </Button>

        <Typography sx={{ fontSize: "3rem", color: "white", marginBottom: "20px", fontWeight: "bold" }}>
          Dictionary: {name}
        </Typography>

        {loading ? (
          <Typography sx={{ color: "white", fontFamily: "Roboto, Helvetica, Arial, sans-serif" }}>Loading...</Typography>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <Box
            sx={{
              width: "100%",
              bgcolor: "background.paper",
              overflow: "auto",
              backgroundColor: "#151b23",
              borderRadius: "8px",
            }}
          >
            {Object.keys(dictionaryData).map((key, keyIndex) => (
              <Box key={key} sx={{ marginBottom: "20px", backgroundColor: "#151b23" }}>
                <List>
                  {dictionaryData[key].map((item, itemIndex) => (
                    <ListItem key={itemIndex} sx={{ color: "white", fontSize: "2rem", fontFamily: "Roboto, Helvetica, Arial, sans-serif", justifyContent: "center" }}>
                      <Box
                        ref={editingIndex === itemIndex ? editRef : null}
                        contentEditable={editingIndex === itemIndex}
                        suppressContentEditableWarning={true}
                        sx={{ flexGrow: 1, padding: 1 }}
                        onInput={(e) => setEditedValue((e.target as HTMLDivElement).textContent || "")}
                      >
                        <Typography variant="body1">{item}</Typography>
                      </Box>
                      <Box>
                        {editingIndex === itemIndex ? (
                          <IconButton onClick={() => saveChanges(itemIndex)} sx={{ fontSize: 50 }} disabled={isSaving}>
                            <CheckIcon />
                          </IconButton>
                        ) : (
                          <IconButton onClick={() => enableEditing(itemIndex, item)} sx={{ fontSize: 50 }} disabled={isSaving}>
                            <EditIcon />
                          </IconButton>
                        )}
                        <IconButton onClick={() => handleDelete(itemIndex, key)} sx={{ fontSize: 50 }} disabled={isDeleting}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </Box>
            ))}
          </Box>
        )}
      </Container>
    </CenteredWrapper>
  );
};

export default DictionaryEdit;
