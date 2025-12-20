/**
 * Old Photo EXIF Metadata Editor - MVP (Step 1)
 * 
 * This tool allows users to add EXIF metadata to scanned JPEG photos.
 * It uses piexifjs to write EXIF data without re-encoding the image.
 * 
 * Note: Originally planned to use exiftool.wasm, but no browser-ready
 * WASM build is readily available. piexifjs provides the same functionality:
 * - Writes EXIF metadata directly to JPEG
 * - No Canvas re-encoding
 * - No pixel data modification
 * - Pure JavaScript, works in browser
 */

// Global state
let selectedFile = null;

// DOM Elements
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const dateInput = document.getElementById('dateInput');
const timeInput = document.getElementById('timeInput');
const latitudeInput = document.getElementById('latitudeInput');
const longitudeInput = document.getElementById('longitudeInput');
const processBtn = document.getElementById('processBtn');
const statusBox = document.getElementById('status');

/**
 * Check if piexifjs is loaded
 */
window.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded, checking piexifjs...');
    
    if (typeof piexif === 'undefined') {
        updateStatus('Error: piexifjs library not loaded. Check internet connection.', 'error');
        console.error('piexifjs not found');
    } else {
        updateStatus('Ready to process images!', 'success');
        console.log('piexifjs loaded successfully');
    }
});

/**
 * Handle file selection
 */
fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    
    if (!file) {
        selectedFile = null;
        fileInfo.textContent = '';
        processBtn.disabled = true;
        return;
    }
    
    // Validate JPEG file
    if (!file.type.match('image/jpeg')) {
        fileInfo.textContent = 'Error: Please select a JPEG file';
        fileInfo.style.color = 'red';
        selectedFile = null;
        processBtn.disabled = true;
        return;
    }
    
    selectedFile = file;
    fileInfo.textContent = `Selected: ${file.name} (${formatFileSize(file.size)})`;
    fileInfo.style.color = 'green';
    
    // Enable process button if file is selected
    processBtn.disabled = false;
    
    // Set default date/time to current if empty
    if (!dateInput.value) {
        const now = new Date();
        dateInput.value = now.toISOString().split('T')[0];
        timeInput.value = now.toTimeString().split(' ')[0];
    }
});

/**
 * Format file size for display
 */
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

/**
 * Process the image and add EXIF metadata
 */
processBtn.addEventListener('click', async () => {
    if (!selectedFile) {
        updateStatus('Please select a file first', 'error');
        return;
    }
    
    if (typeof piexif === 'undefined') {
        updateStatus('piexifjs library not loaded. Please refresh the page.', 'error');
        return;
    }
    
    // Validate inputs
    if (!dateInput.value || !timeInput.value) {
        updateStatus('Please enter date and time', 'error');
        return;
    }
    
    if (!latitudeInput.value || !longitudeInput.value) {
        updateStatus('Please enter GPS coordinates', 'error');
        return;
    }
    
    try {
        processBtn.disabled = true;
        updateStatus('Processing image...', 'processing');
        
        // Read file as Data URL
        const dataUrl = await readFileAsDataURL(selectedFile);
        
        // Prepare EXIF metadata
        const metadata = prepareMetadata();
        console.log('Metadata to write:', metadata);
        
        // Write metadata using piexifjs
        updateStatus('Writing EXIF metadata...', 'processing');
        const modifiedDataUrl = writeExifData(dataUrl, metadata);
        
        // Download the modified image
        updateStatus('Creating download...', 'processing');
        downloadModifiedImage(modifiedDataUrl, selectedFile.name);
        
        updateStatus('Success! Image processed and downloaded. Check the verification instructions below.', 'success');
        
    } catch (error) {
        updateStatus('Error: ' + error.message, 'error');
        console.error('Processing error:', error);
    } finally {
        processBtn.disabled = false;
    }
});

/**
 * Read file as Data URL
 */
function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}

/**
 * Prepare EXIF metadata from user inputs
 * Format: YYYY:MM:DD HH:mm:SS for datetime
 */
