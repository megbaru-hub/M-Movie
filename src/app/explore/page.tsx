import { prisma } from '@/lib/prisma'
import MovieCard from '@/components/movies/MovieCard'
import Link from 'next/link'
import { FILM_GENRES, MUSIC_GENRES, COUNTRIES, YEARS } from '@/lib/constants'

export const dynamic = 'force-dynamic'

interface ExploreProps {
    searchParams: {
        category?: string
        genre?: string
        country?: string
        year?: string
        q?: string
    }
}

export default async function ExplorePage({ searchParams }: ExploreProps) {
    const params = await searchParams
    const { category, genre, country, year, q } = params

    const categoryConfig = [
        { id: 'all', label: 'All', db: 'all' },
        { id: 'music', label: 'Music', db: 'music' },
        { id: 'movies', label: 'Movies', db: 'movie' },
        { id: 'tvseries', label: 'TV Shows', db: 'tvseries' },
        { id: 'anime', label: 'Anime', db: 'anime' },
    ]

    const currentConfig = categoryConfig.find(c => c.id === category) || categoryConfig[0]
    const dbCategory = currentConfig.db

    const where: any = {}
    if (dbCategory !== 'all') {
        where.category = dbCategory
    }
    if (genre) where.genre = genre
    if (country) where.country = country
    if (year) where.year = year
    if (q) {
        where.title = {
            contains: q
        }
    }

    const movies = await prisma.movie.findMany({
        where,
        include: {
            ratings: true,
            _count: {
                select: { ratings: true }
            }
        },
        orderBy: { createdAt: 'desc' },
        take: 50
    })

    // Metadata rules (using full lists from constants)
    const isAll = dbCategory === 'all'
    const showGenre = !isAll && (dbCategory === 'movie' || dbCategory === 'tvseries' || dbCategory === 'music')
    const showCountry = !isAll && (dbCategory === 'movie' || dbCategory === 'tvseries' || dbCategory === 'anime')
    const showYear = !isAll && (dbCategory === 'movie' || dbCategory === 'tvseries' || dbCategory === 'anime')

    const filterGenres = dbCategory === 'music' ? MUSIC_GENRES : FILM_GENRES
    const filterCountries = COUNTRIES
    const filterYears = YEARS


    return (
        <div className="p-8 md:p-16">
            <div className="mb-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase">
                            {q ? `Search: ${q}` : 'Explore Library'}
                        </h1>
                        <p className="text-zinc-500 max-w-xl font-medium text-lg">
                            {q
                                ? `Displaying cinematic results for "${q}" across our entire anthology.`
                                : 'Browse through our world-class anthology. Filter by genre, country, or era to find your next cinematic obsession.'
                            }
                        </p>
                    </div>
                    <div className="flex items-center gap-4 pb-2">
                        <div className="h-10 w-px bg-white/10" />
                        <div className="text-right">
                            <p className="text-2xl font-black text-white italic">{movies.length}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Titles Found</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-8">
                    {categoryConfig.map(c => {
                        const nextQuery = { ...params, category: c.id === 'all' ? undefined : c.id }
                        return (
                            <Link
                                key={c.id}
                                href={{ pathname: '/explore', query: nextQuery }}
                                className={`rounded-full px-6 py-2 text-xs font-bold uppercase tracking-widest transition border ${(category === c.id || (!category && c.id === 'all'))
                                    ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                                    : 'bg-zinc-900 border-white/5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
                                    }`}
                            >
                                {c.label}
                            </Link>
                        )
                    })}
                </div>

                {/* Sub-filters */}
                {(showGenre || showCountry || showYear) && (
                    <div className="flex flex-col gap-8 p-8 rounded-3xl bg-zinc-900/50 border border-white/5 backdrop-blur-xl">
                        {showGenre && (
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-4 px-1">
                                    <div className="h-1 w-1 rounded-full bg-primary" />
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Genre</label>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Link
                                        href={{ pathname: '/explore', query: { ...params, genre: undefined } }}
                                        className={`px-4 py-2 rounded-xl text-[11px] font-bold border transition ${!genre ? 'bg-white text-black border-white' : 'bg-zinc-900/50 text-zinc-400 border-white/5 hover:border-white/10 hover:text-white'}`}
                                    >
                                        All Genres
                                    </Link>
                                    {filterGenres.map(g => (
                                        <Link
                                            key={g}
                                            href={{ pathname: '/explore', query: { ...params, genre: g } }}
                                            className={`px-4 py-2 rounded-xl text-[11px] font-bold border transition ${genre === g ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-zinc-900/50 text-zinc-400 border-white/5 hover:border-white/10 hover:text-white'}`}
                                        >
                                            {g}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {showGenre && showCountry && <div className="h-px w-full bg-white/5" />}

                        {showCountry && (
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-4 px-1">
                                    <div className="h-1 w-1 rounded-full bg-primary" />
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Country</label>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Link
                                        href={{ pathname: '/explore', query: { ...params, country: undefined } }}
                                        className={`px-4 py-2 rounded-xl text-[11px] font-bold border transition ${!country ? 'bg-white text-black border-white' : 'bg-zinc-900/50 text-zinc-400 border-white/5 hover:border-white/10 hover:text-white'}`}
                                    >
                                        All Countries
                                    </Link>
                                    {filterCountries.map(c => (
                                        <Link
                                            key={c}
                                            href={{ pathname: '/explore', query: { ...params, country: c } }}
                                            className={`px-4 py-2 rounded-xl text-[11px] font-bold border transition ${country === c ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-zinc-900/50 text-zinc-400 border-white/5 hover:border-white/10 hover:text-white'}`}
                                        >
                                            {c}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {(showGenre || showCountry) && showYear && <div className="h-px w-full bg-white/5" />}

                        {showYear && (
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-4 px-1">
                                    <div className="h-1 w-1 rounded-full bg-primary" />
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Release Year</label>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Link
                                        href={{ pathname: '/explore', query: { ...params, year: undefined } }}
                                        className={`px-4 py-2 rounded-xl text-[11px] font-bold border transition ${!year ? 'bg-white text-black border-white' : 'bg-zinc-900/50 text-zinc-400 border-white/5 hover:border-white/10 hover:text-white'}`}
                                    >
                                        All Years
                                    </Link>
                                    {filterYears.map(y => (
                                        <Link
                                            key={y}
                                            href={{ pathname: '/explore', query: { ...params, year: y } }}
                                            className={`px-4 py-2 rounded-xl text-[11px] font-bold border transition ${year === y ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-zinc-900/50 text-zinc-400 border-white/5 hover:border-white/10 hover:text-white'}`}
                                        >
                                            {y}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {movies.map((movie) => {
                    const avgRating = movie.ratings.length > 0
                        ? movie.ratings.reduce((acc, r) => acc + r.value, 0) / movie.ratings.length
                        : 0;

                    return (
                        <MovieCard
                            key={movie.id}
                            id={movie.id}
                            title={movie.title}
                            year={movie.year || ''}
                            category={movie.category}
                            thumbnail={movie.thumbnail || undefined}
                            views={Number(movie.views)}
                            rating={avgRating}
                        />
                    )
                })}
            </div>

            {movies.length === 0 && (
                <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/50">
                    <p className="text-zinc-500">No content found for these filters.</p>
                </div>
            )}
        </div>
    )
}
