import { useQuery } from "@tanstack/react-query";
import { useAPI } from "~/api/use-api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";

type CurrencySelectProps = {
  currency: number | undefined;
  onChange: (currencyId: number) => void;
};

export function CurrencySelect({ currency, onChange }: CurrencySelectProps) {
  const { api } = useAPI();
  
  const { data: currencies } = useQuery({ queryKey: ['currencies'], queryFn: async () => {
    const response = await api?.currencies.currencyControllerFindAll();
    return response?.data || [];
  } });

  return (
    <Select value={currency?.toString()} onValueChange={(value) => onChange(parseInt(value))}>
      <SelectTrigger className="w-[80px]">
        <SelectValue placeholder="Currency" />
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