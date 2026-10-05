// src/data/petRecords.js

export const petRecords = {
  Bella: {
    appointments: [
      {
        id: 1,
        type: "Consultation",
        date: "2026-09-29",
        time: "10:00",
        veterinarian: "Dr. Ahmad",
        reason: "General Checkup",
        status: "Confirmed",
      },
    ],

    vaccinations: [
      {
        id: 1,
        vaccine: "Rabies",
        dateGiven: "2026-05-10",
        nextDueDate: "2027-05-10",
        status: "Completed",
        notes: "Annual rabies vaccination",
      },
    ],

    medicalRecords: [
      {
        id: 1,
        date: "2026-09-25",
        veterinarian: "Dr. Ahmad",
        reason: "Skin allergy examination",
        diagnosis: "Mild allergic dermatitis",
        treatment: "Medication prescribed",
        notes: "Monitor symptoms and return if condition worsens.",
      },
    ],

    medications: [
      {
        id: 1,
        name: "Allergy Medication",
        dosage: "1 tablet",
        frequency: "Once daily",
        route: "Oral",
        startDate: "2026-09-25",
        endDate: "2026-10-02",
        status: "Active",
      },
    ],

    prescriptions: [
      {
        id: 1,
        date: "2026-09-25",
        veterinarian: "Dr. Ahmad",
        medication: "Allergy Medication",
        dosage: "1 tablet once daily",
        instructions: "Give after food.",
      },
    ],

    reminders: [
      {
        id: 1,
        type: "Vaccination",
        title: "Rabies Vaccination",
        date: "2027-05-10",
        status: "Upcoming",
      },
    ],

    billing: [
      {
        id: 1,
        invoiceNumber: "INV-001",
        date: "2026-09-29",
        status: "Paid",
        items: [
          {
            type: "Consultation",
            description: "General Checkup",
            quantity: 1,
            unitPrice: 50,
          },
          {
            type: "Medication",
            description: "Antibiotic",
            quantity: 1,
            unitPrice: 18,
          },
        ],
        total: 68,
        paid: 68,
        balance: 0,
      },
    ],
  },

  Luna: {
    appointments: [
      {
        id: 1,
        type: "Vaccination",
        date: "2026-09-29",
        time: "12:30",
        veterinarian: "Dr. Sarah",
        reason: "Vaccination",
        status: "Pending",
      },
    ],

    vaccinations: [
      {
        id: 1,
        vaccine: "FVRCP",
        dateGiven: "2025-10-15",
        nextDueDate: "2026-10-15",
        status: "Due",
        notes: "Next vaccination is due soon",
      },
    ],

    medicalRecords: [
      {
        id: 1,
        date: "2026-09-20",
        veterinarian: "Dr. Sarah",
        reason: "Routine checkup",
        diagnosis: "Healthy",
        treatment: "No treatment required",
        notes: "Routine checkups only.",
      },
    ],

    medications: [],

    prescriptions: [],

    reminders: [
      {
        id: 1,
        type: "Follow-up",
        title: "Routine Follow-up",
        date: "2027-03-20",
        status: "Upcoming",
      },
    ],

    billing: [
      {
        id: 1,
        invoiceNumber: "INV-002",
        date: "2026-09-28",
        status: "Partially Paid",
        items: [
          {
            type: "Procedure",
            description: "Vaccination",
            quantity: 1,
            unitPrice: 35,
          },
          {
            type: "Product",
            description: "Pet Supplement",
            quantity: 2,
            unitPrice: 12,
          },
        ],
        total: 59,
        paid: 30,
        balance: 29,
      },
    ],
  },
};


// Get all records for one pet
export const getPetRecords = (petName) => {
  if (!petName) {
    return {
      appointments: [],
      vaccinations: [],
      medicalRecords: [],
      medications: [],
      prescriptions: [],
      reminders: [],
      billing: [],
    };
  }

  return (
    petRecords[petName] || {
      appointments: [],
      vaccinations: [],
      medicalRecords: [],
      medications: [],
      prescriptions: [],
      reminders: [],
      billing: [],
    }
  );
};


// Calculate billing summary
export const getPetBillingSummary = (petName) => {
  const records = getPetRecords(petName);

  const total = records.billing.reduce(
    (sum, invoice) => sum + Number(invoice.total || 0),
    0
  );

  const paid = records.billing.reduce(
    (sum, invoice) => sum + Number(invoice.paid || 0),
    0
  );

  const balance = records.billing.reduce(
    (sum, invoice) => sum + Number(invoice.balance || 0),
    0
  );

  return {
    total,
    paid,
    balance,
  };
};


// Get next appointment
export const getNextAppointment = (petName) => {
  const records = getPetRecords(petName);

  if (!records.appointments.length) {
    return null;
  }

  const now = new Date();

  const upcomingAppointments = records.appointments
    .filter((appointment) => {
      if (!appointment.date) return false;

      const appointmentDate = new Date(
        `${appointment.date}T${appointment.time || "00:00"}`
      );

      return appointmentDate >= now;
    })
    .sort((a, b) => {
      const dateA = new Date(
        `${a.date}T${a.time || "00:00"}`
      );

      const dateB = new Date(
        `${b.date}T${b.time || "00:00"}`
      );

      return dateA - dateB;
    });

  return upcomingAppointments[0] || null;
};


// Get next vaccination due
export const getNextVaccinationDue = (petName) => {
  const records = getPetRecords(petName);

  if (!records.vaccinations.length) {
    return null;
  }

  const vaccinationsWithDueDate = records.vaccinations
    .filter((vaccination) => vaccination.nextDueDate)
    .sort(
      (a, b) =>
        new Date(a.nextDueDate) -
        new Date(b.nextDueDate)
    );

  return vaccinationsWithDueDate[0] || null;
};


// Build complete pet activity timeline
export const getPetTimeline = (petName) => {
  const records = getPetRecords(petName);

  const appointments = records.appointments.map((item) => ({
    ...item,
    timelineType: "appointment",
    timelineDate: item.date,
    timelineTitle: item.type || "Appointment",
  }));

  const vaccinations = records.vaccinations.map((item) => ({
    ...item,
    timelineType: "vaccination",
    timelineDate: item.dateGiven,
    timelineTitle: item.vaccine || "Vaccination",
  }));

  const medicalRecords = records.medicalRecords.map((item) => ({
    ...item,
    timelineType: "medical",
    timelineDate: item.date,
    timelineTitle: item.reason || "Medical Record",
  }));

  const medications = records.medications.map((item) => ({
    ...item,
    timelineType: "medication",
    timelineDate: item.startDate,
    timelineTitle: item.name || "Medication",
  }));

  const prescriptions = records.prescriptions.map((item) => ({
    ...item,
    timelineType: "prescription",
    timelineDate: item.date,
    timelineTitle: item.medication || "Prescription",
  }));

  const reminders = records.reminders.map((item) => ({
    ...item,
    timelineType: "reminder",
    timelineDate: item.date,
    timelineTitle: item.title || "Reminder",
  }));

  const billing = records.billing.map((item) => ({
    ...item,
    timelineType: "billing",
    timelineDate: item.date,
    timelineTitle: item.invoiceNumber || "Invoice",
  }));

  return [
    ...appointments,
    ...vaccinations,
    ...medicalRecords,
    ...medications,
    ...prescriptions,
    ...reminders,
    ...billing,
  ].sort((a, b) => {
    return (
      new Date(b.timelineDate || 0) -
      new Date(a.timelineDate || 0)
    );
  });
};