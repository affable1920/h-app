from datetime import time

# ---------------------------------------------------------------------------
# HOSPITALS / CLINICS  (Kashmir-centric, real-ish names)
# ---------------------------------------------------------------------------
CLINICS = [
    # Sopore
    "Madina Medicate",
    "Zaingeer Medicate",
    "Hi Life Medicate",
    "Get Well Soon Medicate",
    "Care & Cure Clinic",
    # Baramulla district
    "Ilaaj Medicate",
    "Damna Medicate",
    "Government Medical College Baramulla",
    "Bone & Joint Hospital Barzulla",
    # Srinagar
    "Shri Maharaja Hari Singh Hospital (SMHS)",
    "Lal Ded Hospital Srinagar",
    "Government JLNM Hospital Rainawari",
    "Chest Disease Hospital Dalgate",
    "SKIMS Soura",
    "Sher-i-Kashmir Institute of Medical Sciences",
    "Apollo Clinic Srinagar",
    "Shifa Medicare Hospital Srinagar",
    "Ibn Sina Hospital Srinagar",
    # Generic / fictional for variety
    "Central Medical Centre",
    "St. Mary's Healthcare",
    "Urban Clinic Complex",
    "Regional Medical Institute",
    "Sunrise Medical Center",
    "Elite Healthcare Hub",
    "Valley Care Hospital",
    "Kashmir Heart Institute",
    "Children's Wellness Centre",
    "Prime Diagnostics & Hospital",
]

# ---------------------------------------------------------------------------
# CLINIC LOCATIONS  (real Kashmir places with rough coords)
# ---------------------------------------------------------------------------
CLINIC_LOCATIONS = [
    {"name": "Main Chowk, Sopore, Baramulla, J&K 193201",
        "lat": 34.2988, "lng": 74.4683},
    {"name": "Boniyar Road, Sopore, Baramulla, J&K 193201",
        "lat": 34.3012, "lng": 74.4701},
    {"name": "Hospital Road, Sopore, Baramulla, J&K 193201",
        "lat": 34.2975, "lng": 74.4655},
    {"name": "Arampora, Sopore, Baramulla, J&K 193201",
        "lat": 34.3055, "lng": 74.4750},
    {"name": "Sherabad, Sopore, Baramulla, J&K 193201",
        "lat": 34.2940, "lng": 74.4610},
    {"name": "Delina, Baramulla, J&K 193103",
        "lat": 34.2700, "lng": 74.3600},
    {"name": "Kanthbagh, Baramulla, J&K 193101",
        "lat": 34.2095, "lng": 74.3629},
    {"name": "Court Road, Baramulla, J&K 193101",
        "lat": 34.2115, "lng": 74.3601},
    {"name": "Lal Chowk, Srinagar, J&K 190001",
        "lat": 34.0837, "lng": 74.7973},
    {"name": "Residency Road, Srinagar, J&K 190001",
        "lat": 34.0851, "lng": 74.8029},
    {"name": "Bemina, Srinagar, J&K 190018",
        "lat": 34.0712, "lng": 74.7521},
    {"name": "Soura, Srinagar, J&K 190011",
        "lat": 34.1102, "lng": 74.8021},
    {"name": "Rainawari, Srinagar, J&K 190003",
        "lat": 34.1012, "lng": 74.8165},
    {"name": "Barzulla, Srinagar, J&K 190005",
        "lat": 34.0931, "lng": 74.7712},
    {"name": "Dalgate, Srinagar, J&K 190001",
        "lat": 34.0762, "lng": 74.8201},
    {"name": "Nowpora, Kupwara, J&K 193224",
        "lat": 34.5218, "lng": 74.2654},
    {"name": "Handwara, Kupwara, J&K 193221",
        "lat": 34.3985, "lng": 74.2798},
    {"name": "Pattan, Baramulla, J&K 193121",
        "lat": 34.1652, "lng": 74.5201},
    {"name": "Uri, Baramulla, J&K 193123",
        "lat": 34.0841, "lng": 74.0512},
    {"name": "Magam, Budgam, J&K 193401",
        "lat": 34.0531, "lng": 74.6012},
]

