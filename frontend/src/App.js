// src/App.js
import React, { useState } from 'react';
import './App.css';
import { generateBanner } from './services/api';
import BannerCanvas from './components/BannerCanvas';

function App() {
  const [prompt, setPrompt] = useState('A stunning eCommerce product banner');
  const [overlayText, setOverlayText] = useState('SALE!');
  const [bannerUrl, setBannerUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    setBannerUrl(null);
    try {
      const payload = {
        prompt,
        overlay_text: overlayText,
        text_position: [50, 50],
        text_color: [255, 0, 0], // Red color
        logo_path: null,
      };
      const imageUrl = await generateBanner(payload);
      setBannerUrl(imageUrl);
    } catch (error) {
      console.error(error);
      alert('Failed to generate banner');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <div className="main-layout">
        {/* Side Panel */}
        <div className="side-panel">
          <h2>AI Banner Config</h2>
          <div className="form-group">
            <label>Prompt</label>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your idea..."
            />
          </div>
          <div className="form-group">
            <label>Overlay Text</label>
            <input
              type="text"
              value={overlayText}
              onChange={(e) => setOverlayText(e.target.value)}
              placeholder="Add overlay text..."
            />
          </div>
          <button
            className="generate-btn"
            onClick={handleGenerate}
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Generate AI Banner'}
          </button>
          <hr />
          {bannerUrl && (
            <div>
              <h3>Generated Banner</h3>
              <img
                src={bannerUrl}
                alt="Generated Banner"
                className="generated-banner"
              />
              <button
                className="download-btn"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = bannerUrl;
                  link.download = 'ai-banner.png';
                  link.click();
                }}
              >
                Download Banner
              </button>
            </div>
          )}
        </div>

        {/* Main Canvas Area */}
        <div className="canvas-area">
          <BannerCanvas />
        </div>
      </div>
    </div>
  );
}

export default App;
