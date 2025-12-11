import React from 'react';
import { Activity, ShieldCheck, ShieldAlert } from 'lucide-react';
import { SystemStatus } from '../types';

interface ControlPanelProps {
  status: SystemStatus;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ status }) => {
  const isAlert = status === SystemStatus.POWER_FAILURE_ALERT;
  const isScanning = status === SystemStatus.SCANNING;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto mt-8">
      <div className="text-center space-y-2">
        <h2 className="text-yellow-400 font-scifi text-sm tracking-widest uppercase border-b border-yellow-400/30 pb-1 inline-block">
          Guardian Protocol
        </h2>
        <p className="text-gray-400 text-xs px-4">
          Automatic detection system active. Monitoring power signature anomalies.
        </p>
      </div>

      <div className={`
          relative w-full py-6 px-8 
          bg-black/40 border-2 
          ${isAlert ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]' : isScanning ? 'border-blue-400 shadow-[0_0_20px_rgba(96,165,250,0.3)]' : 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]'}
          transition-all duration-500
          flex flex-col items-center justify-center gap-2
          overflow-hidden rounded-lg
        `}
      >
        {/* Animated Background Scanline */}
        <div className={`absolute top-0 left-0 w-full h-1 bg-white/20 animate-scanline ${isAlert ? 'duration-75' : 'duration-[3s]'}`}></div>

        <div className="flex items-center gap-3">
          {isAlert ? (
            <ShieldAlert className="w-8 h-8 text-red-500 animate-bounce" />
          ) : isScanning ? (
            <Activity className="w-8 h-8 text-blue-400 animate-spin" />
          ) : (
            <ShieldCheck className="w-8 h-8 text-green-500" />
          )}
          
          <span className={`text-xl font-scifi font-bold tracking-widest ${isAlert ? 'text-red-500 animate-pulse' : isScanning ? 'text-blue-400' : 'text-green-500'}`}>
            {isAlert ? 'POWER FAILURE' : isScanning ? 'SCANNING GRID...' : 'SYSTEM NOMINAL'}
          </span>
        </div>

        <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mt-2">
          {isAlert ? 'ZERO VOLTAGE INPUT DETECTED' : isScanning ? 'ANALYZING INPUT SOURCES' : 'POWER FLOW STABLE'}
        </div>
      </div>

      {/* Decorative Status Bar */}
      <div className="w-full flex justify-between text-[10px] text-gray-500 font-mono border-t border-gray-800 pt-4">
        <span>MODE: AUTO-SENTRY</span>
        <span>LATENCY: 12ms</span>
        <span className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${isScanning ? 'bg-blue-500 animate-ping' : 'bg-green-500'}`}></span> 
          ACTIVE
        </span>
      </div>
      
      <style>{`
        @keyframes scanline {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scanline {
          animation: scanline linear infinite;
        }
      `}</style>
    </div>
  );
};

export default ControlPanel;
