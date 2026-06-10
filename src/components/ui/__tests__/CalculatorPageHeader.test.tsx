import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CalculatorPageHeader } from '../CalculatorPageHeader';
import { getCalculatorById } from '../../../calculators/registry';

describe('CalculatorPageHeader', () => {
    test('renders the registry title as the single page h1', () => {
        render(<CalculatorPageHeader calculatorId="tiling" />);
        const heading = screen.getByRole('heading', { level: 1 });
        expect(heading).toHaveTextContent(getCalculatorById('tiling')!.name);
    });

    test('renders the one-line blurb from the registry', () => {
        render(<CalculatorPageHeader calculatorId="tiling" />);
        expect(screen.getByText(getCalculatorById('tiling')!.description)).toBeInTheDocument();
    });

    test('icon is decorative (aria-hidden) and renders an svg', () => {
        const { container } = render(<CalculatorPageHeader calculatorId="tiling" />);
        const decorative = container.querySelector('[aria-hidden="true"]');
        expect(decorative).not.toBeNull();
        expect(decorative!.querySelector('svg')).not.toBeNull();
    });

    test('is data-driven: a different id renders that entry, no page-level text', () => {
        render(<CalculatorPageHeader calculatorId="decking" />);
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
            getCalculatorById('decking')!.name,
        );
    });

    test('renders nothing for an unknown calculator id', () => {
        const { container } = render(<CalculatorPageHeader calculatorId="not-a-calc" />);
        expect(container).toBeEmptyDOMElement();
    });
});
