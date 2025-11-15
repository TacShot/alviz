# Data Structure Analyzer (alviz)

An AI-powered Windows desktop application that analyzes data structure diagrams using Google's Gemini API. Upload an image of any data structure diagram (binary tree, linked list, graph, etc.), and receive a detailed AI-generated analysis explaining its components, operations, and use cases.

## Features

- **Image Upload:** Select data structure diagram images from your computer
- **AI Analysis:** Powered by Gemini 2.5 Pro for advanced reasoning and accurate identification
- **Detailed Descriptions:** Get bullet-point breakdowns of:
  - Data structure identification
  - Key components (nodes, pointers, edges)
  - How it works (insertion, deletion, search operations)
  - Common use cases
- **Enhanced Reasoning:** Advanced analysis through complex data structure examination leveraging Gemini 2.5 Pro's thinking capabilities
- **Clean UI:** Intuitive Material Design interface optimized for Windows desktop
- **Secure API Design:** API key stored server-side in Firebase, never exposed to client

## Architecture

### Frontend: Flutter Windows Desktop App
- **Language:** Dart
- **UI Framework:** Flutter with Material Design 3
- **Platform:** Windows desktop (can be extended to other platforms)
- **Key Dependencies:**
  - `file_picker ^8.1.4` - Cross-platform file selection
  - `http ^1.2.2` - HTTP requests to backend

### Backend: Firebase Cloud Functions
- **Platform:** Firebase Cloud Functions (2nd gen)
- **Runtime:** Node.js 20
- **Model:** Google Gemini 2.5 Pro (advanced reasoning multimodal model)
- **Key Dependencies:**
  - `@google/generative-ai` - Latest Gemini API SDK (supports 2.5 Pro)
  - `cors` - Latest version for cross-origin requests
  - `firebase-functions` - Latest Cloud Functions runtime (v2)

### Why This Architecture?

**API Key Security:** The Gemini API key is never exposed to the Flutter app. All API calls go through a Firebase Cloud Function proxy, keeping the key secure on the server side.

**Benefits:**
- API key can't be extracted from compiled app
- Can add rate limiting and usage monitoring
- Can support mobile platforms without code changes
- Easy to rotate API keys without updating client

## Project Structure

```
alviz/
├── lib/
│   ├── main.dart                    # App entry point
│   ├── models/
│   │   └── analysis_result.dart     # Data model for API responses
│   ├── services/
│   │   └── gemini_service.dart      # API communication service
│   └── screens/
│       └── analyzer_screen.dart     # Main UI screen
├── pubspec.yaml                     # Flutter dependencies
├── windows/                         # Windows platform files (generated)
└── README.md                        # This file

functions/
├── index.js                         # Cloud Function code
├── package.json                     # Node.js dependencies
└── .env                            # Environment variables (not committed)
```

## Prerequisites

### For Flutter App Development:
- Flutter SDK 3.0.0 or higher
- Windows development tools (Visual Studio 2022 with Desktop C++ workload)
- Git

### For Firebase Backend:
- Node.js 20 or higher
- Firebase CLI (`npm install -g firebase-tools`)
- Google account for Firebase
- Gemini API key from Google AI Studio

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd alviz
```

### 2. Set Up Firebase Backend

**Important:** You must set up the Firebase Cloud Function before running the Flutter app.

Follow the detailed guide: [FIREBASE_SETUP.md](../FIREBASE_SETUP.md)

**Quick summary:**
1. Create Firebase project
2. Upgrade to Blaze plan (has generous free tier)
3. Get Gemini API key
4. Deploy Cloud Function
5. Copy the function URL

### 3. Configure Flutter App

After deploying the Firebase function, update the API URL:

1. Open `lib/services/gemini_service.dart`
2. Find the line:
   ```dart
   static const String API_URL = 'REPLACE_WITH_FIREBASE_FUNCTION_URL';
   ```
3. Replace with your Firebase function URL:
   ```dart
   static const String API_URL = 'https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/analyzeDataStructure';
   ```

### 4. Install Flutter Dependencies

```bash
cd alviz
flutter pub get
```

### 5. Generate Windows Platform Files

If the `windows/` directory doesn't exist or is incomplete:

```bash
flutter create --platforms=windows .
```

This generates the necessary Windows platform configuration.

### 6. Run the App

```bash
flutter run -d windows
```

Or run from your IDE (VS Code, Android Studio, etc.) by selecting Windows as the target device.

## Building for Distribution

### Build Release Version

```bash
flutter build windows --release
```

### Output Location

The built executable and dependencies are in:
```
build/windows/x64/runner/Release/
```

### Distribution

To distribute the app:

1. Navigate to `build/windows/x64/runner/Release/`
2. Zip the entire `Release` folder contents
3. Users extract and run `alviz.exe`

Files included:
- `alviz.exe` - Main executable
- `flutter_windows.dll` - Flutter runtime
- `data/` - App resources

**Note:** No installer is required for simple distribution. For a professional installer, use tools like Inno Setup or MSIX packaging.

## Usage Guide

1. **Launch the app** by running `alviz.exe`

2. **Upload a diagram:**
   - Click **"Select Image"**
   - Choose an image file of a data structure diagram (PNG, JPEG, etc.)
   - The image will appear in the preview area

3. **Analyze:**
   - Click **"Analyze with AI"**
   - Wait for the analysis (typically 3-10 seconds)
   - Results appear below with detailed description

4. **Analyze another diagram:**
   - Simply click **"Select Image"** again and repeat

## Supported Data Structures

The AI can identify and analyze:
- Binary Trees (BST, AVL, Red-Black, etc.)
- Graphs (directed, undirected, weighted)
- Linked Lists (singly, doubly, circular)
- Arrays and Dynamic Arrays
- Stacks and Queues
- Hash Tables
- Heaps (min-heap, max-heap)
- Tries
- And more!

## Example Output

For a binary tree diagram, you might get:

```
• Data Structure: Binary Search Tree (BST)

