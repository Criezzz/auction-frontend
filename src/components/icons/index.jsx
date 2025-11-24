// Custom icon components to replace emojis
// These follow the semantic naming and structure as requested

import React from 'react'

// Base icon component for consistent styling
const BaseIcon = ({ className = "", children }) => (
  <svg 
    className={`${className}`} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    {children}
  </svg>
)

// User/Profile icons
export const UserCircle = ({ className = "w-12 h-12 lg:w-16 lg:h-16" }) => (
  <BaseIcon className={className}>
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
    />
  </BaseIcon>
)

export const User = ({ className = "w-12 h-12 lg:w-16 lg:h-16" }) => (
  <BaseIcon className={className}>
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
    />
  </BaseIcon>
)

// File/Document icons
export const FileText = ({ className = "w-12 h-12 lg:w-16 lg:h-16" }) => (
  <BaseIcon className={className}>
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
    />
  </BaseIcon>
)

// Payment/Wallet icons
export const Wallet = ({ className = "w-12 h-12 lg:w-16 lg:h-16" }) => (
  <BaseIcon className={className}>
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" 
    />
  </BaseIcon>
)

export const CreditCard = ({ className = "w-12 h-12 lg:w-16 lg:h-16" }) => (
  <BaseIcon className={className}>
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" 
    />
  </BaseIcon>
)

// Authentication icons
export const LogIn = ({ className = "w-12 h-12 lg:w-16 lg:h-16" }) => (
  <BaseIcon className={className}>
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" 
    />
  </BaseIcon>
)

export const Key = ({ className = "w-12 h-12 lg:w-16 lg:h-16" }) => (
  <BaseIcon className={className}>
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" 
    />
  </BaseIcon>
)

// Navigation/Action icons
export const Building = ({ className = "w-12 h-12 lg:w-16 lg:h-16" }) => (
  <BaseIcon className={className}>
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" 
    />
  </BaseIcon>
)

export const Crown = ({ className = "w-12 h-12 lg:w-16 lg:h-16" }) => (
  <BaseIcon className={className}>
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M5 8l5 5m0 0l5 5m-5-5h12m0 0l-5-5m5 5l-5 5" 
    />
  </BaseIcon>
)

export const DollarSign = ({ className = "w-12 h-12 lg:w-16 lg:h-16" }) => (
  <BaseIcon className={className}>
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" 
    />
  </BaseIcon>
)

export const Trophy = ({ className = "w-12 h-12 lg:w-16 lg:h-16" }) => (
  <BaseIcon className={className}>
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" 
    />
  </BaseIcon>
)

export const Package = ({ className = "w-12 h-12 lg:w-16 lg:h-16" }) => (
  <BaseIcon className={className}>
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" 
    />
  </BaseIcon>
)

export const Target = ({ className = "w-12 h-12 lg:w-16 lg:h-16" }) => (
  <BaseIcon className={className}>
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
    />
  </BaseIcon>
)

// Notification icons
export const Bell = ({ className = "w-6 h-6" }) => (
  <BaseIcon className={className}>
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
    />
  </BaseIcon>
)

// Utility icons
export const LogOut = ({ className = "w-12 h-12 lg:w-16 lg:h-16" }) => (
  <BaseIcon className={className}>
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" 
    />
  </BaseIcon>
)

// Small notification icons for notification types
export const ArrowDown = ({ className = "w-4 h-4" }) => (
  <BaseIcon className={className}>
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M19 14l-7 7m0 0l-7-7m7 7V3" 
    />
  </BaseIcon>
)

export const Clock = ({ className = "w-4 h-4" }) => (
  <BaseIcon className={className}>
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
    />
  </BaseIcon>
)

// Common UI patterns
export const IconWithText = ({ icon: IconComponent, text, className = "" }) => (
  <div className={`flex flex-col items-center gap-2 ${className}`}>
    <IconComponent />
    <span className="text-sm font-medium">{text}</span>
  </div>
)

export const HeaderWithIcon = ({ icon: IconComponent, title, children }) => (
  <div className="flex items-center justify-between">
    <div className="flex-1 flex justify-center">
      <div className="flex flex-col items-center gap-2">
        <IconComponent />
        <h1 className="text-2xl font-display">{title}</h1>
      </div>
    </div>
    {children}
  </div>
)