import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, MoreHorizontal, Star, Users, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Loading from '@/components/loading';
import {
  addFavoriteFilterGroup,
  deleteFilter,
  getFilterGroupsForUser,
  getSharedFilterGroups,
  getUserFavoriteFilterGroupIds,
  removeFavoriteFilterGroup,
} from '@/components/filters/actions';
import { FilterGroup, FilterGroupDTO, FilterGroupPermissionType } from '@/lib/types/screener-types';
import { NewFilterGroup } from '@/drizzle/schema';

interface NewScreenerLibraryProps {
  onApplyFilter: (filter: FilterGroupDTO) => void;
}

const NewScreenerLibrary: React.FC<NewScreenerLibraryProps> = ({ onApplyFilter }) => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'updated' | 'favorite'>('name');
  const [activeCategory, setActiveCategory] = useState<'myScreens' | 'communityScreens' | 'favorites'>('myScreens');
  const [, setConfirmingDeleteId] = useState<string | null>(null);

  // Queries
  const { data: userFilters, isLoading: isLoadingUserFilters } = useQuery({
    queryKey: ['filter-library-users'],
    queryFn: () => getFilterGroupsForUser(),
  });

  const { data: sharedFilters, isLoading: isLoadingSharedFilters } = useQuery({
    queryKey: ['sharedFilters'],
    queryFn: () => getSharedFilterGroups(),
  });

  const { data: favoriteFilterIds } = useQuery({
    queryKey: ['favoriteFilterIds'],
    queryFn: () => getUserFavoriteFilterGroupIds(),
  });

  // Mutations
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
      queryClient.invalidateQueries({ queryKey: ['favoriteFilterIds'] });
      queryClient.invalidateQueries({ queryKey: ['favoriteFilterGroups'] });
    },
  });

  const deleteFilterMutation = useMutation({
    mutationFn: deleteFilter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['filter-library-users'] });
      queryClient.invalidateQueries({ queryKey: ['sharedFilters'] });
      queryClient.invalidateQueries({ queryKey: ['favoriteFilterIds'] });
      setConfirmingDeleteId(null);
    },
  });

  // Event Handlers
  const handleToggleFavorite = (filterId: string, isFavorite: boolean) => {
    toggleFavoriteMutation.mutate({ filterId, isFavorite });
  };

  const handleDeleteFilter = async (filterId: string) => {
    await deleteFilterMutation.mutateAsync(filterId);
  };

  const handleApplyFilter = (filter: FilterGroupDTO) => {
    onApplyFilter(filter);
  };

  // Utility Functions
  const filterAndSortScreeners = (screeners: any[]) => {
    return screeners
      .filter(screener => 
        screener.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        screener.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'updated') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        if (sortBy === 'favorite') {
          const aFav = favoriteFilterIds?.includes(a.id) || false;
          const bFav = favoriteFilterIds?.includes(b.id) || false;
          return (bFav ? 1 : 0) - (aFav ? 1 : 0);
        }
        return 0;
      });
  };

  const getCategoryScreeners = () => {
    switch (activeCategory) {
      case 'myScreens':
        return userFilters || [];
      case 'communityScreens':
        return (sharedFilters || []).map(f => f.filterGroup);
      case 'favorites':
        return [
          ...(userFilters || []),
          ...((sharedFilters || []).map(f => f.filterGroup))
        ].filter(screener => favoriteFilterIds?.includes(screener.id));
      default:
        return [];
    }
  };


  if (isLoadingUserFilters || isLoadingSharedFilters) {
    return <Loading />;
  }

  return (
    <div className="flex h-[98%] bg-foreground/10">
      {/* Sidebar - Fixed height */}
      <div className="w-64 bg-background  flex-shrink-0">
        <div className="p-4">
          <nav>
            <ul className="space-y-2">
              <li>
                <Button
                  variant={activeCategory === 'myScreens' ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveCategory('myScreens')}
                >
                  <User className="mr-2" size={18} />
                  My Screens
                </Button>
              </li>
              <li>
                <Button
                  variant={activeCategory === 'communityScreens' ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveCategory('communityScreens')}
                >
                  <Users className="mr-2" size={18} />
                  Community Screens
                </Button>
              </li>
              <li>
                <Button
                  variant={activeCategory === 'favorites' ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveCategory('favorites')}
                >
                  <Star className="mr-2" size={18} />
                  Favorites
                </Button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content - Scrollable */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="flex-shrink-0 pb-4 pl-1 pt-1 bg-background border-b">
          <div className="flex justify-between items-center">
            <div className="relative w-96">
              <Input
                type="text"
                placeholder="Search screeners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Search 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/50" 
                size={18} 
              />
            </div>
 
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 h-full">
          <div className="bg-background shadow rounded-lg h-fit">
            <div className="flex justify-between items-center p-4 bg-gray-50 border-b sticky top-0">
              <h2 className="font-semibold">
                {activeCategory === 'myScreens' ? 'My Screens' : 
                 activeCategory === 'communityScreens' ? 'Community Screens' : 
                 'Favorites'}
              </h2>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">Sort By</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setSortBy('name')}>Name</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('updated')}>Updated</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('favorite')}>Favorite</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <ul className="divide-y divide-gray-200">
              {filterAndSortScreeners(getCategoryScreeners()).map((screener) => (
                <li key={screener.id} className="hover:bg-foreground/5">
                  <div className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleFavorite(
                            screener.id,
                            favoriteFilterIds?.includes(screener.id) || false
                          )}
                          className={favoriteFilterIds?.includes(screener.id) ? 'text-yellow-500' : 'text-foreground/50'}
                        >
                          <Star size={18} />
                        </Button>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium truncate">{screener.name}</h3>
                        
                        <p className="text-sm text-foreground/50 line-clamp-2">
                          {screener.description}
                        </p>
                        
                      </div>
                      <div className="flex-shrink-0 flex items-center space-x-4">
                       
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal size={18} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleApplyFilter(translateToDTO(screener))}>
                              Apply
                            </DropdownMenuItem>
                            {activeCategory === 'myScreens' && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => handleDeleteFilter(screener.id)}
                                >
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewScreenerLibrary;

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