# ---------------------------------------------------------------------------
# CREDENTIALS
# ---------------------------------------------------------------------------
CREDENTIALS = ["MD", "MBBS", "DO", "DPM", "DC", "MS",
               "DNB", "DM", "MCh", "MDS", "BDS", "BAMS", "BHMS"]

# ---------------------------------------------------------------------------
# SPECIALIZATIONS
# ---------------------------------------------------------------------------
SPECIALIZATIONS = [
    "Cardiology", "Neurology", "Orthopedics", "Dermatology", "Pediatrics",
    "Psychiatry", "Ophthalmology", "ENT", "General Medicine", "Gastroenterology",
    "Pulmonology", "Nephrology", "Endocrinology", "Oncology", "Urology",
    "Gynecology & Obstetrics", "Rheumatology", "Hematology", "Infectious Disease",
    "Emergency Medicine", "Anesthesiology", "Radiology", "Pathology",
    "General Surgery", "Plastic Surgery", "Neurosurgery", "Cardiothoracic Surgery",
    "Vascular Surgery", "Dentistry", "Physiotherapy", "Dietetics & Nutrition",
    "Ayurveda", "Homeopathy",
]

# ---------------------------------------------------------------------------
# CLINIC FACILITIES
# ---------------------------------------------------------------------------
FACILITIES = [
    # Imaging & Diagnostics
    "X-Ray",
    "Digital X-Ray",
    "MRI",
    "CT Scan",
    "Ultrasound",
    "3D/4D Ultrasound",
    "Mammography",
    "DEXA Scan (Bone Density)",
    "PET Scan",
    "Fluoroscopy",
    "Echocardiography (Echo)",
    "Doppler Study",
    # Lab
    "Pathology Lab",
    "Clinical Laboratory",
    "Blood Bank",
    "Microbiology Lab",
    "Genetic Testing",
    "Allergy Testing",
    "COVID-19 PCR Testing",
    # Cardiac
    "ECG / EKG",
    "Holter Monitoring",
    "Stress Test (TMT)",
    "Cardiac Catheterization Lab",
    "Pacemaker Implantation",
    # Surgical & Procedural
    "Operation Theatre (OT)",
    "Laparoscopic Surgery Suite",
    "Endoscopy",
    "Colonoscopy",
    "Bronchoscopy",
    "Cystoscopy",
    "Minor Surgical Room",
    "Day-Care Surgery",
    "Dialysis Unit",
    "Chemotherapy Unit",
    # Emergency & Critical Care
    "24x7 Emergency",
    "ICU",
    "NICU",
    "PICU",
    "Trauma Care",
    "Ambulance Service",
    "Ventilator Support",
    # Maternity & Child
    "Labour & Delivery Room",
    "NICU",
    "Antenatal Care",
    "Postnatal Care",
    "Vaccination Centre",
    "Newborn Screening",
    # Outpatient
    "Pharmacy",
    "24x7 Pharmacy",
    "Physiotherapy",
    "Occupational Therapy",
    "Speech Therapy",
    "Dietetics & Nutrition Counselling",
    "Dental Care",
    "Eye Care",
    "Hearing & Audiology",
    "Mental Health & Counselling",
    # Telemedicine & Digital
    "Online Consultation",
    "Telemedicine",
    "Electronic Health Records (EHR)",
    "Patient Portal",
    # Support
    "Insurance & TPA Desk",
    "Wheelchair Access",
    "Parking",
    "Cafeteria",
    "Waiting Lounge",
    "Prayer Room",
    "Interpreter Services",
]

