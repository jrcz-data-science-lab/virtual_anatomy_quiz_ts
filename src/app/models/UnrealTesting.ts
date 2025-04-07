import mongoose, { Schema, Document } from "mongoose";

export interface IUnrealTesting extends Document {
  // name: string;
  mesh_name: string;
  value?: string;
  createdAt?: Date;
}

const UnrealTestingSchema = new Schema<IUnrealTesting>({
  // name: { type: String, required: true },
  mesh_name: { type: String, required: true },
  value: { type: String, required: false },
  createdAt: { type: Date, required: false, default: Date.now },
});

export default mongoose.models.UnrealTesting ||
  mongoose.model<IUnrealTesting>("UnrealTesting", UnrealTestingSchema);
