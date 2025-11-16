import { PrismaClient, CollectionItemType, Status } from '../src/generated/prisma/'

const prisma = new PrismaClient()

const platforms = [
    { name: "PS1", logo: "ps1Logo.svg" },
    { name: "PS2", logo: "ps2Logo.svg" },
    { name: "PS3", logo: "ps3Logo.svg" },
    { name: "PS4", logo: "ps4Logo.svg" },
    { name: "PS5", logo: "ps5Logo.svg" },
    { name: "PSP", logo: "pspLogo.svg" },
    { name: "PS Vita", logo: "psvitaLogo.svg" },
    { name: "Xbox", logo: "xboxLogo.svg" },
    { name: "Xbox 360", logo: "xbox360Logo.svg" },
    { name: "Xbox One", logo: "xboxoneLogo.svg" },
    { name: "Xbox Series X|S", logo: "xboxseriesXLogo.svg" },
    { name: "Nintendo Entertainment System (NES)", logo: "nesLogo.svg" },
    { name: "Super Nintendo (SNES)", logo: "snesLogo.svg" },
    { name: "Nintendo 64", logo: "nintendo64Logo.svg" },
    { name: "GameCube", logo: "gamecubeLogo.svg" },
    { name: "Wii", logo: "wiiLogo.svg" },
    { name: "Wii U", logo: "wiiULogo.svg" },
    { name: "Nintendo Switch", logo: "switchLogo.svg" },
    { name: "Nintendo Switch 2", logo: "switch2Logo.svg" },
    { name: "Game Boy", logo: "gameboyLogo.svg" },
    { name: "Game Boy Color", logo: "gameboycolorLogo.svg" },
    { name: "Game Boy Advance", logo: "gbaLogo.svg" },
    { name: "Nintendo DS", logo: "dsLogo.svg" },
    { name: "Nintendo 3DS", logo: "3dsLogo.svg" },
    { name: "PC", logo: "pcLogo.svg" },
    { name: "Sega Saturn", logo: "segasaturnLogo.svg" },
    { name: "Sega Dreamcast", logo: "segadreamcastLogo.svg" },
    { name: "Atari 2600", logo: "atari2600Logo.svg" },
    { name: "Atari Jaguar", logo: "atarijaguarLogo.svg" },
    { name: "Atari Lynx", logo: "atariolynxLogo.svg" },
    { name: "Neo Geo", logo: "neogeoLogo.svg" },
    { name: "Sega Mega Drive", logo: "segamegadriveLogo.svg" },
];

const formats = [
    { name: "Blu-ray", logo: "blurayLogo.svg" },
    { name: "Blu-ray 3D", logo: "bluray3dLogo.svg" },
    { name: "UHD Blu-ray", logo: "uhdblurayLogo.svg" },
    { name: "DVD", logo: "dvdLogo.svg" },
    { name: "VHS", logo: "vhsLogo.svg" },
    { name: "Betamax", logo: "betamaxLogo.svg" },
    { name: "VCD", logo: "vcdLogo.svg" },
    { name: "HD DVD", logo: "hddvdLogo.svg" },
    { name: "Laserdisc", logo: "laserdisclogo.svg" },
];

