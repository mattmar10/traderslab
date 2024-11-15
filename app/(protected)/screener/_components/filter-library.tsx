import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Star, Trash, XCircle } from "lucide-react";

import { NewFilterGroup } from "@/drizzle/schema";
import Loading from "@/components/loading";
import { addFavoriteFilterGroup, deleteFilter, getFilterGroupsForUser, getSharedFilterGroups, getUserFavoriteFilterGroupIds, removeFavoriteFilterGroup } from "@/components/filters/actions";
import { FilterGroup, FilterGroupDTO, FilterGroupPermissionType } from "@/lib/types/screener-types";

interface ScreenerLibraryProps {
  onApplyFilter: (filter: FilterGroupDTO) => void;
}

const ScreenerLibrary: React.FC<ScreenerLibraryProps> = ({ onApplyFilter }) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("my-filters");
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(
    null
  );

  const { data: userFilters, isLoading: isLoadingUserFilters } = useQuery({
    queryKey: ["filter-library-users"],
    queryFn: () => getFilterGroupsForUser(),
  });

  const { data: sharedFilters, isLoading: isLoadingSharedFilters } = useQuery({
    queryKey: ["sharedFilters"],
    queryFn: () => getSharedFilterGroups(),
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

  const handleToggleFavorite = (filterId: string, isFavorite: boolean) => {
    toggleFavoriteMutation.mutate({ filterId, isFavorite });
  };

  const deleteFilterMutation = useMutation({
    mutationFn: deleteFilter,
    onSuccess: () => {
      // Invalidate and refetch both user filters and shared filters
      queryClient.invalidateQueries({ queryKey: ["filter-library-users"] });
      queryClient.invalidateQueries({ queryKey: ["sharedFilters"] });
      queryClient.invalidateQueries({ queryKey: ["favoriteFilterIds"] });
      queryClient.invalidateQueries({
        queryKey: ["favoriteFilterGroups"],
      });
      setConfirmingDeleteId(null);
    },
  });

  const handleDeleteFilter = async (filterId: string) => {
    await deleteFilterMutation.mutateAsync(filterId);
  };

  const handleApplyFilter = (filter: FilterGroupDTO) => {
    onApplyFilter(filter);
  };

  const handleStartDelete = (filterId: string) => {
    setConfirmingDeleteId(filterId);
  };

  const handleCancelDelete = () => {
    setConfirmingDeleteId(null);
  };

  if (isLoadingUserFilters || isLoadingSharedFilters) {
    return (
      <div className="w-full p-8">
        <Loading />
      </div>
    );
  }

  interface FilterCardProps {
    filter: NewFilterGroup;
    isFavorite: boolean;
    isShared: boolean;
  }
  const FilterCard = ({
    filter,
    isFavorite,
    isShared = false,
  }: FilterCardProps) => {
    const isConfirmingDelete = confirmingDeleteId === filter.id;

    return (
      <Card className="mb-4 flex flex-col justify-between h-52">
        <CardHeader className="p-4">
          <CardTitle>
            <div className="flex justify-between items-start">
              <div>{filter.name}</div>

              <div
                className="cursor-pointer text-foreground/10 hover:text-foreground/30 "
                onClick={() => handleToggleFavorite(filter.id!, isFavorite)}
              >
                <Star
                  className={`h-5 w-5 ${isFavorite ? "fill-blue-300" : "fill-foreground/10"
                    }`}
                />
              </div>
            </div>
          </CardTitle>
          <div className="flex space-x-3 text-foreground/60 text-xs">
            <div>
              {`Last Updated ${filter.updatedAt?.toISOString().split("T")[0] || ""
                }`}
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 pt-0 pb-2 flex-grow overflow-auto">
          {" "}
          {/* Scrolls if content overflows */}
          <p className="text-sm">{filter.description}</p>
        </CardContent>
        <CardFooter className="justify-end space-x-2 p-4 mt-auto">
          {" "}
          {/* Footer at the bottom */}
          <Button
            onClick={() => handleApplyFilter(translateToDTO(filter))}
            size="sm"
          >
            <Play className="mr-2 h-4 w-4" /> Apply
          </Button>
          {!isShared &&
            (isConfirmingDelete ? (
              <>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteFilter(filter.id!)}
                >
                  Confirm
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCancelDelete}
                >
                  <XCircle className="mr-2 h-4 w-4" /> Cancel
                </Button>
              </>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleStartDelete(filter.id!)}
              >
                <Trash className="mr-2 h-4 w-4" /> Delete
              </Button>
            ))}
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-filters">My Screens</TabsTrigger>
          <TabsTrigger value="shared-filters">Community Screens</TabsTrigger>
        </TabsList>
        <TabsContent value="my-filters">
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto" // Add overflow-y-auto to allow vertical scrolling
            style={{ maxHeight: "75vh" }}
          >
            {(userFilters || []).map((filter) => (
              <FilterCard
                key={filter.id}
                filter={filter}
                isShared={false}
                isFavorite={favoriteFilterIds?.includes(filter.id!) || false}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="shared-filters">
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto"
            style={{ maxHeight: "75vh" }}
          >
            {(sharedFilters || []).map((filter) => (
              <FilterCard
                key={filter.filterGroup.id}
                filter={filter.filterGroup}
                isShared={true}
                isFavorite={
                  favoriteFilterIds?.includes(filter.filterGroup.id!) || false
                }
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScreenerLibrary;

function translateToDTO(dbModel: NewFilterGroup): FilterGroupDTO {
  const translated: FilterGroupDTO = {
    filterGroupName: dbModel.name!,
    userId: dbModel.userId!,
    permission: dbModel.permissionType as FilterGroupPermissionType,
    filterGroupId: dbModel.id,
    filterGroup: dbModel.payload as FilterGroup,
    filterGroupDescription: dbModel.description!,
  };

  return translated;
}
