# UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign wizard space with modern gothic hybrid aesthetic and pixel art characters, and update knowledge graph to match Obsidian graph view style.

**Architecture:** Modify existing React components (wizard-tower.tsx, knowledge-graph.tsx) with new styling and character rendering while preserving all existing functionality and state management.

**Tech Stack:** React, Framer Motion, React Flow, Tailwind CSS, TypeScript

## Global Constraints

- Preserve existing agent state management and spell log functionality
- Maintain React Flow integration for knowledge graph
- Keep responsive design compatibility
- Color palette: #1a1a2e → #16213e (wizard space), #0a0a0f (knowledge graph)
- Node colors: #60a5fa (PDF), #34d399 (Web), #fbbf24 (Image), #8b5cf6 (Default)
- Character style: Pixel art human characters (~32x32 scale)

---

### Task 1: Redesign Wizard Space Background

**Files:**
- Modify: `components/agents/wizard-tower.tsx:128-340`

**Interfaces:**
- Consumes: Existing component structure
- Produces: Updated `MedievalGreatHallBackground` component with modern gothic hybrid styling

- [ ] **Step 1: Update background gradient to modern gothic style**

Replace the existing background gradient in `MedievalGreatHallBackground` function:

```tsx
function MedievalGreatHallBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Modern gothic background gradient */}
      <div className="w-full h-full" style={{
        background: `
          linear-gradient(180deg, 
            rgba(26, 26, 46, 0.95) 0%, 
            rgba(22, 33, 62, 0.9) 50%, 
            rgba(26, 26, 46, 0.95) 100%
          ),
          radial-gradient(ellipse at 50% 30%, rgba(60, 40, 80, 0.1) 0%, transparent 50%)
        `,
      }} />
      
      {/* Minimalist geometric stone pattern */}
      <div className="absolute inset-0" style={{
        backgroundImage: `
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 100px,
            rgba(0, 0, 0, 0.05) 100px,
            rgba(0, 0, 0, 0.05) 102px
          ),
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 80px,
            rgba(0, 0, 0, 0.04) 80px,
            rgba(0, 0, 0, 0.04) 82px
          )
        `,
      }} />
```

- [ ] **Step 2: Update stone pillars to modern vertical lines**

Replace existing stone pillar code with modern vertical line design:

```tsx
      {/* Modern vertical lines with gothic arch hints */}
      <div className="absolute inset-0">
        {/* Left modern pillar */}
        <div className="absolute top-0 left-0 w-16 h-full">
          <div className="w-full h-full" style={{
            background: 'linear-gradient(90deg, rgba(30, 25, 45, 0.6), rgba(25, 20, 40, 0.4), transparent)',
          }} />
          <div className="absolute top-0 left-1 w-14 h-3/4" style={{
            background: 'linear-gradient(180deg, rgba(40, 35, 55, 0.3), rgba(35, 30, 50, 0.2))',
            clipPath: 'polygon(0 0, 100% 0, 100% 70%, 50% 100%, 0 70%)',
            border: '1px solid rgba(80, 60, 100, 0.15)',
          }} />
        </div>
        
        {/* Right modern pillar */}
        <div className="absolute top-0 right-0 w-16 h-full">
          <div className="w-full h-full" style={{
            background: 'linear-gradient(-90deg, rgba(30, 25, 45, 0.6), rgba(25, 20, 40, 0.4), transparent)',
          }} />
          <div className="absolute top-0 right-1 w-14 h-3/4" style={{
            background: 'linear-gradient(180deg, rgba(40, 35, 55, 0.3), rgba(35, 30, 50, 0.2))',
            clipPath: 'polygon(0 0, 100% 0, 100% 70%, 50% 100%, 0 70%)',
            border: '1px solid rgba(80, 60, 100, 0.15)',
          }} />
        </div>
      </div>
```

- [ ] **Step 3: Update windows to modern arched design**

Replace existing window code with simplified modern arched windows:

