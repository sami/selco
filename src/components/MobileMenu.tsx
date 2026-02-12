import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Menu, X, Home, Calculator, FolderKanban } from 'lucide-react';

interface MobileMenuProps {
    currentPath: string;
    baseUrl: string;
}

export default function MobileMenu({ currentPath, baseUrl }: MobileMenuProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Prevent scrolling when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const navLinks = [
        { href: baseUrl, label: 'Home', icon: Home },
        { href: `${baseUrl}/projects`, label: 'Projects', icon: FolderKanban },
        { href: `${baseUrl}/calculators`, label: 'Calculators', icon: Calculator },
    ];

    const normalize = (path: string) => path.endsWith('/') ? path.slice(0, -1) : path;
    const current = normalize(currentPath);

    return (
        <div className="md:hidden">
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 text-ui-blue-dark hover:bg-ui-blue-light/50 rounded-md transition-colors focus-ring"
                aria-label="Open menu"
                aria-expanded={isOpen}
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Portal: render backdrop and panel at body level to escape header's backdrop-blur containing block */}
            {typeof document !== 'undefined' && createPortal(
                <>
                    {/* Backdrop */}
                    {isOpen && (
                        <div
                            className="fixed inset-0 bg-ui-blue-dark/20 backdrop-blur-sm z-50 animate-in fade-in duration-200"
                            onClick={() => setIsOpen(false)}
                        />
                    )}

                    {/* Slide-out Panel */}
                    <div
                        className={`fixed top-0 right-0 h-full w-4/5 max-w-sm bg-surface shadow-2xl z-50 transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                            }`}
                    >
                        <div className="flex flex-col h-full">
                            <div className="flex items-center justify-between p-4 border-b border-border">
                                <span className="font-bold text-lg text-brand-blue">Menu</span>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 text-muted-foreground hover:bg-muted rounded-md transition-colors focus-ring"
                                    aria-label="Close menu"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                                {navLinks.map((link) => {
                                    const linkHref = normalize(link.href);
                                    const isActive = current === linkHref || (link.href !== baseUrl && current.startsWith(linkHref));
                                    const Icon = link.icon;

                                    return (
                                        <a
                                            key={link.href}
                                            href={link.href}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${isActive
                                                    ? 'bg-brand-blue/5 text-brand-blue'
                                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                                }`}
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <Icon className={`w-5 h-5 ${isActive ? 'text-brand-blue' : 'text-muted-foreground'}`} />
                                            {link.label}
                                            {isActive && (
                                                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-yellow" />
                                            )}
                                        </a>
                                    );
                                })}
                            </nav>

                            <div className="p-4 border-t border-border">
                                <div className="text-xs text-center text-muted-foreground">
                                    &copy; {new Date().getFullYear()} Sami.codes
                                </div>
                            </div>
                        </div>
                    </div>
                </>,
                document.body
            )}
        </div>
    );
}
