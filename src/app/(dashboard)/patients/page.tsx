import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { PatientsTable } from "@/components/patients/patients-table";

export const metadata: Metadata = {
  title: "المرضى",
};

export default async function PatientsPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const patients = await prisma.patient.findMany({
    where: {
      isArchived: false,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          isActive: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const data = patients.map((patient) => ({
    id: patient.id,
    patientCode: patient.patientCode,
    nationalId: patient.nationalId ?? "",
    name: patient.user.name,
    email: patient.user.email,
    gender: patient.gender,
    phone: patient.phone ?? "",
    city: patient.city ?? "",
    bloodType: patient.bloodType,
    isActive: patient.user.isActive,
    createdAt: patient.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            المرضى
          </h1>

          <p className="text-sm text-muted-foreground mt-1">
            إدارة بيانات المرضى
          </p>
        </div>
      </div>

      <PatientsTable patients={data} />
    </div>
  );
}