```tsx
      {/* Modern arched windows with simplified stained glass */}
      <div className="absolute top-4 left-20 w-20 h-36" style={{
        background: 'linear-gradient(180deg, rgba(70, 50, 100, 0.25), rgba(50, 70, 110, 0.2), rgba(70, 50, 100, 0.25))',
        borderRadius: '50% 50% 0 0',
        border: '2px solid rgba(90, 70, 120, 0.3)',
        boxShadow: 'inset 0 0 20px rgba(100, 80, 140, 0.2), 0 0 15px rgba(90, 70, 120, 0.15)',
      }}>
        <div className="absolute inset-2 flex flex-col justify-center items-center gap-1.5">
          <div className="w-8 h-8 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255, 200, 100, 0.3), rgba(255, 150, 50, 0.15))' }} />
          <div className="w-6 h-6 rounded-full" style={{ background: 'radial-gradient(circle, rgba(100, 150, 255, 0.3), rgba(50, 100, 200, 0.15))' }} />
          <div className="w-5 h-5 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255, 100, 150, 0.3), rgba(200, 50, 100, 0.15))' }} />
        </div>
      </div>
      
      <div className="absolute top-4 right-20 w-20 h-36" style={{
        background: 'linear-gradient(180deg, rgba(70, 50, 100, 0.25), rgba(50, 70, 110, 0.2), rgba(70, 50, 100, 0.25))',
        borderRadius: '50% 50% 0 0',
        border: '2px solid rgba(90, 70, 120, 0.3)',
        boxShadow: 'inset 0 0 20px rgba(100, 80, 140, 0.2), 0 0 15px rgba(90, 70, 120, 0.15)',
      }}>
        <div className="absolute inset-2 flex flex-col justify-center items-center gap-1.5">
          <div className="w-8 h-8 rounded-full" style={{ background: 'radial-gradient(circle, rgba(100, 200, 150, 0.3), rgba(50, 150, 100, 0.15))' }} />
          <div className="w-6 h-6 rounded-full" style={{ background: 'radial-gradient(circle, rgba(150, 100, 200, 0.3), rgba(100, 50, 150, 0.15))' }} />
          <div className="w-5 h-5 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255, 180, 100, 0.3), rgba(200, 130, 50, 0.15))' }} />
        </div>
      </div>
```

- [ ] **Step 4: Update candles with neon glow effect**

Replace existing candle code with modern neon glow candles:

```tsx
      {/* Modern candles with neon glow */}
      <div className="absolute bottom-16 left-1/4 transform -translate-x-1/2">
        <div className="flex flex-col items-center">
          {/* Flames with neon glow */}
          <div className="flex gap-2.5 mb-1">
            <div className="w-1.5 h-3.5 rounded-full" style={{
              background: 'radial-gradient(ellipse at bottom, rgba(255, 200, 100, 0.85), rgba(255, 100, 50, 0.5), transparent)',
              boxShadow: '0 0 8px rgba(255, 150, 50, 0.7), 0 0 16px rgba(147, 51, 234, 0.4), 0 0 24px rgba(147, 51, 234, 0.2)',
              animation: 'flicker 0.5s ease-in-out infinite alternate',
            }} />
            <div className="w-1.5 h-4.5 rounded-full" style={{
              background: 'radial-gradient(ellipse at bottom, rgba(255, 220, 120, 0.85), rgba(255, 120, 60, 0.5), transparent)',
              boxShadow: '0 0 10px rgba(255, 160, 60, 0.7), 0 0 20px rgba(147, 51, 234, 0.4), 0 0 30px rgba(147, 51, 234, 0.2)',
              animation: 'flicker 0.6s ease-in-out infinite alternate',
            }} />
            <div className="w-1.5 h-3.5 rounded-full" style={{
              background: 'radial-gradient(ellipse at bottom, rgba(255, 200, 100, 0.85), rgba(255, 100, 50, 0.5), transparent)',
              boxShadow: '0 0 8px rgba(255, 150, 50, 0.7), 0 0 16px rgba(147, 51, 234, 0.4), 0 0 24px rgba(147, 51, 234, 0.2)',
              animation: 'flicker 0.55s ease-in-out infinite alternate',
            }} />
          </div>
          {/* Modern candle holder */}
          <div className="w-2.5 h-7" style={{ background: 'linear-gradient(90deg, rgba(50, 45, 65, 0.85), rgba(70, 65, 85, 0.75), rgba(50, 45, 65, 0.85))' }} />
          <div className="w-5 h-2.5 rounded" style={{ background: 'linear-gradient(180deg, rgba(60, 55, 75, 0.85), rgba(45, 40, 55, 0.75))' }} />
        </div>
      </div>
      
      <div className="absolute bottom-16 right-1/4 transform translate-x-1/2">
        <div className="flex flex-col items-center">
          {/* Flames with neon glow */}
          <div className="flex gap-2.5 mb-1">
            <div className="w-1.5 h-3.5 rounded-full" style={{
              background: 'radial-gradient(ellipse at bottom, rgba(255, 200, 100, 0.85), rgba(255, 100, 50, 0.5), transparent)',
              boxShadow: '0 0 8px rgba(255, 150, 50, 0.7), 0 0 16px rgba(147, 51, 234, 0.4), 0 0 24px rgba(147, 51, 234, 0.2)',
              animation: 'flicker 0.52s ease-in-out infinite alternate',
            }} />
            <div className="w-1.5 h-4.5 rounded-full" style={{
              background: 'radial-gradient(ellipse at bottom, rgba(255, 220, 120, 0.85), rgba(255, 120, 60, 0.5), transparent)',
              boxShadow: '0 0 10px rgba(255, 160, 60, 0.7), 0 0 20px rgba(147, 51, 234, 0.4), 0 0 30px rgba(147, 51, 234, 0.2)',
              animation: 'flicker 0.58s ease-in-out infinite alternate',
            }} />
            <div className="w-1.5 h-3.5 rounded-full" style={{
              background: 'radial-gradient(ellipse at bottom, rgba(255, 200, 100, 0.85), rgba(255, 100, 50, 0.5), transparent)',
              boxShadow: '0 0 8px rgba(255, 150, 50, 0.7), 0 0 16px rgba(147, 51, 234, 0.4), 0 0 24px rgba(147, 51, 234, 0.2)',
              animation: 'flicker 0.54s ease-in-out infinite alternate',
            }} />
          </div>
          {/* Modern candle holder */}
          <div className="w-2.5 h-7" style={{ background: 'linear-gradient(90deg, rgba(50, 45, 65, 0.85), rgba(70, 65, 85, 0.75), rgba(50, 45, 65, 0.85))' }} />
          <div className="w-5 h-2.5 rounded" style={{ background: 'linear-gradient(180deg, rgba(60, 55, 75, 0.85), rgba(45, 40, 55, 0.75))' }} />
        </div>
      </div>
```

