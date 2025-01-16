// src/components/BannerCanvas.js
import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import './BannerCanvas.css';
import Toolbar from './Toolbar';
import LayersPanel from './LayersPanel';

const BannerCanvas = () => {
  const canvasRef = useRef(null); // Direct Fabric.js reference
  const [canvas, setCanvas] = useState(null);

  // ============= History (Undo/Redo) =============
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // ============= Layers Panel =============
  const [layers, setLayers] = useState([]);

  // ============= Canvas Size & Zoom =============
  const [canvasSize, setCanvasSize] = useState({
    width: Math.floor(window.innerWidth * 0.6), // ~60% of viewport width
    height: Math.floor(window.innerHeight * 0.8),
  });
  const [zoomLevel, setZoomLevel] = useState(1);

  // ============= Paywall / Subscription Stub =============
  const [isPaidUser, setIsPaidUser] = useState(false);

  // --------------------------------------------------------
  // Initialization & Cleanup
  // --------------------------------------------------------
  useEffect(() => {
    const newCanvas = new fabric.Canvas('bannerCanvas', {
      width: canvasSize.width,
      height: canvasSize.height,
      backgroundColor: '#fefefe',
    });
    setCanvas(newCanvas);

    // Apply initial sizing
    const resizeCanvas = () => {
      newCanvas.setWidth(canvasSize.width);
      newCanvas.setHeight(canvasSize.height);
      newCanvas.renderAll();
    };
    resizeCanvas();

    // Sync with window resizing (if needed)
    window.addEventListener('resize', resizeCanvas);

    // Register events for history, layers
    newCanvas.on('object:modified', saveHistory);
    newCanvas.on('object:added', saveHistory);
    newCanvas.on('object:removed', saveHistory);

    newCanvas.on('selection:created', () => updateLayersList(newCanvas));
    newCanvas.on('selection:updated', () => updateLayersList(newCanvas));
    newCanvas.on('object:modified', () => updateLayersList(newCanvas));
    newCanvas.on('object:added', () => updateLayersList(newCanvas));
    newCanvas.on('object:removed', () => updateLayersList(newCanvas));

    canvasRef.current = newCanvas;

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      newCanvas.dispose();
    };
    // eslint-disable-next-line
  }, [canvasSize]);

  // --------------------------------------------------------
  // History Logic (Undo/Redo)
  // --------------------------------------------------------
  const saveHistory = () => {
    if (!canvasRef.current) return;

    const currentJSON = canvasRef.current.toJSON();
    // Cut off "future" states if user just undid
    let updatedHistory = history.slice(0, historyIndex + 1);

    updatedHistory.push(currentJSON);
    // Keep only last 5 states
    if (updatedHistory.length > 5) updatedHistory.shift();

    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex <= 0) return; // no older states
    const newIndex = historyIndex - 1;
    loadFromJSON(history[newIndex]);
    setHistoryIndex(newIndex);
  };

  const redo = () => {
    if (historyIndex >= history.length - 1) return; // no newer states
    const newIndex = historyIndex + 1;
    loadFromJSON(history[newIndex]);
    setHistoryIndex(newIndex);
  };

  const loadFromJSON = (json) => {
    canvasRef.current?.loadFromJSON(json, () => {
      canvasRef.current.renderAll();
      updateLayersList(canvasRef.current);
    });
  };

  // --------------------------------------------------------
  // Layers Panel
  // --------------------------------------------------------
  const updateLayersList = (c) => {
    const objects = c.getObjects().map((obj, index) => ({
      id: index,
      type: obj.type,
      name: obj.type === 'image' ? 'Image Layer' : obj.text || 'Layer',
      objRef: obj,
      active: obj === c.getActiveObject(),
    }));
    setLayers(objects.reverse()); // top-most first
  };

  const reorderLayer = (layer, direction) => {
    if (!canvasRef.current) return;
    const obj = layer.objRef;

    if (direction === 'front') {
      canvasRef.current.bringToFront(obj);
    } else {
      canvasRef.current.sendToBack(obj);
    }
    canvasRef.current.renderAll();
    updateLayersList(canvasRef.current);
    saveHistory();
  };

  const selectLayer = (layer) => {
    if (!canvasRef.current) return;
    canvasRef.current.setActiveObject(layer.objRef);
    canvasRef.current.renderAll();
  };

  const onUpdateLayers = () => {
    updateLayersList(canvasRef.current);
    saveHistory();
  };

  // --------------------------------------------------------
  // Zoom Controls
  // --------------------------------------------------------
  const zoomOut = () => {
    if (!canvasRef.current) return;
    let newZoom = zoomLevel - 0.1;
    if (newZoom < 0.1) newZoom = 0.1;
    canvasRef.current.setZoom(newZoom);
    canvasRef.current.renderAll();
    setZoomLevel(newZoom);
  };

  const zoomIn = () => {
    if (!canvasRef.current) return;
    const newZoom = zoomLevel + 0.1;
    canvasRef.current.setZoom(newZoom);
    canvasRef.current.renderAll();
    setZoomLevel(newZoom);
  };

  const resetZoom = () => {
    if (!canvasRef.current) return;
    canvasRef.current.setZoom(1);
    canvasRef.current.renderAll();
    setZoomLevel(1);
  };

  // --------------------------------------------------------
  // Canvas Resize Controls
  // --------------------------------------------------------
  const handleResizeChange = (e) => {
    const { name, value } = e.target;
    let val = parseInt(value, 10);
    if (isNaN(val) || val <= 0) val = 100; // fallback
    setCanvasSize((prev) => ({ ...prev, [name]: val }));
  };

  // --------------------------------------------------------
  // Paywall Example
  // --------------------------------------------------------
  const handleSubscribe = () => {
    setIsPaidUser(true);
    alert('Subscription activated: Enjoy HD exports and more tools!');
  };

  const handleExport = () => {
    if (!isPaidUser) {
      alert('Subscribe to unlock HD export!');
      return;
    }
    const dataURL = canvasRef.current.toDataURL({
      format: 'png',
      multiplier: 2,
    });
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'banner-hd.png';
    link.click();
  };

  return (
    <div className="banner-canvas-wrapper">
      {/* Free vs Paid Notice */}
      {!isPaidUser && (
        <div className="subscribe-notice">
          <p>
            You're on the FREE plan. <strong>Subscribe</strong> for HD export,
            more shapes, and premium AI features!
          </p>
          <button onClick={handleSubscribe}>Subscribe Now</button>
        </div>
      )}

      {/* Top bar: Undo/Redo, Zoom, Canvas Size */}
      <div className="top-bar">
        {/* Undo/Redo */}
        <div className="history-bar">
          <button onClick={undo}>Undo</button>
          <button onClick={redo}>Redo</button>
        </div>

        {/* Zoom */}
        <div className="zoom-bar">
          <button onClick={zoomOut}>-</button>
          <span>{(zoomLevel * 100).toFixed(0)}%</span>
          <button onClick={zoomIn}>+</button>
          <button onClick={resetZoom}>Reset</button>
        </div>

        {/* Canvas Resize */}
        <div className="size-controls">
          <label>
            W:
            <input
              type="number"
              name="width"
              value={canvasSize.width}
              onChange={handleResizeChange}
            />
          </label>
          <label>
            H:
            <input
              type="number"
              name="height"
              value={canvasSize.height}
              onChange={handleResizeChange}
            />
          </label>
        </div>
      </div>

      {/* Main Editor Layout */}
      <div className="editor-layout">
        {/* Tools on the Left */}
        <Toolbar canvas={canvasRef.current} onUpdateLayers={onUpdateLayers} />

        {/* Canvas in Center */}
        <div className="editor-canvas">
          <canvas id="bannerCanvas" />
        </div>

        {/* Layers & Export on Right */}
        <div className="right-panel">
          <LayersPanel
            layers={layers}
            onSelectLayer={selectLayer}
            onReorderLayer={reorderLayer}
          />
          <button className="export-btn" onClick={handleExport}>
            {isPaidUser ? 'Export HD' : 'Export (Locked)'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BannerCanvas;
