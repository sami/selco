import React from 'react';

interface ResultCardProps {
  title: string;
  quantity: string | number;
  unit: string;
  detail?: string;
}

export function ResultCard({ title, quantity, unit, detail }: ResultCardProps) {
  return (
    <div className="bg-selco-navy text-white rounded-lg p-6 shadow-md border-l-4 border-selco-yellow">
      <h3 className="text-lg font-bold text-selco-yellow mb-2">{title}</h3>
      <div className="flex items-baseline space-x-2 mb-2">
        <span className="text-4xl font-bold">{quantity}</span>
        <span className="text-xl text-neutral-grey-200">{unit}</span>
      </div>
      {detail && <p className="text-sm text-neutral-grey-200">{detail}</p>}
    </div>
  );
}
