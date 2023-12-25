import React, { useCallback, useState } from "react";
import { TextField, Grid, Button } from "@mui/material";

function App() {
  const [inputPrompt, setInputPrompt] = useState("");
  const [lastPrompt, setLastPrompt] = useState("");
  const [images, setImages] = useState(Array(16).fill("images/white.jpg"));
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const calculateEditDistance = (a: string, b: string) => {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let i = 0; i <= a.length; i++) {
      matrix[0][i] = i;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
          );
        }
      }
    }

    return matrix[b.length][a.length];
  };

  const fetchImage = useCallback(
    async (index: number) => {
      try {
        const response = await fetch("api/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: inputPrompt }),
        });
        const data = await response.json();
        const imageUrl = `data:image/jpeg;base64,${data.base64_image}`;

        setImages((prevImages) => {
          const newImages = [...prevImages];
          newImages[index] = imageUrl;
          return newImages;
        });
      } catch (error) {
        console.error("Error fetching image:", error);
      }
    },
    [inputPrompt]
  );

  const handlePromptChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputPrompt(event.target.value);
    const newPrompt = event.target.value;
    const editDistance = calculateEditDistance(lastPrompt, newPrompt);

    if (editDistance >= 4) {
      setInputPrompt(newPrompt);
      setLastPrompt(newPrompt);
      for (let i = 0; i < 16; i++) {
        fetchImage(i);
      }
    }
  };

  return (
    <div
      className="App"
      style={{
        backgroundColor: "#282c34",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0",
        color: "#ffffff",
        padding: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "#282c34",
          alignItems: "center",
          justifyContent: "center",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Grid
          container
          spacing={1}
          style={{ maxWidth: "60rem", maxHeight: "70%" }}
        >
          {images.map((image, index) => (
            <Grid item xs={3} key={index}
              onMouseEnter={() => setHoveredId(index)}
              onMouseLeave={() => setHoveredId(null)}
              style={{ position: 'relative' }}
            >
              <img
                src={image}
                alt={`Generated ${index}`}
                style={{
                  display: "block",
                  margin: "0 auto",
                  maxWidth: "100%",
                  maxHeight: "150px",
                  borderRadius: "10px",
                }}
              />
              {hoveredId === index && (
                <Button
                  href={image}
                  download={`downloaded_image_${index}.jpg`}
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    minWidth: '30px',
                    minHeight: '30px',
                    padding: 0,
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    border: 'none',
                  }}
                >
                  <span style={{ fontSize: '20px', color: 'black' }}>⬇️</span>
                </Button>
              )}
            </Grid>
          ))}
        </Grid>
        <TextField
          variant="outlined"
          value={inputPrompt}
          onChange={handlePromptChange}
          style={{
            marginBottom: "20px",
            marginTop: "20px",
            width: "100%",
            maxWidth: "50rem",
            color: "#ffffff",
            borderColor: "#ffffff",
            borderRadius: "10px",
            backgroundColor: "#ffffff",
          }}
          placeholder="Enter a prompt"
        />
      </div>
    </div>
  );
}

export default App;
