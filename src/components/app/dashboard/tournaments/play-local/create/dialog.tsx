import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui';
import { cn } from '@/lib/utils';
import React from 'react';

export function Modal({
  children,
  footer,
  title,
  description,
  open,
  setOpen,
  contentClassName,
}: {
  title?: string;
  description?: string;
  open: boolean;
  setOpen: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  contentClassName?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className={cn('border border-primary/50', contentClassName)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
        <DialogFooter>{footer}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
// // components/DynamicDialog.tsx
// 'use client';

// import { IGolfCoursesEntity, User } from '@/lib/definitions';
// import React, { ReactNode } from 'react';

// type DialogType =
//   | 'user' // for co-organizer or select player
//   | 'course' // golf courses
//   | 'tee' // tee markers
//   | 'team' // create team
//   | 'permission'
//   | null; // add permission

// export function DynamicDialog({
//   open,
//   type,
//   context,
//   data,
//   onClose,
//   onSelect,
// }: {
//   open: boolean;
//   type: 'user' | 'course' | 'tee' | 'team' | 'permission' | null;
//   context?: string;
//   data: any;
//   onClose: () => void;
//   onSelect: (val: any) => void;
// }) {
//   if (!open || !type) return null;

//   return (
//     <div
//       className="fixed inset-0 flex items-center justify-center"
//       style={{ zIndex: 10003 }}
//     >
//       {/* <div className="absolute inset-0 bg-black/40" onClick={onClose} /> */}
//       <div className="bg-white w-[600px] max-h-[80vh] rounded shadow-lg p-4 z-70 overflow-y-auto">
//         <div className="flex justify-between items-center mb-3">
//           <h3 className="font-semibold">{type} dialog</h3>
//           <button onClick={onClose}>X</button>
//         </div>

//         {type === 'user' && (
//           <div className="space-y-2">
//             {data.users.map((u: User) => (
//               <div
//                 key={u.userid}
//                 className="flex justify-between items-center border p-2 rounded"
//               >
//                 <div>
//                   {u.first_name} {u.last_name} – {u.type}
//                 </div>
//                 <button
//                   onClick={() => onSelect(u)}
//                   className="px-2 py-1 text-sm border rounded"
//                 >
//                   {context === 'co' ? 'Add' : 'Select'}
//                 </button>
//               </div>
//             ))}
//           </div>
//         )}

//         {type === 'course' && (
//           <div className="space-y-2">
//             {data.courses.map((c: IGolfCoursesEntity) => (
//               <div
//                 key={c.id}
//                 className="flex justify-between items-center border p-2 rounded"
//               >
//                 <div>{c.coursename}</div>
//                 <button
//                   onClick={() => onSelect(c)}
//                   className="px-2 py-1 text-sm border rounded"
//                 >
//                   Select
//                 </button>
//               </div>
//             ))}
//           </div>
//         )}

//         {type === 'tee' && (
//           <div className="grid grid-cols-2 gap-3">
//             {['Male', 'Female'].map((g) => (
//               <div key={g}>
//                 <div className="font-medium">{g}</div>
//                 {data.tees[g].map((t: any) => (
//                   <div
//                     key={t.color}
//                     className="flex justify-between items-center border p-2 rounded"
//                   >
//                     <div>{t.color}</div>
//                     <button
//                       onClick={() => onSelect({ gender: g, ...t })}
//                       className="px-2 py-1 text-sm border rounded"
//                     >
//                       Select
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             ))}
//           </div>
//         )}

//         {type === 'team' && <TeamDialogContent onCreate={onSelect} />}

//         {type === 'permission' && (
//           <PermissionDialogContent players={data.users} onAdd={onSelect} />
//         )}
//       </div>
//     </div>
//   );
// }

// /* --- Small sub-forms --- */

// function TeamDialogContent({ onCreate }: { onCreate: (name: string) => void }) {
//   const [team, setTeam] = React.useState('');
//   return (
//     <div>
//       <input
//         value={team}
//         onChange={(e) => setTeam(e.target.value)}
//         placeholder="Team name"
//         className="w-full border rounded px-2 py-2 mb-2"
//       />
//       <button
//         onClick={() => {
//           if (team) {
//             onCreate(team);
//             setTeam('');
//           }
//         }}
//         className="px-3 py-2 bg-blue-600 text-white rounded"
//       >
//         Add Team
//       </button>
//     </div>
//   );
// }

// function PermissionDialogContent({
//   players,
//   onAdd,
// }: {
//   players: any[];
//   onAdd: (val: any) => void;
// }) {
//   const [forPlayer, setForPlayer] = React.useState(players[0]?.id);
//   const [byPlayer, setByPlayer] = React.useState(players[1]?.id);

//   return (
//     <div>
//       <label className="text-sm">Player A</label>
//       <select
//         value={forPlayer}
//         onChange={(e) => setForPlayer(e.target.value)}
//         className="w-full border rounded mb-2"
//       >
//         {players.map((p) => (
//           <option key={p.id} value={p.id}>
//             {p.firstName} {p.lastName}
//           </option>
//         ))}
//       </select>

//       <label className="text-sm">Player B</label>
//       <select
//         value={byPlayer}
//         onChange={(e) => setByPlayer(e.target.value)}
//         className="w-full border rounded mb-2"
//       >
//         {players.map((p) => (
//           <option key={p.id} value={p.id}>
//             {p.firstName} {p.lastName}
//           </option>
//         ))}
//       </select>

//       <button
//         onClick={() => onAdd({ forPlayer, byPlayer })}
//         className="px-3 py-2 bg-blue-600 text-white rounded"
//       >
//         Add Permission
//       </button>
//     </div>
//   );
// }
