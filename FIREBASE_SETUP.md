# Firebase Cloud Functions Setup for Alviz

This guide walks you through setting up the Firebase Cloud Functions backend for the Alviz Data Structure Analyzer application.

## Prerequisites

- Node.js 18 or later
- Firebase CLI installed globally: `npm install -g firebase-tools`
- Google Cloud account with billing enabled
- Gemini API access

## Step 1: Google Cloud Project Setup

1. **Create/Select Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - **Important**: Note your Project ID (you'll need it later)

2. **Enable Billing**
   - Go to Billing settings in Google Cloud Console
   - Enable billing for your project (required for Cloud Functions)
   - Firebase free tier covers expected usage

3. **Enable Required APIs**
   In Google Cloud Console, enable these APIs:
   - Cloud Functions API
   - Cloud Build API
   - Vertex AI API
   - Artifact Registry API

## Step 2: Get Gemini API Key

1. **Enable Vertex AI API**
   - Go to [Vertex AI API](https://console.cloud.google.com/vertex-ai)
   - Enable Gemini 1.5 Flash model for your project

2. **Generate API Key**
   - In Google Cloud Console, go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy and save your API key securely

## Step 3: Firebase Project Setup

1. **Login to Firebase**
   ```bash
   firebase login
   ```

2. **Initialize Firebase Functions**
   ```bash
   # Navigate to your alviz project directory
   cd /path/to/alviz

   # Initialize Firebase (if not already done)
   firebase init functions
   ```

3. **Configuration Options**
   - Use an existing Google Cloud project (select your project from Step 1)
   - Choose JavaScript as language
   - Use ES modules (ESM) when prompted
   - Install dependencies: `npm install`

4. **Configure Environment Variables**
   ```bash
   # Copy the example environment file
   cp functions/.env.example functions/.env

   # Edit the .env file and add your Gemini API key
   # GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```

## Step 4: Deploy Cloud Functions

1. **Install Dependencies**
   ```bash
   cd functions
   npm install
   ```

2. **Deploy Functions**
   ```bash
   # Deploy to Firebase (asia-south1 region)
   firebase deploy --only functions
   ```

3. **Get Your Function URL**
   After deployment, Firebase will show you URLs like:
   ```
   analyzeDataStructure: https://asia-south1-your-project-id.cloudfunctions.net/analyzeDataStructure
   ```

## Step 5: Update Flutter App Configuration

1. **Update gemini_service.dart**
   - Open `lib/services/gemini_service.dart`
   - Replace `REPLACE_WITH_FIREBASE_FUNCTION_URL` with your actual function URL
   - Example: `https://asia-south1-your-project-id.cloudfunctions.net/analyzeDataStructure`

2. **Build and Test Flutter App**
   ```bash
   flutter build windows    # For Windows
   flutter build macos      # For macOS
   flutter build linux      # For Linux
   ```

## Testing

### Local Development Testing

1. **Start Firebase Emulator**
   ```bash
   cd functions
   firebase emulators:start
   ```

2. **Test with Local Function**
   - Update `gemini_service.dart` with local URL: `http://localhost:5001/your-project-id/asia-south1/analyzeDataStructure`
   - Test with the Flutter app

3. **Test with curl**
   ```bash
   curl -X POST http://localhost:5001/your-project-id/asia-south1/analyzeDataStructure \
   -H "Content-Type: application/json" \
   -d '{
     "image": "base64_encoded_image_string",
     "analysisType": "educational"
   }'
   ```

### Production Testing

1. Deploy functions with `firebase deploy --only functions`
2. Update Flutter app with production function URL
3. Test complete flow from image upload to analysis

## API Reference

### analyzeDataStructure Function

**Endpoint**: `POST /analyzeDataStructure`

**Request Body**:
```json
{
  "image": "base64_encoded_image_string",
  "analysisType": "educational" // or "technical"
}
```

**Success Response** (200):
```json
{
  "text": "Detailed analysis of the data structure...",
  "success": true
}
```

**Error Response** (400/500):
```json
{
  "text": "",
  "success": false,
  "error": "Human-readable error message"
}
```

## Monitoring and Maintenance

### View Function Logs
```bash
firebase functions:log
```

### Monitor Usage
- Firebase Console → Functions → Usage
- Google Cloud Console → Vertex AI → Monitoring

### Cost Management
- Gemini 1.5 Flash: Free tier includes generous limits
- Firebase Functions: Free tier covers expected usage
- Monitor monthly usage in both Firebase and Google Cloud consoles

## Troubleshooting

### Common Issues

**Issue**: Function deployment fails
- **Solution**: Check that billing is enabled and all required APIs are enabled

**Issue**: Gemini API errors
- **Solution**: Verify API key is correct and has Vertex AI permissions

**Issue**: Flutter app cannot connect
- **Solution**: Verify Function URL is correct and check CORS configuration

**Issue**: Image analysis fails
- **Solution**: Ensure image is under 7MB and in supported format

### Getting Help

1. Check Firebase Functions logs: `firebase functions:log`
2. Check Google Cloud Console for API errors
3. Verify all environment variables are set correctly
4. Ensure all APIs are enabled in Google Cloud Console

## Architecture

```
Flutter App (alviz)
    ↓ (HTTP POST with base64 image)
Firebase Cloud Function (analyzeDataStructure)
    ↓ (image + prompt)
Google Vertex AI (Gemini 1.5 Flash)
    ↓ (analysis text)
Firebase Cloud Function (structured response)
    ↓ (JSON response)
Flutter App (display results)
```

## Security

- Gemini API key is stored securely in Firebase Functions environment variables
- API key is never exposed to the client application
- CORS is configured for desktop app access
- Input validation prevents malicious requests

## Performance

- Functions run in asia-south1 region (Mumbai) for optimal performance
- 60-second timeout for image analysis requests
- 512MB memory limit (sufficient for image processing)
- Gemini 1.5 Flash model provides fast, cost-effective analysis

---

**Note**: This setup enables end-to-end functionality for the Alviz Data Structure Analyzer. The backend is now ready to process data structure diagrams and provide AI-powered analysis.