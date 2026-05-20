import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Task from "@/models/Task";
import Project from "@/models/Project";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, description, status, priority, dueDate, projectId, assigneeId } = await req.json();

    if (!title || !projectId) {
      return NextResponse.json({ message: "Title and Project ID are required" }, { status: 400 });
    }

    await connectToDatabase();

    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    const member = project.members.find(
      (m) => m.user.toString() === session.user.id
    );

    if (!member || member.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden: Only admins can create tasks" }, { status: 403 });
    }

    const task = await Task.create({
      title,
      description,
      status: status || "TODO",
      priority: priority || "MEDIUM",
      dueDate: dueDate ? new Date(dueDate) : undefined,
      project: projectId,
      assignee: assigneeId || undefined,
    });

    const populatedTask = await Task.findById(task._id).populate({
      path: "assignee",
      model: User,
      select: "name email",
    }).lean();

    return NextResponse.json(populatedTask, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDatabase();

    const tasks = await Task.find({ assignee: session.user.id })
      .populate({
        path: "project",
        model: Project,
        select: "name",
      })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(tasks, { status: 200 });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
