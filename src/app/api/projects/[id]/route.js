import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Project from "@/models/Project";
import Task from "@/models/Task";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import mongoose from "mongoose";

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: "Invalid project ID" }, { status: 400 });
  }

  try {
    await connectToDatabase();

    const project = await Project.findById(id).populate({
      path: "members.user",
      model: User,
      select: "name email",
    }).lean();

    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    const isMember = project.members.some(
      (m) => m.user._id.toString() === session.user.id || m.user.toString() === session.user.id
    );
    if (!isMember) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const tasks = await Task.find({ project: project._id })
      .populate({
        path: "assignee",
        model: User,
        select: "name email",
      })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ ...project, tasks });
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: "Invalid project ID" }, { status: 400 });
  }

  try {
    const { status, name, description } = await req.json();
    await connectToDatabase();

    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    const isAdmin = project.members.some(
      (m) => m.user.toString() === session.user.id && m.role === "ADMIN"
    );

    if (!isAdmin) {
      return NextResponse.json({ message: "Forbidden: Only admins can update the project" }, { status: 403 });
    }

    if (status) project.status = status;
    if (name) project.name = name;
    if (description !== undefined) project.description = description;

    await project.save();

    return NextResponse.json(project, { status: 200 });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
