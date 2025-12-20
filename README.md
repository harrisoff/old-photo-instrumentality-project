# Old Photo EXIF Metadata Editor - MVP (Step 1)

## What's Implemented

This is the MVP (Step 1) implementation that allows you to:

- ✅ Upload a single JPEG file
- ✅ Manually input DateTimeOriginal (date and time)
- ✅ Manually input GPS coordinates (latitude and longitude)
- ✅ Write EXIF metadata using piexifjs (JavaScript library)
- ✅ Download the modified JPEG file with EXIF data

**Important:** This implementation uses **piexifjs** (a JavaScript EXIF library) to write EXIF metadata directly to the JPEG file without re-encoding or modifying the image pixels. The original file quality is preserved.

**Note about technology choice:** The requirements specified "exiftool WebAssembly", but no browser-ready exiftool WASM build is readily available via CDN. piexifjs provides equivalent functionality: it writes EXIF metadata directly to JPEG files without using Canvas or re-encoding the image data, which satisfies the core requirement of preserving image quality.

---

## How to Run

### Option 1: Simple HTTP Server (Recommended)

Since this is a pure front-end application that loads external scripts, you need to serve it via HTTP (not file://).

**Using Python 3:**
```bash
cd /Users/admin/Documents/personal/repo/old-photo-instrumentality-project
python3 -m http.server 8000
```

Then open your browser to: `http://localhost:8000`

**Using Node.js (if installed):**
```bash
npx http-server -p 8000
```

**Using PHP (if installed):**
```bash
php -S localhost:8000
```

### Option 2: Open in Browser with CORS Disabled (Not Recommended)

For testing only, you can disable CORS in your browser, but this is less secure.

---

## How to Use

1. **Upload a JPEG file**: Click "Choose File" and select a JPEG/JPG image
2. **Set capture date & time**: Enter when the photo was taken
3. **Set GPS coordinates**: Enter latitude and longitude in decimal degrees
   - Example (Beijing): Latitude: 39.9042, Longitude: 116.4074
   - Example (New York): Latitude: 40.7128, Longitude: -74.0060
   - Positive latitude = North, Negative = South
   - Positive longitude = East, Negative = West
4. **Click "Process & Download"**: The modified image will download automatically
5. **Verify the EXIF data** using the methods below

---

## How to Verify EXIF Data

### Method 1: macOS Preview (Quick)
1. Open the downloaded file in Preview
2. Go to **Tools → Show Inspector** (⌘I)
3. Click the **'i' tab** to see EXIF metadata
4. Look for:
   - Date/Time information
   - GPS coordinates

### Method 2: macOS Terminal (Quick)
```bash
mdls downloaded_file_exif.jpg | grep -i date
mdls downloaded_file_exif.jpg | grep -i gps
```

### Method 3: ExifTool Command Line (Most Detailed)

**Install ExifTool:**
```bash
brew install exiftool
```

**View all EXIF data:**
```bash
exiftool downloaded_file_exif.jpg
```

**View specific fields:**
```bash
exiftool -DateTimeOriginal -CreateDate -GPSLatitude -GPSLongitude downloaded_file_exif.jpg
```

### Method 4: Windows
1. Right-click the file → **Properties** → **Details** tab
2. Look for:
   - Date taken
   - Latitude and Longitude under GPS section

### Method 5: Online EXIF Viewers
Upload to any online EXIF viewer (be cautious with sensitive photos):
- https://exifdata.com/
- https://jimpl.com/

---

## Technical Details

### Technology Stack
- **HTML5** - Structure and file input
- **CSS3** - Modern, responsive UI
- **Vanilla JavaScript** - Logic and file handling
- **piexifjs** - EXIF metadata writing (loaded from CDN: https://cdn.jsdelivr.net/npm/piexifjs@1.0.6/piexif.min.js)

### EXIF Fields Written
- `DateTimeOriginal` - When the photo was taken
- `CreateDate` - Creation timestamp
- `ModifyDate` - Modification timestamp
- `GPSLatitude` - Latitude coordinate (absolute value)
- `GPSLatitudeRef` - N (North) or S (South)
- `GPSLongitude` - Longitude coordinate (absolute value)
- `GPSLongitudeRef` - E (East) or W (West)

### Date/Time Format
All timestamps are written in EXIF standard format: `YYYY:MM:DD HH:mm:SS`

### File Processing Flow
```
JPEG File
  ↓
Data URL (read file as base64)
  ↓
piexifjs (write EXIF metadata)
  ↓
Modified JPEG Blob
  ↓
Download (with _exif suffix)
```

### No Image Quality Loss
The implementation uses piexifjs which modifies only the EXIF metadata sections of the JPEG file. The actual image data (pixels) remains completely untouched - no Canvas re-encoding, no quality degradation. piexifjs works by parsing the JPEG structure and replacing only the EXIF segment.

---

## Troubleshooting

### "piexifjs not loaded" Error
- Make sure you're serving the page via HTTP (not opening index.html directly)
- Check your internet connection (piexifjs loads from CDN)
- Try refreshing the page
- Check browser console (F12) for network errors

### File Not Downloading
- Check browser popup blocker settings
- Make sure the file is a valid JPEG
- Check browser console for errors (F12)

### EXIF Data Not Showing
- Some photo viewers cache EXIF data - try a different viewer
- Use exiftool command line for definitive verification
- Ensure the downloaded file has the `_exif` suffix (it's the modified one)

---

## What's NOT in Step 1 (Coming Later)

- ❌ Multiple file upload (Step 2)
- ❌ Batch processing (Step 2)
- ❌ Progress indication (Step 2)
- ❌ Map-based location search (Step 3)
- ❌ ZIP download for multiple files (Step 4)

---

## Project Structure

```
old-photo-instrumentality-project/
├── index.html          # Main HTML structure
├── style.css          # Styling and responsive design
├── main.js            # JavaScript logic and exiftool integration
├── CURSOR_PROMPT.md   # Implementation instructions
├── requirements.md    # Project requirements
└── README.md          # This file
```

---

## Next Steps

After verifying that Step 1 works correctly:
1. Confirm EXIF data is written correctly
2. Confirm no image quality loss
3. Proceed to Step 2: Batch Processing

---

## License

This is a personal project for processing old scanned photos.

