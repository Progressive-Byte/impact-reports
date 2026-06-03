import React from 'react';
import * as FiIcons from 'react-icons/fi';

const SafeIcon = ({ icon, name, ...props }) => {
  let IconComponent = FiIcons.FiCheck; // Default safe fallback

  try {
    if (typeof icon === 'string' && FiIcons[icon]) {
      IconComponent = FiIcons[icon];
    } else if (typeof icon === 'function' || typeof icon === 'object') {
      IconComponent = icon;
    } else if (name && FiIcons[`Fi${name}`]) {
      IconComponent = FiIcons[`Fi${name}`];
    } else if (name && FiIcons[name]) {
      IconComponent = FiIcons[name];
    }
  } catch (e) {
    console.error("SafeIcon error:", e);
  }

  return <IconComponent {...props} />;
};

export default SafeIcon;