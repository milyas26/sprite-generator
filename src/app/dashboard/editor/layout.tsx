export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="-m-6 h-[calc(100vh-3rem)]">
      {children}
    </div>
  );
}
