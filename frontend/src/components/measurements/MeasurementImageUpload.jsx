import React, { useState } from 'react';
import { HiOutlineUpload, HiOutlineX, HiOutlineCamera } from 'react-icons/hi';
import { aiService } from '../../services/aiService.js';
import toast from 'react-hot-toast';

export default function MeasurementImageUpload({ onAnalyzed }) {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (!selected) return;

        if (!selected.type.startsWith('image/')) {
            toast.error('Only image files are supported');
            return;
        }

        if (selected.size > 10 * 1024 * 1024) {
            toast.error('File size must be less than 10MB');
            return;
        }

        setFile(selected);
        setPreview(URL.createObjectURL(selected));
    };

    const clearSelection = () => {
        setFile(null);
        setPreview(null);
    };

    const handleAnalyze = async () => {
        if (!file) return;

        setLoading(true);
        const toastId = toast.loading('Analyzing body proportions with AI...');
        
        try {
            const formData = new FormData();
            formData.append('image', file);
            
            const response = await aiService.analyzeMeasurementImage(formData);
            const measurements = response.data.data;
            
            toast.success('Measurements successfully estimated!', { id: toastId });
            onAnalyzed(measurements);
        } catch (err) {
            console.error('AI Analysis failed', err);
            toast.error(err.response?.data?.message || 'Failed to analyze image. Please try again.', { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card p-5 mb-6 bg-gradient-to-br from-primary-500/5 to-purple-500/5 border-primary-500/20">
            <h3 className="font-display font-semibold text-neutral-800 dark:text-white mb-2 flex items-center gap-2">
                <HiOutlineCamera className="w-5 h-5 text-primary-500" />
                AI Image-Based Measurements
            </h3>
            <p className="text-sm text-slate-500 mb-4 dark:text-slate-400">
                Upload a full-body picture of the customer to automatically estimate standard tailoring measurements using advanced computer vision models.
            </p>

            {!preview ? (
                <div className="border-2 border-dashed border-primary-500/30 rounded-xl p-8 text-center hover:bg-primary-500/5 transition-colors group cursor-pointer relative">
                    <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        disabled={loading}
                    />
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <HiOutlineUpload className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-neutral-800 dark:text-white">Click or drag image to upload</p>
                            <p className="text-xs text-slate-500 mt-1">JPEG, PNG up to 10MB</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="relative rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex justify-center max-h-[300px]">
                        <img src={preview} alt="Upload preview" className="object-contain max-h-[300px]" />
                        <button 
                            onClick={clearSelection}
                            disabled={loading}
                            className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                        >
                            <HiOutlineX className="w-4 h-4" />
                        </button>
                    </div>
                    
                    <div className="flex justify-end gap-3">
                        <button 
                            type="button" 
                            className="btn-secondary" 
                            onClick={clearSelection}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button 
                            type="button" 
                            className="btn-primary" 
                            onClick={handleAnalyze}
                            disabled={loading}
                        >
                            {loading ? 'Processing Image...' : 'Analyze Image with AI'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
