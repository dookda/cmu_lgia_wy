import React from 'react';
import Map from '../components/organisms/Map';

const Home = () => {
    return (
        <div className="flex h-screen w-screen overflow-hidden">
            {/* Sidebar placeholder */}
            <div className="w-80 bg-white shadow-lg z-10 hidden md:flex flex-col border-r border-gray-200">
                <div className="p-4 bg-orange-500 text-white font-bold flex items-center gap-2 shadow-md">
                    <img src="/img/LOGO.png" alt="Logo" className="w-10 h-10 bg-white rounded-full p-1" />
                    <span>LGIA System</span>
                </div>
                <div className="p-4 overflow-y-auto flex-1">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Layers</h3>
                    {/* Layer list will go here */}
                    <div className="text-gray-400 text-sm italic">Connect layer list here...</div>
                </div>
            </div>

            <div className="flex-1 relative">
                <Map />
            </div>
        </div>
    );
};

export default Home;
