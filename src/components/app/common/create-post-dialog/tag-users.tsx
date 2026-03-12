import React from 'react';
import type { PostInputType } from '.';
import type { User } from '@/lib/definitions';
import { useFormContext } from 'react-hook-form';
import { useDebounceValue } from 'usehooks-ts';
import {
  useFetchAllFriends,
  useFetchUserRecommendations,
} from '@/lib/hooks/use-user';
import {
  MultiSelectCombobox,
  userToMultiSelectItem,
  type MultiSelectItem,
  type TabConfig,
} from './multi-select-combobox';

function TagUsers() {
  const form = useFormContext<PostInputType>();
  const selectedUserIds = form.watch('user_tags') || [];

  const [searchInput, setSearchInput] = React.useState('');
  const [debouncedSearch] = useDebounceValue(searchInput, 500);

  const { mergedList: friendsList, infiniteQuery } = useFetchAllFriends();
  const { friendRecommendations, filteredFriendRecommendations } =
    useFetchUserRecommendations({ search: debouncedSearch });

  const friendItems: MultiSelectItem[] = React.useMemo(
    () =>
      (friendsList ?? [])
        .map((f) => f.userInfo)
        .filter(Boolean)
        .map((u) => userToMultiSelectItem(u as User)),
    [friendsList]
  );

  const filteredFriendItems: MultiSelectItem[] = React.useMemo(() => {
    if (!debouncedSearch) return friendItems;
    const q = debouncedSearch.toLowerCase();
    return friendItems.filter((item) =>
      item.label.toLowerCase().includes(q)
    );
  }, [friendItems, debouncedSearch]);

  const recommendationItems: MultiSelectItem[] = React.useMemo(
    () =>
      (filteredFriendRecommendations ?? []).map((u) =>
        userToMultiSelectItem(u as User)
      ),
    [filteredFriendRecommendations]
  );

  // Combined list used only for resolving selected item labels/avatars (include all for selected display)
  const allItems: MultiSelectItem[] = React.useMemo(() => {
    const seen = new Set<string>();
    const merged: MultiSelectItem[] = [];
    for (const item of [...recommendationItems, ...friendItems]) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        merged.push(item);
      }
    }
    return merged;
  }, [friendItems, recommendationItems]);

  const tabs: TabConfig[] = React.useMemo(
    () => [
      {
        label: 'Recommendations',
        value: 'recommendations',
        items: recommendationItems,
        loading: friendRecommendations.loading,
      },
      {
        label: 'Friends',
        value: 'friends',
        items: filteredFriendItems,
        loading: infiniteQuery.isLoading,
        hasNextPage: infiniteQuery.hasNextPage,
        onLoadMore: infiniteQuery.fetchNextPage,
        loadingMore: infiniteQuery.isFetchingNextPage,
      },
    ],
    [recommendationItems, filteredFriendItems, friendRecommendations.loading, infiniteQuery]
  );

  const handleSelectionChange = (ids: string[]) => {
    form.setValue('user_tags', ids);
  };

  return (
    <MultiSelectCombobox
      items={allItems}
      selectedIds={selectedUserIds}
      onSelectionChange={handleSelectionChange}
      triggerLabel="Tag Users"
      triggerIcon="user"
      searchPlaceholder="Search users..."
      emptyMessage="No users found"
      variant="users"
      tabs={tabs}
      search={searchInput}
      onSearchChange={setSearchInput}
    />
  );
}

export { TagUsers };
