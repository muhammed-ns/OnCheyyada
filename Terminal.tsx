import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';

interface TerminalProps {
  logs: LogEntry[];
}

const Terminal: React.FC<TerminalProps> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="w-full max-w-lg mx-auto bg-black border border-gray-800 rounded p-4 font-mono text-xs md:text-sm h-48 overflow-y-auto glow-box relative">
      <div className="absolute top-0 right-0 px-2 py-1 bg-yellow-400 text-black font-bold text-[10px]">
        SYS.LOG
      </div>
      <div className="flex flex-col gap-1 mt-2">
        {logs.map((log) => (
          <div key={log.id} className={`${log.type === 'alert' ? 'text-red-500' : log.type === 'success' ? 'text-green-400' : 'text-yellow-400/80'}`}>
            <span className="opacity-50">[{log.timestamp}]</span> {'>'} {log.message}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default Terminal;
