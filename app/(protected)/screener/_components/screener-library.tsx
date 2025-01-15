"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Star, Users, User, Trash2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import Loading from "@/components/loading";
import {
  addFavoriteFilterGroup,
  deleteFilter,
  getAlexScreens,
  getFilterGroupsForUser,
  getSharedFilterGroups,
  getUserFavoriteFilterGroupIds,
  removeFavoriteFilterGroup,
} from "@/components/filters/actions";
import {
  FilterGroup,
  FilterGroupDTO,
  FilterGroupPermissionType,
} from "@/lib/types/screener-types";
import {
  ExistingFilterGroup,
  ExistingFilterGroupWithTags,
  NewFilterGroup,
} from "@/drizzle/schema";
import ConfirmationDialog from "@/components/confirmation-dialog";
import { Badge } from "@/components/ui/badge";

interface NewScreenerLibraryProps {
  onApplyFilter: (filter: FilterGroupDTO) => void;
}

const NewScreenerLibrary: React.FC<NewScreenerLibraryProps> = ({
  onApplyFilter,
}) => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "updated" | "favorite">("name");
  const [activeCategory, setActiveCategory] = useState<
    "myScreens" | "communityScreens" | "favorites" | "alexScreens"
  >("myScreens");
  const [filterToDelete, setFilterToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: userFilters, isLoading: isLoadingUserFilters } = useQuery({
    queryKey: ["filter-library-users"],
    queryFn: () => getFilterGroupsForUser(),
  });

  const { data: sharedFilters, isLoading: isLoadingSharedFilters } = useQuery({
    queryKey: ["sharedFilters"],
    queryFn: () => getSharedFilterGroups(),
  });

  const { data: alexScreens, isLoading: isLoadingAlexScreens } = useQuery({
    queryKey: ["alexScreens"],
    queryFn: () => getAlexScreens(),
  });

  const { data: favoriteFilterIds } = useQuery({
    queryKey: ["favoriteFilterIds"],
    queryFn: () => getUserFavoriteFilterGroupIds(),
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: ({
      filterId,
      isFavorite,
    }: {
      filterId: string;
      isFavorite: boolean;
    }) =>
      isFavorite
        ? removeFavoriteFilterGroup(filterId)
        : addFavoriteFilterGroup(filterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favoriteFilterIds"] });
      queryClient.invalidateQueries({ queryKey: ["favoriteFilterGroups"] });
    },
  });

  const deleteFilterMutation = useMutation({
    mutationFn: deleteFilter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["filter-library-users"] });
      queryClient.invalidateQueries({ queryKey: ["sharedFilters"] });
      queryClient.invalidateQueries({ queryKey: ["favoriteFilterIds"] });
      setFilterToDelete(null);
    },
  });

  const handleToggleFavorite = (
    e: React.MouseEvent,
    filterId: string,
    isFavorite: boolean
  ) => {
    e.stopPropagation();
    toggleFavoriteMutation.mutate({ filterId, isFavorite });
  };

  const handleDeleteFilter = async () => {
    if (filterToDelete) {
      await deleteFilterMutation.mutateAsync(filterToDelete);
    }
  };

  const filterAndSortScreeners = (screeners: FilterGroupDTO[]) => {
    return screeners
      .filter(
        (screener) =>
          screener.filterGroupName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          screener.filterGroupDescription
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        if (sortBy === "name")
          return a.filterGroupName.localeCompare(b.filterGroupName);
        if (sortBy === "updated")
          return (
            new Date(b.updatedAt!).getTime() - new Date(a.updatedAt!).getTime()
          );
        if (sortBy === "favorite") {
          const aFav = favoriteFilterIds?.includes(a.filterGroupId!) || false;
          const bFav = favoriteFilterIds?.includes(b.filterGroupId!) || false;
          return (bFav ? 1 : 0) - (aFav ? 1 : 0);
        }
        return 0;
      });
  };

  const getCategoryScreeners = (): FilterGroupDTO[] => {
    switch (activeCategory) {
      case "myScreens":
        return (userFilters || []).map((fgWithTags) =>
          translateExistingFGWithTagsToFilterGroupDTO(fgWithTags)
        );
      case "communityScreens":
        return (sharedFilters || []).map((fgWithTags) =>
          translateExistingFGWithTagsToFilterGroupDTO(fgWithTags)
        );
      case "alexScreens":
        return (alexScreens || []).map((fgWithTags) =>
          translateExistingFGWithTagsToFilterGroupDTO(fgWithTags)
        );
      case "favorites":
        const mergedScreeners = [
          ...(userFilters || []),
          ...(sharedFilters || []),
        ];
        const uniqueScreeners = Array.from(
          new Map(
            mergedScreeners.map((screener) => [
              screener.filterGroup.id,
              screener,
            ])
          ).values()
        );
        return uniqueScreeners
          .filter((screener) =>
            favoriteFilterIds?.includes(screener.filterGroup.id)
          )
          .map((fgWithTags) =>
            translateExistingFGWithTagsToFilterGroupDTO(fgWithTags)
          );
      default:
        return [];
    }
  };

  const translateExistingFGWithTagsToFilterGroupDTO = (
    fgWithTags: ExistingFilterGroupWithTags
  ) => {
    const translated: FilterGroupDTO = {
      filterGroupName: fgWithTags.filterGroup.name!,
      filterGroupDescription: fgWithTags.filterGroup.description || "",
      updatedAt: fgWithTags.filterGroup.updatedAt!,
      userId: fgWithTags.filterGroup.userId!,
      permission: fgWithTags.filterGroup
        .permissionType as FilterGroupPermissionType,
      filterGroupId: fgWithTags.filterGroup.id,
      filterGroup: fgWithTags.filterGroup.payload as FilterGroup,
      tags: fgWithTags.tags,
    };

    return translated;
  };

  if (isLoadingUserFilters || isLoadingSharedFilters || isLoadingAlexScreens) {
    return <Loading />;
  }

  return (
    <div className="flex bg-foreground/10 h-[98%]">
      <div className="w-64 bg-background flex-shrink-0 border-r">
        <div className="p-4">
          <nav>
            <ul className="space-y-2">
              <li>
                <Button
                  variant={
                    activeCategory === "favorites" ? "secondary" : "ghost"
                  }
                  className="w-full justify-start"
                  onClick={() => setActiveCategory("favorites")}
                >
                  <Star className="mr-2" size={18} />
                  Favorites
                </Button>
              </li>
              <li>
                <Button
                  variant={
                    activeCategory === "myScreens" ? "secondary" : "ghost"
                  }
                  className="w-full justify-start"
                  onClick={() => setActiveCategory("myScreens")}
                >
                  <User className="mr-2" size={18} />
                  My Screens
                </Button>
              </li>
              <li>
                <Button
                  variant={
                    activeCategory === "communityScreens"
                      ? "secondary"
                      : "ghost"
                  }
                  className="w-full justify-start"
                  onClick={() => setActiveCategory("communityScreens")}
                >
                  <Users className="mr-2" size={18} />
                  Community Screens
                </Button>
              </li>
              <li>
                <Button
                  variant={
                    activeCategory === "alexScreens" ? "secondary" : "ghost"
                  }
                  className="w-full justify-start"
                  onClick={() => setActiveCategory("alexScreens")}
                >
                  <Zap className="mr-2" size={18} />
                  Alex&#39;s Screens
                </Button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-shrink-0 bg-background border-b">
          <div className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative w-96">
                <Input
                  type="text"
                  placeholder="Search screens..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/50"
                  size={18}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-foreground/50">Sort by:</span>
                <Button
                  variant={sortBy === "name" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setSortBy("name")}
                >
                  Name
                </Button>
                <Button
                  variant={sortBy === "updated" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setSortBy("updated")}
                >
                  Updated
                </Button>
                <Button
                  variant={sortBy === "favorite" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setSortBy("favorite")}
                >
                  Favorite
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-background">
          <ul className="divide-y divide-gray-200">
            {filterAndSortScreeners(getCategoryScreeners()).map((screener) => (
              <li
                key={screener.filterGroupId}
                className="hover:bg-foreground/5 group cursor-pointer"
                onClick={() => onApplyFilter(screener)}
              >
                <div className="p-4">
                  {/* Title row with star and tags */}
                  <div className="flex items-center space-x-1 ">
                    <div className="flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) =>
                          handleToggleFavorite(
                            e,
                            screener.filterGroupId!,
                            favoriteFilterIds?.includes(
                              screener.filterGroupId!
                            ) || false
                          )
                        }
                        className={
                          favoriteFilterIds?.includes(screener.filterGroupId!)
                            ? "text-yellow-500"
                            : "text-foreground/50"
                        }
                      >
                        <Star size={18} />
                      </Button>
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                      <h3 className="font-medium truncate">
                        {screener.filterGroupName}
                      </h3>
                      {screener.tags && screener.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 ml-2">
                          {screener.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className={`text-xs px-2 py-1 border ${
                                tag === "TL-ALEX"
                                  ? "bg-traderslabblue text-white"
                                  : ""
                              }`}
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info and delete button row */}
                  <div className="flex items-center space-x-4">
                    <div className="min-w-0 flex-1 ml-12">
                      <span className="text-sm text-foreground/60">
                        Updated{" "}
                        {new Date(screener.updatedAt!).toLocaleDateString()}
                      </span>
                      <p className="text-sm text-foreground/50 line-clamp-2">
                        {screener.filterGroupDescription}
                      </p>
                    </div>
                    {activeCategory === "myScreens" && (
                      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFilterToDelete(screener.filterGroupId!);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 size={18} />
                        </Button>

                        <ConfirmationDialog
                          isOpen={isDeleteDialogOpen}
                          onClose={(e) => {
                            e?.stopPropagation?.();
                            setIsDeleteDialogOpen(false);
                          }}
                          onConfirm={(e) => {
                            e?.stopPropagation?.();
                            handleDeleteFilter();
                            setIsDeleteDialogOpen(false);
                          }}
                          title="Delete Filter"
                          message="Are you sure you want to delete this filter? This action cannot be undone."
                          confirmText="Delete"
                          cancelText="Cancel"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NewScreenerLibrary;

function translateToDTO(dbModel: NewFilterGroup): FilterGroupDTO {
  return {
    filterGroupName: dbModel.name!,
    userId: dbModel.userId!,
    permission: dbModel.permissionType as FilterGroupPermissionType,
    filterGroupId: dbModel.id,
    filterGroup: dbModel.payload as FilterGroup,
    filterGroupDescription: dbModel.description!,
    tags: [],
    updatedAt: dbModel.updatedAt!,
  };
}
