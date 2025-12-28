# Scanned Photo EXIF Metadata Editor (Pure Front-End)

## 1. Project Goal

Build a pure front-end tool that allows users to add missing EXIF metadata
to scanned old photographs (JPEG files), including:

- Capture time
- Capture location (GPS coordinates)

All processing MUST occur in the browser.
The tool must output new JPEG files with EXIF metadata written.
Original files must never be modified.

---

## 2. Technology Choices (MANDATORY)

### 2.1 General Constraints

- Pure front-end only (HTML + JavaScript)
- No backend services
- No Node.js APIs
- No Canvas-based image redraw or re-encoding
- No image quality degradation

---

### 2.2 EXIF Writing (MANDATORY)

- EXIF writing MUST use **exiftool WebAssembly (WASM)**
- Metadata must be written as standard EXIF fields

Required EXIF fields:
- `DateTimeOriginal` (REQUIRED)
- `CreateDate` (REQUIRED)
- `ModifyDate` (REQUIRED)

Optional EXIF fields:
- `GPSLatitude` (OPTIONAL)
- `GPSLongitude` (OPTIONAL)
- `GPSLatitudeRef` (OPTIONAL)
- `GPSLongitudeRef` (OPTIONAL)

Datetime format:

YYYY:MM:DD HH:mm:SS

---

## 3. Functional Requirements

### 3.1 Photo Import

- Support selecting multiple JPEG files
- Use File / Blob / ArrayBuffer APIs

---

### 3.2 Time Input

**Time is REQUIRED** - users must provide time information for all photos.

Must support at least:
- Assigning the same datetime to all photos
- Incrementing datetime sequentially per photo

Default values:
- Date: `2000-01-01`
- Time: `12:00:00`

Partial time input:
- Allow users to input partial dates/times in any combination:
  - Year only (YYYY)
  - Year and month (YYYY-MM)
  - Date without time (YYYY-MM-DD)
  - Date with hour only (YYYY-MM-DD HH)
  - Date with hour and minute (YYYY-MM-DD HH:MM)
  - Any other partial combination of date and time components
- When time input is incomplete, auto-complete missing components with default values:
  - Missing month: use January (01)
  - Missing day: use 1st (01)
  - Missing hour: use 12 (12:00:00 PM)
  - Missing minute: use 00
  - Missing second: use 00
- EXIF specification requires complete datetime format: `YYYY:MM:DD HH:MM:SS`
- Auto-completion ensures EXIF compliance while allowing flexible user input

Time precision:
- EXIF specification allows setting time precision
- Provide a select field to choose time precision
- Options:
  - Year
  - Month
  - Date
- Default value: Date

---

### 3.3 Batch Processing

- Allow selecting multiple photos from the imported list
- Process all photos in batch with the same metadata
- Show progress indicator during batch processing

---

### 3.4 Location & GPS

**GPS coordinates are OPTIONAL** - users may choose to add location information or skip it.

- Use a map API (Baidu Maps preferred)
- Convert place names to GPS coordinates
- Correctly write EXIF GPS fields when provided

GPS Input:
- Single input field for GPS coordinates
- Format: `latitude,longitude` (comma-separated)
- Accept with or without space after comma (e.g., `39.9042,116.4074` or `39.9042, 116.4074`)
- Latitude range: -90 to 90 (negative for South, positive for North)
- Longitude range: -180 to 180 (negative for West, positive for East)

GPS Coordinate Lookup:
- Provide link to Baidu Maps Coordinate Picker: https://lbs.baidu.com/maptool/getpoint
- Users can search place names and get coordinates
- Display as a helpful tip on the page

GPS EXIF rules:
- Latitude: N / S
- Longitude: E / W
- Decimal degrees are acceptable for exiftool

---

## 4. EXIF Processing Flow (REQUIRED)

JPEG File
→ ArrayBuffer
→ exiftool.wasm
→ New JPEG Blob
→ Download

- Original files must remain untouched
- Pixel data must not change

---

## 5. Export

- Download all processed photos separately

---

## 6. Out of Scope

- PNG / TIFF support
- Video files
- Automatic time or location detection
