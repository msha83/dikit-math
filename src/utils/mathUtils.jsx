import React from 'react';
import MathRenderer from '../components/MathRenderer';

/**
 * Renders a mixed string containing both text and LaTeX math expressions
 * Math expressions should be wrapped in $ for inline math or $$ for block math
 * 
 * @param {string} text - Text potentially containing LaTeX expressions
 * @return {Array} Array of React elements (text and math)
 */
export const renderMixedContent = (text) => {
  if (!text) return null;
  
  // Split the text by math delimiters
  const parts = [];
  let lastIndex = 0;
  
  // Regular expression to match LaTeX blocks
  // $$....$$ for block math
  // $....$ for inline math
  const regex = /(\$\$[\s\S]+?\$\$)|(\$[\s\S]+?\$)/g;
  
  let match;
  while ((match = regex.exec(text)) !== null) {
    // Add text before the math expression
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    
    // Determine if this is block math ($$..$$) or inline math ($...$)
    const isBlockMath = match[0].startsWith('$$');
    
    // Extract the math content without the delimiters
    let mathContent = match[0];
    if (isBlockMath) {
      mathContent = mathContent.substring(2, mathContent.length - 2);
    } else {
      mathContent = mathContent.substring(1, mathContent.length - 1);
    }
    
    // Add the math component
    parts.push({ 
      type: 'math', 
      content: mathContent, 
      block: isBlockMath 
    });
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add any remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  
  // Convert the parts array to React elements
  return parts.map((part, index) => {
    if (typeof part === 'string') {
      return <span key={index}>{part}</span>;
    } else {
      return (
        <MathRenderer 
          key={index} 
          math={part.content} 
          block={part.block} 
        />
      );
    }
  });
};

/**
 * Simple utility to test if a string contains LaTeX math expressions
 */
export const containsMath = (text) => {
  if (!text) return false;
  return /(\$\$[\s\S]+?\$\$)|(\$[\s\S]+?\$)/g.test(text);
}; 