import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, HttpCode, HttpStatus,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags, ApiOperation, ApiResponse,
  ApiParam, ApiBody, ApiQuery,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { NotesService } from "./notes.service";
import { CreateNoteDto } from "./dto/create-note.dto";
import { NoteType } from "./schema/note.schema";
import { JwtAuthGuard } from "../auth/guards/jwt.auth.guard";

@ApiTags("Notes")
@ApiBearerAuth("accessToken")
@UseGuards(JwtAuthGuard)
@Controller("notes")
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new note" })
  @ApiBody({ type: CreateNoteDto })
  @ApiResponse({ status: 201, description: "Note created successfully." })
  @ApiResponse({ status: 400, description: "Invalid request body." })
  create(@Body() dto: CreateNoteDto) {
    return this.notesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: "Get all notes" })
  @ApiResponse({ status: 200, description: "List of all notes." })
  findAll() {
    return this.notesService.findAll();
  }

  @Get("patient/:patientId")
  @ApiOperation({ summary: "Get all notes for a patient, optionally filtered by type" })
  @ApiParam({ name: "patientId", description: "MongoDB ObjectId of the patient" })
  @ApiQuery({ name: "type", enum: NoteType, required: false, description: "Filter by note type" })
  @ApiResponse({ status: 200, description: "List of notes." })
  findByPatient(
    @Param("patientId") patientId: string,
    @Query("type") type?: NoteType,
  ) {
    if (type) return this.notesService.findByPatientAndType(patientId, type);
    return this.notesService.findByPatient(patientId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a note by ID" })
  @ApiParam({ name: "id", description: "MongoDB ObjectId of the note" })
  @ApiResponse({ status: 200, description: "Note found." })
  @ApiResponse({ status: 404, description: "Note not found." })
  findOne(@Param("id") id: string) {
    return this.notesService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a note by ID" })
  @ApiParam({ name: "id", description: "MongoDB ObjectId of the note" })
  @ApiBody({ type: CreateNoteDto })
  @ApiResponse({ status: 200, description: "Note updated successfully." })
  @ApiResponse({ status: 404, description: "Note not found." })
  update(@Param("id") id: string, @Body() dto: Partial<CreateNoteDto>) {
    return this.notesService.update(id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a note by ID" })
  @ApiParam({ name: "id", description: "MongoDB ObjectId of the note" })
  @ApiResponse({ status: 204, description: "Note deleted successfully." })
  @ApiResponse({ status: 404, description: "Note not found." })
  remove(@Param("id") id: string) {
    return this.notesService.remove(id);
  }
}