# ---------------------------------------------------------------------------
# MEDICAL COLLEGES  (Indian + select abroad)
# ---------------------------------------------------------------------------
MEDICAL_COLLEGES = [
    # Kashmir / J&K
    "Government Medical College Srinagar",
    "Government Medical College Jammu",
    "Government Medical College Baramulla",
    "Government Medical College Anantnag",
    "SKIMS Medical College Bemina, Srinagar",
    "Sher-i-Kashmir Institute of Medical Sciences (SKIMS), Soura",
    "Acharya Shri Chander College of Medical Sciences (ASCOMS), Jammu",
    "SMVD Narayana Institute of Medical Sciences, Katra",
    # Top Indian Government
    "All India Institute of Medical Sciences (AIIMS) New Delhi",
    "AIIMS Jodhpur",
    "AIIMS Bhopal",
    "AIIMS Patna",
    "AIIMS Rishikesh",
    "Maulana Azad Medical College, New Delhi",
    "Lady Hardinge Medical College, New Delhi",
    "Seth GS Medical College & KEM Hospital, Mumbai",
    "Grant Medical College, Mumbai",
    "BJ Medical College, Ahmedabad",
    "Government Medical College Nagpur",
    "Madras Medical College, Chennai",
    "Stanley Medical College, Chennai",
    "Osmania Medical College, Hyderabad",
    "Bangalore Medical College & Research Institute",
    "Government Medical College Kozhikode",
    "Trivandrum Medical College",
    "Patna Medical College",
    "Calcutta National Medical College",
    "NRS Medical College, Kolkata",
    "King George's Medical University (KGMU), Lucknow",
    "Jawaharlal Nehru Medical College (JNMC), Aligarh",
    # Top Indian Private
    "Christian Medical College (CMC), Vellore",
    "Christian Medical College, Ludhiana",
    "Kasturba Medical College, Manipal",
    "Kasturba Medical College, Mangalore",
    "St. John's Medical College, Bangalore",
    "JSS Medical College, Mysore",
    "Amrita Institute of Medical Sciences, Kochi",
    "MS Ramaiah Medical College, Bangalore",
    "Jawaharlal Nehru Medical College, Belgaum",
    "Dr. DY Patil Medical College, Pune",
    "Saveetha Medical College, Chennai",
    "Sri Ramachandra Institute of Higher Education, Chennai",
    "Hamdard Institute of Medical Sciences (HIMSR), New Delhi",
    "Vardhman Mahavir Medical College & Safdarjung Hospital, New Delhi",
    # Pakistan / Bangladesh (common for Kashmiri doctors)
    "Dow University of Health Sciences, Karachi",
    "King Edward Medical University, Lahore",
    "Aga Khan University Medical College, Karachi",
    "Dhaka Medical College, Bangladesh",
    # Middle East
    "College of Medicine, King Saud University, Riyadh",
    "College of Medicine, King Abdulaziz University, Jeddah",
    "UAE University College of Medicine and Health Sciences, Al Ain",
    "Gulf Medical University, Ajman",
    # UK / Ireland
    "University of Edinburgh Medical School",
    "University of Glasgow Medical School",
    "Royal College of Surgeons in Ireland (RCSI), Dublin",
    "University College London (UCL) Medical School",
    "Imperial College London Faculty of Medicine",
    "University of Manchester Medical School",
    # Europe
    "Tbilisi State Medical University, Georgia",
    "David Tvildiani Medical University, Georgia",
    "Dnipro Medical Institute, Ukraine",
    "Kharkiv National Medical University, Ukraine",
    "University of Debrecen Medical School, Hungary",
    "Semmelweis University, Budapest, Hungary",
    "Charles University Faculty of Medicine, Prague",
    "Poznan University of Medical Sciences, Poland",
    # Russia / Kyrgyzstan  (popular for Indian students)
    "Kazan State Medical University, Russia",
    "Bashkir State Medical University, Russia",
    "Osh State University Medical Faculty, Kyrgyzstan",
    "Kyrgyz State Medical Academy, Bishkek",
    # USA / Canada
    "Harvard Medical School",
    "Johns Hopkins University School of Medicine",
    "Stanford University School of Medicine",
    "University of Toronto Faculty of Medicine",
    "McGill University Faculty of Medicine",
    # Australia
    "University of Melbourne Medical School",
    "University of Sydney Faculty of Medicine",
]

# ---------------------------------------------------------------------------
# DOCTOR LICENSE NUMBER FORMAT  (India — NMC style)
# Example: MCI-2019-DL-123456  or  NMC/JK/2021/04521
# ---------------------------------------------------------------------------
LICENSE_PREFIXES = [
    "NMC/JK",   # J&K doctors — Jammu & Kashmir Medical Council
    "NMC/DL",   # Delhi
    "NMC/MH",   # Maharashtra
    "NMC/KA",   # Karnataka
    "NMC/TN",   # Tamil Nadu
    "NMC/UP",   # Uttar Pradesh
    "NMC/WB",   # West Bengal
    "NMC/KL",   # Kerala
    "NMC/GJ",   # Gujarat
    "NMC/PB",   # Punjab
]
# Usage:  f"{random.choice(LICENSE_PREFIXES)}/{random.randint(2005,2023)}/{random.randint(10000,99999)}"
# e.g.  NMC/JK/2017/48231

