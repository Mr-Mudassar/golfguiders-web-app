'use client';

import type { GetDistanceUserQueryType } from '@/components/app/dashboard/friends/people-you-may-know/_interface';
import { GetDistanceUser } from '@/components/app/dashboard/friends/people-you-may-know/_query';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui';
import { useFetchAllFriends } from '@/lib/hooks/use-user';
import { MentionsInput, Mention } from 'react-mentions';
import { getInitials, getName } from '@/lib/utils';
import newApolloClient from '@/lib/apollo-client';
import { useAppSelector } from '@/lib';
import { Loader } from 'lucide-react';
import '@/app/[locale]/globals.css';

// --------------- Emoji rendering helpers ---------------
const emojiRegex =
  /(?:\p{RI}\p{RI}|\p{Emoji_Presentation}(?:\u200D\p{Emoji_Presentation}|\uFE0F?\u20E3|\p{Emoji_Modifier})*(?:\u200D(?:\p{Emoji_Presentation}|\p{Extended_Pictographic})(?:\p{Emoji_Modifier})?)*|\p{Extended_Pictographic}\uFE0F?(?:\u200D(?:\p{Emoji_Presentation}|\p{Extended_Pictographic})\uFE0F?)*)/gu;

const emojiToUnified = (emoji: string): string =>
  [...emoji]
    .map((c) => c.codePointAt(0)!.toString(16).padStart(4, '0'))
    .join('-');

/** Convert react-mentions internal markup to visible display text */
const toDisplayText = (text: string): string =>
  text.replace(/\{@\}\[([^\]]+)\]\([^)]+\)/g, '@$1');

/** Render a string with emoji characters replaced by Apple CDN images */
const renderTextWithEmojis = (text: string): React.ReactNode[] => {
  const display = toDisplayText(text);
  const parts: React.ReactNode[] = [];
  let lastIdx = 0;
  let i = 0;
  let m;
  emojiRegex.lastIndex = 0;
  while ((m = emojiRegex.exec(display)) !== null) {
    if (m.index > lastIdx) parts.push(display.slice(lastIdx, m.index));
    const matched = m[0];
    const unified = emojiToUnified(matched);
    parts.push(
      <img
        key={`emo-${i++}`}
        src={`https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/${unified}.png`}
        alt={matched}
        style={{
          display: 'inline-block',
          width: '1.15em',
          height: '1.15em',
          verticalAlign: '-0.2em',
          margin: '0 1px',
          objectFit: 'contain',
          flexShrink: 0,
        }}
        loading="lazy"
        onError={(e) => {
          const span = document.createElement('span');
          span.textContent = matched;
          (e.target as HTMLElement).replaceWith(span);
        }}
      />
    );
    lastIdx = m.index + matched.length;
  }
  if (lastIdx < display.length) parts.push(display.slice(lastIdx));
  return parts.length > 0 ? parts : [display];
};
// -------------------------------------------------------

type UserMentionType = {
  id: string;
  display: string;
  avatar?: string;
  initials?: string;
  type?: string;
};

interface EditorProps {
  placeholder: string;
  onChange: (value: string) => void;
  value: string;
  rows?: number;
  className?: string;
}

