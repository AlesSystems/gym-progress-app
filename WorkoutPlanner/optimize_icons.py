#!/usr/bin/env python3
"""
Icon Optimization Script
Removes excess whitespace from app icons and optimizes them for PWA usage.
"""

from PIL import Image, ImageChops
import os

def trim_whitespace(image_path, output_path, padding=10):
    """
    Trim whitespace from an image and add consistent padding.
    
    Args:
        image_path: Path to input image
        output_path: Path to save optimized image
        padding: Pixels of padding to add around trimmed content
    """
    try:
        img = Image.open(image_path)
        
        # Convert to RGBA if not already
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
        
        # Get the bounding box of non-transparent pixels
        bbox = img.getbbox()
        
        if bbox:
            # Crop to content
            img_cropped = img.crop(bbox)
            
            # Calculate new size with padding
            width, height = img_cropped.size
            new_size = max(width, height) + (padding * 2)
            
            # Create new image with transparent background
            new_img = Image.new('RGBA', (new_size, new_size), (0, 0, 0, 0))
            
            # Calculate position to center the cropped image
            x_offset = (new_size - width) // 2
            y_offset = (new_size - height) // 2
            
            # Paste cropped image onto new image
            new_img.paste(img_cropped, (x_offset, y_offset))
            
            # Get target size from filename
            if '192' in os.path.basename(output_path):
                target_size = (192, 192)
            elif '512' in os.path.basename(output_path):
                target_size = (512, 512)
            else:
                target_size = (new_size, new_size)
            
            # Resize to target dimensions
            new_img = new_img.resize(target_size, Image.Resampling.LANCZOS)
            
            # Save optimized image
            new_img.save(output_path, 'PNG', optimize=True)
            print(f"✓ Optimized: {output_path}")
            return True
        else:
            print(f"✗ Could not find content in: {image_path}")
            return False
            
    except Exception as e:
        print(f"✗ Error processing {image_path}: {e}")
        return False

def main():
    """Process all icon files."""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    public_dir = os.path.join(script_dir, 'public')
    
    icons = [
        ('icon-192.png', 'icon-192.png', 8),
        ('icon-512.png', 'icon-512.png', 16),
    ]
    
    print("Icon Optimization Script")
    print("=" * 50)
    
    success_count = 0
    for input_name, output_name, padding in icons:
        input_path = os.path.join(public_dir, input_name)
        output_path = os.path.join(public_dir, output_name)
        
        if os.path.exists(input_path):
            # Backup original
            backup_path = os.path.join(public_dir, f"{input_name}.backup.png")
            if not os.path.exists(backup_path):
                Image.open(input_path).save(backup_path, 'PNG')
                print(f"  Backup created: {backup_path}")
            
            if trim_whitespace(input_path, output_path, padding):
                success_count += 1
        else:
            print(f"✗ File not found: {input_path}")
    
    print("=" * 50)
    print(f"Optimized {success_count}/{len(icons)} icons")
    
    if success_count > 0:
        print("\n✓ Icons optimized successfully!")
        print("  Original files backed up with .backup extension")
        print("  Test the PWA to verify logo appearance")
    else:
        print("\n✗ No icons were optimized")

if __name__ == '__main__':
    main()
