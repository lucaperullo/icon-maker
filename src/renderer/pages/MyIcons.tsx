import React, { useState } from 'react';
import { FiSearch, FiFilter, FiGrid, FiList, FiDownload, FiTrash2, FiEdit2, FiCopy } from 'react-icons/fi';

interface Icon {
  id: string;
  name: string;
  prompt: string;
  size: string;
  style: string;
  color: string;
  createdAt: string;
  svg: string;
}

const MyIcons: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIcons, setSelectedIcons] = useState<string[]>([]);

  // Mock data - replace with actual data from your backend
  const icons: Icon[] = [
    {
      id: '1',
      name: 'Home Icon',
      prompt: 'A simple house icon with a door and windows',
      size: '64x64',
      style: 'minimal',
      color: '#6B7280',
      createdAt: '2024-03-20',
      svg: '<svg>...</svg>'
    },
    // Add more mock icons here
  ];

  const handleSelectIcon = (iconId: string) => {
    setSelectedIcons(prev => 
      prev.includes(iconId) 
        ? prev.filter(id => id !== iconId)
        : [...prev, iconId]
    );
  };

  const handleSelectAll = () => {
    setSelectedIcons(prev => 
      prev.length === icons.length 
        ? [] 
        : icons.map(icon => icon.id)
    );
  };

  const handleDeleteSelected = () => {
    // Implement delete functionality
    console.log('Deleting icons:', selectedIcons);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">My Icons</h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
          >
            {viewMode === 'grid' ? <FiList className="w-5 h-5" /> : <FiGrid className="w-5 h-5" />}
          </button>
          <button className="btn-primary flex items-center gap-2">
            <FiFilter className="w-5 h-5" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search icons..."
            className="input pl-12"
          />
        </div>
        {selectedIcons.length > 0 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDeleteSelected}
              className="btn-danger flex items-center gap-2"
            >
              <FiTrash2 className="w-4 h-4" />
              <span>Delete Selected</span>
            </button>
          </div>
        )}
      </div>

      {/* Icons Grid/List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
        {icons.map((icon) => (
          <div
            key={icon.id}
            className={`card group relative ${
              viewMode === 'list' ? 'flex items-center space-x-4' : ''
            }`}
          >
            <input
              type="checkbox"
              checked={selectedIcons.includes(icon.id)}
              onChange={() => handleSelectIcon(icon.id)}
              className="absolute top-4 left-4 z-10"
            />
            
            <div className={`${viewMode === 'list' ? 'w-24 h-24' : 'aspect-square'} rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center`}>
              <div dangerouslySetInnerHTML={{ __html: icon.svg }} />
            </div>

            <div className={`flex-1 ${viewMode === 'list' ? 'flex items-center justify-between' : 'mt-4'}`}>
              <div>
                <h3 className="font-medium text-[var(--text-primary)]">{icon.name}</h3>
                <p className="text-sm text-[var(--text-secondary)]">{icon.prompt}</p>
                <div className="mt-2 flex items-center space-x-2 text-sm text-[var(--text-secondary)]">
                  <span>{icon.size}</span>
                  <span>•</span>
                  <span>{icon.style}</span>
                  <span>•</span>
                  <span>{icon.createdAt}</span>
                </div>
              </div>

              <div className={`flex items-center space-x-2 ${
                viewMode === 'list' ? 'ml-4' : 'mt-4'
              }`}>
                <button className="p-2 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]">
                  <FiEdit2 className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]">
                  <FiCopy className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]">
                  <FiDownload className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {icons.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center">
            <FiGrid className="w-8 h-8 text-[var(--text-secondary)]" />
          </div>
          <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">No Icons Found</h3>
          <p className="text-[var(--text-secondary)]">Start creating your first icon to see it here.</p>
        </div>
      )}
    </div>
  );
};

export default MyIcons; 