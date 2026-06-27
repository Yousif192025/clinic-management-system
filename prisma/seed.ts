import { PrismaClient, Role, Gender, BloodType, AppointmentStatus, InvoiceStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clean existing data
  await prisma.auditLog.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.invoiceItem.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.attachment.deleteMany()
  await prisma.prescription.deleteMany()
  await prisma.vitalSign.deleteMany()
  await prisma.medicalRecord.deleteMany()
  await prisma.appointment.deleteMany()
  await prisma.doctorSchedule.deleteMany()
  await prisma.doctor.deleteMany()
  await prisma.patient.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  const hashedPassword = await bcrypt.hash('Admin@123456', 12)

  // ==================== ADMIN ====================
  const adminUser = await prisma.user.create({
    data: {
      name: 'مدير النظام',
      email: 'admin@clinic.com',
      password: hashedPassword,
      role: Role.ADMIN,
      isActive: true,
    }
  })

  // ==================== DOCTORS ====================
  const doctorData = [
    { name: 'د. أحمد محمد الزهراني', email: 'dr.ahmed@clinic.com', specialization: 'طب باطني', license: 'SA-001234', fee: 200 },
    { name: 'د. فاطمة علي الشمري', email: 'dr.fatima@clinic.com', specialization: 'طب الأطفال', license: 'SA-005678', fee: 180 },
    { name: 'د. خالد عبدالله القحطاني', email: 'dr.khalid@clinic.com', specialization: 'جراحة عامة', license: 'SA-009012', fee: 300 },
    { name: 'د. نورة سعد العتيبي', email: 'dr.noura@clinic.com', specialization: 'أمراض جلدية', license: 'SA-003456', fee: 220 },
  ]

  const doctors = []
  for (let i = 0; i < doctorData.length; i++) {
    const d = doctorData[i]
    const user = await prisma.user.create({
      data: {
        name: d.name,
        email: d.email,
        password: hashedPassword,
        role: Role.DOCTOR,
        isActive: true,
      }
    })

    const doctor = await prisma.doctor.create({
      data: {
        userId: user.id,
        doctorCode: `DR-${String(i + 1).padStart(4, '0')}`,
        specialization: d.specialization,
        licenseNumber: d.license,
        consultationFee: d.fee,
        isActive: true,
      }
    })

    // Add schedule for each doctor
    const days = [0, 1, 2, 3, 4] // Sun-Thu
    for (const day of days) {
      await prisma.doctorSchedule.create({
        data: {
          doctorId: doctor.id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '17:00',
          slotDuration: 30,
          isActive: true,
        }
      })
    }

    doctors.push(doctor)
  }

  // ==================== STAFF ====================
  await prisma.user.create({
    data: { name: 'ريم الدوسري', email: 'nurse@clinic.com', password: hashedPassword, role: Role.NURSE, isActive: true }
  })
  await prisma.user.create({
    data: { name: 'سارة المطيري', email: 'reception@clinic.com', password: hashedPassword, role: Role.RECEPTIONIST, isActive: true }
  })

  // ==================== PATIENTS ====================
  const patientsData = [
    { name: 'محمد عبدالرحمن السالم', email: 'patient1@gmail.com', gender: Gender.MALE, dob: new Date('1985-03-15'), phone: '0501234567', blood: BloodType.O_POSITIVE },
    { name: 'هنوف خالد العمري', email: 'patient2@gmail.com', gender: Gender.FEMALE, dob: new Date('1992-07-22'), phone: '0507654321', blood: BloodType.A_POSITIVE },
    { name: 'عبدالله فهد النهدي', email: 'patient3@gmail.com', gender: Gender.MALE, dob: new Date('1978-11-10'), phone: '0509876543', blood: BloodType.B_NEGATIVE },
    { name: 'مريم سلطان الحربي', email: 'patient4@gmail.com', gender: Gender.FEMALE, dob: new Date('2001-05-08'), phone: '0503456789', blood: BloodType.AB_POSITIVE },
    { name: 'فيصل ناصر الغامدي', email: 'patient5@gmail.com', gender: Gender.MALE, dob: new Date('1965-09-30'), phone: '0506543210', blood: BloodType.A_NEGATIVE },
    { name: 'لطيفة عمر الزيد', email: 'patient6@gmail.com', gender: Gender.FEMALE, dob: new Date('1998-02-14'), phone: '0502345678', blood: BloodType.O_NEGATIVE },
  ]

  const patients = []
  for (let i = 0; i < patientsData.length; i++) {
    const p = patientsData[i]
    const user = await prisma.user.create({
      data: { name: p.name, email: p.email, password: hashedPassword, role: Role.PATIENT, isActive: true }
    })

    const patient = await prisma.patient.create({
      data: {
        userId: user.id,
        patientCode: `PT-${String(i + 1).padStart(4, '0')}`,
        nationalId: `10${String(i + 1).padStart(8, '0')}`,
        gender: p.gender,
        dateOfBirth: p.dob,
        phone: p.phone,
        bloodType: p.blood,
        city: 'الرياض',
        address: `حي النخيل، شارع ${i + 1}`,
      }
    })
    patients.push(patient)
  }

  // ==================== APPOINTMENTS ====================
  const now = new Date()
  const appointmentData = [
    { patientIdx: 0, doctorIdx: 0, daysOffset: 0, hour: 9, status: AppointmentStatus.CONFIRMED },
    { patientIdx: 1, doctorIdx: 1, daysOffset: 0, hour: 10, status: AppointmentStatus.SCHEDULED },
    { patientIdx: 2, doctorIdx: 2, daysOffset: 0, hour: 11, status: AppointmentStatus.COMPLETED },
    { patientIdx: 3, doctorIdx: 3, daysOffset: 1, hour: 9, status: AppointmentStatus.SCHEDULED },
    { patientIdx: 4, doctorIdx: 0, daysOffset: 1, hour: 14, status: AppointmentStatus.CONFIRMED },
    { patientIdx: 5, doctorIdx: 1, daysOffset: 2, hour: 10, status: AppointmentStatus.SCHEDULED },
    { patientIdx: 0, doctorIdx: 2, daysOffset: -3, hour: 9, status: AppointmentStatus.COMPLETED },
    { patientIdx: 1, doctorIdx: 3, daysOffset: -5, hour: 11, status: AppointmentStatus.COMPLETED },
    { patientIdx: 2, doctorIdx: 0, daysOffset: -7, hour: 10, status: AppointmentStatus.CANCELLED },
    { patientIdx: 3, doctorIdx: 1, daysOffset: 3, hour: 14, status: AppointmentStatus.SCHEDULED },
  ]

  const appointments: { id: string; scheduledAt: Date }[] = []
  for (let i = 0; i < appointmentData.length; i++) {
    const a = appointmentData[i]
    const date = new Date(now)
    date.setDate(date.getDate() + a.daysOffset)
    date.setHours(a.hour, 0, 0, 0)

    const appt = await prisma.appointment.create({
      data: {
        appointmentCode: `APT-${String(i + 1).padStart(6, '0')}`,
        patientId: patients[a.patientIdx].id,
        doctorId: doctors[a.doctorIdx].id,
        scheduledAt: date,
        status: a.status,
        reason: 'كشف طبي عام',
        type: 'CONSULTATION',
      }
    })
    appointments.push(appt)
  }

  // ==================== MEDICAL RECORDS ====================
  const completedAppts = appointments.filter(a => {
    const ad = appointmentData[appointments.indexOf(a)]
    return ad.status === AppointmentStatus.COMPLETED
  })

  for (let i = 0; i < completedAppts.length; i++) {
    const appt = completedAppts[i]
    const apptData = appointmentData[appointments.indexOf(appt)]

    const record = await prisma.medicalRecord.create({
      data: {
        recordCode: `MR-${String(i + 1).padStart(6, '0')}`,
        patientId: patients[apptData.patientIdx].id,
        doctorId: doctors[apptData.doctorIdx].id,
        appointmentId: appt.id,
        visitDate: appt.scheduledAt,
        chiefComplaint: 'صداع وإرهاق عام',
        symptoms: 'صداع متكرر، إرهاق، دوخة خفيفة',
        diagnosis: 'إجهاد عام وارتفاع طفيف في ضغط الدم',
        treatment: 'الراحة التامة، تقليل الإجهاد، نظام غذائي صحي',
        notes: 'المريض بحالة جيدة، يُنصح بالمتابعة بعد أسبوعين',
      }
    })

    await prisma.vitalSign.create({
      data: {
        medicalRecordId: record.id,
        temperature: 37.0 + (Math.random() * 0.6),
        bloodPressureSystolic: 120 + Math.floor(Math.random() * 20),
        bloodPressureDiastolic: 80 + Math.floor(Math.random() * 10),
        heartRate: 70 + Math.floor(Math.random() * 20),
        oxygenSaturation: 97 + Math.random() * 3,
        weight: 70 + Math.floor(Math.random() * 30),
        height: 165 + Math.floor(Math.random() * 20),
      }
    })

    await prisma.prescription.create({
      data: {
        medicalRecordId: record.id,
        medicationName: 'باراسيتامول',
        dosage: '500 ملغ',
        frequency: '3 مرات يومياً',
        duration: '5 أيام',
        instructions: 'بعد الأكل',
      }
    })
  }

  // ==================== INVOICES ====================
  for (let i = 0; i < 6; i++) {
    const patient = patients[i % patients.length]
    const status = i < 3 ? InvoiceStatus.PAID : i < 5 ? InvoiceStatus.PENDING : InvoiceStatus.PARTIAL
    const subtotal = 200 + (i * 50)
    const taxAmount = subtotal * 0.15
    const total = subtotal + taxAmount

    const invoice = await prisma.invoice.create({
      data: {
        invoiceCode: `INV-${String(i + 1).padStart(6, '0')}`,
        patientId: patient.id,
        status,
        subtotal,
        taxRate: 15,
        taxAmount,
        total,
        paidAmount: status === InvoiceStatus.PAID ? total : status === InvoiceStatus.PARTIAL ? total * 0.5 : 0,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      }
    })

    await prisma.invoiceItem.create({
      data: {
        invoiceId: invoice.id,
        description: 'رسوم الاستشارة الطبية',
        quantity: 1,
        unitPrice: subtotal * 0.7,
        total: subtotal * 0.7,
      }
    })
    await prisma.invoiceItem.create({
      data: {
        invoiceId: invoice.id,
        description: 'رسوم الفحوصات المخبرية',
        quantity: 1,
        unitPrice: subtotal * 0.3,
        total: subtotal * 0.3,
      }
    })

    if (status === InvoiceStatus.PAID || status === InvoiceStatus.PARTIAL) {
      await prisma.payment.create({
        data: {
          invoiceId: invoice.id,
          amount: status === InvoiceStatus.PAID ? total : total * 0.5,
          paymentMethod: 'CASH',
          paidAt: new Date(),
        }
      })
    }
  }

  console.log('✅ Database seeded successfully!')
  console.log('\n📋 Test Accounts:')
  console.log('   Admin:        admin@clinic.com / Admin@123456')
  console.log('   Doctor:       dr.ahmed@clinic.com / Admin@123456')
  console.log('   Nurse:        nurse@clinic.com / Admin@123456')
  console.log('   Receptionist: reception@clinic.com / Admin@123456')
  console.log('   Patient:      patient1@gmail.com / Admin@123456')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
