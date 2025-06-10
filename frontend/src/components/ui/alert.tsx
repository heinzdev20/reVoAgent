import React from 'react';

interface AlertProps {
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'warning';
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({ 
  children, 
  variant = 'default', 
  className = '' 
}) => {
  const variantClasses = {
    default: 'bg-blue-50 border-blue-200 text-blue-800',
    destructive: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800'
  };
  
  return (
    <div className={`border rounded-md p-4 ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
};

export const AlertDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <div className={`text-sm ${className}`}>
    {children}
  </div>
);