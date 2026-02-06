import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // Create a test user
    const user = await prisma.user.upsert({
        where: { email: 'test@example.com' },
        update: {},
        create: {
            email: 'test@example.com',
            name: 'Test User',
            image: 'https://github.com/shadcn.png',
            role: 'admin',
        },
    })

    console.log('Created user:', user)

    // Create Movies
    await prisma.movie.createMany({
        data: [
            // Movies
            { title: 'Inception', slug: 'inception', category: 'movie', genre: 'Sci-Fi', country: 'USA', year: '2010', thumbnail: 'https://image.tmdb.org/t/p/w500/9gk7Fn9sVAsS9Te6B1M1uEis0Tu.jpg' },
            { title: 'The Joker', slug: 'the-joker', category: 'movie', genre: 'Drama', country: 'USA', year: '2019', thumbnail: 'https://image.tmdb.org/t/p/w500/udDclKVb9hp7QYnktz3q73IuWrr.jpg' },
            { title: 'Parasite', slug: 'parasite', category: 'movie', genre: 'Thriller', country: 'South Korea', year: '2019', thumbnail: 'https://image.tmdb.org/t/p/w500/7IiTTjMvXnB7VvSopDStR3ZpZvc.jpg' },
            { title: 'The Conjuring', slug: 'the-conjuring', category: 'movie', genre: 'Horror', country: 'USA', year: '2013', thumbnail: 'https://image.tmdb.org/t/p/w500/wS3UI9YDWv76B9oafVkpSR9bsmZ.jpg' },
            { title: 'Superbad', slug: 'superbad', category: 'movie', genre: 'Comedy', country: 'USA', year: '2007', thumbnail: 'https://image.tmdb.org/t/p/w500/ek8966mE9pXjO2HTo306L3V37s4.jpg' },
            { title: 'The Notebook', slug: 'the-notebook', category: 'movie', genre: 'Romance', country: 'USA', year: '2004', thumbnail: 'https://image.tmdb.org/t/p/w500/r5i77yLg776uS9Y0JmS3Fj1V3S3.jpg' },
            { title: 'Sherlock Holmes', slug: 'sherlock-holmes', category: 'movie', genre: 'Mystery', country: 'UK', year: '2009', thumbnail: 'https://image.tmdb.org/t/p/w500/momkTsYf4uHja0Vk5YvBrLZp9OI.jpg' },
            { title: 'Gladiator', slug: 'gladiator', category: 'movie', genre: 'Action', country: 'USA', year: '2000', thumbnail: 'https://image.tmdb.org/t/p/w500/ty8hS8p9v99SVP8p6SJB6ByNUXu.jpg' },
            { title: 'The Godfather', slug: 'the-godfather', category: 'movie', genre: 'Crime', country: 'USA', year: '1972', thumbnail: 'https://image.tmdb.org/t/p/w500/3bhkrjOiERoSTq9A96HBhqF6D3b.jpg' },
            { title: 'Dune: Part Two', slug: 'dune-part-two', category: 'movie', genre: 'Sci-Fi', country: 'USA', year: '2024', thumbnail: 'https://image.tmdb.org/t/p/w500/czembS0RRef9ZW69S792VkwBh2t.jpg' },

            // TV Series
            { title: 'Breaking Bad', slug: 'breaking-bad', category: 'tvseries', genre: 'Crime', country: 'USA', year: '2008', thumbnail: 'https://image.tmdb.org/t/p/w500/ggFHnq966Ckp6MByq1tD21FsY3u.jpg' },
            { title: 'Money Heist', slug: 'money-heist', category: 'tvseries', genre: 'Action', country: 'Spain', year: '2017', thumbnail: 'https://image.tmdb.org/t/p/w500/reEMJA1uzpG3XZufuHF9b60vYfi.jpg' },
            { title: 'Dark', slug: 'dark', category: 'tvseries', genre: 'Sci-Fi', country: 'Germany', year: '2017', thumbnail: 'https://image.tmdb.org/t/p/w500/fTuxNlgvTSqi97S4Wg9UnTHQpU.jpg' },
            { title: 'The Crown', slug: 'the-crown', category: 'tvseries', genre: 'History', country: 'UK', year: '2016', thumbnail: 'https://image.tmdb.org/t/p/w500/r7fV_0tAOnX1S0l3MEnH1sF0l3M.jpg' },
            { title: 'Squid Game', slug: 'squid-game', category: 'tvseries', genre: 'Thriller', country: 'South Korea', year: '2021', thumbnail: 'https://image.tmdb.org/t/p/w500/d99XpUn3Kj5I3MEnH1sF0l3M.jpg' },
            { title: 'The Office', slug: 'the-office', category: 'tvseries', genre: 'Comedy', country: 'USA', year: '2005', thumbnail: 'https://image.tmdb.org/t/p/w500/q9S0Un3Kj5I3MEnH1sF0l3M.jpg' },

            // Anime
            { title: 'Naruto', slug: 'naruto', category: 'anime', genre: 'Shonen', country: 'Japan', year: '2002', thumbnail: 'https://image.tmdb.org/t/p/w500/398tT9O7o3Yw6LA9pZJa9ABbuUC.jpg' },
            { title: 'One Piece', slug: 'one-piece', category: 'anime', genre: 'Adventure', country: 'Japan', year: '1999', thumbnail: 'https://image.tmdb.org/t/p/w500/fcid97clQon6STFCY9Gps89YS0f.jpg' },
            { title: 'Attack on Titan', slug: 'attack-on-titan', category: 'anime', genre: 'Action', country: 'Japan', year: '2013', thumbnail: 'https://image.tmdb.org/t/p/w500/hPkqY2EMqY0AtYsrnuKySiKRvNk.jpg' },
            { title: 'Death Note', slug: 'death-note', category: 'anime', genre: 'Mystery', country: 'Japan', year: '2006', thumbnail: 'https://image.tmdb.org/t/p/w500/i9Y4En3MEnH1sF0l3MEnH1sF0l3M.jpg' },
            { title: 'Solo Leveling', slug: 'solo-leveling', category: 'anime', genre: 'Action', country: 'Japan', year: '2024', thumbnail: 'https://image.tmdb.org/t/p/w500/9gk7Fn9sVAsS9Te6B1M1uEis0Tu.jpg' },
            { title: 'Demon Slayer', slug: 'demon-slayer', category: 'anime', genre: 'Fantasy', country: 'Japan', year: '2019', thumbnail: 'https://image.tmdb.org/t/p/w500/d7fV_0tAOnX1S0l3MEnH1sF0l3M.jpg' },

            // Music
            { title: 'Blinding Lights', slug: 'blinding-lights', category: 'music', genre: 'Pop', country: 'Canada', year: '2020', thumbnail: 'https://image.tmdb.org/t/p/w500/9gk7Fn9sVAsS9Te6B1M1uEis0Tu.jpg' },
            { title: 'Godzilla', slug: 'godzilla-eminem', category: 'music', genre: 'Hip-Hop', country: 'USA', year: '2020', thumbnail: 'https://image.tmdb.org/t/p/w500/9gk7Fn9sVAsS9Te6B1M1uEis0Tu.jpg' },
            { title: 'Bohemian Rhapsody', slug: 'bohemian-rhapsody', category: 'music', genre: 'Rock', country: 'UK', year: '1975', thumbnail: 'https://image.tmdb.org/t/p/w500/9gk7Fn9sVAsS9Te6B1M1uEis0Tu.jpg' },
        ]
    })

    console.log('Seed data created successfully')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
