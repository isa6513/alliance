import type { FieldWrapperProps } from './types';

export function FieldWrapper({ onRemove, children, onDragStart, onDragEnd, isDragging }: FieldWrapperProps) {
  return (
    <div className={`group relative border rounded-lg p-4 pl-8 transition-all ${
      isDragging 
        ? "border-blue-400 shadow-lg opacity-50" 
        : "border-gray-200 hover:border-gray-300"
    }`}>
      {/* Drag handle */}
      <div 
        className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity"
        draggable
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        title="Drag to reorder"
      >
        <div className="text-gray-400 hover:text-gray-600 p-1">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <circle cx="2" cy="2" r="1"/>
            <circle cx="6" cy="2" r="1"/>
            <circle cx="2" cy="6" r="1"/>
            <circle cx="6" cy="6" r="1"/>
            <circle cx="2" cy="10" r="1"/>
            <circle cx="6" cy="10" r="1"/>
          </svg>
        </div>
      </div>
      
      {/* Remove button */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onRemove}
          className="text-gray-400 hover:text-red-500 w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-50"
          title="Remove field"
        >
          ×
        </button>
      </div>
      {children}
    </div>
  );
}