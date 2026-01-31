import React, { useState } from 'react';

interface DbmlMessageProps {
  dbmlCode: string;
  version: string;
  onClick: () => void;
  isActive?: boolean;
}

const DbmlMessage = ({ dbmlCode, version, onClick, isActive = true }: DbmlMessageProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const activeStyles = isActive
    ? 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200 dark:border-emerald-800 hover:shadow-lg hover:scale-[1.02]'
    : 'bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950/30 dark:to-gray-950/30 border-slate-200 dark:border-slate-700 hover:shadow-md hover:scale-[1.01] opacity-75';

  const indicatorStyles = isActive
    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 animate-pulse'
    : 'bg-gradient-to-r from-slate-400 to-gray-400';

  const textStyles = isActive
    ? 'text-emerald-700 dark:text-emerald-300'
    : 'text-slate-600 dark:text-slate-400';

  const badgeStyles = isActive
    ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
    : 'bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400';

  const iconStyles = isActive
    ? 'text-emerald-600 dark:text-emerald-400'
    : 'text-slate-500 dark:text-slate-500';

  const codeStyles = isActive
    ? 'text-emerald-400 dark:text-emerald-300'
    : 'text-slate-400 dark:text-slate-500';

  return (
    <div
      className={`${activeStyles} border p-4 rounded-xl mb-3 max-w-[85%] cursor-pointer transition-all duration-200 group`}
      onClick={onClick}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 ${indicatorStyles} rounded-full`}></div>
          <span className={`text-xs ${badgeStyles} px-2 py-1 rounded-full font-mono font-semibold`}>
            v{version}
          </span>
          <span className={`text-sm font-semibold ${textStyles}`}>DBML Code</span>
        </div>
        <button
          onClick={toggleExpanded}
          className={`${iconStyles} hover:bg-slate-100 dark:hover:bg-slate-800 transition-all px-3 py-1.5 rounded-md flex items-center gap-2 text-xs font-medium`}
          title={isExpanded ? 'Hide code' : 'Show code'}>
          <span>{isExpanded ? 'Hide' : 'Show'}</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={isExpanded ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'}
            />
          </svg>
        </button>
      </div>

      {isExpanded && (
        <div className="bg-slate-900 dark:bg-slate-950 rounded-lg p-3 font-mono text-sm overflow-x-auto animate-in slide-in-from-top-2 duration-200">
          <pre className={`${codeStyles} whitespace-pre-wrap`}>{dbmlCode}</pre>
        </div>
      )}
    </div>
  );
};

export default DbmlMessage;
