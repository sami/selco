import type { ReactNode } from 'react';
import type { MaterialQuantity } from '../../types';
import { MaterialsList } from './MaterialsList';

interface ResultCardProps {
    title: string;
    materials: MaterialQuantity[];
    warnings?: string[];
    children?: ReactNode;
}

export function ResultCard({ title, materials, warnings, children }: ResultCardProps) {
    return (
        <div className="card">
            <h3 className="text-lg font-semibold text-surface-foreground mb-4">{title}</h3>

            <MaterialsList materials={materials} />

            {warnings && warnings.length > 0 && (
                <ul className="mt-4 space-y-1">
                    {warnings.map((warning, index) => (
                        <li key={index} className="text-sm text-destructive">
                            {warning}
                        </li>
                    ))}
                </ul>
            )}

            {children}
        </div>
    );
}
