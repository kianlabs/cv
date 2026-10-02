import ChatWidget from '@/components/ChatWidget';

export default function Home() {
  return (
    <>
      {/* HEADER */}
      <header className="w-full bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-zinc-100">
        <div className="max-w-[700px] mx-auto px-5 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-7 h-7 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-[11px] tracking-wider">
              RP
            </div>
            <nav className="hidden sm:flex items-center gap-4 text-[12px] text-zinc-600">
              <a href="#projects" className="hover:text-zinc-900 transition-colors">Projects</a>
              <a href="#experience" className="hover:text-zinc-900 transition-colors">Experience</a>
              <a href="#featured" className="hover:text-zinc-900 transition-colors">Highlights</a>
            </nav>
          </div>
          <a 
            href="/cv-ridzkyan.pdf" 
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 text-white text-[11px] font-medium hover:bg-zinc-800 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>↓</span>
            <span>Download CV</span>
          </a>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-[700px] mx-auto w-full px-5 sm:px-6 pt-4 pb-20 space-y-14">
        
        {/* HERO SECTION */}
        <section className="space-y-5" id="about">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-sm">
              RP
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <h1 className="font-semibold text-zinc-900 text-base">Ridzkyan Buti Pratama</h1>
                <svg className="w-4 h-4 text-blue-500 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>
                </svg>
              </div>
              <div className="flex items-center gap-2.5 text-zinc-500">
                <a 
                  href="https://github.com/kianlabs" 
                  aria-label="GitHub" 
                  className="hover:text-zinc-900 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"></path>
                  </svg>
                </a>
                <a 
                  href="https://linkedin.com/in/ridzkyan-pratama-7911b441b" 
                  aria-label="LinkedIn" 
                  className="hover:text-zinc-900 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
                  </svg>
                </a>
                <a 
                  href="mailto:ridzkyan0504@gmail.com" 
                  aria-label="Email" 
                  className="hover:text-zinc-900 transition-colors"
                >
                  <span className="text-[15px]">✉</span>
                </a>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900">
              Full-Stack Web Developer <span className="font-normal text-zinc-400">—</span> Next.js · React · TypeScript
            </h2>
          </div>

          <p className="text-[14px] text-zinc-600 leading-relaxed">
            Fresh graduate in Informatics Engineering (<span className="font-medium text-zinc-900">Universitas Duta Bangsa Surakarta</span>, GPA 3.69) building web apps end-to-end. Freelance web developer via <span className="font-medium text-zinc-900">KyanDev</span> — I design, build, and ship production websites for clients with{' '}
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded text-[11px] font-mono font-medium bg-zinc-100 border border-zinc-200 text-zinc-800">
              <span className="w-1.5 h-1.5 rounded-full bg-black"></span> Next.js
            </span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded text-[11px] font-mono font-medium bg-zinc-100 border border-zinc-200 text-zinc-800">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> React
            </span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded text-[11px] font-mono font-medium bg-zinc-100 border border-zinc-200 text-zinc-800">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> TypeScript
            </span>
            and{' '}
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded text-[11px] font-mono font-medium bg-zinc-100 border border-zinc-200 text-zinc-800">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span> Tailwind CSS
            </span>.
          </p>

          <div className="pt-1">
            <div className="flex items-center gap-2.5">
              <a 
                href="/cv-ridzkyan.pdf" 
                className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-zinc-900 text-white text-[12px] font-medium hover:bg-zinc-800 transition-colors shadow-sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>View Resume</span>
                <span className="text-[13px] leading-none">›</span>
              </a>
              <a 
                href="/cv-ridzkyan.pdf" 
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50 text-zinc-700 text-[12px] font-medium transition-colors shadow-sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="text-[15px]">↓</span>
                <span>Download CV</span>
              </a>
            </div>
          </div>
        </section>

        {/* EXPERIENCE SECTION */}
        <section className="space-y-4 pt-2" id="experience">
          <div className="flex items-center justify-between pb-1">
            <h3 className="font-semibold text-zinc-900 text-sm tracking-tight">Experience</h3>
            <a href="#experience" className="text-[11px] text-zinc-400 hover:text-zinc-700 transition-colors flex items-center gap-0.5">
              View Details ›
            </a>
          </div>
          <div className="space-y-5 text-[13px]">
            <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-4 items-baseline">
              <div className="text-[12px] text-zinc-400 font-mono">[start date TBD] — Present</div>
              <div className="space-y-1.5">
                <h4 className="font-medium text-zinc-900">
                  Freelance Web Developer — KyanDev <span className="font-normal text-zinc-500">(Self-employed)</span>
                </h4>
                <p className="text-zinc-500 text-[12px]">Freelance / Remote</p>
                <ul className="text-zinc-600 text-[12px] space-y-1 pt-1 list-disc list-inside">
                  <li>Building client websites end-to-end from architecture to deployment.</li>
                  <li>Stack: Next.js, React, TypeScript, Tailwind CSS.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURED WORK SECTION */}
        <section className="space-y-4 pt-2" id="featured">
          <div className="flex items-center justify-between pb-1">
            <h3 className="font-semibold text-zinc-900 text-sm tracking-tight">Featured Work</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* UangKu Card */}
            <div className="rounded-xl bg-[#121212] bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] text-zinc-300 p-6 flex flex-col justify-between border border-zinc-800 shadow-sm min-h-[220px]">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-500 font-semibold">PERSONAL BUILD</span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Production Ready</span>
                </div>
                <h4 className="text-xl font-bold text-white tracking-tight">UangKu</h4>
                <p className="text-[12px] font-medium text-zinc-300">Personal Finance App</p>
                <p className="text-[12px] text-zinc-400 leading-relaxed">
                  PWA expense tracker with offline support, budget goals, and visual insights. Built from the ground up.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-3 text-[10px] font-mono">
                <span className="px-2 py-0.5 rounded bg-zinc-800/50 text-zinc-300 border border-zinc-700">Next.js</span>
                <span className="px-2 py-0.5 rounded bg-zinc-800/50 text-zinc-300 border border-zinc-700">TypeScript</span>
                <span className="px-2 py-0.5 rounded bg-zinc-800/50 text-zinc-300 border border-zinc-700">PostgreSQL</span>
              </div>
            </div>

            {/* GaweTracker Card */}
            <div className="rounded-xl bg-[#121212] bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] text-zinc-300 p-6 flex flex-col justify-between border border-zinc-800 shadow-sm min-h-[220px]">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-500 font-semibold">PERSONAL BUILD</span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Production Ready</span>
                </div>
                <h4 className="text-xl font-bold text-white tracking-tight">GaweTracker</h4>
                <p className="text-[12px] font-medium text-zinc-300">Job Application Tracker</p>
                <p className="text-[12px] text-zinc-400 leading-relaxed">
                  Kanban-style dashboard to manage job hunt pipeline. Track applications, interviews, and offers.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-3 text-[10px] font-mono">
                <span className="px-2 py-0.5 rounded bg-zinc-800/50 text-zinc-300 border border-zinc-700">Laravel</span>
                <span className="px-2 py-0.5 rounded bg-zinc-800/50 text-zinc-300 border border-zinc-700">MySQL</span>
                <span className="px-2 py-0.5 rounded bg-zinc-800/50 text-zinc-300 border border-zinc-700">Tailwind</span>
              </div>
            </div>

          </div>
        </section>

        {/* PROJECTS SECTION */}
        <section className="space-y-4 pt-2" id="projects">
          <div className="flex items-center justify-between pb-1">
            <h3 className="font-semibold text-zinc-900 text-sm tracking-tight">Projects</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            
            {/* KRING! */}
            <div className="rounded-xl border border-zinc-200/90 bg-white overflow-hidden flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:border-zinc-300 transition-colors">
              <div>
                <div className="bg-zinc-50 p-4 border-b border-zinc-100 flex flex-col justify-center min-h-[75px]">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">SME & POS</span>
                  <p className="text-[11px] font-medium text-zinc-800">Point of Sale System.</p>
                </div>
                <div className="p-4 space-y-1.5">
                  <h4 className="text-[13px] font-semibold text-zinc-900">KRING!</h4>
                  <p className="text-[11px] text-zinc-600 leading-relaxed pt-1">
                    Modern POS system for SMEs, TypeScript + Tailwind
                  </p>
                </div>
              </div>
              <div className="p-4 pt-2 flex items-center justify-between">
                <div className="flex flex-wrap gap-1 text-[9px] font-mono">
                  <span className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600">React</span>
                  <span className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600">TS</span>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-500 border border-zinc-200">Coming Soon</span>
              </div>
            </div>

            {/* NobarHub */}
            <div className="rounded-xl border border-zinc-200/90 bg-white overflow-hidden flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:border-zinc-300 transition-colors">
              <div>
                <div className="bg-zinc-50 p-4 border-b border-zinc-100 flex flex-col justify-center min-h-[75px]">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">CATALOG</span>
                  <p className="text-[11px] font-medium text-zinc-800">Movie discovery platform.</p>
                </div>
                <div className="p-4 space-y-1.5">
                  <h4 className="text-[13px] font-semibold text-zinc-900">NobarHub</h4>
                  <p className="text-[11px] text-zinc-600 leading-relaxed pt-1">
                    Search and explore movies with TMDb API integration
                  </p>
                </div>
              </div>
              <div className="p-4 pt-2 flex items-center justify-between">
                <div className="flex flex-wrap gap-1 text-[9px] font-mono">
                  <span className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600">Astro</span>
                  <span className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600">JS</span>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-500 border border-zinc-200">Coming Soon</span>
              </div>
            </div>

            {/* JamKosong */}
            <div className="rounded-xl border border-zinc-200/90 bg-white overflow-hidden flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:border-zinc-300 transition-colors">
              <div>
                <div className="bg-zinc-50 p-4 border-b border-zinc-100 flex flex-col justify-center min-h-[75px] relative">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">BOOKING</span>
                  <p className="text-[11px] font-medium text-zinc-800">Room scheduling app.</p>
                  <span className="absolute top-2 right-2 text-[9px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">IN PROGRESS</span>
                </div>
                <div className="p-4 space-y-1.5">
                  <h4 className="text-[13px] font-semibold text-zinc-900">JamKosong</h4>
                  <p className="text-[11px] text-zinc-600 leading-relaxed pt-1">
                    Meeting room booking with real-time availability
                  </p>
                </div>
              </div>
              <div className="p-4 pt-2 flex items-center justify-between">
                <div className="flex flex-wrap gap-1 text-[9px] font-mono">
                  <span className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600">Next.js</span>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-500 border border-zinc-200">Coming Soon</span>
              </div>
            </div>

          </div>
          <div className="flex justify-center pt-2">
            <a 
              href="#projects" 
              className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-zinc-900 text-white text-[11px] font-medium hover:bg-zinc-800 transition-colors shadow-sm"
            >
              <span>Explore All Projects</span>
              <span className="text-[12px] leading-none">›</span>
            </a>
          </div>
        </section>

        {/* TECHNOLOGIES SECTION */}
        <section className="space-y-4 pt-2" id="stack">
          <div className="flex items-center justify-between pb-1">
            <h3 className="font-semibold text-zinc-900 text-sm tracking-tight">Technologies</h3>
            <a href="#stack" className="text-[11px] text-zinc-400 hover:text-zinc-700 transition-colors flex items-center gap-0.5">
              View All ›
            </a>
          </div>
          <div className="flex flex-wrap gap-2 text-[12px]">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300 transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> React
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300 transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-black"></span> Next.js
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300 transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> TypeScript
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300 transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span> JavaScript
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300 transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span> Tailwind CSS
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300 transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> Astro
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300 transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> FastAPI
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300 transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-700"></span> PostgreSQL
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300 transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span> Node.js
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300 transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Python
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300 transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span> HTML/CSS
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300 transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Git
            </span>
          </div>
        </section>

        {/* CERTIFICATIONS SECTION */}
        <section className="space-y-4 pt-2">
          <div className="flex items-center justify-between pb-1">
            <h3 className="font-semibold text-zinc-900 text-sm tracking-tight">Certifications</h3>
            <a href="#contact" className="text-[11px] text-zinc-400 hover:text-zinc-700 transition-colors flex items-center gap-0.5">
              View All ›
            </a>
          </div>
          <div className="space-y-5 text-[13px]">
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-400">PROFESSIONAL CREDENTIAL</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-2 sm:gap-4 items-center">
              <div className="text-[12px] text-zinc-400 font-mono">[Date TBD]</div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-9 rounded border border-dashed border-zinc-300 bg-zinc-50 flex items-center justify-center text-[9px] font-mono text-zinc-400">
                  LOGO
                </div>
                <div>
                  <h4 className="font-medium text-zinc-900 text-[13px]">Placeholder 01 — Certification</h4>
                  <p className="text-[11px] text-zinc-400">[PLACEHOLDER — to be filled by owner]</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-2 sm:gap-4 items-center">
              <div className="text-[12px] text-zinc-400 font-mono">[Date TBD]</div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-9 rounded border border-dashed border-zinc-300 bg-zinc-50 flex items-center justify-center text-[9px] font-mono text-zinc-400">
                  LOGO
                </div>
                <div>
                  <h4 className="font-medium text-zinc-900 text-[13px]">Placeholder 02 — Technical Workshop</h4>
                  <p className="text-[11px] text-zinc-400">[PLACEHOLDER — to be filled by owner]</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* EDUCATION SECTION */}
        <section className="space-y-4 pt-2">
          <div className="flex items-center justify-between pb-1">
            <h3 className="font-semibold text-zinc-900 text-sm tracking-tight">Education</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-4 items-baseline text-[13px]">
            <div className="text-[12px] text-zinc-400 font-mono">2022 – 2026</div>
            <div className="space-y-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-medium text-zinc-900">Bachelor of Informatics Engineering</h4>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                  3.69 / 4.00
                </span>
              </div>
              <p className="text-zinc-500 text-[12px]">Universitas Duta Bangsa Surakarta</p>
            </div>
          </div>
        </section>

        {/* OUTSIDE THE IDE SECTION */}
        <section className="space-y-4 pt-2">
          <div className="flex items-center justify-between pb-1">
            <h3 className="font-semibold text-zinc-900 text-sm tracking-tight">Outside the IDE</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_130px] gap-6 items-center">
            <div className="space-y-3">
              <p className="text-[13px] text-zinc-600 leading-relaxed">
                When I'm not shipping code, I'm exploring new tech, running my small fashion affiliate business, or experimenting with AI tools and workflows. I recharge by learning — then bring it back into my builds.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="px-2.5 py-0.5 rounded-full border border-zinc-200 text-zinc-600 text-[11px]">Technology</span>
                <span className="px-2.5 py-0.5 rounded-full border border-zinc-200 text-zinc-600 text-[11px]">Business</span>
                <span className="px-2.5 py-0.5 rounded-full border border-zinc-200 text-zinc-600 text-[11px]">AI</span>
              </div>
            </div>
            <div className="hidden sm:flex justify-end">
              <div className="w-28 h-28 bg-white p-2 rounded-xl shadow-md border border-zinc-200 -rotate-3 hover:rotate-0 transition-transform">
                <div className="w-full h-full rounded-lg bg-gradient-to-tr from-sky-400 via-sky-300 to-indigo-200 flex flex-col justify-end p-2 relative overflow-hidden">
                  <div className="w-6 h-6 rounded-full bg-yellow-200/90 absolute top-2 right-2"></div>
                  <div className="w-10 h-10 rounded bg-white/30 backdrop-blur-sm mx-auto mb-1"></div>
                  <span className="text-[8px] font-mono text-zinc-700 text-center">Surakarta</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* GITHUB ACTIVITY SECTION */}
        <section className="space-y-4 pt-2">
          <div className="flex items-center justify-between pb-1">
            <h3 className="font-semibold text-zinc-900 text-sm tracking-tight">GitHub Activity</h3>
            <a 
              href="https://github.com/kianlabs" 
              className="text-[11px] text-zinc-400 hover:text-zinc-700 transition-colors flex items-center gap-0.5 font-mono"
              target="_blank"
              rel="noopener noreferrer"
            >
              github.com/kianlabs ↗
            </a>
          </div>
          <div className="border border-zinc-200 rounded-xl p-6 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col items-center justify-center space-y-4 min-h-[160px]">
            <div className="w-16 h-16 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-xl">
              RP
            </div>
            <div className="text-center space-y-1">
              <h4 className="font-semibold text-zinc-900 text-[14px]">@kianlabs</h4>
              <p className="text-[12px] text-zinc-600">View my GitHub profile for projects and contributions</p>
            </div>
            <a 
              href="https://github.com/kianlabs"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 text-white text-[12px] font-medium hover:bg-zinc-800 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"></path>
              </svg>
              <span>View GitHub Profile</span>
            </a>
          </div>
        </section>

        {/* LET'S WORK TOGETHER SECTION */}
        <section className="space-y-4 pt-4" id="contact">
          <div className="pb-1">
            <h3 className="font-semibold text-zinc-900 text-lg tracking-tight">Let's work together.</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_260px] gap-6 items-start">
            <div className="space-y-3">
              <p className="text-[13px] text-zinc-600 leading-relaxed">
                Available for freelance web development and full-stack projects, from new builds to existing websites. I also help build robust APIs, performant architectures, and responsive user interfaces.
              </p>
              <div className="flex items-center gap-2 pt-2 text-[12px] text-zinc-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Typical response time: under 24 hours</span>
              </div>
            </div>
            <div className="space-y-2.5 w-full">
              <a 
                href="mailto:ridzkyan0504@gmail.com"
                className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-[18px]">✉</span>
                  <div>
                    <p className="text-[11px] font-medium text-zinc-900">Email</p>
                    <p className="text-[10px] text-zinc-500">ridzkyan0504@gmail.com</p>
                  </div>
                </div>
                <span className="text-zinc-400 group-hover:text-zinc-600 text-[14px]">→</span>
              </a>
              <a 
                href="https://github.com/kianlabs"
                className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50 transition-all group"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 fill-current text-zinc-600" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"></path>
                  </svg>
                  <div>
                    <p className="text-[11px] font-medium text-zinc-900">GitHub</p>
                    <p className="text-[10px] text-zinc-500">@kianlabs</p>
                  </div>
                </div>
                <span className="text-zinc-400 group-hover:text-zinc-600 text-[14px]">→</span>
              </a>
              <a 
                href="https://linkedin.com/in/ridzkyan-pratama-7911b441b"
                className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50 transition-all group"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 fill-current text-zinc-600" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
                  </svg>
                  <div>
                    <p className="text-[11px] font-medium text-zinc-900">LinkedIn</p>
                    <p className="text-[10px] text-zinc-500">Ridzkyan Pratama</p>
                  </div>
                </div>
                <span className="text-zinc-400 group-hover:text-zinc-600 text-[14px]">→</span>
              </a>
              <a 
                href="mailto:ridzkyan0504@gmail.com"
                className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-[18px]">📅</span>
                  <div>
                    <p className="text-[11px] font-medium text-zinc-900">Schedule a Call</p>
                    <p className="text-[10px] text-zinc-500">Let's discuss your project</p>
                  </div>
                </div>
                <span className="text-zinc-400 group-hover:text-zinc-600 text-[14px]">→</span>
              </a>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="w-full border-t border-zinc-100 bg-white py-8 mt-12">
        <div className="max-w-[700px] mx-auto px-5 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-400">
          <div className="space-y-0.5 text-center sm:text-left">
            <p className="italic text-zinc-500">"Repetition until it becomes technique."</p>
            <p>© 2026 Ridzkyan Buti Pratama · Built with Next.js</p>
          </div>
          <div className="text-zinc-400 font-mono text-[10px]">Surakarta, ID</div>
        </div>
      </footer>

      {/* CHAT WIDGET */}
      <ChatWidget />
    </>
  );
}
