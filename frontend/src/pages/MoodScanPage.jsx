import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const MoodScanPage = () => {
    const navigate = useNavigate();
    const videoRef = useRef(null);

    useEffect(() => {
        let stream = null;

        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Error accessing webcam:", err);
            }
        };

        startCamera();

        const timer = setTimeout(() => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            navigate('/dashboard');
        }, 3000);

        return () => {
            clearTimeout(timer);
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [navigate]);

    return (
        <div className="relative h-screen w-screen bg-black overflow-hidden">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                className="h-full w-full object-cover opacity-80"
            />

            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-[2px]">
                <div className="relative">
                    {/* Scanning Animation Circle */}
                    <div className="w-64 h-64 border-2 border-white/30 rounded-full animate-pulse flex items-center justify-center">
                        <div className="w-48 h-48 border-2 border-blue-400/50 rounded-full animate-ping" />
                    </div>

                    <div className="mt-8 text-center">
                        <h2 className="text-2xl font-semibold text-white tracking-widest uppercase mb-2">Analyzing your mood</h2>
                        <div className="flex justify-center space-x-1">
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MoodScanPage;
