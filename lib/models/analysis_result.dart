class AnalysisResult {
  final String text;
  final bool success;
  final String? error;

  AnalysisResult({
    required this.text,
    required this.success,
    this.error,
  });

  factory AnalysisResult.fromJson(Map<String, dynamic> json) {
    return AnalysisResult(
      text: json['text'] as String? ?? '',
      success: json['success'] as bool? ?? false,
      error: json['error'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'text': text,
      'success': success,
      'error': error,
    };
  }
}
