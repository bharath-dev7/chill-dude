import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import {
    ArrowLeft, CheckCircle2, Circle, Clock, Flame, Lock, PlayCircle,
    Shield, Headset, CloudRain, Library, ListTodo, Activity, AlertTriangle,
    BatteryMedium, TrendingUp, Pause, Play, RotateCcw, Music
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, Legend } from 'recharts';

// --- MOCK DATA --- //
const mockTasks = [
    { id: 1, name: 'Physics Lab Report', subject: 'Physics', deadline: 'Today, 11:59 PM', priority: 'High', completed: false },
    { id: 2, name: 'Calculus Assignment 4', subject: 'Math', deadline: 'Tomorrow, 5:00 PM', priority: 'Medium', completed: false },
    { id: 3, name: 'Read Chapter 5', subject: 'History', deadline: 'Friday', priority: 'Low', completed: true },
];

const mockProductivityData = [
    { day: 'Mon', focus: 2 },
    { day: 'Tue', focus: 3.5 },
    { day: 'Wed', focus: 1.5 },
    { day: 'Thu', focus: 4 },
    { day: 'Fri', focus: 2.5 },
    { day: 'Sat', focus: 5 },
    { day: 'Sun', focus: 3 },
];

const pieData = [
    { name: 'Completed', value: 3 },
    { name: 'Pending', value: 2 },
];
const pieColors = ['#3B82F6', '#1E293B'];

const sounds = [
    { id: 1, name: 'Binaural Beats', icon: <Activity className="w-5 h-5" />, rec: true },
    { id: 2, name: 'White Noise', icon: <Headset className="w-5 h-5" />, rec: false },
    { id: 3, name: 'Rain Sound', icon: <CloudRain className="w-5 h-5" />, rec: false },
    { id: 4, name: 'Library Ambience', icon: <Library className="w-5 h-5" />, rec: true },
];

