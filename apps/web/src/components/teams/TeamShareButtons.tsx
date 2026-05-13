'use client';

import { useState } from 'react';

interface TeamShareButtonsProps {
  inviteCode: string;
  teamName: string;
  /** Labels traducidos pre-resueltos en el server. */
  labels: {
    copyUrl: string;
    copied: string;
    shareWhatsApp: string;
    inviteMessage: string;
  };
}

/**
 * Botones de share para invitar estudiantes a un equipo.
 *
 * - 📋 Copiar URL al clipboard
 * - 📱 Compartir por WhatsApp (abre wa.me con mensaje pre-armado)
 *
 * Client Component porque usa window.location (para origin absoluto) +
 * navigator.clipboard (para copy).
 */
export function TeamShareButtons({ inviteCode, teamName, labels }: TeamShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const getInviteUrl = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const locale = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : 'es';
    return `${origin}/${locale}/join/${inviteCode}`;
  };

  const copyToClipboard = async () => {
    const url = getInviteUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const getWhatsAppUrl = () => {
    const url = getInviteUrl();
    const message = labels.inviteMessage.replace('{teamName}', teamName).replace('{url}', url);
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          void copyToClipboard();
        }}
        className="inline-flex items-center gap-1.5 rounded-md border-2 border-numoria-niebla/40 bg-white px-3 py-1.5 text-xs font-bold text-numoria-mid transition hover:border-numoria-orange hover:text-numoria-orange"
      >
        📋 {copied ? labels.copied : labels.copyUrl}
      </button>
      <a
        href={getWhatsAppUrl()}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="inline-flex items-center gap-1.5 rounded-md border-2 border-numoria-teal/40 bg-white px-3 py-1.5 text-xs font-bold text-numoria-teal transition hover:border-numoria-teal hover:bg-numoria-teal/5"
      >
        📱 {labels.shareWhatsApp}
      </a>
    </div>
  );
}
