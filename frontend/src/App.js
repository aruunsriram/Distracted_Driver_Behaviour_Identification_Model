import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [image, setImage] = useState(null);
  const [imageURL, setImageURL] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [inputStatus, setInputStatus] = useState(null);

  useEffect(() => {
    return () => {
      if (imageURL) {
        URL.revokeObjectURL(imageURL);
      }
    };
  }, [imageURL]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    setResult(null);
    setInputStatus(null);

    if (imageURL) {
      URL.revokeObjectURL(imageURL);
    }

    const newURL = URL.createObjectURL(file);
    setImageURL(newURL);

    const formData = new FormData();
    formData.append("image", file);

    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/predict", formData);
      setResult(response.data);
      setInputStatus("success");

      if (response.data.is_distracted) {
        const alertSound = new Audio("/alert.mp3");
        alertSound.play();
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setInputStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-wrapper">
      <video autoPlay loop muted className="background-video">
        <source src="/background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className={`App ${result ? (result.is_distracted ? "distracted" : "safe") : ""}`}>
        <div className="header">
          <h1 className="title">Efficient Distracted Driver Behavior Identification Model</h1>
          <p className="subtitle">Upload a photo to detect distracted driving behavior</p>
        </div>

        <div className="input-section">
          <input
            type="file"
            onChange={handleFileChange}
            accept="image/*"
            className={`upload-input ${
              inputStatus === "success" ? "success" : inputStatus === "error" ? "error" : ""
            }`}
            aria-label="Upload image for distracted driver detection"
          />
        </div>

        {loading && <div className="loader" role="status" aria-live="polite"></div>}

        {imageURL && (
          <div className="preview-section">
            <h3 className="preview-title">Image Preview</h3>
            <img
              src={imageURL}
              alt="Preview"
              className={`image-preview ${
                result ? (result.is_distracted ? "distracted-border" : "safe-border") : ""
              }`}
            />
          </div>
        )}

        {inputStatus === "error" && (
          <div
            className="error-message"
            role="alert"
            style={{ color: "#f44336", marginTop: "10px", textAlign: "center" }}
          >
            Sorry, something went wrong while uploading the image. Please try again.
          </div>
        )}

        {result && (
          <div className={`result-card ${result.is_distracted ? "distracted" : "safe"} show`}>
            <h2>{result.is_distracted ? "🚨 Distracted!" : "✅ Safe Driving"}</h2>
            <p><strong>Behavior:</strong> {result.label}</p>
            <p><strong>Confidence:</strong> {(result.confidence * 100).toFixed(2)}%</p>
          </div>
        )}

        <div className="footer">
          <p>&copy; 2025 Distracted Driver Detection | All Rights Reserved</p>
        </div>
      </div>
    </div>
  );
}

export default App;