function prepareMetadata() {
    // Convert date and time to EXIF format (YYYY:MM:DD HH:mm:SS)
    const date = dateInput.value; // YYYY-MM-DD
    const time = timeInput.value; // HH:mm:ss
    const exifDateTime = date.replace(/-/g, ':') + ' ' + time;
    
    // Parse GPS coordinates
    const latitude = parseFloat(latitudeInput.value);
    const longitude = parseFloat(longitudeInput.value);
    
    // Determine GPS reference (N/S for latitude, E/W for longitude)
    const latRef = latitude >= 0 ? 'N' : 'S';
    const lonRef = longitude >= 0 ? 'E' : 'W';
    
    // Use absolute values and convert to degrees, minutes, seconds format
    const absLat = Math.abs(latitude);
    const absLon = Math.abs(longitude);
    
    // Convert decimal degrees to degrees, minutes, seconds
    const latDMS = decimalToDMS(absLat);
    const lonDMS = decimalToDMS(absLon);
    
    return {
        datetime: exifDateTime,
        latitude: latDMS,
        latitudeRef: latRef,
        longitude: lonDMS,
        longitudeRef: lonRef
    };
}

/**
 * Convert decimal degrees to DMS (Degrees, Minutes, Seconds) format for EXIF
 * Returns format required by piexif: [[degrees, 1], [minutes, 1], [seconds, precision]]
 */
function decimalToDMS(decimal) {
    const degrees = Math.floor(decimal);
    const minutesDecimal = (decimal - degrees) * 60;
    const minutes = Math.floor(minutesDecimal);
    const seconds = (minutesDecimal - minutes) * 60;
    
    // EXIF format: [[degrees, 1], [minutes, 1], [seconds * 100, 100]]
    // This preserves precision for seconds
    return [
        [degrees, 1],
        [minutes, 1],
        [Math.round(seconds * 100), 100]
    ];
}

/**
 * Write EXIF data using piexifjs
 * 
 * piexifjs works with Data URLs (base64 encoded images)
 * It modifies only the EXIF segment, not the image data
 */
function writeExifData(dataUrl, metadata) {
    try {
        // Load existing EXIF data (if any)
        let exifObj;
        try {
            exifObj = piexif.load(dataUrl);
        } catch (e) {
            // No existing EXIF or corrupted, create new
            console.log('No existing EXIF, creating new');
            exifObj = { "0th": {}, "Exif": {}, "GPS": {}, "Interop": {}, "1st": {}, "thumbnail": null };
        }
        
        // Write datetime fields (in Exif IFD)
        exifObj['Exif'][piexif.ExifIFD.DateTimeOriginal] = metadata.datetime;
        exifObj['Exif'][piexif.ExifIFD.DateTimeDigitized] = metadata.datetime;
        
        // Write datetime in 0th IFD as well (ModifyDate)
        exifObj['0th'][piexif.ImageIFD.DateTime] = metadata.datetime;
        
        // Write GPS fields
        exifObj['GPS'][piexif.GPSIFD.GPSLatitudeRef] = metadata.latitudeRef;
        exifObj['GPS'][piexif.GPSIFD.GPSLatitude] = metadata.latitude;
        exifObj['GPS'][piexif.GPSIFD.GPSLongitudeRef] = metadata.longitudeRef;
        exifObj['GPS'][piexif.GPSIFD.GPSLongitude] = metadata.longitude;
        
        // Convert EXIF object to bytes
        const exifBytes = piexif.dump(exifObj);
        
        // Insert EXIF bytes into image
        const modifiedDataUrl = piexif.insert(exifBytes, dataUrl);
        
        console.log('EXIF data written successfully');
        return modifiedDataUrl;
        
    } catch (error) {
        console.error('piexifjs error:', error);
        throw new Error('Failed to write EXIF data: ' + error.message);
    }
}

/**
 * Download the modified image
 */
function downloadModifiedImage(dataUrl, originalFileName) {
    // Create download link
    const a = document.createElement('a');
    a.href = dataUrl;
    
    // Generate output filename (add '_exif' suffix)
    const nameWithoutExt = originalFileName.replace(/\.[^/.]+$/, '');
    const extension = originalFileName.match(/\.[^/.]+$/)?.[0] || '.jpg';
    a.download = `${nameWithoutExt}_exif${extension}`;
    
    // Trigger download
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    document.body.removeChild(a);
    
    console.log('Download triggered:', a.download);
}

/**
 * Update status message
 */
function updateStatus(message, type = '') {
    statusBox.textContent = message;
    statusBox.className = 'status-box';
    
    if (type) {
        statusBox.classList.add(type);
    }
}
