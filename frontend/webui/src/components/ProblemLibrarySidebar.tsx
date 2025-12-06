import React, { useState, useEffect } from 'react';
import './ProblemLibrarySidebar.css';
import type { Problem, ProblemFilter } from '../types/problem';
import { getProblems, getTags, getAcceptanceRate, getDifficultyColor } from '../services/qduojService';

interface ProblemLibrarySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onProblemSelect?: (problem: Problem) => void;
}

const ProblemLibrarySidebar: React.FC<ProblemLibrarySidebarProps> = ({
  isOpen,
  onClose,
  onProblemSelect = () => {}
}) => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'Low' | 'Mid' | 'High' | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(true);

  // Load tags on mount
  useEffect(() => {
    loadTags();
  }, []);

  // Load problems when filters change
  useEffect(() => {
    loadProblems();
  }, [selectedTags, selectedDifficulty, searchKeyword]);

  const loadTags = async () => {
    try {
      const tags = await getTags();
      setAvailableTags(tags.sort());
    } catch (err) {
      console.error('Failed to load tags:', err);
    }
  };

  const loadProblems = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const filter: ProblemFilter = {
        keyword: searchKeyword || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        difficulty: selectedDifficulty || undefined,
        limit: 100,
      };
      
      const problemList = await getProblems(filter);
      setProblems(problemList);
    } catch (err) {
      setError('加载题目失败，请检查 QDUOJ 服务是否运行');
      console.error('Failed to load problems:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
  };

  const handleDifficultyChange = (difficulty: 'Low' | 'Mid' | 'High') => {
    setSelectedDifficulty(prev => prev === difficulty ? null : difficulty);
  };

  const handleClearFilters = () => {
    setSelectedTags([]);
    setSelectedDifficulty(null);
    setSearchKeyword('');
  };

  const hasActiveFilters = selectedTags.length > 0 || selectedDifficulty !== null || searchKeyword !== '';

  return (
    <div className={`problem-library-sidebar ${isOpen ? 'problem-sidebar-open' : ''}`}>
      <div className="problem-sidebar-content">
        {/* Header */}
        <div className="problem-sidebar-header">
          <h2 className="problem-sidebar-title">
            <i className="fas fa-book" style={{ marginRight: '8px' }}></i>
            题库
          </h2>
          <button 
            className="problem-sidebar-close"
            onClick={onClose}
            title="关闭题库"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Search Box */}
        <div className="problem-search-container">
          <div className="problem-search-box">
            <i className="fas fa-search problem-search-icon"></i>
            <input
              type="text"
              placeholder="搜索题目..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="problem-search-input"
            />
            {searchKeyword && (
              <button
                className="problem-search-clear"
                onClick={() => setSearchKeyword('')}
                title="清除搜索"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </div>

        {/* Filters Section */}
        <div className="problem-filters-section">
          <div className="problem-filters-header">
            <button
              className="problem-filters-toggle"
              onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
            >
              <i className={`fas ${isFiltersExpanded ? 'fa-chevron-down' : 'fa-chevron-right'}`}></i>
              <span>筛选器</span>
            </button>
            {hasActiveFilters && (
              <button
                className="problem-clear-filters"
                onClick={handleClearFilters}
                title="清除所有筛选"
              >
                <i className="fas fa-times"></i> 清除
              </button>
            )}
          </div>

          {isFiltersExpanded && (
            <div className="problem-filters-content">
              {/* Difficulty Filter */}
              <div className="problem-filter-group">
                <div className="problem-filter-label">难度</div>
                <div className="problem-difficulty-buttons">
                  {(['Low', 'Mid', 'High'] as const).map(difficulty => (
                    <button
                      key={difficulty}
                      className={`problem-difficulty-btn ${getDifficultyColor(difficulty)} ${
                        selectedDifficulty === difficulty ? 'active' : ''
                      }`}
                      onClick={() => handleDifficultyChange(difficulty)}
                    >
                      {difficulty === 'Low' ? '简单' : difficulty === 'Mid' ? '中等' : '困难'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags Filter */}
              <div className="problem-filter-group">
                <div className="problem-filter-label">
                  标签 {selectedTags.length > 0 && `(${selectedTags.length})`}
                </div>
                <div className="problem-tags-container">
                  {availableTags.length === 0 ? (
                    <div className="problem-no-tags">暂无标签</div>
                  ) : (
                    availableTags.map(tag => (
                      <label key={tag} className="problem-tag-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedTags.includes(tag)}
                          onChange={() => handleTagToggle(tag)}
                        />
                        <span className="problem-tag-label">{tag}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="problem-sidebar-divider"></div>

        {/* Problem List */}
        <div className="problem-list-container">
          <div className="problem-list-header">
            <span className="problem-count">
              {isLoading ? '加载中...' : `共 ${problems.length} 题`}
            </span>
            <button
              className="problem-refresh-btn"
              onClick={loadProblems}
              disabled={isLoading}
              title="刷新题目列表"
            >
              <i className={`fas fa-sync-alt ${isLoading ? 'fa-spin' : ''}`}></i>
            </button>
          </div>

          {error && (
            <div className="problem-error-message">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          <div className="problem-list">
            {problems.length === 0 && !isLoading && !error && (
              <div className="problem-empty-state">
                <i className="fas fa-inbox" style={{ fontSize: '48px', opacity: 0.3, marginBottom: '16px' }}></i>
                <p>暂无题目</p>
              </div>
            )}

            {problems.map(problem => (
              <div
                key={problem.id}
                className="problem-item"
                onClick={() => onProblemSelect(problem)}
              >
                <div className="problem-item-header">
                  <span className="problem-id">#{problem._id}</span>
                  <span className={`problem-difficulty-badge ${getDifficultyColor(problem.difficulty)}`}>
                    {problem.difficulty === 'Low' ? '简单' : problem.difficulty === 'Mid' ? '中等' : '困难'}
                  </span>
                </div>
                <div className="problem-title">{problem.title}</div>
                <div className="problem-stats">
                  <span title="通过数/提交数">
                    <i className="fas fa-check-circle"></i>
                    {problem.accepted_number} / {problem.submission_number}
                  </span>
                  <span title="通过率">
                    <i className="fas fa-percentage"></i>
                    {getAcceptanceRate(problem)}%
                  </span>
                </div>
                {problem.tags && problem.tags.length > 0 && (
                  <div className="problem-tags">
                    {problem.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="problem-tag">
                        {tag}
                      </span>
                    ))}
                    {problem.tags.length > 3 && (
                      <span className="problem-tag-more">+{problem.tags.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemLibrarySidebar;
