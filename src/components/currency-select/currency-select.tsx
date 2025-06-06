import { currencyTable } from '@/db/schema';
import { CurrenciesContext } from '@/providers/currencies-provider';
import { useContext, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export function CurrencySelect({ currency, onChange }: {
  currency?: typeof currencyTable.$inferSelect['id'];
  onChange: (currency?: typeof currencyTable.$inferSelect['id']) => void;
}) {
  const currencies = useContext(CurrenciesContext);

  useEffect(() => {
    onChange(currencies[0].id);
  }, [currencies]);

  return (
    <div className="flex items-center gap-2">
      <Select onValueChange={(value: string) => onChange(parseInt(value))} value={currency?.toString()} defaultValue={currencies[0]?.id.toString()}>
        <SelectTrigger>
          <SelectValue placeholder="Currency"/>
        </SelectTrigger>
        <SelectContent>
          {currencies.map((currency) => (
            <SelectItem key={currency.id} value={currency.id.toString()}>
              {currency.name}
            </SelectItem>))
          }
        </SelectContent>
      </Select>
    </div>);
}
