"use client";

import { useEffect } from 'react';

const BOX = '.overflow-x-auto:has(> table), .overflow-auto:has(> table)';

/** Marks whether columns are scrolled out of view on either side of a table's scroll box. */
function mark(box: HTMLElement) {
 const hiddenRight = box.scrollWidth - box.clientWidth - box.scrollLeft;
 box.toggleAttribute('data-hidden-start', box.scrollLeft > 1);
 box.toggleAttribute('data-hidden-end', hiddenRight > 1);
}

/**
 * Keeps data-hidden-start / data-hidden-end up to date on every table scroll box inside `root`,
 * so the pinned columns (.pin-start / .pin-end in globals.css) show an edge only while there is
 * something behind them. Mounted once in the dashboard layout; tables need no wiring of their own.
 */
export default function TableScrollEdges({ root = 'main' }: { root?: string }) {
 useEffect(() => {
  const container = document.querySelector(root);
  if (!container) return;
  const watched = new WeakSet<Element>();
  const resize = new ResizeObserver((entries) => {
   entries.forEach((entry) => {
    const box = entry.target.matches(BOX) ? entry.target : entry.target.parentElement;
    if (box instanceof HTMLElement) mark(box);
   });
  });
  let frame = 0;
  const scan = () => {
   cancelAnimationFrame(frame);
   frame = requestAnimationFrame(() => {
    container.querySelectorAll<HTMLElement>(BOX).forEach((box) => {
     if (!watched.has(box)) {
      watched.add(box);
      resize.observe(box);
      if (box.firstElementChild) resize.observe(box.firstElementChild);
     }
     mark(box);
    });
   });
  };
  const onScroll = (event: Event) => {
   const target = event.target;
   if (target instanceof HTMLElement && watched.has(target)) mark(target);
  };
  const mutations = new MutationObserver(scan);
  mutations.observe(container, { childList: true, subtree: true });
  container.addEventListener('scroll', onScroll, { capture: true, passive: true });
  scan();
  return () => {
   cancelAnimationFrame(frame);
   mutations.disconnect();
   resize.disconnect();
   container.removeEventListener('scroll', onScroll, { capture: true });
  };
 }, [root]);
 return null;
}
