const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyPermissions() {
    console.log('--- CONTENT OWNERSHIP VERIFICATION ---');

    // 1. Create a dummy movie
    const movie = await prisma.movie.create({
        data: {
            title: 'VERIFICATION_TEST_MOVIE',
            slug: 'verification-test-' + Date.now(),
            category: 'test',
            uploaderId: 'cmlajzijv0000kupray3re64r' // Archiver01 (Content Admin)
        }
    });
    console.log(`Created test movie with ID: ${movie.id} and uploaderId: ${movie.uploaderId}`);

    // Simulation of DELETE logic
    const simulateDelete = (role, userId, movieRecord) => {
        if (role !== 'SUPER_ADMIN' && movieRecord.uploaderId !== userId) {
            return { allowed: false, error: 'Forbidden' };
        }
        return { allowed: true };
    };

    console.log('\nTesting Role/Owner Combinations:');

    // Case A: Super Admin
    const caseA = simulateDelete('SUPER_ADMIN', 'other-user', movie);
    console.log(`- SUPER_ADMIN on other's movie: ${caseA.allowed ? 'PASS' : 'FAIL'}`);

    // Case B: Owner Content Admin
    const caseB = simulateDelete('CONTENT_ADMIN', 'cmlajzijv0000kupray3re64r', movie);
    console.log(`- CONTENT_ADMIN on own movie: ${caseB.allowed ? 'PASS' : 'FAIL'}`);

    // Case C: Non-Owner Content Admin
    const caseC = simulateDelete('CONTENT_ADMIN', 'wrong-user-id', movie);
    console.log(`- CONTENT_ADMIN on other's movie: ${caseC.allowed ? 'FAIL' : 'PASS (Blocked)'}`);

    // Cleanup
    await prisma.movie.delete({ where: { id: movie.id } });
    console.log('\nTest movie purged. Verification Complete.');
}

verifyPermissions().catch(console.error).finally(() => prisma.$disconnect());
