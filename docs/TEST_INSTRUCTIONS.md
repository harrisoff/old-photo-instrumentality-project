# Quick Test Instructions

## Start the Server

Run this command in the project directory:

```bash
python3 -m http.server 8000
```

Then open: http://localhost:8000

## Test the MVP

1. **Get a test JPEG image** (any JPEG photo will work)
   - You can use any existing photo from your computer
   - Or download a sample JPEG from the internet

2. **Upload the image** using the file input

3. **Enter test metadata:**
   - Date: 2023-01-15 (or any date)
   - Time: 14:30:00 (or any time)
   - Latitude: 39.9042 (Beijing) or 40.7128 (New York)
   - Longitude: 116.4074 (Beijing) or -74.0060 (New York)

4. **Click "Process & Download"**
   - A file named `[original_name]_exif.jpg` should download

5. **Verify EXIF data:**

### Quick macOS Verification:
```bash
# Show date metadata
mdls [downloaded_file]_exif.jpg | grep -i date

# Show GPS metadata
mdls [downloaded_file]_exif.jpg | grep -i gps
```

### Detailed Verification with exiftool:
```bash
# Install if needed
brew install exiftool

# View all metadata
exiftool [downloaded_file]_exif.jpg

# Or view specific fields
exiftool -DateTimeOriginal -CreateDate -GPSLatitude -GPSLongitude [downloaded_file]_exif.jpg
```

## Expected Results

You should see:
- ✅ DateTimeOriginal: 2023:01:15 14:30:00
- ✅ CreateDate: 2023:01:15 14:30:00
- ✅ ModifyDate: 2023:01:15 14:30:00
- ✅ GPS Latitude: 39 deg 54' 15.12" N (or your entered value)
- ✅ GPS Longitude: 116 deg 24' 26.64" E (or your entered value)
- ✅ GPS Position: 39 deg 54' 15.12" N, 116 deg 24' 26.64" E

## Success Criteria

- [x] Image uploads successfully
- [x] All form fields accept input
- [x] Download triggers automatically
- [x] Downloaded file contains correct EXIF metadata
- [x] Original image pixels are unchanged (compare file sizes - should be nearly identical)
- [x] No console errors in browser (press F12 to check)

## Common Test Locations

| Location | Latitude | Longitude |
|----------|----------|-----------|
| Beijing | 39.9042 | 116.4074 |
| Shanghai | 31.2304 | 121.4737 |
| New York | 40.7128 | -74.0060 |
| London | 51.5074 | -0.1278 |
| Tokyo | 35.6762 | 139.6503 |
| Paris | 48.8566 | 2.3522 |
| Sydney | -33.8688 | 151.2093 |

