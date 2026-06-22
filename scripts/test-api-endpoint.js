// Test the actual API endpoint with a real HTTP request
import http from 'http';
import fs from 'fs';

// Read the test server file to understand how to make requests
fs.readFile('./server.js', 'utf8', (err, data) => {
  if (err) {
    console.log('Server file not found, using default port 3000');
    testAPIEndpoint(3000);
  } else {
    // Try to extract port from server file
    const portMatch = data.match(/port\s*=\s*(\d+)/);
    const port = portMatch ? parseInt(portMatch[1]) : 3000;
    testAPIEndpoint(port);
  }
  }
);

function testAPIEndpoint(port) {
  console.log(`Testing API endpoint on port ${port}...`);
  
  // Test data for creating a report
  const testData = JSON.stringify({
    title: 'API Test Report',
    description: 'This is a test report created via API endpoint',
    imageUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
    latitude: 40.7128,
    longitude: -74.0060,
    address: 'New York, NY'
  });

  const options = {
    hostname: 'localhost',
    port: port,
    path: '/api/reports',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': testData.length
    }
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log(`Status Code: ${res.statusCode}`);
      console.log(`Response Headers: ${JSON.stringify(res.headers)}`);
      
      try {
        const response = JSON.parse(data);
        console.log('Response Body:', response);
        
        if (res.statusCode === 201) {
          console.log('✅ API endpoint test passed!');
          console.log('Report created with ID:', response.id);
        } else {
          console.log('❌ API endpoint test failed with status:', res.statusCode);
          console.log('Error message:', response.error);
        }
      } catch (parseError) {
        console.log('Response Body (raw):', data);
        if (res.statusCode === 201) {
          console.log('✅ API endpoint test passed!');
        } else {
          console.log('❌ API endpoint test failed with status:', res.statusCode);
        }
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ API endpoint test failed with error:', error.message);
    console.log('This might be because the server is not running. Please start the server and try again.');
  });

  req.write(testData);
  req.end();
}