- [ ] **Step 5: Simplify decorative elements**

Replace existing decorative elements with simplified silhouettes:

```tsx
      {/* Simplified decorative elements - silhouettes */}
      <div className="absolute bottom-28 left-10 w-10 h-6 rounded" style={{
        background: 'linear-gradient(135deg, rgba(70, 40, 90, 0.4), rgba(55, 30, 75, 0.3))',
        border: '1px solid rgba(100, 70, 120, 0.3)',
        transform: 'rotate(-10deg)',
        boxShadow: '0 3px 6px rgba(0, 0, 0, 0.25)',
      }} />
      
      <div className="absolute bottom-30 right-10 w-8 h-8 rounded" style={{
        background: 'linear-gradient(135deg, rgba(35, 55, 90, 0.4), rgba(25, 45, 75, 0.3))',
        border: '1px solid rgba(70, 90, 120, 0.3)',
        transform: 'rotate(6deg)',
        boxShadow: '0 3px 6px rgba(0, 0, 0, 0.25)',
      }} />
```

- [ ] **Step 6: Update particles to uniform pattern**

Replace existing particle code with uniform floating particles:

```tsx
      {/* Uniform floating particles */}
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: '3px',
            height: '3px',
            left: `${10 + i * 9}%`,
            top: `${20 + (i % 3) * 25}%`,
            background: `radial-gradient(circle, rgba(140, 90, 200, 0.5), rgba(100, 50, 150, 0.3))`,
            boxShadow: `0 0 6px rgba(140, 90, 200, 0.4)`,
            animation: `float ${4 + Math.random() * 1.5}s ease-in-out infinite`,
            animationDelay: `${i * 0.3}s`,
          }}
        />
      ))}
```

- [ ] **Step 7: Update light rays to straight lines**

Replace existing light ray code with straight clean lines:

```tsx
      {/* Straight light rays */}
      <div className="absolute top-0 left-16 w-28 h-full" style={{
        background: 'linear-gradient(180deg, rgba(90, 70, 130, 0.12), transparent 55%)',
        transform: 'skewX(-8deg)',
        pointerEvents: 'none',
      }} />
      <div className="absolute top-0 right-16 w-28 h-full" style={{
        background: 'linear-gradient(180deg, rgba(90, 70, 130, 0.12), transparent 55%)',
        transform: 'skewX(8deg)',
        pointerEvents: 'none',
      }} />
```

- [ ] **Step 8: Test background rendering**

Run: `npm run dev`
Expected: Background renders with modern gothic hybrid styling, no console errors

- [ ] **Step 9: Commit**

```bash
git add components/agents/wizard-tower.tsx
git commit -m "feat: redesign wizard space background to modern gothic hybrid style"
```

---

### Task 2: Create Pixel Art Character Component

