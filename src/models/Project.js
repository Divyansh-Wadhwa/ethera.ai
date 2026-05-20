import mongoose from "mongoose";

const ProjectMemberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  role: { type: String, enum: ["ADMIN", "MEMBER"], default: "MEMBER" },
});

const ProjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ["ACTIVE", "COMPLETED"], default: "ACTIVE" },
    members: [ProjectMemberSchema],
  },
  { timestamps: true }
);

export default mongoose.models.Project || mongoose.model("Project", ProjectSchema);
