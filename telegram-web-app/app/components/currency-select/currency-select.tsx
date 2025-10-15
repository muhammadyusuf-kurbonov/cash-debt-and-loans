import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";

type CurrencySelectProps = {
  currency: number | undefined;
  onChange: (currencyId: number) => void;
};

export function CurrencySelect({ currency, onChange }: CurrencySelectProps) {
  // Mock currencies data - in a real app, this would come from the backend
  const currencies = [
    { id: 1, name: "USD", symbol: "$" },
    { id: 2, name: "EUR", symbol: "€" },
    { id: 3, name: "UZS", symbol: "UZS" },
    { id: 4, name: "GBP", symbol: "£" },
  ];

  return (
    <Select value={currency?.toString()} onValueChange={(value) => onChange(parseInt(value))}>
      <SelectTrigger className="w-[80px]">
        <SelectValue placeholder="Currency" />
      </SelectTrigger>
      <SelectContent>
        {currencies.map((curr) => (
          <SelectItem key={curr.id} value={curr.id.toString()}>
            {curr.symbol}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}