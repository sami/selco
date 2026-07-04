import React from 'react';

export interface MaterialItem {
  id: string;
  name: string;
  quantity: number | string;
  unit: string;
}

interface MaterialsListProps {
  items: MaterialItem[];
}

export function MaterialsList({ items }: MaterialsListProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-neutral-grey-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-sm font-bold text-selco-navy tracking-wider">
              Material
            </th>
            <th scope="col" className="px-6 py-3 text-right text-sm font-bold text-selco-navy tracking-wider">
              Quantity
            </th>
            <th scope="col" className="px-6 py-3 text-left text-sm font-bold text-selco-navy tracking-wider">
              Unit
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {items.map((item) => (
            <tr key={item.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-grey-800">
                {item.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 font-bold">
                {item.quantity}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.unit}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
