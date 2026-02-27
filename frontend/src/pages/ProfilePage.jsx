import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, User as UserIcon, Mail, Phone, BookOpen, GraduationCap,
    Upload, Calendar, Plus, Heart, Activity, AlertCircle, Trash2, Check, Smartphone, Moon
} from 'lucide-react';
import Logo from '../components/Logo';

const ProfilePage = () => {
    const navigate = useNavigate();

    // Mock states for UI interactivity
    const [allowCrisisAlerts, setAllowCrisisAlerts] = useState(true);
    const [enableHealthMood, setEnableHealthMood] = useState(true);
    const [assignments] = useState([
        { id: 1, subject: 'Physics', deadline: '2026-03-01', status: false }
    ]);
    const [contacts] = useState([
        { id: 1, name: 'Mom', phone: '+1 234 567 8900', relation: 'Parent' },
        { id: 2, name: 'Alex', phone: '+1 987 654 3210', relation: 'Friend' }
    ]);

    return (
        <div className="min-h-screen relative bg-gradient-to-br from-slate-50 to-blue-50/50 p-4 md:p-8 pt-20 md:pt-24 font-sans text-slate-800">
            {/* Logo */}
            <div className="absolute top-6 left-6 md:top-8 md:left-8 z-50">
                <Logo />
            </div>

            {/* Header */}
            <div className="max-w-4xl mx-auto mb-10 flex items-center relative">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="p-3 rounded-full bg-white shadow-sm border border-slate-100 hover:bg-slate-50 transition-all active:scale-95 absolute left-0"
                >
                    <ArrowLeft className="w-6 h-6 text-slate-600" />
                </button>
                <div className="text-center w-full">
                    <h1 className="text-4xl font-bold text-slate-800 tracking-tight font-serif mb-2">Profile & Settings</h1>
                    <p className="text-slate-500">Manage your personalized experience.</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto space-y-6">

                {/* 1) PERSONAL INFORMATION */}
                <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <UserIcon className="w-6 h-6 text-blue-500" />
                        Personal Information
                    </h2>

                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Profile Photo Upload */}
                        <div className="flex flex-col items-center gap-3 shrink-0">
                            <div className="w-32 h-32 rounded-full bg-blue-50 border-4 border-white shadow-md flex items-center justify-center relative overflow-hidden group border-dashed border-blue-200">
                                <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Upload className="w-8 h-8 text-blue-600" />
                                </div>
                                <UserIcon className="w-16 h-16 text-blue-200" />
                            </div>
                            <button className="text-sm font-semibold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors">
                                Upload Photo
                            </button>
                        </div>

                        {/* Fields */}
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Full Name</label>
                                <input type="text" defaultValue="Alex Carter" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Email</label>
                                <input type="email" defaultValue="alex@students.edu" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Course / Branch</label>
                                <input type="text" defaultValue="Computer Science" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Year of Study</label>
                                <input type="text" defaultValue="Sophomore (2nd Year)" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">College Name</label>
                                <input type="text" defaultValue="State University of Tech" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2) ACADEMIC SETUP */}
                <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <GraduationCap className="w-6 h-6 text-indigo-500" />
                            Academic Setup
                        </h2>
                    </div>
                    <p className="text-sm text-slate-500 mb-6 font-medium">This information helps generate your personalized focus plan.</p>

                    <div className="space-y-6">
                        {/* A) Timetable Upload */}
                        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                            <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><Calendar className="w-4 h-4" /> Timetable Upload</h3>
                            <div className="border-2 border-dashed border-indigo-200 rounded-xl p-8 text-center bg-white">
                                <Upload className="w-8 h-8 text-indigo-300 mx-auto mb-3" />
                                <p className="text-sm font-medium text-slate-600 mb-4">Drag and drop your class schedule image or PDF here</p>
                                <button className="px-5 py-2.5 bg-indigo-50 text-indigo-600 font-bold rounded-xl border border-indigo-100 hover:bg-indigo-100 transition-colors">
                                    Browse Files
                                </button>
                            </div>
                        </div>

                        {/* B) Syllabus Setup */}
                        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                            <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><BookOpen className="w-4 h-4" /> Syllabus Setup</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-4 p-3 bg-white rounded-xl border border-slate-100">
                                    <div className="flex-1">
                                        <div className="font-semibold text-slate-800">Physics 101</div>
                                        <div className="text-xs text-slate-500 mt-1">4 of 12 Chapters Completed</div>
                                    </div>
                                    <div className="w-32 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500 w-[33%] rounded-full"></div>
                                    </div>
                                    <button className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                </div>

                                <button className="w-full py-3 border-2 border-dashed border-slate-200 text-slate-500 font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-100/50 hover:text-indigo-600 hover:border-indigo-200 transition-all">
                                    <Plus className="w-4 h-4" /> Add Subject
                                </button>
                            </div>
                        </div>

                        {/* C) Assignments Manager */}
                        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                            <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><BookOpen className="w-4 h-4" /> Assignments Manager</h3>
                            <div className="space-y-3">
                                {assignments.map((assignment, index) => (
                                    <div key={index} className="flex flex-col sm:flex-row gap-3 items-center">
                                        <select className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none w-full sm:w-40 text-sm">
                                            <option>Physics</option>
                                            <option>Math</option>
                                        </select>
                                        <input type="text" placeholder="Assignment Title" defaultValue={`Lab Report ${index + 1}`} className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none text-sm w-full" />
                                        <input type="date" defaultValue={assignment.deadline} className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none text-sm w-full sm:w-auto" />
                                        <button className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-emerald-500 transition-colors"><Check className="w-4 h-4" /></button>
                                        <button className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                ))}
                                <button className="w-full py-3 border-2 border-dashed border-slate-200 text-slate-500 font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-100/50 hover:text-indigo-600 hover:border-indigo-200 transition-all">
                                    <Plus className="w-4 h-4" /> Add Assignment
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3) TRUSTED CONTACTS */}
                <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Phone className="w-6 h-6 text-emerald-500" />
                        Trusted Contacts
                    </h2>

                    <div className="space-y-4">
                        {contacts.map((contact) => (
                            <div key={contact.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50">
                                <div>
                                    <h4 className="font-bold text-slate-800">{contact.name} <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md ml-2 border border-emerald-100">{contact.relation}</span></h4>
                                    <p className="text-sm text-slate-500 mt-1">{contact.phone}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="px-3 py-1.5 text-sm font-semibold text-slate-500 bg-white border border-slate-200 rounded-lg hover:text-slate-700">Edit</button>
                                    <button className="p-1.5 text-slate-400 hover:text-red-500 bg-white border border-slate-200 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                        ))}

                        <button className="w-full py-3 border-2 border-dashed border-slate-200 text-emerald-600 font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-50 hover:border-emerald-200 transition-all">
                            <Plus className="w-4 h-4" /> Add New Contact
                        </button>
                    </div>

                    <div className="mt-6 flex items-center justify-between p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                        <div className="flex gap-3 items-center">
                            <AlertCircle className="w-5 h-5 text-emerald-500" />
                            <div>
                                <h4 className="font-semibold text-emerald-900">Allow Crisis Alerts</h4>
                                <p className="text-xs text-emerald-700 opacity-80 mt-0.5">Notify trusted contacts if extreme stress is detected.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setAllowCrisisAlerts(!allowCrisisAlerts)}
                            className={`w-12 h-6 rounded-full relative transition-colors ${allowCrisisAlerts ? 'bg-emerald-500' : 'bg-slate-300'}`}
                        >
                            <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${allowCrisisAlerts ? 'translate-x-6' : 'translate-x-0'}`}></span>
                        </button>
                    </div>
                </section>

                {/* 4) HEALTH INTEGRATION */}
                <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Heart className="w-6 h-6 text-rose-500" />
                        Health Integration
                    </h2>

                    <div className="flex flex-col sm:flex-row gap-6">
                        {/* Connect Button */}
                        <div className="sm:w-1/3 flex flex-col items-center justify-center p-6 border-2 border-slate-100 rounded-2xl bg-slate-50 text-center">
                            <Smartphone className="w-10 h-10 text-rose-400 mb-3" />
                            <h3 className="font-bold text-slate-700 mb-2">Google Fit Sync</h3>
                            <button className="w-full py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl shadow-sm hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2">
                                <Activity className="w-4 h-4" /> Connected
                            </button>
                        </div>

                        {/* Stats Grid */}
                        <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-3">
                            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                                <div className="text-indigo-400 mb-1"><Moon className="w-5 h-5" /></div>
                                <div className="text-2xl font-black text-indigo-900">6.5<span className="text-sm font-semibold opacity-60">h</span></div>
                                <div className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mt-1">Avg Sleep</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                                <div className="text-emerald-400 mb-1"><Activity className="w-5 h-5" /></div>
                                <div className="text-2xl font-black text-emerald-900">8.2<span className="text-sm font-semibold opacity-60">k</span></div>
                                <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mt-1">Daily Steps</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 col-span-2 lg:col-span-1">
                                <div className="text-rose-400 mb-1"><Heart className="w-5 h-5" /></div>
                                <div className="text-2xl font-black text-rose-900">68<span className="text-sm font-semibold opacity-60">bpm</span></div>
                                <div className="text-xs font-semibold text-rose-700 uppercase tracking-wide mt-1">Resting HR</div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between p-4 bg-rose-50/50 rounded-2xl border border-rose-100">
                        <div className="flex gap-3 items-center">
                            <Activity className="w-5 h-5 text-rose-500" />
                            <div>
                                <h4 className="font-semibold text-rose-900">Health-Based Mood Analysis</h4>
                                <p className="text-xs text-rose-700 opacity-80 mt-0.5">Allow AI to use health data to improve focus suggestions.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setEnableHealthMood(!enableHealthMood)}
                            className={`w-12 h-6 rounded-full relative transition-colors shrink-0 ${enableHealthMood ? 'bg-rose-500' : 'bg-slate-300'}`}
                        >
                            <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${enableHealthMood ? 'translate-x-6' : 'translate-x-0'}`}></span>
                        </button>
                    </div>
                </section>

                {/* Save Changes Bottom */}
                <div className="flex justify-end pt-4 mb-16">
                    <button className="px-8 py-3.5 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition-all active:scale-95">
                        Save Changes
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ProfilePage;
