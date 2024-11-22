import { useState } from "react";

export interface LogoComponentProps {
  ticker: string;
}

const LogoComponent = ({ ticker }: LogoComponentProps) => {
  const [imageError, setImageError] = useState(false);
  const logoUrl = `https://financialmodelingprep.com/image-stock/${ticker}.png`;

  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-full">
      {imageError ? (
        <div className=" bg-primary">
          <span className="text-2xl font-bold text-primary-foreground">
            {ticker.charAt(0)}
          </span>
        </div>
      ) : (
        <img
          src={logoUrl}
          alt={`${ticker} logo`}
          className="h-16 w-16 rounded-full"
          onError={() => setImageError(true)}
        />
      )}
    </div>
  );
};

export default LogoComponent;
