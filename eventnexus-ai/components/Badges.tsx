
import React, { useState, useRef, useCallback } from 'react';
import { 
  IdCard, 
  Printer,
  User,
  Type,
  Building,
  AtSign,
  Info,
  QrCode
} from 'lucide-react';
import { UserRole } from '../types';

// --- Baseline Constants & Themes ---
const THEMES = {
  midnight: { label: "Midnight", bg: "#0D0D1A", accent: "#7B61FF", accent2: "#FF6B9D", text: "#FFFFFF", subtext: "#8888AA", stripe: "#7B61FF" },
  arctic: { label: "Arctic", bg: "#F0F4FF", accent: "#005AFF", accent2: "#00C6AE", text: "#0A0A1A", subtext: "#5566AA", stripe: "#005AFF" },
  ember: { label: "Ember", bg: "#1A0900", accent: "#FF5C00", accent2: "#FFB800", text: "#FFF5EE", subtext: "#AA7755", stripe: "#FF5C00" },
  jade: { label: "Jade", bg: "#001A10", accent: "#00FF88", accent2: "#00CCFF", text: "#E0FFF0", subtext: "#44AA77", stripe: "#00FF88" },
  blush: { label: "Blush", bg: "#FFF0F5", accent: "#D63384", accent2: "#6610F2", text: "#1A001A", subtext: "#AA4477", stripe: "#D63384" },
};

const ROLES = ["Attendee", "Speaker", "VIP", "Staff", "Exhibitor", "Press"];
const ROLE_COLORS = {
  Attendee: "#7B61FF",
  Speaker: "#FF6B9D",
  VIP: "#FFB800",
  Staff: "#00FF88",
  Exhibitor: "#00CCFF",
  Press: "#FF5C00",
};

// --- Sub-components ---

function FakeQR({ size = 64, color = "#fff" }) {
  const pattern = [
    [1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,0,1,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,1,0,0,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,1,1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,0,1,0,1,1,1,1,0,1,1,1,1,0,1,0,1],
    [0,1,0,1,0,0,0,1,1,0,1,0,0,1,0,1,0],
    [1,1,0,0,1,0,1,0,0,1,0,1,1,0,1,1,1],
    [0,0,0,0,0,0,0,1,1,0,1,0,1,0,0,0,0],
    [1,1,1,1,1,1,1,0,0,1,0,1,0,1,1,0,1],
    [1,0,0,0,0,0,1,0,1,0,1,0,1,0,0,1,0],
    [1,0,1,1,1,0,1,0,0,1,1,0,0,1,1,1,1],
    [1,0,1,1,1,0,1,1,0,0,0,1,0,0,0,0,1],
    [1,1,1,1,1,1,1,0,1,1,0,0,1,1,1,0,1],
  ];
  const cell = size / 17;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
      {pattern.flatMap((row, r) =>
        row.map((v, c) => v ? <rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell} height={cell} fill={color} /> : null)
      )}
    </svg>
  );
}

