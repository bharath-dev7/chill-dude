import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Book, ChevronDown, ChevronUp, Save, Sparkles } from 'lucide-react';
import Logo from '../components/Logo';

const mockEntries = [
    {
        id: 1,
        date: 'Feb 26, 2026',
        preview: 'Today was exhausting but I managed to finish my lab...',
        fullText: 'Today was exhausting but I managed to finish my lab report and prepare for the upcoming test. Feeling a bit burned out but proud of the productivity.',
        emojis: ['😴', '😟', '📚'],
        summary: 'Tired but Productive'
    },
    {
        id: 2,
        date: 'Feb 25, 2026',
        preview: 'Woke up feeling refreshed and had a great morning...',
        fullText: 'Woke up feeling refreshed and had a great morning workout. The rest of the day was pretty calm and I got some reading done. Hoping to keep this momentum.',
        emojis: ['😌', '⚡', '📖'],
        summary: 'Calm and Focused'
    },
    {
        id: 3,
        date: 'Feb 24, 2026',
        preview: 'Very stressed about the upcoming calculus exam...',
        fullText: 'Very stressed about the upcoming calculus exam. Could not sleep well last night. Need to take a break and breathe. I should try the Relax mode.',
        emojis: ['😟', '🌪️', '📉'],
        summary: 'High Stress, Poor Sleep'
    }
];

const JournalPage = () => {
    const navigate = useNavigate();
    const [newText, setNewText] = useState('');
    const [expandedIdeaId, setExpandedIdeaId] = useState(null);

    const toggleExpand = (id) => {
        setExpandedIdeaId(expandedIdeaId === id ? null : id);
    };

    return (
        <div className="min-h-screen relative bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-4 md:p-8 pt-20 md:pt-24 font-sans text-slate-800">
            {/* Absolute Brand Logo */}
            <div className="absolute top-6 left-6 md:top-8 md:left-8 z-50">
                <Logo />
            </div>

            {/* Header */}
            <div className="max-w-4xl mx-auto mb-10 flex items-center relative">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="p-3 rounded-full bg-white/60 hover:bg-white shadow-sm border border-slate-100 transition-all active:scale-95 absolute left-0"
                >
                    <ArrowLeft className="w-6 h-6 text-slate-600" />
                </button>
                <div className="text-center w-full">
                    <h1 className="text-4xl font-bold text-slate-800 tracking-tight font-serif mb-2">Your Journal</h1>
                    <p className="text-slate-500">Reflect. Understand. Improve.</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto space-y-8">

                {/* NEW ENTRY SECTION */}
                <section className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 shadow-sm border border-white/50">
                    <div className="flex items-center gap-3 mb-4">
                        <Book className="w-6 h-6 text-blue-500" />
                        <h2 className="text-xl font-semibold text-slate-800 tracking-tight">How are you feeling right now?</h2>
                    </div>
                    <div className="relative">
                        <textarea
                            value={newText}
                            onChange={(e) => setNewText(e.target.value)}
                            placeholder="Pour your thoughts here..."
                            className="w-full h-40 resize-none rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all placeholder:text-slate-400 text-lg"
                        />
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white shadow-md transition-all active:scale-95 ${newText.trim() ? 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 shadow-blue-200' : 'bg-blue-300 cursor-not-allowed'
                                }`}
                        >
                            <Save className="w-5 h-5" />
                            Save Entry
                        </button>
                    </div>
                </section>

                {/* PREVIOUS ENTRIES SECTION */}
                <section>
                    <h2 className="text-xl font-bold text-slate-800 mb-6 pl-2 relative">
                        Previous Entries
                        <span className="absolute -left-2 top-1.5 w-2 h-2 rounded-full bg-indigo-400"></span>
                    </h2>

                    <div className="space-y-4">
                        {mockEntries.map((entry) => {
                            const isExpanded = expandedIdeaId === entry.id;
                            return (
                                <div key={entry.id} className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1.5 text-2xl tracking-widest bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-100">
                                                {entry.emojis.map((em, i) => <span key={i}>{em}</span>)}
                                            </div>
                                            <div className="text-sm font-semibold text-slate-400">
                                                {entry.date}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => toggleExpand(entry.id)}
                                            className="p-2 rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                                        >
                                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                        </button>
                                    </div>

                                    <div className="mb-4">
                                        <p className="text-slate-700 leading-relaxed">
                                            {isExpanded ? entry.fullText : entry.preview}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm">
                                        <Sparkles className="w-4 h-4 text-indigo-400" />
                                        <span className="font-medium text-slate-500">Emotion Summary:</span>
                                        <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">{entry.summary}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

            </div>
        </div>
    );
};

export default JournalPage;
