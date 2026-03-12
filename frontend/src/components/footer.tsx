export function Footer() {
  return (
    <footer className="border-t border-border bg-white py-6">
      <div className="mx-auto max-w-5xl px-4 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Task Manager — Python IaC Practice
      </div>
    </footer>
  );
}
