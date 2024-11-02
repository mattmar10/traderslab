import { sectorsOrderMap } from "./util";

interface CustomYAxisLabelProps {
  x: number;
  y: number;
  payload: {
    value: number;
  };
}

const CustomYAxisLabel: React.FC<CustomYAxisLabelProps> = ({
  x,
  y,
  payload,
}) => {
  const sectorName = payload.value
    ? Array.from(sectorsOrderMap.entries()).find(
        ([_, val]) => val === payload.value
      )?.[0]
    : "";

  const formattedSectorName = sectorName
    ? sectorName
        .replace(/-/g, " ")
        .replace("communication", "Comm") // Abbreviate "Communication" to "Comm"
        .replace(/\b\w/g, (c) => c.toUpperCase()) // Capitalize each word
    : "";

  return (
    <text
      x={x}
      y={y}
      dy={0}
      textAnchor="end"
      fontSize={12}
      fill="#555"
      style={{ whiteSpace: "nowrap" }} // Prevents line break
    >
      {formattedSectorName}
    </text>
  );
};

export default CustomYAxisLabel;
