import React, { useState, useEffect, useRef } from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Box, styled } from "@mui/material";
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
  width: "800px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  maxHeight: "810px",
  overflow: "auto",
});

const DictionaryEdit: React.FC = () => {
  const [dictionaryData, setDictionaryData] = useState<{ [key: string]: string[] }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { name } = useParams(); // Get the dictionary name from the URL

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

        <Typography sx={{ fontSize: "3rem", color: "white", marginBottom: "20px" }}>
          Dictionary: {name}
        </Typography>

        {loading ? (
          <Typography sx={{ color: "white" }}>Loading...</Typography>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <Box
            sx={{
              width: "100%",
              bgcolor: "background.paper",
              padding: "10px",
              overflow: "auto",
              backgroundColor: "rgb(212, 244, 255)",
              borderRadius: "8px",
            }}
          >
            {Object.keys(dictionaryData).map((key) => (
              <Box key={key} sx={{ marginBottom: "20px" }}>
                <Typography
                  variant="h6"
                  sx={{
                    textDecoration: "underline",
                    color: "black",
                    marginBottom: "10px",
                  }}
                >
                  {key}
                </Typography>
                <List>
                  {dictionaryData[key].map((item, index) => (
                    <ListItem key={index} sx={{ color: "black" }}>
                      {item}
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
