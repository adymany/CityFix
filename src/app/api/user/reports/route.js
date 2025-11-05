import { NextResponse } from 'next/server';
import dbAdapter from '@/lib/db-adapter';

// Helper function to validate and clean image data
function cleanImageData(imageUrl) {
  if (!imageUrl) return null;
  
  // If it's a data URL, check if it's reasonable size
  if (imageUrl.startsWith('data:image/')) {
    // If it's too long, it might be corrupted
    if (imageUrl.length > 1000000) { // Increase limit to 1MB
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

// GET /api/user/reports - Get reports for the current user
export async function GET(request) {
  try {
    // Get user ID from header (in a real app, you would verify a JWT token)
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = searchParams.get('limit');
    
    // Build query filters
    const where = {
      userId: userId // Only get reports for this user
    };
    
    // Apply status filter if provided
    if (status) {
      where.status = status;
    }
    
    // Get reports from database
    const reports = await dbAdapter.findReports(where);
    
    // Clean up any corrupted image data
    const cleanReports = reports.map(report => {
      return {
        ...report,
        imageUrl: cleanImageData(report.imageUrl)
      };
    });
    
    return NextResponse.json(cleanReports);
  } catch (error) {
    console.error('Error fetching user reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}