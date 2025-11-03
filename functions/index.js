import { onRequest } from "firebase-functions/v2/https";
import { VertexAI } from "@google-cloud/vertexai";

// Initialize Vertex AI client
const vertexAI = new VertexAI({
  project: process.env.GCLOUD_PROJECT,
  location: "asia-south1",
});

// Educational mode prompt
const EDUCATIONAL_PROMPT = `You are a data structure analysis expert focused on student learning. Analyze the provided data structure diagram image and provide a comprehensive, educational analysis including:

1. Data Structure Type (identified clearly)
2. Simple explanation of how it works
3. Real-world examples and use cases
4. Basic operations explained step-by-step
5. Learning tips and common mistakes to avoid

Please use clear, student-friendly language that helps someone learning data structures for the first time. Include examples and avoid overly technical jargon.`;

// Technical mode prompt
const TECHNICAL_PROMPT = `You are a data structure analysis expert providing detailed technical analysis. Analyze the provided data structure diagram image and provide comprehensive technical information including:

1. Data Structure Type with precise classification
2. Detailed algorithmic analysis and complexity (Big O notation)
3. Implementation details and data representation
4. Advanced operations and edge cases
5. Performance characteristics and optimization considerations
6. Related algorithms and patterns

Please provide technically accurate information suitable for developers and computer science students who need deep understanding of implementation details.`;

export const analyzeDataStructure = onRequest(
  {
    cors: true,
    region: "asia-south1",
  },
  async (req, res) => {
    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    // Only allow POST requests
    if (req.method !== "POST") {
      return res.status(405).json({
        success: false,
        text: "",
        error: "Method not allowed",
      });
    }

    try {
      // Validate request body
      if (!req.body) {
        return res.status(400).json({
          success: false,
          text: "",
          error: "No request body provided",
        });
      }

      const { image, analysisType = "educational" } = req.body;

      // Input validation
      if (!image) {
        return res.status(400).json({
          success: false,
          text: "",
          error: "No image provided",
        });
      }

      if (typeof image !== "string" || image.trim() === "") {
        return res.status(400).json({
          success: false,
          text: "",
          error: "Image data is empty",
        });
      }

      // Validate analysis type
      if (!["educational", "technical"].includes(analysisType)) {
        return res.status(400).json({
          success: false,
          text: "",
          error: "Invalid analysis type. Must be 'educational' or 'technical'",
        });
      }

      // Validate base64 format (basic check)
      try {
        Buffer.from(image, "base64");
      } catch (error) {
        return res.status(400).json({
          success: false,
          text: "",
          error: "Invalid image format",
        });
      }

      // Check for API key
      if (!process.env.GEMINI_API_KEY) {
        console.error("GEMINI_API_KEY environment variable is not set");
        return res.status(500).json({
          success: false,
          text: "",
          error: "Analysis service unavailable",
        });
      }

      // Initialize Gemini model
      const model = vertexAI.getGenerativeModel({
        model: "gemini-1.5-flash",
      });

      // Select prompt based on analysis type
      const prompt = analysisType === "technical" ? TECHNICAL_PROMPT : EDUCATIONAL_PROMPT;

      console.log(`Processing ${analysisType} analysis request`);

      // Generate content with Gemini
      const response = await model.generateContent([
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: image,
          },
        },
        prompt,
      ]);

      // Extract analysis text from response
      const analysisText = response.response.text();

      if (!analysisText || analysisText.trim() === "") {
        return res.status(500).json({
          success: false,
          text: "",
          error: "No analysis generated",
        });
      }

      // Return successful analysis
      return res.status(200).json({
        success: true,
        text: analysisText,
      });

    } catch (error) {
      console.error("Analysis failed:", error);

      // Handle specific error cases
      let errorMessage = "Analysis failed, please try again";
      let statusCode = 500;

      if (error.message) {
        if (error.message.includes("quota") || error.message.includes("rate limit")) {
          errorMessage = "Service temporarily unavailable, please try again later";
        } else if (error.message.includes("content") || error.message.includes("safety")) {
          errorMessage = "Image content not supported for analysis";
          statusCode = 400;
        } else if (error.message.includes("timeout")) {
          errorMessage = "Analysis timeout, please try again";
        } else if (error.message.includes("memory") || error.message.includes("size")) {
          errorMessage = "Image too large for analysis";
          statusCode = 400;
        } else if (error.message.includes("API key") || error.message.includes("permission")) {
          errorMessage = "Analysis service unavailable";
        }
      }

      return res.status(statusCode).json({
        success: false,
        text: "",
        error: errorMessage,
      });
    }
  }
);