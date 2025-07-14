import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('image');

        if (!file || !(file instanceof File)) {
            return new Response(
                JSON.stringify({ error: 'No file uploaded or invalid file' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const uploadDir = path.join(process.cwd(), 'public/uploads/cover-art');
        await fs.promises.mkdir(uploadDir, { recursive: true });

        const ext = path.extname(file.name);
        const uniqueName = `${randomUUID()}${ext}`;
        const filePath = path.join(uploadDir, uniqueName);

        const arrayBuffer = await file.arrayBuffer();
        await fs.promises.writeFile(filePath, Buffer.from(arrayBuffer));

        return new Response(
            JSON.stringify({
                url: `/uploads/cover-art/${uniqueName}`,
                filename: uniqueName,
                size: file.size,
                type: file.type,
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    } catch (error) {
        console.error('Upload error:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error during file upload' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}