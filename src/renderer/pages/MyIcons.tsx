import React, { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiGrid, FiList, FiDownload, FiTrash2, FiEdit2, FiCopy, FiPackage } from 'react-icons/fi';
import { useIcons } from '../hooks/useIcons';

const MyIcons: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIcons, setSelectedIcons] = useState<string[]>([]);
  
  const { icons, loading, error, deleteMultipleIcons, searchIcons, exportSingleIcon, exportIcon } = useIcons();

  useEffect(() => {
    if (searchQuery) {
      const delayDebounce = setTimeout(() => {
        searchIcons(searchQuery);
      }, 300);
      return () => clearTimeout(delayDebounce);
    } else {
      searchIcons('');
    }
  }, [searchQuery, searchIcons]);

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

  const handleDeleteSelected = async () => {
    if (selectedIcons.length === 0) return;
    
    const count = await deleteMultipleIcons(selectedIcons);
    if (count && count > 0) {
      setSelectedIcons([]);
    }
  };

  const handleExportSingle = async (iconId: string, format: string, size?: string) => {
    const filePath = await exportSingleIcon(iconId, format, size);
    if (filePath) {
      // Optionally show a success notification
      console.log('Exported to:', filePath);
    }
  };

  const handleExportPackage = async (iconId: string) => {
    const icon = icons.find(i => i.id === iconId);
    if (!icon) return;

    const filePath = await exportIcon({
      iconId,
      platforms: ['web', 'ios', 'android', 'mac'],
      sizes: icon.sizes,
      format: 'zip'
    });

    if (filePath) {
      // Optionally show a success notification
      console.log('Package exported to:', filePath);
    }
  };

  const renderIcon = (icon: typeof icons[0]) => {
    const isSelected = selectedIcons.includes(icon.id);
    
    const iconContent = (
      <>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => handleSelectIcon(icon.id)}
          className="absolute top-4 left-4 z-10"
        />
        
        <div className={`${viewMode === 'list' ? 'w-24 h-24' : 'aspect-square'} rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center p-4`}>
          {icon.formats.svg ? (
            <div 
              className="w-full h-full flex items-center justify-center"
              dangerouslySetInnerHTML={{ __html: icon.formats.svg }} 
            />
          ) : (
            <div className="w-16 h-16 bg-[var(--bg-tertiary)] rounded-lg"></div>
          )}
        </div>

        <div className={`flex-1 ${viewMode === 'list' ? 'flex items-center justify-between' : 'mt-4'}`}>
          <div>
            <h3 className="font-medium text-[var(--text-primary)]">{icon.name}</h3>
            <p className="text-sm text-[var(--text-secondary)] line-clamp-1">{icon.prompt}</p>
            <div className="mt-2 flex items-center space-x-2 text-sm text-[var(--text-secondary)]">
              <span>{icon.sizes.length} sizes</span>
              <span>•</span>
              <span>{icon.style}</span>
              <span>•</span>
              <span>{new Date(icon.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className={`flex items-center space-x-1 ${
            viewMode === 'list' ? 'ml-4' : 'mt-4'
          }`}>
            <button 
              className="p-2 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
              title="Edit"
            >
              <FiEdit2 className="w-4 h-4" />
            </button>
            <button 
              className="p-2 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
              title="Duplicate"
            >
              <FiCopy className="w-4 h-4" />
            </button>
            <div className="relative group">
              <button 
                className="p-2 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                title="Download"
              >
                <FiDownload className="w-4 h-4" />
              </button>
              {/* Download dropdown */}
              <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-primary)] rounded-lg shadow-lg border border-[var(--border-color)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                <div className="p-2">
                  <button
                    onClick={() => handleExportPackage(icon.id)}
                    className="w-full text-left px-3 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded flex items-center gap-2"
                  >
                    <FiPackage className="w-4 h-4" />
                    Export Package
                  </button>
                  <div className="border-t border-[var(--border-color)] my-1"></div>
                  {icon.formats.svg && (
                    <button
                      onClick={() => handleExportSingle(icon.id, 'svg')}
                      className="w-full text-left px-3 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded"
                    >
                      SVG
                    </button>
                  )}
                  {icon.formats.ico && (
                    <button
                      onClick={() => handleExportSingle(icon.id, 'ico')}
                      className="w-full text-left px-3 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded"
                    >
                      ICO
                    </button>
                  )}
                  {icon.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => handleExportSingle(icon.id, 'png', size)}
                      className="w-full text-left px-3 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded"
                    >
                      PNG {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );

    return (
      <div
        key={icon.id}
        className={`card group relative ${
          viewMode === 'list' ? 'flex items-center space-x-4' : ''
        }`}
      >
        {iconContent}
      </div>
    );
  };

  if (loading && icons.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--text-secondary)]">Loading icons...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-2">Error: {error}</p>
          <button className="btn-secondary" onClick={() => window.location.reload()}>
            Reload
          </button>
        </div>
      </div>
    );
  }

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
              onClick={handleSelectAll}
              className="btn-secondary"
            >
              {selectedIcons.length === icons.length ? 'Deselect All' : 'Select All'}
            </button>
            <button
              onClick={handleDeleteSelected}
              className="btn-danger flex items-center gap-2"
            >
              <FiTrash2 className="w-4 h-4" />
              <span>Delete ({selectedIcons.length})</span>
            </button>
          </div>
        )}
      </div>

      {/* Icons Grid/List */}
      {icons.length > 0 ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
          {icons.map(renderIcon)}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center">
            <FiGrid className="w-8 h-8 text-[var(--text-secondary)]" />
          </div>
          <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">No Icons Found</h3>
          <p className="text-[var(--text-secondary)]">
            {searchQuery ? 'No icons match your search.' : 'Start creating your first icon to see it here.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default MyIcons;