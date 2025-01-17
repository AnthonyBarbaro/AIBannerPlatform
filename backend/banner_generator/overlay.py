# banner_generator/overlay.py
from PIL import Image, ImageDraw, ImageFont
import io
import os

def draw_shape_on_image(
    image,
    shape_type="rectangle",
    position=(300, 100),
    size=(200, 100),
    color=(0, 255, 0)
):
    """
    Draws a shape (rectangle or circle) onto the image for highlighting areas.
    """
    draw = ImageDraw.Draw(image)
    if shape_type == "rectangle":
        x, y = position
        w, h = size
        draw.rectangle([x, y, x + w, y + h], outline=color, width=3)
    elif shape_type == "circle":
        x, y = position
        r = size[0]  # Assuming [radius, *ignored*]
        draw.ellipse([x - r, y - r, x + r, y + r], outline=color, width=3)
    return image
def get_font_path(default_font="arial.ttf"):
    """
    Resolve the font file path dynamically.
    Prioritize the bundled fonts directory, fallback to system fonts if necessary.
    """
    # Bundled font location
    bundled_font_path = os.path.abspath(os.path.join(
        "backend", "banner_generator", "static", "fonts", default_font
    ))

    # Check if bundled font exists
    if os.path.exists(bundled_font_path):
        return bundled_font_path

    # Check system font paths
    if os.name == "nt":  # Windows
        system_font_path = r"C:\Windows\Fonts\arial.ttf"
    elif os.name == "posix":  # Linux/MacOS
        system_font_path = "/usr/share/fonts/truetype/msttcorefonts/arial.ttf"
    else:
        system_font_path = None

    if system_font_path and os.path.exists(system_font_path):
        return system_font_path

    # Raise an error if no font is found
    raise FileNotFoundError(f"Font file '{default_font}' not found in bundled or system locations.")

def overlay_text_on_image(
    image,
    text="Sale 50% OFF!",
    position=(50, 50),
    font_size=42,
    text_color=(255, 0, 0),
    text_bold=False,
    text_outline_color=(0, 0, 0),
    text_outline_width=2
):
    """
    Overlay text on the image with optional bold and outline.

    Args:
        image (PIL.Image.Image): The base image.
        text (str): Text to overlay.
        position (tuple): (x, y) position for the text.
        font_size (int): Text size.
        text_color (tuple): Fill color for the text.
        text_bold (bool): Use bold font if True.
        text_outline_color (tuple): Outline color for the text.
        text_outline_width (int): Outline thickness.

    Returns:
        PIL.Image.Image: Modified image with overlay text.
    """
    try:
        draw = ImageDraw.Draw(image)

        # Resolve font path
        font_name = "arialbd.ttf" if text_bold else "arial.ttf"
        font_path = get_font_path(default_font=font_name)

        # Debugging: Print resolved font path
        print(f"Resolved font path: {font_path}")

        # Load font
        font = ImageFont.truetype(font_path, font_size)

        # Draw text with outline
        draw.text(
            position,
            text,
            font=font,
            fill=text_color,
            stroke_width=text_outline_width,
            stroke_fill=text_outline_color
        )
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
