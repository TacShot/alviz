import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../models/analysis_result.dart';

class GeminiService {
  // TODO: Update this URL after deploying Firebase Cloud Function with Gemini 2.5 Pro
  // Format: https://us-central1-PROJECT_ID.cloudfunctions.net/analyzeDataStructure
  static const String API_URL = 'REPLACE_WITH_FIREBASE_FUNCTION_URL';

  Future<AnalysisResult> analyzeImage(String base64Image) async {
    try {
      // Create JSON payload
      final payload = {
        'image': base64Image,
      };

      // Make POST request to Cloud Function
      final response = await http
          .post(
            Uri.parse(API_URL),
            headers: {'Content-Type': 'application/json'},
            body: json.encode(payload),
          )
          .timeout(const Duration(seconds: 60));

      // Check response status code
      if (response.statusCode == 200) {
        // Success - parse response
        final jsonResponse = json.decode(response.body) as Map<String, dynamic>;
        return AnalysisResult.fromJson(jsonResponse);
      } else if (response.statusCode >= 400 && response.statusCode < 500) {
        // Client error (4xx)
        try {
          final jsonResponse = json.decode(response.body) as Map<String, dynamic>;
          final errorMessage = jsonResponse['error'] as String? ?? 'Client error occurred';
          return AnalysisResult(
            text: '',
            success: false,
            error: errorMessage,
          );
        } catch (_) {
          return AnalysisResult(
            text: '',
            success: false,
            error: 'Client error occurred',
          );
        }
      } else {
        // Server error (5xx)
        return AnalysisResult(
          text: '',
          success: false,
          error: 'Server error, please try again',
        );
      }
    } on TimeoutException {
      return AnalysisResult(
        text: '',
        success: false,
        error: 'Request timed out',
      );
    } on SocketException {
      return AnalysisResult(
        text: '',
        success: false,
        error: 'Network error, check your connection',
      );
    } catch (e) {
      return AnalysisResult(
        text: '',
        success: false,
        error: 'Unexpected error: ${e.toString()}',
      );
    }
  }
}
