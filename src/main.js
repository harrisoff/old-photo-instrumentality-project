/**
 * Old Photo EXIF Metadata Editor - Step 2 (Batch Processing)
 * 
 * This tool allows users to add EXIF metadata to scanned JPEG photos.
 * It uses piexifjs to write EXIF data without re-encoding the image.
 * 
 * Step 2 Features:
 * - Multiple file upload
 * - Process all uploaded photos in batch
 * - Progress indicator during batch processing
 * - Individual download for each processed photo
 * 
 * Note: Originally planned to use exiftool.wasm, but no browser-ready
 * WASM build is readily available. piexifjs provides the same functionality:
 * - Writes EXIF metadata directly to JPEG
 * - No Canvas re-encoding
 * - No pixel data modification
 * - Pure JavaScript, works in browser
 */

// Global state
let uploadedFiles = []; // Array to store all uploaded files

// DOM Elements
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const photoListContainer = document.getElementById('photoListContainer');
const photoList = document.getElementById('photoList');
const photoCount = document.getElementById('photoCount');
const datetimeInput = document.getElementById('datetimeInput');
const timePrecisionSelect = document.getElementById('timePrecisionSelect');
const gpsInput = document.getElementById('gpsInput');
const processBtn = document.getElementById('processBtn');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
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
 * Handle file selection - now supports multiple files
 */
fileInput.addEventListener('change', (event) => {
    const files = Array.from(event.target.files);
    
    if (files.length === 0) {
        uploadedFiles = [];
        photoListContainer.style.display = 'none';
        fileInfo.textContent = '';
        processBtn.disabled = true;
        return;
    }
    
    // Filter only JPEG files
    const jpegFiles = files.filter(file => file.type.match('image/jpeg'));
    
    if (jpegFiles.length === 0) {
        fileInfo.textContent = 'Error: Please select JPEG files only';
        fileInfo.style.color = 'red';
        uploadedFiles = [];
        photoListContainer.style.display = 'none';
        processBtn.disabled = true;
        return;
    }
    
    // Store uploaded files
    uploadedFiles = jpegFiles;
    
    // Show file info
    const totalSize = jpegFiles.reduce((sum, file) => sum + file.size, 0);
    fileInfo.textContent = `Uploaded: ${jpegFiles.length} file(s) (${formatFileSize(totalSize)})`;
    fileInfo.style.color = 'green';
    
    // Display photo list
    displayPhotoList();
    
    // Enable process button
    processBtn.disabled = false;
});

/**
 * Display photo list (no checkboxes, just list all files)
 */
function displayPhotoList() {
    photoList.innerHTML = '';
    
    uploadedFiles.forEach((file, index) => {
        const photoItem = document.createElement('div');
        photoItem.className = 'photo-item';
        
        const fileName = document.createElement('span');
        fileName.className = 'photo-name';
        fileName.textContent = `${index + 1}. ${file.name}`;
        
        const fileSize = document.createElement('span');
        fileSize.className = 'photo-size';
        fileSize.textContent = formatFileSize(file.size);
        
        photoItem.appendChild(fileName);
        photoItem.appendChild(fileSize);
        
        photoList.appendChild(photoItem);
    });
    
    photoListContainer.style.display = 'block';
    photoCount.textContent = `${uploadedFiles.length} file(s)`;
}

/**
 * Format file size for display
 */
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

/**
 * Process all uploaded images and add EXIF metadata (Batch Processing)
 */
