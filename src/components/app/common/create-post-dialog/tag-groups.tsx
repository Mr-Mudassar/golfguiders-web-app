import React from 'react';
import type { PostInputType } from '.';
import { useFormContext } from 'react-hook-form';
import { useInfiniteGroups } from '@/lib/hooks/groups/use-infinite-groups';
import {
  MultiSelectCombobox,
  groupToMultiSelectItem,
  type MultiSelectItem,
} from './multi-select-combobox';

interface Group {
  __typename?: 'Group';
  group_id: string;
  name: string;
  description?: string;
  type: 'PUBLIC' | 'PRIVATE';
  created: string;
}

function TagGroups() {
  const form = useFormContext<PostInputType>();
  const selectedGroupIds = form.watch('group_tags') || [];

  const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage } =
    useInfiniteGroups();

  const groups = React.useMemo(
    () => (data?.pages.flat() || []) as Group[],
    [data]
  );

  const groupItems: MultiSelectItem[] = React.useMemo(
    () => groups.map(groupToMultiSelectItem),
    [groups]
  );

  const handleSelectionChange = (ids: string[]) => {
    form.setValue('group_tags', ids);
  };

  return (
    <MultiSelectCombobox
      items={groupItems}
      selectedIds={selectedGroupIds}
      onSelectionChange={handleSelectionChange}
      triggerLabel="Tag Groups"
      triggerIcon="users"
      searchPlaceholder="Search groups..."
      emptyMessage="No groups found"
      loading={isLoading}
      hasNextPage={hasNextPage}
      onLoadMore={fetchNextPage}
      loadingMore={isFetchingNextPage}
      variant="groups"
    />
  );
}

export { TagGroups };
