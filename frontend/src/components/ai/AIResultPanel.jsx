import React from 'react';
import { HiOutlineSparkles, HiOutlineDownload, HiOutlineRefresh } from 'react-icons/hi';
import { Skeleton } from '../ui/Skeleton.jsx';

/**
 * AIResultPanel — renders the AI response for any feature tab.
 *
 * Supports three display modes via the `mode` prop:
 *   'design'      — shows design brief fields + image
 *   'order-parse' — shows parsed order fields as a clean table
 *   'measurements'— shows predicted measurements as a grid
 *
 * @param {{ mode, result, loading, error, onRetry }} props
 */
export default function AIResultPanel({ mode = 'design', result, loading, error, onRetry }) {

    /* ── Loading skeleton ── */
    if (loading) return <ResultSkeleton mode={mode} />;

    /* ── Error state ── */
    if (error) {
        return (
            <div className="card p-6 flex flex-col items-center text-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-500/15 flex items-center justify-center text-2xl">⚠️</div>
                <div>
                    <p className="font-semibold text-neutral-900 dark:text-white">Generation Failed</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{error}</p>
                </div>
                {onRetry && (
                    <button onClick={onRetry} className="btn-secondary gap-2">
                        <HiOutlineRefresh className="w-4 h-4" /> Try Again
                    </button>
                )}
            </div>
        );
    }

    /* ── Empty state ── */
    if (!result) {
        return (
            <div className="card p-8 flex flex-col items-center text-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-500/10
                        flex items-center justify-center">
                    <HiOutlineSparkles className="w-7 h-7 text-primary-500" />
                </div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-xs">
                    {mode === 'design'
                        ? 'Describe a garment and click Generate to create an AI design brief and illustration.'
                        : mode === 'order-parse'
                            ? 'Paste your order notes and the AI will convert them into a structured record.'
                            : 'Enter partial measurements and AI will predict the missing values.'}
                </p>
            </div>
        );
    }

    /* ── Result panels ── */
    if (mode === 'design') return <DesignResult result={result} />;
    if (mode === 'order-parse') return <OrderParseResult result={result} />;
    if (mode === 'measurements') return <MeasurementResult result={result} />;
    return null;
}

