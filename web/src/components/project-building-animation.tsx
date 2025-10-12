'use client';

import { useEffect, useState, useRef } from 'react';
import { Hammer, Anvil } from 'lucide-react';

const ProjectBuildingAnimation = () => {
  const [isHitting, setIsHitting] = useState(false);
  const [sparkVisible, setSparkVisible] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Start the animation cycle
    intervalRef.current = setInterval(() => {
      setIsHitting(true);
      // Show sparks slightly after hammer hits
      setTimeout(() => {
        setSparkVisible(true);
      }, 180);
      // Reset after animation completes
      setTimeout(() => {
        setIsHitting(false);
        setSparkVisible(false);
      }, 700);
    }, 2000);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <div className="relative h-64 w-64 flex items-center justify-center">
        {/* Anvil */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
          <Anvil
            className={`w-20 h-20 text-slate-700 dark:text-slate-300 ${isHitting ? 'animate-anvil-impact' : ''}`}
            strokeWidth={1.5}
          />
        </div>
        {/* Hammer */}
        <div
          className={`absolute ${isHitting ? 'animate-hammer-hit' : 'animate-hammer-ready'}`}
          style={{
            transformOrigin: 'bottom right',
            bottom: '80px',
            right: '35%',
            width: '104px',
            height: '104px'
          }}>
          <Hammer
            className="w-20 h-20 text-slate-700 dark:text-slate-300 absolute top-0 right-0 transform rotate-45"
            strokeWidth={1.5}
          />
        </div>
        {/* Impact effect - multiple sparks */}
        {sparkVisible && (
          <>
            <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2">
              <div className="text-3xl text-yellow-500 font-bold animate-ping-fast">✨</div>
            </div>
          </>
        )}
      </div>
      <div className="mt-10 text-center">
        <p className="text-xl font-medium">Building your project</p>
        <p className="text-base text-muted-foreground">This might take a moment...</p>
      </div>
      <style>{`
        @keyframes hammer-hit {
          0% { 
            transform: rotate(-30deg) translateY(0); 
          }
          25% { 
            transform: rotate(-40deg) translateY(-45px); 
          }
          50% { 
            transform: rotate(10deg) translateY(15px); 
          }
          75% {
            transform: rotate(-15deg) translateY(0);
          }
          100% { 
            transform: rotate(-30deg) translateY(0); 
          }
        }
        
        @keyframes hammer-ready {
          0% { 
            transform: rotate(-30deg) translateY(0); 
          }
          50% {
            transform: rotate(-35deg) translateY(-1px);
          }
          100% { 
            transform: rotate(-30deg) translateY(0); 
          }
        }
        
        @keyframes anvil-impact {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.03);
          }
          100% {
            transform: scale(1);
          }
        }
        
        @keyframes ping-fast {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        
        .animate-hammer-hit {
          animation: hammer-hit 0.8s cubic-bezier(0.22, 1, 0.36, 1);
        }
        
        .animate-hammer-ready {
          animation: hammer-ready 2s ease-in-out infinite;
        }
        
        .animate-anvil-impact {
          animation: anvil-impact 0.4s ease-in-out;
        }
        
        .animate-ping-fast {
          animation: ping-fast 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ProjectBuildingAnimation;
