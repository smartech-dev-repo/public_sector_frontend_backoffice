"use client";

import { useEffect, useMemo, useState } from 'react';
import { User } from 'lucide-react';

const SIZES = {
 sm: 'w-8 h-8 text-[11px]',
 md: 'w-10 h-10 text-sm',
};

const TONES = [
 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300',
 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
];

const initialsOf = (name: string) => {
 const words = name.trim().split(/\s+/).filter((word) => /^[\p{L}\p{N}]/u.test(word));
 if (words.length === 0) return '';
 const first = words[0][0];
 const last = words.length > 1 ? words[words.length - 1][0] : '';
 return (first + last).toUpperCase();
};

// The same person always gets the same colour, on every list and every visit.
const toneOf = (name: string) => {
 const hash = [...name].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) >>> 0, 7);
 return TONES[hash % TONES.length];
};

interface AvatarProps {
 name?: string | null;
 /** Photos in order of preference; a missing or unloadable one falls through to the next. */
 sources?: (string | null | undefined)[];
 size?: keyof typeof SIZES;
}

export default function Avatar({ name, sources = [], size = 'md' }: AvatarProps) {
 const candidates = useMemo(() => sources.filter(Boolean) as string[], [sources.join('|')]); // eslint-disable-line react-hooks/exhaustive-deps
 const [index, setIndex] = useState(0);

 useEffect(() => { setIndex(0); }, [candidates]);

 const shape = `${SIZES[size]} rounded-full shrink-0 overflow-hidden inline-flex items-center justify-center font-semibold`;
 const source = candidates[index];

 if (source) {
  return (
   <span className={`${shape} bg-muted`}>
    <img
     src={source}
     alt={name ? `${name}'s photo` : 'Photo'}
     loading="lazy"
     referrerPolicy="no-referrer"
     onError={() => setIndex((current) => current + 1)}
     className="w-full h-full object-cover"
    />
   </span>
  );
 }

 const label = name?.trim() ?? '';
 const initials = initialsOf(label);
 return (
  <span aria-hidden="true" className={`${shape} ${toneOf(label)}`}>
   {initials || <User className="w-1/2 h-1/2" />}
  </span>
 );
}
