// 'use client';

// import React, { useEffect, useRef, useState } from 'react';
// import { Textarea } from '@/components/ui/textarea';
// import { Command, CommandItem, CommandList } from '@/components/ui/command';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui';
// import newApolloClient from '@/lib/apollo-client';
// import { useAppSelector } from '@/lib';
// import { useFetchAllFriends } from '@/lib/hooks/use-user';
// import { getInitials, getName } from '@/lib/utils';
// import { GetDistanceUser } fro../../../dashboard/friends/people-you-may-know/_queryery';
// import type { GetDistanceUserQueryType } fro../../../dashboard/friends/people-you-may-know/_interfaceace';

// interface MentionEditorProps {
//   value: string;
//   rows?: number;
//   onChange: (val: string) => void;
//   placeholder?: string;
// }

// type MentionUser = {
//   id: string;
//   name: string;
//   profile?: string;
//   initial: string;
//   type: string;
// };

// export default function TextEditor({
//   value,
//   rows = 1,
//   onChange,
//   placeholder,
//   ...props
// }: MentionEditorProps) {
//   const [showMentionList, setShowMentionList] = useState(false);
//   const [selectedIndex, setSelectedIndex] = useState(0);
//   const [cursorPosition, setCursorPosition] = useState(0);
//   const [users, setUsers] = useState<MentionUser[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

//   const textareaRef = useRef<HTMLTextAreaElement>(null);
//   const mirrorRef = useRef<HTMLDivElement>(null);

//   const auth = useAppSelector((s) => s.auth?.user);
//   const { mergedList: friendList } = useFetchAllFriends();

//   useEffect(() => {
//     const match = /@(\w*)$/.exec(value.slice(0, cursorPosition));
//     if (match) {
//       fetchUsers(match[1]);
//       setShowMentionList(true);
//       setSelectedIndex(0);
//     } else {
//       setShowMentionList(false);
//     }
//   }, [value, cursorPosition]);

//   useEffect(() => {
//     updateCaretPosition();
//   }, [cursorPosition, value]);

//   const fetchUsers = async (searchInput: string) => {
//     setLoading(true);
//     try {
//       const { data } = await newApolloClient.query<GetDistanceUserQueryType>({
//         query: GetDistanceUser,
//         variables: {
//           latitude: auth?.latitude,
//           longitude: auth?.longitude,
//           searchInput,
//           page: 1,
//         },
//         fetchPolicy: 'no-cache',
//       });

//       const lowerSearch = searchInput.toLowerCase();

//       const filterFriends = friendList
//         .filter((friend) =>
//           getName(friend.userInfo?.first_name, friend.userInfo?.last_name)
//             ?.toLowerCase()
//             .includes(lowerSearch)
//         )
//         .map((user) => ({
//           id: user?.friend_user_id!,
//           name:
//             getName(user?.userInfo?.first_name, user?.userInfo?.last_name) ??
//             '',
//           initial:
//             getInitials(
//               user?.userInfo?.first_name,
//               user?.userInfo?.last_name
//             ) ?? '',
//           profile: user?.userInfo?.photo_profile,
//           type: 'Friend',
//         }));

//       const filterUsers = (data?.getUserByDistance?.values ?? [])
//         .filter((f) =>
//           getName(f.first_name, f?.last_name)
//             ?.toLowerCase()
//             .includes(lowerSearch)
//         )
//         .map((user) => ({
//           id: user.userid!,
//           name: getName(user?.first_name, user?.last_name) ?? '',
//           initial: getInitials(user?.first_name, user?.last_name) ?? '',
//           profile: user?.photo_profile,
//           type: 'Near you',
//         }));

//       setUsers([...filterFriends, ...filterUsers]);
//     } catch (err) {
//       console.error('User fetch failed:', err);
//       setUsers([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const parseMentionsForMirror = (text: string) => {
//     return text.replace(/\{@\}\[([^\]]+)\]\([^)]+\)/g, (_match, name) => {
//       return `<span class="font-bold text-primary">@${name}</span>`;
//     });
//   };

//   const updateCaretPosition = () => {
//     if (!mirrorRef.current || !textareaRef.current) return;

//     const before = parseMentionsForMirror(value.slice(0, cursorPosition));
//     const after = parseMentionsForMirror(value.slice(cursorPosition));

//     const html =
//       before.replace(/ /g, '\u00a0').replace(/\n/g, '<br/>') +
//       '<span id="caret-marker" class="animate-pulse duration-300">|</span>' +
//       after.replace(/ /g, '\u00a0').replace(/\n/g, '<br/>');

