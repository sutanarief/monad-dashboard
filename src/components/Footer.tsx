export const Footer = () => {
  return (<footer className="w-full mt-10 py-4 border-t border-gray-700 text-gray-400 text-sm text-center">
      <div className="max-w-screen-xl mx-auto px-4">
        <p>
          &copy; {new Date().getFullYear()} Tetris — Built with ❤️ on Monad.
        </p>
        <p className="mt-1">
          <a
            href="https://testnet.monadexplorer.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white transition"
          >
            View on Monad Explorer
          </a>
        </p>
      </div>
    </footer>
  );
};
