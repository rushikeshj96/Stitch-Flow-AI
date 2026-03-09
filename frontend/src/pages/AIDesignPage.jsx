import React, { useState, useCallback, useEffect } from 'react';
import { HiOutlineSparkles, HiOutlineDocumentText, HiOutlineScale, HiOutlineTrash, HiOutlineHeart } from 'react-icons/hi';
import { aiService } from '../services/aiService.js';
import AIPromptInput from '../components/ai/AIPromptInput.jsx';
import AIResultPanel from '../components/ai/AIResultPanel.jsx';
import DesignCard from '../components/ai/DesignCard.jsx';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import toast from 'react-hot-toast';

/* ─── Tab definitions ─────────────────────────── */
const TABS = [
    {
        id: 'design',
        label: 'Design Generator',
        icon: HiOutlineSparkles,
        hint: 'Describe a garment — AI creates a full design brief + illustration',
        promptLabel: 'Describe the garment design',
        placeholder: 'e.g. Modern bridal lehenga with heavy zardozi embroidery, deep crimson and gold',
        quickPrompts: [
            'Modern party wear kurti with embroidery, pastel pink',
            'Bridal lehenga with heavy zardozi, crimson and gold',
            'Indo-western sharara set, sage green with sequins',
            'Designer anarkali suit with mirror work, festive',
            'Traditional silk saree blouse with gold border',
        ],
    },
    {
        id: 'order-parse',
        label: 'Order Parser',
        icon: HiOutlineDocumentText,
        hint: 'Paste messy tailor notes — AI extracts structured order fields',
        promptLabel: 'Paste order notes',
        placeholder: 'e.g. Red bridal lehenga with heavy embroidery and deep neck blouse, must be ready by 15th',
        minLength: 10,
        quickPrompts: [
            'Red bridal lehenga with heavy embroidery deep neck blouse',
            'Blue chiffon saree with golden border stitching half sleeve blouse',
            'Pink anarkali with mirror work 3 quarter sleeve boat neck',
        ],
    },
    {
        id: 'measurements',
        label: 'Measurements AI',
        icon: HiOutlineScale,
        hint: 'Enter partial measurements — AI predicts the missing values',
        // This tab uses a different input UI (number fields, not a textarea)
        promptLabel: null,
    },
];

const KNOWN_MEASURE_FIELDS = [
    { key: 'chest', label: 'Chest (″)' },
    { key: 'waist', label: 'Waist (″)' },
    { key: 'hips', label: 'Hips (″)' },
    { key: 'shoulder', label: 'Shoulder (″)' },
    { key: 'height', label: 'Height (″)' },
];

