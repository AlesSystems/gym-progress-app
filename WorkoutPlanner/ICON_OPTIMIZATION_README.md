# Icon Optimization Script

This script automatically optimizes app icons by removing excessive whitespace and applying optimal padding.

## Purpose

Fixes the logo display issue where app icons have too much whitespace, making the logo appear smaller than intended.

## Requirements

```bash
pip install Pillow
```

## Usage

```bash
cd WorkoutPlanner
python optimize_icons.py
```

## What It Does

1. **Detects Content**: Identifies the actual logo content in the icon
2. **Removes Whitespace**: Crops away excess transparent/white space
3. **Adds Padding**: Applies optimal padding (8px for 192px, 16px for 512px)
4. **Resizes**: Ensures exact dimensions (192×192, 512×512)
5. **Optimizes**: Compresses PNG for smaller file sizes
6. **Backs Up**: Creates .backup.png files before modifying

## Output

```
Icon Optimization Script
==================================================
  Backup created: public/icon-192.png.backup.png
✓ Optimized: public/icon-192.png
  Backup created: public/icon-512.png.backup.png
✓ Optimized: public/icon-512.png
==================================================
Optimized 2/2 icons

✓ Icons optimized successfully!
  Original files backed up with .backup extension
  Test the PWA to verify logo appearance
```

## Files Processed

- `public/icon-192.png` - 192×192 icon for standard displays
- `public/icon-512.png` - 512×512 icon for high-res displays

## Backup Files

Original files are automatically backed up as:
- `public/icon-192.png.backup.png`
- `public/icon-512.png.backup.png`

## Configuration

Edit the `icons` list in `main()` to adjust:
- Input/output filenames
- Padding amounts per icon size

```python
icons = [
    ('icon-192.png', 'icon-192.png', 8),   # 8px padding
    ('icon-512.png', 'icon-512.png', 16),  # 16px padding
]
```

## Rollback

To restore original icons:

```bash
cd public
mv icon-192.png.backup.png icon-192.png
mv icon-512.png.backup.png icon-512.png
```

## When to Run

- After updating logo design
- When icons appear too small
- When excessive whitespace is visible
- Before deploying PWA updates

## Technical Details

- Uses PIL/Pillow for image processing
- Preserves transparency (RGBA mode)
- Maintains aspect ratio
- Uses LANCZOS resampling for high quality
- Applies PNG optimization

## Troubleshooting

### "ModuleNotFoundError: No module named 'PIL'"

Install Pillow:
```bash
pip install Pillow
```

### "Could not find content in image"

The icon file may be completely transparent or corrupted. Check the source file.

### "Permission denied"

Ensure icon files are not open in another program. Close image editors and retry.

## Related Files

- `summary/logo-display-fix-summary.md` - Implementation details
- `summary/logo-verification-guide.md` - Testing procedures
- `plan/05-logo-display-fix.md` - Original requirements
