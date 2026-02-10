
import React from 'react';
import { 
  Moon, 
  Sun, 
  CheckCircle2
} from 'lucide-react';

interface SettingsProps {
  theme: 'dark' | 'light';
  onThemeChange: (theme: 'dark' | 'light') => void;
}

const Settings: React.FC<SettingsProps> = ({ theme, onThemeChange }) => {
  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <h2 className="text-3xl font-black text-theme-text tracking-tight">Settings</h2>
        <p className="text-theme-sub mt-1">Personalize your platform appearance.</p>
      </div>

      <section className="bg-theme-surface border border-theme-border rounded-3xl p-8 space-y-8 shadow-sm">
        <div className="text-center">
          <h3 className="text-xl font-bold text-theme-text mb-2">Appearance</h3>
          <p className="text-sm text-theme-sub">Choose between a light or dark interface for your experience.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <button
            onClick={() => onThemeChange('light')}
            className={`flex flex-col items-center gap-5 p-8 rounded-3xl border-2 transition-all ${
              theme === 'light' 
                ? 'border-indigo-600 bg-indigo-600/5 ring-4 ring-indigo-600/10' 
                : 'border-theme-border bg-theme-bg hover:border-theme-sub2 hover:bg-theme-surface'
            }`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 ${theme === 'light' ? 'bg-indigo-600 text-white scale-110 shadow-lg' : 'bg-theme-surface text-theme-sub'}`}>
              <Sun size={28} />
            </div>
            <div className="text-center">
              <p className="font-bold text-lg text-theme-text">Light Mode</p>
              <p className="text-xs text-theme-sub mt-1">Clean & High Contrast</p>
            </div>
            <div className={`mt-2 flex items-center justify-center transition-opacity duration-300 ${theme === 'light' ? 'opacity-100' : 'opacity-0'}`}>
               <CheckCircle2 size={20} className="text-indigo-600" />
            </div>
          </button>

          <button
            onClick={() => onThemeChange('dark')}
            className={`flex flex-col items-center gap-5 p-8 rounded-3xl border-2 transition-all ${
              theme === 'dark' 
                ? 'border-indigo-600 bg-indigo-600/5 ring-4 ring-indigo-600/10' 
                : 'border-theme-border bg-theme-bg hover:border-theme-sub2 hover:bg-theme-surface'
            }`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 ${theme === 'dark' ? 'bg-indigo-600 text-white scale-110 shadow-lg' : 'bg-theme-surface text-theme-sub'}`}>
              <Moon size={28} />
            </div>
            <div className="text-center">
              <p className="font-bold text-lg text-theme-text">Dark Mode</p>
              <p className="text-xs text-theme-sub mt-1">Immersive & Modern</p>
            </div>
            <div className={`mt-2 flex items-center justify-center transition-opacity duration-300 ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}`}>
               <CheckCircle2 size={20} className="text-indigo-600" />
            </div>
          </button>
        </div>
      </section>

      <div className="bg-theme-surface/50 border border-theme-border border-dashed rounded-3xl p-6 text-center">
        <p className="text-[10px] font-bold text-theme-sub uppercase tracking-[0.2em]">All other settings are managed by your account administrator.</p>
      </div>
    </div>
  );
};

export default Settings;
