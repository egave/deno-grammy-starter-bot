import { StorageAdapter } from "grammyjs"
import { S3, S3Bucket } from "s3"
import { DEFAULTS } from '../config.ts'
  
const ACCESS_KEY = Deno.env.get("AWS_ACCESS_KEY");
const SECRET_KEY = Deno.env.get("AWS_SECRET_KEY");
const REGION = DEFAULTS.S3.REGION;
const KV_BACKUP_BUCKET_NAME = Deno.env.get("AWS_KV_BACKUP_BUCKET_NAME");
// console.debug(`AWS_ACCESS_KEY: ${ACCESS_KEY}`);
// console.debug(`AWS_SECRET_KEY: ${SECRET_KEY}`);
// console.debug(`BUCKET_NAME: ${BUCKET_NAME}`);

// Vérification des clés d'accès AWS
if (!ACCESS_KEY || !SECRET_KEY || !REGION || !KV_BACKUP_BUCKET_NAME) {
    throw new Error("Missing AWS credentials. Please set AWS_ACCESS_KEY, AWS_SECRET_KEY, AWS_REGION and AWS_KV_BACKUP_BUCKET_NAME environment variables.");
}

const ENDPOINT_URL = `https://s3.${REGION}.amazonaws.com`;

// Configuration du client S3
const s3 = new S3({
    accessKeyID: ACCESS_KEY, // Remplacez par votre clé d'accès AWS
    secretKey: SECRET_KEY, // Remplacez par votre clé secrète AWS
    region: DEFAULTS.S3.REGION, // Exemple : "eu-west-1"
    endpointURL: ENDPOINT_URL // URL du endpoint S3
});

// Récupération du bucket de sauvegarde KV
export const s3_backup_bucket: S3Bucket = s3.getBucket(KV_BACKUP_BUCKET_NAME);

// Adaptateur personnalisé S3 pour les conversations GrammyJS 
class S3Adapter<T> implements StorageAdapter<T> {
    private bucket!: S3Bucket;

    private constructor(bucket: S3Bucket) {
        this.bucket = bucket; // Private constructor for factory method
    }

    static async create<T>(bucketName: string): Promise<S3Adapter<T>> {
        const bucket = s3.getBucket(bucketName);
        if (!bucket) {
            throw new Error("s3.getBucket returned null or undefined");
        }
        try {
            const testContent = new TextEncoder().encode("1");
            await bucket.putObject("check.txt", testContent, { contentType: "text/plain" });
        } catch (error) {
            throw new Error(`Failed to write test file to bucket: ${error.message}`);
        }
        return new S3Adapter<T>(bucket);
    }

    async read(key: string): Promise<T | undefined> {
        try {
            const response = await this.bucket.getObject(key);
            if (!response || !response.body) {
                return undefined; // The key doesn't exist or the object is empty
            }

            const reader = response.body.getReader();
            const chunks = [];
            let done, value;
            while (!done) {
                ({ done, value } = await reader.read());
                if (value) {
                    chunks.push(value);
                }
            }
            const data = new TextDecoder().decode(new Uint8Array(chunks.flatMap(chunk => [...chunk])));
            return data ? JSON.parse(data) : undefined;
        } catch (error) {
            if (error.name === "NoSuchKey") {
                return undefined; // La clé n'existe pas
            }
            console.error("Error reading from S3:", error);
            throw error;
        }
    }

    async write(key: string, value: T): Promise<void> {
        const jsonString = JSON.stringify(value);
        const uint8Array = new TextEncoder().encode(jsonString);
        
        await this.bucket.putObject(
            key,
            uint8Array,
            { contentType: "application/json"}
        );
    }

    async delete(key: string): Promise<void> {
        await this.bucket.deleteObject(key);
    }
}

export { S3Adapter };