import React from 'react';
import { renderMixedContent } from '../utils/mathUtils.jsx';
import DOMPurify from 'dompurify';

/**
 * Renders material content that can contain both HTML from the editor
 * and LaTeX math expressions
 * 
 * @param {Object} props - Component props
 * @param {string} props.content - The HTML content that may include LaTeX
 * @param {string} props.className - Additional CSS classes
 */
const MaterialContent = ({ content, className = '', ...props }) => {
  if (!content) return null;
  
  // First sanitize the HTML content
  const sanitizedContent = DOMPurify.sanitize(content);
  
  // Process the content in stages:
  // 1. Split by HTML tags to preserve them
  // 2. Process text nodes for math expressions
  // 3. Reassemble everything
  
  // Simple approach: set content as HTML and let the math renderer
  // handle math expressions when encountered in text nodes
  
  return (
    <div 
      className={`material-content ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      {...props}
    />
  );
};

/**
 * Renders example problem with LaTeX support
 */
export const ExampleProblem = ({ problem, index }) => {
  if (!problem) return null;
  
  return (
    <div className="example-problem mb-8 p-4 border border-gray-200 rounded-lg">
      <h3 className="font-medium text-lg mb-2">Contoh Soal {index + 1}</h3>
      
      <div className="question mb-4">
        <div className="font-medium mb-1">Pertanyaan:</div>
        <div className="pl-3">{renderMixedContent(problem.question)}</div>
      </div>
      
      <div className="answer mb-4">
        <div className="font-medium mb-1">Jawaban:</div>
        <div className="pl-3">{renderMixedContent(problem.answer)}</div>
      </div>
      
      {problem.explanation && (
        <div className="explanation">
          <div className="font-medium mb-1">Penjelasan:</div>
          <div className="pl-3">{renderMixedContent(problem.explanation)}</div>
        </div>
      )}
    </div>
  );
};

export default MaterialContent; 