"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

export interface TableDropdownProps {
  children?: React.ReactNode;
}

export default function TableDropdown({ children }: TableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState({ top: '0px', left: '0px' });
  const uid = useRef(Math.random().toString(36).substring(2, 9)).current;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = useCallback(() => {
    if (!buttonRef.current || !isOpen || !menuRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const menuHeight = menuRef.current.offsetHeight || 150;
    
    // Try to position below
    let top = rect.bottom + 4;
    let left = rect.right - 192; // 192 is w-48
    
    // Basic bounds checking (if it goes off screen bottom)
    if (top + menuHeight > window.innerHeight) {
      top = rect.top - menuHeight - 4; // render above
    }
    
    setDropdownStyle({
      top: `${top}px`,
      left: `${left}px`
    });
  }, [isOpen]);

  const toggle = () => {
    if (!isOpen) {
      window.dispatchEvent(new CustomEvent('close-table-dropdowns', { detail: uid }));
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (isOpen) {
      // Need a slight delay for menuRef to populate if we just opened it
      requestAnimationFrame(() => {
        updatePosition();
      });
    }
  }, [isOpen, updatePosition]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      }
    };

    const handleScroll = () => {
      if (isOpen) {
        updatePosition();
      }
    };

    const handleCloseDropdowns = (e: any) => {
      if (e.detail !== uid) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);
    window.addEventListener('close-table-dropdowns', handleCloseDropdowns as EventListener);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
      window.removeEventListener('close-table-dropdowns', handleCloseDropdowns as EventListener);
    };
  }, [isOpen, uid, updatePosition]);

  return (
    <div ref={containerRef} className="inline-block">
      <button ref={buttonRef} onClick={toggle} type="button" className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
        </svg>
      </button>
      
      {mounted && isOpen && createPortal(
        <div 
          ref={menuRef} 
          onClick={() => setIsOpen(false)} 
          style={dropdownStyle} 
          className="fixed z-[9999] w-48 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden text-left flex flex-col py-1 animate-dropdown-in"
        >
          {children}
        </div>,
        document.body
      )}

      {mounted && (
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes dropdown-in {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-dropdown-in {
            animation: dropdown-in 0.1s ease-out;
            transform-origin: top right;
          }
        `}} />
      )}
    </div>
  );
}
