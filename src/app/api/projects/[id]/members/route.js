import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Project from "@/models/Project";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { email, role = "MEMBER" } = await req.json();

  if (!email) {
    return NextResponse.json({ message: "Email is required" }, { status: 400 });
  }

  try {
    await connectToDatabase();

    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    // Check if requester is ADMIN
    const requester = project.members.find((m) => m.user.toString() === session.user.id);
    if (!requester || requester.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden: Only admins can add members" }, { status: 403 });
    }

    // Find user by email
    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return NextResponse.json({ message: "User not found with this email" }, { status: 404 });
    }

    // Check if already a member
    const isAlreadyMember = project.members.some((m) => m.user.toString() === userToAdd._id.toString());
    if (isAlreadyMember) {
      return NextResponse.json({ message: "User is already a member" }, { status: 400 });
    }

    project.members.push({ user: userToAdd._id, role });
    await project.save();

    return NextResponse.json({ message: "Member added successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error adding member:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const userIdToRemove = searchParams.get("userId");

  if (!userIdToRemove) {
    return NextResponse.json({ message: "User ID is required" }, { status: 400 });
  }

  try {
    await connectToDatabase();

    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    // Check if requester is ADMIN
    const requester = project.members.find((m) => m.user.toString() === session.user.id);
    if (!requester || requester.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden: Only admins can remove members" }, { status: 403 });
    }

    // Cannot remove yourself if you are the last admin (optional logic, but good practice)
    if (userIdToRemove === session.user.id) {
      const adminCount = project.members.filter((m) => m.role === "ADMIN").length;
      if (adminCount <= 1) {
        return NextResponse.json({ message: "Cannot remove the only admin" }, { status: 400 });
      }
    }

    project.members = project.members.filter((m) => m.user.toString() !== userIdToRemove);
    await project.save();

    return NextResponse.json({ message: "Member removed successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error removing member:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
