import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Pencil, Trash2, Check, X } from 'lucide-react'
import { useState } from 'react'
import { useAPI } from '~/api/use-api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CreateCurrencyDto, CurrencyResponseDto, UpdateCurrencyDto } from '~/api/api-client'

type Currency = {
  id: number;
  name: string;
  symbol: string;
};

export function CurrenciesModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
    const { api } = useAPI();
  
  const { data: currencies } = useQuery({
    queryKey: ['currencies'],
    queryFn: async () => {
      const response = await api?.currencies.currencyControllerFindAll();
      return response?.data || [];
    },
    initialData: [],
  });
  
  const [newCurrencyName, setNewCurrencyName] = useState('')
  const [newCurrencySymbol, setNewCurrencySymbol] = useState('')
  const [editId, setEditId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const [editSymbolValue, setEditSymbolValue] = useState('')

  const queryClient = useQueryClient();
  const saveNewCurrency = useMutation<void, Error, CreateCurrencyDto>({
    mutationFn: async (newCurrency) => {
      api?.currencies.currencyControllerCreate(newCurrency);
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['currencies'] })
    },
  });
  const deleteCurrencyMutation = useMutation<void, Error, number>({
    mutationFn: async (newCurrencyId) => {
      api?.currencies.currencyControllerRemove(newCurrencyId.toString());
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['currencies'] })
    },
  });
  const saveEditCurrency = useMutation<void, Error, UpdateCurrencyDto>({
    mutationFn: async (newCurrency) => {
      api?.currencies.currencyControllerUpdate(editId!.toString(), newCurrency);
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['currencies'] })
    },
  });

  const addCurrency = async () => {
    const name = newCurrencyName.trim();
    const symbol = newCurrencySymbol.trim();

    if (!name || !symbol) {
      return;
    }

    const newCurrency = {
      name: name,
      symbol: symbol,
    };

    await saveNewCurrency.mutateAsync(newCurrency);
    setNewCurrencyName('');
    setNewCurrencySymbol('');
  }

  const deleteCurrency = async (id: number) => {
    await deleteCurrencyMutation.mutateAsync(id);
    if (editId === id) {
      setEditId(null);
      setEditValue('');
      setEditSymbolValue('');
    }
  }

  const startEditing = (id: number) => {
    setEditId(id);
    const oldVal = currencies.find(item => item.id === id);
    if (oldVal) {
      setEditValue(oldVal.name);
      setEditSymbolValue(oldVal.symbol);
    }
  }

  const saveEdit = () => {
    if (editId !== null) {
      saveEditCurrency.mutateAsync({name: editValue.trim(), symbol: editSymbolValue.trim()});
      setEditId(null);
      setEditValue('');
      setEditSymbolValue('');
    }
  }

  const cancelEdit = () => {
    setEditId(null);
    setEditValue('');
    setEditSymbolValue('');
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Управление валютами</DialogTitle>
          <DialogDescription>Просмотр, добавление и редактирование валют.</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {currencies.map((currency) => (
            <div
              key={currency.id}
              className="border px-3 py-2 rounded bg-muted text-sm flex items-center justify-between gap-2"
            >
              {editId === currency.id ? (
                <div className="flex w-full items-center gap-2">
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit()
                      if (e.key === 'Escape') cancelEdit()
                    }}
                    autoFocus
                  />
                  <Input
                    value={editSymbolValue}
                    onChange={(e) => setEditSymbolValue(e.target.value)}
                    className="text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit()
                      if (e.key === 'Escape') cancelEdit()
                    }}
                  />
                  <Button size="icon" variant="ghost" onClick={saveEdit}>
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={cancelEdit}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <span className="truncate">{currency.name}</span>
                  <span className="truncate">{currency.symbol}</span>
                  <div className="flex gap-1">
                    <Button size="icon" variant="outline" onClick={() => startEditing(currency.id)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    {currency.id !== 1 && <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteCurrency(currency.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>}
                  </div>
                </>
              )}
            </div>
          ))}

          <div className="flex gap-2 mt-3">
            <Input
              placeholder="Новая валюта"
              value={newCurrencyName}
              onChange={(e) => setNewCurrencyName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCurrency()}
            />
            <Input
              placeholder="Символ"
              value={newCurrencySymbol}
              onChange={(e) => setNewCurrencySymbol(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCurrency()}
            />
            <Button onClick={addCurrency}>Добавить</Button>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="secondary">Закрыть</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}