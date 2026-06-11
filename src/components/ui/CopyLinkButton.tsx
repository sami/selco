import { useEffect, useRef, useState } from 'react';

interface CopyLinkButtonProps {
    /** Builds the shareable URL at click time, so it captures the current inputs. */
    getUrl: () => string;
}

/**
 * "Copy link" button for wizard permalinks.
 *
 * Copies the URL returned by `getUrl()` to the clipboard and shows a brief
 * "Link copied" confirmation. Falls back to a hidden textarea with
 * `document.execCommand('copy')` where the async Clipboard API is
 * unavailable (e.g. non-secure contexts).
 */
export function CopyLinkButton({ getUrl }: CopyLinkButtonProps) {
    const [copied, setCopied] = useState(false);
    const timeoutRef = useRef<number | undefined>(undefined);

    useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

    const handleCopy = async () => {
        const url = getUrl();
        let succeeded = false;

        if (navigator.clipboard?.writeText) {
            try {
                await navigator.clipboard.writeText(url);
                succeeded = true;
            } catch {
                succeeded = false;
            }
        }

        if (!succeeded) {
            const textarea = document.createElement('textarea');
            textarea.value = url;
            textarea.setAttribute('readonly', '');
            textarea.style.position = 'absolute';
            textarea.style.left = '-9999px';
            document.body.appendChild(textarea);
            textarea.select();
            try {
                succeeded = document.execCommand('copy');
            } catch {
                succeeded = false;
            }
            document.body.removeChild(textarea);
        }

        if (succeeded) {
            setCopied(true);
            window.clearTimeout(timeoutRef.current);
            timeoutRef.current = window.setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <button type="button" className="btn-ghost text-sm" onClick={handleCopy}>
            {copied ? 'Link copied' : 'Copy link'}
            <span className="sr-only" role="status">
                {copied ? 'Link copied to clipboard' : ''}
            </span>
        </button>
    );
}
