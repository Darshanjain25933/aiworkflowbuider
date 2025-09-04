import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface ToggleSwitchProps {
  isChecked: boolean;
  onChange: () => void;
  title?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ isChecked, onChange, title }) => {
  return (
    <button
      role="switch"
      aria-checked={isChecked}
      title={title}
      onClick={onChange}
      className="relative inline-flex items-center h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 dark:bg-gray-700 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
    >
      <span className="sr-only">Toggle Dark Mode</span>
      <span
        aria-hidden="true"
        className={`${
          isChecked ? 'translate-x-6' : 'translate-x-0.5'
        } pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out flex items-center justify-center`}
      >
        {isChecked ? (
            <Sun className="h-5 w-5 text-yellow-500" />
        ) : (
            <Moon className="h-5 w-5 text-gray-500" />
        )}
      </span>
    </button>
  );
};

export default ToggleSwitch;