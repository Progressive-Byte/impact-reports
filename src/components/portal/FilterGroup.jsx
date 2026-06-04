import React from 'react';
import SafeIcon from '../../common/SafeIcon';
import CollapsibleSection from '../CollapsibleSection';

const FilterGroup = ({ title, options, selected, isOpen, onToggle, onOptionToggle }) => (
  <CollapsibleSection title={title} isOpen={isOpen} onToggle={onToggle} variant="filter">
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = selected.includes(option);
        return (
          <button
            key={option}
            onClick={() => onOptionToggle(option)}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-bold transition-all border ${
              isSelected
                ? 'bg-[#E52321] text-white border-[#E52321] shadow-lg shadow-red-500/20'
                : 'bg-white text-gray-700 border-gray-100 hover:border-[#E52321]/25 hover:text-[#E52321]'
            }`}
          >
            <span className="max-w-[170px] truncate">{option}</span>
            {isSelected && <SafeIcon icon="FiCheck" className="text-sm" />}
          </button>
        );
      })}
    </div>
  </CollapsibleSection>
);

export default FilterGroup;
