"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateUser(id: string, name: string, email: string, role: string) {
  try {
    await prisma.user.update({
      where: { id },
      data: { nama: name, email, role },
    });
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Gagal memperbarui data user" };
  }
}

export async function deleteUser(id: string) {
  try {
    // Check if the user is an owner, prevent deletion
    const user = await prisma.user.findUnique({ where: { id } });
    if (user?.role === "owner") {
      return { success: false, error: "Owner tidak dapat dihapus" };
    }
    
    await prisma.user.delete({
      where: { id },
    });
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Gagal menghapus user" };
  }
}