//     mirrorRef.current.innerHTML = html;
//     const marker = mirrorRef.current.querySelector('#caret-marker');
//     if (marker) {
//       const rect = marker.getBoundingClientRect();
//       const parentRect = mirrorRef.current.getBoundingClientRect();
//       setDropdownPos({
//         top: rect.top - parentRect.top + 20,
//         left: rect.left - parentRect.left,
//       });
//     }
//   };

//   const insertMention = (user: MentionUser) => {
//     const before = value.slice(0, cursorPosition);
//     const after = value.slice(cursorPosition);
//     const match = /@(\w*)$/.exec(before);
//     if (!match) return;

//     const start = match.index;
//     const mentionText = `{@}[${user.name}](${user.id})`;
//     const newText = before.slice(0, start) + mentionText + after;

//     // 👇 Immediately update mirror div
//     if (mirrorRef.current) {
//       const immediateMirror = newText
//         .replace(/\{@\}\[([^\]]+)\]\([^)]+\)/g, (_match, name) => {
//           return `<span class="font-bold text-primary">@${name}</span>`;
//         })
//         .replace(/ /g, '\u00a0')
//         .replace(/\n/g, '<br/>');
//       mirrorRef.current.innerHTML = immediateMirror;
//     }

//     onChange(newText);
//     setShowMentionList(false);

//     requestAnimationFrame(() => {
//       if (textareaRef.current) {
//         const newCursor = start + mentionText.length;
//         textareaRef.current.focus();
//         textareaRef.current.setSelectionRange(newCursor, newCursor);
//         setCursorPosition(newCursor);
//       }
//     });
//   };

//   const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
//     const textarea = textareaRef.current;
//     if (!textarea) return;
//     const cursorPos = textarea.selectionStart;

//     if (e.key === 'Backspace' || e.key === 'Delete') {
//       const mentionRegex = /\{@\}\[[^\]]+\]\([^)]+\)/g;
//       let match: RegExpExecArray | null;
//       while ((match = mentionRegex.exec(value))) {
//         const start = match.index;
//         const end = start + match[0].length;
//         const inside =
//           (e.key === 'Backspace' && cursorPos > start && cursorPos <= end) ||
//           (e.key === 'Delete' && cursorPos >= start && cursorPos < end);
//         const atEnd = e.key === 'Backspace' && cursorPos === end;
//         const atStart = e.key === 'Delete' && cursorPos === start;

//         if (inside || atEnd || atStart) {
//           e.preventDefault();
//           const updated = value.slice(0, start) + value.slice(end);
//           onChange(updated);
//           requestAnimationFrame(() => {
//             textarea.focus();
//             textarea.setSelectionRange(start, start);
//             setCursorPosition(start);
//           });
//           return;
//         }
//       }
//     }

//     if (showMentionList && ['ArrowDown', 'ArrowUp', 'Enter'].includes(e.key)) {
//       e.preventDefault();
//       if (e.key === 'ArrowDown') {
//         setSelectedIndex((prev) => (prev + 1) % users.length);
//       } else if (e.key === 'ArrowUp') {
//         setSelectedIndex((prev) => (prev - 1 + users.length) % users.length);
//       } else if (e.key === 'Enter') {
//         if (users[selectedIndex]) insertMention(users[selectedIndex]);
//       }
//     }
//   };

//   const handleCursorMove = (e?: React.SyntheticEvent) => {
//     const textarea = textareaRef.current;
//     if (!textarea) return;

//     let cursorPos = textarea.selectionStart;
//     const mentionRegex = /\{@\}\[[^\]]+\]\([^)]+\)/g;

//     let match: RegExpExecArray | null;
//     while ((match = mentionRegex.exec(value))) {
//       const start = match.index;
//       const end = start + match[0].length;

//       if (cursorPos > start && cursorPos < end) {
//         // Detect move direction
//         const keyEvent = e as unknown as React.KeyboardEvent;
//         const isLeft = keyEvent?.nativeEvent?.key === 'ArrowLeft';
//         const isRight = keyEvent?.nativeEvent?.key === 'ArrowRight';

//         let newPos = start;
//         if (isRight) {
//           newPos = end;
//         }

//         requestAnimationFrame(() => {
//           textarea.setSelectionRange(newPos, newPos);
//           setCursorPosition(newPos);
//         });
//         return;
//       }
//     }

//     setCursorPosition(cursorPos);
//   };

//   return (
//     <div className="relative w-full min-h-[60px]">
//       <div
//         ref={mirrorRef}
//         className="absolute top-0 left-0 w-full p-2 border rounded bg-transparent pointer-events-none whitespace-pre-wrap break-words z-[-1]"
//         // style={{ height: `${rows * 28}px` }}
//       />

