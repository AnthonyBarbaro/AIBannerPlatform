# banner_generator/overlay.py
from PIL import Image, ImageDraw, ImageFont
import io
import os

def overlay_text_on_image(
    image: Image.Image,
    text: str = "Sale 50% OFF!",
    position=(50, 50),
    font_path="backend\banner_generator\static\fonts\arial.ttf",
    font_size=42,
    text_color=(255, 0, 0)
):
    """
    Overlay text on the generated image.

    Args:
        image (Image.Image): The base image to overlay text on.
        text (str): The text to overlay on the image.
        position (tuple): The (x, y) position to place the text.
        font_path (str): Path to the font file (e.g., TTF).
        font_size (int): Size of the text.
        text_color (tuple): RGB color of the text.

    Returns:
        Image.Image: The modified image with text overlay.
    """
    try:
        draw = ImageDraw.Draw(image)
        if not os.path.exists(font_path):
            raise FileNotFoundError(f"Font file not found at {font_path}")
        font = ImageFont.truetype(font_path, font_size)

        # Add text to image
        draw.text(position, text, font=font, fill=text_color)
        print(f"Text '{text}' overlayed on image at position {position}.")
        return image
    except Exception as e:
        print(f"Error overlaying text: {e}")
        raise RuntimeError(f"Failed to overlay text: {e}")


def overlay_logo_on_image(image: Image.Image, logo_path: str, position=(10, 10), resize_to=None):
    """
    Overlay a logo on the generated image.

    Args:
        image (Image.Image): The base image to overlay the logo on.
        logo_path (str): Path to the logo image file.
        position (tuple): The (x, y) position to place the logo.
        resize_to (tuple): Resize the logo to (width, height) if specified.

    Returns:
        Image.Image: The modified image with logo overlay.
    """
    try:
        if not os.path.exists(logo_path):
            raise FileNotFoundError(f"Logo file not found at {logo_path}")
        logo = Image.open(logo_path).convert("RGBA")

        # Resize logo if dimensions are provided
        if resize_to:
            logo = logo.resize(resize_to)

        # Paste logo on image
        image.paste(logo, position, logo)
        print(f"Logo overlayed on image at position {position}.")
        return image
    except Exception as e:
        print(f"Error overlaying logo: {e}")
        raise RuntimeError(f"Failed to overlay logo: {e}")


def save_image_to_bytes(image: Image.Image):
    """
    Convert Pillow Image to bytes for sending via Flask response.

    Args:
        image (Image.Image): The image to convert.

    Returns:
        BytesIO: The image in bytes format.
    """
    try:
        img_bytes = io.BytesIO()
        image.save(img_bytes, format='PNG')
        img_bytes.seek(0)
        print("Image successfully converted to bytes.")
        return img_bytes
    except Exception as e:
        print(f"Error converting image to bytes: {e}")
        raise RuntimeError(f"Failed to convert image to bytes: {e}")
