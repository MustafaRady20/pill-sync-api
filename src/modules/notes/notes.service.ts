import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CreateNoteDto } from "./dto/create-note.dto";
import { Note, NoteDocument, NoteType } from "./schema/note.schema";

@Injectable()
export class NotesService {
  constructor(
    @InjectModel(Note.name)
    private readonly noteModel: Model<NoteDocument>,
  ) {}

  async create(dto: CreateNoteDto): Promise<NoteDocument> {
    const note = new this.noteModel({
      ...dto,
      patientId: new Types.ObjectId(dto.patientId),
    });
    return note.save();
  }

  async findAll(): Promise<NoteDocument[]> {
    return this.noteModel.find().populate("patientId", "name email").exec();
  }

  async findByPatient(patientId: string): Promise<NoteDocument[]> {
    return this.noteModel
      .find({ patientId: new Types.ObjectId(patientId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByPatientAndType(patientId: string, type: NoteType): Promise<NoteDocument[]> {
    return this.noteModel
      .find({ patientId: new Types.ObjectId(patientId), type })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<NoteDocument> {
    const note = await this.noteModel
      .findById(id)
      .populate("patientId", "name email")
      .exec();

    if (!note) throw new NotFoundException(`Note #${id} not found`);
    return note;
  }

  async update(id: string, dto: Partial<CreateNoteDto>): Promise<NoteDocument> {
    const updated = await this.noteModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();

    if (!updated) throw new NotFoundException(`Note #${id} not found`);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.noteModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException(`Note #${id} not found`);
  }
}