import React from 'react';
import { HashLoader } from 'react-spinners';

export function Loader() {
    return (
        <div className="fixed inset-0 bg-white flex flex-col items-center justify-center">
            <div className="flex flex-col items-center space-y-6">
                <div className="flex justify-center mb-0 h-fit items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary">
                        <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                        <path d="M2 17l10 5 10-5"></path>
                        <path d="M2 12l10 5 10-5"></path>
                    </svg>
                    <span className="font-bold text-xl ml-3">FinChat</span>
                </div>
                <HashLoader color="#2563eb" size={50} />
            </div>
        </div>
    );
} 