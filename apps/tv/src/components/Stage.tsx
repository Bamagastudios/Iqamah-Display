import { useEffect, useState, type ReactNode } from 'react';

const BOARD_W = 1920;
const BOARD_H = 1080;

/**
 * Scales the fixed 1920×1080 board to fit the actual screen (TV, phone, browser),
 * centered with letterboxing, never scrolling. Fire TV WebViews don't shrink a
 * fixed-size page on their own, so we compute the fit factor ourselves.
 */
export function Stage({ children, offset }: { children: ReactNode; offset?: { dx: number; dy: number } }) {
  const [scale, setScale] = useState(1);
  const { dx = 0, dy = 0 } = offset ?? {};

  useEffect(() => {
    function fit() {
      const w = window.innerWidth || BOARD_W;
      const h = window.innerHeight || BOARD_H;
      setScale(Math.min(w / BOARD_W, h / BOARD_H));
    }
    fit();
    // settle late layout on some TV WebViews
    const t = setTimeout(fit, 300);
    window.addEventListener('resize', fit);
    window.addEventListener('orientationchange', fit);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', fit);
      window.removeEventListener('orientationchange', fit);
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        background: '#171b22',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: BOARD_W,
          height: BOARD_H,
          flex: 'none',
          transform: `scale(${scale}) translate(${dx}px, ${dy}px)`,
          transformOrigin: 'center center',
          transition: 'transform 2s ease-in-out',
        }}
      >
        {children}
      </div>
    </div>
  );
}
