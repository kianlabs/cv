import ChatWidget from '@/components/ChatWidget';
import ThemeToggle from '@/components/ThemeToggle';
import GitHubHeatmap from '@/components/GitHubHeatmap';
import { TECHS } from '@/components/techs';

export default function Home() {
  return (
    <>
      {/* NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-ink/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800">
        <nav className="max-w-3xl w-full mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="w-7 h-7 shrink-0 rounded-full bg-gray-900 dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-[11px] tracking-wider">
              RP
            </div>
            <div className="flex items-center gap-3 sm:gap-4 text-[11px] sm:text-[13px] text-gray-500 dark:text-gray-400 whitespace-nowrap">
              <a href="#projects" className="hover:text-gray-900 dark:hover:text-white transition-colors">Projects</a>
              <a href="#experience" className="hover:text-gray-900 dark:hover:text-white transition-colors">Experience</a>
              <a href="#featured" className="hover:text-gray-900 dark:hover:text-white transition-colors">Highlights</a>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <a
              href="/cv-ridzkyan.pdf"
              className="inline-flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 rounded-full bg-gray-900 dark:bg-white text-white dark:text-black text-[11px] sm:text-[12px] font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>Resume</span>
              <span className="text-[13px] leading-none">›</span>
            </a>
            <ThemeToggle />
          </div>
        </nav>
      </header>

      {/* MAIN */}
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-14 sm:gap-16 px-4 sm:px-6 pb-10 sm:pb-16 pt-2">

        {/* HERO */}
        <section className="flex flex-col justify-center pt-6 pb-8 sm:pt-10 sm:pb-8" id="about">
          <div className="space-y-6 sm:space-y-10">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="h-32 w-32 shrink-0 rounded-full border-2 border-gray-200 dark:border-gray-500 bg-white dark:bg-ink flex items-center justify-center shadow-sm sm:h-40 sm:w-40">
                <span className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white tracking-wider">RP</span>
              </div>
              <div className="flex h-full flex-col justify-center gap-2.5 sm:gap-3">
                <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-2xl md:text-3xl">
                  Ridzkyan Buti Pratama
                  <svg viewBox="0 0 22 22" className="w-6 h-6 shrink-0 inline-block align-middle text-gray-400 dark:text-gray-500" role="img" aria-label="Verified">
                    <title>Verified</title>
                    <path fill="currentColor" d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.053-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.607-.274 1.264-.144 1.898.13.634.435 1.219.88 1.688.47.443 1.054.749 1.688.879.633.13 1.29.083 1.897-.14.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.607.224 1.264.272 1.897.14.634-.13 1.217-.436 1.687-.878.445-.47.75-1.055.88-1.688.13-.634.083-1.291-.14-1.897.586-.274 1.084-.705 1.438-1.246.354-.541.551-1.17.57-1.817Zm-11.343 3.9-3.5-3.5 1.238-1.238 2.262 2.262 5.315-5.315L15.5 8.35l-6.5 6.55Z" />
                  </svg>
                </h1>
                <div className="flex items-start gap-3">
                  <a href="https://github.com/kianlabs" target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition-all hover:-translate-y-0.5" title="GitHub" aria-label="GitHub">
                    <svg className="w-5 h-5 fill-current text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors" viewBox="0 0 24 24">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                  </a>
                  <a href="https://linkedin.com/in/ridzkyan-pratama-7911b441b" target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition-all hover:-translate-y-0.5" title="LinkedIn" aria-label="LinkedIn">
                    <svg className="w-5 h-5 fill-current text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </a>
                  <a href="mailto:ridzkyan0504@gmail.com" className="opacity-70 hover:opacity-100 transition-all hover:-translate-y-0.5" title="Email" aria-label="Email">
                    <svg className="w-5 h-5 fill-current text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors" viewBox="0 0 24 24">
                      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            <div className="space-y-5 sm:space-y-6">
              <h2 className="max-w-full text-[1.7rem] font-normal tracking-tight leading-tight text-gray-900 dark:text-white sm:text-[2.05rem] md:text-[2.15rem]">
                Full-Stack Web Developer{' '}
                <span className="text-[0.95em] font-light text-gray-500 dark:text-gray-400">— Next.js · React · TypeScript</span>
              </h2>
              <p className="text-base font-light leading-7 text-gray-500 dark:text-gray-400 sm:text-lg sm:leading-8">
                Fresh graduate in Informatics Engineering building web apps end-to-end. Freelance web developer via KyanDev, shipping production websites with{' '}
                <span className="inline align-middle">
                  <span className="bg-white dark:bg-ink ml-1 inline-flex items-center gap-1.5 rounded-md border border-dashed border-gray-300 dark:border-gray-700 px-2 py-1 text-xs text-gray-800 dark:text-gray-200 sm:px-2.5 sm:text-sm">
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="#000000" aria-hidden="true"><path d="M11.214 12.603l6.851 7.56c-.97.784-2.078 1.33-3.214 1.33-1.437 0-2.805-.863-3.96-2.347-1.181 1.5-2.566 2.367-4.016 2.367-3.045 0-5.472-3.19-5.472-7.125s2.427-7.125 5.472-7.125c1.437 0 2.805.863 3.96 2.347 1.181-1.5 2.566-2.367 4.016-2.367 3.045 0 5.472 3.19 5.472 7.125 0 .61-.05 1.203-.144 1.775l-8.965-1.54zM11.214 12.603L4.363 5.043c.97-.784 2.078-1.33 3.214-1.33 1.437 0 2.805.863 3.96 2.347 1.181-1.5 2.566-2.367 4.016-2.367 3.045 0 5.472 3.19 5.472 7.125s-2.427 7.125-5.472 7.125c-1.437 0-2.805-.863-3.96-2.347-1.181 1.5-2.566 2.367-4.016 2.367z" /></svg>Next.js
                  </span>
                  <span className="bg-white dark:bg-ink ml-1 inline-flex items-center gap-1.5 rounded-md border border-dashed border-gray-300 dark:border-gray-700 px-2 py-1 text-xs text-gray-800 dark:text-gray-200 sm:px-2.5 sm:text-sm">
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="#61DAFB" aria-hidden="true"><path d="M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.557 24 14.05 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.32-.186-.69-.274-1.1-.274zm-11.35 5.72c.108-.35.235-.698.38-1.043.324-.77.735-1.437 1.196-1.955.15-.17.302-.325.456-.464.354-.32.727-.564 1.114-.72.14-.058.28-.104.42-.14.13-.035.26-.06.39-.077.13-.018.26-.026.39-.026.28 0 .54.04.79.11.26.07.5.17.73.3.23.13.45.29.65.47.2.18.39.38.57.6.18.22.34.45.5.69.16.24.3.49.44.75.14.26.27.53.39.8.12.28.23.56.33.85.1.28.19.57.27.86.08.29.16.58.22.87.06.29.11.58.15.87.04.29.07.58.09.87.02.29.03.58.03.87 0 .29-.01.58-.03.87-.02.29-.05.58-.09.87-.04.29-.09.58-.15.87-.06.29-.14.58-.22.87-.08.29-.17.58-.27.86-.1.29-.21.57-.33.85-.12.27-.25.54-.39.8-.14.26-.28.51-.44.75-.16.24-.32.47-.5.69-.18.22-.37.42-.57.6-.2.18-.42.34-.65.47-.23.13-.47.23-.73.3-.25.07-.51.11-.79.11-.13 0-.26-.01-.39-.03-.13-.02-.26-.04-.39-.08-.14-.04-.28-.08-.42-.14-.39-.16-.76-.4-1.11-.72-.16-.14-.31-.3-.46-.47-.46-.52-.87-1.19-1.2-1.96-.14-.34-.27-.69-.38-1.04-.1-.35-.19-.7-.25-1.05-.07-.35-.11-.7-.14-1.05-.03-.35-.04-.7-.04-1.05 0-.35.01-.7.04-1.05.03-.35.07-.7.14-1.05.06-.35.15-.7.25-1.05z" /></svg>React
                  </span>
                  <span className="bg-white dark:bg-ink ml-1 inline-flex items-center gap-1.5 rounded-md border border-dashed border-gray-300 dark:border-gray-700 px-2 py-1 text-xs text-gray-800 dark:text-gray-200 sm:px-2.5 sm:text-sm">
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="#3178C6" aria-hidden="true"><path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0 .124-.498c0-.222-.066-.413-.2-.575-.133-.162-.317-.31-.55-.444a6.32 6.32 0 0 0-.797-.41c-.293-.133-.61-.272-.955-.416a8.716 8.716 0 0 1-1.223-.59 4.283 4.283 0 0 1-.962-.742 3.24 3.24 0 0 1-.627-.95 3.23 3.23 0 0 1-.226-1.235c0-.564.12-1.06.36-1.485a3.02 3.02 0 0 1 .974-1.048 4.32 4.32 0 0 1 1.44-.6 6.94 6.94 0 0 1 1.766-.2z" /></svg>TypeScript
                  </span>
                  <span className="bg-white dark:bg-ink ml-1 inline-flex items-center gap-1.5 rounded-md border border-dashed border-gray-300 dark:border-gray-700 px-2 py-1 text-xs text-gray-800 dark:text-gray-200 sm:px-2.5 sm:text-sm">
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="#06B6D4" aria-hidden="true"><path d="M12.001,4.8c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 C13.666,10.618,15.027,12,18.001,12c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C16.337,6.182,14.976,4.8,12.001,4.8z M6.001,12c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 c1.177,1.194,2.538,2.576,5.512,2.576c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C10.337,13.382,8.976,12,6.001,12z" /></svg>Tailwind CSS
                  </span>
                </span>{' '}
                and modern tooling. I design, build, and ship responsive websites and web applications from architecture to deployment.
              </p>

              <div className="flex items-center gap-2.5 pt-1">
                <a
                  href="/cv-ridzkyan.pdf"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gray-900 dark:bg-white text-white dark:text-black text-[13px] font-medium hover:opacity-90 transition-opacity"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>View Resume</span>
                  <span className="text-[14px] leading-none">›</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* EXPERIENCE */}
        <section className="w-full space-y-5" id="experience">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-[17px] font-semibold text-gray-900 dark:text-white leading-tight">Experience</h3>
          </div>
          <div className="space-y-6 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-[150px_1fr] gap-1 sm:gap-4 items-baseline">
              <div className="font-mono text-[12px] text-gray-400 dark:text-gray-500">[start date TBD] — Present</div>
              <div className="space-y-1.5">
                <h3 className="text-base font-semibold leading-tight text-gray-900 dark:text-white">
                  Freelance Web Developer — KyanDev <span className="font-normal text-gray-500 dark:text-gray-400">(Self-employed)</span>
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Freelance / Remote</p>
                <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1 pt-1 list-disc list-inside leading-relaxed">
                  <li>Building client websites end-to-end from architecture to deployment.</li>
                  <li>Stack: Next.js, React, TypeScript, Tailwind CSS.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURED WORK */}
        <section className="w-full space-y-5" id="featured">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-[17px] font-semibold text-gray-900 dark:text-white leading-tight">Featured Work</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* UangKu */}
            <div className="rounded-xl bg-[#121212] bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] text-zinc-300 p-6 flex flex-col justify-between border border-zinc-800 min-h-[220px]">
              <div className="space-y-2">
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
            {/* GaweTracker */}
            <div className="rounded-xl bg-[#121212] bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] text-zinc-300 p-6 flex flex-col justify-between border border-zinc-800 min-h-[220px]">
              <div className="space-y-2">
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

        {/* PROJECTS */}
        <section className="w-full space-y-5" id="projects">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-[17px] font-semibold text-gray-900 dark:text-white leading-tight">Projects</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* KRING! */}
            <div className="rounded-xl border border-gray-100 dark:border-white/[0.08] bg-white dark:bg-ink-card overflow-hidden flex flex-col justify-between hover:border-gray-300 dark:hover:border-white/20 transition-colors">
              <div>
                <div className="bg-gray-50 dark:bg-white/[0.03] p-4 border-b border-gray-100 dark:border-white/[0.06] flex flex-col justify-center min-h-[75px]">
                  <h4 className="text-[13px] font-semibold text-gray-900 dark:text-white">KRING!</h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 pt-1">Modern POS system for SMEs, TypeScript + Tailwind</p>
                </div>
              </div>
              <div className="p-4 pt-2 flex items-center justify-between">
                <div className="flex flex-wrap gap-1 text-[9px] font-mono">
                  <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-400">React</span>
                  <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-400">TS</span>
                </div>
                <span className="text-[9px] font-mono text-gray-400 dark:text-gray-500">Coming Soon</span>
              </div>
            </div>
            {/* NobarHub */}
            <div className="rounded-xl border border-gray-100 dark:border-white/[0.08] bg-white dark:bg-ink-card overflow-hidden flex flex-col justify-between hover:border-gray-300 dark:hover:border-white/20 transition-colors">
              <div>
                <div className="bg-gray-50 dark:bg-white/[0.03] p-4 border-b border-gray-100 dark:border-white/[0.06] flex flex-col justify-center min-h-[75px]">
                  <h4 className="text-[13px] font-semibold text-gray-900 dark:text-white">NobarHub</h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 pt-1">Search and explore movies with TMDb API integration</p>
                </div>
              </div>
              <div className="p-4 pt-2 flex items-center justify-between">
                <div className="flex flex-wrap gap-1 text-[9px] font-mono">
                  <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-400">Astro</span>
                  <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-400">JS</span>
                </div>
                <span className="text-[9px] font-mono text-gray-400 dark:text-gray-500">Coming Soon</span>
              </div>
            </div>
            {/* JamKosong */}
            <div className="rounded-xl border border-gray-100 dark:border-white/[0.08] bg-white dark:bg-ink-card overflow-hidden flex flex-col justify-between hover:border-gray-300 dark:hover:border-white/20 transition-colors">
              <div>
                <div className="bg-gray-50 dark:bg-white/[0.03] p-4 border-b border-gray-100 dark:border-white/[0.06] flex flex-col justify-center min-h-[75px] relative">
                  <h4 className="text-[13px] font-semibold text-gray-900 dark:text-white">JamKosong</h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 pt-1">Meeting room booking with real-time availability</p>
                  <span className="absolute top-2 right-2 text-[9px] font-mono text-gray-400 dark:text-gray-500">IN PROGRESS</span>
                </div>
              </div>
              <div className="p-4 pt-2 flex items-center justify-between">
                <div className="flex flex-wrap gap-1 text-[9px] font-mono">
                  <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-400">Next.js</span>
                </div>
                <span className="text-[9px] font-mono text-gray-400 dark:text-gray-500">Coming Soon</span>
              </div>
            </div>
          </div>
          <div className="flex justify-center pt-2">
            <a
              href="https://github.com/kianlabs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200 dark:border-white/[0.12] text-gray-700 dark:text-gray-300 text-[12px] font-medium hover:border-gray-300 dark:hover:border-white/25 transition-colors"
            >
              <span>Explore All Projects</span>
              <span className="text-[13px] leading-none">›</span>
            </a>
          </div>
        </section>

        {/* TECHNOLOGIES */}
        <section className="w-full space-y-5" id="stack">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-[17px] font-semibold text-gray-900 dark:text-white leading-tight">Technologies</h3>
          </div>
          <div className="flex flex-wrap gap-2 text-[13px]">
            {TECHS.map(({ name, color, path }) => (
              <span
                key={name}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] text-gray-800 dark:text-gray-300 hover:border-gray-300 dark:hover:border-white/20 transition-colors"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill={color} aria-hidden="true">
                  <path d={path} />
                </svg>
                {name}
              </span>
            ))}
          </div>
        </section>

        {/* CERTIFICATIONS */}
        <section className="w-full space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-[17px] font-semibold text-gray-900 dark:text-white leading-tight">Certifications</h3>
          </div>
          <div className="space-y-5 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-[150px_1fr] gap-2 sm:gap-4 items-center">
              <div className="font-mono text-[12px] text-gray-400 dark:text-gray-500">[Date TBD]</div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-9 rounded border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-white/[0.03] flex items-center justify-center text-[9px] font-mono text-gray-400 dark:text-gray-500">LOGO</div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white text-[13px]">Placeholder 01 — Certification</h4>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500">[PLACEHOLDER — to be filled by owner]</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[150px_1fr] gap-2 sm:gap-4 items-center">
              <div className="font-mono text-[12px] text-gray-400 dark:text-gray-500">[Date TBD]</div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-9 rounded border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-white/[0.03] flex items-center justify-center text-[9px] font-mono text-gray-400 dark:text-gray-500">LOGO</div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white text-[13px]">Placeholder 02 — Technical Workshop</h4>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500">[PLACEHOLDER — to be filled by owner]</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* EDUCATION */}
        <section className="w-full space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-[17px] font-semibold text-gray-900 dark:text-white leading-tight">Education</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-[150px_1fr] gap-1 sm:gap-4 items-baseline text-sm">
            <div className="font-mono text-[12px] text-gray-400 dark:text-gray-500">2022 – 2026</div>
            <div className="space-y-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-semibold text-gray-900 dark:text-white text-base">Bachelor of Informatics Engineering</h4>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/[0.08]">3.69 / 4.00</span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-[12px]">Universitas Duta Bangsa Surakarta</p>
            </div>
          </div>
        </section>

        {/* OUTSIDE THE IDE */}
        <section className="w-full space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-[17px] font-semibold text-gray-900 dark:text-white leading-tight">Outside the IDE</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_130px] gap-6 items-center">
            <div className="space-y-3">
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                When I&apos;m not shipping code, I&apos;m exploring new tech, running my small fashion affiliate business, or experimenting with AI tools and workflows. I recharge by learning — then bring it back into my builds.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['Technology', 'Business', 'AI'].map((t) => (
                  <span key={t} className="px-2.5 py-0.5 rounded-full border border-gray-200 dark:border-white/[0.12] text-gray-600 dark:text-gray-400 text-[11px]">{t}</span>
                ))}
              </div>
            </div>
            <div className="hidden sm:flex justify-end">
              <div className="w-28 h-28 bg-white dark:bg-ink-card p-2 rounded-xl shadow-md border border-gray-200 dark:border-white/[0.08] -rotate-3 hover:rotate-0 transition-transform">
                <div className="w-full h-full rounded-lg bg-gradient-to-tr from-gray-300 via-gray-200 to-gray-100 dark:from-white/[0.12] dark:via-white/[0.08] dark:to-white/[0.04] flex flex-col justify-end p-2 relative overflow-hidden">
                  <div className="w-6 h-6 rounded-full bg-gray-200/90 dark:bg-white/10 absolute top-2 right-2"></div>
                  <div className="w-10 h-10 rounded bg-white/40 backdrop-blur-sm mx-auto mb-1"></div>
                  <span className="text-[8px] font-mono text-gray-600 dark:text-gray-400 text-center">Surakarta</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* GITHUB ACTIVITY */}
        <section className="w-full space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-[17px] font-semibold text-gray-900 dark:text-white leading-tight">GitHub Activity</h3>
            <a href="https://github.com/kianlabs" className="text-[11px] text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors font-mono" target="_blank" rel="noopener noreferrer">
              github.com/kianlabs ↗
            </a>
          </div>

          {/* Contribution heatmap — native, GitHub-green, live from public API */}
          <GitHubHeatmap username="kianlabs" />
        </section>

        {/* LET'S WORK TOGETHER */}
        <section className="w-full space-y-5" id="contact">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">Let&apos;s work together.</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_260px] gap-6 items-start">
            <div className="space-y-3">
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Available for freelance web development and full-stack projects, from new builds to existing websites. I also help build robust APIs, performant architectures, and responsive user interfaces.
              </p>
              <div className="flex items-center gap-2 pt-2 text-[12px] text-gray-500 dark:text-gray-400">
                <span className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500"></span>
                <span>Typical response time: under 24 hours</span>
              </div>
            </div>
            <div className="space-y-2.5 w-full">
              <a href="mailto:ridzkyan0504@gmail.com" className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-white/[0.08] bg-white dark:bg-ink-card hover:border-gray-300 dark:hover:border-white/20 transition-all group">
                <div className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 fill-current text-gray-600 dark:text-gray-400" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" /></svg>
                  <div>
                    <p className="text-[11px] font-medium text-gray-900 dark:text-white">Email</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">ridzkyan0504@gmail.com</p>
                  </div>
                </div>
                <span className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 text-[14px]">→</span>
              </a>
              <a href="https://github.com/kianlabs" className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-white/[0.08] bg-white dark:bg-ink-card hover:border-gray-300 dark:hover:border-white/20 transition-all group" target="_blank" rel="noopener noreferrer">
                <div className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 fill-current text-gray-600 dark:text-gray-400" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
                  <div>
                    <p className="text-[11px] font-medium text-gray-900 dark:text-white">GitHub</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">@kianlabs</p>
                  </div>
                </div>
                <span className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 text-[14px]">→</span>
              </a>
              <a href="https://linkedin.com/in/ridzkyan-pratama-7911b441b" className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-white/[0.08] bg-white dark:bg-ink-card hover:border-gray-300 dark:hover:border-white/20 transition-all group" target="_blank" rel="noopener noreferrer">
                <div className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 fill-current text-gray-600 dark:text-gray-400" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                  <div>
                    <p className="text-[11px] font-medium text-gray-900 dark:text-white">LinkedIn</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">Ridzkyan Pratama</p>
                  </div>
                </div>
                <span className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 text-[14px]">→</span>
              </a>
              <a href="mailto:ridzkyan0504@gmail.com" className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-white/[0.08] bg-white dark:bg-ink-card hover:border-gray-300 dark:hover:border-white/20 transition-all group">
                <div className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 fill-current text-gray-600 dark:text-gray-400" viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" /></svg>
                  <div>
                    <p className="text-[11px] font-medium text-gray-900 dark:text-white">Schedule a Call</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">Let&apos;s discuss your project</p>
                  </div>
                </div>
                <span className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 text-[14px]">→</span>
              </a>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="w-full border-t border-gray-100 dark:border-gray-800 py-8 mt-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-400 dark:text-gray-500">
          <div className="space-y-0.5 text-center sm:text-left">
            <p className="italic text-gray-500 dark:text-gray-400">&quot;Repetition until it becomes technique.&quot;</p>
            <p>© 2026 Ridzkyan Buti Pratama · Built with Next.js</p>
          </div>
          <div className="font-mono text-[10px]">Surakarta, ID</div>
        </div>
      </footer>

      {/* CHAT WIDGET */}
      <ChatWidget />
    </>
  );
}
