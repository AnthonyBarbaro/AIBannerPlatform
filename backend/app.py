import os
import logging
from flask import Flask, request, send_file, jsonify, send_from_directory
from flask_cors import CORS
from PIL import Image
import base64
from io import BytesIO
from werkzeug.utils import secure_filename

# Import from local modules
from banner_generator.generate import generate_image_from_prompt
from banner_generator.overlay import (
    overlay_text_on_image,
    overlay_logo_on_image,
    save_image_to_bytes,
    draw_shape_on_image
)

UPLOAD_FOLDER = "uploads"
app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

CORS(app)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/favicon.ico')
def favicon():
    return send_from_directory(
        'static',
        'favicon.ico',
        mimetype='image/vnd.microsoft.icon'
    )

@app.route('/')
def home():
    return jsonify({"message": "Welcome to the AI Banner Generator!"})

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok"}), 200

#############################
# Upload Logo Endpoint
#############################
@app.route('/api/upload-logo', methods=['POST'])
def upload_logo():
    """Endpoint to handle logo file uploads."""
    if 'logo' not in request.files:
        return jsonify({"error": "No logo file provided"}), 400

    file = request.files['logo']
    if file.filename == '':
        return jsonify({"error": "Empty filename"}), 400

    filename = secure_filename(file.filename)
    upload_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    file.save(upload_path)

    return jsonify({"logo_path": upload_path})

#############################
# Generate Banner Endpoint
#############################
@app.route('/api/generate-banner', methods=['POST'])
def generate_banner():
    data = request.json or {}

    # 1) Parse AI generation parameters
    prompt = data.get("prompt", "A modern eCommerce banner...")
    steps = data.get("num_inference_steps", 100)
    scale = data.get("guidance_scale", 7.5)
    width = data.get("width", 1200)
    height = data.get("height", 400)

    # 2) Generate base image
    image = generate_image_from_prompt(
        prompt=prompt,
        num_inference_steps=steps,
        guidance_scale=scale,
        width=width,
        height=height
    )

    # 3) Optional shape overlay
    if data.get("draw_shape", False):
        shape_type = data.get("shape_type", "rectangle")
        shape_color = tuple(data.get("shape_color", [0, 255, 0]))
        shape_position = tuple(data.get("shape_position", [300, 100]))
        shape_size = tuple(data.get("shape_size", [200, 100]))
        image = draw_shape_on_image(image, shape_type, shape_position, shape_size, shape_color)

    # 4) Overlay text if provided
    overlay_text = data.get("overlay_text", "")
    if overlay_text:
        text_position = tuple(data.get("text_position", [50, 50]))
        text_color = tuple(data.get("text_color", [255, 255, 255]))
        text_bold = data.get("text_bold", False)
        text_outline_color = tuple(data.get("text_outline_color", [0, 0, 0]))
        text_outline_width = data.get("text_outline_width", 2)

        image = overlay_text_on_image(
            image,
            text=overlay_text,
            position=text_position,
            font_size=42,
            text_color=text_color,
            text_bold=text_bold,
            text_outline_color=text_outline_color,
            text_outline_width=text_outline_width
        )

    # 5) Overlay logo if provided
    logo_path = data.get("logo_path")
    if logo_path and os.path.exists(logo_path):
        logo_position = tuple(data.get("logo_position", [10, 10]))
        logo_resize = data.get("logo_resize")  # e.g. [150, 50]
        image = overlay_logo_on_image(image, logo_path, position=logo_position, resize_to=logo_resize)

    # 6) Convert to bytes and return
    img_bytes = save_image_to_bytes(image)
    return send_file(img_bytes, mimetype="image/png")

#############################
# AI Enhancement Endpoint
#############################
@app.route('/api/ai-enhance', methods=['POST'])
def ai_enhance():
    """
    Endpoint for 'enhancing' an uploaded image using AI (stub).
    Expects base64: { "image": "data:image/png;base64,..." }
    """
    try:
        data = request.json or {}
        image_data = data.get('image')
        if not image_data:
            return jsonify({"error": "No image data provided"}), 400

        base64_string = image_data.split(",")[1]
        decoded_image = base64.b64decode(base64_string)
        pil_image = Image.open(BytesIO(decoded_image))

        # Stub: do something advanced like inpainting
        enhanced_image = generate_image_from_prompt(
            prompt="Enhance this image",
            # If your pipeline supported an input image for inpainting, you'd pass it here
        )

        img_bytes = save_image_to_bytes(enhanced_image)
        return send_file(img_bytes, mimetype='image/png')

    except Exception as e:
        logger.error(f"AI enhance error: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    logger.info(f"Starting Flask server on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=True)
