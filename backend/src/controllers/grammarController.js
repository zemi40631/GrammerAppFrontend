require("dotenv").config();
const axios = require("axios");
const diff = require('diff');

const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

const checkGrammar = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const HF_API_URL = "https://api-inference.huggingface.co/models/vennify/t5-base-grammar-correction";
    
    const response = await axios.post(
      HF_API_URL,
      { inputs: text },
      { 
        headers: { 
          Authorization: `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 
      }
    );

    const correctedText = response.data[0]?.generated_text || "No correction available";

    // Compare original and corrected text to find errors
    const errors = compareTexts(text, correctedText);

    res.json({ 
      originalText: text,
      correctedText,
      errors 
    });
  } catch (error) {
    res.status(500).json({ 
      error: "Hugging Face API Error", 
      details: error.message 
    });
  }
};

const modifiedCheckGrammar = async (req, res) => {
  try {
    const { text } = req.body;
    
    // Input validation
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    // Use a specific grammar correction model
    const HF_GRAMMAR_MODEL = "vennify/t5-base-grammar-correction";
    const HF_API_URL = `https://api-inference.huggingface.co/models/${HF_GRAMMAR_MODEL}`;

    const response = await axios.post(
      HF_API_URL, 
      { inputs: text }, 
      {
        headers: { 
          Authorization: `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10-second timeout
      }
    );

    // Robust response extraction
    const correctedText = 
      response.data[0]?.generated_text?.trim() || 
      "Error processing text";

    // Compare texts to extract errors
    const errors = compareTexts(text, correctedText);

    // Generate highlighted text
    const highlightedText = createHighlightedText(text, errors);

    res.json({ 
      originalText: text,
      correctedText,
      errors,
      highlightedText
    });
  } catch (error) {
    console.error('Grammar check error:', error);
    
    res.status(500).json({ 
      error: "Grammar Check Failed", 
      details: error.message,
      type: error.response ? error.response.status : 'Unknown'
    });
  }
};

// Compare original and corrected texts to find errors
function compareTexts(originalText, correctedText) {
  const errors = [];
  
  // Use diff to find changes
  const changes = diff.diffWords(originalText, correctedText);
  
  changes.forEach((part, index) => {
    if (part.added || part.removed) {
      errors.push({
        word: part.value.trim(),
        type: part.added ? 'correction' : 'error',
        suggestion: part.added ? part.value : 'Potential error'
      });
    }
  });

  return errors;
}

// Create highlighted text with error markup
function createHighlightedText(originalText, errors) {
  let highlightedText = originalText;
  
  // Sort errors in reverse order to maintain correct indices
  const sortedErrors = errors
    .filter(error => error.type === 'error')
    .sort((a, b) => 
      originalText.indexOf(b.word) - originalText.indexOf(a.word)
    );

  sortedErrors.forEach(error => {
    const start = originalText.indexOf(error.word);
    const end = start + error.word.length;

    highlightedText = 
      highlightedText.slice(0, start) +
      `<span class="grammar-error" title="Suggestion: ${error.suggestion}">` +
      highlightedText.slice(start, end) +
      '</span>' +
      highlightedText.slice(end);
  });

  return highlightedText;
}

// CSS for error highlighting
const grammarErrorStyle = `
.grammar-error {
  background-color: #ffcccb;
  text-decoration: underline wavy red;
  cursor: help;
}
`;

module.exports = { 
  checkGrammar,
  modifiedCheckGrammar,
  grammarErrorStyle
};