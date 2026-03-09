import React, { useState } from 'react';
import {
    HiOutlineDownload, HiOutlineHeart, HiOutlineTrash,
    HiOutlineClipboard, HiOutlineCheck,
} from 'react-icons/hi';
import toast from 'react-hot-toast';

/**
 * DesignCard — displays persisted AI design with image, brief, and actions.
 *
 * @param {{ design, onDelete, onFavourite, compact }} props
 */
export default function DesignCard({ design, onDelete, onFavourite, compact = false }) {
    const [copied, setCopied] = useState(false);

    const copyPrompt = async () => {
        try {
            await navigator.clipboard.writeText(design.prompt);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch { toast.error('Copy failed'); }
    };

    return (
        <div className={`card overflow-hidden group hover:shadow-card-hover transition-shadow duration-200
                     ${compact ? '' : 'flex flex-col'}`}>
            {/* Image */}
            {design.imageUrl ? (
                <div className="relative overflow-hidden bg-neutral-100 dark:bg-white/5
                        aspect-square">
                    <img
                        src={design.imageUrl}
                        alt={design.prompt}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                    />
                    {/* Overlay actions */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200
                          flex items-end justify-end p-3 gap-2 opacity-0 group-hover:opacity-100">
                        <a
                            href={design.imageUrl}
                            download="stitchflow-design.png"
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/40 transition-colors"
                            title="Download"
                        >
                            <HiOutlineDownload className="w-4 h-4" />
                        </a>
                    </div>

                    {/* Favourite indicator */}
                    {design.isFavourite && (
                        <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-red-500
                            flex items-center justify-center">
                            <HiOutlineHeart className="w-3.5 h-3.5 text-white fill-white" />
                        </div>
                    )}
                </div>
            ) : (
                <div className="aspect-square bg-gradient-to-br from-primary-50 to-purple-50
                        dark:from-primary-900/20 dark:to-purple-900/20
                        flex items-center justify-center text-4xl">
                    ✨
                </div>
            )}

            {/* Content */}
            <div className={`${compact ? 'p-3' : 'p-5'} flex flex-col gap-3 flex-1`}>
                {/* Prompt */}
                <div>
                    <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1">Prompt</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 line-clamp-2">{design.prompt}</p>
                </div>

                {/* Design idea */}
                {!compact && design.designIdea && (
                    <div>
                        <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1">Design Idea</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-3">{design.designIdea}</p>
                    </div>
                )}

                {/* Fabric + Occasion pills */}
                {!compact && (
                    <div className="flex flex-wrap gap-1.5">
                        {design.occasion && (
                            <span className="badge badge-primary">{design.occasion}</span>
                        )}
                        {design.stitchingTime && (
                            <span className="badge badge-neutral">🕒 {design.stitchingTime}</span>
                        )}
                        {design.estimatedCost?.min > 0 && (
                            <span className="badge badge-success">
                                ₹{design.estimatedCost.min.toLocaleString('en-IN')}+
                            </span>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-1 mt-auto pt-1 border-t border-neutral-100 dark:border-white/5">
                    <button
                        onClick={copyPrompt}
                        className="btn-ghost p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-white text-xs gap-1"
                        title="Copy prompt"
                    >
                        {copied
                            ? <HiOutlineCheck className="w-3.5 h-3.5 text-emerald-500" />
                            : <HiOutlineClipboard className="w-3.5 h-3.5" />
                        }
                    </button>

                    {onFavourite && (
                        <button
                            onClick={() => onFavourite(design._id)}
                            className={`btn-ghost p-2 text-xs gap-1 transition-colors
                          ${design.isFavourite
                                    ? 'text-red-500 hover:text-red-600'
                                    : 'text-neutral-400 hover:text-red-500'}`}
                            title={design.isFavourite ? 'Unfavourite' : 'Favourite'}
                        >
                            <HiOutlineHeart className={`w-3.5 h-3.5 ${design.isFavourite ? 'fill-current' : ''}`} />
                        </button>
                    )}

                    {onDelete && (
                        <button
                            onClick={() => onDelete(design._id)}
                            className="btn-ghost p-2 text-neutral-400 hover:text-red-500 ml-auto"
                            title="Delete"
                        >
                            <HiOutlineTrash className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