/* ─── Design Result ─── */
function DesignResult({ result }) {
    const fields = [
        { label: 'Design Idea', value: result.designIdea, full: true },
        { label: 'Style Description', value: result.styleDescription, full: true },
        { label: 'Fabric Suggestion', value: result.fabricSuggestion, full: false },
        { label: 'Occasion', value: result.occasion, full: false },
        { label: 'Stitching Time', value: result.stitchingTime, full: false },
    ].filter(f => f.value);

    const cost = result.estimatedCost;

    return (
        <div className="space-y-4">
            {/* Generated Image */}
            {result.imageUrl && (
                <div className="card overflow-hidden">
                    <div className="relative group bg-neutral-100 dark:bg-white/5">
                        <img
                            src={result.imageUrl}
                            alt={result.designIdea || 'AI Design'}
                            className="w-full max-h-96 object-contain mx-auto block"
                        />
                        <a
                            href={result.imageUrl}
                            download="design.png"
                            target="_blank"
                            rel="noreferrer"
                            className="absolute top-3 right-3 p-2 rounded-xl bg-white/80 dark:bg-black/50
                         backdrop-blur-sm text-neutral-700 dark:text-white
                         hover:bg-white dark:hover:bg-black/70 transition-colors shadow-sm"
                            title="Download image"
                        >
                            <HiOutlineDownload className="w-4 h-4" />
                        </a>
                    </div>
                </div>
            )}

            {/* Brief fields */}
            <div className="card p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {fields.map(({ label, value, full }) => (
                        <div key={label} className={full ? 'sm:col-span-2' : ''}>
                            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">{label}</p>
                            <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">{value}</p>
                        </div>
                    ))}
                </div>

                {/* Color palette */}
                {result.colorPalette?.length > 0 && (
                    <div>
                        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Color Palette</p>
                        <div className="flex gap-2 flex-wrap">
                            {result.colorPalette.map((hex, i) => (
                                <div key={i} className="flex items-center gap-1.5">
                                    <div className="w-6 h-6 rounded-full border border-neutral-200 dark:border-white/10 shadow-sm"
                                        style={{ backgroundColor: hex }} />
                                    <code className="text-xs text-neutral-500">{hex}</code>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Cost estimate */}
                {cost?.min > 0 && (
                    <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-white/5">
                        <p className="text-sm text-neutral-500">Estimated Cost</p>
                        <p className="font-semibold text-neutral-900 dark:text-white">
                            ₹{cost.min.toLocaleString('en-IN')} – ₹{cost.max.toLocaleString('en-IN')}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ─── Order Parse Result ─── */
function OrderParseResult({ result }) {
    const LABELS = {
        dressType: 'Dress Type',
        color: 'Color',
        embroidery: 'Embroidery',
        neckStyle: 'Neck Style',
        sleeveStyle: 'Sleeve Style',
        length: 'Length',
        fabric: 'Fabric',
        occasion: 'Occasion',
        specialInstructions: 'Special Instructions',
    };

    const confidence = result.confidence;
    const confColor = confidence >= 0.8 ? 'text-emerald-600 dark:text-emerald-400'
        : confidence >= 0.5 ? 'text-amber-600  dark:text-amber-400'
            : 'text-red-600    dark:text-red-400';

    return (
        <div className="card p-5 space-y-4">
            {/* Confidence bar */}
            {confidence !== undefined && (
                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <p className="text-xs font-medium text-neutral-500">AI Confidence</p>
                        <p className={`text-xs font-semibold ${confColor}`}>{Math.round(confidence * 100)}%</p>
                    </div>
                    <div className="h-1.5 rounded-full bg-neutral-100 dark:bg-white/10">
                        <div
                            className={`h-full rounded-full transition-all duration-500
                          ${confidence >= 0.8 ? 'bg-emerald-500' : confidence >= 0.5 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.round(confidence * 100)}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Parsed fields */}
            <div className="divide-y divide-neutral-100 dark:divide-white/5">
                {Object.entries(LABELS).map(([key, label]) => {
                    const val = result[key];
                    return (
                        <div key={key} className="flex items-start justify-between py-3 gap-4">
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 shrink-0 w-36">{label}</p>
                            {val
                                ? <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 text-right">{val}</p>
                                : <p className="text-sm text-neutral-300 dark:text-neutral-600 italic text-right">Not specified</p>
                            }
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* ─── Measurement Prediction Result ─── */
function MeasurementResult({ result }) {
    const entries = Object.entries(result).filter(([, v]) => v !== null);

    const LABEL_MAP = {
        shoulder: 'Shoulder',
        neck: 'Neck',
        neckCircumference: 'Neck (Circ.)',
        sleeveLength: 'Sleeve Length',
        armhole: 'Armhole',
        chest: 'Chest',
        waist: 'Waist',
        hips: 'Hips',
        length: 'Length',
        inseam: 'Inseam',
        thigh: 'Thigh',
        knee: 'Knee',
        ankle: 'Ankle',
        kurta_length: 'Kurta Length',
        salwar_length: 'Salwar Length',
    };

    if (entries.length === 0) {
        return (
            <div className="card p-5 text-center text-neutral-400 text-sm">
                No measurements could be predicted from the given data.
            </div>
        );
    }

    return (
        <div className="card p-5">
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-4">
                Predicted Measurements (inches)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {entries.map(([key, value]) => (
                    <div key={key}
                        className="rounded-xl bg-primary-50 dark:bg-primary-500/10 p-3 text-center
                          border border-primary-100 dark:border-primary-500/20">
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                            {LABEL_MAP[key] || key}
                        </p>
                        <p className="text-xl font-display font-bold text-primary-700 dark:text-primary-300">
                            {value}
                            <span className="text-sm font-normal ml-0.5">″</span>
                        </p>
                    </div>
                ))}
            </div>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-4 text-center">
                ⚠️ AI-predicted values — always verify with the customer before cutting.
            </p>
        </div>
    );
}

/* ─── Skeleton loaders ─── */
function ResultSkeleton({ mode }) {
    if (mode === 'design') return (
        <div className="space-y-4">
            <div className="card overflow-hidden">
                <Skeleton className="aspect-square max-h-80 w-full" rounded="rounded-none" />
            </div>
            <div className="card p-5 space-y-4">
                {[100, 75, 60, 80, 40].map((w, i) => (
                    <Skeleton key={i} className={`h-4 w-[${w}%]`} />
                ))}
            </div>
        </div>
    );

    if (mode === 'order-parse') return (
        <div className="card p-5 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex justify-between py-2 border-b border-neutral-100 dark:border-white/5">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-36" />
                </div>
            ))}
        </div>
    );

    return (
        <div className="card p-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
        </div>
    );
}
