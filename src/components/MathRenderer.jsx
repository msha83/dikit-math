import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

/**
 * Component for rendering LaTeX mathematical expressions
 * @param {Object} props - Component props
 * @param {string} props.math - The LaTeX math string to render
 * @param {boolean} props.block - Whether to render as a block (centered, larger) or inline
 * @param {Object} props.errorColor - Custom error color for invalid LaTeX
 */
const MathRenderer = ({ math, block = false, errorColor = '#cc0000', ...props }) => {
  // Handle empty math expressions
  if (!math) return null;

  try {
    return block ? (
      <BlockMath math={math} errorColor={errorColor} {...props} />
    ) : (
      <InlineMath math={math} errorColor={errorColor} {...props} />
    );
  } catch (error) {
    console.error('Error rendering LaTeX:', error);
    return <span style={{ color: errorColor }}>{math}</span>;
  }
};

export default MathRenderer; 