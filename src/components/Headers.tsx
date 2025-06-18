export const Header = () => {
  return (
    <header className="w-full px-6 py-4 bg-gray-900 border-b border-gray-700 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold text-white">The Block is TETRIS</h1>
      </div>

      <a className="text-sm text-gray-400"
        href="https://monad.xyz"
        target="_blank"
        rel="noopener noreferrer">
        Powered by <span className="text-white font-medium"><img src="/monad.svg" height={12} /></span>
      </a>
    </header>
  );
};
