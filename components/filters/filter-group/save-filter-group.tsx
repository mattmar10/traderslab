"use client";
import { startTransition, useState, useTransition } from "react";

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
import { X } from "lucide-react";
import { FilterGroup, FilterGroupDTO, FilterGroupPermissionType } from "@/lib/types/screener-types";
import { Textarea } from "@/components/ui/textarea";
import { saveFilterGroup, updateFilterGroup } from "../actions";

export interface SaveToLibraryProps {
  fgToSave: FilterGroupDTO;
  updateMode: boolean;
  onCancel: () => void;
  onSuccess: (createdOrUpdated: FilterGroupDTO) => void;
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
  ] = useState(fgToSave.filterGroupDescription); // New state for description

  const [saveToLibraryFormError, setSaveToLibraryFormError] =
    useState<string>("");

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [failureMessage, setFailureMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSaveToLibrary = async (formData: FormData) => {
    const name = formData.get("filterGroupName") as string;
    const description = formData.get("filterGroupDescription") as string;

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
            selectedPermission
          );
        } else {
          result = await saveFilterGroup(
            filterGroupToSave,
            saveToLibraryFilterGroupDescription,
            selectedPermission
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
          setSuccessMessage("Filter group saved successfully!");
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

  const header = updateMode ? "Update in Library" : "Save to Library";

  return (
    <div className="w-full transition-all duration-300 ease-in-out">
      <div className="border border-foreground/10 pt-2 pb-4 px-4 ">
        <div className="flex justify-between items-start">
          <div className="font-semibold">{header}</div>
          <X
            className="cursor-pointer text-foreground/50 h-4 w-4"
            onClick={onCancel}
          />
        </div>
        {successMessage && (
          <div
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">{successMessage}</span>
          </div>
        )}
        <form action={handleSaveToLibrary}>
          <div className="flex items-end gap-2 pt-2">
            <div className="flex flex-col flex-grow">
              <Label
                htmlFor="filterGroupName"
                className="text-sm font-semibold"
              >
                Screen Name
              </Label>
              <Input
                id="filterGroupName"
                name="filterGroupName"
                defaultValue={
                  saveToLibraryFilterGroupName || fgToSave.filterGroupName
                }
                placeholder="Enter filter group name"
                className="flex-grow mt-1 required"
              />
            </div>

            <div className="flex flex-col">
              <Label htmlFor="permission" className="text-sm font-semibold">
                Permission
              </Label>
              <Select
                name="permission"
                value={selectedPermission}
                onValueChange={(value) =>
                  setSelectedPermission(value as FilterGroupPermissionType)
                }
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Select Permission" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRIVATE">Private</SelectItem>
                  <SelectItem value="SHARED">Shared</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save"}
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setSaveToLibraryFormError("");
                onCancel();
              }}
            >
              Cancel
            </Button>
          </div>

          <div className="flex flex-col mt-4">
            <Label
              htmlFor="filterGroupDescription"
              className="text-sm font-semibold"
            >
              Screen Description
            </Label>
            <Textarea
              id="filterGroupDescription" // Associate textarea with label using the id
              name="filterGroupDescription"
              defaultValue={
                saveToLibraryFilterGroupDescription ||
                fgToSave.filterGroupDescription
              }
              onChange={(e) =>
                setSaveToLibraryFilterGroupDescription(e.target.value)
              }
              rows={5}
              placeholder="Enter filter group description"
              className="flex-grow rounded-none required mt-1"
            />
          </div>
          {saveToLibraryFormError && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3  relative mt-2"
              role="alert"
            >
              <span className="block sm:inline">{saveToLibraryFormError}</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default SaveToLibrary;
