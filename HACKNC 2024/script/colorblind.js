var collectedCSSContent = [];

function getInlineStyles() {
  var inlineStylesArray = [];
  var elementsWithStyleAttribute = document.querySelectorAll('[style]');
  elementsWithStyleAttribute.forEach(function (element) {
    var inlineStyle = element.getAttribute('style');
    if (inlineStyle) {
      inlineStylesArray.push(inlineStyle);
    }
  });
  return inlineStylesArray.join('\n');
}

var allStylesheets = document.styleSheets;
for (var i = 0; i < allStylesheets.length; i++) {
  var stylesheetRules;
  try {
    stylesheetRules = allStylesheets[i].cssRules || allStylesheets[i].rules;
  } catch (error) {
    console.error('Access to stylesheet rules blocked by CORS policy:', error);
    continue;
  }
  var cssRulesText = '';
  for (var j = 0; j < stylesheetRules.length; j++) {
    cssRulesText += stylesheetRules[j].cssText + '\n';
  }
  collectedCSSContent.push(cssRulesText);
}

var inlineStylesText = getInlineStyles();
collectedCSSContent.push(inlineStylesText);

var combinedCSSContent = collectedCSSContent.join('\n');

var colorBlindnessType = "red-green";

var colorBlindnessPromptMap = {
  "red-green": "Increase contrast between red and green elements for protanopia and deuteranopia color blindness, using alternative colors like blue and yellow.",
  "blue-yellow": "Adjust contrast between blue and yellow elements for tritanopia color blindness, replacing these combinations with colors that are easier to distinguish.",
  "achromatopsia": "Enhance contrast for total color blindness (achromatopsia), focusing on grayscale and high-contrast color schemes."
};

var colorBlindnessPrompt = colorBlindnessPromptMap[colorBlindnessType];

fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer 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'
  },
  body: JSON.stringify({
    "model": "gpt-4-turbo",
    "messages": [
      {
        "role": "system",
        "content": "You are an expert at generating accessible CSS for color blindness."
      },
      {
        "role": "user",
        "content": `Generate CSS to make the website accessible to ${colorBlindnessType} colorblind users. ${colorBlindnessPrompt}. Use !important overrides as necessary, and respond only with CSS code formatted as <style>...</style>. Current CSS: ${combinedCSSContent}`
      }
    ]
  })
})
.then(response => response.json())
.then(data => {
  var cssGeneratedCode = data.choices[0].message.content;
  var cleanedCSSCode = cssGeneratedCode.replace('<style>', '').replace('</style>', '').trim();
  var styleElement = document.createElement('style');
  styleElement.textContent = cleanedCSSCode;
  document.head.appendChild(styleElement);
})
.catch(err => console.error('Failed to fetch CSS from OpenAI:', err));
