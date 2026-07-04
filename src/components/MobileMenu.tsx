import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { projectRegistry } from '../projects/registry';

export default function MobileMenu({ baseUrl }: { baseUrl: string }) {
  const [isOpen, setIsOpen] = useState(false);

  // Close menu on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handyCalculators = projectRegistry.filter(p => p.category === 'Handy Calculators');
  const projectCalculators = projectRegistry.filter(p => p.category === 'Project Calculators');
  
  const getUrl = (route: string) => {
    const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return `${base}${route}`;
  };

  return (
    <div className="md:hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-white hover:text-selco-yellow focus:outline-none focus:ring-2 focus:ring-selco-yellow rounded-md flex items-center gap-2"
        aria-expanded={isOpen}
        aria-label="Toggle navigation menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
        <span className="text-sm font-medium">Menu</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-selco-navy border-t border-white/10 shadow-lg z-50">
          <nav className="flex flex-col py-4 px-6 text-white space-y-6">
            {handyCalculators.length > 0 && (
              <div>
                <h2 className="font-bold mb-3 text-selco-yellow uppercase tracking-wider text-sm">Handy Calculators</h2>
                <ul className="space-y-3">
                  {handyCalculators.map(calc => (
                    <li key={calc.id}>
                      <a href={getUrl(calc.route)} className="block hover:text-selco-yellow focus:text-selco-yellow focus:outline-none focus:underline">
                        {calc.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {projectCalculators.length > 0 && (
              <div>
                <h2 className="font-bold mb-3 text-selco-yellow uppercase tracking-wider text-sm">Project Calculators</h2>
                <ul className="space-y-3">
                  {projectCalculators.map(calc => (
                    <li key={calc.id}>
                      <a href={getUrl(calc.route)} className="block hover:text-selco-yellow focus:text-selco-yellow focus:outline-none focus:underline">
                        {calc.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
