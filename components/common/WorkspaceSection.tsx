import React from 'react';


interface WorkspaceSectionProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  divider?: boolean;
}

export function WorkspaceSection({
  children,
  header,
  description,
  className,
  contentClassName,
  divider = true,
}: WorkspaceSectionProps) {
  return (
    <div className={`bg-white py-6 ${divider ? 'border-b border-gray-200 last:border-b-0' : ''} ${className || ''}`}>
      {(header || description) && (
        <div className="mb-6 px-6">
          {header && <h3 className="text-lg font-medium text-gray-900">{header}</h3>}
          {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
        </div>
      )}
      <div className={`px-6 ${contentClassName || ''}`}>
        {children}
      </div>
    </div>
  );
}
