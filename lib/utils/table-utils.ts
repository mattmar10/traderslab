export const calculateColorFromPercentage = (
  value: number,
  theme: "dark" | "light",
  min: number,
  neutral: number,
  max: number
): string => {
  // Define colors for light and dark themes
  const positiveColor = theme === "dark" ? "#4CAF50" : "#228B22"; // Green
  const negativeColor = theme === "dark" ? "#F44336" : "#FF6347"; // Red

  // Calculate opacity based on distance from neutral value
  let opacity;
  if (value < neutral) {
    opacity = Math.max(0, Math.min(1, (neutral - value) / (neutral - min)));
  } else {
    opacity = Math.max(0, Math.min(1, (value - neutral) / (max - neutral)));
  }

  // Interpolate opacity
  const interpolatedOpacity = Math.round(opacity * 100);

  // Determine color based on value and neutral
  let color;
  if (value === neutral) {
    color = positiveColor;
  } else {
    color = value >= neutral ? positiveColor : negativeColor;
  }

  // Apply opacity
  color =
    color + Math.min(interpolatedOpacity, 100).toString(16).padStart(2, "0");

  return color;
};

export const calculateColorFromPercentageInverted = (
  value: number,
  theme: "dark" | "light",
  min: number,
  neutral: number,
  max: number
): string => {
  // Define colors for light and dark themes
  const greenColor = theme === "dark" ? "4CAF50" : "228B22"; // Green
  const redColor = theme === "dark" ? "F44336" : "FF6347"; // Red

  // Normalize the value to a 0-1 range
  const normalizedValue = (value - min) / (max - min);

  // Calculate the neutral point in the 0-1 range
  const neutralPoint = (neutral - min) / (max - min);

  // Calculate intensity based on distance from neutral
  let intensity;
  if (normalizedValue <= neutralPoint) {
    // For values below or equal to neutral, intensity increases as value decreases
    intensity = 1 - normalizedValue / neutralPoint;
  } else {
    // For values above neutral, intensity increases as value increases
    intensity = (normalizedValue - neutralPoint) / (1 - neutralPoint);
  }

  // Ensure intensity is between 0 and 1
  intensity = Math.max(0, Math.min(1, intensity));

  // Determine color based on value
  const color = normalizedValue <= neutralPoint ? greenColor : redColor;

  // Convert intensity to hex
  const opacityHex = Math.round(intensity * 255)
    .toString(16)
    .padStart(2, "0");

  // Apply opacity
  return `#${color}${opacityHex}`;
};
export const calculateGreenOrRed = (
  theme: "dark" | "light",
  condition: boolean
): string => {
  // Define colors for light and dark themes
  const positiveColor = theme === "dark" ? "#4CAF50" : "#228B22"; // Green
  const negativeColor = theme === "dark" ? "#F44336" : "#FF6347"; // Red

  let color = condition ? positiveColor : negativeColor;

  color = color + Math.min(50, 100).toString(16).padStart(2, "0");

  return color;
};
