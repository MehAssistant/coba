import React from 'react';
import * as Icons from 'lucide-react';

interface IconHelperProps {
  name: string;
  className?: string;
  size?: number;
}

export const IconHelper: React.FC<IconHelperProps> = ({ name, className = '', size = 20 }) => {
  // Safe lookup for Lucide icons
  const IconComponent = (Icons as any)[name];
  
  if (!IconComponent) {
    // Fallback to Wallet icon if not found
    return <Icons.Wallet className={className} size={size} />;
  }
  
  return <IconComponent className={className} size={size} />;
};

export default IconHelper;
