const cloudinary = require('cloudinary').v2

cloudinary.config({
    cloud_name:'dkcvzewzj',
    api_key:'719132736253323',
    api_secret:'fYrQNmLPXo1q5OtLKAUmHsctKHo'
})


exports.uploadImage = async (files) => {
  const fileArray = Object.values(files); // Convert files object to an array
  const results = []; // This will store the result of each upload

  // Upload each file one by one
  for (const file of fileArray) {
    try {
      const result = await new Promise((resolve, reject) => {
        // Upload the file to Cloudinary
        cloudinary.uploader.upload_stream(
          (error, result) => {
            console.log(`>>>>>>>>>>>error, result`,error, result);
            
            if (error) {
              reject(error); // Reject if there's an error
            } else {
              resolve(result); // Resolve with the result if upload is successful
            }
          }
        ).end(file.data); // Start uploading the file
      });

      results.push(result); // Store the result of the upload
    } catch (error) {
      console.error('Error uploading file:', error); // Log the error if upload fails
    }
  }

  return results; // Return the list of upload results
};