// Fix: Corrected CSS property name 'justifyBox' to 'justifyContent' and removed duplicate style properties.
function Avatar({ name, size = 72, accent }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `linear-gradient(135deg, ${accent}66, ${accent})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.34, fontWeight: 700, color: "#fff",
      fontFamily: "'Inter', sans-serif", letterSpacing: 1, flexShrink: 0,
      border: `2px solid ${accent}88`
    }}>
      {initials}
    </div>
  );
}

function BadgePreview({ data, theme, layout }) {
  const t = THEMES[theme as keyof typeof THEMES];
  const roleColor = ROLE_COLORS[data.role as keyof typeof ROLE_COLORS] || t.accent;

  if (layout === "classic") {
    return (
      <div style={{
        width: 340, minHeight: 200, background: t.bg, borderRadius: 12, overflow: "hidden",
        boxShadow: `0 0 0 2px ${t.accent}44, 0 24px 48px #00000060`,
        fontFamily: "'Inter', sans-serif", display: "flex", flexDirection: "column", position: "relative",
      }}>
        <div style={{ height: 6, background: `linear-gradient(90deg, ${t.accent}, ${t.accent2})` }} />
        <div style={{ padding: "12px 20px 8px", borderBottom: `1px solid ${t.accent}22`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 15, letterSpacing: 2, color: t.accent, fontWeight: 700 }}>{data.eventName || "EVENT NAME"}</span>
          <span style={{ background: roleColor + "22", color: roleColor, fontSize: 9, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", padding: "3px 8px", borderRadius: 4, border: `1px solid ${roleColor}44` }}>{data.role}</span>
        </div>
        <div style={{ padding: "16px 20px", display: "flex", gap: 14, alignItems: "center", flex: 1 }}>
          <Avatar name={data.name || "?"} size={64} accent={t.accent} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 26, letterSpacing: 1, color: t.text, lineHeight: 1.1, wordBreak: "break-word", fontWeight: 700 }}>{data.name || "YOUR NAME"}</div>
            {data.title && <div style={{ fontSize: 12, color: t.subtext, marginTop: 2 }}>{data.title}</div>}
            {data.company && <div style={{ fontSize: 13, fontWeight: 600, color: t.accent2, marginTop: 3 }}>{data.company}</div>}
          </div>
          {data.showQR && <div style={{ opacity: 0.8 }}><FakeQR size={56} color={t.text} /></div>}
        </div>
        {(data.email || data.tagline) && (
          <div style={{ padding: "8px 20px 12px", borderTop: `1px solid ${t.accent}22`, fontSize: 11, color: t.subtext }}>
            {data.email || data.tagline}
          </div>
        )}
      </div>
    );
  }

  if (layout === "vertical") {
    return (
      <div style={{
        width: 240, minHeight: 340, background: t.bg, borderRadius: 14, overflow: "hidden",
        boxShadow: `0 0 0 2px ${t.accent}33, 0 24px 48px #00000060`,
        fontFamily: "'Inter', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", position: "relative",
      }}>
        <div style={{ position: "absolute", top: -40, left: -40, width: 200, height: 200, borderRadius: "50%", background: `radial-gradient(circle, ${t.accent}33, transparent 70%)`, pointerEvents: "none" }} />
        <div style={{ width: "100%", background: `linear-gradient(135deg, ${t.accent}, ${t.accent2})`, padding: "8px 0", textAlign: "center", letterSpacing: 4, fontSize: 13, color: "#fff", fontWeight: 800 }}>{data.role}</div>
        <div style={{ padding: "24px 20px 16px", textAlign: "center", zIndex: 1 }}>
          <Avatar name={data.name || "?"} size={88} accent={t.accent} />
          <div style={{ fontSize: 32, letterSpacing: 1.5, color: t.text, marginTop: 14, lineHeight: 1, fontWeight: 700 }}>{data.name || "YOUR NAME"}</div>
          {data.title && <div style={{ fontSize: 11, color: t.subtext, marginTop: 4 }}>{data.title}</div>}
          {data.company && <div style={{ fontSize: 13, fontWeight: 600, color: t.accent2, marginTop: 6 }}>{data.company}</div>}
        </div>
        <div style={{ width: "60%", height: 1, background: `${t.accent}44` }} />
        <div style={{ padding: "16px 20px", textAlign: "center", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 14, letterSpacing: 3, color: t.accent, fontWeight: 700 }}>{data.eventName || "EVENT NAME"}</div>
          {data.showQR && <FakeQR size={64} color={t.text} />}
          {data.email && <div style={{ fontSize: 10, color: t.subtext }}>{data.email}</div>}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      width: 360, height: 210, background: `linear-gradient(135deg, ${t.bg} 60%, ${t.accent}18)`, borderRadius: 16, overflow: "hidden",
      boxShadow: `0 0 0 1.5px ${t.accent}55, 0 32px 64px #00000070`,
      fontFamily: "'Inter', sans-serif", display: "grid", gridTemplateColumns: "1fr 100px", position: "relative",
    }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: `linear-gradient(180deg, ${t.accent}, ${t.accent2})` }} />
      <div style={{ padding: "22px 16px 22px 24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <Avatar name={data.name || "?"} size={52} accent={t.accent} />
            <div>
              <div style={{ fontSize: 22, letterSpacing: 1, color: t.text, lineHeight: 1.1, fontWeight: 700 }}>{data.name || "YOUR NAME"}</div>
              {data.title && <div style={{ fontSize: 10, color: t.subtext, marginTop: 1 }}>{data.title}</div>}
            </div>
          </div>
          {data.company && <div style={{ fontSize: 12, fontWeight: 600, color: t.accent2, background: `${t.accent2}15`, display: "inline-block", padding: "2px 8px", borderRadius: 4 }}>{data.company}</div>}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: '100%' }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: t.subtext }}>{data.eventName || "EVENT NAME"}</div>
          <span style={{ marginLeft: 'auto', background: `${ROLE_COLORS[data.role as keyof typeof ROLE_COLORS] || t.accent}22`, color: ROLE_COLORS[data.role as keyof typeof ROLE_COLORS] || t.accent, fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", padding: "2px 7px", borderRadius: 3 }}>{data.role}</span>
        </div>
      </div>
      <div style={{ background: `${t.accent}12`, borderLeft: `1px solid ${t.accent}22`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, padding: "12px 8px" }}>
        {data.showQR ? <><FakeQR size={60} color={t.text} /><div style={{ fontSize: 9, color: t.subtext, textAlign: "center" }}>SCAN ME</div></> : <div style={{ fontSize: 10, color: t.subtext, textAlign: "center", lineHeight: 1.4 }}>QR<br/>OFF</div>}
      </div>
    </div>
  );
}

