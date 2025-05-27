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
import type { MeshCatalogItemMin } from "../lib/types";

interface MeshCatalogComboboxProps {
  selectedMeshId: string | undefined;
  onSelectMesh: (meshId: string | undefined) => void;
  disabled?: boolean;
}

/**
 * A combobox component for selecting a mesh from the mesh catalog.
 *
 * @param {string | undefined} selectedMeshId - The ID of the currently selected mesh.
 * @param {(meshId: string | undefined) => void} onSelectMesh - Callback function to handle mesh selection.
 * @param {boolean} [disabled=false] - Whether or not the combobox is disabled.
 *
 * @returns {JSX.Element} The rendered combobox component with a list of meshes.
 */
export function MeshCatalogCombobox({
  selectedMeshId,
  onSelectMesh,
  disabled = false,
}: MeshCatalogComboboxProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MeshCatalogItemMin[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    /**
     * Fetches mesh catalog items from the server based on the current search term
     * or a selected mesh ID. If the combobox is open or a mesh ID is initially
     * selected, it constructs a query to retrieve items from the `/api/mesh-catalog`
     * endpoint. If a search term is provided, it searches for meshes by displayName
     * or meshName. If a selected mesh ID exists and no items are loaded, it fetches
     * the item with the exact meshName. On success, it updates the items state with
     * the fetched data. On failure, it logs the error and clears the items state.
     */
    async function fetchMeshes() {
      if (!open && !selectedMeshId) return; // Only fetch when opened or if there's an initial selection to display

      // Fetch initially if selectedMeshId exists to get its display name,
      // or fetch based on searchTerm if combo is open.
      let query = "";
      if (searchTerm) {
        query = `?search=${encodeURIComponent(searchTerm)}`;
      } else if (selectedMeshId && items.length === 0) {
        query = `?meshName=${encodeURIComponent(selectedMeshId)}`;
      }

      try {
        const res = await fetch(`/api/mesh-catalog${query}`);
        if (!res.ok) throw new Error("Failed to fetch mesh catalog items");
        const data = await res.json();
        setItems(data);
      } catch (error) {
        console.error("Error fetching mesh catalog:", error);
        setItems([]); // Clear items on error
      }
    }
    fetchMeshes();
  }, [open, searchTerm, selectedMeshId]);

  const selectedItem = items.find((item) => item._id === selectedMeshId);

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
          {selectedItem
            ? `${selectedItem.displayName} (${selectedItem.meshName})`
            : "Select mesh..."}
          <ChevronsUpDown className="opacity-50 ml-2 h-4 w-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command shouldFilter={false}>
          {" "}
          {/* Filtering handled via API search query */}
          <CommandInput
            placeholder="Search mesh catalog..."
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            {items.length === 0 && searchTerm && (
              <CommandEmpty>No meshes found.</CommandEmpty>
            )}
            {items.length === 0 && !searchTerm && (
              <CommandEmpty>Type to search meshes.</CommandEmpty>
            )}
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item._id}
                  value={item._id} // Use ID for value to allow selection even if displayNames are similar
                  onSelect={(currentValue) => {
                    // currentValue is item._id here
                    onSelectMesh(
                      currentValue === selectedMeshId ? undefined : currentValue
                    );
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedMeshId === item._id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {item.displayName} ({item.meshName})
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