**Files:**
- Create: `components/agents/pixel-character.tsx`

**Interfaces:**
- Consumes: Zone configuration, agent state, click handler
- Produces: Pixel art character component with human form

- [ ] **Step 1: Create pixel art character component file**

```tsx
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
```

- [ ] **Step 2: Test component compilation**

Run: `npm run dev`
Expected: Component compiles without errors

- [ ] **Step 3: Commit**

```bash
git add components/agents/pixel-character.tsx
git commit -m "feat: create pixel art character component with human form"
```

---

### Task 3: Replace Character Component in Wizard Tower

**Files:**
- Modify: `components/agents/wizard-tower.tsx:343-463`

**Interfaces:**
- Consumes: New PixelCharacter component
- Produces: Updated wizard tower with pixel art characters

- [ ] **Step 1: Remove old PixelCharacter component**

Delete the existing `PixelCharacter` function (lines 343-463) from wizard-tower.tsx

- [ ] **Step 2: Import new PixelCharacter component**

Add import at top of file:

```tsx
import PixelCharacter from './pixel-character';
```

- [ ] **Step 3: Update character rendering**

Replace the character rendering in the main component to use new PixelCharacter:

```tsx
        {/* Characters with pixel art style */}
        {ZONES.map((zone) => (
          <PixelCharacter
            key={zone.id}
            x={CHARACTER_POSITIONS[zone.id].x}
            y={CHARACTER_POSITIONS[zone.id].y}
            zone={zone}
            agent={agents.find(a => a.id === zone.id)}
            onClick={() => handleZoneClick(zone.id)}
          />
        ))}
```

- [ ] **Step 4: Test character rendering**

Run: `npm run dev`
Expected: Pixel art characters render correctly, animations work, click interactions functional

- [ ] **Step 5: Commit**

```bash
git add components/agents/wizard-tower.tsx
git commit -m "feat: replace character component with pixel art characters"
```

---

### Task 4: Redesign Knowledge Graph Node Styling

**Files:**
- Modify: `components/graph/knowledge-graph.tsx:22-64`

**Interfaces:**
- Consumes: Existing node data structure
- Produces: Updated node styling matching Obsidian graph view

- [ ] **Step 1: Update node color function**

Modify `getNodeColor` function to use Obsidian-style colors:

```tsx
function getNodeColor(type: string): string {
  const colors: Record<string, string> = {
    pdf: '#60a5fa',
    web: '#34d399',
    image: '#fbbf24',
    default: '#8b5cf6',
  };
  return colors[type] || colors.default;
}
```

- [ ] **Step 2: Update node positioning and styling**

Replace `generateCosmicPositions` function with Obsidian-style layout:

```tsx
function generateObsidianPositions(nodes: Node[]): Node[] {
  return nodes.map((node, index) => {
    const type = (node.data?.type as string) || 'default';
    const tags = (node.data?.metadata as { tags?: string[] })?.tags || [];
    const tagCount = tags.length || 1;
    const size = Math.max(12, Math.min(20, 10 + tagCount * 2));
    const color = getNodeColor(type);

    // Force-directed style layout - scattered but organized
    const angle = (index * Math.PI * 2) / nodes.length;
    const radius = 100 + Math.random() * 80;
    const centerX = 250;
    const centerY = 200;
    
    const x = centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 40;
    const y = centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * 40;

    return {
      ...node,
      position: { x, y },
      style: {
        width: size,
        height: size,
        background: color,
        border: 'none',
        borderRadius: '50%',
        boxShadow: 'none',
        color: '#fff',
        fontSize: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 500,
      },
      data: {
        ...node.data,
        label: (node.data?.label as string)?.substring(0, 8) || 'Node',
      },
    };
  });
}
```

- [ ] **Step 3: Update function call**

Change `generateCosmicPositions` to `generateObsidianPositions` in the useEffect:

```tsx
  useEffect(() => {
    setNodes(generateObsidianPositions(propNodes));
    setEdges(propEdges);
  }, [propNodes, propEdges, setNodes, setEdges]);
```

- [ ] **Step 4: Test node styling**

Run: `npm run dev`
Expected: Nodes render as simple circles with Obsidian-style colors, labels visible

- [ ] **Step 5: Commit**

```bash
git add components/graph/knowledge-graph.tsx
git commit -m "feat: redesign knowledge graph nodes to Obsidian style"
```

---

### Task 5: Redesign Knowledge Graph Edge Styling

**Files:**
- Modify: `components/graph/knowledge-graph.tsx:184-187`