function MentionEditor({
  onChange,
  placeholder,
  value,
  rows = 1,
  className,
}: EditorProps) {
  const auth = useAppSelector((s) => s.auth?.user);
  const { mergedList: friendList } = useFetchAllFriends();
  const [loading, setLoading] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const emojiOverlayRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement | null>(null);
  const [portalReady, setPortalReady] = useState(false);
  const isInsideDialog = useRef(false);

  // Always create a portal so suggestions escape overflow:hidden on the control div.
  useEffect(() => {
    isInsideDialog.current = !!rootRef.current?.closest('[role="dialog"]');

    const el = document.createElement('div');
    el.style.position = 'absolute';
    el.style.zIndex = '100000';
    el.style.pointerEvents = 'auto';

    // Fix: Radix Dialog uses react-remove-scroll which registers a capture-phase
    // document listener that calls preventDefault() on wheel events for body scroll
    // lock. Because our portal is appended to body (outside the dialog DOM tree),
    // the suggestions <ul> isn't recognised as a valid scroller, so native wheel
    // scroll is blocked. We manually drive scrollTop instead so the list always
    // scrolls regardless of what react-remove-scroll does.
    const handleWheel = (e: WheelEvent) => {
      const list = el.querySelector('ul');
      if (!list) return;
      e.preventDefault();
      e.stopPropagation();
      list.scrollTop += e.deltaY;
    };
    el.addEventListener('wheel', handleWheel, { passive: false });

    document.body.appendChild(el);
    portalRef.current = el;
    setPortalReady(true);

    return () => {
      el.removeEventListener('wheel', handleWheel);
      document.body.removeChild(el);
    };
  }, []);

  // Track whether the value contains emoji
  const hasEmoji = useMemo(() => {
    emojiRegex.lastIndex = 0;
    return emojiRegex.test(value ?? '');
  }, [value]);

  // Attach native scroll listener directly to the textarea.
  // scroll events do NOT bubble, so onScroll on MentionsInput (which sits on
  // the wrapper div) never fires. We must go straight to the DOM element.
  //
  // Proportional sync: emoji images may be narrower than native emoji glyphs,
  // so the overlay's scrollHeight can differ from the textarea's. Copying
  // scrollTop directly would leave the overlay's last line unreachable. Instead
  // we map the textarea's scroll progress [0..1] onto the overlay's own scroll
  // range so both always reach their respective bottom together.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ta = root.querySelector('textarea');
    if (!ta) return;
    const sync = () => {
      const overlay = emojiOverlayRef.current;
      if (!overlay) return;
      const taMax = ta.scrollHeight - ta.clientHeight;
      const overlayMax = overlay.scrollHeight - overlay.clientHeight;
      overlay.scrollTop =
        taMax > 0 && overlayMax > 0
          ? Math.round((ta.scrollTop / taMax) * overlayMax)
          : 0;
    };
    ta.addEventListener('scroll', sync, { passive: true });
    return () => ta.removeEventListener('scroll', sync);
  }, []);

  // When the emoji overlay first mounts (hasEmoji flips to true) it starts at
  // scrollTop=0, but the textarea may already be scrolled (e.g. cursor is at
  // the bottom of a long comment). Sync immediately so the overlay lines up.
  useEffect(() => {
    if (!hasEmoji) return;
    const root = rootRef.current;
    const ta = root?.querySelector('textarea');
    const overlay = emojiOverlayRef.current;
    if (!ta || !overlay) return;
    const taMax = ta.scrollHeight - ta.clientHeight;
    const overlayMax = overlay.scrollHeight - overlay.clientHeight;
    overlay.scrollTop =
      taMax > 0 && overlayMax > 0
        ? Math.round((ta.scrollTop / taMax) * overlayMax)
        : 0;
  }, [hasEmoji]);

  const fetchUsers = async (
    search: string,
    callback: (users: UserMentionType[]) => void
  ) => {
    setLoading(true);
    try {
      const { data } = await newApolloClient.query<GetDistanceUserQueryType>({
        query: GetDistanceUser,
        variables: {
          latitude: auth?.latitude,
          longitude: auth?.longitude,
          searchInput: search,
          page: 1,
        },
        fetchPolicy: 'no-cache',
      });

      const lowerSearch = search.toLowerCase();

      const filterFriends = friendList
        .filter((friend) =>
          getName(friend.userInfo?.first_name, friend.userInfo?.last_name)
            ?.toLowerCase()
            .includes(lowerSearch)
        )
        .map((user) => ({
          id: user?.friend_user_id ?? '',
          display:
            getName(user?.userInfo?.first_name, user?.userInfo?.last_name) ??
            '',
          avatar: user?.userInfo?.photo_profile,
          initials: getInitials(
            user?.userInfo?.first_name,
            user?.userInfo?.last_name
          ),
          type: 'Friend',
        }));

      const filterUsers = (data?.getUserByDistance?.values ?? [])
        .filter((f) =>
          getName(f.first_name, f?.last_name)
            ?.toLowerCase()
            .includes(lowerSearch)
        )
        .map((user) => ({
          id: user.userid!,
          display: getName(user?.first_name, user?.last_name) ?? '',
          avatar: user?.photo_profile,
          initials: getInitials(user?.first_name, user?.last_name),
          type: 'Near you',
        }));

      callback([...filterFriends, ...filterUsers]);
    } catch (err) {
      console.error('User fetch failed:', err);
      callback([]);
    } finally {
      setLoading(false);
    }
  };

  const renderSuggestion = (
    suggestion: UserMentionType,
    _search: string,
    highlightedDisplay: React.ReactNode,
    _index: number,
    focused: boolean
  ) => {
    if (loading) {
      return (
        <div className="p-2 text-gray-500 text-sm">
          <Loader className="size-3 mr-1 animate-spin" /> Loading...
        </div>
      );
    }
    return (
      <div
        className={`flex items-center gap-2 p-2 ${focused ? 'bg-gray-200' : ''}`}
      >
        <Avatar>
          <AvatarImage src={suggestion.avatar ?? ''} alt={suggestion.display} />
          <AvatarFallback>{suggestion.initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm">{highlightedDisplay}</p>
          <p className="text-xs text-gray-500">
            {suggestion.type}
          </p>
        </div>
      </div>
    );
  };

  const inputTextColor = '#374151';
  const caretColor = '#111827';

  return (
    <div
      ref={rootRef}
      className={`relative z-10 w-full border p-2 bg-white rounded-md mention-editor-root focus-within:ring-0 focus-within:ring-offset-0 focus-within:border-border ${hasEmoji ? 'has-emoji' : ''} ${className || ''}`}
    >
      <style>{`
        .mention-editor-root .w-full__input {
          color: #374151 !important;
        }
        .mention-editor-root .w-full__control .w-full__highlighter {
          z-index: 2;
          pointer-events: none;
          color: transparent;
        }
        .mention-editor-root .w-full__control .w-full__input {
          /* z-index 4 puts the textarea ABOVE the emoji overlay (z-index 3).
             With transparent bg + transparent text, the overlay images show
             through and the caret sits on top — no longer hidden behind. */
          z-index: 4;
          background: transparent !important;
        }
        .mention-editor-root .w-full__control .w-full__input:focus,
        .mention-editor-root .w-full__control .w-full__input:focus-visible {
          outline: none !important;
          box-shadow: none !important;
          border-color: transparent !important;
        }
        .mention-editor-root .w-full__highlighter strong {
          color: hsl(var(--primary)) !important;
          font-weight: 700;
        }
        /* When emojis present: hide textarea text, keep caret visible */
        .mention-editor-root.has-emoji .w-full__input {
          color: transparent !important;
          caret-color: ${caretColor} !important;
        }
        /* Comment input: constrain height so inner textarea scrolls and emoji overlay viewport is correct */
        .mention-editor-root.comment-input-editor {
          display: flex;
          flex-direction: column;
          min-height: 0;
        }
        .mention-editor-root.comment-input-editor .w-full__control {
          flex: 1 1 auto;
          min-height: 0;
          display: flex;
          flex-direction: column;
        }
        .mention-editor-root.comment-input-editor .w-full__highlighter,
        .mention-editor-root.comment-input-editor .w-full__input {
          flex: 1 1 auto;
          min-height: 0;
        }
        /* Hide scrollbar on the emoji overlay (it is scrolled programmatically) */
        .mention-editor-root .emoji-overlay::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <MentionsInput
        value={value ?? ''}
        onChange={(e, newValue) => onChange(newValue ?? '')}
        className="w-full outline-none focus:outline-none focus:ring-0 focus:border-none"
        markup="{@}[__display__](__id__)"
        rows={rows}
        placeholder={placeholder ?? 'Type something and use @ to mention...'}
        spellCheck={false}
{...(portalReady && portalRef.current ? { suggestionsPortalHost: portalRef.current } : {})}
        style={{
          control: {
            fontSize: 14,
            minHeight: `${rows * 1.5}rem`,
            maxHeight: '12rem',
            lineHeight: '1.6rem',
            border: 'none',
            outline: 'none',
            boxShadow: 'none',
            overflow: 'hidden',
            backgroundColor: 'transparent',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
          },
          highlighter: {
            overflow: 'hidden',
            maxHeight: '12rem',
            fontSize: 14,
            lineHeight: '1.6rem',
            padding: 0,
            margin: 0,
            border: 'none',
            color: 'transparent',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
          },
          input: {
            margin: 0,
            padding: 0,
            // Must match control + overlay lineHeight so the caret sits on the
            // same vertical grid as the rendered emoji images.
            lineHeight: '1.6rem',
            fontSize: 14,
            color: hasEmoji ? 'transparent' : inputTextColor,
            caretColor,
            // Transparent so the emoji overlay (below, z-index 3) shows through.
            backgroundColor: 'transparent',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            overflowY: 'auto',
            maxHeight: '12rem',
          },
          suggestions: {
            list: {
              backgroundColor: 'white',
              border: '1px solid #ccc',
              zIndex: 100000,
              maxHeight: '290px',
              overflowY: 'scroll',
            },
            item: {
              borderBottom: '1px solid #ddd',
              cursor: 'pointer',
            },
          },
        }}
      >
        <Mention
          trigger="@"
          markup="{@}[__display__](__id__)"
          data={fetchUsers}
          renderSuggestion={renderSuggestion}
          displayTransform={(id, display) => `@${display}`}
          className="text-primary font-bold focus:border-0 focus:outline-none"
        />
      </MentionsInput>

      {/* Emoji overlay: renders text with Apple CDN emoji images on top of the transparent textarea */}
      {hasEmoji && (
        <div
          aria-hidden
          ref={emojiOverlayRef}
          className="emoji-overlay"
          style={{
            position: 'absolute',
            top: 8,
            left: 8,
            right: 8,
            bottom: 8,
            pointerEvents: 'none',
            zIndex: 3,
            fontSize: 14,
            lineHeight: '1.6rem',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            // Use scroll (not hidden) so scrollHeight is always computed correctly
            // and scrollTop can be set to any value in the full range.
            overflowY: 'scroll',
            overflowX: 'hidden',
            scrollbarWidth: 'none',  // Firefox
            color: inputTextColor,
          } as React.CSSProperties}
        >
          {renderTextWithEmojis(value ?? '')}
        </div>
      )}
    </div>
  );
}

export { MentionEditor };
