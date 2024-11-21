import { Suspense } from 'react';
import Loading from '@/components/loading';
import { notFound } from "next/navigation";
import { getFullProfile, getPriceBars, getQuotesFromFMP } from '@/actions/market-data/actions';
import SymbolPageWrapper from '../_components/symbol-page-wrapper';
import { isFMPDataLoadingError, Quote } from '@/lib/types/fmp-types';
import { getIncomeStatementForSymbol, getNewsForSymbol } from '@/actions/news/actions';

interface SymbolPageContentProps {
  ticker: string;
}

async function SymbolPageContent({ ticker }: SymbolPageContentProps) {
  const [quoteData, profile, bars, news, incomeStatement] = await Promise.all([
    getQuotesFromFMP([ticker]),
    getFullProfile(ticker),
    getPriceBars(ticker),
    getNewsForSymbol(ticker),
    getIncomeStatementForSymbol(ticker, "quarter")
  ]);

  if (isFMPDataLoadingError(bars)) {
    return (
      <div>Error fetching price data</div>
    )
  }



  const q: Quote = quoteData[0]

  return (
    <SymbolPageWrapper
      quote={q}
      profile={profile[0]}
      candles={bars}
      news={isFMPDataLoadingError(news) ? [] : news}
      incomeStatement={!incomeStatement || isFMPDataLoadingError(incomeStatement) ? [] : incomeStatement} />
  );
}

function SymbolPageServer({ ticker }: SymbolPageContentProps) {
  return (
    <Suspense fallback={<Loading />}>
      <SymbolPageContent ticker={ticker} />
    </Suspense>
  );
}


interface PageProps {
  params: {
    ticker: string;
  };
}

export default function SymbolPage({ params }: PageProps) {
  if (!params.ticker) {
    notFound();
  }

  return <SymbolPageServer ticker={params.ticker} />;
}