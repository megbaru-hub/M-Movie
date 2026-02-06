
const { PrismaClient } = require('@prisma/client')
const http = require('http')

const prisma = new PrismaClient()

async function testStream() {
    try {
        console.log("Looking for Short ID 3...")
        // Try finding as a Short first (since the route is /api/stream/shorts/...)
        const short = await prisma.short.findUnique({ where: { id: 3 } })

        if (!short) {
            console.log("Short ID 3 not found. Checking Movies...")
            // Maybe it's a movie? But the route is /api/stream/shorts...
            // The user IS using /api/stream/shorts/[id], so it expects a Short model.
            // If the content was uploaded via the NEW admin panel, it might be a MOVIE model.
            // But the error log showed /api/stream/shorts/3.
            // Let's check if there is a movie with ID 3 just in case the user is confused, 
            // but if the route calls prisma.short.findUnique, it MUST be a Short.
            return
        }

        console.log("Found Short:", short.title, "| File:", short.videoFile)

        // Test the URL
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/stream/shorts/3',
            method: 'GET',
            headers: {
                'Range': 'bytes=0-1024' // Test a partial chunk
            }
        }

        console.log(`Requesting ${options.path}...`)

        const req = http.request(options, (res) => {
            console.log(`STATUS: ${res.statusCode}`)
            console.log(`HEADERS: ${JSON.stringify(res.headers)}`)

            let data = []
            res.on('data', (chunk) => {
                data.push(chunk)
            })

            res.on('end', () => {
                console.log('Stream ended successfully. Received bytes:', Buffer.concat(data).length)
            })
        })

        req.on('error', (e) => {
            console.error(`Problem with request: ${e.message}`)
        })

        req.end()

    } catch (e) {
        console.error(e)
    } finally {
        await prisma.$disconnect()
    }
}

testStream()
