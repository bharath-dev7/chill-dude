import React, { useState } from 'react';
import {
    Headphones,
    Moon,
    Coffee,
    Users,
    Gamepad2,
    Puzzle,
    Dices,
    MonitorPlay,
    Music,
    PlayCircle,
    ArrowLeft,
    Flame,
    Clock,
    Zap,
    Trophy,
    TrendingUp,
    Sparkles,
    Ghost,
    Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';

const categories = [
    { id: 'social', name: 'Social', icon: <Users size={16} /> },
    { id: 'games', name: 'Games', icon: <Gamepad2 size={16} /> },
    { id: 'music', name: 'Music', icon: <Music size={16} /> },
    { id: 'mind', name: 'Mind', icon: <Sparkles size={16} /> },
    { id: 'watch', name: 'Watch', icon: <MonitorPlay size={16} /> },
    { id: 'night', name: 'Night', icon: <Moon size={16} /> },
];

const voiceRooms = [
    { id: 1, name: 'Exam Stress Room', icon: <Headphones className="w-6 h-6" />, participants: 12, color: 'bg-blue-100 text-blue-600' },
    { id: 2, name: 'Late Night Chill', icon: <Moon className="w-6 h-6" />, participants: 8, color: 'bg-indigo-100 text-indigo-600' },
    { id: 3, name: 'Burnout Support', icon: <Coffee className="w-6 h-6" />, participants: 15, color: 'bg-rose-100 text-rose-600' },
    { id: 4, name: 'Casual Hangout', icon: <Users className="w-6 h-6" />, participants: 24, color: 'bg-emerald-100 text-emerald-600' },
];

const games = [
    { id: 1, name: 'Sudoku', icon: <Puzzle className="w-8 h-8" />, type: 'Single Player', color: 'text-indigo-500' },
    { id: 2, name: 'Ludo Express', icon: <Dices className="w-8 h-8" />, type: 'Multiplayer', color: 'text-rose-500' },
    { id: 3, name: 'Space Word', icon: <Gamepad2 className="w-8 h-8" />, type: 'Single Player', color: 'text-emerald-500' },
    { id: 4, name: 'Memory Quest', icon: <Target className="w-8 h-8" />, type: 'Single Player', color: 'text-blue-500' },
    { id: 5, name: 'Zen Blocks', icon: <Puzzle className="w-8 h-8" />, type: 'Puzzle', color: 'text-purple-500' },
    { id: 6, name: 'Brick Breaker', icon: <Gamepad2 className="w-8 h-8" />, type: 'Arcade', color: 'text-orange-500' },
    { id: 7, name: 'Solitaire', icon: <Puzzle className="w-8 h-8" />, type: 'Cards', color: 'text-teal-500' },
    { id: 8, name: 'Snake Pro', icon: <Ghost className="w-8 h-8" />, type: 'Classic', color: 'text-slate-500' },
];

const moodSuggestions = [
    { title: 'Binaural Beats', mood: 'Stressed', reward: '+15 Energy', color: 'bg-orange-50 text-orange-600' },
    { title: '5 Min Walk', mood: 'Bored', reward: '+10 Mood', color: 'bg-blue-50 text-blue-600' },
    { title: 'Sketching', mood: 'Creative', reward: '+20 Focus', color: 'bg-purple-50 text-purple-600' },
    { title: 'Tea Break', mood: 'Tired', reward: '+5 Health', color: 'bg-emerald-50 text-emerald-600' },
];

const trendingNow = {
    room: { name: 'Exam Stress Room', count: '12 online', color: 'bg-blue-100' },
    playlist: { name: 'Midnight Lo-Fi', duration: '45m', color: 'bg-purple-100' },
    game: { name: 'Zen Blocks', plays: '2.4k', color: 'bg-orange-100' }
};

const videos = [
    { id: 1, title: '2-Minute Breathing', duration: '2:00', thumbnail: 'bg-blue-200' },
    { id: 2, title: '5-Minute Meditation', duration: '5:00', thumbnail: 'bg-indigo-200' },
    { id: 3, title: 'Panic Relief', duration: '3:30', thumbnail: 'bg-rose-200' },
];

const RelaxPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('social');

    return (
        <div className="min-h-screen relative bg-gradient-to-br from-lavender-50 via-white to-blue-50 p-4 md:p-8 pt-20 md:pt-24 font-sans text-slate-800 pb-20">

            {/* Absolute Brand Logo */}
            <div className="absolute top-6 left-6 md:top-8 md:left-8 z-50">
                <Logo />
            </div>

            {/* Header */}
            <div className="max-w-7xl mx-auto mb-6 flex flex-col items-center relative">
                <div className="flex items-center w-full relative mb-8">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-3 rounded-full bg-white/60 hover:bg-white shadow-sm border border-slate-100 transition-all active:scale-95 absolute left-0"
                    >
                        <ArrowLeft className="w-6 h-6 text-slate-600" />
                    </button>
                    <div className="text-center w-full">
                        <h1 className="text-4xl font-bold text-slate-800 tracking-tight font-serif mb-2">Relax Mode</h1>
                        <p className="text-slate-500">Take a break. Recharge your mind.</p>
                    </div>
                </div>

                {/* Category Tabs */}
                <div className="flex items-center space-x-2 overflow-x-auto pb-4 no-scrollbar max-w-full px-2">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveTab(cat.id)}
                            className={`flex items-center space-x-2 px-5 py-2.5 rounded-2xl whitespace-nowrap transition-all duration-300 ${activeTab === cat.id
                                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-100 scale-105'
                                : 'bg-white/60 text-slate-500 hover:bg-white border border-transparent hover:border-indigo-100'}`}
                        >
                            {cat.icon}
                            <span className="font-semibold text-sm">{cat.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Column */}
                <div className="lg:col-span-8 space-y-8">

                    {/* NEW SECTION: Chill Based On Your Mood */}
                    <section className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/60">
                        <div className="flex items-center space-x-3 mb-6">
                            <Sparkles className="w-6 h-6 text-orange-400" />
                            <h2 className="text-xl font-bold text-slate-800">Chill Based On Your Mood</h2>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {moodSuggestions.map((sug, i) => (
                                <div key={i} className={`p-5 rounded-3xl border border-white/50 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer ${sug.color} hover:-translate-y-1 group`}>
                                    <div className="text-xs font-bold uppercase tracking-wider opacity-60 mb-1">{sug.mood}</div>
                                    <h3 className="font-bold text-slate-800 mb-3 group-hover:scale-105 transition-transform">{sug.title}</h3>
                                    <div className="text-[10px] font-bold py-1 px-2 bg-white/40 rounded-lg inline-block">{sug.reward}</div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* SECTION: Voice Chat Rooms */}
                    <section className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-sm border border-white/50 transition-all duration-500">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <Headphones className="w-6 h-6 text-indigo-400" />
                                <h2 className="text-xl font-bold text-slate-800">Voice Chat Rooms</h2>
                            </div>
                            <button className="text-sm font-bold text-indigo-500 hover:underline">See all</button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {voiceRooms.map(room => (
                                <div key={room.id} className="group p-5 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex items-center justify-between cursor-pointer">
                                    <div className="flex items-center space-x-4">
                                        <div className={`p-4 rounded-2xl ${room.color} group-hover:rotate-6 transition-all duration-300`}>
                                            {room.icon}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-700">{room.name}</h3>
                                            <p className="text-sm text-slate-400 flex items-center font-medium">
                                                <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse"></span>
                                                {room.participants} listening
                                            </p>
                                        </div>
                                    </div>
                                    <button className="p-3 bg-slate-50 hover:bg-indigo-500 hover:text-white text-slate-400 text-sm font-bold rounded-2xl transition-all active:scale-90">
                                        Join
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* SECTION: Games Zone (Horizontal Scroll) */}
                    <section className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-sm border border-white/50 overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <Gamepad2 className="w-6 h-6 text-emerald-400" />
                                <h2 className="text-xl font-bold text-slate-800">Games Zone</h2>
                            </div>
                            <div className="flex space-x-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                                <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                                <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                            </div>
                        </div>
                        <div className="flex overflow-x-auto space-x-5 pb-4 no-scrollbar -mx-2 px-2 scroll-smooth">
                            {games.map(game => (
                                <div key={game.id} className="min-w-[140px] sm:sm:min-w-[160px] group p-7 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col items-center justify-center text-center cursor-pointer">
                                    <div className={`mb-4 p-4 rounded-3xl bg-slate-50 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 ${game.color}`}>
                                        {game.icon}
                                    </div>
                                    <h3 className="font-bold text-slate-700 mb-1 text-sm">{game.name}</h3>
                                    <span className="text-[10px] px-2 py-1 bg-slate-50 text-slate-400 font-bold rounded-lg uppercase tracking-tight">{game.type}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-4 space-y-8">

                    {/* SIDE WIDGETS: Stats */}
                    <section className="grid grid-cols-2 gap-3 mb-8">
                        <div className="bg-white/80 p-5 rounded-3xl border border-white/50 text-center shadow-sm hover:shadow-md transition-all">
                            <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                                <Flame className="w-5 h-5 text-orange-500" />
                            </div>
                            <div className="text-xl font-black text-slate-800">5</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Day Streak</div>
                        </div>
                        <div className="bg-white/80 p-5 rounded-3xl border border-white/50 text-center shadow-sm hover:shadow-md transition-all">
                            <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                                <Clock className="w-5 h-5 text-blue-500" />
                            </div>
                            <div className="text-xl font-black text-slate-800">45m</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Relaxed Today</div>
                        </div>
                        <div className="col-span-2 bg-indigo-500/5 backdrop-blur-sm p-4 rounded-3xl border border-indigo-100 flex items-center justify-between px-6">
                            <div className="flex items-center space-x-3">
                                <Users className="w-5 h-5 text-indigo-500" />
                                <span className="text-xs font-bold text-indigo-700">1,240 Online</span>
                            </div>
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-6 h-6 rounded-full bg-indigo-200 border-2 border-white"></div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* SECTION: Trending Now */}
                    <section className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-sm border border-white/50">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <TrendingUp className="w-6 h-6 text-indigo-400" />
                                <h2 className="text-xl font-bold text-slate-800">Trending Now</h2>
                            </div>
                            <Zap className="w-4 h-4 text-orange-400 animate-bounce" />
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-4 p-3 rounded-2xl bg-white/60 border border-slate-50 hover:border-indigo-100 transition-colors cursor-pointer group">
                                <div className={`p-3 rounded-2xl ${trendingNow.room.color} text-indigo-600`}>
                                    <Headphones size={20} />
                                </div>
                                <div className="flex-1">
                                    <div className="text-xs font-bold text-indigo-500 uppercase tracking-tighter mb-0.5">Popular Room</div>
                                    <div className="font-bold text-slate-700 text-sm">{trendingNow.room.name}</div>
                                    <div className="text-[10px] text-slate-400">{trendingNow.room.count}</div>
                                </div>
                                <ArrowLeft className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors rotate-180" />
                            </div>
                            <div className="flex items-center space-x-4 p-3 rounded-2xl bg-white/60 border border-slate-50 hover:border-purple-100 transition-colors cursor-pointer group">
                                <div className={`p-3 rounded-2xl ${trendingNow.playlist.color} text-purple-600`}>
                                    <Music size={20} />
                                </div>
                                <div className="flex-1">
                                    <div className="text-xs font-bold text-purple-500 uppercase tracking-tighter mb-0.5">Top Playlist</div>
                                    <div className="font-bold text-slate-700 text-sm">{trendingNow.playlist.name}</div>
                                    <div className="text-[10px] text-slate-400">{trendingNow.playlist.duration} duration</div>
                                </div>
                                <ArrowLeft className="w-4 h-4 text-slate-300 group-hover:text-purple-500 transition-colors rotate-180" />
                            </div>
                            <div className="flex items-center space-x-4 p-3 rounded-2xl bg-white/60 border border-slate-50 hover:border-orange-100 transition-colors cursor-pointer group">
                                <div className={`p-3 rounded-2xl ${trendingNow.game.color} text-orange-600`}>
                                    <Gamepad2 size={20} />
                                </div>
                                <div className="flex-1">
                                    <div className="text-xs font-bold text-orange-500 uppercase tracking-tighter mb-0.5">Hot Game</div>
                                    <div className="font-bold text-slate-700 text-sm">{trendingNow.game.name}</div>
                                    <div className="text-[10px] text-slate-400">{trendingNow.game.plays} plays today</div>
                                </div>
                                <ArrowLeft className="w-4 h-4 text-slate-300 group-hover:text-orange-500 transition-colors rotate-180" />
                            </div>
                        </div>
                    </section>

                    {/* SECTION: Watch Together */}
                    <section className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-sm border border-white/50 relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="flex items-center space-x-3 mb-6">
                                <MonitorPlay className="w-6 h-6 text-blue-400" />
                                <h2 className="text-xl font-bold text-slate-800">Watch Together</h2>
                            </div>

                            <div className="aspect-video bg-slate-100/80 rounded-3xl mb-6 flex flex-col items-center justify-center border border-slate-200/60 shadow-inner group-hover:bg-slate-50 transition-colors overflow-hidden relative">
                                <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <PlayCircle className="w-12 h-12 text-slate-300 mb-2 group-hover:text-blue-400 transition-colors" />
                                <span className="text-sm text-slate-400 font-medium">Waiting for friends...</span>
                            </div>

                            <div className="space-y-3">
                                <button className="w-full py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-95 flex items-center justify-center">
                                    <MonitorPlay className="w-5 h-5 mr-3" />
                                    Start Watch Party
                                </button>
                                <button className="w-full py-3.5 bg-white hover:bg-slate-50 text-indigo-600 font-bold rounded-2xl border border-indigo-100 transition-all active:scale-95 flex items-center justify-center">
                                    <Users className="w-5 h-5 mr-3" />
                                    Invite Friends
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* SECTION: Quick Calm Videos */}
                    <section className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-sm border border-white/50">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-rose-400"></div>
                            Quick Calm
                        </h2>
                        <div className="grid grid-cols-3 gap-3">
                            {videos.map(video => (
                                <div key={video.id} className="group cursor-pointer">
                                    <div className={`aspect-video ${video.thumbnail} rounded-2xl mb-2 flex items-center justify-center relative overflow-hidden`}>
                                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                                        <PlayCircle className="w-8 h-8 text-white/80 group-hover:scale-110 transition-transform shadow-sm" />
                                        <span className="absolute bottom-1 right-1 bg-black/50 text-white text-[9px] px-1.5 py-0.5 rounded-md backdrop-blur-sm font-bold">
                                            {video.duration}
                                        </span>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-600 leading-tight group-hover:text-slate-900 transition-colors line-clamp-2">
                                        {video.title}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
};

export default RelaxPage;
