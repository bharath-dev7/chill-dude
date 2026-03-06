import React from 'react';
import { Link } from 'react-router-dom';
import logoUrl from '../assets/logo.png';

const Logo = ({ className = "" }) => {
    return (
        <Link to="/" className={`group inline-flex items-center gap-2.5 ${className}`}>
            <div className="relative shrink-0 flex items-center justify-center">
                <img
                    src={logoUrl}
                    alt="Chill Dude Logo"
                    className="h-7 md:h-8 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
                />
            </div>
            <span className="font-semibold text-lg md:text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-rose-600 via-blue-600 to-indigo-700">
                Chill Dude
            </span>
        </Link>
    );
};

export default Logo;
