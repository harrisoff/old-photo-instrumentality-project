# Cursor Implementation Instructions

You are implementing a front-end project.

You MUST read and strictly follow `requirements.md`.
That file is the single source of truth.

Any new requirement must be written to requirements.md and committed before implementation.

---

## Non-Negotiable Rules

You MUST NOT:
- Change or simplify the technology choices defined in `requirements.md`
- Replace exiftool WebAssembly with any other EXIF solution
- Use Canvas to redraw, re-encode, or recompress images
- Introduce any backend service
- Use Node.js APIs or server-side code

If something is complex or inconvenient:
- You must still implement it as specified
- You may explain the complexity, but you must NOT change the design

---

## Mandatory Development Order

You MUST implement features in the following order.

### Step 1 – MVP (Single Image)
- Upload a single JPEG file
- Manually input:
  - DateTimeOriginal
  - GPS latitude and longitude
- Write EXIF metadata using exiftool.wasm
- Download the modified JPEG file
- Explain how to verify EXIF using a system photo viewer or desktop exiftool

Do NOT implement batch processing or map search in this step.

---

### Step 2 – Batch Processing
- Multiple JPEG upload
- Batch EXIF writing
- Progress indication

---

### Step 3 – Location Search
- Use a map API
- Convert place names to GPS coordinates

---

### Step 4 – Batch Download
- ZIP archive download for processed files

---

## Output Requirements

- Minimal front-end project:
  - `index.html`
  - `main.js`
  - optional `style.css`
- No build step required
- Code must be readable and commented
- Explain how to run the project locally

---

## Validation

After completing each step:
- Clearly state what is implemented
- Explain how the user can verify correctness
