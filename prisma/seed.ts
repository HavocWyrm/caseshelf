import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient()

const items = [
    {
        name: "Jurassic Park",
        type: "Movie",        
    },
    {
        name: "God of War (2018)",
        type: "Video Game",
    },
    {
        name: "Game of Thrones - Season 1",
        type: "TV Show",
    },
    {
        name: "K-Pop Demon Hunters",
        type: "Movie",
    },
    {
        name: "The Witcher 3: Wild Hunt",
        type: "Video Game",
    },
    {
        name: "Fairy Tail - Season 1",
        type: "TV Show",
    },
]

async function seedData() {
  console.log('Seeding...')

  for (const item of items) {
    const result = await prisma.collectionItem.create({
      data: item,
    })
    console.log(`Created item with id: ${result.id}`)
  }

  console.log('Finished seeding.')
}

seedData()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })