import React, { useState } from 'react';
import { X, Save, Anchor } from 'lucide-react';

const AddVesselModal = ({ isOpen, onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        name: '',
        imo: '',
        type: 'Cargo Vessel',
        lat: '',
        lon: '',
        destination: '',
        speed: '',
        status: 'Active'
    });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();

        // Basic Validation
        if (!formData.name || !formData.lat || !formData.lon) return;

        const newVessel = {
            imo: formData.imo || Math.floor(Math.random() * 9000000) + 1000000,
            name: formData.name,
            type: formData.type,
            lat: parseFloat(formData.lat),
            lon: parseFloat(formData.lon),
            speed: parseFloat(formData.speed) || 0,
            course: Math.floor(Math.random() * 360),
            destination: formData.destination || 'Unknown',
            status: formData.status,
            risk_level: 'Low', // Default
            image: `https://source.unsplash.com/400x200/?ship,${formData.type.split(' ')[0]}` // Auto-image
        };

        onAdd(newVessel);
        setFormData({ name: '', imo: '', type: 'Cargo Vessel', lat: '', lon: '', destination: '', speed: '', status: 'Active' }); // Reset
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-cyan-500/50 rounded-lg w-full max-w-md p-6 shadow-[0_0_50px_rgba(6,182,212,0.2)] cyber-panel relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                    <X className="w-6 h-6" />
                </button>

                <h2 className="text-xl font-bold text-cyan-400 mb-6 flex items-center gap-2">
                    <Anchor className="w-5 h-5" /> REGISTER NEW VESSEL
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs text-slate-400 uppercase block mb-1">Vessel Name</label>
                        <input
                            type="text"
                            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:border-cyan-500 outline-none"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-slate-400 uppercase block mb-1">Type</label>
                            <select
                                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white outline-none"
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option>Cargo Vessel</option>
                                <option>Oil Tanker</option>
                                <option>Fishing Vessel</option>
                                <option>Navy Ship</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 uppercase block mb-1">IMO Number (Optional)</label>
                            <input
                                type="number"
                                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white outline-none"
                                value={formData.imo}
                                onChange={e => setFormData({ ...formData, imo: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-slate-400 uppercase block mb-1">Latitude</label>
                            <input
                                type="number" step="any"
                                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white outline-none"
                                value={formData.lat}
                                onChange={e => setFormData({ ...formData, lat: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 uppercase block mb-1">Longitude</label>
                            <input
                                type="number" step="any"
                                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white outline-none"
                                value={formData.lon}
                                onChange={e => setFormData({ ...formData, lon: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-slate-400 uppercase block mb-1">Destination</label>
                            <input
                                type="text"
                                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white outline-none"
                                value={formData.destination}
                                onChange={e => setFormData({ ...formData, destination: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 uppercase block mb-1">Speed (knots)</label>
                            <input
                                type="number"
                                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white outline-none"
                                value={formData.speed}
                                onChange={e => setFormData({ ...formData, speed: e.target.value })}
                            />
                        </div>
                    </div>

                    <button type="submit" className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded flex items-center justify-center gap-2 transition-all mt-4">
                        <Save className="w-4 h-4" /> ADD TO FLEET
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddVesselModal;
