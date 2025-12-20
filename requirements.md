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
- `DateTimeOriginal`
- `CreateDate`
- `ModifyDate`
- `GPSLatitude`
- `GPSLongitude`
- `GPSLatitudeRef`
- `GPSLongitudeRef`

Datetime format:

YYYY:MM:DD HH:mm:SS

---

## 3. Functional Requirements

### 3.1 Photo Import

- Support selecting multiple JPEG files
- Use File / Blob / ArrayBuffer APIs
- Support batch selection for processing

---

### 3.2 Time Input

Must support at least:
- Assigning the same datetime to all photos
- Incrementing datetime sequentially per photo

---

### 3.3 Batch Processing

- Allow selecting multiple photos from the imported list
- Support "Select All" functionality
- Process selected photos in batch with the same metadata
- Show progress indicator during batch processing

---

### 3.4 Location & GPS

- Use a map API (Baidu Maps preferred)
- Convert place names to GPS coordinates
- Correctly write EXIF GPS fields

GPS rules:
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
