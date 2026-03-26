import type { MaterialQuantity } from '../../types';

interface MaterialsListProps {
    materials: MaterialQuantity[];
}

export function MaterialsList({ materials }: MaterialsListProps) {
    return (
        <table className="results-table">
            <thead>
                <tr>
                    <th>Material</th>
                    <th>Quantity</th>
                    <th>Unit</th>
                </tr>
            </thead>
            <tbody>
                {materials.map((item, index) => (
                    <tr key={index}>
                        <td>{item.material}</td>
                        <td>{item.quantity}</td>
                        <td>{item.unit}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
