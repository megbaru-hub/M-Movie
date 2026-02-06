import { prisma } from '@/lib/prisma'
import MovieCard from '@/components/movies/MovieCard'
import Hero from '@/components/home/Hero'
import { Film, MonitorPlay, Star, Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const movies = await prisma.movie.findMany({
    take: 24,
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="flex flex-col bg-zinc-950">
      <Hero />

      {/* Feature Highlights Section */}
      <div className="px-8 md:px-20 lg:px-32 py-24 bg-gradient-to-b from-zinc-950 to-zinc-900/20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-7xl mx-auto">
          <div className="group space-y-6 p-8 rounded-[2.5rem] bg-zinc-900/30 border border-white/5 backdrop-blur-sm transition-all hover:bg-zinc-900/50 hover:border-primary/20">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <MonitorPlay className="h-7 w-7" />
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Cinema Anywhere</h3>
              <p className="text-zinc-500 leading-relaxed font-medium">Stream high-definition content on any device, anywhere in the world, with zero latency guaranteed.</p>
            </div>
          </div>

          <div className="group space-y-6 p-8 rounded-[2.5rem] bg-zinc-900/30 border border-white/5 backdrop-blur-sm transition-all hover:bg-zinc-900/50 hover:border-primary/20">
            <div className="h-14 w-14 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
              <Star className="h-7 w-7" />
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Pure Quality</h3>
              <p className="text-zinc-500 leading-relaxed font-medium">Experience true 4K HDR quality with Dolby Atmos support for an immersive theatrical experience at home.</p>
            </div>
          </div>

          <div className="group space-y-6 p-8 rounded-[2.5rem] bg-zinc-900/30 border border-white/5 backdrop-blur-sm transition-all hover:bg-zinc-900/50 hover:border-primary/20">
            <div className="h-14 w-14 rounded-2xl bg-zinc-100/10 flex items-center justify-center text-zinc-100 group-hover:scale-110 transition-transform">
              <Plus className="h-7 w-7" />
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Curated Lists</h3>
              <p className="text-zinc-500 leading-relaxed font-medium">Build your own personal cinema museum with advanced list management and custom recommendations.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 md:px-20 lg:px-32 py-16">
        <div className="mb-12 flex items-end justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-1 w-8 rounded-full bg-primary" />
              <h2 className="text-3xl font-black text-white tracking-tight uppercase italic">Recent Releases</h2>
            </div>
            <p className="text-zinc-500 text-sm font-medium tracking-wide translate-x-10">Hand-picked additions to our exclusive library.</p>
          </div>
          <button className="text-zinc-400 text-xs font-black uppercase tracking-[0.2em] hover:text-primary transition-colors border-b border-zinc-800 pb-1">
            Browse All
          </button>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-16 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              id={movie.id}
              title={movie.title}
              year={movie.year || ''}
              category={movie.category}
              thumbnail={movie.thumbnail || undefined}
            />
          ))}
        </div>

        {movies.length === 0 && (
          <div className="flex h-96 items-center justify-center rounded-[2.5rem] border border-white/5 bg-zinc-900/30 backdrop-blur-sm mt-12">
            <div className="text-center space-y-4">
              <div className="h-16 w-16 bg-zinc-800 rounded-2xl mx-auto flex items-center justify-center">
                <Film className="h-8 w-8 text-zinc-600" />
              </div>
              <p className="text-zinc-600 font-bold uppercase tracking-widest text-xs">No movies found in the vault.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
