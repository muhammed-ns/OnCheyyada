import React from 'react';
import { Zap, AlertTriangle } from 'lucide-react';
import { SystemStatus } from '../types';

interface BatteryReactorProps {
  level: number;
  charging: boolean;
  status: SystemStatus;
}

const BatteryReactor: React.FC<BatteryReactorProps> = ({ level, charging, status }) => {
  const percentage = Math.round(level * 100);

  // Determine core color based on status
  let coreColor = 'bg-yellow-400';
  let pulseClass = '';
  let icon = <Zap className="w-12 h-12 text-black animate-pulse" />;
  
  if (status === SystemStatus.POWER_FAILURE_ALERT) {
    coreColor = 'bg-red-600';
    pulseClass = 'animate-ping';
    icon = <AlertTriangle className="w-16 h-16 text-white animate-bounce" />;
  } else if (charging) {
    coreColor = 'bg-green-400';
    pulseClass = 'animate-pulse';
  } else if (percentage < 20) {
    coreColor = 'bg-red-500';
  }

  return (
    <div className="relative w-64 h-64 mx-auto flex items-center justify-center my-8">
      {/* Outer Rings */}
      <div className={`absolute inset-0 border-4 border-dashed rounded-full ${status === SystemStatus.POWER_FAILURE_ALERT ? 'border-red-500 animate-spin' : 'border-gray-700'} duration-[10s]`}></div>
      <div className={`absolute inset-4 border-2 border-dotted rounded-full ${charging ? 'border-yellow-400 animate-spin-slow' : 'border-gray-800'}`}></div>
      
      {/* Core Container */}
      <div className="relative w-40 h-40 bg-gray-900 rounded-full flex items-center justify-center border-4 border-gray-700 shadow-[0_0_30px_rgba(0,0,0,0.8)] overflow-hidden">
        
        {/* Liquid Fill Level */}
        <div 
          className={`absolute bottom-0 w-full transition-all duration-1000 ease-in-out opacity-80 ${coreColor} ${status === SystemStatus.POWER_FAILURE_ALERT ? 'animate-pulse' : ''}`}
          style={{ height: `${percentage}%` }}
        />

        {/* Status Icon & Text Overlay */}
        <div className="z-10 flex flex-col items-center justify-center">
          {status === SystemStatus.POWER_FAILURE_ALERT ? (
             <div className="text-white drop-shadow-md">{icon}</div>
          ) : (
            <>
              {charging && <div className="absolute -top-8">{icon}</div>}
              <span className="text-4xl font-bold font-scifi text-white drop-shadow-md">
                {percentage}%
              </span>
            </>
          )}
        </div>
      </div>
      
      {/* Decorative lines */}
      <div className="absolute -inset-2 border border-yellow-400/20 rounded-full pointer-events-none"></div>
    </div>
  );
};

export default BatteryReactor;