export default function AIDesignPage() {
    const [activeTab, setActiveTab] = useState('design');

    /* Shared state per tab */
    const [prompt, setPrompt] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /* Measurement tab */
    const [measurements, setMeasurements] = useState({});

    /* History */
    const [history, setHistory] = useState([]);
    const [histLoading, setHistLoading] = useState(true);

    /* Reset result when switching tabs */
    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setResult(null);
        setError(null);
        setPrompt('');
    };

    /* Load design history */
    const loadHistory = useCallback(async () => {
        setHistLoading(true);
        try {
            const { data } = await aiService.getDesigns({ limit: 12 });
            setHistory(data.data.designs || []);
        } catch { /* silent */ }
        finally { setHistLoading(false); }
    }, []);

    useEffect(() => { loadHistory(); }, [loadHistory]);

    /* ── Submit handlers ── */
    const handleDesignGenerate = async () => {
        setLoading(true); setError(null); setResult(null);
        try {
            const { data } = await aiService.generateDesign(prompt);
            setResult(data.data);
            await loadHistory();
            toast.success('Design created!');
        } catch (err) {
            const msg = err?.response?.data?.message || 'Generation failed. Please try again.';
            setError(msg);
            toast.error(msg);
        } finally { setLoading(false); }
    };

    const handleOrderParse = async () => {
        setLoading(true); setError(null); setResult(null);
        try {
            const { data } = await aiService.parseOrder(prompt);
            setResult(data.data);
            toast.success('Order parsed successfully!');
        } catch (err) {
            const msg = err?.response?.data?.message || 'Parsing failed.';
            setError(msg);
            toast.error(msg);
        } finally { setLoading(false); }
    };

    const handleMeasurementPredict = async () => {
        const entered = Object.fromEntries(
            Object.entries(measurements).filter(([, v]) => v && !isNaN(Number(v)))
        );
        if (Object.keys(entered).length === 0) {
            toast.error('Enter at least one measurement'); return;
        }
        setLoading(true); setError(null); setResult(null);
        try {
            const { data } = await aiService.predictMeasurements(
                Object.fromEntries(Object.entries(entered).map(([k, v]) => [k, Number(v)]))
            );
            setResult(data.data.predicted);
            toast.success('Measurements predicted!');
        } catch (err) {
            const msg = err?.response?.data?.message || 'Prediction failed.';
            setError(msg);
            toast.error(msg);
        } finally { setLoading(false); }
    };

    /* ── History actions ── */
    const handleDelete = async (id) => {
        try {
            await aiService.deleteDesign(id);
            setHistory(h => h.filter(d => d._id !== id));
            toast.success('Design deleted');
        } catch { toast.error('Delete failed'); }
    };

    const handleFavourite = async (id) => {
        try {
            const { data } = await aiService.toggleFavourite(id);
            setHistory(h => h.map(d => d._id === id ? { ...d, isFavourite: data.data.isFavourite } : d));
        } catch { toast.error('Failed to update'); }
    };

    const tab = TABS.find(t => t.id === activeTab);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page header */}
            <div className="section-header">
                <div>
                    <h1 className="page-title flex items-center gap-2">
                        <HiOutlineSparkles className="w-6 h-6 text-primary-500" />
                        AI Features
                    </h1>
                    <p className="page-subtitle">Powered by GPT-4o-mini + DALL-E 3</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 p-1 bg-neutral-100 dark:bg-white/5 rounded-xl w-fit">
                {TABS.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        id={`tab-${id}`}
                        onClick={() => handleTabChange(id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-[calc(var(--radius)-2px)] text-sm font-medium transition-all duration-150
                        ${activeTab === id
                                ? 'bg-white dark:bg-white/10 text-primary-700 dark:text-primary-300 shadow-sm'
                                : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-white'
                            }`}
                    >
                        <Icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{label}</span>
                    </button>
                ))}
            </div>

            {/* Hint */}
            {tab?.hint && (
                <p className="text-sm text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-white/[0.03]
                      border border-neutral-200 dark:border-white/5 rounded-xl px-4 py-3">
                    💡 {tab.hint}
                </p>
            )}

            {/* Main content */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Left: Input panel */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="card p-5">
                        {/* Design + Order parse tabs: shared textarea */}
                        {activeTab !== 'measurements' && (
                            <AIPromptInput
                                value={prompt}
                                onChange={setPrompt}
                                onSubmit={activeTab === 'design' ? handleDesignGenerate : handleOrderParse}
                                placeholder={tab?.placeholder}
                                loading={loading}
                                label={tab?.promptLabel}
                                minLength={tab?.minLength || 10}
                                quickPrompts={tab?.quickPrompts}
                            />
                        )}

                        {/* Measurements tab: number inputs */}
                        {activeTab === 'measurements' && (
                            <div className="space-y-4">
                                <p className="label">Enter known measurements (inches)</p>
                                <div className="space-y-3">
                                    {KNOWN_MEASURE_FIELDS.map(({ key, label }) => (
                                        <div key={key}>
                                            <label className="label text-xs">{label}</label>
                                            <input
                                                type="number"
                                                step="0.5"
                                                min="0"
                                                max="100"
                                                value={measurements[key] || ''}
                                                onChange={e => setMeasurements(m => ({ ...m, [key]: e.target.value }))}
                                                className="input"
                                                placeholder="0"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <button
                                    id="ai-measure-btn"
                                    onClick={handleMeasurementPredict}
                                    disabled={loading}
                                    className="btn btn-primary w-full justify-center py-3 mt-2"
                                >
                                    {loading
                                        ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Predicting…</>
                                        : <><HiOutlineScale className="w-4 h-4" /> Predict Missing</>
                                    }
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Result panel */}
                <div className="lg:col-span-3">
                    <AIResultPanel
                        mode={activeTab}
                        result={result}
                        loading={loading}
                        error={error}
                        onRetry={activeTab === 'design' ? handleDesignGenerate
                            : activeTab === 'order-parse' ? handleOrderParse
                                : handleMeasurementPredict}
                    />
                </div>
            </div>

            {/* ── Design History ── */}
            {activeTab === 'design' && (
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-display font-semibold text-neutral-900 dark:text-white">
                            Design History
                        </h2>
                        {history.length > 0 && (
                            <p className="text-sm text-neutral-400">{history.length} saved</p>
                        )}
                    </div>

                    {histLoading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <Skeleton key={i} className="aspect-square rounded-xl" />
                            ))}
                        </div>
                    ) : history.length === 0 ? (
                        <div className="card p-8 text-center">
                            <p className="text-neutral-400 text-sm">No designs generated yet. Create your first one above!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {history.map(d => (
                                <DesignCard
                                    key={d._id}
                                    design={d}
                                    onDelete={handleDelete}
                                    onFavourite={handleFavourite}
                                />
                            ))}
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}
