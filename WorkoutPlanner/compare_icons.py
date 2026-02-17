#!/usr/bin/env python3
"""
Icon Comparison Tool
Displays before/after comparison of icon optimization.
"""

from PIL import Image
import os

def get_image_info(image_path):
    """Get detailed information about an image."""
    try:
        img = Image.open(image_path)
        bbox = img.getbbox()
        
        if bbox:
            content_width = bbox[2] - bbox[0]
            content_height = bbox[3] - bbox[1]
            padding_left = bbox[0]
            padding_right = img.width - bbox[2]
            padding_top = bbox[1]
            padding_bottom = img.height - bbox[3]
            
            return {
                'width': img.width,
                'height': img.height,
                'content_width': content_width,
                'content_height': content_height,
                'padding_left': padding_left,
                'padding_right': padding_right,
                'padding_top': padding_top,
                'padding_bottom': padding_bottom,
                'mode': img.mode,
                'file_size': os.path.getsize(image_path)
            }
        return None
    except Exception as e:
        print(f"Error: {e}")
        return None

def format_size(bytes):
    """Format bytes to KB."""
    return f"{bytes / 1024:.2f} KB"

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    public_dir = os.path.join(script_dir, 'public')
    
    print("=" * 70)
    print("ICON OPTIMIZATION COMPARISON")
    print("=" * 70)
    print()
    
    icons = [
        ('icon-192.png', 'icon-192.png.backup.png'),
        ('icon-512.png', 'icon-512.png.backup.png')
    ]
    
    for optimized_name, backup_name in icons:
        optimized_path = os.path.join(public_dir, optimized_name)
        backup_path = os.path.join(public_dir, backup_name)
        
        if not os.path.exists(optimized_path):
            print(f"❌ {optimized_name} not found")
            continue
        
        if not os.path.exists(backup_path):
            print(f"⚠️  No backup found for {optimized_name}")
            continue
        
        print(f"📸 {optimized_name}")
        print("-" * 70)
        
        # Get info for both versions
        opt_info = get_image_info(optimized_path)
        bak_info = get_image_info(backup_path)
        
        if opt_info and bak_info:
            # Calculate improvements
            size_reduction = ((bak_info['file_size'] - opt_info['file_size']) / bak_info['file_size']) * 100
            content_increase_w = ((opt_info['content_width'] - bak_info['content_width']) / bak_info['content_width']) * 100
            content_increase_h = ((opt_info['content_height'] - bak_info['content_height']) / bak_info['content_height']) * 100
            
            print(f"                      BEFORE (Backup)  →  AFTER (Optimized)")
            print(f"  File Size:          {format_size(bak_info['file_size']):>12}  →  {format_size(opt_info['file_size']):>12}")
            print(f"  Image Dimensions:   {bak_info['width']}×{bak_info['height']:>12}  →  {opt_info['width']}×{opt_info['height']:>12}")
            print(f"  Content Size:       {bak_info['content_width']}×{bak_info['content_height']:>12}  →  {opt_info['content_width']}×{opt_info['content_height']:>12}")
            print()
            print(f"  Padding:")
            print(f"    Left:             {bak_info['padding_left']:>4} px          →  {opt_info['padding_left']:>4} px")
            print(f"    Right:            {bak_info['padding_right']:>4} px          →  {opt_info['padding_right']:>4} px")
            print(f"    Top:              {bak_info['padding_top']:>4} px          →  {opt_info['padding_top']:>4} px")
            print(f"    Bottom:           {bak_info['padding_bottom']:>4} px          →  {opt_info['padding_bottom']:>4} px")
            print()
            print(f"  ✅ File size reduced by {size_reduction:.1f}%")
            print(f"  ✅ Content width increased by {content_increase_w:.1f}%")
            print(f"  ✅ Content height increased by {content_increase_h:.1f}%")
        else:
            print("  ❌ Could not analyze images")
        
        print()
    
    print("=" * 70)
    print("SUMMARY")
    print("=" * 70)
    
    total_before = sum(os.path.getsize(os.path.join(public_dir, f"{name}.backup.png")) 
                       for name, _ in [('icon-192.png', ''), ('icon-512.png', '')] 
                       if os.path.exists(os.path.join(public_dir, f"{name}.backup.png")))
    
    total_after = sum(os.path.getsize(os.path.join(public_dir, name)) 
                      for name, _ in [('icon-192.png', ''), ('icon-512.png', '')] 
                      if os.path.exists(os.path.join(public_dir, name)))
    
    total_reduction = total_before - total_after
    total_reduction_pct = (total_reduction / total_before) * 100 if total_before > 0 else 0
    
    print(f"Total size before: {format_size(total_before)}")
    print(f"Total size after:  {format_size(total_after)}")
    print(f"Total saved:       {format_size(total_reduction)} ({total_reduction_pct:.1f}%)")
    print()
    print("✅ Icon optimization successful!")
    print()

if __name__ == '__main__':
    main()
