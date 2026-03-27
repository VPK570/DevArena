import Link from 'next/link';
import challenges from '@/lib/challenges';

export default function HomePage() {
  return (
    <main className="lg:ml-64 pt-14 min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden border-b border-[#00F0FF]/15">
        <div className="absolute inset-0 bg-gradient-to-b from-[#00F0FF]/5 to-transparent"></div>
        <div className="relative z-10 text-center">
          <div className="text-[10px] text-[#00F0FF] font-headline tracking-[0.5em] mb-4 opacity-70">SYSTEM_ACCESS_GRANTED</div>
          <h1 className="text-7xl md:text-9xl font-headline font-black tracking-tighter glitch-text text-white leading-none">BATTLE-FRONT</h1>
          <p className="mt-6 text-[#B3B7CF] font-body max-w-xl mx-auto px-4 uppercase">THE PREMIER CODING COMBAT ARENA. INFILTRATE. OPTIMIZE. DOMINATE.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <button className="group relative px-8 py-3 bg-transparent border-2 border-[#00F0FF] text-[#00F0FF] font-headline font-bold tracking-widest overflow-hidden transition-all hover:bg-[#00F0FF] hover:text-[#131316]">
              <span className="relative z-10">INITIATE_QUEUE</span>
              <div className="absolute inset-0 bg-[#00F0FF]/20 group-hover:bg-[#00F0FF] transition-all"></div>
            </button>
            <button className="px-8 py-3 border border-[#B3B7CF]/30 text-[#B3B7CF] font-headline font-bold tracking-widest hover:border-[#00F0FF] transition-all">VIEW_MANUAL</button>
          </div>
        </div>
      </section>

      {/* Global Event Feed */}
      <div className="bg-surface-container-lowest border-b border-[#00F0FF]/15 h-8 overflow-hidden flex items-center">
        <div className="whitespace-nowrap flex items-center gap-8 animate-marquee font-body text-[10px] text-[#00F0FF]/60 uppercase tracking-widest">
          <span>[LOG] USER_X7 INFILTRATED BINARY_TREE_ARENA...</span>
          <span>[EVENT] DOUBLE_ELO_WEEKEND NOW ACTIVE...</span>
          <span>[ALERT] CRITICAL_VULNERABILITY DETECTED IN PATHFINDING_MODULE...</span>
          <span>[LOG] CLAN_VOID SECURED #1 POSITION...</span>
          <span>[LOG] USER_X7 INFILTRATED BINARY_TREE_ARENA...</span>
          <span>[EVENT] DOUBLE_ELO_WEEKEND NOW ACTIVE...</span>
        </div>
      </div>

      <div className="p-8 grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Left: Challenges */}
        <div className="xl:col-span-3 space-y-8">
          <div className="flex justify-between items-end border-b border-[#00F0FF]/15 pb-4">
            <h2 className="font-headline text-2xl font-bold tracking-widest text-white uppercase">ACTIVE_ARENAS <span className="text-[#00F0FF] text-sm ml-2">[{challenges.length.toString().padStart(2, '0')}]</span></h2>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#00F0FF] animate-pulse"></div>
                <span className="text-[10px] text-[#B3B7CF] uppercase">SERVER_REGION: US_EAST</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map((challenge) => (
              <Link 
                key={challenge.id} 
                href={`/challenge/${challenge.id}`}
                className={`glass-card border border-[#00F0FF]/10 p-6 flex flex-col group hover:border-[#00F0FF]/50 transition-all relative overflow-hidden ${challenge.difficulty === 'Hard' ? 'bg-[#FF003C]/5 border-[#FF003C]/30 hover:border-[#FF003C]/70' : ''}`}
              >
                <div className={`absolute top-0 right-0 p-2 text-[8px] font-headline opacity-40 uppercase ${challenge.difficulty === 'Hard' ? 'text-[#FF003C]' : 'text-[#00F0FF]'}`}>
                  STMT_{challenge.id.substring(0, 3).toUpperCase()}
                </div>
                <div className={`mb-4 ${challenge.difficulty === 'Hard' ? 'text-[#FF003C]' : 'text-[#00F0FF]'}`}>
                  <span className="material-symbols-outlined text-3xl">
                    {challenge.difficulty === 'Easy' ? 'account_tree' : challenge.difficulty === 'Medium' ? 'route' : 'security'}
                  </span>
                </div>
                <h3 className="font-headline text-lg font-bold text-white mb-2 tracking-tight">{challenge.title}</h3>
                <p className="text-xs text-[#B3B7CF] font-body mb-6 leading-relaxed flex-grow">{challenge.shortDescription}</p>
                <div className="mt-auto flex justify-between items-center">
                  <span className={`${challenge.difficulty === 'Hard' ? 'bg-[#FF003C]/20 text-[#FF003C]' : 'bg-[#00F0FF]/10 text-[#00F0FF]'} px-2 py-1 text-[9px] font-headline uppercase`}>
                    {challenge.difficulty} // 100XP
                  </span>
                  <span className={`text-[10px] font-body uppercase ${challenge.difficulty === 'Hard' ? 'text-[#FF003C] font-bold' : 'text-[#B3B7CF]'}`}>
                    ACTIVE
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Recent Activity Table */}
          <div className="mt-12">
            <h2 className="font-headline text-sm font-bold tracking-widest text-[#B3B7CF] mb-4 uppercase">LATEST_TRANSMISSIONS</h2>
            <div className="bg-surface-container-low border border-[#00F0FF]/5">
              <div className="grid grid-cols-4 p-3 border-b border-[#00F0FF]/10 text-[10px] font-headline text-[#00F0FF] opacity-60 uppercase">
                <div>TIMESTAMP</div>
                <div>OPERATOR</div>
                <div>ACTION</div>
                <div>RESULT</div>
              </div>
              <div className="divide-y divide-[#00F0FF]/5">
                {[
                  { time: '14:02:11', op: 'NULL_PTR', action: 'INFILTRATION', result: '+42 ELO' },
                  { time: '14:01:45', op: 'ROOT_USER', action: 'OPTIMIZATION', result: '+12 ELO' },
                  { time: '13:59:22', op: 'CYBER_STRIKE', action: 'ABORTED', result: '-20 ELO' },
                ].map((row, i) => (
                  <div key={i} className="grid grid-cols-4 p-3 text-[11px] font-body text-[#B3B7CF] hover:bg-[#00F0FF]/5 transition-colors uppercase">
                    <div>{row.time}</div>
                    <div className="text-white">{row.op}</div>
                    <div>{row.action}</div>
                    <div className={row.result.includes('+') ? 'text-[#00F0FF]' : 'text-error-container'}>{row.result}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: User Vitals */}
        <div className="space-y-6">
          <div className="bg-surface-container-highest border border-[#00F0FF]/15 p-6 space-y-8">
            <h2 className="font-headline text-xs font-bold tracking-widest text-[#00F0FF] uppercase">USER_VITALS_v4.2</h2>
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="font-headline text-[10px] text-[#B3B7CF] uppercase">CURRENT_ELO</span>
                <span className="font-headline text-2xl font-black text-white">2450</span>
              </div>
              <div className="h-1 bg-surface-container-low w-full">
                <div className="h-full bg-[#00F0FF] shadow-[0_0_10px_rgba(0,240,255,0.5)]" style={{ width: '82%' }}></div>
              </div>
              <div className="flex justify-between mt-1 text-[9px] text-[#00F0FF]/50 font-headline uppercase">
                <span>RANK: ELITE</span>
                <span>GOAL: 3000 (GRANDMASTER)</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-[#131316] border border-[#00F0FF]/5">
                <div className="text-[9px] font-headline text-[#B3B7CF] mb-1 uppercase">STREAK</div>
                <div className="text-lg font-headline text-white uppercase">12_DAYS</div>
              </div>
              <div className="p-3 bg-[#131316] border border-[#00F0FF]/5">
                <div className="text-[9px] font-headline text-[#B3B7CF] mb-1 uppercase">ACCURACY</div>
                <div className="text-lg font-headline text-white">94.8%</div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] font-body p-2 border border-[#00F0FF]/5 bg-surface-container-lowest uppercase">
                <span className="text-[#B3B7CF]">SYSTEM_STABILITY</span>
                <span className="text-[#00F0FF]">OPTIMAL</span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-body p-2 border border-[#00F0FF]/5 bg-surface-container-lowest uppercase">
                <span className="text-[#B3B7CF]">FIREWALL_STATUS</span>
                <span className="text-[#00F0FF]">ACTIVE</span>
              </div>
            </div>
            <button className="w-full bg-[#FF003C] text-white font-headline text-xs py-3 font-bold tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2 uppercase">
              <span className="material-symbols-outlined text-sm">sync</span>
              FORCE_SYNC_LOGS
            </button>
          </div>

          {/* Active Competitors Micro-Grid */}
          <div className="p-6 bg-[#131316] border border-[#00F0FF]/15">
            <h3 className="font-headline text-[10px] text-[#B3B7CF] tracking-widest mb-4 uppercase">NEAREST_THREATS</h3>
            <div className="space-y-4">
              {[
                { name: 'KILL_SWITCH_00', elo: '2448', progress: '90%', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5zrFqKaFREaTHOO4CYHVRBwB7f8yEOOhrPofYd1Sm7ykNTP3GilK-2P6PTnK7jvuH8OTGoK3Gvr1qLG0DsR6x2CJ7YQjiK4XdiJsV-iunicPm6fGK3ulfW-pGAQYMZf2ZMCAA4nBvCO26JEuUm28j2hbbcPFYEvBvSfHDFdVryfVrkxS4C98fC3J46J42xee4MulTngYWtSzqTdpHxJR1CbEFHavg_XDKotnsv0TEqZEIAcRJ2MB06RoW3kos4o8alxbZgXWS-1cP' },
                { name: 'DATA_GHOST', elo: '2442', progress: '75%', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAWMClZH-lpzZcR3E2fEME21w0Fyiz54Z4IlfqtB7y2mvFPYWWf6j3zDsYkqBhOeSgaBJtHZkiJjv-AugPXjw3OGXYH30orVZ7rn83qbf0kpYjzsVM4m6ERbdl9BVxH04q7iOKK1gMU_CgLaKtUHODga_o0Q78uQ6e8EK5sNk-ksDfBq7fqHs8IA4qYQ0sjJWh5_g_6PX13vjn46t_VLpxxPZOlbwproBISLvAmrFf9BMgC2lmgEl7WeBIdFpwYrvJ0RoHZzEu9W9Wr' }
              ].map((threat, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-8 h-8 bg-[#00F0FF]/10 flex items-center justify-center border border-[#00F0FF]/20 overflow-hidden">
                    <img alt={threat.name} className="w-6 h-6 object-cover" src={threat.img} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-[10px] font-headline text-white">
                      <span>{threat.name}</span>
                      <span className="text-[#00F0FF]">{threat.elo} ELO</span>
                    </div>
                    <div className="h-0.5 bg-surface-container-low mt-1">
                      <div className="h-full bg-tertiary-container" style={{ width: threat.progress }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <footer className="bg-[#131316] border-t border-[#00F0FF]/15 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-[10px] font-headline text-[#B3B7CF] tracking-widest uppercase">
          © 2024 BATTLE-FRONT // ALL RIGHTS RESERVED // <span className="text-[#00F0FF]">ENCRYPTED_SESSION</span>
        </div>
        <div className="flex gap-6">
          <a className="text-[10px] font-headline text-[#B3B7CF] hover:text-[#00F0FF] transition-colors uppercase" href="#">SECURITY_PROTOCOL</a>
          <a className="text-[10px] font-headline text-[#B3B7CF] hover:text-[#00F0FF] transition-colors uppercase" href="#">DEBUG_CONSOLE</a>
          <a className="text-[10px] font-headline text-[#B3B7CF] hover:text-[#00F0FF] transition-colors uppercase" href="#">API_RESOURCES</a>
        </div>
      </footer>
    </main>
  );
}
