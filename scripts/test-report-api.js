import { PrismaClient } from '@prisma/client';

async function testReportAPI() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Testing report API functionality...');
    
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
    
    // Simulate the report creation process from the API endpoint
    console.log('Testing report creation process...');
    
    // Test data similar to what would come from the frontend
    const testData = {
      title: 'Test Report from API',
      description: 'This is a test report created through the API',
      imageUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
      latitude: 40.7128,
      longitude: -74.0060,
      address: 'New York, NY',
      userId: user.id
    };
    
    // Validate required fields (similar to the API)
    if (!testData.title || !testData.description || !testData.latitude || !testData.longitude) {
      throw new Error('Title, description, latitude, and longitude are required');
    }
    
    // Validate latitude and longitude are numbers
    const lat = parseFloat(testData.latitude);
    const lng = parseFloat(testData.longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      throw new Error('Latitude and longitude must be valid numbers');
    }
    
    // Validate latitude and longitude ranges
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      throw new Error('Latitude must be between -90 and 90, longitude between -180 and 180');
    }
    
    // Clean and validate image data (similar to the cleanImageData function)
    function cleanImageData(imageUrl) {
      if (!imageUrl) return null;
      
      // If it's a data URL, check if it's reasonable size
      if (imageUrl.startsWith('data:image/')) {
        // If it's too long, it might be corrupted
        if (imageUrl.length > 100000) { // 100KB limit
          console.warn('Image data URL is too long, rejecting');
          return null;
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
    
    // Clean and validate image data
    const cleanedImageUrl = cleanImageData(testData.imageUrl);
    
    // Handle the case where no user is provided or user doesn't exist
    let reportData = {
      title: testData.title.trim(),
      description: testData.description.trim(),
      imageUrl: cleanedImageUrl,
      latitude: lat,
      longitude: lng,
      address: testData.address || null,
      userId: testData.userId
    };
    
    // Validate title and description lengths
    if (reportData.title.length < 5 || reportData.title.length > 100) {
      throw new Error('Title must be between 5 and 100 characters');
    }
    
    if (reportData.description.length < 10 || reportData.description.length > 1000) {
      throw new Error('Description must be between 10 and 1000 characters');
    }
    
    // Create the report in the database
    const report = await prisma.report.create({
      data: reportData
    });
    
    console.log('✅ Report created successfully through API simulation');
    console.log('Report ID:', report.id);
    console.log('Image URL length:', report.imageUrl?.length || 0);
    
    // Test retrieving the report
    const retrievedReport = await prisma.report.findUnique({
      where: {
        id: report.id
      }
    });
    
    console.log('✅ Report retrieved successfully');
    console.log('Retrieved image URL length:', retrievedReport.imageUrl?.length || 0);
    
    // Clean up test data
    console.log('Cleaning up test data...');
    await prisma.report.delete({
      where: {
        id: report.id
      }
    });
    
    console.log('✅ Test report cleaned up');
    
    await prisma.$disconnect();
    console.log('✅ Report API test completed successfully!');
  } catch (error) {
    console.error('❌ Report API test failed:', error.message);
    console.error('Error stack:', error.stack);
    await prisma.$disconnect();
    process.exit(1);
  }
}

testReportAPI();