# ---------------------------------------------------------------------------
# DAYS OF WEEK
# ---------------------------------------------------------------------------
DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday",
                "Thursday", "Friday", "Saturday", "Sunday"]

# ---------------------------------------------------------------------------
# CONSULTATION DURATION (minutes)
# ---------------------------------------------------------------------------
CONSULTATION_DURATION_OPTIONS = [10, 15, 20, 30, 45, 60]

# ---------------------------------------------------------------------------
# CONSULTATION FEE RANGE (INR)
# ---------------------------------------------------------------------------
CONSULTATION_FEE_RANGE = {"MIN": 100, "MAX": 1500}

# ---------------------------------------------------------------------------
# TIME SLOTS
# ---------------------------------------------------------------------------
TIME_SLOTS = [
    time(8, 0), time(8, 30),
    time(9, 0), time(9, 30),
    time(10, 0), time(10, 30),
    time(11, 0), time(11, 30),
    time(12, 0),
    time(14, 0), time(14, 30),
    time(15, 0), time(15, 30),
    time(16, 0), time(16, 30),
    time(17, 0), time(17, 30),
    time(18, 0), time(18, 30),
    time(19, 0), time(19, 30),
    time(20, 0), time(20, 30),
    time(21, 0), time(21, 30),
    time(22, 0), time(22, 30),
]

# ---------------------------------------------------------------------------
# DOCTOR STATUSES
# ---------------------------------------------------------------------------
STATUSES = ["away", "in_patient", "available", "on_leave", "on_break"]

# ---------------------------------------------------------------------------
# GENDERS
# ---------------------------------------------------------------------------
GENDERS = ["male", "female"]

# ---------------------------------------------------------------------------
# DOCTOR / PATIENT NAMES  (mix of Kashmiri, common Indian, neutral)
# ---------------------------------------------------------------------------
FIRST_NAMES_MALE = [
    "Aamir", "Adil", "Aijaz", "Altaf", "Arshad", "Asif", "Bashir", "Bilal",
    "Danish", "Faisal", "Farooq", "Hilal", "Imran", "Irfan", "Javid", "Kaiser",
    "Khalid", "Majid", "Mohsin", "Mudasir", "Muneer", "Muzaffar", "Nadeem",
    "Naseer", "Nisar", "Omar", "Owais", "Parvaiz", "Riyaz", "Sajad",
    "Shafeeq", "Shahid", "Showkat", "Suhail", "Tariq", "Umar", "Waseem", "Zahoor",
    # pan-Indian
    "Amit", "Arjun", "David", "James", "Michael", "Rahul", "Rajesh", "Rohan",
    "Sandeep", "Sanjay", "Suresh", "Vikram",
]

FIRST_NAMES_FEMALE = [
    "Aasiya", "Afshan", "Ambreen", "Asma", "Ayesha", "Fehmeeda", "Huma",
    "Insha", "Iqra", "Jasmine", "Kausar", "Mahira", "Mehnaz", "Muzdalifa",
    "Nargis", "Nazia", "Nida", "Parveena", "Rabia", "Rukhsana", "Saima",
    "Sana", "Shaheena", "Shazia", "Tahira", "Ulfat", "Uzma", "Yasmeena", "Zainab",
    # pan-Indian
    "Ananya", "Emily", "Jennifer", "Lisa", "Priya", "Ritu", "Sarah", "Sneha",
]

LAST_NAMES = [
    "Akhtar", "Andrabi", "Baba", "Bhat", "Dar", "Ganie", "Ganai", "Gojri",
    "Hakeem", "Khanday", "Khan", "Lone", "Magray", "Malik", "Mattoo",
    "Mir", "Mufti", "Najar", "Naikoo", "Pandith", "Parray", "Qadri",
    "Rather", "Shah", "Sheikh", "Sofi", "Tantray", "Wani", "Zargar",
    # pan-Indian
    "Brown", "Davis", "Garcia", "Johnson", "Jones", "Miller", "Smith", "Williams",
    "Kumar", "Sharma", "Singh", "Verma",
]