const FocusPage = () => {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState(mockTasks);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Pomodoro State
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [isBreak, setIsBreak] = useState(false);
    const [notifications, setNotifications] = useState(true);
    const isBreakRef = useRef(false);
    const notificationsRef = useRef(true);

    // Extra Features State
    const [blockerActive, setBlockerActive] = useState(false);
    const [lockMode, setLockMode] = useState(false);

    // Time formatting
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        isBreakRef.current = isBreak;
    }, [isBreak]);

    useEffect(() => {
        notificationsRef.current = notifications;
    }, [notifications]);

    const formatTime = (date) => date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const formatDate = (date) => date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    // Pomodoro Logic
    useEffect(() => {
        if (!isActive) return undefined;

        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev > 1) return prev - 1;

                const wasBreak = isBreakRef.current;
                if (notificationsRef.current) {
                    alert(wasBreak ? "Break is over! Time to focus." : "Focus session complete! Take a 5 min break.");
                }

                const nextIsBreak = !wasBreak;
                isBreakRef.current = nextIsBreak;
                setIsBreak(nextIsBreak);
                setIsActive(false);
                return nextIsBreak ? 5 * 60 : 25 * 60;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isActive]);

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(isBreak ? 5 * 60 : 25 * 60);
    };
    const formatTimer = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const toggleTask = (id) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    return (
        <div className={`min-h-screen relative font-sans transition-all duration-500 ${lockMode ? 'bg-[#0F172A] text-slate-300' : 'bg-slate-50 text-slate-800'}`}>

            {/* Background Grid Pattern */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

            {/* Absolute Brand Logo (Hidden in Lock Mode to reduce distractions) */}
            {!lockMode && (
                <div className="absolute top-6 left-6 md:top-8 md:left-8 z-50">
                    <Logo />
                </div>
            )}

            <div className="relative z-10 p-4 md:p-8 pt-24 md:pt-28 max-w-7xl mx-auto space-y-6">

                {/* --- TOP SECTION --- */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        {!lockMode && (
                            <button onClick={() => navigate('/dashboard')} className="p-3 bg-white rounded-xl shadow-sm hover:bg-slate-50 transition-colors border border-slate-200 text-slate-600">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                        )}
                        <div>
                            <h1 className={`text-3xl font-bold tracking-tight ${lockMode ? 'text-white' : 'text-slate-900'}`}>Focus Mode</h1>
                            <p className={lockMode ? 'text-slate-400' : 'text-slate-500'}>Let’s get things done.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className={`text-right ${lockMode ? 'text-slate-300' : 'text-slate-600'}`}>
                            <div className="text-xl font-semibold font-mono tracking-tighter">{formatTime(currentTime)}</div>
                            <div className="text-sm">{formatDate(currentTime)}</div>
                        </div>

                        {/* Extras: Streak */}
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${lockMode ? 'bg-slate-800 border-slate-700' : 'bg-orange-50 border-orange-100 text-orange-600'}`}>
                            <Flame className="w-5 h-5 text-orange-500" />
                            <span className="font-bold">12 Days</span>
                        </div>
                    </div>
                </header>

                {/* --- MAIN GRID --- */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* LEFT COLUMN: Tasks, Plan, Radar, Energy */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* Lock Mode / Distraction Toggle */}
                        <div className="flex gap-4">
                            <button
                                onClick={() => setLockMode(!lockMode)}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${lockMode ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20' : 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 shadow-sm'}`}
                            >
                                <Lock className="w-4 h-4" />
                                {lockMode ? 'Unlock Focus Mode' : 'Lock Focus Mode'}
                            </button>
                            <button
                                onClick={() => setBlockerActive(!blockerActive)}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all border ${blockerActive ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                            >
                                <Shield className={`w-4 h-4 ${blockerActive ? 'text-emerald-500' : ''}`} />
                                {blockerActive ? 'Distractions Blocked' : 'Enable Blocker'}
                            </button>
                        </div>

                        {/* SECTION 7: Energy-Aware Adjustment */}
                        <div className={`p-4 rounded-xl border flex items-start gap-4 ${lockMode ? 'bg-slate-800/50 border-slate-700/50 text-slate-300' : 'bg-blue-50 border-blue-100 text-blue-800'}`}>
                            <BatteryMedium className={`w-6 h-6 shrink-0 mt-0.5 ${lockMode ? 'text-blue-400' : 'text-blue-600'}`} />
                            <div>
                                <h3 className="font-semibold mb-1">Energy-Aware Suggestion</h3>
                                <p className="text-sm opacity-90">You seem tired. Recommended session length is reduced to 25 minutes with longer 10-minute breaks to avoid burnout.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* SECTION 1: Today's Tasks */}
                            <section className={`p-6 rounded-[2rem] border shadow-sm ${lockMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-100'}`}>
                                <div className="flex items-center gap-2 mb-6">
                                    <ListTodo className="w-5 h-5 text-blue-500" />
                                    <h2 className={`text-lg font-bold ${lockMode ? 'text-white' : 'text-slate-900'}`}>Priority Tasks</h2>
                                </div>
                                <div className="space-y-3">
                                    {tasks.map(task => (
                                        <div key={task.id} className={`p-4 rounded-2xl border transition-all ${task.completed ? 'opacity-50 grayscale' : ''} ${task.priority === 'High' && !task.completed ? (lockMode ? 'border-red-900/50 bg-red-900/10' : 'border-red-200 bg-red-50') : (lockMode ? 'border-slate-700 bg-slate-800/80' : 'border-slate-100 bg-slate-50')}`}>
                                            <div className="flex items-start gap-3">
                                                <button onClick={() => toggleTask(task.id)} className="mt-1 shrink-0">
                                                    {task.completed ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Circle className="w-5 h-5 text-slate-400" />}
                                                </button>
                                                <div className="flex-1">
                                                    <h3 className={`font-semibold ${lockMode ? 'text-white' : 'text-slate-900'} ${task.completed ? 'line-through opacity-70' : ''}`}>{task.name}</h3>
                                                    <div className="flex items-center gap-3 mt-2 text-xs">
                                                        <span className="px-2 py-0.5 bg-white/50 rounded-md font-medium">{task.subject}</span>
                                                        <span className="flex items-center gap-1 opacity-70"><Clock className="w-3 h-3" /> {task.deadline}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* SECTION 2: Smart Study Plan */}
                            <section className={`p-6 rounded-[2rem] border shadow-sm flex flex-col ${lockMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-100'}`}>
                                <div className="flex items-center gap-2 mb-6">
                                    <TrendingUp className="w-5 h-5 text-indigo-500" />
                                    <h2 className={`text-lg font-bold ${lockMode ? 'text-white' : 'text-slate-900'}`}>Adaptive Plan</h2>
                                </div>
                                <div className="relative flex-1">
                                    {/* Vertical Line */}
                                    <div className={`absolute left-[15px] top-2 bottom-2 w-0.5 ${lockMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>

                                    <div className="space-y-6 relative">
                                        <div className="flex gap-4 relative z-10">
                                            <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-900 flex items-center justify-center shrink-0 shadow-sm text-xs font-bold">1</div>
                                            <div className="pt-1.5">
                                                <h4 className={`font-semibold text-sm ${lockMode ? 'text-white' : 'text-slate-900'}`}>Physics Deep Dive</h4>
                                                <p className={`text-xs mt-1 ${lockMode ? 'text-slate-400' : 'text-slate-500'}`}>25m focus • Physics Lab</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 relative z-10">
                                            <div className="w-8 h-8 rounded-full bg-blue-500 text-slate-900 flex items-center justify-center shrink-0 shadow-sm text-xs font-bold">2</div>
                                            <div className="pt-1.5">
                                                <h4 className={`font-semibold text-sm ${lockMode ? 'text-white' : 'text-slate-900'}`}>Buffer Break</h4>
                                                <p className={`text-xs mt-1 ${lockMode ? 'text-slate-400' : 'text-slate-500'}`}>10m • Hydrate & Stretch</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 relative z-10">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm text-xs font-bold border-2 ${lockMode ? 'border-slate-600 bg-slate-800 text-slate-400' : 'border-slate-200 bg-white text-slate-400'}`}>3</div>
                                            <div className="pt-1.5">
                                                <h4 className={`font-semibold text-sm ${lockMode ? 'text-white' : 'text-slate-900'}`}>Math Practice</h4>
                                                <p className={`text-xs mt-1 ${lockMode ? 'text-slate-400' : 'text-slate-500'}`}>25m focus • Calculus</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* SECTION 6: Urgency Overview (Redesigned) */}
                        <section className={`p-6 rounded-[2rem] border shadow-sm ${lockMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-100'}`}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="w-6 h-6 text-red-500" />
                                    <h2 className={`text-xl font-bold ${lockMode ? 'text-white' : 'text-slate-900'}`}>Urgency Overview</h2>
                                </div>
                                <span className="text-sm font-semibold text-red-600 bg-red-50 px-3 py-1.5 rounded-xl border border-red-100 flex items-center gap-1.5">
                                    <Flame className="w-4 h-4" />
                                    2 tasks due within 48 hours
                                </span>
                            </div>

                            <div className="space-y-4">
                                {/* Task 1: Due Today */}
                                <div className={`p-4 rounded-2xl border transition-colors ${lockMode ? 'border-slate-700 bg-slate-800/80 hover:bg-slate-800' : 'border-slate-100 bg-slate-50 hover:bg-slate-100/50'}`}>
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className={`font-semibold ${lockMode ? 'text-white' : 'text-slate-900'}`}>Physics Lab Report</h3>
                                        <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 px-2.5 py-1 rounded-md">Due Today</span>
                                    </div>
                                    <div className={`h-2.5 w-full rounded-full overflow-hidden ${lockMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                                        <div className="h-full bg-red-500 w-[95%] rounded-full relative">
                                            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Task 2: Due Tomorrow */}
                                <div className={`p-4 rounded-2xl border transition-colors ${lockMode ? 'border-slate-700 bg-slate-800/80 hover:bg-slate-800' : 'border-slate-100 bg-slate-50 hover:bg-slate-100/50'}`}>
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className={`font-semibold ${lockMode ? 'text-white' : 'text-slate-900'}`}>Calculus Assignment</h3>
                                        <span className="text-xs font-bold text-orange-600 bg-orange-50 border border-orange-100 px-2.5 py-1 rounded-md">Due Tomorrow</span>
                                    </div>
                                    <div className={`h-2.5 w-full rounded-full overflow-hidden ${lockMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                                        <div className="h-full bg-orange-500 w-[70%] rounded-full"></div>
                                    </div>
                                </div>

                                {/* Task 3: Due Later */}
                                <div className={`p-4 rounded-2xl border transition-colors ${lockMode ? 'border-slate-700 bg-slate-800/80 hover:bg-slate-800' : 'border-slate-100 bg-slate-50 hover:bg-slate-100/50'}`}>
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className={`font-semibold ${lockMode ? 'text-white' : 'text-slate-900'}`}>History Reading</h3>
                                        <span className="text-xs font-bold text-yellow-600 bg-yellow-50 border border-yellow-100 px-2.5 py-1 rounded-md">Due Friday</span>
                                    </div>
                                    <div className={`h-2.5 w-full rounded-full overflow-hidden ${lockMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                                        <div className="h-full bg-yellow-400 w-[30%] rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* RIGHT COLUMN: Pomodoro, Visuals, Sounds */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* SECTION 5: Pomodoro Timer (Redesigned) */}
                        <section className={`p-8 rounded-[2.5rem] border shadow-xl flex flex-col items-center justify-center text-center relative overflow-hidden ${lockMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
                            {isActive && <div className="absolute inset-0 bg-blue-500/10 blur-3xl animate-pulse rounded-full scale-150"></div>}

                            <div className="relative z-10 w-full flex flex-col items-center">
                                <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold mb-10 shadow-sm border ${lockMode ? 'bg-white/10 border-white/10 text-white' : 'bg-slate-100 border-slate-200 text-slate-700'}`}>
                                    <Clock className="w-4 h-4 text-blue-500" />
                                    {isBreak ? 'Break Time' : 'Deep Focus'}
                                </div>

                                {/* Circular Progress Ring + Timer */}
                                <div className="relative w-64 h-64 flex items-center justify-center mb-10">
                                    <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                                        <circle cx="128" cy="128" r="120" stroke="currentColor" strokeWidth="8" fill="transparent" className={lockMode ? "text-slate-700" : "text-slate-100"} />
                                        <circle
                                            cx="128" cy="128" r="120" stroke="currentColor" strokeWidth="8" fill="transparent"
                                            className={`transition-all duration-1000 ease-linear ${isBreak ? 'text-emerald-500' : 'text-blue-500'}`}
                                            strokeDasharray="754"
                                            strokeDashoffset={754 - (754 * (timeLeft / (isBreak ? 5 * 60 : 25 * 60)))}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className={`text-6xl md:text-7xl font-black font-mono tracking-tighter tabular-nums ${lockMode ? 'text-white drop-shadow-2xl' : 'text-slate-900 drop-shadow-md'}`}>
                                        {formatTimer(timeLeft)}
                                    </div>
                                </div>

                                {/* Controls */}
                                <div className="flex items-center gap-4 w-full max-w-xs">
                                    <button
                                        onClick={toggleTimer}
                                        className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-lg transition-all active:scale-95 shadow-lg ${isActive ? 'bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-amber-500/20' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/30'}`}
                                    >
                                        {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                                        {isActive ? 'Pause' : 'Start'}
                                    </button>
                                    <button onClick={resetTimer} className={`p-4 rounded-2xl transition-colors border ${lockMode ? 'bg-white/10 hover:bg-white/20 border-white/10 text-slate-200' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'}`} title="Reset Timer">
                                        <RotateCcw className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className={`mt-8 flex items-center gap-3 text-sm font-medium px-4 py-2 rounded-xl border ${lockMode ? 'bg-white/5 opacity-80' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                                    <input
                                        type="checkbox"
                                        id="notif"
                                        checked={notifications}
                                        onChange={() => setNotifications(!notifications)}
                                        className={`w-4 h-4 rounded focus:ring-blue-500 focus:ring-offset-0 ${lockMode ? 'border-white/30 bg-transparent' : 'border-slate-300 bg-white'}`}
                                    />
                                    <label htmlFor="notif" className="cursor-pointer select-none">Sound notifications</label>
                                </div>
                            </div>
                        </section>

                        {/* SECTION 3: Progress Visuals (Redesigned) */}
                        <section className={`p-8 rounded-[2rem] border shadow-sm ${lockMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-100'}`}>
                            <div className="mb-6">
                                <h2 className={`text-xl font-bold mb-1 ${lockMode ? 'text-white' : 'text-slate-900'}`}>Weekly Productivity Trend</h2>
                                <p className={`text-sm font-medium ${lockMode ? 'text-emerald-400' : 'text-emerald-600'}`}>↑ You are improving compared to last week.</p>
                            </div>

                            {/* Fixed height container for Recharts */}
                            <div className="h-64 w-full mb-8">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={mockProductivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={lockMode ? 0.3 : 0.2} />
                                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={lockMode ? '#334155' : '#E2E8F0'} />
                                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: lockMode ? '#94A3B8' : '#64748B', fontSize: 12 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: lockMode ? '#94A3B8' : '#64748B', fontSize: 12 }} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: lockMode ? '1px solid #334155' : '1px solid #E2E8F0', backgroundColor: lockMode ? '#1E293B' : '#fff', color: lockMode ? '#fff' : '#000', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                            itemStyle={{ color: '#3B82F6', fontWeight: 'bold' }}
                                        />
                                        <Legend verticalAlign="top" height={36} iconType="circle" formatter={() => <span style={{ color: lockMode ? '#CBD5E1' : '#475569', fontWeight: 500 }}>Focus Hours</span>} />
                                        <Area type="monotone" name="Focus Hours" dataKey="focus" stroke="#3B82F6" strokeWidth={4} fillOpacity={1} fill="url(#colorFocus)" activeDot={{ r: 6, fill: '#3B82F6', stroke: '#fff', strokeWidth: 2 }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="flex items-center gap-6 pt-6 border-t border-slate-100 dark:border-slate-700/50">
                                <div className="h-20 w-20 shrink-0">
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie data={pieData} innerRadius={28} outerRadius={38} paddingAngle={4} dataKey="value" stroke="none">
                                                {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={pieColors[index]} />)}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div>
                                    <div className="text-sm font-semibold opacity-70 mb-1 text-slate-500">Completion Rate</div>
                                    <div className={`text-3xl font-black font-mono ${lockMode ? 'text-white' : 'text-slate-900'}`}>60%</div>
                                </div>
                            </div>
                        </section>

                        {/* SECTION 4: Focus Sounds */}
                        <section className={`p-6 rounded-[2rem] border shadow-sm ${lockMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-100'}`}>
                            <div className="flex items-center gap-2 mb-4">
                                <Music className="w-5 h-5 text-indigo-500" />
                                <h2 className={`text-lg font-bold ${lockMode ? 'text-white' : 'text-slate-900'}`}>Soundscapes</h2>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {sounds.map(sound => (
                                    <div key={sound.id} className={`p-3 rounded-xl border flex flex-col cursor-pointer transition-all hover:-translate-y-1 ${lockMode ? 'bg-slate-800 border-slate-600 hover:border-blue-500' : 'bg-slate-50 border-slate-200 hover:border-blue-400 hover:shadow-md'}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <div className={`p-2 rounded-lg ${lockMode ? 'bg-slate-700 text-slate-300' : 'bg-white text-slate-600 shadow-sm'}`}>
                                                {sound.icon}
                                            </div>
                                            {sound.rec && <span className="w-2 h-2 rounded-full bg-blue-500"></span>}
                                        </div>
                                        <h3 className={`text-sm font-semibold leading-tight ${lockMode ? 'text-white' : 'text-slate-900'}`}>{sound.name}</h3>
                                    </div>
                                ))}
                            </div>
                        </section>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default FocusPage;
