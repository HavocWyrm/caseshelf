import prisma from "../../lib/db";

export default async function Home() {
  const items = await prisma.collectionItem.findMany();
  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold">Welcome to CaseShelf</h1>
      <p className="text-lg mt-2 text-gray-500">Your physical media collection, beautifully organized.</p>
      <pre>{JSON.stringify(items, null, 2)}</pre>
    </main>
  );
}
