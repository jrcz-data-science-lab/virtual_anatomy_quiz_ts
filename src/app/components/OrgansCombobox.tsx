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
import type { OrganClient } from "../lib/types";

interface OrgansComboboxProps {
  selectedOrganId: string | undefined;
  onSelectOrgan: (organId: string) => void;
}

/**
 * A combobox component for selecting an organ from a list.
 *
 * @param {Object} props - The component props.
 * @param {string | undefined} props.selectedOrganId - The ID of the currently selected organ.
 * @param {Function} props.onSelectOrgan - Callback function to handle organ selection.
 *
 * @returns {JSX.Element} The rendered combobox component with a list of organs.
 */
export function OrgansCombobox({
  selectedOrganId,
  onSelectOrgan,
}: OrgansComboboxProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const [organs, setOrgans] = useState<OrganClient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchOrgans() {
      const res = await fetch("/api/organs");
      const organs = await res.json();
      setOrgans(organs);
    }
    fetchOrgans();
  }, []);

  const selected = organs.find((organ) => organ._id === selectedOrganId);

  const filteredOrgans = organs.filter((organ) =>
    organ.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between mt-2 font-normal"
        >
          {selected?.displayName || "Select organ..."}
          <ChevronsUpDown className="opacity-50 ml-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder="Search organs..."
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            {filteredOrgans.length === 0 ? (
              <CommandEmpty>No organs found.</CommandEmpty>
            ) : (
              <CommandGroup>
                {filteredOrgans.map((organ) => (
                  <CommandItem
                    key={organ._id}
                    value={organ.displayName}
                    onSelect={() => {
                      onSelectOrgan(organ._id);
                      setOpen(false);
                    }}
                  >
                    {organ.displayName}
                    <Check
                      className={cn(
                        "ml-auto",
                        selectedOrganId === organ._id
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
