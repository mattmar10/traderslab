import { notFound } from "next/navigation";

const SymbolPage = ({
  params,
}: // searchParams,
{
  params: { ticker: string };
  // searchParams?: { [key: string]: string | string[] | undefined };
}) => {
  if (!params.ticker) {
    notFound();
  }

  return (
    <main className="flex min-w-screen flex-col items-center justify-between pt-12">
      page for {params.ticker}
    </main>
  );
};

export default SymbolPage;
