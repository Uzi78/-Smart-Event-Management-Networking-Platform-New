
import React, { useState, useRef } from 'react';
import { 
  Circle as CircleIcon, 
  MapPin, 
  Trash2, 
  Save, 
  Monitor, 
  ShoppingBag,
  Maximize2,
  Check,
  Loader2,
  Layers,
  Plus,
  Edit2,
  X,
  Square,
  RectangleHorizontal,
  TriangleAlert
} from 'lucide-react';
import { FloorPlanElement } from '../types';

type VenueShape = 'rectangle' | 'square' | 'circle';

interface FloorPlan {
  id: string;
  name: string;
  shape: VenueShape;
  elements: FloorPlanElement[];
}

const VenueEditor: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Multiple floor plans state
  const [floorPlans, setFloorPlans] = useState<FloorPlan[]>([
    {
      id: 'fp-1',
      name: 'Ground Floor Expo',
      shape: 'rectangle',
      elements: [
        { id: '1', type: 'stage', x: 200, y: 50, width: 400, height: 100, label: 'Main Stage', status: 'occupied' },
        { id: '2', type: 'booth', x: 50, y: 200, width: 100, height: 100, label: 'Exhibitor A', status: 'reserved' },
        { id: '3', type: 'booth', x: 650, y: 200, width: 100, height: 100, label: 'Exhibitor B', status: 'available' },
        { id: 'obs-1', type: 'obstacle', x: 375, y: 300, width: 50, height: 50, label: 'Pillar', status: 'occupied' },
      ]
    },
    {
      id: 'fp-2',
      name: 'Workshop Room B',
      shape: 'square',
      elements: [
        { id: '4', type: 'amenity', x: 375, y: 300, width: 50, height: 50, label: 'Info Desk', status: 'occupied' },
      ]
    }
  ]);

  const [activePlanId, setActivePlanId] = useState<string>(floorPlans[0].id);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [tempPlanName, setTempPlanName] = useState("");

  const activePlan = floorPlans.find(p => p.id === activePlanId)!;
  const elements = activePlan.elements;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Helper to update active elements
  const updateActiveElements = (updater: (prev: FloorPlanElement[]) => FloorPlanElement[]) => {
    setFloorPlans(prev => prev.map(plan => 
      plan.id === activePlanId 
        ? { ...plan, elements: updater(plan.elements) }
        : plan
    ));
  };

  const updateActivePlanProp = (prop: keyof FloorPlan, value: any) => {
    setFloorPlans(prev => prev.map(plan => 
      plan.id === activePlanId 
        ? { ...plan, [prop]: value }
        : plan
    ));
  };

  const getSVGPoint = (e: React.MouseEvent, svg: SVGSVGElement) => {
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    return pt.matrixTransform(svg.getScreenCTM()?.inverse());
  };

  const handleMouseDown = (e: React.MouseEvent, element: FloorPlanElement) => {
    e.stopPropagation();
    setSelectedId(element.id);
    setIsDragging(true);
    setIsResizing(false);
    
    const svg = (e.currentTarget as SVGGraphicsElement).closest('svg');
    if (!svg) return;
    
    const svgP = getSVGPoint(e, svg);
    
    setDragOffset({
      x: svgP.x - element.x,
      y: svgP.y - element.y
    });
  };

  const handleResizeStart = (e: React.MouseEvent, element: FloorPlanElement) => {
    e.stopPropagation();
    setSelectedId(element.id);
    setIsResizing(true);
    setIsDragging(false);

    const svg = (e.currentTarget as SVGGraphicsElement).closest('svg');
    if (!svg) return;
    
    const svgP = getSVGPoint(e, svg);

    setResizeStart({
      x: svgP.x,
      y: svgP.y,
      w: element.width,
      h: element.height
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if ((!isDragging && !isResizing) || !selectedId) return;

    const svg = e.currentTarget as unknown as SVGSVGElement;
    if (!svg || !svg.getScreenCTM) return;
    
    const svgP = getSVGPoint(e, svg);

    if (isDragging) {
      updateActiveElements(prev => prev.map(el => 
        el.id === selectedId 
          ? { ...el, x: svgP.x - dragOffset.x, y: svgP.y - dragOffset.y } 
          : el
      ));
    } else if (isResizing) {
      const dx = svgP.x - resizeStart.x;
      const dy = svgP.y - resizeStart.y;
      
      updateActiveElements(prev => prev.map(el => 
        el.id === selectedId 
          ? { 
              ...el, 
              width: Math.max(20, resizeStart.w + dx), 
              height: Math.max(20, resizeStart.h + dy) 
            } 
          : el
      ));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  const addNewElement = (type: FloorPlanElement['type']) => {
    const newEl: FloorPlanElement = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      x: 350,
      y: 250,
      width: type === 'booth' ? 80 : type === 'obstacle' ? 40 : 60,
      height: type === 'booth' ? 80 : type === 'obstacle' ? 40 : 60,
      label: type === 'obstacle' ? 'Blocked' : `New ${type}`,
      status: type === 'obstacle' ? 'occupied' : 'available'
    };
    updateActiveElements(prev => [...prev, newEl]);
    setSelectedId(newEl.id);
  };

  const deleteSelected = () => {
    if (selectedId) {
      updateActiveElements(prev => prev.filter(el => el.id !== selectedId));
      setSelectedId(null);
    }
  };

  const handleFullScreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1200);
  };

  const addNewFloorPlan = () => {
    const newPlan: FloorPlan = {
      id: `fp-${Date.now()}`,
      name: `New Layout ${floorPlans.length + 1}`,
      shape: 'rectangle',
      elements: []
    };
    setFloorPlans([...floorPlans, newPlan]);
    setActivePlanId(newPlan.id);
  };

  const deleteFloorPlan = (id: string) => {
    if (floorPlans.length === 1) return;
    const nextPlans = floorPlans.filter(p => p.id !== id);
    setFloorPlans(nextPlans);
    if (activePlanId === id) {
      setActivePlanId(nextPlans[0].id);
    }
  };

  const startRenaming = (plan: FloorPlan) => {
    setEditingPlanId(plan.id);
    setTempPlanName(plan.name);
  };

  const saveRename = () => {
    if (editingPlanId && tempPlanName.trim()) {
      setFloorPlans(prev => prev.map(p => p.id === editingPlanId ? { ...p, name: tempPlanName } : p));
      setEditingPlanId(null);
    }
  };

  // Shape-specific background rendering
  const renderVenueBoundary = () => {
    switch (activePlan.shape) {
      case 'square':
        return <rect x="100" y="0" width="600" height="600" fill="url(#grid)" stroke="var(--border-strong)" strokeWidth="2" />;
      case 'circle':
        return <circle cx="400" cy="300" r="300" fill="url(#grid)" stroke="var(--border-strong)" strokeWidth="2" />;
      default:
        return <rect width="800" height="600" fill="url(#grid)" stroke="var(--border-strong)" strokeWidth="2" />;
    }
  };

  return (
    <div ref={containerRef} className="h-full flex flex-col gap-6 animate-in fade-in duration-500 bg-theme-bg p-4 lg:p-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-theme-text tracking-tight">Venue Floor Plan Editor</h2>
          <p className="text-theme-sub mt-1">Design and manage layout scenarios and venue boundaries.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={handleFullScreen}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-theme-surface hover:bg-theme-card text-theme-sub px-4 py-2.5 rounded-xl font-bold transition-all border border-theme-border"
          >
            <Maximize2 size={18} />
            <span>Full Screen</span>
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 min-w-[140px] px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg ${
              saveSuccess 
                ? 'bg-emerald-600 text-white shadow-emerald-900/20' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-900/20'
            } disabled:opacity-70 active:scale-95`}
          >
            {isSaving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : saveSuccess ? (
              <Check size={18} />
            ) : (
              <Save size={18} />
            )}
            <span>{isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Layout'}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px] pb-4 overflow-hidden">
        {/* Floor Plans Manager Sidebar */}
        <div className="lg:col-span-3 bg-theme-surface rounded-3xl border border-theme-border shadow-sm flex flex-col overflow-hidden">
          <div className="p-5 border-b border-theme-border flex items-center justify-between">
            <h3 className="text-xs font-bold text-theme-sub uppercase tracking-widest flex items-center gap-2">
              <Layers size={14} className="text-indigo-500" />
              Floor Plans
            </h3>
            <button 
              onClick={addNewFloorPlan}
              className="p-1.5 bg-indigo-600/10 text-indigo-500 hover:bg-indigo-600 hover:text-white rounded-lg transition-all"
            >
              <Plus size={16} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {floorPlans.map((plan) => (
              <div 
                key={plan.id}
                onClick={() => setActivePlanId(plan.id)}
                className={`group flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer border ${
                  activePlanId === plan.id 
                    ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-500' 
                    : 'bg-transparent border-transparent text-theme-sub hover:bg-theme-bg hover:text-theme-text'
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-2 h-2 rounded-full ${activePlanId === plan.id ? 'bg-indigo-500' : 'bg-slate-400 dark:bg-slate-700'}`} />
                  {editingPlanId === plan.id ? (
                    <input 
                      autoFocus
                      value={tempPlanName}
                      onChange={(e) => setTempPlanName(e.target.value)}
                      onBlur={saveRename}
                      onKeyDown={(e) => e.key === 'Enter' && saveRename()}
                      className="bg-theme-bg border border-indigo-500 rounded px-2 py-0.5 text-xs text-theme-text outline-none w-full"
                    />
                  ) : (
                    <span className="text-xs font-bold truncate">{plan.name}</span>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); startRenaming(plan); }} className="p-1 hover:text-indigo-500">
                    <Edit2 size={12} />
                  </button>
                  {floorPlans.length > 1 && (
                    <button onClick={(e) => { e.stopPropagation(); deleteFloorPlan(plan.id); }} className="p-1 hover:text-red-500">
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="p-5 border-t border-theme-border bg-theme-surface/50">
             <h3 className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-4">Venue Configuration</h3>
             <div className="flex gap-2">
                {[
                  { id: 'rectangle', icon: <RectangleHorizontal size={16} />, label: 'Rect' },
                  { id: 'square', icon: <Square size={16} />, label: 'Sq' },
                  { id: 'circle', icon: <CircleIcon size={16} />, label: 'Circ' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => updateActivePlanProp('shape', s.id)}
                    className={`flex-1 flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all ${
                      activePlan.shape === s.id 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' 
                        : 'bg-theme-bg border-theme-border text-theme-sub hover:border-theme-sub2'
                    }`}
                  >
                    {s.icon}
                    <span className="text-[9px] font-black uppercase">{s.label}</span>
                  </button>
                ))}
             </div>
          </div>

          {selectedId && (
            <div className="p-5 border-t border-theme-border bg-theme-surface/30 animate-in slide-in-from-bottom-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.2em]">Properties</h3>
                <button onClick={() => setSelectedId(null)} className="text-theme-sub hover:text-theme-text">
                  <X size={14} />
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                   <div>
                    <label className="text-[10px] font-bold text-theme-sub uppercase tracking-widest mb-1 block">Width</label>
                    <input 
                      type="number" 
                      value={Math.round(elements.find(e => e.id === selectedId)?.width || 0)} 
                      onChange={(e) => updateActiveElements(prev => prev.map(el => el.id === selectedId ? { ...el, width: parseInt(e.target.value) || 20 } : el))}
                      className="w-full bg-theme-bg border border-theme-border rounded-lg px-3 py-1.5 text-xs text-theme-text outline-none"
                    />
                   </div>
                   <div>
                    <label className="text-[10px] font-bold text-theme-sub uppercase tracking-widest mb-1 block">Height</label>
                    <input 
                      type="number" 
                      value={Math.round(elements.find(e => e.id === selectedId)?.height || 0)} 
                      onChange={(e) => updateActiveElements(prev => prev.map(el => el.id === selectedId ? { ...el, height: parseInt(e.target.value) || 20 } : el))}
                      className="w-full bg-theme-bg border border-theme-border rounded-lg px-3 py-1.5 text-xs text-theme-text outline-none"
                    />
                   </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-theme-sub uppercase tracking-widest mb-1.5 block">Label</label>
                  <input 
                    type="text" 
                    value={elements.find(e => e.id === selectedId)?.label || ''} 
                    onChange={(e) => updateActiveElements(prev => prev.map(el => el.id === selectedId ? { ...el, label: e.target.value } : el))}
                    className="w-full bg-theme-bg border border-theme-border rounded-xl px-3 py-2 text-xs text-theme-text focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
                {elements.find(e => e.id === selectedId)?.type !== 'obstacle' && (
                  <div>
                    <label className="text-[10px] font-bold text-theme-sub uppercase tracking-widest mb-1.5 block">Status</label>
                    <select 
                      value={elements.find(e => e.id === selectedId)?.status || ''} 
                      onChange={(e) => updateActiveElements(prev => prev.map(el => el.id === selectedId ? { ...el, status: e.target.value as any } : el))}
                      className="w-full bg-theme-bg border border-theme-border rounded-xl px-3 py-2 text-xs text-theme-text outline-none"
                    >
                      <option value="available" className="bg-theme-surface">Available</option>
                      <option value="reserved" className="bg-theme-surface">Reserved</option>
                      <option value="occupied" className="bg-theme-surface">Occupied</option>
                    </select>
                  </div>
                )}
                <button 
                  onClick={deleteSelected}
                  className="w-full flex items-center justify-center gap-2 p-2.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl transition-all border border-red-500/20"
                >
                  <Trash2 size={14} />
                  <span className="text-[10px] font-bold uppercase">Delete Element</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Canvas Area */}
        <div className="lg:col-span-7 bg-theme-surface rounded-3xl border border-theme-border shadow-sm relative overflow-hidden group">
          <div className="absolute top-4 left-4 z-10 glass rounded-xl p-3 shadow-2xl flex items-center gap-4">
             <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div><span className="text-[8px] font-black text-theme-text uppercase tracking-tighter">AVAIL</span></div>
             <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500"></div><span className="text-[8px] font-black text-theme-text uppercase tracking-tighter">RSVD</span></div>
             <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-500"></div><span className="text-[8px] font-black text-theme-text uppercase tracking-tighter">OCCP</span></div>
             <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-md bg-slate-400 opacity-50"></div><span className="text-[8px] font-black text-theme-text uppercase tracking-tighter">OBSTACLE</span></div>
          </div>
          
          <svg 
            className="w-full h-full cursor-crosshair" 
            viewBox="0 0 800 600"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--border)" strokeWidth="1"/>
              </pattern>
              <pattern id="diagonalHatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="10" stroke="currentColor" strokeWidth="4" />
              </pattern>
              <clipPath id="venueClip">
                {activePlan.shape === 'square' && <rect x="100" y="0" width="600" height="600" />}
                {activePlan.shape === 'circle' && <circle cx="400" cy="300" r="300" />}
                {activePlan.shape === 'rectangle' && <rect x="0" y="0" width="800" height="600" />}
              </clipPath>
            </defs>
            
            <g clipPath="url(#venueClip)">
              {renderVenueBoundary()}

              {elements.length === 0 && (
                <text x="400" y="300" textAnchor="middle" fill="var(--text-sub2)" fontSize="14" fontWeight="800" className="opacity-20 uppercase tracking-[0.2em] pointer-events-none">
                  Floor Plan Empty
                </text>
              )}

              {elements.map((el) => {
                const isSelected = selectedId === el.id;
                const isObstacle = el.type === 'obstacle';
                
                let colorClass = el.status === 'available' ? '#10b981' : el.status === 'reserved' ? '#f59e0b' : '#64748b';
                if (isObstacle) colorClass = 'var(--text-sub2)';

                return (
                  <g 
                    key={el.id} 
                    className={`transition-transform ${isSelected ? 'z-20' : 'z-0'}`}
                  >
                    <rect 
                      x={el.x} 
                      y={el.y} 
                      width={el.width} 
                      height={el.height} 
                      rx={isObstacle ? 4 : (el.type === 'booth' ? 12 : el.type === 'stage' ? 6 : 40)}
                      fill={isObstacle ? 'url(#diagonalHatch)' : (isSelected ? 'var(--accent)' : 'var(--bg)')}
                      stroke={isSelected ? 'var(--accent)' : colorClass}
                      strokeWidth={isSelected ? 4 : 2}
                      className={`cursor-move ${isObstacle ? 'text-slate-500/30' : ''}`}
                      onMouseDown={(e) => handleMouseDown(e, el)}
                    />
                    <text 
                      x={el.x + el.width / 2} 
                      y={el.y + el.height / 2 + (el.type === 'seat' ? 0 : 5)} 
                      textAnchor="middle" 
                      fill={isSelected ? '#fff' : (isObstacle ? 'var(--text-sub2)' : 'var(--text)')}
                      fontSize={Math.min(el.width, el.height) / 5}
                      fontWeight="800"
                      className="select-none pointer-events-none uppercase tracking-tighter"
                    >
                      {el.label}
                    </text>
                    
                    {/* Resize Handle */}
                    {isSelected && (
                      <g className="cursor-nwse-resize" onMouseDown={(e) => handleResizeStart(e, el)}>
                        <circle 
                          cx={el.x + el.width} 
                          cy={el.y + el.height} 
                          r="6" 
                          fill="var(--accent)" 
                          stroke="#fff" 
                          strokeWidth="2"
                        />
                        <path 
                          d={`M ${el.x + el.width - 10} ${el.y + el.height} L ${el.x + el.width} ${el.y + el.height} L ${el.x + el.width} ${el.y + el.height - 10}`} 
                          fill="none" 
                          stroke="#fff" 
                          strokeWidth="1.5" 
                          strokeLinecap="round"
                        />
                      </g>
                    )}
                  </g>
                );
              })}
            </g>

            {/* Out of bounds visual indicator */}
            <rect width="800" height="600" fill="none" stroke="var(--border-strong)" strokeWidth="1" strokeDasharray="10 5" className="opacity-10 pointer-events-none" />
          </svg>
        </div>

        {/* Toolbar - Right Side */}
        <div className="lg:col-span-2 bg-theme-surface p-6 rounded-3xl border border-theme-border shadow-sm space-y-8 overflow-y-auto custom-scrollbar">
          <div>
            <h3 className="text-[10px] font-bold text-theme-sub uppercase tracking-[0.2em] mb-4">Add Objects</h3>
            <div className="grid grid-cols-1 gap-3">
              {[
                { type: 'booth', label: 'Booth', icon: <ShoppingBag size={18} /> },
                { type: 'stage', label: 'Stage', icon: <Monitor size={18} /> },
                { type: 'seat', label: 'Seat', icon: <CircleIcon size={18} /> },
                { type: 'amenity', label: 'Amenity', icon: <MapPin size={18} /> },
                { type: 'obstacle', label: 'Obstacle', icon: <TriangleAlert size={18} /> },
              ].map((item) => (
                <button 
                  key={item.type}
                  onClick={() => addNewElement(item.type as any)}
                  className={`flex items-center gap-3 p-3.5 bg-theme-bg hover:bg-indigo-600/10 hover:text-indigo-500 hover:border-indigo-500/30 rounded-2xl transition-all border border-theme-border group ${item.type === 'obstacle' ? 'border-amber-500/10' : ''}`}
                >
                  <span className={`text-theme-sub group-hover:text-indigo-500 ${item.type === 'obstacle' ? 'text-amber-500/50' : ''}`}>{item.icon}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="bg-indigo-500/5 p-4 rounded-2xl border border-indigo-500/10">
            <h4 className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest mb-2">Shortcuts</h4>
            <ul className="space-y-2 text-[9px] text-theme-sub font-medium uppercase">
              <li>• Drag to reposition</li>
              <li>• Grab corner to resize</li>
              <li>• Use properties to scale</li>
              <li>• Switch plans in sidebar</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueEditor;
