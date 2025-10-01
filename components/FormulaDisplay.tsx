import React from 'react';

const toSubscript = (formula: string) => {
  const subscriptMap: Record<string, string> = {
    '0': '₀',
    '1': '₁',
    '2': '₂',
    '3': '₃',
    '4': '₄',
    '5': '₅',
    '6': '₆',
    '7': '₇',
    '8': '₈',
    '9': '₉',
  };

  return formula.replace(/\d/g, (digit) => subscriptMap[digit]);
};

const FormulaDisplay = ({ formula }: { formula: string }) => {
  return <p>{toSubscript(formula)}</p>;
};

export default FormulaDisplay;
