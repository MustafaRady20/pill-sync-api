import {
  Controller, Post, Delete, Get,
  UploadedFile, UploadedFiles, UseInterceptors,
  Body, Query, HttpCode, HttpStatus,
} from "@nestjs/common";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import {
  ApiTags, ApiOperation, ApiResponse,
  ApiConsumes, ApiBody, ApiQuery,
} from "@nestjs/swagger";
import { memoryStorage } from "multer";
import { FileUploadService } from "./file-upload.service";

const multerOptions = {
  storage: memoryStorage(),
  limits: { fileSize: 500 * 1024 * 1024 }, 
};

@ApiTags("File Upload")
@Controller("files")
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}


  @Post("upload")
  @UseInterceptors(FileInterceptor("file", multerOptions))
  @ApiOperation({ summary: "Upload a single file to S3" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file  : { type: "string", format: "binary" },
        folder: { type: "string", example: "vital-signs" },
      },
    },
  })
  @ApiResponse({ status: 201, description: "File uploaded. Returns S3 URL." })
  @ApiResponse({ status: 400, description: "Invalid file type or size exceeded." })
  async uploadOne(
    @UploadedFile() file: Express.Multer.File,
    @Body("folder") folder?: string,
  ) {
    const url = await this.fileUploadService.uploadOne(file, folder);
    return { url };
  }


  @Post("upload/bulk")
  @UseInterceptors(FilesInterceptor("files", 10, multerOptions))
  @ApiOperation({ summary: "Upload up to 10 files to S3" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        files : { type: "array", items: { type: "string", format: "binary" } },
        folder: { type: "string", example: "vital-signs" },
      },
    },
  })
  @ApiResponse({ status: 201, description: "Files uploaded. Returns S3 URLs." })
  async uploadMany(
    @UploadedFiles() files: Express.Multer.File[],
    @Body("folder") folder?: string,
  ) {
    const urls = await this.fileUploadService.uploadMany(files, folder);
    return { urls };
  }


  @Get("presigned-url")
  @ApiOperation({ summary: "Get a presigned URL for direct S3 upload (for very large files)" })
  @ApiQuery({ name: "filename", example: "lab-result.pdf" })
  @ApiQuery({ name: "mimetype", example: "application/pdf" })
  @ApiQuery({ name: "folder",   example: "vital-signs", required: false })
  @ApiResponse({ status: 200, description: "Returns uploadUrl and final fileUrl." })
  async presignedUrl(
    @Query("filename") filename: string,
    @Query("mimetype") mimetype: string,
    @Query("folder")   folder?: string,
  ) {
    return this.fileUploadService.getPresignedUploadUrl(filename, mimetype, folder);
  }


  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a file from S3 by its URL" })
  @ApiBody({
    schema: {
      type: "object",
      properties: { fileUrl: { type: "string", example: "https://bucket.s3.region.amazonaws.com/vital-signs/uuid.pdf" } },
    },
  })
  @ApiResponse({ status: 204, description: "File deleted successfully." })
  @ApiResponse({ status: 400, description: "Invalid file URL." })
  async remove(@Body("fileUrl") fileUrl: string) {
    await this.fileUploadService.delete(fileUrl);
  }
}