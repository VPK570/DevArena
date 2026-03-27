import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="flex justify-between items-center w-full px-6 h-14 bg-[#131316] fixed top-0 z-50 border-b border-[#00F0FF]/15">
      <div className="flex items-center gap-8">
        <Link href="/" className="text-xl font-bold tracking-widest text-[#00F0FF] font-headline">BATTLE-FRONT</Link>
        <nav className="hidden md:flex gap-6 items-center h-full">
          <Link className="text-[#00F0FF] border-b-2 border-[#00F0FF] pb-1 font-headline text-xs tracking-[0.1em] transition-all duration-50" href="/">TERMINAL</Link>
          <a className="text-[#B3B7CF] hover:bg-[#00F0FF]/10 hover:text-white transition-all duration-50 font-headline text-xs tracking-[0.1em]" href="#">STREAK</a>
          <a className="text-[#B3B7CF] hover:bg-[#00F0FF]/10 hover:text-white transition-all duration-50 font-headline text-xs tracking-[0.1em]" href="#">MARKET</a>
        </nav>
      </div>
      <div className="flex items-center gap-4 text-[#00F0FF]">
        <button className="p-2 hover:bg-[#00F0FF]/10 transition-all duration-50">
          <span className="material-symbols-outlined">sensors</span>
        </button>
        <button className="p-2 hover:bg-[#00F0FF]/10 transition-all duration-50">
          <span className="material-symbols-outlined">settings_input_component</span>
        </button>
        <button className="p-2 hover:bg-[#00F0FF]/10 transition-all duration-50">
          <span className="material-symbols-outlined">terminal</span>
        </button>
      </div>
    </header>
  );
}
