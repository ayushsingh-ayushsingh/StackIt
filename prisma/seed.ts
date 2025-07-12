import { PrismaClient } from '../lib/generated/prisma';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

type User = { id: string };
type Tag = { id: string };

const createDefaultUser = async (): Promise<User> => {
    // Check if default user already exists
    const existingUser = await prisma.userProfile.findUnique({
        where: { id: 'default-author-id' }
    });

    if (existingUser) {
        return existingUser;
    }

    // Create default user if it doesn't exist
    return prisma.userProfile.create({
        data: {
            id: 'default-author-id',
            clerkId: 'default-clerk-id',
            username: 'Demo User',
            avatarUrl: faker.image.avatar(),
            bio: 'Default user for demo questions',
            role: 'USER',
        },
    });
};

const createFakeUsers = async (count = 10): Promise<User[]> => {
    return Promise.all(
        Array.from({ length: count }).map(() =>
            prisma.userProfile.create({
                data: {
                    clerkId: faker.string.uuid(),
                    username: faker.internet.username(), // Updated method
                    avatarUrl: faker.image.avatar(),
                    bio: faker.lorem.sentence(),
                    role: 'USER',
                },
            })
        )
    );
};

const createFakeTags = async (): Promise<Tag[]> => {
    const tagNames = ['React', 'Next.js', 'Node.js', 'JWT', 'Tailwind', 'Prisma', 'TypeScript'];
    return Promise.all(
        tagNames.map((name) =>
            prisma.tag.create({
                data: { name },
            })
        )
    );
};

const createFakeQuestions = async (users: User[], tags: Tag[], count = 10) => {
    const questions = [];

    for (let i = 0; i < count; i++) {
        const author = faker.helpers.arrayElement(users);
        const questionTags = faker.helpers.arrayElements(tags, faker.number.int({ min: 1, max: 3 }));

        const question = await prisma.question.create({
            data: {
                title: faker.lorem.sentence(),
                description: {
                    json: {
                        type: 'doc',
                        content: [
                            {
                                type: 'paragraph',
                                content: [{ type: 'text', text: faker.lorem.paragraph() }],
                            },
                        ],
                    },
                },
                authorId: author.id,
                tags: {
                    create: questionTags.map((tag) => ({
                        tag: { connect: { id: tag.id } },
                    })),
                },
            },
        });

        questions.push(question);
    }

    return questions;
};

const createFakeAnswers = async (users: User[], questions: any[], countPerQuestion = 3) => {
    for (const question of questions) {
        await Promise.all(
            Array.from({ length: countPerQuestion }).map(() => {
                const author = faker.helpers.arrayElement(users);

                return prisma.answer.create({
                    data: {
                        content: {
                            json: {
                                type: 'doc',
                                content: [
                                    {
                                        type: 'paragraph',
                                        content: [{ type: 'text', text: faker.lorem.sentences(2) }],
                                    },
                                ],
                            },
                        },
                        questionId: question.id,
                        authorId: author.id,
                    },
                });
            })
        );
    }
};

const createFakeVotes = async (users: User[]) => {
    const answers = await prisma.answer.findMany();

    for (const answer of answers) {
        const voterCount = faker.number.int({ min: 1, max: 5 });
        const voters = faker.helpers.shuffle(users).slice(0, voterCount);

        for (const user of voters) {
            try {
                await prisma.vote.create({
                    data: {
                        voteType: faker.helpers.arrayElement(['UPVOTE', 'DOWNVOTE']),
                        userId: user.id,
                        answerId: answer.id,
                    },
                });
            } catch (error: any) {
                if (error.code !== 'P2002') {
                    console.error(`❌ Vote error (answerId: ${answer.id}, userId: ${user.id}):`, error);
                }
            }
        }
    }
};

async function main() {
    console.log('🌱 Seeding fake data...');

    await prisma.vote.deleteMany();
    await prisma.answer.deleteMany();
    await prisma.questionTag.deleteMany();
    await prisma.question.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.userProfile.deleteMany();

    // Create default user first
    const defaultUser = await createDefaultUser();
    console.log('✅ Default user created:', defaultUser.id);

    const users = await createFakeUsers(10);
    const tags = await createFakeTags();
    const questions = await createFakeQuestions(users, tags, 10);
    await createFakeAnswers(users, questions, 3);
    await createFakeVotes(users);

    console.log('✅ Fake data seeded!');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
