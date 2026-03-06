import { put, del } from '@vercel/blob';
import path from 'path';
import { writeFile, unlink, mkdir } from 'fs/promises';
import fs from 'fs';

// Helper to determine if we are running in a Vercel/Serverless environment
const isCloud = !!process.env.VERCEL_URL || !!process.env.BLOB_READ_WRITE_TOKEN;

/**
 * Uploads a file to the storage provider (Vercel Blob or Local).
 * @param file The file or buffer to upload
 * @param filename The desired filename
 * @param folder The folder inside uploads/
 */
export async function uploadFile(
    file: File | Buffer,
    filename: string,
    folder: string = ''
): Promise<string> {
    if (isCloud) {
        // Vercel Blob
        const blob = await put(path.join(folder, filename), file, {
            access: 'public',
        });
        return blob.url;
    } else {
        // Local Filesystem
        const uploadDir = path.join(process.cwd(), 'public/uploads', folder);
        if (!fs.existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, filename);
        let buffer: Buffer;

        if (file instanceof File) {
            buffer = Buffer.from(await file.arrayBuffer());
        } else {
            buffer = file;
        }

        await writeFile(filePath, buffer);
        return `/uploads/${folder ? folder + '/' : ''}${filename}`;
    }
}

/**
 * Deletes a file from storage
 */
export async function deleteFile(url: string) {
    if (isCloud && url.includes('public.blob.vercel-storage.com')) {
        await del(url);
    } else if (url.startsWith('/uploads/')) {
        const filePath = path.join(process.cwd(), 'public', url);
        if (fs.existsSync(filePath)) {
            await unlink(filePath);
        }
    }
}