const devItems = [
    {
        name: "Jurassic Park",
        status: Status.OWNED,
        type: CollectionItemType.MOVIE,
        genres: {
            connectOrCreate: [
                { where: { name: "Adventure" }, create: { name: "Adventure" } },
                { where: { name: "Sci-Fi" }, create: { name: "Sci-Fi" } },
            ],
        },
        description: "A thrilling adventure movie about dinosaurs.",
        releaseYear: 1993,
        franchise: {
            connectOrCreate: {
                where: { name: "Jurassic Park" },
                create: { name: "Jurassic Park" },
            },
        },
        movieDetails: {
            create: {
                director: "Steven Spielberg",
                writer: "Michael Crichton, David Koepp",
                runtimeMinutes: 127,
                format: {
                    connect: { name: "UHD Blu-ray" },
                },
            },
        },
    },
    {
        name: "God of War III",
        status: Status.OWNED,
        type: CollectionItemType.GAME,
        genres: {
            connectOrCreate: [
                { where: { name: "Action" }, create: { name: "Action" } },
                { where: { name: "Fantasy" }, create: { name: "Fantasy" } },
            ],
        },
        description:
            "A critically acclaimed action-adventure game set in Greek mythology.",
        releaseYear: 2010,
        franchise: {
            connectOrCreate: {
                where: { name: "God of War" },
                create: { name: "God of War" },
            },
        },
        gameDetails: {
            create: {
                platform: {
                    connect: { name: "PS3" },
                },
                developer: "Santa Monica Studio",
                publisher: "Sony Computer Entertainment",
            },
        },
    },
    {
        name: "Fatal Frame: Maiden of Blackwater",
        status: Status.OWNED,
        type: CollectionItemType.GAME,
        genres: {
            connectOrCreate: [
                { where: { name: "Horror" }, create: { name: "Horror" } },
                { where: { name: "Adventure" }, create: { name: "Adventure" } },
            ],
        },
        description:
            "Experience all of the horror from the original FATAL FRAME: Maiden of Black Water with new remastered visuals, new costumes and photo mode features.",
        releaseYear: 2021,
        franchise: {
            connectOrCreate: {
                where: { name: "Fatal Frame" },
                create: { name: "Fatal Frame" },
            },
        },
        notes: "Japanese edition",
        gameDetails: {
            create: {
                platformId: 18,
                developer: "Koei Tecmo",
                publisher: "Koei Tecmo",
            },
        },
    },
    {
        name: "Game of Thrones",
        status: Status.OWNED,
        type: CollectionItemType.SHOW,
        genres: {
            connectOrCreate: [
                { where: { name: "Drama" }, create: { name: "Drama" } },
                { where: { name: "Fantasy" }, create: { name: "Fantasy" } },
                { where: { name: "Action" }, create: { name: "Action" } },
            ],
        },
        description:
            "An epic fantasy drama series based on the novels by George R.R. Martin.",
        releaseYear: 2011,
        showDetails: {
            create: {
                seasonCount: 8,
                format: {
                    connect: { name: "Blu-ray" },
                },
            },
        },
    },
    {
        name: "2 Fast 2 Furious",
        status: Status.OWNED,
        type: CollectionItemType.MOVIE,
        genres: {
            connectOrCreate: [
                { where: { name: "Action" }, create: { name: "Action" } },
                { where: { name: "Crime" }, create: { name: "Crime" } },
            ],
        },
        description:
            "The second installment in the Fast & Furious franchise, featuring high-speed car chases and street racing.",
        releaseYear: 2003,
        franchise: {
            connectOrCreate: {
                where: { name: "Fast & Furious" },
                create: { name: "Fast & Furious" },
            },
        },
        movieDetails: {
            create: {
                director: "John Singleton",
                writer: "Michael Brandt, Derek Haas",
                runtimeMinutes: 107,
                format: {
                    connect: { name: "DVD" },
                },
            },
        },
    },
    {
        name: "The Witcher 3: Wild Hunt",
        status: Status.OWNED,
        type: CollectionItemType.GAME,
        genres: {
            connectOrCreate: [
                { where: { name: "RPG" }, create: { name: "RPG" } },
                { where: { name: "Fantasy" }, create: { name: "Fantasy" } },
            ],
        },
        description: "An open-world action RPG set in a rich fantasy universe.",
        releaseYear: 2015,
        franchise: {
            connectOrCreate: {
                where: { name: "The Witcher" },
                create: { name: "The Witcher" },
            },
        },
        gameDetails: {
            create: {
                platform: {
                    connect: { name: "PS4" },
                },
            },
        },
    },
    {
        name: "Fairy Tail",
        status: Status.OWNED,
        type: CollectionItemType.SHOW,
        genres: {
            connectOrCreate: [
                { where: { name: "Anime" }, create: { name: "Anime" } },
                { where: { name: "Fantasy" }, create: { name: "Fantasy" } },
                { where: { name: "Action" }, create: { name: "Action" } },
            ],
        },
        description:
            "An anime series about a guild of wizards and their adventures.",
        releaseYear: 2009,
        franchise: {
            connectOrCreate: {
                where: { name: "Fairy Tail" },
                create: { name: "Fairy Tail" },
            },
        },
        showDetails: {
            create: {
                seasonCount: 8,
                format: {
                    connect: { name: "Blu-ray" },
                },
            },
        },
    },
    {
        name: "Scrubs",
        status: Status.OWNED,
        type: CollectionItemType.SHOW,
        genres: {
            connectOrCreate: [
                { where: { name: "Comedy" }, create: { name: "Comedy" } },
                { where: { name: "Drama" }, create: { name: "Drama" } },
            ],
        },
        description:
            "A medical comedy-drama series that follows the lives of several employees working at Sacred Heart, a teaching hospital.",
        releaseYear: 2001,
        showDetails: {
            create: {
                seasonCount: 9,
                format: {
                    connect: { name: "DVD" },
                },
            },
        },
    },
    {
        name: "Inception",
        status: Status.OWNED,
        type: CollectionItemType.MOVIE,
        genres: {
            connectOrCreate: [
                { where: { name: "Sci-Fi" }, create: { name: "Sci-Fi" } },
                { where: { name: "Thriller" }, create: { name: "Thriller" } },
            ],
        },
        description: "A mind-bending thriller about dreams within dreams.",
        releaseYear: 2010,
        franchise: {
            connectOrCreate: {
                where: { name: "Inception" },
                create: { name: "Inception" },
            },
        },
        movieDetails: {
            create: {
                director: "Christopher Nolan",
                writer: "Christopher Nolan",
                runtimeMinutes: 148,
                format: {
                    connect: { name: "Blu-ray" },
                },
            },
        },
    },
    {
        name: "The Matrix",
        status: Status.WANTED,
        type: CollectionItemType.MOVIE,
        genres: {
            connectOrCreate: [
                { where: { name: "Sci-Fi" }, create: { name: "Sci-Fi" } },
                { where: { name: "Action" }, create: { name: "Action" } },
                { where: { name: "Thriller" }, create: { name: "Thriller" } },
            ],
        },
        description:
            "A hacker discovers the nature of reality and his role in a war against machines.",
        releaseYear: 1999,
        franchise: {
            connectOrCreate: {
                where: { name: "The Matrix" },
                create: { name: "The Matrix" },
            },
        },
        movieDetails: {
            create: {
                director: "The Wachowskis",
                writer: "The Wachowskis",
                runtimeMinutes: 136,
                format: {
                    connect: { name: "DVD" },
                },
            },
        },
    },
    {
        name: "The Lord of the Rings: The Fellowship of the Ring",
        status: Status.OWNED,
        type: CollectionItemType.MOVIE,
        genres: {
            connectOrCreate: [
                { where: { name: "Fantasy" }, create: { name: "Fantasy" } },
                { where: { name: "Adventure" }, create: { name: "Adventure" } },
            ],
        },
        description: "The first installment of the epic fantasy adventure trilogy.",
        releaseYear: 2001,
        franchise: {
            connectOrCreate: {
                where: { name: "The Lord of the Rings" },
                create: { name: "The Lord of the Rings" },
            },
        },
        movieDetails: {
            create: {
                director: "Peter Jackson",
                writer: "J.R.R. Tolkien, Fran Walsh, Philippa Boyens",
                runtimeMinutes: 178,
                format: {
                    connect: { name: "UHD Blu-ray" },
                },
            },
        },
    },
    {
        name: "The Matrix Reloaded",
        status: Status.OWNED,
        type: CollectionItemType.MOVIE,
        genres: {
            connectOrCreate: [
                { where: { name: "Sci-Fi" }, create: { name: "Sci-Fi" } },
                { where: { name: "Action" }, create: { name: "Action" } },
            ],
        },
        description:
            "The second installment of the Matrix trilogy, continuing the story of Neo and the fight against the machines.",
        releaseYear: 2003,
        franchise: {
            connectOrCreate: {
                where: { name: "The Matrix" },
                create: { name: "The Matrix" },
            },
        },
        movieDetails: {
            create: {
                director: "The Wachowskis",
                writer: "The Wachowskis",
                runtimeMinutes: 138,
                format: {
                    connect: { name: "Blu-ray" },
                },
            },
        },
    },
    {
        name: "Halo: Combat Evolved",
        status: Status.WANTED,
        type: CollectionItemType.GAME,
        genres: {
            connectOrCreate: [
                { where: { name: "Shooter" }, create: { name: "Shooter" } },
                { where: { name: "Sci-Fi" }, create: { name: "Sci-Fi" } },
                { where: { name: "Action" }, create: { name: "Action" } },
            ],
        },
        description: "The first game in the Halo series.",
        releaseYear: 2001,
        franchise: {
            connectOrCreate: {
                where: { name: "Halo" },
                create: { name: "Halo" },
            },
        },
        gameDetails: {
            create: {
                platform: {
                    connect: { name: "Xbox" },
                },
                developer: "Bungie",
                publisher: "Microsoft Game Studios",
            },
        },
    },
    {
        name: "Super Mario Odyssey",
        status: Status.OWNED,
        type: CollectionItemType.GAME,
        genres: {
            connectOrCreate: [
                { where: { name: "Platformer" }, create: { name: "Platformer" } },
                { where: { name: "Adventure" }, create: { name: "Adventure" } },
            ],
        },
        description: "Mario embarks on a globe-trotting adventure.",
        releaseYear: 2017,
        franchise: {
            connectOrCreate: {
                where: { name: "Super Mario" },
                create: { name: "Super Mario" },
            },
        },
        gameDetails: {
            create: {
                platform: {
                    connect: { name: "Nintendo Switch" },
                },
                developer: "Nintendo",
                publisher: "Nintendo",
            },
        },
    },
    {
        name: "The Legend of Zelda: Breath of the Wild",
        status: Status.OWNED,
        type: CollectionItemType.GAME,
        genres: {
            connectOrCreate: [
                { where: { name: "Adventure" }, create: { name: "Adventure" } },
                { where: { name: "RPG" }, create: { name: "RPG" } },
                { where: { name: "Fantasy" }, create: { name: "Fantasy" } },
            ],
        },
        description: "Open-world action-adventure game in the Zelda series.",
        releaseYear: 2017,
        franchise: {
            connectOrCreate: {
                where: { name: "The Legend of Zelda" },
                create: { name: "The Legend of Zelda" },
            },
        },
        gameDetails: {
            create: {
                platform: {
                    connect: { name: "Nintendo Switch" },
                },
                developer: "Nintendo",
                publisher: "Nintendo",
            },
        },
    },
    {
        name: "Red Dead Redemption 2",
        status: Status.WANTED,
        type: CollectionItemType.GAME,
        genres: {
            connectOrCreate: [
                { where: { name: "Western" }, create: { name: "Western" } },
                { where: { name: "Action" }, create: { name: "Action" } },
                { where: { name: "Adventure" }, create: { name: "Adventure" } },
            ],
        },
        description: "An epic Western-themed action-adventure game.",
        releaseYear: 2018,
        franchise: {
            connectOrCreate: {
                where: { name: "God of War" },
                create: { name: "God of War" },
            },
        },
        gameDetails: {
            create: {
                platform: {
                    connect: { name: "PS4" },
                },
                developer: "Rockstar Games",
                publisher: "Rockstar Games",
            },
        },
    },
    {
        name: "Breaking Bad",
        status: Status.OWNED,
        type: CollectionItemType.SHOW,
        genres: {
            connectOrCreate: [
                { where: { name: "Crime" }, create: { name: "Crime" } },
                { where: { name: "Drama" }, create: { name: "Drama" } },
                { where: { name: "Thriller" }, create: { name: "Thriller" } },
            ],
        },
        description: "A high school chemistry teacher turns to manufacturing meth.",
        releaseYear: 2008,
        showDetails: {
            create: {
                seasonCount: 5,
                format: {
                    connect: { name: "DVD" },
                },
            },
        },
    },
    {
        name: "Teen Titans",
        status: Status.OWNED,
        type: CollectionItemType.SHOW,
        genres: {
            connectOrCreate: [
                { where: { name: "Action" }, create: { name: "Action" } },
                { where: { name: "Animation" }, create: { name: "Animation" } },
                { where: { name: "Fantasy" }, create: { name: "Fantasy" } },
            ],
        },
        description: "A group of young superheroes team up to fight crime.",
        releaseYear: 2003,
        showDetails: {
            create: {
                seasonCount: 5,
                format: {
                    connect: { name: "DVD" },
                },
            },
        },
    },
    {
        name: "Westworld",
        status: Status.OWNED,
        type: CollectionItemType.SHOW,
        genres: {
            connectOrCreate: [
                { where: { name: "Sci-Fi" }, create: { name: "Sci-Fi" } },
                { where: { name: "Western" }, create: { name: "Western" } },
                { where: { name: "Drama" }, create: { name: "Drama" } },
            ],
        },
        description:
            "A sci-fi drama about androids in a Western-themed amusement park.",
        releaseYear: 2016,
        showDetails: {
            create: {
                seasonCount: 3,
                format: {
                    connect: { name: "UHD Blu-ray" },
                },
            },
        },
    },
    {
        name: "Friends",
        status: Status.OWNED,
        type: CollectionItemType.SHOW,
        genres: {
            connectOrCreate: [
                { where: { name: "Comedy" }, create: { name: "Comedy" } },
                { where: { name: "Romance" }, create: { name: "Romance" } },
            ],
        },
        description: "A sitcom about six friends living in New York City.",
        releaseYear: 1994,
        showDetails: {
            create: {
                seasonCount: 10,
                format: {
                    connect: { name: "DVD" },
                },
            },
        },
    },
];

async function seedData() {
    console.log("Seeding...");

    for (const platform of platforms) {
        const result = await prisma.platform.create({
            data: platform,
        });
        console.log(`Created platform: ${result.name}`);
    }
    for (const format of formats) {
        const result = await prisma.format.create({
            data: format,
        });
        console.log(`Created format: ${result.name}`);
    }

    console.log(process.env.APP_ENV)
    if (process.env.APP_ENV === 'development') {
        await seedDevData()
    }

    console.log("Finished seeding.");
}

async function seedDevData() {
    for (const item of devItems) {
        try {
            const result = await prisma.collectionItem.create({
                data: item,
            });
            console.log(`Created item: ${result.name}`);
        } catch (error) {
            console.error(`❌ Failed to create item: ${item.name}`);
            console.error(error);
        }
    }
}

seedData()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });