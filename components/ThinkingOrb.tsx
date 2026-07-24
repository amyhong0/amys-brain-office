'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ThinkingOrbProps {
  state?: 'idle' | 'listening' | 'working' | 'thinking';
  size?: number;
  theme?: 'light' | 'dark';
}

export function ThinkingOrb({ state = 'idle', size = 64, theme = 'dark' }: ThinkingOrbProps) {
  const isActive = state === 'working' || state === 'thinking' || state === 'listening';
  const isDark = theme === 'dark';
  
  const colors = {
    idle: isDark ? '#4B5563' : '#9CA3AF',
    listening: '#10B981',
    working: '#8B5CF6',
    thinking: '#F59E0B',
  };

  const color = colors[state] || colors.idle;

  return (
    <div
      style={{
        width: size,
        height: size,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* 외부 링 */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: `2px solid ${color}44`,
        }}
        animate={isActive ? {
          scale: [1, 1.15, 1],
          opacity: [0.5, 0.8, 0.5],
          rotate: [0, 180, 360],
        } : {}}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* 중간 링 */}
      <motion.div
        style={{
          position: 'absolute',
          inset: '15%',
          borderRadius: '50%',
          border: `2px solid ${color}66`,
        }}
        animate={isActive ? {
          scale: [1.1, 1, 1.1],
          opacity: [0.6, 1, 0.6],
          rotate: [360, 180, 0],
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* 내부 구체 */}
      <motion.div
        style={{
          width: '40%',
          height: '40%',
          borderRadius: '50%',
          background: `radial-gradient(circle at 35% 35%, ${color}cc, ${color}66)`,
          boxShadow: isActive ? `0 0 ${size * 0.3}px ${color}44, 0 0 ${size * 0.6}px ${color}22` : 'none',
          zIndex: 2,
        }}
        animate={isActive ? {
          scale: [0.9, 1.1, 0.9],
        } : {
          scale: 1,
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* 빛나는 점들 */}
      {isActive && Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const radius = size * 0.35;
        return (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: 3,
              height: 3,
              borderRadius: '50%',
              background: color,
              left: `calc(50% + ${Math.cos(angle) * radius}px)`,
              top: `calc(50% + ${Math.sin(angle) * radius}px)`,
              transform: 'translate(-50%, -50%)',
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0.5, 1.5, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.25,
            }}
          />
        );
      })}
    </div>
  );
}