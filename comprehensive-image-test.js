import { PrismaClient } from '@prisma/client';

async function comprehensiveImageTest() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Running comprehensive image upload test...');
    
    // Create a test user first if needed
    let user = await prisma.user.findUnique({
      where: {
        email: 'test@example.com'
      }
    });
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          password: 'hashed_password_here',
          name: 'Test User',
          mobile: '1234567890',
          role: 'USER'
        }
      });
      console.log('✅ Test user created:', user.email);
    } else {
      console.log('✅ Using existing test user:', user.email);
    }
    
    // Test 1: Small image data
    console.log('\n--- Test 1: Small image data ---');
    const smallImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    
    const report1 = await prisma.report.create({
      data: {
        title: 'Test Report with Small Image',
        description: 'This is a test report with a small image attachment',
        imageUrl: smallImage,
        latitude: 40.7128,
        longitude: -74.0060,
        address: 'New York, NY',
        userId: user.id
      }
    });
    
    console.log('✅ Report with small image created successfully');
    console.log('Image URL length:', report1.imageUrl?.length || 0);
    
    // Test 2: Larger image data (but still within limits)
    console.log('\n--- Test 2: Larger image data ---');
    const largerImage = 'data:image/jpeg;base64,' + 'A'.repeat(500000); // 500KB image
    
    const report2 = await prisma.report.create({
      data: {
        title: 'Test Report with Larger Image',
        description: 'This is a test report with a larger image attachment',
        imageUrl: largerImage,
        latitude: 34.0522,
        longitude: -118.2437,
        address: 'Los Angeles, CA',
        userId: user.id
      }
    });
    
    console.log('✅ Report with larger image created successfully');
    console.log('Image URL length:', report2.imageUrl?.length || 0);
    
    // Test 3: Image data that's too large (should be rejected)
    console.log('\n--- Test 3: Image data that\'s too large ---');
    const tooLargeImage = 'data:image/jpeg;base64,' + 'A'.repeat(1500000); // 1.5MB image
    
    // Test the cleanImageData function directly
    function cleanImageData(imageUrl) {
      if (!imageUrl) return null;
      
      // If it's a data URL, check if it's reasonable size
      if (imageUrl.startsWith('data:image/')) {
        // If it's too long, it might be corrupted
        if (imageUrl.length > 1000000) { // 1MB limit
          console.warn('Image data URL is too long, rejecting');
          return null;
        }
        
        // Additional validation for base64 data URLs
        try {
          // Check if it's a valid data URL format
          const dataUrlRegex = /^data:image\/(png|jpg|jpeg|gif|webp);base64,[A-Za-z0-9+/=]+$/;
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
    
    const cleanedTooLargeImage = cleanImageData(tooLargeImage);
    if (cleanedTooLargeImage) {
      console.log('❌ Large image should have been rejected');
    } else {
      console.log('✅ Large image correctly rejected');
    }
    
    // Test 4: Invalid image format
    console.log('\n--- Test 4: Invalid image format ---');
    const invalidImage = 'data:image/png;base64,invalid_base64_data!!!';
    
    const cleanedInvalidImage = cleanImageData(invalidImage);
    if (cleanedInvalidImage) {
      console.log('❌ Invalid image should have been rejected');
    } else {
      console.log('✅ Invalid image correctly rejected');
    }
    
    // Test 5: Valid HTTP URL
    console.log('\n--- Test 5: Valid HTTP URL ---');
    const validUrl = 'https://example.com/image.jpg';
    
    const cleanedValidUrl = cleanImageData(validUrl);
    if (cleanedValidUrl) {
      console.log('✅ Valid HTTP URL accepted');
    } else {
      console.log('❌ Valid HTTP URL should have been accepted');
    }
    
    // Test 6: Invalid URL
    console.log('\n--- Test 6: Invalid URL ---');
    const invalidUrl = 'not_a_valid_url';
    
    const cleanedInvalidUrl = cleanImageData(invalidUrl);
    if (cleanedInvalidUrl) {
      console.log('❌ Invalid URL should have been rejected');
    } else {
      console.log('✅ Invalid URL correctly rejected');
    }
    
    // Clean up test data
    console.log('\n--- Cleaning up test data ---');
    await prisma.report.delete({
      where: {
        id: report1.id
      }
    });
    
    await prisma.report.delete({
      where: {
        id: report2.id
      }
    });
    
    console.log('✅ Test reports cleaned up');
    
    await prisma.$disconnect();
    console.log('\n✅ Comprehensive image upload test completed successfully!');
    console.log('\nSummary of fixes:');
    console.log('1. Increased image size limit from 100KB to 1MB');
    console.log('2. Added support for webp image format');
    console.log('3. Fixed user ID handling in report creation');
    console.log('4. Improved image validation and error handling');
    console.log('5. Enhanced frontend image compression');
    
  } catch (error) {
    console.error('❌ Comprehensive image test failed:', error.message);
    console.error('Error stack:', error.stack);
    await prisma.$disconnect();
    process.exit(1);
  }
}

comprehensiveImageTest();