# AI Banner Generator

The **AI Banner Generator** is a web application designed to create stunning banners and advertisements using AI-powered image generation and editing tools. It includes:
- A **Flask backend** to handle AI-based image generation using Stable Diffusion.
- A **React frontend** for an intuitive, Photoshop-like user interface with tools for layers, resizing, zoom, and more.

---

## **Features**
1. AI-powered image generation using **Stable Diffusion**.
2. Overlay text and logos on generated banners.
3. Photoshop-like features:
   - Layers panel for object management.
   - History (Undo/Redo) for easy editing.
   - Resize, zoom, and export options.
4. Subscription-based features (e.g., HD export).

---

## **Requirements**

### Backend (Flask)
- Python 3.8 or higher
- **Virtual Environment**: `venv`
- PyTorch with CUDA (for GPU acceleration, optional but recommended)

### Frontend (React)
- Node.js (v16+ recommended)
- npm or yarn (npm is used in this guide)

---

## **Setup Instructions**

### 1. Clone the Repository
```bash
git clone <repository-url>
cd AI-Banner-Generator
