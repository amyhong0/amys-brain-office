'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AgentState } from '@/lib/agents/types';

interface ZoneConfig {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

interface PixelCharacterProps {
  x: number;
  y: number;
  zone: ZoneConfig;
  agent: AgentState | undefined;
  onClick: () => void;
}

export default function PixelCharacter({ x, y, zone, agent, onClick }: PixelCharacterProps) {
  const isWorking = agent?.status === 'working';
  
  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: 10,
      }}
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      animate={isWorking ? { y: [0, -2, 0] } : {}}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <div className="relative">
        {/* Shadow */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 translate-y-1 w-6 h-1.5 rounded-full" style={{
          background: 'radial-gradient(ellipse, rgba(0, 0, 0, 0.35), transparent)',
        }} />
        
        {/* Pixel art character body */}
        <div 
          className="relative"
          style={{
            filter: isWorking ? `drop-shadow(0 0 8px ${zone.color}88)` : 'none',
          }}
        >
          {/* Head */}
          <div 
            className="w-6 h-6 mx-auto mb-0.5"
            style={{
              background: isWorking ? zone.color : '#8B7355',
              border: '1px solid rgba(0,0,0,0.3)',
              imageRendering: 'pixelated',
            }}
          />
          
          {/* Body */}
          <div 
            className="w-5 h-4 mx-auto mb-0.5"
            style={{
              background: isWorking ? `${zone.color}dd` : '#6B5344',
              border: '1px solid rgba(0,0,0,0.3)',
              imageRendering: 'pixelated',
            }}
          />
          
          {/* Legs */}
          <div className="flex justify-center gap-0.5">
            <div 
              className="w-1.5 h-2"
              style={{
                background: isWorking ? `${zone.color}cc` : '#5A4535',
                border: '1px solid rgba(0,0,0,0.3)',
                imageRendering: 'pixelated',
              }}
            />
            <div 
              className="w-1.5 h-2"
              style={{
                background: isWorking ? `${zone.color}cc` : '#5A4535',
                border: '1px solid rgba(0,0,0,0.3)',
                imageRendering: 'pixelated',
              }}
            />
          </div>
        </div>

        {/* Speech bubble */}
        {isWorking && agent?.currentTask && (
          <motion.div
            className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1.5 text-white text-[10px] font-medium whitespace-nowrap max-w-[180px]"
            style={{
              background: 'linear-gradient(135deg, rgba(45, 25, 60, 0.95), rgba(30, 15, 45, 0.95))',
              border: '1px solid rgba(120, 80, 150, 0.4)',
              boxShadow: '0 3px 10px rgba(0,0,0,0.3)',
              borderRadius: '6px',
            }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {agent.currentTask}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
