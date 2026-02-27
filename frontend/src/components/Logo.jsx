import React from 'react';
import { Link } from 'react-router-dom';
import logoUrl from '../assets/logo.png';

const Logo = ({ className = "" }) => {
    return (
        <Link to="/dashboard" className={`group flex items-center gap-3 ${className}`}>
            <div className="relative shrink-0 flex items-center justify-center">
                <img
                    src={logoUrl}
                    alt="Chill Dude Logo"
                    className="h-8 md:h-12 w-auto object-contain transition-transform duration-200 hover:scale-105"
                />
            </div>
            <span className="font-semibold text-2xl md:text-3xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                Chill Dude
            </span>
        </Link>
    );
};

export default Logo;
