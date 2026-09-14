import type { Term } from './cutting-terms';

export function CuttingTerms({ terms }: { terms: Term[] }) {
  return (
    <ol className="list-decimal pl-5 space-y-2 text-sm leading-relaxed">
      {terms.map((t) => (
        <li key={t.id} className="break-inside-avoid">
          <strong>{t.title}.</strong> {t.text}
        </li>
      ))}
    </ol>
  );
}
