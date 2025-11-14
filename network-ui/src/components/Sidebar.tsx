import { useState, useEffect } from 'react';
import { searchActors } from '../api';
import type { Stats, Actor, TagCluster } from '../types';

interface SidebarProps {
  stats: Stats | null;
  selectedActor: string | null;
  onActorSelect: (actor: string | null) => void;
  limit: number;
  onLimitChange: (limit: number) => void;
  tagClusters: TagCluster[];
  enabledClusterIds: Set<number>;
  onToggleCluster: (clusterId: number) => void;
}

export default function Sidebar({
  stats,
  selectedActor,
  onActorSelect,
  limit,
  onLimitChange,
  tagClusters,
  enabledClusterIds,
  onToggleCluster
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Actor[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);

  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const results = await searchActors(searchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  return (
    <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
      {/* Header */}
      <div className="px-6 py-3 border-b border-gray-700">
        <h1 className="font-bold text-blue-400" style={{ fontSize: '20px' }}>
          📊 The Epstein Network
        </h1>
      </div>

      {/* Stats */}
      {stats && (
        <div className="p-4 border-b border-gray-700">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Documents:</span>
              <span className="font-mono text-green-400">
                {stats.totalDocuments.count.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Relationships:</span>
              <span className="font-mono text-blue-400">
                {stats.totalTriples.count.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Actors:</span>
              <span className="font-mono text-purple-400">
                {stats.totalActors.count.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold mb-3">Controls</h2>

        {/* Limit Slider */}
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2">
            Relationships to display: {limit}
          </label>
          <input
            type="range"
            min="100"
            max="20000"
            step="500"
            value={limit}
            onChange={(e) => onLimitChange(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Search */}
        <div className="mb-4 relative">
          <label className="block text-sm text-gray-400 mb-2">
            Search actors:
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="e.g., Jeffrey Epstein"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          />

          {/* Search Results */}
          {searchQuery.trim().length >= 2 && (
            <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {isSearching ? (
                <div className="px-3 py-2 text-sm text-gray-400">
                  Searching...
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((actor) => (
                  <button
                    key={actor.name}
                    onClick={() => {
                      onActorSelect(actor.name);
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-600 transition-colors border-b border-gray-600 last:border-b-0"
                  >
                    <div className="font-medium text-white">{actor.name}</div>
                    <div className="text-xs text-gray-400">
                      {actor.relationshipCount} relationships
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-gray-400">
                  No actors found
                </div>
              )}
            </div>
          )}
        </div>

        {/* Selected Actor Indicator */}
        {selectedActor && (
          <div className="mb-4">
            <div className="flex items-center justify-between bg-blue-900/30 border border-blue-700/50 rounded-lg p-3">
              <div>
                <div className="text-xs text-gray-400 mb-1">Selected actor:</div>
                <div className="font-medium text-blue-300">{selectedActor}</div>
              </div>
              <button
                onClick={() => onActorSelect(null)}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs font-medium transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tag Cluster Filters */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Content Filters</h2>
          <div className="flex gap-1.5">
            <button
              onClick={() => {
                tagClusters.forEach(cluster => {
                  if (!enabledClusterIds.has(cluster.id)) {
                    onToggleCluster(cluster.id);
                  }
                });
              }}
              className="px-1.5 py-0.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
              style={{ fontSize: '9px' }}
            >
              Select All
            </button>
            <button
              onClick={() => {
                tagClusters.forEach(cluster => {
                  if (enabledClusterIds.has(cluster.id)) {
                    onToggleCluster(cluster.id);
                  }
                });
              }}
              className="px-1.5 py-0.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
              style={{ fontSize: '9px' }}
            >
              Deselect All
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {tagClusters.map((cluster) => {
            const isEnabled = enabledClusterIds.has(cluster.id);
            return (
              <button
                key={cluster.id}
                onClick={() => onToggleCluster(cluster.id)}
                className={`px-3 py-1 rounded-full font-medium transition-colors ${
                  isEnabled
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
                style={{ fontSize: '10px' }}
                title={`${cluster.tagCount} tags: ${cluster.exemplars.join(', ')}`}
              >
                {cluster.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Categories */}
      {stats && (
        <div className="p-4 flex-1 overflow-y-auto">
          <button
            onClick={() => setCategoriesExpanded(!categoriesExpanded)}
            className="w-full flex items-center justify-between text-lg font-semibold mb-3 hover:text-blue-400 transition-colors"
          >
            <span>Document Categories</span>
            <span className="text-sm">{categoriesExpanded ? '▼' : '▶'}</span>
          </button>
          {categoriesExpanded && (
            <div className="space-y-2">
              {stats.categories.slice(0, 10).map((cat) => (
                <div
                  key={cat.category}
                  className="flex justify-between items-center bg-gray-700 rounded px-3 py-2 text-sm"
                >
                  <span className="text-gray-300 capitalize">
                    {cat.category.replace(/_/g, ' ')}
                  </span>
                  <span className="font-mono text-xs text-gray-400">
                    {cat.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="p-4 border-t border-gray-700 text-xs text-gray-500">
        <p>Click nodes to explore relationships</p>
        <p className="mt-1">Scroll to zoom • Drag to pan</p>
      </div>
    </div>
  );
}
