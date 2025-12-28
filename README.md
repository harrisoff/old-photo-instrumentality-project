# Old Photo EXIF Metadata Editor

A pure front-end web tool for adding EXIF metadata (date, time, and GPS coordinates) to scanned old photographs. Process multiple JPEG files in your browser without uploading to any server. The tool preserves original image quality by modifying only the EXIF metadata segment.

## Features

- Upload and batch process multiple JPEG files
- Flexible date/time input with partial format support (auto-completes missing components)
- Time precision selector (Year/Month/Date)
- Optional GPS coordinate input
- Progress indicator for batch processing
- No image quality loss - only EXIF metadata is modified

## Quick Start

Serve the files via HTTP and open `src/index.html` in your browser:

```bash
python3 -m http.server 8000
# Then visit http://localhost:8000/src/
```

## How It Works

1. Upload one or more JPEG files
2. Enter capture date/time (required) - supports partial formats like `2000`, `2000-01`, `2000-01-01 12:00:00`
3. Optionally add GPS coordinates
4. Process and download files with EXIF metadata added

All processing happens in your browser using piexifjs. Original files are never modified - new files are downloaded with `_exif` suffix.
