import type { Metadata } from "next";
import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { PatientForm } from "@/components/patients/patient-form";

export const metadata: Metadata = {
  title: "إضافة مريض",
};

export default async function NewPatientPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold">
          إضافة مريض جديد
        </h1>

        <p className="text-sm text-muted-foreground mt-1">
          أدخل بيانات المريض الأساسية.
        </p>
      </div>

      <PatientForm />

    </div>
  );
}

