# banner_generator/generate.py
import torch
from diffusers import StableDiffusionPipeline
from .config import MODEL_NAME

try:
    # 1. Check for CUDA
    device = "cuda" if torch.cuda.is_available() else "cpu"

    # 2. Load pipeline in half-precision if on GPU
    if device == "cuda":
        pipe = StableDiffusionPipeline.from_pretrained(
            MODEL_NAME,
            torch_dtype=torch.float16  # half precision on GPU
        )
    else:
        pipe = StableDiffusionPipeline.from_pretrained(
            MODEL_NAME,
            torch_dtype=torch.float32  # full precision on CPU
        )

    # 3. Move pipeline to device
    pipe.to(device)

    # (Optional) Enable xFormers memory-efficient attention if installed
    # if hasattr(pipe, "enable_xformers_memory_efficient_attention"):
    #     pipe.enable_xformers_memory_efficient_attention()

    print(f"Stable Diffusion model loaded on {device} (GPU: {torch.cuda.is_available()})")

except Exception as e:
    raise RuntimeError(f"Failed to load Stable Diffusion pipeline: {e}")

def generate_image_from_prompt(
    prompt: str,
    num_inference_steps: int = 100,
    guidance_scale: float = 7.5,
    width: int = 1200,
    height: int = 400
):
    """
    Generate a banner-like image from a text prompt using Stable Diffusion.
    """
    if not prompt or not isinstance(prompt, str):
        raise ValueError("Prompt must be a non-empty string.")

    # Confirm whether GPU is in use
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(
        f"Generating image on device={device} with prompt: '{prompt}', "
        f"steps={num_inference_steps}, guidance_scale={guidance_scale}, "
        f"resolution=({width}x{height})"
    )

    try:
        with torch.autocast(device, enabled=(device == "cuda")):
            result = pipe(
                prompt=prompt,
                num_inference_steps=num_inference_steps,
                guidance_scale=guidance_scale,
                width=width,
                height=height
            )
        image = result.images[0]
        print("Image generation successful.")
        return image

    except Exception as e:
        print(f"Error during image generation: {e}")
        raise RuntimeError(f"Image generation failed: {e}")
