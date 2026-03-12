'use client';

import React from 'react';
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Badge,
  Icon,
  ScrollArea,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui';
import { cn, getInitials, getName } from '@/lib/utils';
import { Check, X } from 'lucide-react';
import type { User } from '@/lib/definitions';

/** Scrollable area that handles wheel when inside cmdk (which can block native wheel). */
function WheelScrollArea({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      el.scrollTop += e.deltaY;
      e.preventDefault();
      e.stopPropagation();
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);
  return (
    <div
      ref={ref}
      className={cn('overflow-y-auto overflow-x-hidden pr-2', className)}
    >
      {children}
    </div>
  );
}

interface Group {
  group_id: string;
  name: string;
  description?: string;
  type?: 'PUBLIC' | 'PRIVATE';
}

export interface MultiSelectItem {
  id: string;
  label: string;
  avatar?: string;
  firstName?: string;
  lastName?: string;
  description?: string;
  type?: 'PUBLIC' | 'PRIVATE';
}

export interface TabConfig {
  label: string;
  value: string;
  items: MultiSelectItem[];
  hasNextPage?: boolean;
  onLoadMore?: () => void;
  loadingMore?: boolean;
  loading?: boolean;
}

interface MultiSelectComboboxProps {
  items: MultiSelectItem[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  triggerLabel: string;
  triggerIcon?: string;
  loading?: boolean;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
  loadingMore?: boolean;
  variant?: 'users' | 'groups';
  className?: string;
  tabs?: TabConfig[];
  /** When provided with onSearchChange, search is controlled and tab items are used as-is (no client filter). */
  search?: string;
  onSearchChange?: (value: string) => void;
}

export function MultiSelectCombobox({
  items,
  selectedIds,
  onSelectionChange,
  placeholder = 'Select items...',
  searchPlaceholder = 'Search...',
  emptyMessage = 'No items found',
  triggerLabel,
  triggerIcon,
  loading = false,
  hasNextPage = false,
  onLoadMore,
  loadingMore = false,
  variant = 'users',
  className,
  tabs,
  search: controlledSearch,
  onSearchChange,
}: MultiSelectComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [internalSearch, setInternalSearch] = React.useState('');
  const search = controlledSearch !== undefined ? controlledSearch : internalSearch;
  const setSearch = React.useCallback(
    (value: string) => {
      if (onSearchChange) onSearchChange(value);
      else setInternalSearch(value);
    },
    [onSearchChange]
  );
  const [activeTab, setActiveTab] = React.useState(() => tabs?.[0]?.value ?? '');
  const isServerSideSearch = onSearchChange != null && tabs != null;

  const toggleSelection = (id: string) => {
    const newSelection = selectedIds.includes(id)
      ? selectedIds.filter((selectedId) => selectedId !== id)
      : [...selectedIds, id];
    onSelectionChange(newSelection);
  };

  const removeItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectionChange(selectedIds.filter((selectedId) => selectedId !== id));
  };

  // For selected items display, use all items (combined from all tabs if tabbed)
  const allItems = React.useMemo(() => {
    if (!tabs) return items;
    const seen = new Set<string>();
    const merged: MultiSelectItem[] = [];
    for (const tab of tabs) {
      for (const item of tab.items) {
        if (!seen.has(item.id)) {
          seen.add(item.id);
          merged.push(item);
        }
      }
    }
    return merged;
  }, [items, tabs]);

  const selectedItems = React.useMemo(
    () => allItems.filter((item) => selectedIds.includes(item.id)),
    [allItems, selectedIds]
  );

