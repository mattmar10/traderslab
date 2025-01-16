"use client";
import { useState, useTransition } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { X, Save, Plus } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { saveFilterGroup, updateFilterGroup } from "../actions";
import {
  FilterGroup,
  FilterGroupDTO,
  FilterGroupPermissionType,
} from "@/lib/types/screener-types";
import { Badge } from "@/components/ui/badge";

export interface SaveToLibraryProps {
  fgToSave: any;
  updateMode: boolean;
  onCancel: () => void;
  onSuccess: (createdOrUpdated: any) => void;
}

const SaveToLibrary: React.FC<SaveToLibraryProps> = ({
  fgToSave,
  updateMode,
  onCancel,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const [saveToLibraryFilterGroupName, setSaveToLibraryFilterGroupName] =
    useState(fgToSave.filterGroupName);
  const [selectedPermission, setSelectedPermission] =
    useState<FilterGroupPermissionType>(fgToSave.permission || "PRIVATE");
  const [
    saveToLibraryFilterGroupDescription,
    setSaveToLibraryFilterGroupDescription,
  ] = useState(fgToSave.filterGroupDescription);
  const [tags, setTags] = useState<string[]>(fgToSave.tags || []);
  const [newTag, setNewTag] = useState("");
  const [saveToLibraryFormError, setSaveToLibraryFormError] =
    useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [, setFailureMessage] = useState<string | null>(null);
  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag("");
    }
  };

  const handleSaveToLibrary = async () => {
    const name = saveToLibraryFilterGroupName.trim();
    const description = saveToLibraryFilterGroupDescription.trim();

    // Ensure both name and description are filled
    if (name.trim() === "") {
      setSaveToLibraryFormError("A name is required.");
      return;
    }

    if (!description || description.trim() === "") {
      setSaveToLibraryFormError("A description is required.");
      return;
    } else {
      setSaveToLibraryFormError(""); // Clear any previous errors
    }

    startTransition(async () => {
      try {
        const filterGroupToSave = {
          ...fgToSave.filterGroup,
          name: name,
          description: description,
        };

        let result;
        if (updateMode) {
          if (!fgToSave.filterGroupId) {
            throw Error("Screen must have an id to update");
          }

          result = await updateFilterGroup(
            fgToSave.filterGroupId,
            filterGroupToSave,
            saveToLibraryFilterGroupDescription,
            selectedPermission,
            tags
          );
        } else {
          result = await saveFilterGroup(
            filterGroupToSave,
            saveToLibraryFilterGroupDescription,
            selectedPermission,
            tags
          );
        }

        if (result.success && result.data && result.data.length > 0) {
          queryClient.invalidateQueries({ queryKey: ["userFilterGroups"] });
          queryClient.invalidateQueries({
            queryKey: ["favoriteFilterIds"],
          });
          queryClient.invalidateQueries({
            queryKey: ["favoriteFilterGroups"],
          });
          queryClient.invalidateQueries({
            queryKey: ["sharedFilters"],
          });
          setSaveToLibraryFilterGroupName("");
          setSaveToLibraryFilterGroupDescription("");
          setSuccessMessage("Screen saved successfully!");
          // Auto-hide after 3 seconds
          setTimeout(() => {
            setSuccessMessage(null);

            const saved = result.data[0];

            const translated: FilterGroupDTO = {
              filterGroupName: saved.name!,
              filterGroupDescription: saved.description!,
              userId: saved.userId!,
              permission: saved.permissionType as FilterGroupPermissionType,
              filterGroupId: saved.id,
              filterGroup: saved.payload as FilterGroup,
              updatedAt: saved.updatedAt!,
              tags: [],
            };

            onSuccess(translated);
          }, 3000);
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error("Error saving filter group:", error);

        // Show failure message
        setFailureMessage("Failed to save filter group. Please try again.");
        // Auto-hide after 3 seconds
        setTimeout(() => setFailureMessage(null), 3000);
      }
    });
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const header = updateMode ? "Update in Library" : "Save to Library";

  return (
    <div className="fixed inset-0 z-50 bg-foreground/10 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-background p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-primary/10 p-2">
              <Save className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{header}</h2>
              <p className="text-sm text-muted-foreground">
                {updateMode
                  ? "Update your screen settings"
                  : "Save your screen to access it later"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
            onClick={onCancel}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        {successMessage && (
          <div className="mb-4 rounded-md bg-traderslabblue/10 p-3 text-sm text-traderslabblue ">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-traderslabblue/50" />
              {successMessage}
            </div>
          </div>
        )}

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="filterGroupName">Screen Name</Label>
              <Input
                id="filterGroupName"
                name="filterGroupName"
                value={saveToLibraryFilterGroupName}
                onChange={(e) =>
                  setSaveToLibraryFilterGroupName(e.target.value)
                }
                placeholder="Enter filter group name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="permission">Permission</Label>
              <Select
                value={selectedPermission}
                onValueChange={(value) =>
                  setSelectedPermission(value as FilterGroupPermissionType)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Permission" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRIVATE">Private</SelectItem>
                  <SelectItem value="SHARED">Shared</SelectItem>
                  <SelectItem value="SYSTEM">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="filterGroupDescription">Screen Description</Label>
            <Textarea
              id="filterGroupDescription"
              name="filterGroupDescription"
              value={saveToLibraryFilterGroupDescription}
              onChange={(e) =>
                setSaveToLibraryFilterGroupDescription(e.target.value)
              }
              placeholder="Enter a detailed description"
              rows={4}
              className="resize-none"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-sm">
                  {tag}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                id="newTag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                className="flex-grow"
              />
              <Button type="button" onClick={handleAddTag} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>

          {saveToLibraryFormError && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-destructive" />
                {saveToLibraryFormError}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSaveToLibrary}
              disabled={isPending}
              className="min-w-[80px]"
            >
              {isPending ? (
                <div className="flex items-center gap-1">
                  <span>Saving</span>
                  <span className="animate-pulse">...</span>
                </div>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaveToLibrary;
