// src/App.js
import React, { useState } from 'react';
import './App.css';
import { generateBanner, uploadLogo } from './services/api';
import BannerCanvas from './components/BannerCanvas';

function App() {
  // Prompt states
  const [promptPrimary, setPromptPrimary] = useState('A stunning eCommerce product banner');
  const [promptSecondary, setPromptSecondary] = useState('Minimalistic design, bright accents');

  // Text overlay states
  const [overlayText, setOverlayText] = useState('SALE!');
  const [textBold, setTextBold] = useState(false);
  const [outlineColor, setOutlineColor] = useState('#000000');
  const [outlineWidth, setOutlineWidth] = useState(2);
  const [textColor, setTextColor] = useState('#FF0000'); // Default red
  const [multipleLines, setMultipleLines] = useState(false);

  // AI generation states (no model selection here)
  const [numInferenceSteps, setNumInferenceSteps] = useState(250);
  const [guidanceScale, setGuidanceScale] = useState(7.5);

  // Dimensions
  const [bannerWidth, setBannerWidth] = useState(1200);
  const [bannerHeight, setBannerHeight] = useState(400);

  // Generated banner
  const [bannerUrl, setBannerUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Logo handling
  const [logoFile, setLogoFile] = useState(null);
  const [logoPosition, setLogoPosition] = useState([10, 10]);
  const [logoResize, setLogoResize] = useState([150, 50]); // optional resize

  // Additional shape overlay example
  const [drawShape, setDrawShape] = useState(false);
  const [shapeType, setShapeType] = useState('rectangle');
  const [shapeColor, setShapeColor] = useState('#00FF00');
  const [shapePosition, setShapePosition] = useState([300, 100]);
  const [shapeSize, setShapeSize] = useState([200, 100]); // width, height or radius

  const handleGenerate = async () => {
    setIsLoading(true);
    setBannerUrl(null);

    // Combine multiple prompt fields
    const finalPrompt = multipleLines
      ? `${promptPrimary}\n${promptSecondary}`
      : `${promptPrimary} ${promptSecondary}`;

    try {
      const payload = {
        // Basic generation config
        prompt: finalPrompt,
        num_inference_steps: numInferenceSteps,
        guidance_scale: guidanceScale,
        width: parseInt(bannerWidth, 10),
        height: parseInt(bannerHeight, 10),

        // Text overlay config
        overlay_text: overlayText,
        text_position: [50, 50],
        text_color: hexToRGB(textColor),
        text_bold: textBold,
        text_outline_color: hexToRGB(outlineColor),
        text_outline_width: outlineWidth,

        // Shape overlay config
        draw_shape: drawShape,
        shape_type: shapeType,
        shape_color: hexToRGB(shapeColor),
        shape_position: shapePosition,
        shape_size: shapeSize,
      };

      // If user uploaded a logo, handle that separately
      if (logoFile) {
        const uploadedLogoPath = await uploadLogo(logoFile);
        payload.logo_path = uploadedLogoPath;
        payload.logo_position = logoPosition;
        payload.logo_resize = logoResize;
      }

      const imageUrl = await generateBanner(payload);
      setBannerUrl(imageUrl);
    } catch (error) {
      console.error(error);
      alert('Failed to generate banner');
    } finally {
      setIsLoading(false);
    }
  };

  // Convert a hex string (#RRGGBB) to [r,g,b] array
  const hexToRGB = (hex) => {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return [r, g, b];
  };

  const handleLogoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };

  return (
    <div className="App">
      <div className="main-layout">
        {/* Side Panel */}
        <div className="side-panel">
          <h2>AI Banner Config</h2>

          {/* Primary & Secondary prompts */}
          <div className="form-group">
            <label>Prompt (Primary)</label>
            <input
              type="text"
              value={promptPrimary}
              onChange={(e) => setPromptPrimary(e.target.value)}
              placeholder="Enter your main idea..."
            />
          </div>
          <div className="form-group">
            <label>Prompt (Secondary)</label>
            <input
              type="text"
              value={promptSecondary}
              onChange={(e) => setPromptSecondary(e.target.value)}
              placeholder="Additional style / theme..."
            />
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={multipleLines}
                onChange={() => setMultipleLines(!multipleLines)}
              />
              Combine as multiple lines?
            </label>
          </div>

          {/* Overlay Text */}
          <div className="form-group">
            <label>Overlay Text</label>
            <input
              type="text"
              value={overlayText}
              onChange={(e) => setOverlayText(e.target.value)}
              placeholder="Add overlay text..."
            />
          </div>

          {/* Text Style Options */}
          <div className="form-group">
            <label>Text Color</label>
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={textBold}
                onChange={(e) => setTextBold(e.target.checked)}
              />
              Bold Text?
            </label>
          </div>
          <div className="form-group">
            <label>Outline Color</label>
            <input
              type="color"
              value={outlineColor}
              onChange={(e) => setOutlineColor(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Outline Width</label>
            <input
              type="number"
              value={outlineWidth}
              onChange={(e) => setOutlineWidth(parseInt(e.target.value, 10))}
            />
          </div>

          {/* AI Generation Config */}
          <div className="form-group">
            <label>Inference Steps</label>
            <input
              type="number"
              value={numInferenceSteps}
              onChange={(e) => setNumInferenceSteps(parseInt(e.target.value, 10))}
            />
          </div>
          <div className="form-group">
            <label>Guidance Scale</label>
            <input
              type="number"
              step="0.1"
              value={guidanceScale}
              onChange={(e) => setGuidanceScale(parseFloat(e.target.value))}
            />
          </div>

          {/* Banner Dimensions */}
          <div className="form-group">
            <label>Width</label>
            <input
              type="number"
              value={bannerWidth}
              onChange={(e) => setBannerWidth(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Height</label>
            <input
              type="number"
              value={bannerHeight}
              onChange={(e) => setBannerHeight(e.target.value)}
            />
          </div>

          {/* Logo Upload */}
          <div className="form-group">
            <label>Logo (Optional)</label>
            <input type="file" accept="image/*" onChange={handleLogoChange} />
          </div>

          {/* Shape Overlay */}
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={drawShape}
                onChange={(e) => setDrawShape(e.target.checked)}
              />
              Draw a Shape?
            </label>
            {drawShape && (
              <>
                <label>Shape Type</label>
                <select value={shapeType} onChange={(e) => setShapeType(e.target.value)}>
                  <option value="rectangle">Rectangle</option>
                  <option value="circle">Circle</option>
                </select>
                <label>Shape Color</label>
                <input
                  type="color"
                  value={shapeColor}
                  onChange={(e) => setShapeColor(e.target.value)}
                />
                <label>Shape Position (x,y)</label>
                <input
                  type="text"
                  value={shapePosition.join(',')}
                  onChange={(e) => setShapePosition(e.target.value.split(',').map(Number))}
                />
                <label>Shape Size (w,h or r)</label>
                <input
                  type="text"
                  value={shapeSize.join(',')}
                  onChange={(e) => setShapeSize(e.target.value.split(',').map(Number))}
                />
              </>
            )}
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
