import { useQuery } from "@tanstack/react-query";
import type { CurrencyResponseDto } from "~/api/api-client";
import { useAPI } from "~/api/use-api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";

type CurrencySelectProps = {
  currency: number | undefined;
  onChange: (currencyId: number) => void;
};

export function CurrencySelect({ currency, onChange }: CurrencySelectProps) {
  const { api } = useAPI();

  const { data: currencies = [], isLoading, isError } = useQuery<CurrencyResponseDto[]>({
    queryKey: ['currencies'],
    queryFn: async () => {
      if (!api) {
        throw new Error('API client not initialized');
      }
      const response = await api.currencies.currencyControllerFindAll();
      return response?.data || [];
    },
    retry: 1,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!api,
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