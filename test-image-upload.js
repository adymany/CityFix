import { PrismaClient } from '@prisma/client';

async function testImageUpload() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Testing image upload functionality...');
    
    // Test creating a report with image data
    console.log('Testing report creation with image...');
    
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
    
    // Test creating a report with a base64 image
    const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    
    const report = await prisma.report.create({
      data: {
        title: 'Test Report with Image',
        description: 'This is a test report with an image attachment',
        imageUrl: base64Image,
        latitude: 40.7128,
        longitude: -74.0060,
        address: 'New York, NY',
        userId: user.id
      }
    });
    
    console.log('✅ Report created with image:', report.title);
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
    console.log('✅ Image upload test completed successfully!');
  } catch (error) {
    console.error('❌ Image upload test failed:', error.message);
    console.error('Error stack:', error.stack);
    await prisma.$disconnect();
    process.exit(1);
  }
}

testImageUpload();