# ---------------------------------------------------------------------------
# BLOOD GROUPS  (useful for patient profiles)
# ---------------------------------------------------------------------------
BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

# ---------------------------------------------------------------------------
# APPOINTMENT STATUSES
# ---------------------------------------------------------------------------
APPOINTMENT_STATUSES = ["ACTIVE", "COMPLETED",
                        "CANCELLED", "NO_SHOW", "RESCHEDULED"]

# ---------------------------------------------------------------------------
# REVIEW COMMENT TEMPLATES  (fill in {spec} or {name} at seed time)
# ---------------------------------------------------------------------------
REVIEW_COMMENTS = [
    "Very thorough and professional. Highly recommended.",
    "Doctor listened patiently and explained everything clearly.",
    "Short waiting time and a clean facility.",
    "The doctor was kind and the staff was helpful.",
    "Got a second opinion here and it was spot on.",
    "Excellent diagnosis, recovery was smooth.",
    "A bit of a wait but the consultation was worth it.",
    "Very knowledgeable and experienced doctor.",
    "Friendly staff, easy to book an appointment.",
    "Best {spec} specialist in the region.",
    "The facility is well-equipped with modern equipment.",
    "Doctor gave ample time and didn't rush the consultation.",
    "Highly skilled, I felt at ease immediately.",
    "Good follow-up care provided after the procedure.",
    "Would definitely visit again.",
    "Somewhat expensive but quality service.",
    "Online consultation was smooth and convenient.",
    "The doctor was punctual and thorough.",
    "Satisfied with the treatment and outcome.",
    "Staff was courteous and the ambiance was calm.",
]

# ---------------------------------------------------------------------------
# CONSULTATION MODES
# ---------------------------------------------------------------------------
CONSULTATION_MODES = ["IN_PERSON", "ONLINE", "HOME_VISIT"]

# ---------------------------------------------------------------------------
# SECONDARY FOCUS AREAS  (subset of specializations for doctor profiles)
# ---------------------------------------------------------------------------
SECONDARY_FOCUS_AREAS = [
    "Hypertension Management",
    "Diabetology",
    "Thyroid Disorders",
    "Obesity & Metabolic Syndrome",
    "Sports Medicine",
    "Geriatric Care",
    "Palliative Care",
    "Travel Medicine",
    "Preventive Healthcare",
    "Pain Management",
    "Wound Care",
    "Nutrition & Lifestyle",
    "Adolescent Health",
    "Women's Health",
    "Men's Health",
    "Sleep Medicine",
    "Critical Care",
    "Allergy & Immunology",
    "Hair & Scalp Disorders",
    "Skin Aesthetics & Cosmetology",
    "Retina & Vitreous",
    "Glaucoma",
    "Cornea & External Eye Diseases",
    "Pediatric Cardiology",
    "Fetal Medicine",
    "Minimally Invasive Surgery",
    "Robotic Surgery",
    "Interventional Radiology",
    "Musculoskeletal Disorders",
    "Spine Care",
    "Joint Replacement",
]

# ---------------------------------------------------------------------------
# CLINIC WHATSAPP / PHONE PREFIXES  (J&K codes)
# ---------------------------------------------------------------------------
PHONE_PREFIXES = ["9419", "9797", "9906", "9858",
                  "7006", "8491", "9596", "9622", "6005", "7889"]
# Usage:  f"{random.choice(PHONE_PREFIXES)}{random.randint(100000, 999999)}"

# ---------------------------------------------------------------------------
# PINCODES  (J&K)
# ---------------------------------------------------------------------------
PINCODES = {
    "Sopore":     "193201",
    "Baramulla":  "193101",
    "Pattan":     "193121",
    "Handwara":   "193221",
    "Kupwara":    "193224",
    "Uri":        "193123",
    "Srinagar":   "190001",
    "Bemina":     "190018",
    "Soura":      "190011",
    "Rainawari":  "190003",
    "Barzulla":   "190005",
    "Dalgate":    "190001",
    "Budgam":     "191111",
    "Magam":      "193401",
    "Anantnag":   "192101",
    "Shopian":    "192303",
    "Pulwama":    "192301",
}
