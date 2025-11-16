import { prisma } from '@/lib/prisma';

export default async function Home() {
  const platform = await prisma.platform.findFirst({})

  return (
    <main>
      <div>There is the platform {platform?.name}</div>
    </main>
  );
}
