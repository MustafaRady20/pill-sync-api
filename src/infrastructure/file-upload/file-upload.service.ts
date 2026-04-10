import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import { Readable } from "stream";

const SMALL_FILE_LIMIT   = 5 * 1024 * 1024;        
const PART_SIZE          = 10 * 1024 * 1024;        
const MAX_FILE_SIZE      = 500 * 1024 * 1024;       
const ALLOWED_MIME_TYPES = [
  "image/jpeg", "image/png", "image/webp", "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

@Injectable()
export class FileUploadService {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly region: string;

  constructor(private readonly config: ConfigService) {
    this.region = this.config.getOrThrow<string>("AWS_REGION");
    this.bucket = this.config.getOrThrow<string>("AWS_S3_BUCKET");

    this.s3 = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId    : this.config.getOrThrow<string>("AWS_ACCESS_KEY_ID"),
        secretAccessKey: this.config.getOrThrow<string>("AWS_SECRET_ACCESS_KEY"),
      },
    });
  }


  private validate(mimetype: string, size: number): void {
    if (!ALLOWED_MIME_TYPES.includes(mimetype))
      throw new BadRequestException(`File type "${mimetype}" is not allowed.`);

    if (size > MAX_FILE_SIZE)
      throw new BadRequestException(`File exceeds the 500 MB size limit.`);
  }

  private buildKey(folder: string, originalname: string): string {
    const ext = originalname.split(".").pop();
    return `${folder}/${uuidv4()}.${ext}`;
  }

  private buildUrl(key: string): string {
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }


  private async uploadSmall(
    buffer: Buffer,
    key: string,
    mimetype: string,
  ): Promise<void> {
    await this.s3.send(
      new PutObjectCommand({
        Bucket     : this.bucket,
        Key        : key,
        Body       : buffer,
        ContentType: mimetype,
      }),
    );
  }


  private async uploadMultipart(
    buffer: Buffer,
    key: string,
    mimetype: string,
  ): Promise<void> {
    const { UploadId } = await this.s3.send(
      new CreateMultipartUploadCommand({
        Bucket     : this.bucket,
        Key        : key,
        ContentType: mimetype,
      }),
    );

    const parts: { ETag: string; PartNumber: number }[] = [];

    try {
      let partNumber = 1;
      for (let offset = 0; offset < buffer.length; offset += PART_SIZE) {
        const chunk = buffer.subarray(offset, offset + PART_SIZE);

        const { ETag } = await this.s3.send(
          new UploadPartCommand({
            Bucket    : this.bucket,
            Key       : key,
            UploadId,
            PartNumber: partNumber,
            Body      : chunk,
          }),
        );

        parts.push({ ETag: ETag!, PartNumber: partNumber });
        partNumber++;
      }

      await this.s3.send(
        new CompleteMultipartUploadCommand({
          Bucket         : this.bucket,
          Key            : key,
          UploadId,
          MultipartUpload: { Parts: parts },
        }),
      );
    } catch (err) {
      await this.s3.send(
        new AbortMultipartUploadCommand({
          Bucket  : this.bucket,
          Key     : key,
          UploadId: UploadId!,
        }),
      );
      throw new InternalServerErrorException("Multipart upload failed and was aborted.");
    }
  }


  async uploadOne(
    file: Express.Multer.File,
    folder = "vital-signs",
  ): Promise<string> {
    this.validate(file.mimetype, file.size);

    const key = this.buildKey(folder, file.originalname);

    if (file.size <= SMALL_FILE_LIMIT) {
      await this.uploadSmall(file.buffer, key, file.mimetype);
    } else {
      await this.uploadMultipart(file.buffer, key, file.mimetype);
    }

    return this.buildUrl(key);
  }

  async uploadMany(
    files: Express.Multer.File[],
    folder = "vital-signs",
  ): Promise<string[]> {
    return Promise.all(files.map((f) => this.uploadOne(f, folder)));
  }

  async delete(fileUrl: string): Promise<void> {
    // Extract key from URL
    const key = fileUrl.split(".amazonaws.com/")[1];
    if (!key) throw new BadRequestException("Invalid file URL.");

    await this.s3.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }

  async getPresignedUploadUrl(
    filename: string,
    mimetype: string,
    folder = "vital-signs",
  ): Promise<{ uploadUrl: string; fileUrl: string }> {
    if (!ALLOWED_MIME_TYPES.includes(mimetype))
      throw new BadRequestException(`File type "${mimetype}" is not allowed.`);

    const key = this.buildKey(folder, filename);

    const uploadUrl = await getSignedUrl(
      this.s3,
      new PutObjectCommand({
        Bucket     : this.bucket,
        Key        : key,
        ContentType: mimetype,
      }),
      { expiresIn: 300 }, // 5 minutes
    );

    return { uploadUrl, fileUrl: this.buildUrl(key) };
  }
}