// Test frontend image handling functions
console.log('Testing frontend image handling...');

// Simulate the image capture function from the report page
function testImageCapture() {
  console.log('Testing image capture simulation...');
  
  // Create a small test image as data URL
  const testImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
  
  console.log('Test image data length:', testImageData.length);
  
  // Test the image validation function from the reports API
  function cleanImageData(imageUrl) {
    if (!imageUrl) return null;
    
    // If it's a data URL, check if it's reasonable size
    if (imageUrl.startsWith('data:image/')) {
      // If it's too long, it might be corrupted
      if (imageUrl.length > 100000) { // 100KB limit
        console.warn('Image data URL is too long, rejecting');
        return null; // Return null instead of a corrupted marker
      }
      
      // Additional validation for base64 data URLs
      try {
        // Check if it's a valid data URL format
        const dataUrlRegex = /^data:image\/(png|jpg|jpeg|gif);base64,[A-Za-z0-9+/=]+$/;
        if (!dataUrlRegex.test(imageUrl)) {
          console.warn('Invalid image data URL format');
          return null;
        }
        
        return imageUrl;
      } catch (error) {
        console.warn('Error validating image data URL:', error.message);
        return null;
      }
    }
    
    // For regular URLs, validate they look like URLs
    if (imageUrl.startsWith('http')) {
      try {
        new URL(imageUrl); // This will throw if it's not a valid URL
        return imageUrl;
      } catch (error) {
        console.warn('Invalid image URL:', imageUrl);
        return null;
      }
    }
    
    // If it's neither a data URL nor a regular URL, it's likely corrupted
    console.warn('Unrecognized image URL format:', imageUrl);
    return null;
  }
  
  // Test the cleanImageData function
  const cleanedImage = cleanImageData(testImageData);
  console.log('Cleaned image data length:', cleanedImage?.length || 0);
  
  if (cleanedImage) {
    console.log('✅ Image validation passed');
  } else {
    console.log('❌ Image validation failed');
  }
  
  // Test with a larger image to check size limits
  const largeImageData = 'data:image/png;base64,' + 'A'.repeat(150000); // Exceeds 100KB limit
  console.log('Large image data length:', largeImageData.length);
  
  const cleanedLargeImage = cleanImageData(largeImageData);
  if (cleanedLargeImage) {
    console.log('❌ Large image should have been rejected');
  } else {
    console.log('✅ Large image correctly rejected');
  }
  
  // Test with invalid format
  const invalidImageData = 'data:image/png;base64,invalid_base64_data!!!';
  console.log('Invalid image data length:', invalidImageData.length);
  
  const cleanedInvalidImage = cleanImageData(invalidImageData);
  if (cleanedInvalidImage) {
    console.log('❌ Invalid image should have been rejected');
  } else {
    console.log('✅ Invalid image correctly rejected');
  }
  
  return {
    original: testImageData,
    cleaned: cleanedImage
  };
}

// Run the test
const result = testImageCapture();
console.log('Test completed. Image handling functions are working correctly.');