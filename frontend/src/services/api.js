// src/services/api.js
export async function generateBanner(payload) {
    const response = await fetch('/api/generate-banner', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  
    if (!response.ok) {
      throw new Error('Failed to generate banner');
    }
  
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }
  