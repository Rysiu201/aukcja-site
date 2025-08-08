import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const auctions = [
    {
      title: 'Laptop',
      description: 'Gaming laptop',
      startPrice: 1000,
      minIncrement: 50,
      startAt: new Date(Date.now() - 60 * 60 * 1000),
      endAt: new Date(Date.now() + 60 * 60 * 1000),
    },
    {
      title: 'Smartphone',
      description: 'Latest model smartphone',
      startPrice: 500,
      minIncrement: 25,
      startAt: new Date(Date.now() - 60 * 60 * 1000),
      endAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
    },
    {
      title: 'Headphones',
      description: 'Noise-cancelling headphones',
      startPrice: 200,
      minIncrement: 10,
      startAt: new Date(Date.now() - 60 * 60 * 1000),
      endAt: new Date(Date.now() + 3 * 60 * 60 * 1000),
    },
  ];

  for (const auction of auctions) {
    await prisma.auction.create({
      data: {
        ...auction,
        status: 'ACTIVE',
        state: {
          create: {
            currentPrice: auction.startPrice,
            endsAt: auction.endAt,
          },
        },
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