**Interfaces:**
- Consumes: Existing edge data structure
- Produces: Updated edge styling matching Obsidian graph view

- [ ] **Step 1: Update edge styling**

Replace the `defaultEdgeOptions` in ReactFlow component:

```tsx
        defaultEdgeOptions={{
          style: { 
            stroke: 'rgba(139, 92, 246, 0.4)', 
            strokeWidth: 1,
          },
          type: 'straight',
        }}
```

- [ ] **Step 2: Update edge generation in page.tsx**

Modify edge generation in `app/page.tsx:129-167` to use Obsidian-style styling:

```tsx
        if (tagSimilarity > 0 || typeMatch > 0) {
          const strength = tagSimilarity + typeMatch;
          edges.push({
            id: `edge-${edgeId++}`,
            source: nodeA.id,
            target: nodeB.id,
            data: { strength },
            style: {
              stroke: `rgba(139, 92, 246, ${0.3 + strength * 0.1})`,
              strokeWidth: 0.5 + strength * 0.2,
            },
            type: 'straight',
          });
        }
```

- [ ] **Step 3: Test edge styling**

Run: `npm run dev`
Expected: Edges render as thin straight lines with Obsidian-style transparency

- [ ] **Step 4: Commit**

```bash
git add components/graph/knowledge-graph.tsx app/page.tsx
git commit -m "feat: redesign knowledge graph edges to Obsidian style"
```

---

### Task 6: Redesign Knowledge Graph Background

**Files:**
- Modify: `components/graph/knowledge-graph.tsx:175,189-193`

**Interfaces:**
- Consumes: Existing ReactFlow component
- Produces: Updated background styling matching Obsidian graph view

- [ ] **Step 1: Update main container background**

Change the background color in the main container:

```tsx
    <div className="relative w-full h-[500px] rounded-lg overflow-hidden bg-[#0a0a0f]">
```

- [ ] **Step 2: Update background component**

Replace the Background component with subtle dot pattern:

```tsx
        <Background
          color="rgba(139, 92, 246, 0.08)"
          gap={40}
          size={1}
        />
```

- [ ] **Step 3: Update MiniMap styling**

Update MiniMap background color:

```tsx
        <MiniMap
          style={{ 
            backgroundColor: 'rgba(10, 10, 15, 0.9)',
            maskColor: 'rgba(0, 0, 0, 0.6)',
          }}
          nodeColor={(node) => getNodeColor(node.data?.type as string)}
        />
```

- [ ] **Step 4: Test background styling**

Run: `npm run dev`
Expected: Background renders with dark color and subtle dot pattern

- [ ] **Step 5: Commit**

```bash
git add components/graph/knowledge-graph.tsx
git commit -m "feat: redesign knowledge graph background to Obsidian style"
```

---

### Task 7: Final Integration Testing

**Files:**
- Test: All modified components

**Interfaces:**
- Consumes: Complete redesigned UI
- Produces: Verified working implementation

- [ ] **Step 1: Start development server**

Run: `npm run dev`

- [ ] **Step 2: Test wizard space rendering**

Navigate to dashboard tab, verify:
- Background renders with modern gothic hybrid styling
- Pixel art characters display correctly
- Animations work smoothly
- Click interactions open modals
- Spell log functions properly

- [ ] **Step 3: Test knowledge graph rendering**

Navigate to graph tab, verify:
- Nodes render as simple circles with correct colors
- Edges render as thin straight lines
- Background is dark with subtle pattern
- Drag/zoom/pan interactions work
- Node click opens detail modal

- [ ] **Step 4: Test responsive design**

Resize browser window, verify:
- Wizard space adapts to different sizes
- Knowledge graph remains functional
- No layout breaks

- [ ] **Step 5: Check console for errors**

Open browser console, verify no errors or warnings

- [ ] **Step 6: Final commit**

```bash
git add .
git commit -m "feat: complete UI redesign - modern gothic hybrid wizard space and Obsidian-style knowledge graph"
```

---

## Self-Review

**Spec coverage:**
- Wizard space background modern gothic hybrid ✓ (Task 1)
- Pixel art human characters ✓ (Task 2, 3)
- Knowledge graph node styling ✓ (Task 4)
- Knowledge graph edge styling ✓ (Task 5)
- Knowledge graph background ✓ (Task 6)
- Color palette adherence ✓ (All tasks)
- Functionality preservation ✓ (Task 7)

**Placeholder scan:** No placeholders found, all steps contain complete code.

**Type consistency:** All function names and signatures match across tasks.
