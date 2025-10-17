import { useQuery } from "@tanstack/react-query";
import { useAPI } from "~/api/use-api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";

type CurrencySelectProps = {
  currency: number | undefined;
  onChange: (currencyId: number) => void;
};

export function CurrencySelect({ currency, onChange }: CurrencySelectProps) {
  const { api } = useAPI();
  
  const { data: currencies = [], isLoading, isError } = useQuery({
    queryKey: ['currencies'],
    queryFn: async () => {
      if (!api) {
        throw new Error('API client not initialized');
      }
      const response = await api.currencies.currencyControllerFindAll();
      return response?.data || [];
    },
    retry: 1, // Retry once on failure
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    cacheTime: 10 * 60 * 1000, // Cache data for 10 minutes
    enabled: !!api, // Only run query when api is available
  });

  // If there was an error, show an error state
  if (isError) {
    return (
      <Select value={currency?.toString()} onValueChange={(value) => onChange(parseInt(value))}>
        <SelectTrigger className="w-[80px]">
          <SelectValue placeholder="Error" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem key="error" value="error">
            Error loading currencies
          </SelectItem>
        </SelectContent>
      </Select>
    );
  }

  return (
    <Select value={currency?.toString()} onValueChange={(value) => onChange(parseInt(value))}>
      <SelectTrigger className="w-[80px]">
        {isLoading && (!currencies || currencies.length === 0) ? (
          <SelectValue placeholder="..." /> 
        ) : (
          <SelectValue placeholder="Currency" />
        )}
      </SelectTrigger>
      <SelectContent>
        {currencies?.map((curr) => (
          <SelectItem key={curr.id} value={curr.id.toString()}>
            {curr.symbol}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}