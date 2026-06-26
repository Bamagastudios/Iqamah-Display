import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QrCodeProps {
  value: string;
  size?: number;
  dark?: string;
  light?: string;
}

/** A real, scannable QR rendered from `value` (e.g. the donate URL). */
export function QrCode({ value, size = 200, dark = '#10161D', light = '#FFFFFF' }: QrCodeProps) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(value, { margin: 1, width: size * 2, color: { dark, light } })
      .then((url) => {
        if (active) setSrc(url);
      })
      .catch(() => {
        if (active) setSrc(null);
      });
    return () => {
      active = false;
    };
  }, [value, size, dark, light]);

  return src ? (
    <img src={src} width={size} height={size} alt="" style={{ display: 'block', borderRadius: 6 }} />
  ) : (
    <div style={{ width: size, height: size }} />
  );
}
