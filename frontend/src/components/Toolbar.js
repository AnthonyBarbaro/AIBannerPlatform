// src/components/Toolbar.js
import React from 'react';
import { fabric } from 'fabric';
import './BannerCanvas.css';

const Toolbar = ({ canvas, onUpdateLayers }) => {
  // Add Text
  const addText = () => {
    if (!canvas) return;
    const text = new fabric.Textbox('New Text', {
      left: 100,
      top: 100,
      fontSize: 24,
      fill: '#002b80',
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    onUpdateLayers(canvas);
  };

  // Add Image (by URL)
  const addImage = (url) => {
    if (!canvas) return;
    fabric.Image.fromURL(url, (img) => {
      img.scaleToWidth(200);
      img.set({
        left: canvas.getWidth() / 2 - img.width / 2,
        top: canvas.getHeight() / 2 - img.height / 2,
      });
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
      onUpdateLayers(canvas);
    });
  };

  // File Upload
  const handleFileUpload = (e) => {
    if (!canvas) return;
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (f) => {
        fabric.Image.fromURL(f.target.result, (img) => {
          img.scaleToWidth(200);
          img.set({
            left: canvas.getWidth() / 2 - img.width / 2,
            top: canvas.getHeight() / 2 - img.height / 2,
          });
          canvas.add(img);
          canvas.setActiveObject(img);
          canvas.renderAll();
          onUpdateLayers(canvas);
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Add Shapes
  const addRectangle = () => {
    if (!canvas) return;
    const rect = new fabric.Rect({
      left: 150,
      top: 150,
      fill: '#0056b3',
      width: 100,
      height: 100,
    });
    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.renderAll();
    onUpdateLayers(canvas);
  };

  const addCircle = () => {
    if (!canvas) return;
    const circle = new fabric.Circle({
      left: 200,
      top: 200,
      radius: 50,
      fill: '#52a0ff',
    });
    canvas.add(circle);
    canvas.setActiveObject(circle);
    canvas.renderAll();
    onUpdateLayers(canvas);
  };

  // Delete
  const deleteActiveObject = () => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.remove(activeObject);
      canvas.renderAll();
      onUpdateLayers(canvas);
    }
  };

  // AI Enhancement
  const applyAIEnhancement = async () => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'image') {
      const dataUrl = activeObject.toDataURL();
      try {
        const response = await fetch('/api/ai-enhance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: dataUrl }),
        });
        const blob = await response.blob();
        const enhancedImageUrl = URL.createObjectURL(blob);
        fabric.Image.fromURL(enhancedImageUrl, (img) => {
          canvas.remove(activeObject);
          canvas.add(img);
          canvas.setActiveObject(img);
          canvas.renderAll();
          onUpdateLayers(canvas);
        });
      } catch (err) {
        console.error('AI enhancement error:', err);
        alert('Failed to enhance image.');
      }
    }
  };

  return (
    <div className="toolbar">
      <button onClick={addText}>Text</button>
      <button onClick={() => addImage('https://via.placeholder.com/300')}>
        Image URL
      </button>
      <input type="file" accept="image/*" onChange={handleFileUpload} />
      <button onClick={addRectangle}>Rectangle</button>
      <button onClick={addCircle}>Circle</button>
      <button onClick={deleteActiveObject}>Delete</button>
      <button onClick={applyAIEnhancement}>AI Enhance</button>
    </div>
  );
};

export default Toolbar;
