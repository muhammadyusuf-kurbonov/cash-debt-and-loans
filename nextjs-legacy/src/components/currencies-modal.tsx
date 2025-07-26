import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pencil, Trash2, Check, X } from 'lucide-react'
import { useContext, useState, useTransition } from 'react'
import { CurrenciesContext } from '@/providers/currencies-provider'
import { useRouter } from 'next/navigation'
import { addCurrency, disableCurrency, updateCurrency } from '@/app/actions'

export function CurrenciesModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const currencies = useContext(CurrenciesContext);

  const router = useRouter()
  const [newCurrencyName, setNewCurrencyName] = useState('')
  const [newCurrencySymbol, setNewCurrencySymbol] = useState('')
  const [editId, setEditId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const [editSymbolValue, setEditSymbolValue] = useState('')
  const [isPending, startTransition] = useTransition()

  const addCategory = async () => {
    const name = newCurrencyName.trim();
    const symbol = newCurrencySymbol.trim();

    if (!name || !symbol) {
      return;
    }

    await addCurrency(name, symbol);
    startTransition(() => {
      router.refresh();
    });
  }

  const deleteCategory = async (index: number) => {
    if (editId === index) {
      setEditId(null)
      setEditValue('')
      await disableCurrency(editId);
      startTransition(() => {
        router.refresh();
      });
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
    const oldVal = currencies.find(item => item.id === editId);
    if (!oldVal) {
      setEditId(null)
      setEditValue('')
      setEditSymbolValue('')
      return;
    }
    if ((editValue.trim() != oldVal.name) || (editSymbolValue.trim() !== oldVal.symbol)) {
      updateCurrency(editId!, editValue.trim(), editSymbolValue.trim());
      startTransition(() => {
        router.refresh();
      });
    } else {
      setEditId(null)
      setEditValue('')
      setEditSymbolValue('')
    }

  }

  const cancelEdit = () => {
    setEditId(null)
    setEditValue('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Currencies</DialogTitle>
          <DialogDescription>View, add, edit, or delete categories.</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {currencies.map((currency, index) => (
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
                  <Button size="icon" variant="ghost" disabled={isPending} onClick={saveEdit}>
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
                    {index != 0 && <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteCategory(currency.id)}
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
              placeholder="New currency"
              value={newCurrencyName}
              onChange={(e) => setNewCurrencyName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCategory()}
            />
            <Input
              placeholder="Symbol"
              value={newCurrencySymbol}
              onChange={(e) => setNewCurrencySymbol(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCategory()}
            />
            <Button disabled={isPending} onClick={addCategory}>Add</Button>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="secondary">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
