#!/usr/bin/env python3
"""
MUSTAZ CRAFT - Master HD Background Compositor (Option A)
Composites raw HD assets (BACKGROUND, CHAIN, TORN PAPER) into a seamless,
ultra-sharp, high-performance WebP canvas (1920x2800) optimized for brutalist e-commerce.
"""

import os
import sys
import numpy as np
from PIL import Image, ImageFilter, ImageEnhance

OUTPUT_WIDTH = 1920
OUTPUT_HEIGHT = 2800
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HD_DIR = os.path.join(BASE_DIR, "assets", "images", "hd")
OUT_FILE = os.path.join(BASE_DIR, "assets", "images", "bg_underground_chain_hd.webp")

def main():
    print("🎨 [1/6] Initializing Master Dark Canvas (1920x2800)...")
    # Base dark underground color #080808
    canvas = Image.new("RGBA", (OUTPUT_WIDTH, OUTPUT_HEIGHT), (8, 8, 8, 255))

    # 1. Base Grunge Texture from BACKGROUND/imgupscaler-enhanced.jpg
    bg_tex_path = os.path.join(HD_DIR, "BACKGROUND", "imgupscaler-enhanced.jpg")
    if os.path.exists(bg_tex_path):
        print("🧱 [2/6] Blending Enhanced Grunge Base Texture...")
        bg_tex = Image.open(bg_tex_path).convert("RGBA")
        # Scale to cover width and tile vertically
        bg_tex = bg_tex.resize((OUTPUT_WIDTH, int(OUTPUT_WIDTH * bg_tex.size[1] / bg_tex.size[0])), Image.Resampling.LANCZOS)
        
        # Tile texture vertically
        tex_h = bg_tex.size[1]
        for y in range(0, OUTPUT_HEIGHT, tex_h):
            tile = bg_tex.copy()
            # If flipping alternating tiles for seamless look
            if (y // tex_h) % 2 == 1:
                tile = tile.transpose(Image.FLIP_TOP_BOTTOM)
            
            # Lower opacity to 35% so it's a moody dark texture
            alpha_mask = Image.new("L", tile.size, int(255 * 0.35))
            canvas.paste(tile, (0, y), alpha_mask)

    # 2. Paper Grunge Overlay from TORN PAPER/7.png
    paper_path = os.path.join(HD_DIR, "TORN PAPER", "7.png")
    if os.path.exists(paper_path):
        print("📄 [3/6] Applying Streetwear Paper Texture Overlay...")
        paper = Image.open(paper_path).convert("RGBA")
        paper = paper.resize((OUTPUT_WIDTH, OUTPUT_HEIGHT), Image.Resampling.LANCZOS)
        # Apply at 22% opacity
        p_arr = np.array(paper)
        p_arr[:, :, 3] = (p_arr[:, :, 3].astype(float) * 0.22).astype(np.uint8)
        paper_soft = Image.fromarray(p_arr)
        canvas = Image.alpha_composite(canvas, paper_soft)

    # 3. Left Flank Heavy Chains: Chain Background (2).png
    chain_left_path = os.path.join(HD_DIR, "CHAIN", "Chain Background (2).png")
    if os.path.exists(chain_left_path):
        print("⛓️ [4/6] Placing High-Voltage Left Flank Chains...")
        c_left = Image.open(chain_left_path).convert("RGBA")
        # Resize to fit half width and full height
        target_w = int(OUTPUT_WIDTH * 0.65)
        c_left = c_left.resize((target_w, OUTPUT_HEIGHT), Image.Resampling.LANCZOS)
        
        # Feather alpha towards the right so center stays readable
        c_arr = np.array(c_left)
        x_indices = np.linspace(0, 1, target_w)
        # Fade mask: 1.0 on left edge, tapering to 0.0 at center
        fade = np.clip(1.3 - (x_indices * 1.5), 0.0, 1.0)
        c_arr[:, :, 3] = (c_arr[:, :, 3].astype(float) * fade[None, :] * 0.95).astype(np.uint8)
        
        c_left_faded = Image.fromarray(c_arr)
        # Paste on left edge (x = 0)
        canvas.paste(c_left_faded, (0, 0), c_left_faded)

    # 4. Right Flank Heavy Chains: Chain Background (4).png
    chain_right_path = os.path.join(HD_DIR, "CHAIN", "Chain Background (4).png")
    if os.path.exists(chain_right_path):
        print("⛓️ [5/6] Placing High-Voltage Right Flank Chains...")
        c_right = Image.open(chain_right_path).convert("RGBA")
        target_w = int(OUTPUT_WIDTH * 0.65)
        c_right = c_right.resize((target_w, OUTPUT_HEIGHT), Image.Resampling.LANCZOS)
        
        # Feather alpha towards the left
        c_arr = np.array(c_right)
        x_indices = np.linspace(0, 1, target_w)
        fade = np.clip(x_indices * 1.5 - 0.3, 0.0, 1.0)
        c_arr[:, :, 3] = (c_arr[:, :, 3].astype(float) * fade[None, :] * 0.95).astype(np.uint8)
        
        c_right_faded = Image.fromarray(c_arr)
        # Paste on right edge
        canvas.paste(c_right_faded, (OUTPUT_WIDTH - target_w, 0), c_right_faded)

    # 5. Seamless Vertical Tiling Feather (Top and Bottom 150px fade smoothly to base)
    print("✨ [6/6] Ensuring 100% Seamless Vertical Loop (No Seam Lines)...")
    c_final_arr = np.array(canvas)
    fade_len = 160
    
    # Smooth cosine blend for top and bottom transition
    y_fade = (1.0 - np.cos(np.linspace(0, np.pi, fade_len))) / 2.0  # 0 to 1
    
    # Blend top into bottom for perfect tiling
    top_strip = c_final_arr[:fade_len, :, :3].copy()
    bot_strip = c_final_arr[-fade_len:, :, :3].copy()
    
    for i in range(fade_len):
        w_top = y_fade[i]
        w_bot = 1.0 - w_top
        blended = (top_strip[i].astype(float) * w_top + bot_strip[i].astype(float) * w_bot).astype(np.uint8)
        c_final_arr[-fade_len + i, :, :3] = blended
    
    master_image = Image.fromarray(c_final_arr).convert("RGB")

    # Slight contrast enhance for metallic chains
    enhancer = ImageEnhance.Contrast(master_image)
    master_image = enhancer.enhance(1.08)

    # Save to WebP
    print(f"💾 Saving optimized Master WebP to: {OUT_FILE}...")
    master_image.save(OUT_FILE, "WEBP", quality=85, method=6)

    raw_size = os.path.getsize(OUT_FILE)
    print("==================================================")
    print(f"🎉 MASTER BACKGROUND GENERATED SUCCESSFULLY!")
    print(f"   Resolution : {OUTPUT_WIDTH}x{OUTPUT_HEIGHT} px")
    print(f"   Format     : WebP (Quality: 85%)")
    print(f"   File Size  : {raw_size // 1024} KB (from 58 MB raw assets!)")
    print("==================================================")

if __name__ == "__main__":
    main()
