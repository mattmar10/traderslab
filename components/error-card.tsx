import React, { FC } from "react";
import { RiRobot3Line } from "react-icons/ri";

export interface ErrorCardProps {
  errorMessage: string;
}

const ErrorCard: FC<ErrorCardProps> = ({ errorMessage }) => {
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-red-100 border border-red-300 rounded shadow-lg">
      <RiRobot3Line className="text-red-500" size={48} />
      <h2 className="mt-2 text-lg font-semibold text-red-700">Error</h2>
      <p className="text-center text-red-600">{errorMessage}</p>
    </div>
  );
};

export default ErrorCard;
