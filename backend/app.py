import os
import logging
from flask import Flask, request, send_file, jsonify, send_from_directory
from flask_cors import CORS
from PIL import Image
import base64
from io import BytesIO

# Import from local modules
from banner_generator.generate import generate_image_from_prompt
from banner_generator.overlay import overlay_text_on_image, overlay_logo_on_image, save_image_to_bytes

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Allows cross-origin requests from React dev server on localhost:3000

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Route: Favicon
@app.route('/favicon.ico')
def favicon():
    """
    Returns a favicon if requested by the browser.
    """
    return send_from_directory(
        'static', 
        'favicon.ico', 
        mimetype='image/vnd.microsoft.icon'
    )

# Route: Home (simple JSON response)
@app.route('/')
def home():
    return jsonify({"message": "Welcome to the AI Banner Generator!"})

# Health Check
@app.route('/api/health', methods=['GET'])
def health_check():
    """
    Quick health check endpoint to see if the server is running.
    """
    return jsonify({"status": "ok"}), 200

# Generate AI Banner
@app.route('/api/generate-banner', methods=['POST'])
def generate_banner():
    """
    Main endpoint for generating banners using Stable Diffusion (or any AI model).
    Optionally overlays text, logos, etc.
    """
    try:
        data = request.json or {}
        prompt = data.get('prompt', 'A stunning eCommerce product banner')
        overlay_text = data.get('overlay_text', 'Sale!')
        text_position = tuple(data.get('text_position', (50, 50)))
        text_color = tuple(data.get('text_color', (255, 0, 0)))
        logo_path = data.get('logo_path', None)

        logger.info(f"Generating banner with prompt: {prompt}")

        # 1. Generate base image
        generated_image = generate_image_from_prompt(prompt)

        # 2. Overlay text (optional)
        banner_image = overlay_text_on_image(
            generated_image,
            text=overlay_text,
            position=text_position,
            text_color=text_color
        )

        # 3. Overlay logo if provided and file exists
        if logo_path and os.path.exists(logo_path):
            banner_image = overlay_logo_on_image(banner_image, logo_path)

        # 4. Convert image to bytes and return
        img_bytes = save_image_to_bytes(banner_image)
        return send_file(img_bytes, mimetype='image/png')

    except Exception as e:
        logger.error(f"Error generating banner: {e}", exc_info=True)
        return jsonify({"error": "Failed to generate banner", "details": str(e)}), 500

# AI Enhancement Endpoint
@app.route('/api/ai-enhance', methods=['POST'])
def ai_enhance():
    """
    Endpoint for 'enhancing' an uploaded image using AI (Stable Diffusion stub).
    Expects base64 image data in request JSON: { "image": "data:image/png;base64,..." }
    """
    try:
        data = request.json or {}
        image_data = data.get('image')
        if not image_data:
            return jsonify({"error": "No image data provided"}), 400

        # Decode the base64 string (strip the prefix 'data:image/...;base64,')
        base64_string = image_data.split(",")[1]
        decoded_image = base64.b64decode(base64_string)
        pil_image = Image.open(BytesIO(decoded_image))

        # Example AI enhancement (stub): Generate image from prompt & pass the existing image
        # You could do inpainting or similar if your pipeline supports it.
        enhanced_image = generate_image_from_prompt(
            prompt="Enhance this image",
            input_image=pil_image  # Add logic in generate_image_from_prompt to accept this param
        )

        # Convert to bytes and send back
        img_bytes = save_image_to_bytes(enhanced_image)
        return send_file(img_bytes, mimetype='image/png')

    except Exception as e:
        logger.error(f"AI enhance error: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

# Run the server
if __name__ == "__main__":
    # Use port=5000 by default, or read from PORT env var for cloud hosting
    port = int(os.environ.get("PORT", 5000))
    logger.info(f"Starting Flask server on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=True)
