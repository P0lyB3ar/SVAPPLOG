import React, { useState, useRef, useEffect } from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Button from "@mui/material/Button";
import Typography from '@mui/material/Typography';
import { Box, styled, IconButton } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';

// Define DictionaryProps type
type DictionaryProps = {
  dictionaryName: string;
  actions: string[];
};

// Wrapper to center the Container
const CenteredWrapper = styled("div")({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "100vh", // Ensure the wrapper takes full viewport height
  padding: "20px", // Optional padding around the container
  boxSizing: "border-box",
  backgroundColor: "#fff", // Optional background color to make the container stand out
});

// Styled container
const Container = styled("div")({
  backgroundColor: "rgb(212, 244, 255)", // Original background color for each container
  padding: "20px",
  borderRadius: "8px", // Optional for rounded corners
  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)", // Optional for a subtle shadow effect
  width: "800px", // Fixed width for both containers
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  alignItems: "center", // Center items horizontally
  justifyContent: "center", // Center items vertically
  textAlign: "center", // Ensure text is centered inside components
  maxHeight: "810px", // Maximum height of the container
  overflow: "auto", // Make the container scrollable if content overflows
});

const DictionaryEdit: React.FC<DictionaryProps> = ({
  dictionaryName,
  actions,
}) => {
  const [actionItems, setActionItems] = useState(actions);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const editRef = useRef<HTMLDivElement | null>(null);

  // Enable editing function
  const enableEditing = (index: number) => {
    setEditingIndex(index);
    setIsEditing(true);
  };

  // Save changes function
  const saveChanges = async (index: number) => {
    if (editRef.current) {
      const updatedAction = editRef.current.textContent || "";

      const newItems = [...actionItems];
      newItems[index] = updatedAction;
      setActionItems(newItems);
      setEditingIndex(null);
      setIsEditing(false);

      try {
        const response = await fetch("/update-dictionary", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: dictionaryName,
            newActions: newItems,
          }),
        });

        if (!response.ok) {
          alert("Failed to update the dictionary");
        }
      } catch (error) {
        console.error("Error updating dictionary:", error);
        alert("An error occurred while updating the dictionary");
      }
    }
  };

  // Handle delete function
  const handleDelete = (index: number) => {
    const newItems = actionItems.filter((_, i) => i !== index);
    setActionItems(newItems);

    fetch("/update-dictionary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: dictionaryName,
        newActions: newItems,
      }),
    }).catch(error => {
      console.error("Error updating dictionary:", error);
      alert("An error occurred while updating the dictionary");
    });
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editRef.current && !editRef.current.contains(event.target as Node)) {
        if (isEditing && editingIndex !== null) {
          saveChanges(editingIndex);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isEditing, editingIndex]);

  return (
    <CenteredWrapper>
      <Container>
        <Button
          href="./dictionary"
          variant="contained"
          size="large"
          style={{ marginTop: "2px", marginLeft: "-630px", fontSize: "20px" }}
        >
          Return
        </Button>

        <Typography
          sx={{ mt: 2, mb: 2, fontSize: "3rem" }}
          variant="h4"
          component="div"
        >
          Dictionary: {dictionaryName}
        </Typography>

        <Box
          sx={{
            width: "100%",
            maxWidth: 500,
            bgcolor: "background.paper",
            overflow: "auto",
            maxHeight: 300,
            padding: "10px",
            backgroundColor: "rgb(212, 244, 255)"
          }}
        >
          <List>
            {actionItems.map((action, index) => (
              <ListItem
                key={index}
                sx={{ cursor: "pointer", display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                style={{ backgroundColor: "rgb(212, 244, 255)" }}
              >
                <Box
                  ref={editingIndex === index ? editRef : null} // Set ref only when editing
                  contentEditable={editingIndex === index} // Enable editing
                  suppressContentEditableWarning={true}
                  sx={{ flexGrow: 1, padding: 1 }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      wordWrap: 'break-word',
                      display: 'inline-block',
                      width: '100%',
                      fontSize: "30px",
                    }}
                  >
                    {action}
                  </Typography>
                </Box>
                <Box>
                  {editingIndex === index ? (
                    <IconButton
                      onClick={() => saveChanges(index)}
                      sx={{ fontSize: 50 }} // Adjust icon size here
                    >
                      <CheckIcon />
                    </IconButton>
                  ) : (
                    <IconButton
                      onClick={() => enableEditing(index)}
                      sx={{ fontSize: 50 }} // Adjust icon size here
                    >
                      <EditIcon />
                    </IconButton>
                  )}
                  <IconButton
                    onClick={() => handleDelete(index)}
                    sx={{ fontSize: 50 }} // Adjust icon size here
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </ListItem>
            ))}
          </List>
        </Box>
      </Container>
    </CenteredWrapper>
  );
};

export default DictionaryEdit;
