import React from 'react';

interface InputProps {
  type?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const Input: React.FC<InputProps> = ({ 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  disabled = false, 
  className = '' 
}) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${className}`}
    />
  );
};