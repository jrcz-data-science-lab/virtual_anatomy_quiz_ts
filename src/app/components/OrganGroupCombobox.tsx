"use client";

import { JSX, useState, useEffect } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { OrganGroupMin } from "../lib/types";

interface OrganGroupComboboxProps {
  selectedGroupId: string | undefined;
  onSelectGroup: (groupId: string | undefined) => void;
  disabled?: boolean;
}

/**
 * A combobox component for selecting an organ group from a list.
 *
 * @param {string | undefined} selectedGroupId - The ID of the currently selected group.
 * @param {(groupId: string | undefined) => void} onSelectGroup - Callback function to handle group selection.
 * @param {boolean} [disabled=false] - Whether or not the combobox is disabled.
 *
 * @returns {JSX.Element} The rendered combobox component with a list of groups.
 */
export function OrganGroupCombobox({
  selectedGroupId,
  onSelectGroup,
  disabled = false,
}: OrganGroupComboboxProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<OrganGroupMin[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    /**
     * Fetches organ groups from the server based on the current search term
     * or a selected group ID. If the combobox is open or a group ID is initially
     * selected, it constructs a query to retrieve groups from the `/api/organ-groups`
     * endpoint. If a search term is provided, it searches for groups by groupName
     * using a case-insensitive regex search. If a selected group ID exists and no
     * groups are loaded, it fetches the group with the exact group ID. On success, it
     * updates the items state with the fetched data. On failure, it logs the error and
     * clears the items state.
     */
    async function fetchGroups() {
      if (!open && !selectedGroupId) return;
      let query = "";
      if (searchTerm) {
        query = `?search=${encodeURIComponent(searchTerm)}`;
      }
      try {
        const res = await fetch(`/api/organ-groups${query}`);
        if (!res.ok) throw new Error("Failed to fetch organ groups");
        const data = await res.json();
        setItems(data);
      } catch (error) {
        console.error("Error fetching organ groups:", error);
        setItems([]);
      }
    }
    fetchGroups();
  }, [open, searchTerm, selectedGroupId]);

  const selectedItem = items.find((item) => item._id === selectedGroupId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between mt-2 font-normal"
          disabled={disabled}
        >
          {selectedItem ? selectedItem.groupName : "Select group..."}
          <ChevronsUpDown className="opacity-50 ml-2 h-4 w-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search organ groups..."
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            {items.length === 0 && searchTerm && (
              <CommandEmpty>No groups found.</CommandEmpty>
            )}
            {items.length === 0 && !searchTerm && (
              <CommandEmpty>Type to search groups.</CommandEmpty>
            )}
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item._id}
                  value={item._id}
                  onSelect={(currentValue) => {
                    onSelectGroup(
                      currentValue === selectedGroupId
                        ? undefined
                        : currentValue
                    );
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedGroupId === item._id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {item.groupName}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
