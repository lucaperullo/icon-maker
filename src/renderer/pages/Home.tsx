import React, { useState } from 'react';
import { Upload, Search, Send, Download, Package, Settings, X, MessageCircle, Check, Minus, Plus, Zap, Palette, Sparkles, Square, Circle } from 'lucide-react';

interface Message {
  id: number;
  type: 'user' | 'bot';
  content: string;
}

type SizeKey = '16x16' | '32x32' | '48x48' | '64x64' | '128x128' | '256x256' | '512x512' | '1024x1024';
type PlatformKey = 'web' | 'ios' | 'android' | 'mac';

interface StyleOptions {
  style: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundStyle: string;
  iconComplexity: string;
  corners: string;
  effects: string[];
  mood: string;
  theme: string;
}

const Home: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, type: 'bot', content: 'Hi! I can help you generate custom icons. Describe what you need and I\'ll create it for you.' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<Record<SizeKey, boolean>>({
    '16x16': true,
    '32x32': true,
    '48x48': true,
    '64x64': true,
    '128x128': true,
    '256x256': true,
    '512x512': false,
    '1024x1024': false
  });
  const [selectedPlatforms, setSelectedPlatforms] = useState<Record<PlatformKey, boolean>>({
    web: true,
    ios: false,
    android: false,
    mac: false
  });
  const [currentIcon, setCurrentIcon] = useState<null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [styleOptions, setStyleOptions] = useState<StyleOptions>({
    style: 'minimal',
    primaryColor: '#8b5cf6',
    secondaryColor: '#06b6d4',
    backgroundStyle: 'transparent',
    iconComplexity: 'medium',
    corners: 'rounded',
    effects: [],
    mood: 'professional',
    theme: 'modern'
  });

  const platformSizes: Record<PlatformKey, string[]> = {
    web: ['16x16', '32x32', '48x48', '64x64', '128x128', '256x256', '512x512', '1024x1024'],
    ios: ['20x20', '29x29', '40x40', '58x58', '60x60', '76x76', '80x80', '87x87', '120x120', '152x152', '167x167', '180x180', '1024x1024'],
    android: ['36x36', '48x48', '72x72', '96x96', '144x144', '192x192', '512x512'],
    mac: ['16x16', '32x32', '128x128', '256x256', '512x512', '1024x1024']
  };

  const styleOptionsConfig = {
    style: ['minimal', 'detailed', 'gradient', 'outline', '3d', 'flat', 'line-art', 'filled', 'duotone', 'hand-drawn'],
    backgroundStyle: ['transparent', 'solid', 'gradient', 'pattern', 'textured', 'glass', 'none'],
    iconComplexity: ['simple', 'medium', 'detailed', 'complex'],
    corners: ['sharp', 'rounded', 'smooth', 'circular'],
    effects: ['shadow', 'glow', 'reflection', 'emboss', 'beveled', 'neon', 'metallic', 'glossy'],
    mood: ['professional', 'playful', 'elegant', 'bold', 'friendly', 'serious', 'creative', 'corporate'],
    theme: ['modern', 'retro', 'futuristic', 'classic', 'minimalist', 'vintage', 'tech', 'organic']
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const styleContext = `Style: ${styleOptions.style}, Colors: ${styleOptions.primaryColor}/${styleOptions.secondaryColor}, Background: ${styleOptions.backgroundStyle}, Complexity: ${styleOptions.iconComplexity}, Corners: ${styleOptions.corners}, Effects: ${styleOptions.effects.join(', ')}, Mood: ${styleOptions.mood}, Theme: ${styleOptions.theme}`;
    
    const newMessage: Message = { id: Date.now(), type: 'user', content: inputValue };
    setMessages(prev => [...prev, newMessage]);
    setIsGenerating(true);
    setInputValue('');
    
    // Simulate AI response
    setTimeout(() => {
      const botResponse: Message = { 
        id: Date.now() + 1, 
        type: 'bot', 
        content: `I'll create a ${inputValue} icon with your style preferences: ${styleContext}. Generating now...` 
      };
      setMessages(prev => [...prev, botResponse]);
      setIsGenerating(false);
    }, 1000);
  };

  const toggleSize = (size: SizeKey) => {
    setSelectedSizes(prev => ({
      ...prev,
      [size]: !prev[size]
    }));
  };

  const togglePlatform = (platform: PlatformKey) => {
    setSelectedPlatforms(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }));
  };

  const selectAllSizes = () => {
    const allSelected = Object.values(selectedSizes).every(Boolean);
    const newState: Record<SizeKey, boolean> = {} as Record<SizeKey, boolean>;
    (Object.keys(selectedSizes) as SizeKey[]).forEach(size => {
      newState[size] = !allSelected;
    });
    setSelectedSizes(newState);
  };

  const getSelectedCount = () => {
    let count = 0;
    (Object.entries(selectedPlatforms) as [PlatformKey, boolean][]).forEach(([platform, isSelected]) => {
      if (isSelected) {
        count += platformSizes[platform].length;
      }
    });
    return count;
  };

  const toggleEffect = (effect: string) => {
    setStyleOptions(prev => ({
      ...prev,
      effects: prev.effects.includes(effect)
        ? prev.effects.filter(e => e !== effect)
        : [...prev.effects, effect]
    }));
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)] relative">
      {/* Header */}
      <div className="relative z-10 flex justify-between items-center mb-8 p-6">
        <div>
          <h1 className="text-4xl font-bold text-[var(--text-primary)]">
            Icon Generator Pro
          </h1>
          <p className="text-[var(--text-secondary)] mt-2">AI-powered icon creation with smart packaging</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Import
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative px-6 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Preview Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Icon Preview */}
            <div className="card">
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Icon Preview</h3>
              <div className="grid grid-cols-4 gap-4">
                {[16, 32, 64, 128].map(size => (
                  <div key={size} className="aspect-square bg-[var(--bg-secondary)] rounded-xl flex items-center justify-center border border-[var(--border-color)] hover:border-accent transition-colors">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-accent rounded-lg mx-auto mb-2"></div>
                      <span className="text-xs text-[var(--text-secondary)]">{size}px</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform Selection */}
            <div className="card">
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Platform Packages</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(Object.entries(selectedPlatforms) as [PlatformKey, boolean][]).map(([platform, isSelected]) => (
                  <button
                    key={platform}
                    onClick={() => togglePlatform(platform)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isSelected 
                        ? 'border-accent bg-accent/10 text-[var(--text-primary)]' 
                        : 'border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                    }`}
                  >
                    <div className="text-center">
                      <span className="font-medium capitalize">{platform}</span>
                      <div className="text-xs mt-1 text-[var(--text-secondary)]">
                        {platformSizes[platform].length} sizes
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Messages Display */}
            <div className="card">
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-4">AI Conversation</h3>
              <div className="h-64 overflow-y-auto space-y-3">
                {messages.map(message => (
                  <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      message.type === 'user' 
                        ? 'bg-accent text-white' 
                        : 'bg-[var(--bg-secondary)] text-[var(--text-primary)]'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isGenerating && (
                  <div className="flex justify-start">
                    <div className="bg-[var(--bg-secondary)] text-[var(--text-primary)] px-4 py-2 rounded-2xl">
                      <div className="flex items-center gap-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-accent rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-accent rounded-full animate-bounce delay-100"></div>
                          <div className="w-2 h-2 bg-accent rounded-full animate-bounce delay-200"></div>
                        </div>
                        <span className="text-sm">Generating...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Download Options */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="card">
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Download Options</h3>
              <div className="space-y-3">
                <button className="btn-primary w-full flex items-center justify-center gap-2">
                  <Package className="w-5 h-5" />
                  Complete Package ({getSelectedCount()} files)
                </button>
                <button className="btn-secondary w-full flex items-center justify-center gap-2">
                  <Download className="w-5 h-5" />
                  Individual Downloads
                </button>
              </div>
            </div>

            {/* Size Selection */}
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">Custom Sizes</h3>
                <button 
                  onClick={selectAllSizes}
                  className="text-accent hover:text-accent/80 text-sm"
                >
                  {Object.values(selectedSizes).every(Boolean) ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(selectedSizes) as [SizeKey, boolean][]).map(([size, isSelected]) => (
                  <button
                    key={size}
                    onClick={() => toggleSize(size)}
                    className={`p-2 rounded-lg text-sm transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-accent/10 text-accent border border-accent'
                        : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] hover:bg-[var(--bg-tertiary)]'
                    }`}
                  >
                    <span>{size}</span>
                    {isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Chat Input */}
      <div className="sticky bottom-6 left-6 right-6 z-50">
        <div className="max-w-4xl mx-auto">
          <div className="relative backdrop-blur-md bg-[var(--bg-primary)]/80 border border-[var(--border-color)]/50 rounded-2xl shadow-lg">
            <div className="p-4">
              <div className="relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Describe your icon: 'Modern shopping cart icon with gradient'"
                  className="w-full pr-24 pl-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                  <button 
                    onClick={() => setSettingsOpen(true)}
                    className="btn-secondary p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
                    title="Style Settings"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim()}
                    className="btn-primary p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Style Settings Modal */}
      {settingsOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                  <Palette className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)]">AI Style Settings</h3>
                  <p className="text-xs text-[var(--text-secondary)]">Customize your icon generation preferences</p>
                </div>
              </div>
              <button 
                onClick={() => setSettingsOpen(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Style */}
              <div>
                <label className="block text-[var(--text-secondary)] mb-2 text-sm font-medium">Icon Style</label>
                <select 
                  value={styleOptions.style}
                  onChange={(e) => setStyleOptions(prev => ({...prev, style: e.target.value}))}
                  className="input w-full"
                >
                  {styleOptionsConfig.style.map(style => (
                    <option key={style} value={style}>{style.charAt(0).toUpperCase() + style.slice(1).replace('-', ' ')}</option>
                  ))}
                </select>
              </div>

              {/* Theme */}
              <div>
                <label className="block text-[var(--text-secondary)] mb-2 text-sm font-medium">Theme</label>
                <select 
                  value={styleOptions.theme}
                  onChange={(e) => setStyleOptions(prev => ({...prev, theme: e.target.value}))}
                  className="input w-full"
                >
                  {styleOptionsConfig.theme.map(theme => (
                    <option key={theme} value={theme}>{theme.charAt(0).toUpperCase() + theme.slice(1)}</option>
                  ))}
                </select>
              </div>

              {/* Primary Color */}
              <div>
                <label className="block text-[var(--text-secondary)] mb-2 text-sm font-medium">Primary Color</label>
                <div className="flex gap-2">
                  <input 
                    type="color" 
                    value={styleOptions.primaryColor}
                    onChange={(e) => setStyleOptions(prev => ({...prev, primaryColor: e.target.value}))}
                    className="w-12 h-10 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)]" 
                  />
                  <input 
                    type="text" 
                    value={styleOptions.primaryColor}
                    onChange={(e) => setStyleOptions(prev => ({...prev, primaryColor: e.target.value}))}
                    className="input flex-1"
                  />
                </div>
              </div>

              {/* Secondary Color */}
              <div>
                <label className="block text-[var(--text-secondary)] mb-2 text-sm font-medium">Secondary Color</label>
                <div className="flex gap-2">
                  <input 
                    type="color" 
                    value={styleOptions.secondaryColor}
                    onChange={(e) => setStyleOptions(prev => ({...prev, secondaryColor: e.target.value}))}
                    className="w-12 h-10 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)]" 
                  />
                  <input 
                    type="text" 
                    value={styleOptions.secondaryColor}
                    onChange={(e) => setStyleOptions(prev => ({...prev, secondaryColor: e.target.value}))}
                    className="input flex-1"
                  />
                </div>
              </div>

              {/* Background Style */}
              <div>
                <label className="block text-[var(--text-secondary)] mb-2 text-sm font-medium">Background Style</label>
                <select 
                  value={styleOptions.backgroundStyle}
                  onChange={(e) => setStyleOptions(prev => ({...prev, backgroundStyle: e.target.value}))}
                  className="input w-full"
                >
                  {styleOptionsConfig.backgroundStyle.map(bg => (
                    <option key={bg} value={bg}>{bg.charAt(0).toUpperCase() + bg.slice(1)}</option>
                  ))}
                </select>
              </div>

              {/* Icon Complexity */}
              <div>
                <label className="block text-[var(--text-secondary)] mb-2 text-sm font-medium">Icon Complexity</label>
                <select 
                  value={styleOptions.iconComplexity}
                  onChange={(e) => setStyleOptions(prev => ({...prev, iconComplexity: e.target.value}))}
                  className="input w-full"
                >
                  {styleOptionsConfig.iconComplexity.map(complexity => (
                    <option key={complexity} value={complexity}>{complexity.charAt(0).toUpperCase() + complexity.slice(1)}</option>
                  ))}
                </select>
              </div>

              {/* Corners */}
              <div>
                <label className="block text-[var(--text-secondary)] mb-2 text-sm font-medium">Corner Style</label>
                <select 
                  value={styleOptions.corners}
                  onChange={(e) => setStyleOptions(prev => ({...prev, corners: e.target.value}))}
                  className="input w-full"
                >
                  {styleOptionsConfig.corners.map(corner => (
                    <option key={corner} value={corner}>{corner.charAt(0).toUpperCase() + corner.slice(1)}</option>
                  ))}
                </select>
              </div>

              {/* Mood */}
              <div>
                <label className="block text-[var(--text-secondary)] mb-2 text-sm font-medium">Mood</label>
                <select 
                  value={styleOptions.mood}
                  onChange={(e) => setStyleOptions(prev => ({...prev, mood: e.target.value}))}
                  className="input w-full"
                >
                  {styleOptionsConfig.mood.map(mood => (
                    <option key={mood} value={mood}>{mood.charAt(0).toUpperCase() + mood.slice(1)}</option>
                  ))}
                </select>
              </div>

              {/* Effects */}
              <div className="md:col-span-2">
                <label className="block text-[var(--text-secondary)] mb-3 text-sm font-medium">Visual Effects</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {styleOptionsConfig.effects.map(effect => (
                    <button
                      key={effect}
                      onClick={() => toggleEffect(effect)}
                      className={`p-2 rounded-lg text-sm transition-all flex items-center justify-center gap-2 ${
                        styleOptions.effects.includes(effect)
                          ? 'bg-accent/10 text-accent border border-accent'
                          : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] hover:bg-[var(--bg-tertiary)]'
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{effect.charAt(0).toUpperCase() + effect.slice(1)}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-[var(--border-color)]">
              <button 
                onClick={() => setSettingsOpen(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={() => setSettingsOpen(false)}
                className="btn-primary"
              >
                Apply Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;