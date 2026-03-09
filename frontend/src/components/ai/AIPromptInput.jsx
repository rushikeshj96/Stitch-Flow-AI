import React, { useRef } from 'react';
import { HiOutlineSparkles, HiOutlineX } from 'react-icons/hi';

const QUICK_PROMPTS = [
    'Bridal lehenga with heavy zardozi embroidery, crimson and gold',
    'Casual kurti with floral print and 3/4 sleeves, pastel colors',
    'Designer anarkali suit with mirror work, festive wear',
    'Indo-western sharara set with sequins, sage green',
    'Traditional silk saree blouse with gold border',
    'Party wear gown with cape, navy blue with silver embroidery',
];

/**
 * Shared AI prompt input used across all AI feature tabs.
 *
 * @param {{ value, onChange, onSubmit, placeholder, loading, label, minLength, quickPrompts }} props
 */
export default function AIPromptInput({
    value,
    onChange,
    onSubmit,
    placeholder = 'Describe an outfit…',
    loading = false,
    label = 'Describe the design',
    minLength = 10,
    quickPrompts = QUICK_PROMPTS,
}) {
    const textareaRef = useRef(null);
    const canSubmit = value.trim().length >= minLength && !loading;

    const handleKey = (e) => {
        // Ctrl/Cmd + Enter submits
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            if (canSubmit) onSubmit();
        }
    };

    const applyPreset = (p) => {
        onChange(p);
        textareaRef.current?.focus();
    };

    return (
        <div className="space-y-3">
            {/* Label */}
            <label className="label">{label}</label>

            {/* Textarea + submit */}
            <div className="relative">
                <textarea
                    ref={textareaRef}
                    id="ai-prompt-textarea"
                    rows={4}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder={placeholder}
                    disabled={loading}
                    className={`input resize-none pr-10 text-sm leading-relaxed
                      ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                />
                {value && (
                    <button
                        type="button"
                        onClick={() => onChange('')}
                        className="absolute top-3 right-3 text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition-colors"
                        aria-label="Clear input"
                    >
                        <HiOutlineX className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Character hint */}
            <div className="flex items-center justify-between">
                <p className="hint">
                    {value.length < minLength && value.length > 0
                        ? `${minLength - value.length} more characters needed`
                        : value.length > 0 ? 'Press Ctrl+Enter to generate' : ''}
                </p>
                <p className={`text-xs tabular-nums ${value.length > 900 ? 'text-red-400' : 'text-neutral-400'}`}>
                    {value.length} / 1000
                </p>
            </div>

            {/* Submit button */}
            <button
                id="ai-generate-btn"
                type="button"
                onClick={onSubmit}
                disabled={!canSubmit}
                className={`btn w-full justify-center py-3 gap-2
                    ${canSubmit ? 'btn-primary' : 'btn-secondary opacity-60 cursor-not-allowed'}`}
            >
                {loading ? (
                    <>
                        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Generating…
                    </>
                ) : (
                    <>
                        <HiOutlineSparkles className="w-4 h-4" />
                        Generate
                    </>
                )}
            </button>

            {/* Quick prompt chips */}
            {quickPrompts?.length > 0 && (
                <div>
                    <p className="text-xs font-medium text-neutral-400 mb-2">Quick examples</p>
                    <div className="flex flex-wrap gap-1.5">
                        {quickPrompts.map(p => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => applyPreset(p)}
                                disabled={loading}
                                className="text-xs px-2.5 py-1.5 rounded-full border border-neutral-200 dark:border-white/10
                           text-neutral-600 dark:text-neutral-400
                           hover:bg-neutral-100 dark:hover:bg-white/5
                           hover:border-primary-400 hover:text-primary-700 dark:hover:text-primary-400
                           transition-all duration-150 text-left"
                            >
                                {p.length > 40 ? p.slice(0, 38) + '…' : p}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