processBtn.addEventListener('click', async () => {
    if (uploadedFiles.length === 0) {
        updateStatus('Please upload files first', 'error');
        return;
    }
    
    if (typeof piexif === 'undefined') {
        updateStatus('piexifjs library not loaded. Please refresh the page.', 'error');
        return;
    }
    
    // Validate inputs - time is required
    if (!datetimeInput.value || !datetimeInput.value.trim()) {
        updateStatus('Please enter date and time (required)', 'error');
        return;
    }
    
    // Parse and validate datetime input
    const parsedDateTime = parseAndCompleteDateTime(datetimeInput.value);
    if (!parsedDateTime) {
        updateStatus('Invalid date/time format. Examples: 2000, 2000-01, 2000-01-01, 2000-01-01 12:00:00', 'error');
        return;
    }
    
    // GPS is optional - only validate if provided
    let gpsCoords = null;
    if (gpsInput.value && gpsInput.value.trim()) {
        gpsCoords = parseGPSInput(gpsInput.value);
        if (!gpsCoords) {
            updateStatus('Invalid GPS format. Use: latitude, longitude (e.g., 39.9042, 116.4074)', 'error');
            return;
        }
    }
    
    try {
        processBtn.disabled = true;
        progressContainer.style.display = 'block';
        
        const totalFiles = uploadedFiles.length;
        let processedCount = 0;
        let successCount = 0;
        let errorCount = 0;
        
        updateStatus(`Processing ${totalFiles} file(s)...`, 'processing');
        
        // Prepare EXIF metadata once (same for all photos)
        const metadata = prepareMetadata(parsedDateTime, gpsCoords);
        console.log('Metadata to write:', metadata);
        
        // Process each file sequentially
        for (let i = 0; i < uploadedFiles.length; i++) {
            const file = uploadedFiles[i];
            
            try {
                // Update progress
                updateProgress(processedCount, totalFiles, `Processing: ${file.name}`);
                
                // Read file as Data URL
                const dataUrl = await readFileAsDataURL(file);
                
                // Write metadata using piexifjs
                const modifiedDataUrl = writeExifData(dataUrl, metadata);
                
                // Download the modified image
                downloadModifiedImage(modifiedDataUrl, file.name);
                
                successCount++;
                
                // Small delay between downloads to avoid browser blocking
                if (i < uploadedFiles.length - 1) {
                    await sleep(100);
                }
                
            } catch (error) {
                console.error(`Error processing ${file.name}:`, error);
                errorCount++;
            }
            
            processedCount++;
        }
        
        // Update final progress
        updateProgress(totalFiles, totalFiles, 'Complete!');
        
        // Show final status
        if (errorCount === 0) {
            updateStatus(
                `Success! All ${successCount} file(s) processed and downloaded. Check the verification instructions below.`,
                'success'
            );
        } else {
            updateStatus(
                `Completed with ${successCount} success and ${errorCount} error(s). Check console for details.`,
                'error'
            );
        }
        
        // Hide progress bar after a delay
        setTimeout(() => {
            progressContainer.style.display = 'none';
        }, 3000);
        
    } catch (error) {
        updateStatus('Error: ' + error.message, 'error');
        console.error('Processing error:', error);
        progressContainer.style.display = 'none';
    } finally {
        processBtn.disabled = false;
    }
});

/**
 * Update progress bar and text
 */
function updateProgress(current, total, message) {
    const percentage = (current / total) * 100;
    progressBar.style.width = percentage + '%';
    progressText.textContent = `${message} (${current}/${total})`;
}

/**
 * Sleep utility for adding delays
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Parse GPS input in format "latitude, longitude" or "latitude,longitude"
 * Returns {latitude, longitude} or null if invalid
 */
function parseGPSInput(input) {
    if (!input || !input.trim()) {
        return null;
    }
    
    // Split by comma
    const parts = input.split(',').map(p => p.trim());
    
    if (parts.length !== 2) {
        return null;
    }
    
    const latitude = parseFloat(parts[0]);
    const longitude = parseFloat(parts[1]);
    
    // Validate ranges
    if (isNaN(latitude) || isNaN(longitude)) {
        return null;
    }
    
    if (latitude < -90 || latitude > 90) {
        return null;
    }
    
    if (longitude < -180 || longitude > 180) {
        return null;
    }
    
    return { latitude, longitude };
}

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
 * Parse and auto-complete partial datetime input
 * Supports: YYYY, YYYY-MM, YYYY-MM-DD, YYYY-MM-DD HH, YYYY-MM-DD HH:MM, YYYY-MM-DD HH:MM:SS
 * Returns completed datetime string in format YYYY-MM-DD HH:MM:SS or null if invalid
 */
