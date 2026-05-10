export function UncertaintyNote({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="border-l-2 pl-4 py-2 font-sans text-body-sm leading-relaxed"
      style={{
        borderColor: 'var(--grade-c)',
        color: '#7A5A20',
        backgroundColor: 'rgba(192,139,60,0.06)',
      }}
      role="note"
    >
      {children}
    </div>
  );
}