• Key Components:
  - Root node at the top containing value 50
  - Each node has up to two children (left and right)
  - Left subtree: all values less than parent
  - Right subtree: all values greater than parent
  - Leaf nodes: nodes with no children

• How It Works:
  - Insertion: Compare value with current node, go left if smaller,
    right if larger, repeat until empty spot found
  - Deletion: Three cases - leaf (remove), one child (replace),
    two children (replace with in-order successor)
  - Search: O(log n) average, O(n) worst case

• Common Use Cases:
  - Database indexing for efficient lookups
  - Implementing sorted sets and maps
  - File system directory structures
```

## Troubleshooting

### Issue: "Network error, check your connection"

**Solutions:**
- Check internet connection
- Verify Firebase function URL is correct in `gemini_service.dart`
- Ensure Firebase function is deployed and accessible

### Issue: "Request timed out"

**Solutions:**
- Image might be too large (limit is 7MB)
- Try with a smaller or compressed image
- Check Firebase function logs for backend errors

### Issue: "Image too large" error

**Solution:**
- Resize your image to under 7MB
- Use image compression tools
- Convert to JPEG if using PNG

### Issue: App won't run on Windows

**Solutions:**
- Ensure Flutter is installed: `flutter doctor`
- Verify Windows development tools are installed
- Try: `flutter clean` then `flutter pub get`
- Run: `flutter doctor -v` to check for missing dependencies

## Development

### Running in Debug Mode

```bash
flutter run -d windows
```

### Hot Reload

While the app is running, press `r` in the terminal to hot reload changes.

### Viewing Logs

Flutter logs appear in the terminal. For detailed logs:

```bash
flutter run -d windows -v
```

### Testing Cloud Function Locally

You can test the Firebase function with the emulator:

```bash
cd functions
firebase emulators:start --only functions
```

Then update `API_URL` to point to the local emulator:
```
http://127.0.0.1:5001/YOUR_PROJECT_ID/us-central1/analyzeDataStructure
```

## Cost Considerations

### Free Tier Limits (as of 2025):

**Gemini API:**
- 1,500 requests per day (free)
- After: ~$0.00025 per request

**Firebase Cloud Functions:**
- 2 million invocations per month
- 400,000 GB-seconds compute time
- 200,000 CPU-seconds
- 5GB outbound networking per month

**For personal/educational use:** You'll likely stay within free tier.

**For production use with many users:** Monitor usage in Firebase Console.

## Future Enhancements

Potential features for future versions:
- Analysis history with local storage
- Export results to PDF or text file
- Batch processing multiple images
- Custom prompt templates
- Dark mode theme
- Mobile platform support (Android/iOS)
- Drag-and-drop image upload
- Clipboard image paste support

## Technologies Used

- **Flutter** - Cross-platform UI framework
- **Dart** - Programming language for Flutter
- **Firebase Cloud Functions** - Serverless backend
- **Google Gemini API** - AI vision model for analysis
- **Material Design 3** - UI design system

## License

[Add your license here]

## Contributing

[Add contribution guidelines if applicable]

## Support

For issues or questions:
1. Check this README and FIREBASE_SETUP.md
2. Review Firebase function logs in Firebase Console
3. Create an issue in the repository

## Acknowledgments

- Built with Google's Gemini AI for multimodal vision analysis
- Powered by Firebase for secure, scalable backend
- UI designed with Material Design 3 principles