// --- Main Badges Component ---

const Badges: React.FC = () => {
  const [data, setData] = useState({
    name: "Alex Rivera",
    title: "Event Organizer",
    company: "TechFlow Inc.",
    email: "alex@techflow.io",
    tagline: "",
    role: "Staff",
    eventName: "Future Tech 2025",
    showQR: true,
  });
  const [theme, setTheme] = useState("midnight");
  const [layout, setLayout] = useState("classic");
  const [printing, setPrinting] = useState(false);
  const badgeRef = useRef<HTMLDivElement>(null);

  const setField = (key: string) => (val: any) => setData((d) => ({ ...d, [key]: val }));

  const handlePrint = useCallback(() => {
    const badgeNode = badgeRef.current;
    if (!badgeNode) return;

    setPrinting(true);
    const badgeHTML = badgeNode.innerHTML;
    const iframe = document.createElement("iframe");
    iframe.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:0;height:0;border:0;";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8"/>
          <title>Badge – ${data.name || "Attendee"}</title>
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"/>
          <style>
            *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
            html, body { width: 100%; height: 100%; background: #ffffff; display: flex; align-items: center; justify-content: center; font-family: 'Inter', sans-serif; }
            .badge-wrap { display: inline-block; }
            svg rect { shape-rendering: crispEdges; }
            @media print { html, body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; color-adjust: exact; } @page { size: A4 portrait; margin: 20mm; } }
          </style>
        </head>
        <body>
          <div class="badge-wrap">${badgeHTML}</div>
        </body>
        </html>
      `);
      doc.close();
      iframe.contentWindow?.focus();
      setTimeout(() => {
        iframe.contentWindow?.print();
        document.body.removeChild(iframe);
        setPrinting(false);
      }, 1000);
    }
  }, [data.name]);

  return (
    <div className="h-full flex flex-col bg-theme-bg text-theme-text -m-4 lg:-m-8 min-h-screen overflow-hidden">
      <div className="h-16 lg:h-20 border-b border-theme-border bg-theme-surface flex items-center justify-between px-6 lg:px-8 shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-indigo-600/10 border border-indigo-500/20 rounded-xl text-indigo-500">
            <IdCard size={24} />
          </div>
          <div>
            <h2 className="text-lg font-extrabold leading-none tracking-tight">Badge Designer</h2>
            <p className="text-[10px] font-bold text-theme-sub uppercase tracking-widest mt-1">Platform ID Pro</p>
          </div>
        </div>
        <button
          onClick={handlePrint}
          disabled={printing}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg ${
            printing ? 'bg-slate-300 dark:bg-slate-800 text-slate-500' : 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-indigo-500/10'
          }`}
        >
          {printing ? <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent animate-spin rounded-full"></div> : <Printer size={18} />}
          <span>{printing ? "Preparing..." : "Print Badge"}</span>
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Toolbar */}
        <div className="w-80 bg-theme-surface border-r border-theme-border overflow-y-auto p-6 space-y-8 custom-scrollbar">
          <section className="space-y-4">
             <h3 className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.2em]">Attendee Data</h3>
             <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-theme-sub flex items-center gap-1.5 uppercase"><User size={10}/> Full Name</label>
                  <input value={data.name} onChange={(e) => setField('name')(e.target.value)} className="w-full bg-theme-bg border border-theme-border rounded-lg p-2.5 text-xs text-theme-text outline-none focus:border-indigo-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-theme-sub flex items-center gap-1.5 uppercase"><Type size={10}/> Job Title</label>
                  <input value={data.title} onChange={(e) => setField('title')(e.target.value)} className="w-full bg-theme-bg border border-theme-border rounded-lg p-2.5 text-xs text-theme-text outline-none focus:border-indigo-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-theme-sub flex items-center gap-1.5 uppercase"><Building size={10}/> Company</label>
                  <input value={data.company} onChange={(e) => setField('company')(e.target.value)} className="w-full bg-theme-bg border border-theme-border rounded-lg p-2.5 text-xs text-theme-text outline-none focus:border-indigo-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-theme-sub flex items-center gap-1.5 uppercase"><AtSign size={10}/> Email Address</label>
                  <input value={data.email} onChange={(e) => setField('email')(e.target.value)} className="w-full bg-theme-bg border border-theme-border rounded-lg p-2.5 text-xs text-theme-text outline-none focus:border-indigo-500" />
                </div>
             </div>
          </section>

          <section className="space-y-4">
             <h3 className="text-[10px] font-bold text-pink-500 uppercase tracking-[0.2em]">Event Settings</h3>
             <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-theme-sub flex items-center gap-1.5 uppercase"><Info size={10}/> Event Name</label>
                  <input value={data.eventName} onChange={(e) => setField('eventName')(e.target.value)} className="w-full bg-theme-bg border border-theme-border rounded-lg p-2.5 text-xs text-theme-text outline-none focus:border-indigo-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-theme-sub flex items-center gap-1.5 uppercase">Role Access</label>
                  <div className="grid grid-cols-2 gap-2">
                    {ROLES.map(r => (
                      <button 
                        key={r} onClick={() => setField('role')(r)}
                        className={`text-[9px] font-bold p-2 rounded-lg border transition-all ${data.role === r ? 'bg-indigo-600/20 border-indigo-600 text-indigo-500' : 'bg-transparent border-theme-border text-theme-sub hover:border-theme-sub2'}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between bg-theme-bg p-3 rounded-lg border border-theme-border">
                  <span className="text-[10px] font-bold text-theme-sub uppercase flex items-center gap-2"><QrCode size={14}/> QR Identifier</span>
                  <button 
                    onClick={() => setField('showQR')(!data.showQR)}
                    className={`w-10 h-5 rounded-full relative transition-all ${data.showQR ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                  >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${data.showQR ? 'left-6' : 'left-1'}`}></div>
                  </button>
                </div>
             </div>
          </section>

          <section className="space-y-4">
             <h3 className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.2em]">Visual Styling</h3>
             <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-theme-sub uppercase tracking-widest">Active Theme</label>
                  <div className="flex gap-3">
                    {Object.entries(THEMES).map(([key, t]) => (
                      <button
                        key={key} onClick={() => setTheme(key)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${theme === key ? 'border-theme-text scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                        style={{ background: `linear-gradient(135deg, ${t.accent}, ${t.accent2})` }}
                        title={t.label}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-theme-sub uppercase tracking-widest">Base Layout</label>
                  <div className="flex bg-theme-bg p-1 rounded-xl border border-theme-border">
                    {["classic", "modern", "vertical"].map(l => (
                      <button 
                        key={l} onClick={() => setLayout(l)}
                        className={`flex-1 text-[9px] font-bold uppercase py-2 rounded-lg transition-all ${layout === l ? 'bg-indigo-600 text-white' : 'text-theme-sub hover:text-theme-text'}`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
             </div>
          </section>
        </div>

        {/* Center Preview */}
        <div className="flex-1 bg-theme-bg flex flex-col items-center justify-center p-12 overflow-auto relative">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--border) 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
          <div className="mb-8 text-center space-y-1 relative z-10">
            <h4 className="text-[10px] font-bold text-theme-sub uppercase tracking-[0.4em]">Live Rendering</h4>
            <p className="text-xs text-theme-sub2">WYSIWYG ID Generation Engine</p>
          </div>
          
          <div ref={badgeRef} className="animate-in zoom-in-95 duration-500 relative z-10">
            <BadgePreview data={data} theme={theme} layout={layout} />
          </div>

          <div className="mt-12 flex gap-8 relative z-10">
            <div className="text-center">
              <p className="text-[9px] font-bold text-theme-sub uppercase mb-1">Theme</p>
              <p className="text-xs font-bold text-theme-sub2 capitalize">{theme}</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] font-bold text-theme-sub uppercase mb-1">Layout</p>
              <p className="text-xs font-bold text-theme-sub2 capitalize">{layout}</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] font-bold text-theme-sub uppercase mb-1">Role Color</p>
              <div className="w-3 h-3 rounded-full mx-auto" style={{ backgroundColor: ROLE_COLORS[data.role as keyof typeof ROLE_COLORS] }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Badges;
