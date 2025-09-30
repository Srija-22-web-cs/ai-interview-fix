import * as pdfjsLib from 'pdfjs-dist/build/pdf';

// Set worker source for pdfjs-dist (Still required to prevent errors, even if we don't use it dynamically)
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * MOCKS the extraction of Name, Email, and Phone by returning fixed data.
 * This ensures the interview starts immediately with known values.
 * In a production app, this function would contain robust dynamic parsing logic.
 * @param {string} text - The extracted text content (ignored in this version).
 */
export const extractResumeData = (text) => {
  // --- MOCKING FIXED USER INPUT ---
  return {
    name: 'Srija',
    email: 'srijalukka222@gmail.com',
    phone: '9652292892',
  };
};

/**
 * Loads the file content (MOCKED).
 * @param {File} file - The file object from the upload input (ignored in this version).
 */
export const loadFileContent = async (file) => {
    console.log(`Processing file: ${file.name} - Using fixed mock data for extraction.`);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
    
    // Return an empty string that the parser (above) ignores, 
    // but satisfies the function structure.
    return ""; 
}
