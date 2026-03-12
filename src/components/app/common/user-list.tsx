import React, { useMemo, useState } from 'react';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  RadioGroup,
  RadioGroupItem,
  Input,
  Button,
} from '@/components/ui';
import Link from 'next/link';
import { useDebounceValue } from 'usehooks-ts';
import { getName } from '@/lib/utils';
import type { User, UserInfo } from '@/lib/definitions';
import {
  useFetchAllFriends,
  useFetchUserRecommendations,
} from '@/lib/hooks/use-user';
import { AccountSkeleton } from '.';
import { Checkbox } from '@/components/ui/checkbox';
import { Modal } from '../dashboard/tournaments/play-local/create/dialog';
import AvatarBox from './avatar-box';

type SelectMode = 'single' | 'multiple';

type SelectedUser = {
  id: string;
  name: string;
};

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode?: SelectMode;
  onConfirm: (users: SelectedUser[]) => void;
  onCancel: () => void;
  title?: string;
};

export function UserListDialog({
  open,
  onOpenChange,
  mode = 'single',
  onConfirm,
  onCancel,
  title = 'Select Users',
}: Props) {
  const [search, setSearch] = useDebounceValue('', 400);
  const [activeTab, setActiveTab] = useState('friends');
  const [selected, setSelected] = useState<SelectedUser[]>([]);

  const isSingle = mode === 'single';

  const { mergedList, infiniteQuery, observer } = useFetchAllFriends();
  const { friendRecommendations, filteredFriendRecommendations } =
    useFetchUserRecommendations({ search });

  const friends = useMemo(() => {
    if (!search) return mergedList;
    return mergedList?.filter((f) =>
      getName(f.userInfo?.first_name, f.userInfo?.last_name)
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [search, mergedList]);

  const toggleUser = (user: User | UserInfo) => {
    const item = {
      id: user?.userid as string,
      name: getName(user?.first_name, user?.last_name),
    };

    if (isSingle) {
      setSelected([item]);
      return;
    }

    setSelected((prev) =>
      prev.some((u) => u.id === item.id)
        ? prev.filter((u) => u.id !== item.id)
        : [...prev, item]
    );
  };

  const isChecked = (id?: string) => selected.some((u) => u.id === id);

  return (
    <Modal
      open={open}
      setOpen={() => onOpenChange(false)}
      title={title}
      description={
        isSingle ? 'Select a user you want to transfer your device to' : ''
      }
      footer={
        <div className="flex gap-2 items-center">
          <Button
            variant="outline"
            onClick={() => {
              setSelected([]);

              onCancel();
            }}
          >
            Cancel
          </Button>
          <Button
            disabled={!selected.length}
            onClick={() => onConfirm(selected)}
          >
            Confirm
          </Button>
        </div>
      }
    >
      <Input
        placeholder="Search user by name"
        onChange={(e) => setSearch(e.target.value)}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="friends">Friends</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>
        {/* Friends */}
        <TabsContent value="friends">
          {infiniteQuery.isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <AccountSkeleton key={i} />)
          ) : (
            <>
              <UserList
                users={friends?.map((f) => f.userInfo)}
                mode={mode}
                onSelect={toggleUser}
                isChecked={isChecked}
              />
              <div ref={observer.ref} />
            </>
          )}
        </TabsContent>

        {/* Recommendations */}
        <TabsContent value="recommendations">
          {friendRecommendations.loading ? (
            Array.from({ length: 5 }).map((_, i) => <AccountSkeleton key={i} />)
          ) : (
            <UserList
              users={filteredFriendRecommendations}
              mode={mode}
              onSelect={toggleUser}
              isChecked={isChecked}
            />
          )}
        </TabsContent>
      </Tabs>
    </Modal>
  );
}

/* -------------------- */

function UserList({
  users,
  mode,
  onSelect,
  isChecked,
}: {
  users?: User[] | UserInfo[];
  mode: SelectMode;
  onSelect: (u: User | UserInfo) => void;
  isChecked: (id?: string) => boolean;
}) {
  if (!users?.length) {
    return (
      <div className="h-44 flex items-center justify-center text-sm text-gray-500">
        No users found
      </div>
    );
  }

  return (
    <div className="max-h-48 overflow-y-auto p-2">
      {mode === 'single' ? (
        <RadioGroup>
          {users.map((u) => (
            <UserItem
              key={u.userid}
              user={u}
              right={
                <RadioGroupItem
                  value={u.userid!}
                  checked={isChecked(u.userid)}
                  onClick={() => onSelect(u)}
                />
              }
            />
          ))}
        </RadioGroup>
      ) : (
        users.map((u) => (
          <UserItem
            key={u.userid}
            user={u}
            right={
              <Checkbox
                checked={isChecked(u.userid)}
                onCheckedChange={() => onSelect(u)}
              />
            }
          />
        ))
      )}
    </div>
  );
}

/* -------------------- */

function UserItem({
  user,
  right,
}: {
  user: User | UserInfo;
  right: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border rounded-md p-1.5">
      <Link
        href={`/profile/${user?.userid}`}
        prefetch={false}
        className="flex items-center text-sm gap-2"
      >
        <AvatarBox
          src={user?.photo_profile as string}
          name={`${user?.first_name} ${user?.last_name}`}
        />
        {getName(user.first_name, user.last_name)}
      </Link>
      {right}
    </div>
  );
}
