'use client';

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-md bg-numoria-indigo px-4 py-2 text-sm font-bold text-white transition hover:bg-numoria-indigo/90 print:hidden"
    >
      🖨️ Imprimir
    </button>
  );
}
