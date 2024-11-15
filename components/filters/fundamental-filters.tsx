
import { FilterCriteria } from "@/lib/types/screener-types";
import MinimumDaysBeforeEarnings from "./minimum-days-before-earnings";

interface FundamentalFiltersProps {
  filters: FilterCriteria;
  handleFilterChange: (key: keyof FilterCriteria, value: any) => void;
}

const FundamentalFilters: React.FC<FundamentalFiltersProps> = ({
  filters,
  handleFilterChange,
}) => {
  return (
    <div className="mt-6 w-full ">
      <MinimumDaysBeforeEarnings
        value={filters.minimumDaysBeforeEarnings}
        onValueChange={(value) =>
          handleFilterChange("minimumDaysBeforeEarnings", value)
        }
      />
    </div>
  );
};

export default FundamentalFilters;