  const filteredItems = React.useMemo(() => {
    if (!search) return items;
    return items.filter((item) =>
      item.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [items, search]);

  const getFilteredTabItems = (tabItems: MultiSelectItem[]) => {
    if (!search) return tabItems;
    return tabItems.filter((item) =>
      item.label.toLowerCase().includes(search.toLowerCase())
    );
  };

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      if (!next && onSearchChange) onSearchChange('');
      setOpen(next);
    },
    [onSearchChange]
  );

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              'h-9 justify-between',
              selectedIds.length > 0 && 'border-primary/50'
            )}
          >
            <div className="flex items-center gap-1.5">
              {triggerIcon && <Icon name={triggerIcon as any} size={16} />}
              <span className="text-xs font-medium">{triggerLabel}</span>
              {selectedIds.length > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1 h-5 px-1.5 text-[10px] font-semibold"
                >
                  {selectedIds.length}
                </Badge>
              )}
            </div>
            <Icon
              name="chevron-down"
              size={14}
              className={cn(
                'opacity-50 transition-transform',
                open && 'rotate-180'
              )}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[320px] p-0"
          align="start"
          sideOffset={4}
          style={{ zIndex: 10002 }}
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={searchPlaceholder}
              value={search}
              onValueChange={setSearch}
            />
            <CommandList className={tabs ? '[&]:max-h-none [&]:overflow-visible' : undefined}>
              {/* Selected Items Section — always shown when there are selections */}
              {selectedItems.length > 0 && (
                <div className="border-b">
                  <div className="px-2 py-1.5">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Selected ({selectedItems.length})
                    </p>
                  </div>
                  <ScrollArea className="max-h-32">
                    <div className="px-2 pb-2 flex flex-wrap gap-1">
                      {selectedItems.map((item) => (
                        <Badge
                          key={item.id}
                          variant="secondary"
                          className="pl-1.5 pr-1 py-1 h-auto gap-1.5"
                        >
                          {variant === 'users' && (
                            <Avatar className="h-4 w-4">
                              {item.avatar && <AvatarImage src={item.avatar} />}
                              <AvatarFallback className="text-[8px]">
                                {getInitials(item.firstName, item.lastName)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <span className="text-xs font-medium max-w-[100px] truncate">
                            {item.label}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => removeItem(item.id, e)}
                            className="ml-0.5 rounded-full hover:bg-muted p-0.5 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {tabs ? (
                /* Tabbed mode */
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <div className="px-2 pt-2 pb-0">
                    <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
                      {tabs.map((tab) => (
                        <TabsTrigger key={tab.value} value={tab.value} className="text-xs">
                          {tab.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>
                  {tabs.map((tab) => {
                    const tabFiltered = isServerSideSearch
                      ? tab.items
                      : getFilteredTabItems(tab.items);
                    return (
                      <TabsContent key={tab.value} value={tab.value} className="mt-0">
                        {tab.loading ? (
                          <div className="py-6 text-center text-sm text-muted-foreground">Loading...</div>
                        ) : tabFiltered.length === 0 ? (
                          <div className="py-6 text-center text-sm text-muted-foreground">{emptyMessage}</div>
                        ) : (
                          <CommandGroup>
                            <WheelScrollArea className="h-56 min-h-0">
                              {tabFiltered.map((item) => {
                                const isSelected = selectedIds.includes(item.id);
                                return (
                                  <CommandItem
                                    key={item.id}
                                    value={item.id}
                                    onSelect={() => toggleSelection(item.id)}
                                    className="cursor-pointer"
                                  >
                                    <div
                                      className={cn(
                                        'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                                        isSelected ? 'bg-primary text-primary-foreground' : 'opacity-50'
                                      )}
                                    >
                                      {isSelected && <Check className="h-3 w-3" />}
                                    </div>
                                    {variant === 'users' && (
                                      <Avatar className="mr-2 h-6 w-6">
                                        {item.avatar && <AvatarImage src={item.avatar} />}
                                        <AvatarFallback className="text-[10px]">
                                          {getInitials(item.firstName, item.lastName)}
                                        </AvatarFallback>
                                      </Avatar>
                                    )}
                                    <div className="flex-1 overflow-hidden">
                                      <span className="text-sm truncate">{item.label}</span>
                                    </div>
                                  </CommandItem>
                                );
                              })}
                            </WheelScrollArea>
                            {tab.hasNextPage && tab.onLoadMore && (
                              <div className="border-t p-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full h-8 text-xs"
                                  onClick={tab.onLoadMore}
                                  loading={tab.loadingMore}
                                  disabled={tab.loadingMore}
                                >
                                  Load More
                                </Button>
                              </div>
                            )}
                          </CommandGroup>
                        )}
                      </TabsContent>
                    );
                  })}
                </Tabs>
              ) : (
                /* Flat mode (original) */
                loading ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    Loading...
                  </div>
                ) : filteredItems.length === 0 ? (
                  <CommandEmpty>{emptyMessage}</CommandEmpty>
                ) : (
                  <CommandGroup>
                    <ScrollArea className="max-h-64">
                      {filteredItems.map((item) => {
                        const isSelected = selectedIds.includes(item.id);
                        return (
                          <CommandItem
                            key={item.id}
                            value={item.id}
                            onSelect={() => toggleSelection(item.id)}
                            className="cursor-pointer"
                          >
                            <div
                              className={cn(
                                'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                                isSelected
                                  ? 'bg-primary text-primary-foreground'
                                  : 'opacity-50'
                              )}
                            >
                              {isSelected && <Check className="h-3 w-3" />}
                            </div>

                            {variant === 'users' && (
                              <Avatar className="mr-2 h-6 w-6">
                                {item.avatar && <AvatarImage src={item.avatar} />}
                                <AvatarFallback className="text-[10px]">
                                  {getInitials(item.firstName, item.lastName)}
                                </AvatarFallback>
                              </Avatar>
                            )}

                            <div className="flex-1 overflow-hidden">
                              <div className="flex items-center gap-2">
                                <span className="text-sm truncate">{item.label}</span>
                                {variant === 'groups' && item.type && (
                                  <Badge size="sm" variant="secondary" className="text-[9px] px-1 py-0">
                                    {item.type}
                                  </Badge>
                                )}
                              </div>
                              {item.description && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </CommandItem>
                        );
                      })}
                    </ScrollArea>

                    {hasNextPage && onLoadMore && (
                      <div className="border-t p-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full h-8 text-xs"
                          onClick={onLoadMore}
                          loading={loadingMore}
                          disabled={loadingMore}
                        >
                          Load More
                        </Button>
                      </div>
                    )}
                  </CommandGroup>
                )
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Helper function to convert User to MultiSelectItem
export function userToMultiSelectItem(user: User): MultiSelectItem {
  return {
    id: user.userid!,
    label: getName(user.first_name, user.last_name),
    avatar: user.photo_profile,
    firstName: user.first_name,
    lastName: user.last_name,
  };
}

// Helper function to convert Group to MultiSelectItem
export function groupToMultiSelectItem(group: Group): MultiSelectItem {
  return {
    id: group.group_id,
    label: group.name,
    description: group.description,
    type: group.type,
  };
}
