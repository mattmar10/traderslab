import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useQuery } from "@tanstack/react-query";
import {
  FilterGroupPermissionType,
  getFilterGroupsForUser,
  getUserFavoriteFilterGroups,
} from "../actions";
import { Button } from "@/components/ui/button";
import { ChevronDown, Star } from "lucide-react";

import { useEffect, useState } from "react";
import { DropdownMenuLabel } from "@radix-ui/react-dropdown-menu";
import { FilterGroup, FilterGroupDTO } from "@/lib/types/screener-types";

interface FilterGroupSelectorProps {
  onApplyFilters: (filters: FilterGroupDTO) => void;
  appliedFilterGroup: FilterGroupDTO | undefined;
}

const FilterGroupSelector: React.FC<FilterGroupSelectorProps> = ({
  onApplyFilters,
  appliedFilterGroup,
}) => {
  const [filterGroup, setFilterGroup] = useState<FilterGroupDTO | undefined>(
    undefined
  );

  useEffect(() => {
    setFilterGroup(appliedFilterGroup);
  }, [appliedFilterGroup]);

  const {
    data: privateFilterGroups,
    isLoading: isLoadingPrivateUserFilterGroups,
  } = useQuery({
    queryKey: ["userFilterGroups"],
    queryFn: () => loadFilterGroups(),
  });

  const { data: favoriteFilterGroups, isLoading: isLoadingFavorites } =
    useQuery({
      queryKey: ["favoriteFilterGroups"],
      queryFn: () => loadFavorites(),
    });

  const handleApplyFilter = (filter: FilterGroupDTO) => {
    setFilterGroup(filter);
    onApplyFilters(filter);
  };

  const handleLibrarySelection = (filterGroup: FilterGroupDTO) => {
    setFilterGroup(filterGroup);

    onApplyFilters(filterGroup);
    handleApplyFilter(filterGroup);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="relative inline-block">
          <Button variant="outline" className="justify-start  py-1">
            <span className="">
              {filterGroup && filterGroup.filterGroupName ? (
                <div className="">{filterGroup.filterGroupName}</div>
              ) : (
                "Library"
              )}
            </span>
            <ChevronDown className="ml-2  h-4 w-4" />
          </Button>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className=" py-2">
            <Star className="mr-2 h-5 w-5 " />
            Favorites
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {isLoadingFavorites ? (
              <DropdownMenuItem>Loading Favorites</DropdownMenuItem>
            ) : (
              (favoriteFilterGroups || []).map((fav) => (
                <DropdownMenuItem
                  key={`fg-${fav.filterGroupName}`}
                  onSelect={() => handleLibrarySelection(fav)}
                  className="px-4 py-2"
                >
                  {fav.filterGroupName}
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="p-2 font-semibold text-sm">
          My Screens
        </DropdownMenuLabel>
        {isLoadingPrivateUserFilterGroups ? (
          <DropdownMenuItem>Loading User Screens</DropdownMenuItem>
        ) : (
          (privateFilterGroups || []).map((uf) => (
            <DropdownMenuItem
              key={`user-fg-${uf.filterGroupName}`}
              onSelect={() => handleLibrarySelection(uf)}
              className="px-4 py-2"
            >
              {uf.filterGroupName}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FilterGroupSelector;

async function loadFilterGroups(): Promise<FilterGroupDTO[]> {
  const fromDB = await getFilterGroupsForUser();

  return fromDB.map((fg) => {
    const translated: FilterGroupDTO = {
      filterGroupName: fg.name!,
      filterGroupDescription: fg.description || "",
      userId: fg.userId!,
      permission: fg.permissionType as FilterGroupPermissionType,
      filterGroupId: fg.id,
      filterGroup: fg.payload as FilterGroup,
      tags: [],
    };

    return translated;
  });
}

async function loadFavorites(): Promise<FilterGroupDTO[]> {
  const fromDB = await getUserFavoriteFilterGroups();

  return fromDB.map((fg) => {
    const translated: FilterGroupDTO = {
      filterGroupName: fg.filterGroup.name!,
      filterGroupDescription: fg.filterGroup.description || "",
      userId: fg.filterGroup.userId!,
      permission: fg.filterGroup.permissionType as FilterGroupPermissionType,
      filterGroupId: fg.filterGroup.id,
      filterGroup: fg.filterGroup.payload as FilterGroup,
      tags: [],
    };

    return translated;
  });
}