function parseAndCompleteDateTime(input) {
    if (!input || !input.trim()) {
        return null;
    }
    
    const trimmed = input.trim();
    
    // Default values for auto-completion
    const defaults = {
        month: '01',
        day: '01',
        hour: '12',
        minute: '00',
        second: '00'
    };
    
    // Try to parse different formats
    // Pattern 1: YYYY-MM-DD HH:MM:SS (complete)
    let match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/);
    if (match) {
        return `${match[1]}-${match[2]}-${match[3]} ${match[4]}:${match[5]}:${match[6]}`;
    }
    
    // Pattern 2: YYYY-MM-DD HH:MM
    match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})$/);
    if (match) {
        return `${match[1]}-${match[2]}-${match[3]} ${match[4]}:${match[5]}:${defaults.second}`;
    }
    
    // Pattern 3: YYYY-MM-DD HH
    match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2})$/);
    if (match) {
        return `${match[1]}-${match[2]}-${match[3]} ${match[4]}:${defaults.minute}:${defaults.second}`;
    }
    
    // Pattern 4: YYYY-MM-DD (date only)
    match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
        return `${match[1]}-${match[2]}-${match[3]} ${defaults.hour}:${defaults.minute}:${defaults.second}`;
    }
    
    // Pattern 5: YYYY-MM
    match = trimmed.match(/^(\d{4})-(\d{2})$/);
    if (match) {
        return `${match[1]}-${match[2]}-${defaults.day} ${defaults.hour}:${defaults.minute}:${defaults.second}`;
    }
    
    // Pattern 6: YYYY (year only)
    match = trimmed.match(/^(\d{4})$/);
    if (match) {
        return `${match[1]}-${defaults.month}-${defaults.day} ${defaults.hour}:${defaults.minute}:${defaults.second}`;
    }
    
    return null;
}

/**
 * Prepare EXIF metadata from user inputs
 * Format: YYYY:MM:DD HH:mm:SS for datetime
 */
function prepareMetadata(parsedDateTime, gpsCoords) {
    // Convert to EXIF format (YYYY:MM:DD HH:mm:SS)
    const exifDateTime = parsedDateTime.replace(/-/g, ':');
    
    const metadata = {
        datetime: exifDateTime,
        timePrecision: timePrecisionSelect.value
    };
    
    // GPS is optional - only include if provided
    if (gpsCoords) {
        const latitude = gpsCoords.latitude;
        const longitude = gpsCoords.longitude;
        
        // Determine GPS reference (N/S for latitude, E/W for longitude)
        const latRef = latitude >= 0 ? 'N' : 'S';
        const lonRef = longitude >= 0 ? 'E' : 'W';
        
        // Use absolute values and convert to degrees, minutes, seconds format
        const absLat = Math.abs(latitude);
        const absLon = Math.abs(longitude);
        
        // Convert decimal degrees to degrees, minutes, seconds
        const latDMS = decimalToDMS(absLat);
        const lonDMS = decimalToDMS(absLon);
        
        metadata.latitude = latDMS;
        metadata.latitudeRef = latRef;
        metadata.longitude = lonDMS;
        metadata.longitudeRef = lonRef;
    }
    
    return metadata;
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
        
        // Write time precision if supported (EXIF SubSecTimeOriginal can be used for precision)
        // Note: piexifjs may have limited support for precision fields, but we store the precision value
        // The actual EXIF precision implementation depends on exiftool.wasm capabilities
        
        // Write GPS fields (only if provided)
        if (metadata.latitude !== undefined && metadata.longitude !== undefined) {
            exifObj['GPS'][piexif.GPSIFD.GPSLatitudeRef] = metadata.latitudeRef;
            exifObj['GPS'][piexif.GPSIFD.GPSLatitude] = metadata.latitude;
            exifObj['GPS'][piexif.GPSIFD.GPSLongitudeRef] = metadata.longitudeRef;
            exifObj['GPS'][piexif.GPSIFD.GPSLongitude] = metadata.longitude;
        }
        
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
