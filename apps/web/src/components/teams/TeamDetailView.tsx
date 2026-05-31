'use client';

import { Link, useRouter } from '@/i18n/navigation';
import { deleteTeam, regenerateInviteCode } from '@/lib/teams/actions';
import { useFormatter, useLocale, useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';

interface TeamMember {
  student_id: string;
  joined_at: string;
  display_name: string;
}

interface TeamDetailViewProps {
  teamId: string;
  teamName: string;
  inviteCode: string;
  maxMembers: number;
  schoolName: string;
  division: 'elementary' | 'middle';
  members: TeamMember[];
}

export function TeamDetailView({
  teamId,
  teamName,
  inviteCode: initialInviteCode,
  maxMembers,
  schoolName,
  division,
  members,
}: TeamDetailViewProps) {
  const t = useTranslations('teams.view');
  const tNew = useTranslations('teams.new');
  const format = useFormatter();
  const locale = useLocale();
  const router = useRouter();

  const [inviteCode, setInviteCode] = useState(initialInviteCode);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleting] = useTransition();
  const [codeCopied, setCodeCopied] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);
  const [regenError, setRegenError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const baseUrl = typeof window === 'undefined' ? '' : window.location.origin;
  const joinUrl = `${baseUrl}/${locale}/join/${inviteCode}`;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    } catch (err) {
      console.error('Clipboard write failed:', err);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setUrlCopied(true);
      setTimeout(() => setUrlCopied(false), 2000);
    } catch (err) {
      console.error('Clipboard write failed:', err);
    }
  };

  const handleRegenerate = () => {
    if (!confirm(t('regenerateConfirm'))) return;
    setRegenError(null);
    startTransition(async () => {
      const result = await regenerateInviteCode(teamId);
      if (!result.ok || !result.inviteCode) {
        setRegenError(t('regenerateFailed'));
        return;
      }
      setInviteCode(result.inviteCode);
    });
  };

  const handleDelete = () => {
    if (!confirm(t('deleteConfirm', { name: teamName, count: members.length }))) return;
    setDeleteError(null);
    startDeleting(async () => {
      const result = await deleteTeam(teamId);
      if (!result.ok) {
        setDeleteError(t('deleteFailed'));
        return;
      }
      router.replace('/teams');
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <header>
        <Link href="/" className="text-sm font-semibold text-numoria-blue hover:underline">
          {t('back')}
        </Link>
        <h1 className="mt-3 font-display text-2xl font-bold text-numoria-ink sm:text-3xl">
          👥 {teamName}
        </h1>
        <p className="mt-1 text-sm text-numoria-mid">
          🏫 {schoolName} ·{' '}
          {division === 'elementary' ? tNew('divisionElementary') : tNew('divisionMiddle')}
        </p>
      </header>

      {/* INVITE CODE SHARE BLOCK */}
      <section className="rounded-xl border-2 border-numoria-blue/30 bg-numoria-blue/5 p-6">
        <h2 className="font-display text-lg font-bold text-numoria-ink">{t('shareTitle')}</h2>
        <p className="mt-1 text-sm text-numoria-mid">{t('shareSubtitle')}</p>

        {/* Invite code */}
        <div className="mt-4 flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-numoria-mid">
            {t('inviteCodeLabel')}
          </span>
          <div className="flex items-stretch gap-2">
            <div className="flex flex-1 items-center justify-center rounded-md border-2 border-numoria-ink bg-white px-4 py-3 font-mono text-3xl font-bold tracking-widest text-numoria-ink">
              {inviteCode}
            </div>
            <button
              type="button"
              onClick={handleCopyCode}
              className="rounded-md bg-numoria-blue px-4 py-3 text-sm font-bold text-white hover:bg-numoria-blue/90"
              aria-label={t('copyCode')}
            >
              {codeCopied ? `✓ ${t('codeCopied')}` : `📋 ${t('copyCode')}`}
            </button>
          </div>
        </div>

        {/* Full URL */}
        <div className="mt-4 flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-numoria-mid">
            {t('inviteUrlLabel')}
          </span>
          <div className="flex items-stretch gap-2">
            <div className="flex-1 overflow-x-auto rounded-md border-2 border-numoria-gray bg-white px-3 py-2 font-mono text-xs text-numoria-ink">
              {joinUrl}
            </div>
            <button
              type="button"
              onClick={handleCopyUrl}
              className="whitespace-nowrap rounded-md border-2 border-numoria-blue bg-white px-3 py-2 text-xs font-bold text-numoria-blue hover:bg-numoria-blue/10"
            >
              {urlCopied ? `✓ ${t('urlCopied')}` : `📋 ${t('copyUrl')}`}
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleRegenerate}
            disabled={isPending}
            className="text-xs font-bold text-numoria-mid hover:text-numoria-red hover:underline disabled:opacity-50"
          >
            {isPending ? `🔄 ${t('regenerating')}` : `🔄 ${t('regenerate')}`}
          </button>
          {regenError && (
            <span role="alert" className="text-xs text-numoria-red">
              {regenError}
            </span>
          )}
        </div>
      </section>

      {/* MEMBERS */}
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-display text-lg font-bold text-numoria-ink">{t('members')}</h2>
          <span className="text-xs text-numoria-mid">
            {t('memberCount', { count: members.length, max: maxMembers })}
          </span>
        </div>

        {members.length === 0 ? (
          <p className="rounded-md border-2 border-dashed border-numoria-gray bg-numoria-cloud/40 p-6 text-center text-sm text-numoria-mid">
            {t('membersEmpty')}
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {members.map((m) => (
              <li
                key={m.student_id}
                className="flex items-center justify-between rounded-md border-2 border-numoria-gray bg-white px-4 py-3"
              >
                <span className="font-semibold text-numoria-ink">{m.display_name}</span>
                <span className="text-xs text-numoria-mid">
                  {t('memberJoined', {
                    date: format.dateTime(new Date(m.joined_at), {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    }),
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* DANGER ZONE — eliminar equipo */}
      <section className="rounded-xl border-2 border-numoria-red/30 bg-numoria-red/5 p-6">
        <h2 className="font-display text-lg font-bold text-numoria-red">{t('deleteTitle')}</h2>
        <p className="mt-1 text-sm text-numoria-mid">{t('deleteWarning')}</p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="rounded-md border-2 border-numoria-red bg-white px-4 py-2 text-sm font-bold text-numoria-red transition hover:bg-numoria-red hover:text-white disabled:opacity-50"
          >
            {isDeleting ? `🗑️ ${t('deleting')}` : `🗑️ ${t('deleteButton')}`}
          </button>
          {deleteError && (
            <span role="alert" className="text-xs text-numoria-red">
              {deleteError}
            </span>
          )}
        </div>
      </section>

      <Link
        href="/teams/new"
        className="self-center text-sm font-bold text-numoria-blue hover:underline"
      >
        {t('createAnother')}
      </Link>
    </div>
  );
}
