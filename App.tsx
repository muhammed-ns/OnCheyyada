import React, { useState, useEffect, useCallback } from 'react';
import { BatteryManager, SystemStatus, LogEntry } from './types';
import { generateSystemMessage } from './services/gemini';
import BatteryReactor from './components/BatteryReactor';
import Terminal from './components/Terminal';
import ControlPanel from './components/ControlPanel';

const App: React.FC = () => {
  const [battery, setBattery] = useState<BatteryManager | null>(null);
  const [status, setStatus] = useState<SystemStatus>(SystemStatus.SCANNING);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [batterySupported, setBatterySupported] = useState(true);
  
  // New state to handle user dismissing the alert
  const [isAlertDismissed, setIsAlertDismissed] = useState(false);

  // Audio for alerts
  const playAlert = useCallback(() => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    // Aggressive sci-fi alert sound
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(440, ctx.currentTime + 0.3);
    osc.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.6);
    
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  }, []);

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [...prev.slice(-10), {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour12: false }),
      message,
      type
    }]);
  };

  const updateStatus = useCallback(async (bt: BatteryManager, forceContext?: 'connect' | 'disconnect' | 'alert') => {
    let currentStatus = SystemStatus.STANDBY;
    let logType: LogEntry['type'] = 'info';
    
    // Reset dismissal if we are charging
    if (bt.charging) {
        setIsAlertDismissed(false);
    }

    if (bt.charging) {
      currentStatus = SystemStatus.CHARGING_NOMINAL;
      logType = 'success';
    } else {
      if (forceContext === 'alert') {
        currentStatus = SystemStatus.POWER_FAILURE_ALERT;
        logType = 'alert';
        // Only play sound if not already dismissed to avoid annoyance
        if (!isAlertDismissed) {
            playAlert();
        }
      } else {
         // Default state when unplugged or idle
         currentStatus = SystemStatus.STANDBY;
      }
    }

    setStatus(currentStatus);

    // AI Message Generation
    const context: 'connect' | 'disconnect' | 'alert' | 'status' = forceContext || (bt.charging ? 'status' : 'status');
    const aiMessage = await generateSystemMessage(bt.level, bt.charging, context);
    addLog(aiMessage, logType);

  }, [playAlert, isAlertDismissed]);

  // Initialize Battery API and Auto-Scan
  useEffect(() => {
    if (!navigator.getBattery) {
      setBatterySupported(false);
      addLog("CRITICAL: BATTERY API UNSUPPORTED ON THIS TERMINAL", 'alert');
      return;
    }

    navigator.getBattery().then((bt) => {
      setBattery(bt);
      addLog(`SYSTEM INITIALIZED. BATTERY LEVEL: ${Math.round(bt.level * 100)}%`);
      
      // --- AUTOMATIC SCANNING SEQUENCE ---
      setStatus(SystemStatus.SCANNING);
      addLog("INITIATING AUTO-DIAGNOSTIC SEQUENCE...", 'info');
      
      setTimeout(async () => {
        if (bt.charging) {
           await updateStatus(bt, 'connect');
        } else {
           // The core feature: If app is opened and not charging, assume user forgot the switch.
           addLog("DIAGNOSTIC COMPLETE: NO POWER FLOW DETECTED", 'alert');
           await updateStatus(bt, 'alert');
        }
      }, 2500); // 2.5 second dramatic scan delay

      // Event Listeners for Real-time updates
      const handleChargingChange = () => {
        if (bt.charging) {
           updateStatus(bt, 'connect');
           addLog("POWER SIGNATURE DETECTED. GRID CONNECTED.", 'success');
        } else {
           updateStatus(bt, 'disconnect');
           addLog("POWER SOURCE SEVERED.", 'alert');
        }
      };

      const handleLevelChange = () => {
        if (bt.level < 0.2 && !bt.charging) {
          addLog(`WARNING: ENERGY RESERVES CRITICAL (${Math.round(bt.level * 100)}%)`, 'alert');
        }
      };

      bt.addEventListener('chargingchange', handleChargingChange);
      bt.addEventListener('levelchange', handleLevelChange);

      return () => {
        bt.removeEventListener('chargingchange', handleChargingChange);
        bt.removeEventListener('levelchange', handleLevelChange);
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const handleDismiss = () => {
      setIsAlertDismissed(true);
      setStatus(SystemStatus.STANDBY);
      addLog("ALARM DEACTIVATED BY USER. SYSTEM IN STANDBY.", 'info');
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex flex-col items-center justify-between p-4 scanlines">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-50"></div>
      
      {/* Header */}
      <header className="w-full text-center mt-8 z-20">
        <h1 className="text-5xl md:text-7xl font-cursive text-white glow-text-white mb-2">
          On Cheyyada!
        </h1>
        <p className="font-scifi text-yellow-400 text-xs md:text-sm tracking-[0.3em] uppercase glow-text-yellow opacity-80">
          Intelligent Power Guardian // System V.1.0
        </p>
      </header>

      {/* Main Display */}
      <main className="w-full max-w-2xl flex-1 flex flex-col items-center justify-center z-20 relative">
        {!batterySupported && (
           <div className="text-red-500 font-mono text-center p-4 border border-red-500 bg-red-900/20 mb-4">
             BROWSER HARDWARE API RESTRICTED. USE CHROME/ANDROID FOR FULL FUNCTIONALITY.
           </div>
        )}
        
        {battery && (
          <BatteryReactor 
            level={battery.level} 
            charging={battery.charging} 
            status={status}
          />
        )}

        {status === SystemStatus.POWER_FAILURE_ALERT && !isAlertDismissed && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-300">
            <h2 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-900 animate-ping opacity-80">
              ALERT
            </h2>
            <div className="mt-8 text-white font-bold font-scifi bg-red-600/20 border border-red-500 px-6 py-4 rounded shadow-[0_0_30px_rgba(220,38,38,0.5)] animate-bounce text-center">
              <div className="text-2xl mb-1">ZERO POWER FLOW</div>
              <div className="text-sm tracking-widest text-red-200">IF CABLE IS CONNECTED, CHECK SWITCH!</div>
            </div>
            
            <button 
                onClick={handleDismiss}
                className="mt-12 px-6 py-3 border border-gray-600 hover:border-white text-gray-400 hover:text-white font-mono text-xs tracking-widest transition-all duration-300 hover:bg-white/10"
            >
                [ IGNORE: CABLE UNPLUGGED ]
            </button>
          </div>
        )}

        <ControlPanel status={status} />
      </main>

      {/* Footer / Terminal */}
      <footer className="w-full max-w-lg mb-8 z-20">
        <Terminal logs={logs} />
      </footer>
    </div>
  );
};

export default App;
