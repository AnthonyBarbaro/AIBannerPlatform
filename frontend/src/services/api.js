// src/services/api.js
export async function generateBanner(payload) {
  const response = await fetch('/api/generate-banner', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error('Failed to generate banner');
  }
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

// If you want to upload a logo
export async function uploadLogo(file) {
  const formData = new FormData();
  formData.append('logo', file);

  const response = await fetch('/api/upload-logo', {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    throw new Error('Failed to upload logo');
  }
  const data = await response.json();
  return data.logo_path; // Return the stored path from the server
}