//       <Textarea
//         ref={textareaRef}
//         value={value}
//         onChange={(e) => {
//           onChange(e.target.value);
//           setCursorPosition(e.target.selectionStart);
//         }}
//         onSelect={handleCursorMove}
//         onKeyDown={handleKeyDown}
//         placeholder={placeholder || 'Write something...'}
//         className="absolute top-0 left-0 w-full bg-transparent text-transparent caret-transparent"
//         {...props}
//       />

//       {showMentionList && (
//         <div
//           className="absolute z-10 bg-white border rounded shadow-md"
//           style={{
//             top: dropdownPos.top,
//             left: dropdownPos.left,
//           }}
//         >
//           <Command>
//             <CommandList>
//               {loading ? (
//                 <div className="px-3 py-2 text-muted-foreground text-sm">
//                   Loading...
//                 </div>
//               ) : users.length === 0 ? (
//                 <div className="px-3 py-2 text-muted-foreground text-sm">
//                   No users found
//                 </div>
//               ) : (
//                 users.map((user, idx) => (
//                   <CommandItem
//                     key={user.id}
//                     value={user.name}
//                     onSelect={() => insertMention(user)}
//                     className={`flex items-center gap-2 ${
//                       idx === selectedIndex ? 'bg-muted' : ''
//                     }`}
//                   >
//                     <Avatar>
//                       <AvatarImage
//                         src={user.profile}
//                         alt={`${user.name}'s profile`}
//                       />
//                       <AvatarFallback>{user.initial}</AvatarFallback>
//                     </Avatar>
//                     {user.name}
//                   </CommandItem>
//                 ))
//               )}
//             </CommandList>
//           </Command>
//         </div>
//       )}
//     </div>
//   );
// }

// // import React, { useRef, useState, useEffect } from 'react';

// // export default function MentionTextarea() {
// //   const [text, setText] = useState('');
// //   const [showDropdown, setShowDropdown] = useState(false);
// //   const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
// //   const textareaRef = useRef<HTMLTextAreaElement>(null);
// //   const shadowRef = useRef<HTMLDivElement>(null);

// //   const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
// //     setText(e.target.value);
// //     updateCaretPosition(e.target);
// //   };

// //   const updateCaretPosition = (el: HTMLTextAreaElement) => {
// //     const selectionStart = el.selectionStart;
// //     const beforeCaret = text.substring(0, selectionStart);

// //     // Replace newlines with <br> in shadow div
// //     const htmlContent =
// //       beforeCaret.replace(/ /g, '\u00a0').replace(/\n/g, '<br>') +
// //       '<span id="caret-marker">|</span>';

// //     if (shadowRef.current) {
// //       shadowRef.current.innerHTML = htmlContent;
// //       const marker = shadowRef.current.querySelector('#caret-marker');
// //       if (marker) {
// //         const rect = marker.getBoundingClientRect();
// //         const parentRect = shadowRef.current.getBoundingClientRect();
// //         setDropdownPos({
// //           top: rect.top - parentRect.top,
// //           left: rect.left - parentRect.left,
// //         });
// //         setShowDropdown(true);
// //       }
// //     }
// //   };

// //   return (
// //     <div className="relative w-full max-w-md mx-auto mt-10">
// //       <textarea
// //         ref={textareaRef}
// //         value={text}
// //         onChange={handleChange}
// //         className="w-full h-32 p-2 border rounded resize-none"
// //         placeholder="Type something with @..."
// //       />

// //       {/* Shadow div */}
// //       <div
// //         ref={shadowRef}
// //         className="absolute invisible whitespace-pre-wrap break-words p-2 border rounded"
// //         style={{
// //           top: 0,
// //           left: 0,
// //           width: textareaRef.current?.offsetWidth,
// //           height: textareaRef.current?.offsetHeight,
// //           fontFamily: 'inherit',
// //           fontSize: 'inherit',
// //           lineHeight: 'inherit',
// //         }}
// //       />

// //       {/* Dropdown */}
// //       {showDropdown && (
// //         <div
// //           className="absolute bg-white border shadow-md"
// //           style={{
// //             top: dropdownPos.top + 20, // adjust below caret
// //             left: dropdownPos.left,
// //           }}
// //         >
// //           <div className="p-2 hover:bg-gray-100 cursor-pointer">John Doe</div>
// //           <div className="p-2 hover:bg-gray-100 cursor-pointer">Jane Smith</div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }
