interface ParsedQuery {
  amount: number;
  comment?: string;
}

export function parseQuery(query: string): ParsedQuery {
  const matches = /^\s*([\d\s]+)\s*(.*)$/.exec(query);
  const amount = parseFloat(matches?.[1] ?? '');

  const comment = matches?.[2] ?? '';

  return {
    amount,
    comment,
  };
}
