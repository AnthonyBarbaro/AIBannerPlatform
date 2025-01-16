// src/components/LayersPanel.js
import React from 'react';
import './BannerCanvas.css';

const LayersPanel = ({ layers, onSelectLayer, onReorderLayer }) => {
  return (
    <div className="layers-panel">
      <h3>Layers</h3>
      {layers.length === 0 && <p>No layers yet...</p>}

      {layers.map((layer) => (
        <div
          key={layer.id}
          className={`layer-item ${layer.active ? 'active-layer' : ''}`}
        >
          <span onClick={() => onSelectLayer(layer)}>
            {layer.name} ({layer.type})
          </span>
          <div className="layer-controls">
            <button onClick={() => onReorderLayer(layer, 'front')}>Front</button>
            <button onClick={() => onReorderLayer(layer, 'back')}>Back</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LayersPanel;
