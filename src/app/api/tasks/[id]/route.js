import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Task from "@/models/Task";
import Project from "@/models/Project";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import mongoose from "mongoose";

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: "Invalid task ID" }, { status: 400 });
  }

  try {
    const { status, title, description, priority, assigneeId } = await req.json();
    await connectToDatabase();

    const task = await Task.findById(id);
    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    const project = await Project.findById(task.project);
    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    // Check if user is a member of the project
    const member = project.members.find(
      (m) => m.user.toString() === session.user.id
    );

    if (!member) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // If changing status only, any member can do it (or we restrict to assignee/admin)
    // For a collaborative team app, usually any member can move task statuses.
    // If updating other fields, maybe we just allow it for now.
    
    if (status) task.status = status;
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority) task.priority = priority;
    if (assigneeId !== undefined) {
      task.assignee = assigneeId === "unassigned" ? null : assigneeId;
    }

    await task.save();

    return NextResponse.json(task, { status: 200 });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
