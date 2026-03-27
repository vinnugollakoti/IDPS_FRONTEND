import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import type { ChangeEvent } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import type { IconType } from 'react-icons';
import {
  LuBookCopy,
  LuBookOpen,
  LuCircleDollarSign,
  LuDownload,
  LuCircleAlert,
  LuCircleCheck,
  LuCalendarRange,
  LuChevronRight,
  LuClock3,
  LuGauge,
  LuGraduationCap,
  LuLogOut,
  LuMenu,
  LuPencil,
  LuSearch,
  LuSettings,
  LuSlidersHorizontal,
  LuShieldCheck,
  LuUserRoundCheck,
  LuUsers,
  LuUpload,
  LuX,
} from 'react-icons/lu';
import logo from './assets/idps_logo.png';
import './App.css';

type Role = 'PRINCIPAL' | 'TEACHER' | 'PARENT' | 'RECEPTIONIST';

type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
  gender: 'MALE' | 'FEMALE';
  parent?: {
    id: number;
    name?: string | null;
    relation?: string | null;
    type?: 'MOTHER' | 'FATHER' | 'GUARDIAN' | null;
    phone1?: string | null;
    phone2?: string | null;
    adharnumber?: string | null;
    qualification?: string | null;
    village?: string | null;
    user?: {
      email?: string;
      gender?: 'MALE' | 'FEMALE';
    } | null;
  } | null;
  teacher?: {
    id: number;
    name?: string | null;
  } | null;
};

type ClassStudent = {
  id: number;
  name: string;
  admissionno?: string | null;
  classId?: number | null;
  gender?: 'MALE' | 'FEMALE' | null;
  dob?: string | null;
  adharnumber?: string | null;
  address?: string | null;
  pincode?: string | null;
  bloodgroup?: string | null;
  mothertongue?: string | null;
  socialcategory?: string | null;
  admissiondate?: string | null;
  height?: number | null;
  weight?: number | null;
  parents?: Array<{
    parent?: {
      id: number;
      name: string;
      relation?: string | null;
      type?: 'MOTHER' | 'FATHER' | 'GUARDIAN' | null;
      phone1?: string | null;
      phone2?: string | null;
      village?: string | null;
      qualification?: string | null;
      adharnumber?: string | null;
      user?: {
        email?: string;
        gender?: 'MALE' | 'FEMALE';
      } | null;
    } | null;
  }>;
};

type StudentDirectoryRow = ClassStudent & {
  className: string;
  section: string;
  teacherName: string | null;
};

type StudentMasterDetail = {
  id: number;
  name: string;
  photo?: string | null;
  admissionno?: string | null;
  gender?: 'MALE' | 'FEMALE';
  dob?: string | null;
  adharnumber?: string | null;
  pincode?: string | null;
  mothertongue?: string | null;
  socialcategory?: string | null;
  bloodgroup?: string | null;
  admissiondate?: string | null;
  height?: number | null;
  weight?: number | null;
  address?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  classId?: number | null;
  busId?: number | null;
  class?: {
    id: number;
    name: string;
    section: string;
    teacher?: {
      id: number;
      name: string;
      phone?: string | null;
      user?: {
        email?: string;
      } | null;
    } | null;
  } | null;
  bus?: {
    id: number;
    busNumber?: string | number | null;
    routeName?: string | null;
  } | null;
  feeDetails?: Array<{
    id: number;
    studentId?: number;
    type: 'TUITION' | 'BUS' | 'EXAM' | 'OTHER';
    total: number | string;
    academicYear: string;
    totalPaid?: number;
    remaining?: number;
    payments: FeePaymentOption[];
    createdAt?: string | null;
    updatedAt?: string | null;
  }>;
  marks?: Array<{
    id: number;
    examId: number;
    marks: number;
    exam?: {
      id: number;
      name: string;
      totalMarks?: number;
      subjectId?: number;
      classId?: number;
      examDate?: string;
      subject?: {
        id: number;
        name: string;
      } | null;
      class?: {
        id: number;
        name: string;
        section: string;
        teacher?: {
          id: number;
          name: string;
          phone?: string | null;
          user?: {
            email?: string;
          } | null;
        } | null;
      } | null;
    } | null;
    createdAt?: string | null;
    updatedAt?: string | null;
  }>;
  parents?: Array<{
    parent?: {
      id: number;
      name: string;
      relation?: string | null;
      type?: 'MOTHER' | 'FATHER' | 'GUARDIAN' | null;
      phone1?: string | null;
      phone2?: string | null;
      village?: string | null;
      qualification?: string | null;
      adharnumber?: string | null;
      createdAt?: string | null;
      updatedAt?: string | null;
      user?: {
        email?: string;
        gender?: 'MALE' | 'FEMALE';
      } | null;
    } | null;
  }>;
};

type StudentParentProfile = Exclude<NonNullable<StudentMasterDetail['parents']>[number]['parent'], null | undefined>;

type ParentStudentRow = {
  id: number;
  name: string;
  admissionno?: string | null;
  gender?: 'MALE' | 'FEMALE' | null;
  dob?: string | null;
  classId: number;
  className: string;
  section: string;
  teacherName: string | null;
  teacherEmail: string | null;
  totalFees: number;
  paidFees: number;
  remainingFees: number;
  feeCount: number;
  averageMarks: number;
  bestMarks: number;
  latestExamName: string | null;
  latestExamPercent: number;
  attendanceTotal: number;
  attendancePresent: number;
  attendanceAbsent: number;
  attendancePercent: number | null;
  guardianCount: number;
  primaryGuardianName: string | null;
};

type ParentDashboardTab = 'overview' | 'exams' | 'fees' | 'attendance';

type ParentExamRow = {
  id: number;
  examId: number;
  examName: string;
  subjectName: string;
  className: string;
  section: string;
  examDate: string | null;
  marks: number;
  totalMarks: number;
  percent: number;
  band: 'EXCELLENT' | 'GOOD' | 'NEEDS_ATTENTION';
};

type ParentFeeRow = {
  id: number;
  type: 'TUITION' | 'BUS' | 'EXAM' | 'OTHER';
  academicYear: string;
  total: number;
  paid: number;
  remaining: number;
  status: 'PAID' | 'PARTIAL' | 'PENDING';
  paymentCount: number;
  latestPaymentMethod: 'ONLINE' | 'CASH' | null;
  latestPaymentStatus: 'PENDING' | 'SUCCESS' | 'REJECTED' | null;
  createdAt: string | null;
  updatedAt: string | null;
};

type ParentAttendanceRow = {
  sessionId: number;
  date: string | null;
  className: string;
  section: string;
  status: 'PRESENT' | 'ABSENT';
  takenBy: string;
  monthKey: string;
};

type ClassSection = {
  id: number;
  name: string;
  section: string;
  students: ClassStudent[];
  teacherId?: number | null;
  teacher?: {
    id: number;
    name: string;
    phone?: string | null;
    user?: {
      email?: string;
    } | null;
  } | null;
  attendanceSessions?: Array<{
    id: number;
    date?: string;
    takenBy?: {
      id: number;
      name: string;
      phone?: string | null;
      user?: {
        email?: string;
      } | null;
    } | null;
    attendances?: Array<{
      id: number;
      studentId: number;
      status: 'PRESENT' | 'ABSENT';
    }>;
  }>;
};

type ParentOption = {
  id: number;
  name: string;
  relation?: string | null;
  type?: 'MOTHER' | 'FATHER' | 'GUARDIAN' | null;
  phone1?: string | null;
  phone2?: string | null;
  adharnumber?: string | null;
  village?: string | null;
  user?: {
    email?: string;
    gender?: 'MALE' | 'FEMALE';
  } | null;
};

type BusOption = {
  id: number;
  busNumber?: string | number | null;
  routeName?: string | null;
};

type TeacherOption = {
  id: number;
  name: string;
  phone?: string;
  gender?: 'MALE' | 'FEMALE';
  user?: {
    name?: string;
    email?: string;
  } | null;
};

type SubjectOption = {
  id: number;
  name: string;
  classsubject?: Array<{
    classId?: number;
    class?: {
      id: number;
      name: string;
      section: string;
    } | null;
  }>;
};

type ExamOption = {
  id: number;
  name: string;
  totalMarks?: number;
  examDate?: string;
  classId: number;
  subjectId: number;
  class?: {
    id: number;
    name: string;
    section: string;
  } | null;
  subject?: {
    id: number;
    name: string;
  } | null;
};

type MarkOption = {
  id: number;
  examId: number;
  studentId: number;
  marks: number;
  student?: {
    id: number;
    name: string;
  } | null;
  exam?: {
    id: number;
    name: string;
    totalMarks?: number;
    subjectId?: number;
    classId?: number;
    examDate?: string;
  } | null;
};

type FeePaymentOption = {
  id: number;
  feeId: number;
  amount: number | string;
  method: 'ONLINE' | 'CASH';
  status: 'PENDING' | 'SUCCESS' | 'REJECTED';
  screenshot?: string | null;
  verifiedBy?: {
    id: number;
    name: string;
    role: Role;
  } | null;
  createdAt: string;
  updatedAt: string;
};

type FeeOption = {
  id: number;
  studentId: number;
  type: 'TUITION' | 'BUS' | 'EXAM' | 'OTHER';
  total: number | string;
  academicYear: string;
  payments: FeePaymentOption[];
  student?: {
    id: number;
    name: string;
    classId?: number;
    class?: {
      id: number;
      name: string;
      section: string;
    } | null;
    parents?: Array<{
      parent?: {
        id: number;
        name: string;
        phone1?: string;
      } | null;
    }>;
  } | null;
  createdAt: string;
  updatedAt: string;
};

type LoginResponse = {
  message?: string;
  data?: {
    otp?: string;
    otpExpiry?: string;
  };
};

type VerifyResponse = {
  message?: string;
  token?: string;
  user?: User;
};

const API_BASE = 'http://localhost:3000';
const TOKEN_KEY = 'idps-token';
const USER_KEY = 'idps-user';
const PRINCIPAL_MENU_KEY = 'idps-principal-menu';

async function readJson<T>(response: Response): Promise<T | null> {
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return null;
  }

  return (await response.json()) as T;
}

function normalizeSearchValue(value: string | number | null | undefined): string {
  return String(value ?? '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function toCartesian(centerX: number, centerY: number, radius: number, angleDeg: number) {
  const angleInRadians = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArcPath(
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number,
): string {
  const start = toCartesian(centerX, centerY, radius, endAngle);
  const end = toCartesian(centerX, centerY, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${centerX} ${centerY} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
}

const INR_FORMATTER = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 0,
});

function formatInr(value: number): string {
  if (!Number.isFinite(value)) {
    return 'INR 0';
  }
  return `INR ${INR_FORMATTER.format(Math.max(Math.round(value), 0))}`;
}

function formatDisplayDate(value?: string | null): string {
  if (!value) {
    return 'N/A';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'N/A';
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatAgeFromDob(value?: string | null): string {
  if (!value) {
    return 'N/A';
  }
  const dob = new Date(value);
  if (Number.isNaN(dob.getTime())) {
    return 'N/A';
  }
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDelta = now.getMonth() - dob.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age >= 0 ? `${age} yrs` : 'N/A';
}

type StudentImportParentPreview = {
  name: string;
  phone: string;
  aadhar: string;
  qualification: string;
};

type StudentImportPreviewRow = {
  rowNumber: number;
  admissionno: string;
  name: string;
  gender: string;
  dob: string;
  adharnumber: string;
  pincode: string;
  mothertongue: string;
  socialcategory: string;
  bloodgroup: string;
  admissiondate: string;
  height: string;
  weight: string;
  address: string;
  parents: {
    father: StudentImportParentPreview;
    mother: StudentImportParentPreview;
  };
  errors: string[];
  valid: boolean;
};

type StudentImportRowPayload = {
  rowNumber: number;
  admissionno: string;
  name: string;
  gender: 'MALE' | 'FEMALE' | '';
  dob: string | null;
  adharnumber: string | null;
  pincode: string | null;
  mothertongue: 'TELUGU' | 'URGU' | 'ENGLISH' | null;
  socialcategory: 'OC' | 'BC_A' | 'BC_B' | 'BC_C' | 'BC_D' | 'BC_E' | 'MBC_DNC' | 'SC' | 'ST' | null;
  bloodgroup: 'A_POS' | 'A_NEG' | 'B_POS' | 'B_NEG' | 'AB_POS' | 'AB_NEG' | 'O_POS' | 'O_NEG' | null;
  admissiondate: string | null;
  height: number | null;
  weight: number | null;
  address: string | null;
  fatherName?: string | null;
  motherName?: string | null;
  mobileNumber?: string | null;
  fatherAadhar?: string | null;
  motherAadhar?: string | null;
  qualification?: string | null;
  parents: {
    father: {
      name: string;
      phone: string | null;
      aadhar: string | null;
      qualification: string | null;
      relation: 'Father';
    } | null;
    mother: {
      name: string;
      phone: string | null;
      aadhar: string | null;
      qualification: string | null;
      relation: 'Mother';
    } | null;
  };
  errors: string[];
};

const normalizeImportText = (value?: string | number | null) => {
  if (value === null || value === undefined) return '';
  return String(value).replace(/\s+/g, ' ').trim();
};

const normalizeImportDigits = (value?: string | number | null) => normalizeImportText(value).replace(/\D+/g, '');

const normalizeImportKey = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

const parseImportFlexibleDate = (value?: string | number | null) => {
  const text = normalizeImportText(value);
  if (!text) return null;

  const iso = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T].*)?$/);
  if (iso) {
    const date = new Date(Date.UTC(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3])));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const mdy = text.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (mdy) {
    const first = Number(mdy[1]);
    const second = Number(mdy[2]);
    let year = Number(mdy[3]);
    if (year < 100) year += year > 50 ? 1900 : 2000;
    let day = first;
    let month = second;
    if (first <= 12 && second > 12) {
      day = second;
      month = first;
    }
    const date = new Date(Date.UTC(year, month - 1, day));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const parseImportCsv = (text: string) => {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"') {
      if (quoted && next === '"') {
        cell += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (char === ',' && !quoted) {
      row.push(cell.trim());
      cell = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') {
        index += 1;
      }
      row.push(cell.trim());
      if (row.some((value) => value !== '')) {
        rows.push(row);
      }
      row = [];
      cell = '';
      continue;
    }

    cell += char;
  }

  if (cell.length || row.length) {
    row.push(cell.trim());
    if (row.some((value) => value !== '')) {
      rows.push(row);
    }
  }

  return rows;
};

const normalizeImportGender = (value?: string | number | null): 'MALE' | 'FEMALE' | '' => {
  const text = normalizeImportText(value).toUpperCase();
  if (['M', 'MALE', 'BOY'].includes(text)) return 'MALE';
  if (['F', 'FEMALE', 'GIRL'].includes(text)) return 'FEMALE';
  return '';
};

const normalizeImportMotherTongue = (value?: string | number | null) => {
  const text = normalizeImportText(value).toUpperCase().replace(/[^A-Z]/g, '');
  if (!text) return null;
  if (text === 'TELUGU') return 'TELUGU';
  if (text === 'URDU' || text === 'URGU') return 'URGU';
  if (text === 'ENGLISH') return 'ENGLISH';
  return null;
};

const normalizeImportSocialCategory = (value?: string | number | null) => {
  const text = normalizeImportText(value).toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!text) return null;
  if (text === 'OC' || text === 'GENERAL' || text === 'OPENCATEGORY') return 'OC';
  if (text === 'BCA') return 'BC_A';
  if (text === 'BCB') return 'BC_B';
  if (text === 'BCC') return 'BC_C';
  if (text === 'BCD') return 'BC_D';
  if (text === 'BCE') return 'BC_E';
  if (text === 'MBC' || text === 'MBCD' || text === 'MBCDNC') return 'MBC_DNC';
  if (text === 'SC' || text === 'SCHEDULEDCASTE') return 'SC';
  if (text === 'ST' || text === 'SCHEDULEDTRIBE') return 'ST';
  return null;
};

const normalizeImportBloodGroup = (value?: string | number | null) => {
  const text = normalizeImportText(value).toUpperCase().replace(/[^A-Z0-9+]/g, '');
  if (!text) return null;
  const map: Record<string, NonNullable<StudentImportRowPayload['bloodgroup']>> = {
    'A+': 'A_POS',
    'A+VE': 'A_POS',
    APOS: 'A_POS',
    'A-': 'A_NEG',
    'A-VE': 'A_NEG',
    ANEG: 'A_NEG',
    'B+': 'B_POS',
    'B+VE': 'B_POS',
    BPOS: 'B_POS',
    'B-': 'B_NEG',
    'B-VE': 'B_NEG',
    BNEG: 'B_NEG',
    'AB+': 'AB_POS',
    'AB+VE': 'AB_POS',
    ABPOS: 'AB_POS',
    'AB-': 'AB_NEG',
    'AB-VE': 'AB_NEG',
    ABNEG: 'AB_NEG',
    'O+': 'O_POS',
    'O+VE': 'O_POS',
    OPOS: 'O_POS',
    'O-': 'O_NEG',
    'O-VE': 'O_NEG',
    ONEG: 'O_NEG',
  };
  return map[text] ?? null;
};

const normalizeImportInteger = (value?: string | number | null) => {
  const match = normalizeImportText(value).match(/\d+(?:\.\d+)?/);
  if (!match) return null;
  const numberValue = Math.floor(Number(match[0]));
  return Number.isFinite(numberValue) ? numberValue : null;
};

const normalizeImportQualification = (value?: string | number | null) => {
  const text = normalizeImportText(value).toUpperCase().replace(/[\s.]/g, '');
  if (!text) return null;
  const map: Record<string, string> = {
    NOFORMALEDUCATION: 'NO_FORMAL_EDUCATION',
    PRIMARY: 'PRIMARY',
    MIDDLESCHOOL: 'MIDDLE_SCHOOL',
    SECONDARY: 'SECONDARY',
    HIGHERSECONDARY: 'HIGHER_SECONDARY',
    DIPLOMA: 'DIPLOMA',
    ITI: 'ITI',
    BSC: 'BSC',
    BCOM: 'BCOM',
    BA: 'BA',
    BTECH: 'BTECH',
    BE: 'BE',
    BBA: 'BBA',
    BCA: 'BCA',
    BDS: 'BDS',
    MBBS: 'MBBS',
    MSC: 'MSC',
    MCOM: 'MCOM',
    MA: 'MA',
    MTECH: 'MTECH',
    MBA: 'MBA',
    MCA: 'MCA',
    PHD: 'PHD',
    OTHER: 'OTHER',
  };
  return map[text] ?? 'OTHER';
};

const IMPORT_HEADER_ALIAS_MAP: Record<string, string> = {
  admissionno: 'admissionno',
  admissionnumber: 'admissionno',
  studentadmissionno: 'admissionno',
  studentadmissionnumber: 'admissionno',
  studentname: 'name',
  name: 'name',
  gender: 'gender',
  dob: 'dob',
  birthdate: 'dob',
  studentaadhaarnumber: 'adharnumber',
  studentaadharnumber: 'adharnumber',
  aadhaar: 'adharnumber',
  aadhar: 'adharnumber',
  address: 'address',
  pincode: 'pincode',
  mothertongue: 'mothertongue',
  socialcategory: 'socialcategory',
  bloodgroup: 'bloodgroup',
  admdate: 'admissiondate',
  admissiondate: 'admissiondate',
  studentsheight: 'height',
  studentheight: 'height',
  studentsweight: 'weight',
  studentweight: 'weight',
  fathername: 'fatherName',
  mothername: 'motherName',
  mobilenumber: 'mobileNumber',
  mobilenumber1: 'mobileNumber',
  fatheraadhar: 'fatherAadhar',
  motheraadhar: 'motherAadhar',
  qualification: 'qualification',
  parentqualification: 'qualification',
};

const buildParentImportKey = (
  parent: StudentImportPreviewRow['parents']['father'] | StudentImportPreviewRow['parents']['mother'],
  type: 'MOTHER' | 'FATHER',
) => {
  const aadhar = normalizeImportDigits(parent.aadhar);
  const phone = normalizeImportDigits(parent.phone);
  const name = normalizeImportText(parent.name).toLowerCase();
  if (aadhar) return `${type}:aadhar:${aadhar}`;
  if (phone) return `${type}:phone:${phone}`;
  if (name) return `${type}:name:${name}`;
  return `${type}:empty`;
};

function parseStudentImportPreview(text: string): StudentImportPreviewRow[] {
  const table = parseImportCsv(text);
  if (!table.length) {
    return [];
  }

  const [headerRow, ...dataRows] = table;
  const headerMap = headerRow.map((header) => IMPORT_HEADER_ALIAS_MAP[normalizeImportKey(header)] ?? null);

  return dataRows.map((values, index) => {
    const raw: Record<string, string> = {};
    headerMap.forEach((field, fieldIndex) => {
      if (!field) return;
      raw[field] = normalizeImportText(values[fieldIndex] ?? '');
    });

    const admissionno = raw.admissionno || `TEMP-${index + 1}`;
    const name = raw.name || '';
    const gender = normalizeImportGender(raw.gender);
    const dobDate = parseImportFlexibleDate(raw.dob);
    const admissionDate = parseImportFlexibleDate(raw.admissiondate);
    const height = normalizeImportInteger(raw.height);
    const weight = normalizeImportInteger(raw.weight);
    const motherName = normalizeImportText(raw.motherName);
    const fatherName = normalizeImportText(raw.fatherName);
    const mobileNumber = normalizeImportDigits(raw.mobileNumber);
    const fatherAadhar = normalizeImportDigits(raw.fatherAadhar);
    const motherAadhar = normalizeImportDigits(raw.motherAadhar);
    const qualification = normalizeImportQualification(raw.qualification) || '';

    const errors: string[] = [];
    if (!name) errors.push('Missing student name');
    if (!gender) errors.push('Missing or invalid gender');
    if (raw.dob && !dobDate) errors.push('Invalid DOB format');
    if (raw.admissiondate && !admissionDate) errors.push('Invalid admission date format');
    if (raw.height && height === null) errors.push('Invalid height value');
    if (raw.weight && weight === null) errors.push('Invalid weight value');
    if (raw.mothertongue && !normalizeImportMotherTongue(raw.mothertongue)) errors.push('Invalid mother tongue');
    if (raw.socialcategory && !normalizeImportSocialCategory(raw.socialcategory)) errors.push('Invalid social category');
    if (raw.bloodgroup && !normalizeImportBloodGroup(raw.bloodgroup)) errors.push('Invalid blood group');

    return {
      rowNumber: index + 2,
      admissionno,
      name,
      gender,
      dob: dobDate ? dobDate.toISOString().slice(0, 10) : '',
      adharnumber: normalizeImportDigits(raw.adharnumber),
      pincode: normalizeImportDigits(raw.pincode),
      mothertongue: normalizeImportMotherTongue(raw.mothertongue) ?? '',
      socialcategory: normalizeImportSocialCategory(raw.socialcategory) ?? '',
      bloodgroup: normalizeImportBloodGroup(raw.bloodgroup) ?? '',
      admissiondate: admissionDate ? admissionDate.toISOString().slice(0, 10) : '',
      height: height === null ? '' : String(height),
      weight: weight === null ? '' : String(weight),
      address: normalizeImportText(raw.address),
      parents: {
        father: {
          name: fatherName,
          phone: mobileNumber,
          aadhar: fatherAadhar,
          qualification,
        },
        mother: {
          name: motherName,
          phone: mobileNumber,
          aadhar: motherAadhar,
          qualification,
        },
      },
      errors,
      valid: errors.length === 0,
    };
  });
}

function toStudentImportPayload(row: StudentImportPreviewRow): StudentImportRowPayload {
  return {
    rowNumber: row.rowNumber,
    admissionno: row.admissionno,
    name: row.name,
    gender: row.gender as 'MALE' | 'FEMALE' | '',
    dob: row.dob || null,
    adharnumber: row.adharnumber || null,
    pincode: row.pincode || null,
    mothertongue: (row.mothertongue || null) as StudentImportRowPayload['mothertongue'],
    socialcategory: (row.socialcategory || null) as StudentImportRowPayload['socialcategory'],
    bloodgroup: (row.bloodgroup || null) as StudentImportRowPayload['bloodgroup'],
    admissiondate: row.admissiondate || null,
    height: row.height ? Number(row.height) : null,
    weight: row.weight ? Number(row.weight) : null,
    address: row.address || null,
    fatherName: row.parents.father.name || null,
    motherName: row.parents.mother.name || null,
    mobileNumber: row.parents.father.phone || row.parents.mother.phone || null,
    fatherAadhar: row.parents.father.aadhar || null,
    motherAadhar: row.parents.mother.aadhar || null,
    qualification: row.parents.father.qualification || row.parents.mother.qualification || null,
    parents: {
      father: row.parents.father.name || row.parents.father.phone || row.parents.father.aadhar
        ? {
            name: row.parents.father.name || '',
            phone: row.parents.father.phone || null,
            aadhar: row.parents.father.aadhar || null,
            qualification: row.parents.father.qualification || null,
            relation: 'Father',
          }
        : null,
      mother: row.parents.mother.name || row.parents.mother.phone || row.parents.mother.aadhar
        ? {
            name: row.parents.mother.name || '',
            phone: row.parents.mother.phone || null,
            aadhar: row.parents.mother.aadhar || null,
            qualification: row.parents.mother.qualification || null,
            relation: 'Mother',
          }
        : null,
    },
    errors: row.errors,
  };
}

function buildImportErrorReport(rows: Array<{ rowNumber: number; admissionno?: string | null; name?: string | null; errors: string[] }>) {
  const header = ['Row', 'Admission No', 'Student', 'Errors'];
  const csv = [
    header.join(','),
    ...rows.map((row) =>
      [row.rowNumber, row.admissionno, row.name, row.errors.join(' | ')].map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','),
    ),
  ].join('\n');
  return csv;
}

function Dashboard({ user, token, onLogout }: { user: User; token: string; onLogout: () => void }) {
  const [activePrincipalMenu, setActivePrincipalMenu] = useState(() => localStorage.getItem(PRINCIPAL_MENU_KEY) || 'Dashboard');
  const [classes, setClasses] = useState<ClassSection[]>([]);
  const [studentModuleLoading, setStudentModuleLoading] = useState(false);
  const [studentProfileLoading, setStudentProfileLoading] = useState(false);
  const [studentAction, setStudentAction] = useState<'list' | 'view' | 'edit'>('list');
  const [showCreateStudentModal, setShowCreateStudentModal] = useState(false);
  const [showQuickParentModal, setShowQuickParentModal] = useState(false);
  const [studentParentSearch, setStudentParentSearch] = useState('');
  const [studentDirectorySearch, setStudentDirectorySearch] = useState('');
  const [selectedStudentClassId, setSelectedStudentClassId] = useState<number | null>(null);
  const [activeStudentId, setActiveStudentId] = useState<number | null>(null);
  const [studentProfiles, setStudentProfiles] = useState<Record<number, StudentMasterDetail>>({});
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);
  const [parents, setParents] = useState<ParentOption[]>([]);
  const [buses, setBuses] = useState<BusOption[]>([]);
  const [createStudentLoading, setCreateStudentLoading] = useState(false);
  const [updateStudentLoading, setUpdateStudentLoading] = useState(false);
  const [quickParentLoading, setQuickParentLoading] = useState(false);
  const [classModuleLoading, setClassModuleLoading] = useState(false);
  const [showCreateClassForm, setShowCreateClassForm] = useState(false);
  const [editingClassId, setEditingClassId] = useState<number | null>(null);
  const [classSearch, setClassSearch] = useState('');
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [teacherModuleLoading, setTeacherModuleLoading] = useState(false);
  const [showCreateTeacherForm, setShowCreateTeacherForm] = useState(false);
  const [editingTeacherId, setEditingTeacherId] = useState<number | null>(null);
  const [teacherSearch, setTeacherSearch] = useState('');
  const [createTeacherLoading, setCreateTeacherLoading] = useState(false);
  const [updateTeacherLoading, setUpdateTeacherLoading] = useState(false);
  const [parentDashboardLoading, setParentDashboardLoading] = useState(false);
  const [parentDetailLoading, setParentDetailLoading] = useState(false);
  const [parentStudentSearch, setParentStudentSearch] = useState('');
  const [activeParentStudentId, setActiveParentStudentId] = useState<number | null>(null);
  const [parentDashboardTab, setParentDashboardTab] = useState<ParentDashboardTab>('overview');
  const [parentMobileMenuOpen, setParentMobileMenuOpen] = useState(false);
  const [parentExamSearch, setParentExamSearch] = useState('');
  const [parentExamSubjectFilter, setParentExamSubjectFilter] = useState('ALL');
  const [parentExamBandFilter, setParentExamBandFilter] = useState<'ALL' | 'EXCELLENT' | 'GOOD' | 'NEEDS_ATTENTION'>('ALL');
  const [parentExamSort, setParentExamSort] = useState<'recent' | 'highest' | 'lowest'>('recent');
  const [parentFeeSearch, setParentFeeSearch] = useState('');
  const [parentFeeTypeFilter, setParentFeeTypeFilter] = useState<'ALL' | 'TUITION' | 'BUS' | 'EXAM' | 'OTHER'>('ALL');
  const [parentFeeStatusFilter, setParentFeeStatusFilter] = useState<'ALL' | 'PAID' | 'PARTIAL' | 'PENDING'>('ALL');
  const [parentFeeYearFilter, setParentFeeYearFilter] = useState('ALL');
  const [parentFeeSort, setParentFeeSort] = useState<'recent' | 'remaining' | 'paid'>('recent');
  const [parentAttendanceSearch, setParentAttendanceSearch] = useState('');
  const [parentAttendanceStatusFilter, setParentAttendanceStatusFilter] = useState<'ALL' | 'PRESENT' | 'ABSENT'>('ALL');
  const [parentAttendanceMonthFilter, setParentAttendanceMonthFilter] = useState('ALL');
  const [parentAttendanceSort, setParentAttendanceSort] = useState<'recent' | 'oldest'>('recent');
  const [examModuleLoading, setExamModuleLoading] = useState(false);
  const [subjectModuleLoading, setSubjectModuleLoading] = useState(false);
  const [subjectSearch, setSubjectSearch] = useState('');
  const [subjectClassSearch, setSubjectClassSearch] = useState('');
  const [editSubjectClassSearch, setEditSubjectClassSearch] = useState('');
  const [showCreateSubjectModal, setShowCreateSubjectModal] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState<number | null>(null);
  const [createSubjectLoading, setCreateSubjectLoading] = useState(false);
  const [updateSubjectLoading, setUpdateSubjectLoading] = useState(false);
  const [createSubjectErrors, setCreateSubjectErrors] = useState<Record<string, string>>({});
  const [editSubjectErrors, setEditSubjectErrors] = useState<Record<string, string>>({});
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [exams, setExams] = useState<ExamOption[]>([]);
  const [selectedExamClassId, setSelectedExamClassId] = useState<number | null>(null);
  const [showCreateExamModal, setShowCreateExamModal] = useState(false);
  const [editingExamId, setEditingExamId] = useState<number | null>(null);
  const [createExamLoading, setCreateExamLoading] = useState(false);
  const [updateExamLoading, setUpdateExamLoading] = useState(false);
  const [createExamErrors, setCreateExamErrors] = useState<Record<string, string>>({});
  const [editExamErrors, setEditExamErrors] = useState<Record<string, string>>({});
  const [createExamClassSearch, setCreateExamClassSearch] = useState('');
  const [marksModuleLoading, setMarksModuleLoading] = useState(false);
  const [marksSaving, setMarksSaving] = useState(false);
  const [marksMode, setMarksMode] = useState<'manage' | 'view'>('view');
  const [marksRecords, setMarksRecords] = useState<MarkOption[]>([]);
  const [selectedMarksClassId, setSelectedMarksClassId] = useState<number | null>(null);
  const [selectedMarksSubjectId, setSelectedMarksSubjectId] = useState<number | null>(null);
  const [selectedMarksExamId, setSelectedMarksExamId] = useState<number | null>(null);
  const [marksDraft, setMarksDraft] = useState<Record<number, string>>({});
  const [marksErrors, setMarksErrors] = useState<Record<number, string>>({});
  const [feeModuleLoading, setFeeModuleLoading] = useState(false);
  const [assignFeeLoading, setAssignFeeLoading] = useState(false);
  const [recordPaymentLoading, setRecordPaymentLoading] = useState(false);
  const [fees, setFees] = useState<FeeOption[]>([]);
  const [feePage, setFeePage] = useState<'overview' | 'manage' | 'transactions' | 'student-details'>('overview');
  const [feeStudentDetailId, setFeeStudentDetailId] = useState<number | null>(null);
  const [feeStudentSearch, setFeeStudentSearch] = useState('');
  const [manageStudentSearch, setManageStudentSearch] = useState('');
  const [manageStudentClassId, setManageStudentClassId] = useState<number | null>(null);
  const [manageStudentSection, setManageStudentSection] = useState('');
  const [manageStudentStatus, setManageStudentStatus] = useState<'ALL' | 'PAID' | 'PARTIAL' | 'PENDING' | 'OVERDUE'>('ALL');
  const [manageStudentType, setManageStudentType] = useState<'ALL' | 'TUITION' | 'BUS' | 'EXAM' | 'OTHER'>('ALL');
  const [showAssignFeeModal, setShowAssignFeeModal] = useState(false);
  const [showRecordPaymentModal, setShowRecordPaymentModal] = useState(false);
  const [showEditFeeModal, setShowEditFeeModal] = useState(false);
  const [showEditPaymentModal, setShowEditPaymentModal] = useState(false);
  const [showManageStudentDetailsModal, setShowManageStudentDetailsModal] = useState(false);
  const [showStudentInsightsModal, setShowStudentInsightsModal] = useState(false);
  const [studentImportFileName, setStudentImportFileName] = useState('');
  const [studentImportClassId, setStudentImportClassId] = useState('');
  const [studentImportRows, setStudentImportRows] = useState<StudentImportPreviewRow[]>([]);
  const [studentImportParsing, setStudentImportParsing] = useState(false);
  const [studentImportImporting, setStudentImportImporting] = useState(false);
  const [showStudentImportConfirm, setShowStudentImportConfirm] = useState(false);
  const [studentImportEditIndex, setStudentImportEditIndex] = useState<number | null>(null);
  const [studentImportEditForm, setStudentImportEditForm] = useState<StudentImportPreviewRow | null>(null);
  const [studentImportResult, setStudentImportResult] = useState<{
    classId?: number;
    className?: string;
    createdStudents: number;
    createdParents: number;
    createdMothers: number;
    createdFathers: number;
    linkedParents: number;
    linkedRelations: number;
    reusedParents: number;
    skippedRows: number;
    failedRows: Array<{ rowNumber: number; admissionno?: string | null; name?: string | null; step?: string; errors: string[] }>;
    stepTrace?: Array<{ rowNumber: number; admissionno?: string | null; name?: string | null; step?: string; message: string }>;
  } | null>(null);
  const [selectedFeeForPayment, setSelectedFeeForPayment] = useState<FeeOption | null>(null);
  const [overviewTooltip, setOverviewTooltip] = useState<{
    x: number;
    y: number;
    title: string;
    lines: string[];
  } | null>(null);
  const deferredManageStudentSearch = useDeferredValue(manageStudentSearch);
  const [assignFeeForm, setAssignFeeForm] = useState({
    targetMode: 'class' as 'class' | 'students',
    classId: '',
    studentIds: [] as number[],
    type: 'TUITION' as 'TUITION' | 'BUS' | 'EXAM' | 'OTHER',
    total: '',
    academicYear: '',
  });
  const [paymentForm, setPaymentForm] = useState({
    feeId: '',
    amount: '',
    method: 'ONLINE' as 'ONLINE' | 'CASH',
    status: 'SUCCESS' as 'PENDING' | 'SUCCESS' | 'REJECTED',
  });
  const [editFeeForm, setEditFeeForm] = useState({
    id: '',
    type: 'TUITION' as 'TUITION' | 'BUS' | 'EXAM' | 'OTHER',
    total: '',
    academicYear: '',
  });
  const [editPaymentForm, setEditPaymentForm] = useState({
    id: '',
    feeId: '',
    amount: '',
    method: 'ONLINE' as 'ONLINE' | 'CASH',
    status: 'SUCCESS' as 'PENDING' | 'SUCCESS' | 'REJECTED',
  });
  const [createExamForm, setCreateExamForm] = useState({
    name: '',
    subjectId: '',
    totalMarks: '',
    examDate: '',
    classIds: [] as number[],
  });
  const [editExamForm, setEditExamForm] = useState({
    id: '',
    name: '',
    subjectId: '',
    totalMarks: '',
    examDate: '',
    classId: '',
  });
  const [createSubjectForm, setCreateSubjectForm] = useState({
    name: '',
    classIds: [] as number[],
  });
  const [editSubjectForm, setEditSubjectForm] = useState({
    id: '',
    name: '',
    classIds: [] as number[],
  });
  const [createTeacherForm, setCreateTeacherForm] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'MALE',
  });
  const [editTeacherForm, setEditTeacherForm] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    gender: 'MALE',
  });
  const [createTeacherErrors, setCreateTeacherErrors] = useState<Record<string, string>>({});
  const [editTeacherErrors, setEditTeacherErrors] = useState<Record<string, string>>({});
  const [parentModuleLoading, setParentModuleLoading] = useState(false);
  const [showCreateParentForm, setShowCreateParentForm] = useState(false);
  const [editingParentId, setEditingParentId] = useState<number | null>(null);
  const [parentSearch, setParentSearch] = useState('');
  const [createParentLoading, setCreateParentLoading] = useState(false);
  const [updateParentLoading, setUpdateParentLoading] = useState(false);
  const [createParentErrors, setCreateParentErrors] = useState<Record<string, string>>({});
  const [editParentErrors, setEditParentErrors] = useState<Record<string, string>>({});
  const [createParentForm, setCreateParentForm] = useState({
    name: '',
    email: '',
    gender: 'MALE',
    relation: 'Father',
    phone1: '',
    phone2: '',
    village: '',
  });
  const [editParentForm, setEditParentForm] = useState({
    id: '',
    name: '',
    email: '',
    gender: 'MALE',
    relation: 'Father',
    phone1: '',
    phone2: '',
    village: '',
  });
  const [createClassLoading, setCreateClassLoading] = useState(false);
  const [updateClassLoading, setUpdateClassLoading] = useState(false);
  const [createClassForm, setCreateClassForm] = useState({
    name: '',
    section: '',
    teacherId: '',
  });
  const [editClassForm, setEditClassForm] = useState({
    id: '',
    name: '',
    section: '',
    teacherId: '',
  });
  const [studentForm, setStudentForm] = useState({
    photo: '',
    name: '',
    gender: 'MALE',
    dob: '',
    classId: '',
    busId: '',
    parentIds: [] as number[],
  });
  const [editStudentForm, setEditStudentForm] = useState({
    id: '',
    photo: '',
    name: '',
    gender: 'MALE',
    dob: '',
    classId: '',
    busId: '',
  });
  const [quickParentErrors, setQuickParentErrors] = useState<Record<string, string>>({});
  const [quickParentForm, setQuickParentForm] = useState({
    name: '',
    email: '',
    gender: 'MALE',
    relation: 'Father',
    phone1: '',
    phone2: '',
    village: '',
  });

  const roleTitle = useMemo(() => {
    if (user.role === 'PRINCIPAL') {
      return 'Principal Dashboard';
    }
    if (user.role === 'TEACHER') {
      return 'Teacher Dashboard';
    }
    if (user.role === 'RECEPTIONIST') {
      return 'Receptionist Dashboard';
    }

    return 'Parent Dashboard';
  }, [user.role]);

  const roleItems = useMemo(() => {
    if (user.role === 'PRINCIPAL') {
      return ['School Management', 'Users & Admissions', 'Class & Exam Controls', 'Reports Overview'];
    }
    if (user.role === 'TEACHER') {
      return ['My Classes', 'Exams & Marks', 'Attendance Tasks', 'Academic Updates'];
    }
    if (user.role === 'RECEPTIONIST') {
      return ['Admissions Desk', 'Parent Support', 'Student Records', 'Daily Operations'];
    }

    return ['Child Profile', 'Attendance View', 'Marks & Progress', 'Fee Summary'];
  }, [user.role]);

  const canManageMarks = user.role === 'PRINCIPAL' || user.role === 'TEACHER' || user.role === 'RECEPTIONIST';
  const canViewMarks = true;
  const canManageFees = user.role === 'PRINCIPAL' || user.role === 'RECEPTIONIST';
  const canViewFees = true;

  const principalMenus: Array<{ name: string; Icon: IconType }> = [
    { name: 'Dashboard', Icon: LuGauge },
    { name: 'Students', Icon: LuGraduationCap },
    { name: 'Import Data', Icon: LuUpload },
    { name: 'Class', Icon: LuBookCopy },
    { name: 'Bus', Icon: LuCircleDollarSign },
    { name: 'Parents', Icon: LuUsers },
    { name: 'Teachers', Icon: LuUsers },
    { name: 'Attendance', Icon: LuUserRoundCheck },
    { name: 'Subject', Icon: LuBookCopy },
    { name: 'Exam', Icon: LuBookOpen },
    { name: 'Marks', Icon: LuBookOpen },
    { name: 'Payments', Icon: LuCircleDollarSign },
  ];

  useEffect(() => {
    if (user.role !== 'PRINCIPAL') {
      return;
    }
    const valid = principalMenus.some((menu) => menu.name === activePrincipalMenu);
    if (!valid) {
      setActivePrincipalMenu('Dashboard');
    }
  }, [user.role, activePrincipalMenu]);

  useEffect(() => {
    if (studentImportClassId && !classes.some((cls) => String(cls.id) === studentImportClassId)) {
      setStudentImportClassId('');
    }
  }, [classes, studentImportClassId]);

  useEffect(() => {
    if (selectedStudentClassId && !classes.some((cls) => cls.id === selectedStudentClassId)) {
      setSelectedStudentClassId(null);
    }
  }, [classes, selectedStudentClassId]);

  const studentDirectoryRows = useMemo<StudentDirectoryRow[]>(() => {
    return classes.flatMap((cls) =>
      (cls.students ?? []).map((student) => ({
        id: student.id,
        name: student.name,
        admissionno: student.admissionno ?? null,
        parents: student.parents ?? [],
        classId: cls.id,
        className: cls.name,
        section: cls.section,
        teacherName: cls.teacher?.name ?? null,
      })),
    );
  }, [classes]);

  const studentClassCards = useMemo(() => {
    return classes.map((cls) => ({
      id: cls.id,
      name: cls.name,
      section: cls.section,
      teacherName: cls.teacher?.name ?? 'Unassigned',
      totalStudents: (cls.students ?? []).length,
    }));
  }, [classes]);

  const selectedStudentClass = useMemo(() => {
    if (!selectedStudentClassId) {
      return null;
    }
    return classes.find((cls) => cls.id === selectedStudentClassId) ?? null;
  }, [classes, selectedStudentClassId]);

  const selectedStudentDirectoryRows = useMemo(() => {
    const baseRows = selectedStudentClassId
      ? studentDirectoryRows.filter((row) => row.classId === selectedStudentClassId)
      : studentDirectoryRows;

    const query = studentDirectorySearch.trim().toLowerCase();
    if (!query) {
      return baseRows;
    }

    return baseRows.filter((row) => {
      const profile = studentProfiles[row.id];
      const parentPhones = (row.parents ?? [])
        .map((item) => `${item.parent?.phone1 ?? ''} ${item.parent?.phone2 ?? ''}`)
        .join(' ');
      const parentText = (row.parents ?? [])
        .map((item) => `${item.parent?.name ?? ''} ${item.parent?.phone1 ?? ''} ${item.parent?.phone2 ?? ''}`)
        .join(' ')
        .toLowerCase();
      const searchText = [
        row.name,
        row.admissionno ?? '',
        row.className,
        row.section,
        row.teacherName ?? '',
        profile?.name ?? '',
        profile?.admissionno ?? '',
        profile?.gender ?? '',
        profile?.adharnumber ?? '',
        profile?.pincode ?? '',
        profile?.mothertongue ?? '',
        profile?.socialcategory ?? '',
        profile?.bloodgroup ?? '',
        profile?.address ?? '',
        profile?.bus?.busNumber ? `bus ${profile.bus.busNumber}` : '',
        profile?.bus?.routeName ?? '',
        profile?.class?.teacher?.name ?? '',
        parentPhones,
        parentText,
      ]
        .join(' ')
        .toLowerCase();
      return (
        row.name.toLowerCase().includes(query) ||
        String(row.admissionno ?? '').toLowerCase().includes(query) ||
        String(row.className).toLowerCase().includes(query) ||
        row.section.toLowerCase().includes(query) ||
        searchText.includes(query)
      );
    });
  }, [selectedStudentClassId, studentDirectoryRows, studentDirectorySearch, studentProfiles]);

  const studentSearchResults = useMemo<StudentDirectoryRow[]>(() => {
    const query = studentDirectorySearch.trim().toLowerCase();
    if (!query) {
      return [];
    }

    return studentDirectoryRows
      .filter((row) => {
        const profile = studentProfiles[row.id];
        const searchText = [
          row.name,
          row.admissionno ?? '',
          row.className,
          row.section,
          row.teacherName ?? '',
          profile?.name ?? '',
          profile?.admissionno ?? '',
          profile?.gender ?? '',
          profile?.adharnumber ?? '',
          profile?.pincode ?? '',
          profile?.mothertongue ?? '',
          profile?.socialcategory ?? '',
          profile?.bloodgroup ?? '',
          profile?.address ?? '',
          profile?.bus?.busNumber ? `bus ${profile.bus.busNumber}` : '',
          profile?.bus?.routeName ?? '',
          profile?.class?.teacher?.name ?? '',
          (row.parents ?? [])
            .map((item) => `${item.parent?.name ?? ''} ${item.parent?.phone1 ?? ''} ${item.parent?.phone2 ?? ''}`)
            .join(' '),
          (profile?.parents ?? [])
            .map((item) => `${item.parent?.name ?? ''} ${item.parent?.phone1 ?? ''} ${item.parent?.phone2 ?? ''} ${item.parent?.adharnumber ?? ''}`)
            .join(' '),
        ]
          .join(' ')
          .toLowerCase();
        return searchText.includes(query);
      })
      .slice(0, 8);
  }, [studentDirectoryRows, studentDirectorySearch, studentProfiles]);

  const filteredStudentParentOptions = useMemo(() => {
    const query = studentParentSearch.trim().toLowerCase();
    if (!query) {
      return parents;
    }

    return parents.filter((parent) => {
      const label = `${parent.name ?? ''} ${parent.phone1 ?? ''} ${parent.phone2 ?? ''} ${parent.relation ?? ''}`;
      return label.toLowerCase().includes(query);
    });
  }, [parents, studentParentSearch]);

  const loadClasses = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      const endpoints = ['/get-classes', '/get/get-classes'];
      let payload: unknown = null;
      let success = false;

      for (const endpoint of endpoints) {
        const response = await fetch(`${API_BASE}${endpoint}`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          payload = await readJson<{ data?: ClassSection[]; message?: string }>(response);
          success = true;
          break;
        }
      }

      if (!success) {
        toast.error('Unable to load classes. Please verify get routes are mounted.');
        return;
      }

      const classData = ((payload as { data?: ClassSection[] } | null)?.data ?? []).map((item) => ({
        ...item,
        students: item.students ?? [],
      }));

      setClasses(classData);
    } catch {
      toast.error('Network error while loading classes.');
    }
  }, [token]);

  const tryGetWithFallback = async <T,>(endpoints: string[]): Promise<T | null> => {
    for (const endpoint of endpoints) {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        return readJson<T>(response);
      }
    }

    return null;
  };

  const loadStudentAttachmentOptions = async () => {
    if (!token) {
      return;
    }

    setAttachmentsLoading(true);
    try {
      const [parentsPayload, busesPayload] = await Promise.all([
        tryGetWithFallback<{ data?: ParentOption[] }>(['/get/get-parents', '/get-parents']),
        tryGetWithFallback<{ data?: BusOption[] }>(['/get/get-buses', '/get-buses']),
      ]);

      setParents(parentsPayload?.data ?? []);
      setBuses(busesPayload?.data ?? []);
    } catch {
      toast.error('Unable to load parent/bus/user lists.');
    } finally {
      setAttachmentsLoading(false);
    }
  };

  const loadStudentProfile = useCallback(async (studentId: number) => {
    if (!token) {
      return null;
    }

    try {
      const response = await fetch(`${API_BASE}/student/get-student-details-master/${studentId}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return null;
      }

      const payload = await readJson<{ data?: StudentMasterDetail }>(response);
      if (!payload?.data) {
        return null;
      }

      setStudentProfiles((prev) => ({ ...prev, [studentId]: payload.data as StudentMasterDetail }));
      return payload.data as StudentMasterDetail;
    } catch {
      return null;
    }
  }, [token]);

  const parseStudentImportFile = async (file: File | null) => {
    if (!file) {
      setStudentImportFileName('');
      setStudentImportRows([]);
      setStudentImportResult(null);
      return;
    }

    setStudentImportParsing(true);
    try {
      const text = await file.text();
      const parsedRows = parseStudentImportPreview(text);
      setStudentImportFileName(file.name);
      setStudentImportRows(parsedRows);
      setStudentImportResult(null);
      if (!parsedRows.length) {
        toast.error('The CSV file is empty or has no valid rows.');
      } else {
        const invalidCount = parsedRows.filter((row) => !row.valid).length;
        if (invalidCount) {
          toast.warn(`${invalidCount} row(s) need attention before import.`);
        } else {
          toast.success(`Preview ready for ${parsedRows.length} row(s).`);
        }
      }
    } catch (error) {
      console.log(error);
      toast.error('Unable to read the CSV file.');
      setStudentImportRows([]);
      setStudentImportFileName('');
    } finally {
      setStudentImportParsing(false);
    }
  };

  const handleStudentImportFileInput = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    await parseStudentImportFile(file);
    event.target.value = '';
  };

  const handleStudentImportReset = () => {
    setStudentImportFileName('');
    setStudentImportClassId('');
    setStudentImportRows([]);
    setStudentImportResult(null);
    setShowStudentImportConfirm(false);
    setStudentImportEditIndex(null);
    setStudentImportEditForm(null);
  };

  const openStudentImportRowEditor = (row: StudentImportPreviewRow, index: number) => {
    setStudentImportEditIndex(index);
    setStudentImportEditForm({ ...row, parents: { father: { ...row.parents.father }, mother: { ...row.parents.mother } } });
  };

  const saveStudentImportRowEditor = () => {
    if (studentImportEditIndex === null || !studentImportEditForm) {
      return;
    }

    const row = studentImportEditForm;
    const errors: string[] = [];
    if (!row.name.trim()) errors.push('Missing student name');
    if (!row.gender) errors.push('Missing or invalid gender');

    const updatedRow: StudentImportPreviewRow = {
      ...row,
      name: row.name.trim(),
      admissionno: row.admissionno.trim(),
      address: row.address.trim(),
      parents: {
        father: {
          ...row.parents.father,
          name: row.parents.father.name.trim(),
          phone: normalizeImportDigits(row.parents.father.phone),
          aadhar: normalizeImportDigits(row.parents.father.aadhar),
          qualification: normalizeImportQualification(row.parents.father.qualification) ?? '',
        },
        mother: {
          ...row.parents.mother,
          name: row.parents.mother.name.trim(),
          phone: normalizeImportDigits(row.parents.mother.phone),
          aadhar: normalizeImportDigits(row.parents.mother.aadhar),
          qualification: normalizeImportQualification(row.parents.mother.qualification) ?? '',
        },
      },
      gender: row.gender === 'MALE' || row.gender === 'FEMALE' ? row.gender : '',
      dob: row.dob ? row.dob.trim() : '',
      adharnumber: normalizeImportDigits(row.adharnumber),
      pincode: normalizeImportDigits(row.pincode),
      mothertongue: normalizeImportMotherTongue(row.mothertongue) ?? '',
      socialcategory: normalizeImportSocialCategory(row.socialcategory) ?? '',
      bloodgroup: normalizeImportBloodGroup(row.bloodgroup) ?? '',
      admissiondate: row.admissiondate ? row.admissiondate.trim() : '',
      height: row.height ? String(normalizeImportInteger(row.height) ?? '') : '',
      weight: row.weight ? String(normalizeImportInteger(row.weight) ?? '') : '',
      errors,
      valid: errors.length === 0,
    };

    setStudentImportRows((prev) => prev.map((item, index) => (index === studentImportEditIndex ? updatedRow : item)));
    setStudentImportEditIndex(null);
    setStudentImportEditForm(null);
    toast.success('Row updated in preview.');
  };

  const downloadStudentImportErrors = () => {
    const rows = studentImportResult?.failedRows?.length
      ? studentImportResult.failedRows.map((row) => ({
          rowNumber: row.rowNumber,
          admissionno: row.admissionno ?? '',
          name: row.name ?? '',
          errors: row.errors,
        }))
      : studentImportRows.filter((row) => !row.valid).map((row) => ({
          rowNumber: row.rowNumber,
          admissionno: row.admissionno,
          name: row.name,
          errors: row.errors,
        }));
    if (!rows.length) {
      toast.info('No validation errors to export.');
      return;
    }

    const blob = new Blob([buildImportErrorReport(rows)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'student-import-errors.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleStudentImportSubmit = () => {
    if (!studentImportRows.length) {
      toast.error('Upload a CSV file first.');
      return;
    }

    if (!studentImportValidRows.length) {
      toast.error('There are no valid rows to import.');
      return;
    }

    setShowStudentImportConfirm(true);
  };

  const handleStudentImportConfirm = async () => {
    if (!token) {
      return;
    }

    const classId = Number(studentImportClassId);
    if (!Number.isFinite(classId) || classId <= 0) {
      toast.error('Please enter a valid Class ID.');
      return;
    }

    if (!studentImportRows.length) {
      toast.error('Upload a CSV file first.');
      return;
    }

    const validRows = studentImportRows.filter((row) => row.valid);
    if (!validRows.length) {
      toast.error('There are no valid rows to import.');
      return;
    }

    setStudentImportImporting(true);
    setShowStudentImportConfirm(false);
    try {
      const response = await fetch(`${API_BASE}/student/bulk-import-students`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          classId,
          rows: validRows.map(toStudentImportPayload),
        }),
      });

      const payload = await readJson<{
        message?: string;
        data?: {
          classId?: number;
          className?: string;
          createdStudents?: number;
          createdParents?: number;
          createdMothers?: number;
          createdFathers?: number;
          linkedParents?: number;
          linkedRelations?: number;
          reusedParents?: number;
          skippedRows?: number;
          failedRows?: Array<{ rowNumber: number; admissionno?: string | null; name?: string | null; step?: string; errors: string[] }>;
          stepTrace?: Array<{ rowNumber: number; admissionno?: string | null; name?: string | null; step?: string; message: string }>;
        };
      }>(response);

      if (!response.ok) {
        toast.error(payload?.message ?? 'Student import failed.');
        return;
      }

      setStudentImportResult({
        classId: payload?.data?.classId,
        className: payload?.data?.className,
        createdStudents: payload?.data?.createdStudents ?? 0,
        createdParents: payload?.data?.createdParents ?? 0,
        createdMothers: payload?.data?.createdMothers ?? 0,
        createdFathers: payload?.data?.createdFathers ?? 0,
        linkedParents: payload?.data?.linkedParents ?? 0,
        linkedRelations: payload?.data?.linkedRelations ?? 0,
        reusedParents: payload?.data?.reusedParents ?? 0,
        skippedRows: payload?.data?.skippedRows ?? 0,
        failedRows: payload?.data?.failedRows ?? [],
        stepTrace: payload?.data?.stepTrace ?? [],
      });

      const createdStudents = payload?.data?.createdStudents ?? 0;
      const createdParents = payload?.data?.createdParents ?? 0;
      const createdMothers = payload?.data?.createdMothers ?? 0;
      const createdFathers = payload?.data?.createdFathers ?? 0;
      const linkedRelations = payload?.data?.linkedRelations ?? 0;
      const failedRows = payload?.data?.failedRows ?? [];

      if (createdStudents || createdParents) {
        toast.success(`Imported ${createdStudents} student(s) and ${createdParents} parent record(s).`);
      }
      if (createdMothers || createdFathers || linkedRelations) {
        toast.info(
          `Mother records: ${createdMothers}, Father records: ${createdFathers}, Parent links: ${linkedRelations}.`,
        );
      }
      if (failedRows.length) {
        toast.warn(`${failedRows.length} row(s) were skipped during import.`);
      }
    } catch (error) {
      console.log(error);
      toast.error('Network error while importing students.');
    } finally {
      setStudentImportImporting(false);
    }
  };

  const loadStudentsModuleData = async () => {
    if (!token) {
      return;
    }

    setStudentModuleLoading(true);
    try {
      await Promise.all([loadClasses(), loadStudentAttachmentOptions()]);
    } finally {
      setStudentModuleLoading(false);
    }
  };

  const loadClassModuleData = async () => {
    if (!token) {
      return;
    }

    setClassModuleLoading(true);
    try {
      const [classesPayload, teachersPayload] = await Promise.all([
        tryGetWithFallback<{ data?: ClassSection[] }>(['/get/get-classes', '/get-classes']),
        tryGetWithFallback<{ data?: TeacherOption[] }>(['/get/get-teachers', '/get-teachers']),
      ]);

      const nextClasses = (classesPayload?.data ?? []).map((item) => ({
        ...item,
        students: item.students ?? [],
      }));

      setClasses(nextClasses);
      setTeachers(teachersPayload?.data ?? []);
    } catch {
      toast.error('Unable to load class module data.');
    } finally {
      setClassModuleLoading(false);
    }
  };

  const loadTeachersModuleData = async () => {
    if (!token) {
      return;
    }

    setTeacherModuleLoading(true);
    try {
      const teachersPayload = await tryGetWithFallback<{ data?: TeacherOption[] }>(['/get/get-teachers', '/get-teachers']);
      setTeachers(teachersPayload?.data ?? []);
    } catch {
      toast.error('Unable to load teacher data.');
    } finally {
      setTeacherModuleLoading(false);
    }
  };

  const loadParentsModuleData = async () => {
    if (!token) {
      return;
    }

    setParentModuleLoading(true);
    try {
      const parentsPayload = await tryGetWithFallback<{ data?: ParentOption[] }>(['/get/get-parents', '/get-parents']);
      setParents(parentsPayload?.data ?? []);
    } catch {
      toast.error('Unable to load parent data.');
    } finally {
      setParentModuleLoading(false);
    }
  };

  const loadExamModuleData = async () => {
    if (!token) {
      return;
    }

    setExamModuleLoading(true);
    try {
      const [classesPayload, subjectsPayload, examsPayload] = await Promise.all([
        tryGetWithFallback<{ data?: ClassSection[] }>(['/get/get-classes', '/get-classes']),
        tryGetWithFallback<{ data?: SubjectOption[] }>(['/get/get-subjects']),
        tryGetWithFallback<{ data?: ExamOption[] }>(['/get/get-exams', '/get-exams']),
      ]);

      setClasses((classesPayload?.data ?? []).map((item) => ({ ...item, students: item.students ?? [] })));
      setSubjects((subjectsPayload?.data ?? []).map((subject) => ({ id: subject.id, name: subject.name })));
      setExams(examsPayload?.data ?? []);
    } catch {
      toast.error('Unable to load exam module data.');
    } finally {
      setExamModuleLoading(false);
    }
  };

  const loadSubjectModuleData = async () => {
    if (!token) {
      return;
    }

    setSubjectModuleLoading(true);
    try {
      const [classesPayload, subjectsPayload] = await Promise.all([
        tryGetWithFallback<{ data?: ClassSection[] }>(['/get/get-classes', '/get-classes']),
        tryGetWithFallback<{ data?: SubjectOption[] }>(['/get/get-subjects']),
      ]);

      setClasses((classesPayload?.data ?? []).map((item) => ({ ...item, students: item.students ?? [] })));
      const rawSubjects = (subjectsPayload?.data ?? []) as SubjectOption[];
      const deduped = new Map<number, SubjectOption>();
      rawSubjects.forEach((subject) => {
        deduped.set(subject.id, {
          id: subject.id,
          name: subject.name,
          classsubject: subject.classsubject ?? [],
        });
      });
      setSubjects(Array.from(deduped.values()).sort((a, b) => a.name.localeCompare(b.name)));
    } catch {
      toast.error('Unable to load subject data.');
    } finally {
      setSubjectModuleLoading(false);
    }
  };

  const loadMarksModuleData = async () => {
    if (!token) {
      return;
    }

    setMarksModuleLoading(true);
    try {
      const [classesPayload, subjectsPayload, examsPayload, marksPayload] = await Promise.all([
        tryGetWithFallback<{ data?: ClassSection[] }>(['/get/get-classes', '/get-classes']),
        tryGetWithFallback<{ data?: SubjectOption[] }>(['/get/get-subjects']),
        tryGetWithFallback<{ data?: ExamOption[] }>(['/get/get-exams', '/get-exams']),
        tryGetWithFallback<{ data?: MarkOption[] }>(['/get/get-marks', '/get-marks']),
      ]);

      setClasses((classesPayload?.data ?? []).map((item) => ({ ...item, students: item.students ?? [] })));

      const rawSubjects = (subjectsPayload?.data ?? []) as SubjectOption[];
      const dedupedSubjects = new Map<number, SubjectOption>();
      rawSubjects.forEach((subject) => {
        dedupedSubjects.set(subject.id, {
          id: subject.id,
          name: subject.name,
          classsubject: subject.classsubject ?? [],
        });
      });
      setSubjects(Array.from(dedupedSubjects.values()).sort((a, b) => a.name.localeCompare(b.name)));
      setExams(examsPayload?.data ?? []);
      setMarksRecords(marksPayload?.data ?? []);
    } catch {
      toast.error('Unable to load marks data.');
    } finally {
      setMarksModuleLoading(false);
    }
  };

  const loadFeeModuleData = async () => {
    if (!token) {
      return;
    }

    setFeeModuleLoading(true);
    try {
      const [classesPayload, feesPayload] = await Promise.all([
        tryGetWithFallback<{ data?: ClassSection[] }>(['/get/get-classes', '/get-classes']),
        tryGetWithFallback<{ data?: FeeOption[] }>(['/get/get-fees', '/get-fees']),
      ]);

      setClasses((classesPayload?.data ?? []).map((item) => ({ ...item, students: item.students ?? [] })));
      setFees((feesPayload?.data ?? []) as FeeOption[]);
    } catch {
      toast.error('Unable to load fee and payment data.');
    } finally {
      setFeeModuleLoading(false);
    }
  };

  useEffect(() => {
    if (user.role === 'PRINCIPAL' && activePrincipalMenu === 'Students') {
      loadStudentsModuleData();
    }
  }, [user.role, activePrincipalMenu]);

  useEffect(() => {
    if (user.role === 'PRINCIPAL' && activePrincipalMenu === 'Import Data') {
      loadStudentsModuleData();
    }
  }, [user.role, activePrincipalMenu]);

  useEffect(() => {
    if (user.role === 'PRINCIPAL' && activePrincipalMenu === 'Class') {
      loadClassModuleData();
    }
  }, [user.role, activePrincipalMenu]);

  useEffect(() => {
    if (user.role === 'PRINCIPAL' && activePrincipalMenu === 'Teachers') {
      loadTeachersModuleData();
    }
  }, [user.role, activePrincipalMenu]);

  useEffect(() => {
    if (user.role === 'PRINCIPAL' && activePrincipalMenu === 'Parents') {
      loadParentsModuleData();
    }
  }, [user.role, activePrincipalMenu]);

  useEffect(() => {
    if (user.role === 'PRINCIPAL' && activePrincipalMenu === 'Exam') {
      loadExamModuleData();
    }
  }, [user.role, activePrincipalMenu]);

  useEffect(() => {
    if (user.role === 'PRINCIPAL' && activePrincipalMenu === 'Subject') {
      loadSubjectModuleData();
    }
  }, [user.role, activePrincipalMenu]);

  useEffect(() => {
    if (user.role === 'PRINCIPAL' && activePrincipalMenu === 'Marks') {
      loadMarksModuleData();
    }
  }, [user.role, activePrincipalMenu]);

  useEffect(() => {
    if (user.role === 'PRINCIPAL' && activePrincipalMenu === 'Payments') {
      loadFeeModuleData();
    }
  }, [user.role, activePrincipalMenu]);

  useEffect(() => {
    if (user.role !== 'PRINCIPAL' && canViewMarks) {
      loadMarksModuleData();
    }
  }, [user.role]);

  useEffect(() => {
    if (user.role !== 'PRINCIPAL' && canViewFees) {
      loadFeeModuleData();
    }
  }, [user.role]);

  useEffect(() => {
    if (user.role !== 'PARENT') {
      return;
    }

    let cancelled = false;
    setParentDashboardLoading(true);
    loadClasses().finally(() => {
      if (!cancelled) {
        setParentDashboardLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [loadClasses, user.role]);

  useEffect(() => {
    setMarksMode(canManageMarks ? 'manage' : 'view');
  }, [canManageMarks, user.role]);

  useEffect(() => {
    setFeePage(canManageFees ? 'overview' : 'student-details');
  }, [canManageFees, user.role]);

  useEffect(() => {
    if (user.role === 'PRINCIPAL') {
      localStorage.setItem(PRINCIPAL_MENU_KEY, activePrincipalMenu);
      document.title = `IDPS | ${activePrincipalMenu}`;
      return;
    }

    const roleTitleMap: Record<Role, string> = {
      PRINCIPAL: 'Principal',
      TEACHER: 'Teacher',
      RECEPTIONIST: 'Receptionist',
      PARENT: 'Parent',
    };
    document.title = `IDPS | ${roleTitleMap[user.role]}`;
  }, [user.role, activePrincipalMenu]);

  const createStudent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!studentForm.name || !studentForm.dob || !studentForm.classId || studentForm.parentIds.length === 0) {
      toast.error('Please fill all required fields.');
      return;
    }

    setCreateStudentLoading(true);
    try {
      const payload = {
        photo: studentForm.photo || undefined,
        name: studentForm.name,
        gender: studentForm.gender,
        dob: new Date(studentForm.dob).toISOString(),
        classId: Number(studentForm.classId),
        busId: studentForm.busId ? Number(studentForm.busId) : null,
        parentIds: studentForm.parentIds,
      };

      const response = await fetch(`${API_BASE}/create-student`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await readJson<{ message?: string }>(response);

      if (!response.ok) {
        toast.error(result?.message ?? 'Failed to create student.');
        return;
      }

      toast.success(result?.message ?? 'Student created successfully.');
      setStudentForm({
        photo: '',
        name: '',
        gender: 'MALE',
        dob: '',
        classId: '',
        busId: '',
        parentIds: [],
      });
      setShowCreateStudentModal(false);
      setStudentParentSearch('');
      setStudentAction('list');
      await loadStudentsModuleData();
    } catch {
      toast.error('Network error while creating student.');
    } finally {
      setCreateStudentLoading(false);
    }
  };

  const openStudentView = async (studentId: number) => {
    setActiveStudentId(studentId);
    setStudentAction('view');
    setShowStudentInsightsModal(true);
    setStudentProfileLoading(true);
    try {
      const profile = studentProfiles[studentId] ?? (await loadStudentProfile(studentId));
      if (profile?.classId) {
        setSelectedStudentClassId(profile.classId);
      }
    } finally {
      setStudentProfileLoading(false);
    }
  };

  const openStudentEdit = async (studentId: number) => {
    setActiveStudentId(studentId);
    setStudentAction('edit');
    setStudentProfileLoading(true);
    const profile = studentProfiles[studentId] ?? (await loadStudentProfile(studentId));
    if (profile) {
      if (profile.classId) {
        setSelectedStudentClassId(profile.classId);
      }
      const dobIso = profile.dob ? new Date(profile.dob).toISOString().slice(0, 10) : '';
      setEditStudentForm({
        id: String(profile.id),
        photo: profile.photo ?? '',
        name: profile.name ?? '',
        gender: profile.gender ?? 'MALE',
        dob: dobIso,
        classId: String(profile.classId ?? ''),
        busId: String(profile.busId ?? ''),
      });
    }
    setStudentProfileLoading(false);
  };

  const updateStudent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editStudentForm.id || !editStudentForm.name || !editStudentForm.gender || !editStudentForm.classId) {
      toast.error('Please fill required student fields.');
      return;
    }

    setUpdateStudentLoading(true);
    try {
      const response = await fetch(`${API_BASE}/update-student/${editStudentForm.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          photo: editStudentForm.photo || undefined,
          name: editStudentForm.name,
          gender: editStudentForm.gender,
          dob: editStudentForm.dob ? new Date(editStudentForm.dob).toISOString() : null,
          classId: Number(editStudentForm.classId),
          busId: editStudentForm.busId ? Number(editStudentForm.busId) : null,
        }),
      });

      const result = await readJson<{ message?: string }>(response);
      if (!response.ok) {
        toast.error(result?.message ?? 'Failed to update student.');
        return;
      }

      toast.success(result?.message ?? 'Student updated successfully.');
      setStudentAction('view');
      await loadStudentsModuleData();
      if (activeStudentId) {
        await loadStudentProfile(activeStudentId);
      }
    } catch {
      toast.error('Network error while updating student.');
    } finally {
      setUpdateStudentLoading(false);
    }
  };

  const teacherById = useMemo(() => {
    return new Map(teachers.map((teacher) => [teacher.id, teacher]));
  }, [teachers]);

  const filteredClassRows = useMemo(() => {
    const query = classSearch.trim().toLowerCase();
    if (!query) {
      return classes;
    }

    return classes.filter((cls) => {
      const mappedTeacher = teacherById.get(cls.teacherId ?? -1);
      const teacherName = cls.teacher?.name ?? mappedTeacher?.name ?? '';
      const teacherLabel = `${teacherName} ${mappedTeacher?.phone ?? ''}`;
      return (
        String(cls.name).toLowerCase().includes(query) ||
        cls.section.toLowerCase().includes(query) ||
        teacherLabel.toLowerCase().includes(query)
      );
    });
  }, [classes, classSearch, teacherById]);

  const createClass = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!createClassForm.name || !createClassForm.section || !createClassForm.teacherId) {
      toast.error('Please fill class, section, and teacher.');
      return;
    }

    setCreateClassLoading(true);
    try {
      const response = await fetch(`${API_BASE}/class/create-class`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: createClassForm.name.trim(),
          section: createClassForm.section,
          teacherId: Number(createClassForm.teacherId),
        }),
      });

      const result = await readJson<{ message?: string }>(response);
      if (!response.ok) {
        toast.error(result?.message ?? 'Failed to create class.');
        return;
      }

      toast.success(result?.message ?? 'Class created successfully.');
      setCreateClassForm({ name: '', section: '', teacherId: '' });
      await loadClassModuleData();
    } catch {
      toast.error('Network error while creating class.');
    } finally {
      setCreateClassLoading(false);
    }
  };

  const updateClass = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editClassForm.id || !editClassForm.name || !editClassForm.section || !editClassForm.teacherId) {
      toast.error('Please complete all fields for class update.');
      return;
    }

    setUpdateClassLoading(true);
    try {
      const response = await fetch(`${API_BASE}/class/update-class/${editClassForm.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editClassForm.name.trim(),
          section: editClassForm.section,
          teacherId: Number(editClassForm.teacherId),
        }),
      });

      const result = await readJson<{ message?: string }>(response);
      if (!response.ok) {
        toast.error(result?.message ?? 'Failed to update class.');
        return;
      }

      toast.success(result?.message ?? 'Class updated successfully.');
      setEditingClassId(null);
      await loadClassModuleData();
    } catch {
      toast.error('Network error while updating class.');
    } finally {
      setUpdateClassLoading(false);
    }
  };

  const openEditClass = (cls: ClassSection) => {
    setEditingClassId(cls.id);
    setEditClassForm({
      id: String(cls.id),
      name: String(cls.name),
      section: cls.section,
      teacherId: String(cls.teacherId ?? ''),
    });
  };

  const filteredTeacherRows = useMemo(() => {
    const query = teacherSearch.trim().toLowerCase();
    if (!query) {
      return teachers;
    }

    return teachers.filter((teacher) => {
      const name = teacher.name || teacher.user?.name || '';
      const email = teacher.user?.email ?? '';
      const phone = teacher.phone ?? '';
      const gender = teacher.gender ?? '';
      return [name, email, phone, gender].some((value) => value.toLowerCase().includes(query));
    });
  }, [teachers, teacherSearch]);

  const validateTeacherForm = (form: { name: string; email: string; phone: string; gender: string }) => {
    const errors: Record<string, string> = {};
    const name = form.name.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();
    const gender = form.gender.trim();

    if (!name) {
      errors.name = 'Name is required.';
    }
    if (!email) {
      errors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Enter a valid email address.';
    }
    if (!phone) {
      errors.phone = 'Phone number is required.';
    } else if (!/^\d{10}$/.test(phone)) {
      errors.phone = 'Phone number must be exactly 10 digits.';
    }
    if (!gender) {
      errors.gender = 'Gender is required.';
    }

    return errors;
  };

  const createTeacher = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errors = validateTeacherForm(createTeacherForm);
    setCreateTeacherErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error('Please fix the highlighted fields.');
      return;
    }

    setCreateTeacherLoading(true);
    try {
      const response = await fetch(`${API_BASE}/create-teacher`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: createTeacherForm.name,
          email: createTeacherForm.email,
          phone: createTeacherForm.phone,
          gender: createTeacherForm.gender,
        }),
      });

      const result = await readJson<{ message?: string }>(response);
      if (!response.ok) {
        toast.error(result?.message ?? 'Failed to create teacher.');
        return;
      }

      toast.success(result?.message ?? 'Teacher created successfully.');
      setCreateTeacherForm({
        name: '',
        email: '',
        phone: '',
        gender: 'MALE',
      });
      setCreateTeacherErrors({});
      setShowCreateTeacherForm(false);
      await loadTeachersModuleData();
    } catch {
      toast.error('Network error while creating teacher.');
    } finally {
      setCreateTeacherLoading(false);
    }
  };

  const updateTeacher = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errors = validateTeacherForm(editTeacherForm);
    setEditTeacherErrors(errors);
    if (!editTeacherForm.id || Object.keys(errors).length > 0) {
      toast.error('Please fix the highlighted fields.');
      return;
    }

    setUpdateTeacherLoading(true);
    try {
      const response = await fetch(`${API_BASE}/update-teacher/${editTeacherForm.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editTeacherForm.name,
          email: editTeacherForm.email,
          phone: editTeacherForm.phone,
          gender: editTeacherForm.gender,
        }),
      });

      const result = await readJson<{ message?: string }>(response);
      if (!response.ok) {
        toast.error(result?.message ?? 'Failed to update teacher.');
        return;
      }

      toast.success(result?.message ?? 'Teacher updated successfully.');
      setEditingTeacherId(null);
      setEditTeacherErrors({});
      await loadTeachersModuleData();
    } catch {
      toast.error('Network error while updating teacher.');
    } finally {
      setUpdateTeacherLoading(false);
    }
  };

  const openEditTeacher = (teacher: TeacherOption) => {
    setEditingTeacherId(teacher.id);
    setEditTeacherErrors({});
    setEditTeacherForm({
      id: String(teacher.id),
      name: teacher.name ?? teacher.user?.name ?? '',
      email: teacher.user?.email ?? '',
      phone: teacher.phone ?? '',
      gender: teacher.gender ?? 'MALE',
    });
  };

  const filteredParentRows = useMemo(() => {
    const query = parentSearch.trim().toLowerCase();
    if (!query) {
      return parents;
    }

    return parents.filter((parent) => {
      const values = [
        parent.name ?? '',
        parent.relation ?? '',
        parent.phone1 ?? '',
        parent.phone2 ?? '',
        parent.village ?? '',
        parent.user?.email ?? '',
        parent.user?.gender ?? '',
      ];
      return values.some((value) => value.toLowerCase().includes(query));
    });
  }, [parents, parentSearch]);

  const validateParentForm = (form: {
    name: string;
    email: string;
    gender: string;
    relation: string;
    phone1: string;
    phone2: string;
    village: string;
  }) => {
    const errors: Record<string, string> = {};
    const email = form.email.trim();
    const phone1 = form.phone1.trim();
    const phone2 = form.phone2.trim();

    if (!form.name.trim()) errors.name = 'Name is required.';
    if (!email) errors.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address.';
    if (!form.gender.trim()) errors.gender = 'Gender is required.';
    if (!form.relation.trim()) errors.relation = 'Relation is required.';
    if (!phone1) errors.phone1 = 'Primary phone number is required.';
    else if (!/^\d{10}$/.test(phone1)) errors.phone1 = 'Primary phone number must be exactly 10 digits.';
    if (phone2 && !/^\d{10}$/.test(phone2)) errors.phone2 = 'Secondary phone number must be exactly 10 digits.';
    if (!form.village.trim()) errors.village = 'Village is required.';
    return errors;
  };

  const createParentFromStudent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = validateParentForm(quickParentForm);
    setQuickParentErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error('Please fix the highlighted fields.');
      return;
    }

    setQuickParentLoading(true);
    try {
      const response = await fetch(`${API_BASE}/create-parent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: quickParentForm.name,
          email: quickParentForm.email,
          gender: quickParentForm.gender,
          relation: quickParentForm.relation,
          phone1: quickParentForm.phone1,
          phone2: quickParentForm.phone2 || undefined,
          village: quickParentForm.village,
        }),
      });

      const result = await readJson<{ message?: string; data?: { parent?: { id: number } } }>(response);
      if (!response.ok) {
        toast.error(result?.message ?? 'Failed to create parent.');
        return;
      }

      toast.success(result?.message ?? 'Parent created successfully.');
      const createdParentId = result?.data?.parent?.id;
      await loadStudentAttachmentOptions();
      if (createdParentId) {
        setStudentForm((prev) => ({
          ...prev,
          parentIds: prev.parentIds.includes(createdParentId) ? prev.parentIds : [...prev.parentIds, createdParentId],
        }));
      }

      setQuickParentForm({
        name: '',
        email: '',
        gender: 'MALE',
        relation: 'Father',
        phone1: '',
        phone2: '',
        village: '',
      });
      setQuickParentErrors({});
      setShowQuickParentModal(false);
    } catch {
      toast.error('Network error while creating parent.');
    } finally {
      setQuickParentLoading(false);
    }
  };

  const createParent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = validateParentForm(createParentForm);
    setCreateParentErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error('Please fix the highlighted fields.');
      return;
    }

    setCreateParentLoading(true);
    try {
      const response = await fetch(`${API_BASE}/create-parent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: createParentForm.name,
          email: createParentForm.email,
          gender: createParentForm.gender,
          relation: createParentForm.relation,
          phone1: createParentForm.phone1,
          phone2: createParentForm.phone2,
          village: createParentForm.village,
        }),
      });

      const result = await readJson<{ message?: string }>(response);
      if (!response.ok) {
        toast.error(result?.message ?? 'Failed to create parent.');
        return;
      }

      toast.success(result?.message ?? 'Parent created successfully.');
      setCreateParentForm({
        name: '',
        email: '',
        gender: 'MALE',
        relation: 'Father',
        phone1: '',
        phone2: '',
        village: '',
      });
      setCreateParentErrors({});
      setShowCreateParentForm(false);
      await loadParentsModuleData();
    } catch {
      toast.error('Network error while creating parent.');
    } finally {
      setCreateParentLoading(false);
    }
  };

  const updateParent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = validateParentForm(editParentForm);
    setEditParentErrors(errors);
    if (!editParentForm.id || Object.keys(errors).length > 0) {
      toast.error('Please fix the highlighted fields.');
      return;
    }

    setUpdateParentLoading(true);
    try {
      const response = await fetch(`${API_BASE}/update-parent/${editParentForm.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editParentForm.name,
          email: editParentForm.email,
          gender: editParentForm.gender,
          relation: editParentForm.relation,
          phone1: editParentForm.phone1,
          phone2: editParentForm.phone2,
          village: editParentForm.village,
        }),
      });

      const result = await readJson<{ message?: string }>(response);
      if (!response.ok) {
        toast.error(result?.message ?? 'Failed to update parent.');
        return;
      }

      toast.success(result?.message ?? 'Parent updated successfully.');
      setEditingParentId(null);
      setEditParentErrors({});
      await loadParentsModuleData();
    } catch {
      toast.error('Network error while updating parent.');
    } finally {
      setUpdateParentLoading(false);
    }
  };

  const openEditParent = (parent: ParentOption) => {
    setEditingParentId(parent.id);
    setEditParentErrors({});
    setEditParentForm({
      id: String(parent.id),
      name: parent.name ?? '',
      email: parent.user?.email ?? '',
      gender: parent.user?.gender ?? 'MALE',
      relation: parent.relation ?? '',
      phone1: parent.phone1 ?? '',
      phone2: parent.phone2 ?? '',
      village: parent.village ?? '',
    });
  };

  const selectedExamClass = useMemo(
    () => classes.find((cls) => cls.id === selectedExamClassId) ?? null,
    [classes, selectedExamClassId],
  );

  const filteredClassExams = useMemo(() => {
    if (!selectedExamClassId) {
      return [];
    }
    return exams.filter((exam) => exam.classId === selectedExamClassId);
  }, [exams, selectedExamClassId]);

  const deferredCreateExamClassSearch = useDeferredValue(createExamClassSearch);

  const filteredCreateExamClasses = useMemo(() => {
    const query = normalizeSearchValue(deferredCreateExamClassSearch);
    if (!query) {
      return classes;
    }
    const queryTokens = query.split(' ').filter(Boolean);
    return classes.filter((cls) => {
      const searchableText = normalizeSearchValue(`class ${cls.name} ${cls.section}`);
      return queryTokens.every((token) => searchableText.includes(token));
    });
  }, [classes, deferredCreateExamClassSearch]);

  const selectedMarksClass = useMemo(
    () => classes.find((cls) => cls.id === selectedMarksClassId) ?? null,
    [classes, selectedMarksClassId],
  );

  const marksSubjectOptions = useMemo(() => {
    if (!selectedMarksClassId) {
      return [];
    }

    return subjects
      .filter((subject) =>
        (subject.classsubject ?? []).some((mapping) => (mapping.class?.id ?? mapping.classId) === selectedMarksClassId),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [subjects, selectedMarksClassId]);

  const marksExamOptions = useMemo(() => {
    if (!selectedMarksClassId || !selectedMarksSubjectId) {
      return [];
    }

    return exams
      .filter((exam) => {
        if (exam.classId !== selectedMarksClassId) {
          return false;
        }
        if (exam.subjectId !== selectedMarksSubjectId) {
          return false;
        }
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [exams, selectedMarksClassId, selectedMarksSubjectId]);

  const selectedMarksExam = useMemo(
    () => exams.find((exam) => exam.id === selectedMarksExamId) ?? null,
    [exams, selectedMarksExamId],
  );

  const marksStudentRows = useMemo(() => {
    if (!selectedMarksClass) {
      return [];
    }
    return [...(selectedMarksClass.students ?? [])].sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedMarksClass]);

  const assignableStudents = useMemo(() => {
    if (!assignFeeForm.classId) {
      return [];
    }
    const classObj = classes.find((cls) => cls.id === Number(assignFeeForm.classId));
    return classObj?.students ?? [];
  }, [classes, assignFeeForm.classId]);

  const feeStatusRows = useMemo(() => {
    const nowMs = Date.now();

    return fees.map((fee) => {
      const total = Number(fee.total ?? 0);
      const paidAmount = fee.payments
        .filter((payment) => payment.status === 'SUCCESS')
        .reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0);
      const remainingAmount = Math.max(total - paidAmount, 0);
      const createdAtMs = new Date(fee.createdAt).getTime();
      const ageInDays = Number.isFinite(createdAtMs) ? Math.max(Math.floor((nowMs - createdAtMs) / 86400000), 0) : 0;

      let status: 'PAID' | 'PENDING' | 'PARTIAL' | 'OVERDUE' = 'PENDING';
      if (total > 0 && remainingAmount <= 0) {
        status = 'PAID';
      } else if (total > 0 && ageInDays > 45) {
        status = 'OVERDUE';
      } else if (total > 0 && paidAmount > 0 && remainingAmount > 0) {
        status = 'PARTIAL';
      }

      return {
        id: fee.id,
        classId: fee.student?.class?.id ?? fee.student?.classId ?? -1,
        classLabel: fee.student?.class ? `${fee.student.class.name}-${fee.student.class.section}` : 'N/A',
        total,
        paidAmount,
        remainingAmount,
        status,
      };
    });
  }, [fees]);

  const feeOverview = useMemo(() => {
    const totalFees = feeStatusRows.length;
    const paidFees = feeStatusRows.filter((item) => item.status === 'PAID').length;
    const partialFees = feeStatusRows.filter((item) => item.status === 'PARTIAL').length;
    const pendingFees = feeStatusRows.filter((item) => item.status === 'PENDING').length;
    const overdueFees = feeStatusRows.filter((item) => item.status === 'OVERDUE').length;
    const paidPercent = totalFees ? Math.round((paidFees / totalFees) * 100) : 0;
    const collectionRate = totalFees ? Math.round(((paidFees + partialFees * 0.5) / totalFees) * 100) : 0;
    const totalAmount = feeStatusRows.reduce((sum, row) => sum + row.total, 0);
    const paidAmount = feeStatusRows.reduce((sum, row) => sum + row.paidAmount, 0);
    const pendingAmount = Math.max(totalAmount - paidAmount, 0);
    const paidAmountPercent = totalAmount ? Math.round((paidAmount / totalAmount) * 100) : 0;

    return {
      totalFees,
      paidFees,
      partialFees,
      pendingFees,
      overdueFees,
      paidPercent,
      paidAmountPercent,
      collectionRate,
      totalAmount,
      paidAmount,
      pendingAmount,
    };
  }, [feeStatusRows]);

  const feeTypeInsights = useMemo(() => {
    const types = [
      { key: 'TUITION', label: 'Tuition', color: 'var(--primary)' },
      { key: 'BUS', label: 'Transport', color: 'var(--accent)' },
      { key: 'EXAM', label: 'Exam', color: 'var(--primary-dark)' },
      { key: 'OTHER', label: 'Other', color: 'rgba(107, 114, 128, 0.9)' },
    ] as const;

    return types.map((item) => {
      const rows = fees.filter((fee) => fee.type === item.key);
      const totalAmount = rows.reduce((sum, fee) => sum + Number(fee.total ?? 0), 0);
      const paidAmount = rows.reduce((sum, fee) => sum + getFeePaidAmount(fee), 0);
      const pendingAmount = Math.max(totalAmount - paidAmount, 0);
      const share = feeOverview.totalAmount ? (totalAmount / feeOverview.totalAmount) * 100 : 0;

      return {
        ...item,
        count: rows.length,
        totalAmount,
        paidAmount,
        pendingAmount,
        share,
      };
    });
  }, [fees, feeOverview.totalAmount]);

  const classFeeInsights = useMemo(() => {
    return classes
      .map((cls) => {
        const classRows = feeStatusRows.filter((row) => row.classId === cls.id);
        const totalAmount = classRows.reduce((sum, row) => sum + row.total, 0);
        const paidAmount = classRows.reduce((sum, row) => sum + row.paidAmount, 0);
        const pendingAmount = Math.max(totalAmount - paidAmount, 0);
        const percent = totalAmount ? Math.round((paidAmount / totalAmount) * 100) : 0;

        return {
          classId: cls.id,
          label: `${cls.name}-${cls.section}`,
          totalFees: classRows.length,
          paidCount: classRows.filter((row) => row.status === 'PAID').length,
          pendingCount: classRows.filter((row) => row.status !== 'PAID').length,
          totalAmount,
          paidAmount,
          pendingAmount,
          percent,
        };
      })
      .sort((a, b) => b.totalAmount - a.totalAmount || b.totalFees - a.totalFees);
  }, [classes, feeStatusRows]);

  const collectionDonutSegments = useMemo(() => {
    const totalAmount = Math.max(feeOverview.totalAmount, 0);
    if (!totalAmount) {
      return [];
    }

    const collectedAmount = Math.max(feeOverview.paidAmount, 0);
    const remainingAmount = Math.max(totalAmount - collectedAmount, 0);
    const items = [
      { key: 'COLLECTED', label: 'Collected', amount: collectedAmount, color: 'var(--primary)' },
      { key: 'REMAINING', label: 'Remaining', amount: remainingAmount, color: 'var(--accent)' },
    ].filter((item) => item.amount > 0 || remainingAmount === 0);

    let startAngle = 0;
    return items.map((item) => {
      const sweepAngle = totalAmount ? (item.amount / totalAmount) * 360 : 0;
      const endAngle = startAngle + sweepAngle;
      const segment = {
        ...item,
        share: totalAmount ? (item.amount / totalAmount) * 100 : 0,
        startAngle,
        endAngle,
        path: describeArcPath(90, 90, 72, startAngle, endAngle),
      };
      startAngle = endAngle;
      return segment;
    });
  }, [feeOverview.paidAmount, feeOverview.totalAmount]);

  const classFeeMaxAmount = useMemo(
    () => Math.max(1, ...classFeeInsights.map((item) => item.totalAmount)),
    [classFeeInsights],
  );

  const feeTransactions = useMemo(() => {
    return fees
      .flatMap((fee) =>
        (fee.payments ?? []).map((payment) => ({
          ...payment,
          fee,
          studentName: fee.student?.name ?? `Student ${fee.studentId}`,
          classLabel: fee.student?.class ? `${fee.student.class.name}-${fee.student.class.section}` : 'N/A',
        })),
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [fees]);

  const feeStudents = useMemo(() => {
    const map = new Map<number, { id: number; name: string; classLabel: string }>();
    fees.forEach((fee) => {
      const sid = fee.studentId;
      if (!map.has(sid)) {
        map.set(sid, {
          id: sid,
          name: fee.student?.name ?? `Student ${sid}`,
          classLabel: fee.student?.class ? `${fee.student.class.name}-${fee.student.class.section}` : 'N/A',
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [fees]);

  const manageStudentRows = useMemo(() => {
    const map = new Map<
      number,
      {
        id: number;
        name: string;
        classId: number | null;
        classLabel: string;
        section: string;
        totalAmount: number;
        paidAmount: number;
        pendingAmount: number;
        status: 'PAID' | 'PARTIAL' | 'PENDING' | 'OVERDUE' | 'NO FEES';
        feeCount: number;
        paymentCount: number;
        feeTypes: string[];
        fees: FeeOption[];
      }
    >();

    fees.forEach((fee) => {
      const studentId = fee.studentId;
      const studentName = fee.student?.name ?? `Student ${studentId}`;
      const classId = fee.student?.class?.id ?? fee.student?.classId ?? null;
      const classLabel = fee.student?.class ? `${fee.student.class.name}-${fee.student.class.section}` : 'N/A';
      const section = fee.student?.class?.section ?? '';
      const total = Number(fee.total ?? 0);
      const paid = getFeePaidAmount(fee);
      const pending = Math.max(total - paid, 0);
      const row = map.get(studentId) ?? {
        id: studentId,
        name: studentName,
        classId,
        classLabel,
        section,
        totalAmount: 0,
        paidAmount: 0,
        pendingAmount: 0,
        status: 'NO FEES' as const,
        feeCount: 0,
        paymentCount: 0,
        feeTypes: [],
        fees: [],
      };

      row.totalAmount += total;
      row.paidAmount += paid;
      row.pendingAmount += pending;
      row.feeCount += 1;
      row.paymentCount += (fee.payments ?? []).length;
      row.fees.push(fee);
      if (!row.feeTypes.includes(fee.type)) {
        row.feeTypes.push(fee.type);
      }
      const createdAtMs = new Date(fee.createdAt).getTime();
      const ageInDays = Number.isFinite(createdAtMs) ? Math.max(Math.floor((Date.now() - createdAtMs) / 86400000), 0) : 0;
      const isOverdue = total > 0 && pending > 0 && ageInDays > 45;
      row.status =
        row.pendingAmount <= 0 && row.totalAmount > 0
          ? 'PAID'
          : row.paidAmount > 0 && row.pendingAmount > 0
            ? 'PARTIAL'
            : row.pendingAmount > 0
              ? 'PENDING'
              : row.status;
      if (isOverdue || row.status === 'OVERDUE') {
        row.status = 'OVERDUE';
      }

      map.set(studentId, row);
    });

    const query = deferredManageStudentSearch.trim().toLowerCase();
    return Array.from(map.values())
      .filter((row) => {
        if (query && !`${row.name} ${row.classLabel} ${row.section}`.toLowerCase().includes(query)) {
          return false;
        }
        if (manageStudentClassId && row.classId !== manageStudentClassId) {
          return false;
        }
        if (manageStudentSection && row.section !== manageStudentSection) {
          return false;
        }
        if (manageStudentStatus !== 'ALL' && row.status !== manageStudentStatus) {
          return false;
        }
        if (manageStudentType !== 'ALL' && !row.feeTypes.includes(manageStudentType)) {
          return false;
        }
        return true;
      })
      .sort((a, b) => b.totalAmount - a.totalAmount || a.name.localeCompare(b.name));
  }, [fees, deferredManageStudentSearch, manageStudentClassId, manageStudentSection, manageStudentStatus, manageStudentType]);

  const manageStudentSections = useMemo(() => {
    const set = new Set(classes.map((cls) => cls.section));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [classes]);

  const activeFeeStudentId = feeStudentDetailId ?? (feePage === 'manage' ? manageStudentRows[0]?.id ?? null : null);

  const selectedStudentFeeRows = useMemo(() => {
    if (!activeFeeStudentId) {
      return [];
    }
    return fees.filter((fee) => fee.studentId === activeFeeStudentId);
  }, [activeFeeStudentId, fees]);

  const filteredFeeStudents = useMemo(() => {
    const query = feeStudentSearch.trim().toLowerCase();
    if (!query) return feeStudents;
    return feeStudents.filter((student) => `${student.name} ${student.classLabel}`.toLowerCase().includes(query));
  }, [feeStudents, feeStudentSearch]);

  const selectedStudentFeeSummary = useMemo(() => {
    const total = selectedStudentFeeRows.reduce((sum, fee) => sum + Number(fee.total ?? 0), 0);
    const paid = selectedStudentFeeRows.reduce(
      (sum, fee) =>
        sum +
        fee.payments
          .filter((payment) => payment.status === 'SUCCESS')
          .reduce((amountSum, payment) => amountSum + Number(payment.amount ?? 0), 0),
      0,
    );
    const remaining = Math.max(total - paid, 0);
    return { total, paid, remaining };
  }, [selectedStudentFeeRows]);

  const manageSelectedStudent = useMemo(() => {
    if (manageStudentRows.length === 0) {
      return null;
    }
    return manageStudentRows.find((row) => row.id === activeFeeStudentId) ?? manageStudentRows[0];
  }, [activeFeeStudentId, manageStudentRows]);

  const manageSelectedStudentPayments = useMemo(() => {
    if (!manageSelectedStudent) {
      return [];
    }
    return manageSelectedStudent.fees
      .flatMap((fee) =>
        (fee.payments ?? []).map((payment) => ({
          ...payment,
          fee,
        })),
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [manageSelectedStudent]);

  const manageSelectedStudentLastPaymentLabel = useMemo(() => {
    if (manageSelectedStudentPayments.length === 0) {
      return 'N/A';
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    }).format(new Date(manageSelectedStudentPayments[0].createdAt));
  }, [manageSelectedStudentPayments]);

  const manageSelectedStudentTypeBreakdown = useMemo(() => {
    if (!manageSelectedStudent) {
      return [];
    }

    const typeMeta = [
      { key: 'TUITION', label: 'Tuition', color: 'var(--primary)' },
      { key: 'BUS', label: 'Transport', color: 'var(--accent)' },
      { key: 'EXAM', label: 'Exam', color: 'var(--primary-dark)' },
      { key: 'OTHER', label: 'Other', color: 'rgba(107, 114, 128, 0.9)' },
    ] as const;

    return typeMeta
      .map((item) => {
        const rows = manageSelectedStudent.fees.filter((fee) => fee.type === item.key);
        const totalAmount = rows.reduce((sum, fee) => sum + Number(fee.total ?? 0), 0);
        const paidAmount = rows.reduce((sum, fee) => sum + getFeePaidAmount(fee), 0);
        const pendingAmount = Math.max(totalAmount - paidAmount, 0);
        const share = selectedStudentFeeSummary.total ? (totalAmount / selectedStudentFeeSummary.total) * 100 : 0;

        return {
          ...item,
          count: rows.length,
          totalAmount,
          paidAmount,
          pendingAmount,
          share,
        };
      })
      .filter((item) => item.count > 0 || selectedStudentFeeSummary.total > 0);
  }, [manageSelectedStudent, selectedStudentFeeSummary.total]);

  const manageSelectedStudentCollectionSegments = useMemo(() => {
    const totalAmount = Math.max(selectedStudentFeeSummary.total, 0);
    if (!totalAmount) {
      return [];
    }

    const paidAmount = Math.max(selectedStudentFeeSummary.paid, 0);
    const remainingAmount = Math.max(selectedStudentFeeSummary.remaining, 0);
    const items = [
      { key: 'PAID', label: 'Paid', amount: paidAmount, color: 'var(--primary)' },
      { key: 'REMAINING', label: 'Remaining', amount: remainingAmount, color: 'var(--accent)' },
    ].filter((item) => item.amount > 0 || remainingAmount === 0);

    let startAngle = 0;
    return items.map((item) => {
      const sweepAngle = totalAmount ? (item.amount / totalAmount) * 360 : 0;
      const endAngle = startAngle + sweepAngle;
      const segment = {
        ...item,
        share: totalAmount ? (item.amount / totalAmount) * 100 : 0,
        startAngle,
        endAngle,
        path: describeArcPath(90, 90, 72, startAngle, endAngle),
      };
      startAngle = endAngle;
      return segment;
    });
  }, [selectedStudentFeeSummary.paid, selectedStudentFeeSummary.remaining, selectedStudentFeeSummary.total]);

  const activeStudentProfile = useMemo(() => {
    if (!activeStudentId) {
      return null;
    }
    return studentProfiles[activeStudentId] ?? null;
  }, [activeStudentId, studentProfiles]);

  const activeStudentClass = useMemo<ClassSection | null>(() => {
    if (!activeStudentProfile) {
      return null;
    }

    if (activeStudentProfile.classId) {
      return classes.find((cls) => cls.id === activeStudentProfile.classId) ?? (activeStudentProfile.class as ClassSection | null);
    }

    return activeStudentProfile.class as ClassSection | null;
  }, [activeStudentProfile, classes]);

  const activeStudentParents = useMemo<StudentParentProfile[]>(() => {
    return (activeStudentProfile?.parents ?? []).flatMap((item) => (item.parent ? [item.parent] : []));
  }, [activeStudentProfile]);

  const activeStudentPrimaryParent = useMemo(() => {
    return activeStudentParents[0] ?? null;
  }, [activeStudentParents]);

  const activeStudentFees = useMemo(() => {
    if (!activeStudentId) {
      return [];
    }
    return fees.filter((fee) => fee.studentId === activeStudentId);
  }, [activeStudentId, fees]);

  const activeStudentPayments = useMemo(() => {
    return activeStudentFees
      .flatMap((fee) =>
        (fee.payments ?? []).map((payment) => ({
          ...payment,
          fee,
        })),
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [activeStudentFees]);

  const activeStudentFeeSummary = useMemo(() => {
    const total = activeStudentFees.reduce((sum, fee) => sum + Number(fee.total ?? 0), 0);
    const paid = activeStudentFees.reduce(
      (sum, fee) =>
        sum +
        fee.payments
          .filter((payment) => payment.status === 'SUCCESS')
          .reduce((amountSum, payment) => amountSum + Number(payment.amount ?? 0), 0),
      0,
    );
    const remaining = Math.max(total - paid, 0);
    const collectionRate = total ? Math.round((paid / total) * 100) : 0;
    return {
      total,
      paid,
      remaining,
      collectionRate,
      feeCount: activeStudentFees.length,
      paymentCount: activeStudentPayments.length,
    };
  }, [activeStudentFees, activeStudentPayments]);

  const activeStudentFeeTypeBreakdown = useMemo(() => {
    const typeMeta = [
      { key: 'TUITION', label: 'Tuition', color: 'var(--primary)' },
      { key: 'BUS', label: 'Transport', color: 'var(--accent)' },
      { key: 'EXAM', label: 'Exam', color: 'var(--primary-dark)' },
      { key: 'OTHER', label: 'Other', color: 'rgba(107, 114, 128, 0.9)' },
    ] as const;

    return typeMeta.map((item) => {
      const rows = activeStudentFees.filter((fee) => fee.type === item.key);
      const totalAmount = rows.reduce((sum, fee) => sum + Number(fee.total ?? 0), 0);
      const paidAmount = rows.reduce((sum, fee) => sum + getFeePaidAmount(fee), 0);
      const pendingAmount = Math.max(totalAmount - paidAmount, 0);
      const share = activeStudentFeeSummary.total ? (totalAmount / activeStudentFeeSummary.total) * 100 : 0;

      return {
        ...item,
        count: rows.length,
        totalAmount,
        paidAmount,
        pendingAmount,
        share,
      };
    });
  }, [activeStudentFees, activeStudentFeeSummary.total]);

  const activeStudentCollectionSegments = useMemo(() => {
    const totalAmount = Math.max(activeStudentFeeSummary.total, 0);
    if (!totalAmount) {
      return [];
    }

    const paidAmount = Math.max(activeStudentFeeSummary.paid, 0);
    const remainingAmount = Math.max(activeStudentFeeSummary.remaining, 0);
    const items = [
      { key: 'PAID', label: 'Paid', amount: paidAmount, color: 'var(--primary)' },
      { key: 'REMAINING', label: 'Remaining', amount: remainingAmount, color: 'var(--accent)' },
    ].filter((item) => item.amount > 0 || remainingAmount === 0);

    let startAngle = 0;
    return items.map((item) => {
      const sweepAngle = totalAmount ? (item.amount / totalAmount) * 360 : 0;
      const endAngle = startAngle + sweepAngle;
      const segment = {
        ...item,
        share: totalAmount ? (item.amount / totalAmount) * 100 : 0,
        startAngle,
        endAngle,
        path: describeArcPath(110, 110, 82, startAngle, endAngle),
      };
      startAngle = endAngle;
      return segment;
    });
  }, [activeStudentFeeSummary.paid, activeStudentFeeSummary.remaining, activeStudentFeeSummary.total]);

  const activeStudentMarksRows = useMemo(() => {
    if (!activeStudentId) {
      return [];
    }

    const examLookup = new Map(exams.map((exam) => [exam.id, exam]));
    return marksRecords
      .filter((item) => item.studentId === activeStudentId)
      .map((item) => {
        const exam = examLookup.get(item.examId) ?? item.exam ?? null;
        const totalMarks = Number(exam?.totalMarks ?? item.exam?.totalMarks ?? 0);
        const marks = Number(item.marks ?? 0);
        const percent = totalMarks ? Math.min(Math.round((marks / totalMarks) * 100), 100) : 0;
        return {
          id: item.id,
          examName: exam?.name ?? `Exam ${item.examId}`,
          subjectName: subjects.find((subject) => subject.id === (exam?.subjectId ?? item.exam?.subjectId ?? -1))?.name ?? 'Subject',
          marks,
          totalMarks: totalMarks || 100,
          percent,
          examDate: exam?.examDate ?? null,
        };
      })
      .sort((a, b) => {
        const aTime = a.examDate ? new Date(a.examDate).getTime() : 0;
        const bTime = b.examDate ? new Date(b.examDate).getTime() : 0;
        return bTime - aTime || b.percent - a.percent;
      });
  }, [activeStudentId, exams, marksRecords, subjects]);

  const activeStudentMarksSummary = useMemo(() => {
    const totalExams = activeStudentMarksRows.length;
    const average = totalExams ? Math.round(activeStudentMarksRows.reduce((sum, row) => sum + row.percent, 0) / totalExams) : 0;
    const best = totalExams ? Math.max(...activeStudentMarksRows.map((row) => row.percent)) : 0;
    const latest = activeStudentMarksRows[0] ?? null;
    return { totalExams, average, best, latest };
  }, [activeStudentMarksRows]);

  const parentLinkedStudents = useMemo<ParentStudentRow[]>(() => {
    const parentId = user.parent?.id ?? null;
    if (!parentId) {
      return [];
    }

    const studentMap = new Map<number, ParentStudentRow>();

    classes.forEach((cls) => {
      const classStudents = cls.students ?? [];
      const classSessions = cls.attendanceSessions ?? [];

      classStudents.forEach((student) => {
        const isLinked = (student.parents ?? []).some((item) => item.parent?.id === parentId);
        if (!isLinked) {
          return;
        }

        const studentFees = fees.filter((fee) => fee.studentId === student.id);
        const totalFees = studentFees.reduce((sum, fee) => sum + Number(fee.total ?? 0), 0);
        const paidFees = studentFees.reduce(
          (sum, fee) =>
            sum +
            fee.payments
              .filter((payment) => payment.status === 'SUCCESS')
              .reduce((amountSum, payment) => amountSum + Number(payment.amount ?? 0), 0),
          0,
        );
        const remainingFees = Math.max(totalFees - paidFees, 0);

        const studentMarks = marksRecords.filter((mark) => mark.studentId === student.id);
        const markRows = studentMarks
          .map((mark) => {
            const exam = mark.exam ?? null;
            const totalMarks = Number(exam?.totalMarks ?? 0);
            const percent = totalMarks ? Math.min(Math.round((Number(mark.marks ?? 0) / totalMarks) * 100), 100) : 0;
            return {
              ...mark,
              examName: exam?.name ?? `Exam ${mark.examId}`,
              percent,
              examDate: exam?.examDate ? new Date(exam.examDate).getTime() : 0,
            };
          })
          .sort((a, b) => b.examDate - a.examDate || b.percent - a.percent);

        const averageMarks = markRows.length
          ? Math.round(markRows.reduce((sum, row) => sum + row.percent, 0) / markRows.length)
          : 0;
        const bestMarks = markRows.length ? Math.max(...markRows.map((row) => row.percent)) : 0;
        const latestMark = markRows[0] ?? null;

        let attendancePresent = 0;
        let attendanceAbsent = 0;
        classSessions.forEach((session) => {
          const record = (session.attendances ?? []).find((item) => item.studentId === student.id);
          if (!record) {
            return;
          }
          if (record.status === 'PRESENT') {
            attendancePresent += 1;
          } else {
            attendanceAbsent += 1;
          }
        });
        const attendanceTotal = attendancePresent + attendanceAbsent;
        const attendancePercent = attendanceTotal ? Math.round((attendancePresent / attendanceTotal) * 100) : null;

        const guardianName = (student.parents ?? []).find((item) => item.parent)?.parent?.name ?? null;

        studentMap.set(student.id, {
          id: student.id,
          name: student.name,
          admissionno: student.admissionno,
          gender: student.gender ?? null,
          dob: student.dob ?? null,
          classId: cls.id,
          className: cls.name,
          section: cls.section,
          teacherName: cls.teacher?.name ?? null,
          teacherEmail: cls.teacher?.user?.email ?? null,
          totalFees,
          paidFees,
          remainingFees,
          feeCount: studentFees.length,
          averageMarks,
          bestMarks,
          latestExamName: latestMark?.examName ?? null,
          latestExamPercent: latestMark?.percent ?? 0,
          attendanceTotal,
          attendancePresent,
          attendanceAbsent,
          attendancePercent,
          guardianCount: (student.parents ?? []).filter((item) => item.parent).length,
          primaryGuardianName: guardianName,
        });
      });
    });

    return Array.from(studentMap.values()).sort((a, b) => {
      const classCompare = a.className.localeCompare(b.className);
      if (classCompare !== 0) return classCompare;
      return a.name.localeCompare(b.name);
    });
  }, [classes, fees, marksRecords, user.parent?.id]);

  const activeParentStudentRow = useMemo(() => {
    if (!activeParentStudentId) {
      return parentLinkedStudents[0] ?? null;
    }
    return parentLinkedStudents.find((student) => student.id === activeParentStudentId) ?? null;
  }, [activeParentStudentId, parentLinkedStudents]);

  const activeParentStudentDetail = useMemo(() => {
    if (!activeParentStudentRow) {
      return null;
    }
    return studentProfiles[activeParentStudentRow.id] ?? null;
  }, [activeParentStudentRow, studentProfiles]);

  const activeParentStudentFeeDetails = useMemo(() => {
    return activeParentStudentDetail?.feeDetails ?? [];
  }, [activeParentStudentDetail]);

  const activeParentStudentMarkDetails = useMemo(() => {
    return activeParentStudentDetail?.marks ?? [];
  }, [activeParentStudentDetail]);

  const activeParentStudentClass = useMemo(() => {
    if (!activeParentStudentRow) {
      return null;
    }
    return activeParentStudentDetail?.class ?? classes.find((cls) => cls.id === activeParentStudentRow.classId) ?? null;
  }, [activeParentStudentDetail, activeParentStudentRow, classes]);

  const activeParentStudentGuardianProfiles = useMemo<StudentParentProfile[]>(() => {
    return (activeParentStudentDetail?.parents ?? []).flatMap((item) => (item.parent ? [item.parent] : []));
  }, [activeParentStudentDetail]);

  const activeParentStudentSummary = useMemo(() => {
    const feeTotal = activeParentStudentFeeDetails.reduce((sum, fee) => sum + Number(fee.total ?? 0), 0);
    const feePaid = activeParentStudentFeeDetails.reduce(
      (sum, fee) =>
        sum +
        (fee.totalPaid ??
          (fee.payments ?? []).filter((payment) => payment.status === 'SUCCESS').reduce((paymentSum, payment) => paymentSum + Number(payment.amount ?? 0), 0)),
      0,
    );
    const feeRemaining = activeParentStudentFeeDetails.reduce(
      (sum, fee) => sum + Number(fee.remaining ?? Math.max(Number(fee.total ?? 0) - Number(fee.totalPaid ?? 0), 0)),
      0,
    );
    const markRows = activeParentStudentMarkDetails
      .map((mark) => {
        const exam = mark.exam ?? null;
        const totalMarks = Number(exam?.totalMarks ?? 0);
        const percent = totalMarks ? Math.min(Math.round((Number(mark.marks ?? 0) / totalMarks) * 100), 100) : 0;
        return {
          ...mark,
          examName: exam?.name ?? `Exam ${mark.examId}`,
          subjectName: exam?.subject?.name ?? 'Subject',
          percent,
          examDate: exam?.examDate ? new Date(exam.examDate).getTime() : 0,
        };
      })
      .sort((a, b) => b.examDate - a.examDate || b.percent - a.percent);
    const averageMarks = markRows.length ? Math.round(markRows.reduce((sum, row) => sum + row.percent, 0) / markRows.length) : 0;
    const latestMark = markRows[0] ?? null;

    return {
      feeTotal,
      feePaid,
      feeRemaining,
      feeCount: activeParentStudentFeeDetails.length,
      markCount: markRows.length,
      averageMarks,
      latestMark,
    };
  }, [activeParentStudentFeeDetails, activeParentStudentMarkDetails]);

  const activeParentStudentExamRows = useMemo<ParentExamRow[]>(() => {
    if (!activeParentStudentDetail) {
      return [];
    }

    return (activeParentStudentDetail.marks ?? [])
      .map((mark) => {
        const exam = mark.exam ?? null;
        const totalMarks = Number(exam?.totalMarks ?? 0);
        const marks = Number(mark.marks ?? 0);
        const percent = totalMarks ? Math.min(Math.round((marks / totalMarks) * 100), 100) : 0;
        const band: ParentExamRow['band'] = percent >= 90 ? 'EXCELLENT' : percent >= 75 ? 'GOOD' : 'NEEDS_ATTENTION';

        return {
          id: mark.id,
          examId: mark.examId,
          examName: exam?.name ?? `Exam ${mark.examId}`,
          subjectName: exam?.subject?.name ?? 'Subject',
          className: exam?.class?.name ?? activeParentStudentRow?.className ?? 'Class',
          section: exam?.class?.section ?? activeParentStudentRow?.section ?? '',
          examDate: exam?.examDate ?? null,
          marks,
          totalMarks,
          percent,
          band,
        };
      })
      .sort((a, b) => {
        const aTime = a.examDate ? new Date(a.examDate).getTime() : 0;
        const bTime = b.examDate ? new Date(b.examDate).getTime() : 0;
        return bTime - aTime || b.percent - a.percent;
      });
  }, [activeParentStudentDetail, activeParentStudentRow?.className, activeParentStudentRow?.section]);

  const activeParentStudentFeeRows = useMemo<ParentFeeRow[]>(() => {
    if (!activeParentStudentDetail) {
      return [];
    }

    return (activeParentStudentDetail.feeDetails ?? [])
      .map((fee) => {
        const payments = fee.payments ?? [];
        const paid = fee.totalPaid ?? payments.filter((payment) => payment.status === 'SUCCESS').reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0);
        const total = Number(fee.total ?? 0);
        const remaining = fee.remaining ?? Math.max(total - Number(paid), 0);
        const status: ParentFeeRow['status'] = remaining <= 0 ? 'PAID' : Number(paid) > 0 ? 'PARTIAL' : 'PENDING';
        const latestPayment = payments[0] ?? null;

        return {
          id: fee.id,
          type: fee.type,
          academicYear: fee.academicYear,
          total,
          paid: Number(paid),
          remaining,
          status,
          paymentCount: payments.length,
          latestPaymentMethod: latestPayment?.method ?? null,
          latestPaymentStatus: latestPayment?.status ?? null,
          createdAt: fee.createdAt ?? null,
          updatedAt: fee.updatedAt ?? null,
        };
      })
      .sort((a, b) => {
        const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });
  }, [activeParentStudentDetail]);

  const activeParentStudentAttendanceRows = useMemo<ParentAttendanceRow[]>(() => {
    if (!activeParentStudentRow) {
      return [];
    }

    const studentClass = classes.find((cls) => cls.id === activeParentStudentRow.classId);
    const sessions = studentClass?.attendanceSessions ?? [];

    return sessions
      .flatMap((session) => {
        const record = (session.attendances ?? []).find((item) => item.studentId === activeParentStudentRow.id);
        if (!record) {
          return [];
        }

        const dateValue = session.date ?? null;
        const monthKey = dateValue ? new Date(dateValue).toISOString().slice(0, 7) : 'unknown';

        return [
          {
            sessionId: session.id,
            date: dateValue,
            className: studentClass?.name ?? activeParentStudentRow.className,
            section: studentClass?.section ?? activeParentStudentRow.section,
            status: record.status,
            takenBy: session.takenBy?.name ?? 'N/A',
            monthKey,
          },
        ];
      })
      .sort((a, b) => {
        const aTime = a.date ? new Date(a.date).getTime() : 0;
        const bTime = b.date ? new Date(b.date).getTime() : 0;
        return bTime - aTime;
      });
  }, [activeParentStudentRow, classes]);

  const activeParentStudentAttendanceSummary = useMemo(() => {
    const total = activeParentStudentAttendanceRows.length;
    const present = activeParentStudentAttendanceRows.filter((row) => row.status === 'PRESENT').length;
    const absent = activeParentStudentAttendanceRows.filter((row) => row.status === 'ABSENT').length;
    const percent = total ? Math.round((present / total) * 100) : 0;

    return {
      total,
      present,
      absent,
      percent,
      latest: activeParentStudentAttendanceRows[0] ?? null,
    };
  }, [activeParentStudentAttendanceRows]);

  const parentExamSubjectOptions = useMemo(() => {
    return Array.from(new Set(activeParentStudentExamRows.map((row) => row.subjectName))).sort((a, b) => a.localeCompare(b));
  }, [activeParentStudentExamRows]);

  const parentFeeYearOptions = useMemo(() => {
    return Array.from(new Set(activeParentStudentFeeRows.map((row) => row.academicYear))).sort((a, b) => b.localeCompare(a));
  }, [activeParentStudentFeeRows]);

  const parentAttendanceMonthOptions = useMemo(() => {
    return Array.from(new Set(activeParentStudentAttendanceRows.map((row) => row.monthKey).filter((value) => value !== 'unknown'))).sort(
      (a, b) => b.localeCompare(a),
    );
  }, [activeParentStudentAttendanceRows]);

  const filteredParentExamRows = useMemo(() => {
    const query = parentExamSearch.trim().toLowerCase();
    return activeParentStudentExamRows
      .filter((row) => {
        const matchesQuery =
          !query ||
          [row.examName, row.subjectName, row.className, row.section, String(row.marks), String(row.totalMarks), row.examDate ?? '']
            .join(' ')
            .toLowerCase()
            .includes(query);
        const matchesSubject = parentExamSubjectFilter === 'ALL' || row.subjectName === parentExamSubjectFilter;
        const matchesBand = parentExamBandFilter === 'ALL' || row.band === parentExamBandFilter;
        return matchesQuery && matchesSubject && matchesBand;
      })
      .sort((a, b) => {
        if (parentExamSort === 'highest') return b.percent - a.percent || b.marks - a.marks;
        if (parentExamSort === 'lowest') return a.percent - b.percent || a.marks - b.marks;
        const aTime = a.examDate ? new Date(a.examDate).getTime() : 0;
        const bTime = b.examDate ? new Date(b.examDate).getTime() : 0;
        return bTime - aTime || b.percent - a.percent;
      });
  }, [activeParentStudentExamRows, parentExamBandFilter, parentExamSearch, parentExamSort, parentExamSubjectFilter]);

  const filteredParentFeeRows = useMemo(() => {
    const query = parentFeeSearch.trim().toLowerCase();
    return activeParentStudentFeeRows
      .filter((row) => {
        const matchesQuery =
          !query ||
          [row.type, row.academicYear, row.status, String(row.total), String(row.paid), String(row.remaining)]
            .join(' ')
            .toLowerCase()
            .includes(query);
        const matchesType = parentFeeTypeFilter === 'ALL' || row.type === parentFeeTypeFilter;
        const matchesStatus = parentFeeStatusFilter === 'ALL' || row.status === parentFeeStatusFilter;
        const matchesYear = parentFeeYearFilter === 'ALL' || row.academicYear === parentFeeYearFilter;
        return matchesQuery && matchesType && matchesStatus && matchesYear;
      })
      .sort((a, b) => {
        if (parentFeeSort === 'paid') return b.paid - a.paid || a.remaining - b.remaining;
        if (parentFeeSort === 'remaining') return b.remaining - a.remaining || b.paid - a.paid;
        const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });
  }, [activeParentStudentFeeRows, parentFeeSearch, parentFeeSort, parentFeeStatusFilter, parentFeeTypeFilter, parentFeeYearFilter]);

  const filteredParentAttendanceRows = useMemo(() => {
    const query = parentAttendanceSearch.trim().toLowerCase();
    return activeParentStudentAttendanceRows
      .filter((row) => {
        const matchesQuery =
          !query ||
          [row.className, row.section, row.takenBy, row.status, formatDisplayDate(row.date), row.monthKey]
            .join(' ')
            .toLowerCase()
            .includes(query);
        const matchesStatus = parentAttendanceStatusFilter === 'ALL' || row.status === parentAttendanceStatusFilter;
        const matchesMonth = parentAttendanceMonthFilter === 'ALL' || row.monthKey === parentAttendanceMonthFilter;
        return matchesQuery && matchesStatus && matchesMonth;
      })
      .sort((a, b) => {
        const aTime = a.date ? new Date(a.date).getTime() : 0;
        const bTime = b.date ? new Date(b.date).getTime() : 0;
        return parentAttendanceSort === 'oldest' ? aTime - bTime : bTime - aTime;
      });
  }, [activeParentStudentAttendanceRows, parentAttendanceMonthFilter, parentAttendanceSearch, parentAttendanceSort, parentAttendanceStatusFilter]);

  const filteredParentStudents = useMemo(() => {
    const query = parentStudentSearch.trim().toLowerCase();
    if (!query) {
      return parentLinkedStudents;
    }

    return parentLinkedStudents.filter((student) => {
      const searchText = [
        student.name,
        student.admissionno ?? '',
        student.className,
        student.section,
        student.teacherName ?? '',
        student.primaryGuardianName ?? '',
      ]
        .join(' ')
        .toLowerCase();
      return searchText.includes(query);
    });
  }, [parentLinkedStudents, parentStudentSearch]);

  const parentTotals = useMemo(() => {
    const totalFees = parentLinkedStudents.reduce((sum, student) => sum + student.totalFees, 0);
    const totalPaid = parentLinkedStudents.reduce((sum, student) => sum + student.paidFees, 0);
    const totalRemaining = parentLinkedStudents.reduce((sum, student) => sum + student.remainingFees, 0);
    const avgMarks = parentLinkedStudents.length
      ? Math.round(parentLinkedStudents.reduce((sum, student) => sum + student.averageMarks, 0) / parentLinkedStudents.length)
      : 0;
    const attendanceStudents = parentLinkedStudents.filter((student) => student.attendancePercent !== null);
    const attendancePercent = attendanceStudents.length
      ? Math.round(attendanceStudents.reduce((sum, student) => sum + (student.attendancePercent ?? 0), 0) / attendanceStudents.length)
      : 0;
    const classCount = new Set(parentLinkedStudents.map((student) => `${student.className}-${student.section}`)).size;

    return {
      totalFees,
      totalPaid,
      totalRemaining,
      avgMarks,
      attendancePercent,
      classCount,
    };
  }, [parentLinkedStudents]);

  useEffect(() => {
    if (user.role !== 'PARENT') {
      return;
    }

    if (!parentLinkedStudents.length) {
      setActiveParentStudentId(null);
      return;
    }

    setActiveParentStudentId((current) => {
      if (current && parentLinkedStudents.some((student) => student.id === current)) {
        return current;
      }
      return parentLinkedStudents[0]?.id ?? null;
    });
  }, [parentLinkedStudents, user.role]);

  useEffect(() => {
    if (user.role !== 'PARENT' || !activeParentStudentRow) {
      return;
    }

    if (studentProfiles[activeParentStudentRow.id]) {
      return;
    }

    let cancelled = false;
    setParentDetailLoading(true);
    loadStudentProfile(activeParentStudentRow.id).finally(() => {
      if (!cancelled) {
        setParentDetailLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [activeParentStudentRow, loadStudentProfile, studentProfiles, user.role]);

  useEffect(() => {
    if (user.role === 'PARENT') {
      setParentDashboardTab('overview');
    }
  }, [activeParentStudentRow?.id, user.role]);

  const existingMarksByStudent = useMemo(() => {
    const map = new Map<number, number>();
    if (!selectedMarksExamId) {
      return map;
    }

    marksRecords
      .filter((item) => item.examId === selectedMarksExamId)
      .forEach((item) => {
        map.set(item.studentId, item.marks);
      });
    return map;
  }, [marksRecords, selectedMarksExamId]);

  useEffect(() => {
    setSelectedMarksSubjectId(null);
    setSelectedMarksExamId(null);
    setMarksDraft({});
    setMarksErrors({});
  }, [selectedMarksClassId]);

  useEffect(() => {
    setSelectedMarksExamId(null);
    setMarksDraft({});
    setMarksErrors({});
  }, [selectedMarksSubjectId]);

  useEffect(() => {
    if (!selectedMarksClassId || !selectedMarksExamId) {
      setMarksDraft({});
      setMarksErrors({});
      return;
    }

    const classObj = classes.find((cls) => cls.id === selectedMarksClassId);
    const students = classObj?.students ?? [];
    const existingMarks = marksRecords.filter((item) => item.examId === selectedMarksExamId);
    const nextDraft: Record<number, string> = {};

    students.forEach((student) => {
      const existing = existingMarks.find((mark) => mark.studentId === student.id);
      nextDraft[student.id] = existing ? String(existing.marks) : '';
    });

    setMarksDraft(nextDraft);
    setMarksErrors({});
  }, [selectedMarksClassId, selectedMarksExamId, classes, marksRecords]);

  const saveBulkMarks = async () => {
    if (!canManageMarks) {
      toast.error('You are not authorized to manage marks.');
      return;
    }

    if (!selectedMarksClassId || !selectedMarksSubjectId || !selectedMarksExamId || !selectedMarksExam) {
      toast.error('Select Class, Subject, and Exam before saving marks.');
      return;
    }

    const totalMarks = Number(selectedMarksExam.totalMarks ?? 0);
    if (!totalMarks || totalMarks <= 0) {
      toast.error('Selected exam has invalid total marks.');
      return;
    }

    const nextErrors: Record<number, string> = {};
    const payload: Array<{ examId: number; studentId: number; marks: number }> = [];

    marksStudentRows.forEach((student) => {
      const raw = (marksDraft[student.id] ?? '').trim();

      if (!raw) {
        return;
      }

      if (!/^\d+$/.test(raw)) {
        nextErrors[student.id] = 'Only numeric marks allowed.';
        return;
      }

      const numeric = Number(raw);
      if (numeric < 0) {
        nextErrors[student.id] = 'Marks cannot be negative.';
        return;
      }

      if (numeric > totalMarks) {
        nextErrors[student.id] = `Cannot exceed ${totalMarks}.`;
        return;
      }

      payload.push({
        examId: selectedMarksExamId,
        studentId: student.id,
        marks: numeric,
      });
    });

    setMarksErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error('Please fix validation errors before saving.');
      return;
    }

    if (payload.length === 0) {
      toast.info('No marks entered to update.');
      return;
    }

    setMarksSaving(true);
    try {
      const outcomes = await Promise.all(
        payload.map(async (item) => {
          const response = await fetch(`${API_BASE}/class/create-marks`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(item),
          });
          const result = await readJson<{ message?: string }>(response);
          return { ok: response.ok, message: result?.message ?? (response.ok ? 'Saved' : 'Failed') };
        }),
      );

      const failed = outcomes.filter((item) => !item.ok);
      if (failed.length > 0) {
        toast.error(failed[0].message || 'Some marks failed to save.');
        return;
      }

      toast.success(`Marks saved successfully for ${payload.length} students.`);
      await loadMarksModuleData();
    } catch {
      toast.error('Network error while saving marks.');
    } finally {
      setMarksSaving(false);
    }
  };

  const renderParentDashboard = () => {
    const selectedStudent = activeParentStudentRow;
    const selectedDetail = activeParentStudentDetail;
    const selectedClass = activeParentStudentClass;
    const attendancePercent = selectedStudent?.attendancePercent ?? null;
    const selectedGuardian = selectedStudent?.primaryGuardianName ?? selectedDetail?.parents?.[0]?.parent?.name ?? 'N/A';
    const parentDashboardSections: Array<{ key: ParentDashboardTab; label: string; count?: number }> = [
      { key: 'overview', label: 'Overview' },
      { key: 'exams', label: 'Exams', count: activeParentStudentExamRows.length },
      { key: 'fees', label: 'Fees', count: activeParentStudentFeeRows.length },
      { key: 'attendance', label: 'Attendance', count: activeParentStudentAttendanceRows.length },
    ];

    return (
      <section className="parent-dashboard-shell">
        <div className="parent-mobile-toolbar">
          <div className="parent-mobile-toolbar-copy">
            <p className="section-eyebrow">Parent portal</p>
            <strong>{selectedStudent?.name ?? 'Select a student'}</strong>
            <span>{parentDashboardSections.find((section) => section.key === parentDashboardTab)?.label ?? 'Overview'}</span>
          </div>
          <button
            type="button"
            className="parent-mobile-menu-btn"
            aria-expanded={parentMobileMenuOpen}
            aria-controls="parent-mobile-drawer"
            onClick={() => setParentMobileMenuOpen((current) => !current)}
          >
            <LuMenu />
            Menu
          </button>
        </div>

        {parentMobileMenuOpen ? (
          <div className="parent-mobile-drawer-backdrop" role="presentation" onClick={() => setParentMobileMenuOpen(false)}>
            <aside
              id="parent-mobile-drawer"
              className="parent-mobile-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Parent dashboard menu"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="parent-mobile-drawer-head">
                <div>
                  <p className="section-eyebrow">Menu</p>
                  <h3>Choose content</h3>
                  <p>Switch the student or jump to a dashboard section.</p>
                </div>
                <button type="button" className="parent-mobile-drawer-close" onClick={() => setParentMobileMenuOpen(false)}>
                  <LuX />
                </button>
              </div>

              <label className="parent-rail-search parent-mobile-search">
                <LuSearch />
                <input
                  type="text"
                  placeholder="Search child, class, admission no..."
                  value={parentStudentSearch}
                  onChange={(event) => setParentStudentSearch(event.target.value)}
                />
              </label>

              <div className="parent-mobile-section-group">
                <p className="parent-mobile-section-title">Sections</p>
                <div className="parent-mobile-section-list">
                  {parentDashboardSections.map((section) => (
                    <button
                      key={section.key}
                      type="button"
                      className={parentDashboardTab === section.key ? 'active' : ''}
                      onClick={() => {
                        setParentDashboardTab(section.key);
                        setParentMobileMenuOpen(false);
                      }}
                    >
                      <span>{section.label}</span>
                      {typeof section.count === 'number' ? <strong>{section.count}</strong> : null}
                    </button>
                  ))}
                </div>
              </div>

              <div className="parent-mobile-section-group parent-mobile-student-group">
                <p className="parent-mobile-section-title">Linked students</p>
                <div className="parent-mobile-student-list">
                  {parentDashboardLoading ? (
                    <div className="class-loader-wrap parent-dashboard-loader">
                      <div className="class-loader" role="status" aria-live="polite">
                        <span className="loader-ring outer" />
                        <span className="loader-ring inner" />
                        <img src={logo} alt="IDPS logo loading" />
                      </div>
                      <p>Loading your family dashboard...</p>
                    </div>
                  ) : filteredParentStudents.length === 0 ? (
                    <div className="parent-empty-state">
                      <LuUserRoundCheck />
                      <h4>No linked students yet</h4>
                      <p>Once the school connects a child to your parent account, their record will appear here automatically.</p>
                    </div>
                  ) : (
                    filteredParentStudents.map((student) => {
                      const isActive = student.id === selectedStudent?.id;
                      return (
                        <button
                          key={student.id}
                          type="button"
                          className={isActive ? 'parent-student-card active' : 'parent-student-card'}
                          onClick={() => {
                            setActiveParentStudentId(student.id);
                            setParentMobileMenuOpen(false);
                          }}
                        >
                          <div className="parent-student-card-head">
                            <div className="parent-student-avatar">{student.name.trim().charAt(0).toUpperCase()}</div>
                            <div className="parent-student-card-copy">
                              <h4>{student.name}</h4>
                              <p>
                                {student.className} - {student.section}
                              </p>
                            </div>
                            <LuChevronRight />
                          </div>

                          <div className="parent-student-card-chips">
                            <span>{formatAgeFromDob(student.dob)}</span>
                            <span>{student.gender ?? 'N/A'}</span>
                          </div>

                          <div className="parent-student-card-metrics">
                            <div>
                              <span>Fees due</span>
                              <strong>{formatInr(student.remainingFees)}</strong>
                            </div>
                            <div>
                              <span>Marks</span>
                              <strong>{student.averageMarks}%</strong>
                            </div>
                            <div>
                              <span>Attendance</span>
                              <strong>{student.attendancePercent ?? 0}%</strong>
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </aside>
          </div>
        ) : null}

        <header className="parent-dashboard-hero">
          <div className="parent-dashboard-hero-copy">
            <p className="section-eyebrow">Parent portal</p>
            <h2>Everything your family needs, in one calm dashboard.</h2>
            <p className="parent-dashboard-subtitle">
              Start with the children linked to your account, then open any profile to see identity, academics, fees, and
              guardian details pulled straight from the backend.
            </p>
            <div className="parent-dashboard-chip-row">
              <span>
                <LuUsers />
                {parentTotals.classCount} class{parentTotals.classCount === 1 ? '' : 'es'}
              </span>
              <span>
                <LuCircleDollarSign />
                {formatInr(parentTotals.totalRemaining)} due
              </span>
              <span>
                <LuGauge />
                {parentTotals.avgMarks}% avg marks
              </span>
            </div>
          </div>

          <div className="parent-dashboard-hero-card">
            <div className="parent-dashboard-hero-card-top">
              <div className="parent-dashboard-hero-user">
                <div className="parent-dashboard-avatar">
                  <span>{user.name.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <p className="parent-dashboard-card-label">Parent account</p>
                  <h3>{user.name}</h3>
                  <p>{user.email}</p>
                </div>
              </div>

              <button type="button" className="parent-dashboard-logout-btn" onClick={onLogout}>
                <LuLogOut />
                Logout
              </button>
            </div>
            <div className="parent-dashboard-hero-metrics">
              <div>
                <span>Children</span>
                <strong>{parentLinkedStudents.length}</strong>
              </div>
              <div>
                <span>Total paid</span>
                <strong>{formatInr(parentTotals.totalPaid)}</strong>
              </div>
              <div>
                <span>Attendance</span>
                <strong>{parentTotals.attendancePercent}%</strong>
              </div>
            </div>
            <div className="parent-dashboard-hero-footer">
              <div>
                <span>Family snapshot</span>
                <strong>{parentLinkedStudents.length} linked student{parentLinkedStudents.length === 1 ? '' : 's'}</strong>
              </div>
              <div>
                <span>Classes</span>
                <strong>{parentTotals.classCount}</strong>
              </div>
              <div>
                <span>Balance</span>
                <strong>{formatInr(parentTotals.totalRemaining)}</strong>
              </div>
            </div>
          </div>
        </header>

        <section className="parent-dashboard-grid">
          <aside className="parent-student-rail">
            <div className="parent-student-rail-head">
              <div>
                <p className="section-eyebrow">Linked students</p>
                <h3>{filteredParentStudents.length} record{filteredParentStudents.length === 1 ? '' : 's'}</h3>
              </div>
              <label className="parent-rail-search">
                <LuSearch />
                <input
                  type="text"
                  placeholder="Search child, class, admission no..."
                  value={parentStudentSearch}
                  onChange={(event) => setParentStudentSearch(event.target.value)}
                />
              </label>
            </div>

            <div className="parent-student-list">
              {parentDashboardLoading ? (
                <div className="class-loader-wrap parent-dashboard-loader">
                  <div className="class-loader" role="status" aria-live="polite">
                    <span className="loader-ring outer" />
                    <span className="loader-ring inner" />
                    <img src={logo} alt="IDPS logo loading" />
                  </div>
                  <p>Loading your family dashboard...</p>
                </div>
              ) : filteredParentStudents.length === 0 ? (
                <div className="parent-empty-state">
                  <LuUserRoundCheck />
                  <h4>No linked students yet</h4>
                  <p>Once the school connects a child to your parent account, their record will appear here automatically.</p>
                </div>
              ) : (
                filteredParentStudents.map((student) => {
                  const isActive = student.id === selectedStudent?.id;
                  return (
                    <button
                      key={student.id}
                      type="button"
                      className={isActive ? 'parent-student-card active' : 'parent-student-card'}
                      onClick={() => setActiveParentStudentId(student.id)}
                    >
                      <div className="parent-student-card-head">
                        <div className="parent-student-avatar">
                          {student.name.trim().charAt(0).toUpperCase()}
                        </div>
                        <div className="parent-student-card-copy">
                          <h4>{student.name}</h4>
                          <p>
                            {student.className} - {student.section}
                          </p>
                        </div>
                        <LuChevronRight />
                      </div>

                      <div className="parent-student-card-chips">
                        <span>{formatAgeFromDob(student.dob)}</span>
                        <span>{student.gender ?? 'N/A'}</span>
                      </div>

                      <div className="parent-student-card-metrics">
                        <div>
                          <span>Fees due</span>
                          <strong>{formatInr(student.remainingFees)}</strong>
                        </div>
                        <div>
                          <span>Marks</span>
                          <strong>{student.averageMarks}%</strong>
                        </div>
                        <div>
                          <span>Attendance</span>
                          <strong>{student.attendancePercent ?? 0}%</strong>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          <section className="parent-student-workspace">
            {!selectedStudent ? (
              <div className="parent-empty-state parent-empty-state-large">
                <LuBookOpen />
                <h4>Select a child to continue</h4>
                <p>We will open their complete academic profile, fees, attendance, and parent-linked details here.</p>
              </div>
            ) : (
              <>
                <header className="parent-student-hero">
                  <div className="parent-student-hero-left">
                    <div className="parent-student-hero-avatar">
                      <span>{selectedStudent.name.trim().charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="section-eyebrow">Student overview</p>
                      <h3>{selectedStudent.name}</h3>
                      <p>
                        Admission no. {selectedStudent.admissionno ?? 'N/A'} · {selectedStudent.className} - {selectedStudent.section}
                      </p>
                    </div>
                  </div>
                  <div className="parent-student-hero-actions">
                    <span className="parent-status-pill">
                      <LuUserRoundCheck />
                      Linked to {selectedGuardian}
                    </span>
                    <span className="parent-status-pill soft">
                      <LuCalendarRange />
                      {selectedDetail?.dob ? formatDisplayDate(selectedDetail.dob) : formatDisplayDate(selectedStudent.dob)}
                    </span>
                  </div>
                </header>

                <div className="parent-student-stat-grid">
                  <article className="parent-stat-card">
                    <span>Total fees</span>
                    <strong>{formatInr(activeParentStudentSummary.feeTotal)}</strong>
                  </article>
                  <article className="parent-stat-card">
                    <span>Paid</span>
                    <strong>{formatInr(activeParentStudentSummary.feePaid)}</strong>
                  </article>
                  <article className="parent-stat-card">
                    <span>Balance</span>
                    <strong>{formatInr(activeParentStudentSummary.feeRemaining)}</strong>
                  </article>
                  <article className="parent-stat-card">
                    <span>Marks average</span>
                    <strong>{activeParentStudentSummary.averageMarks}%</strong>
                  </article>
                  <article className="parent-stat-card">
                    <span>Attendance</span>
                    <strong>{attendancePercent === null ? 'N/A' : `${attendancePercent}%`}</strong>
                  </article>
                </div>

                {parentDetailLoading && !selectedDetail ? (
                  <div className="parent-detail-loading">
                    <div className="class-loader" role="status" aria-live="polite">
                      <span className="loader-ring outer" />
                      <span className="loader-ring inner" />
                      <img src={logo} alt="IDPS logo loading" />
                    </div>
                    <p>Loading complete student record...</p>
                  </div>
                ) : null}

                <div className="parent-dashboard-tabs">
                  <div className="parent-tab-switch" role="tablist" aria-label="Parent student sections">
                    <button
                      type="button"
                      className={parentDashboardTab === 'overview' ? 'active' : ''}
                      onClick={() => setParentDashboardTab('overview')}
                    >
                      Overview
                    </button>
                    <button
                      type="button"
                      className={parentDashboardTab === 'exams' ? 'active' : ''}
                      onClick={() => setParentDashboardTab('exams')}
                    >
                      Exams <span>{activeParentStudentExamRows.length}</span>
                    </button>
                    <button
                      type="button"
                      className={parentDashboardTab === 'fees' ? 'active' : ''}
                      onClick={() => setParentDashboardTab('fees')}
                    >
                      Fees <span>{activeParentStudentFeeRows.length}</span>
                    </button>
                    <button
                      type="button"
                      className={parentDashboardTab === 'attendance' ? 'active' : ''}
                      onClick={() => setParentDashboardTab('attendance')}
                    >
                      Attendance <span>{activeParentStudentAttendanceRows.length}</span>
                    </button>
                  </div>

                  {parentDashboardTab === 'overview' ? (
                    <div className="parent-student-detail-grid">
                      <article className="parent-detail-card parent-detail-card-wide">
                        <header>
                          <div>
                            <p className="section-eyebrow">Identity</p>
                            <h4>Student details</h4>
                          </div>
                          <LuBookCopy />
                        </header>
                        <div className="parent-detail-specs">
                          <div>
                            <span>Name</span>
                            <strong>{selectedDetail?.name ?? selectedStudent.name}</strong>
                          </div>
                          <div>
                            <span>Admission no</span>
                            <strong>{selectedDetail?.admissionno ?? selectedStudent.admissionno ?? 'N/A'}</strong>
                          </div>
                          <div>
                            <span>Gender</span>
                            <strong>{selectedDetail?.gender ?? selectedStudent.gender ?? 'N/A'}</strong>
                          </div>
                          <div>
                            <span>DOB</span>
                            <strong>{formatDisplayDate(selectedDetail?.dob ?? selectedStudent.dob)}</strong>
                          </div>
                          <div>
                            <span>Age</span>
                            <strong>{formatAgeFromDob(selectedDetail?.dob ?? selectedStudent.dob)}</strong>
                          </div>
                          <div>
                            <span>Aadhaar</span>
                            <strong>{selectedDetail?.adharnumber ?? 'N/A'}</strong>
                          </div>
                          <div>
                            <span>Blood group</span>
                            <strong>{selectedDetail?.bloodgroup ?? 'N/A'}</strong>
                          </div>
                          <div>
                            <span>Mother tongue</span>
                            <strong>{selectedDetail?.mothertongue ?? 'N/A'}</strong>
                          </div>
                          <div>
                            <span>Category</span>
                            <strong>{selectedDetail?.socialcategory ?? 'N/A'}</strong>
                          </div>
                          <div>
                            <span>Height</span>
                            <strong>{selectedDetail?.height ? `${selectedDetail.height} cm` : 'N/A'}</strong>
                          </div>
                          <div>
                            <span>Weight</span>
                            <strong>{selectedDetail?.weight ? `${selectedDetail.weight} kg` : 'N/A'}</strong>
                          </div>
                          <div className="parent-detail-span">
                            <span>Address</span>
                            <strong>{selectedDetail?.address ?? 'N/A'}</strong>
                          </div>
                          <div>
                            <span>Pincode</span>
                            <strong>{selectedDetail?.pincode ?? 'N/A'}</strong>
                          </div>
                        </div>
                      </article>

                      <article className="parent-detail-card parent-detail-card-wide">
                        <header>
                          <div>
                            <p className="section-eyebrow">Academics</p>
                            <h4>Class and school context</h4>
                          </div>
                          <LuGraduationCap />
                        </header>
                        <div className="parent-detail-specs">
                          <div>
                            <span>Class</span>
                            <strong>
                              {selectedClass ? `${selectedClass.name} - ${selectedClass.section}` : `${selectedStudent.className} - ${selectedStudent.section}`}
                            </strong>
                          </div>
                          <div>
                            <span>Class teacher</span>
                            <strong>{selectedClass?.teacher?.name ?? selectedStudent.teacherName ?? 'N/A'}</strong>
                          </div>
                          <div>
                            <span>Teacher email</span>
                            <strong>{selectedClass?.teacher?.user?.email ?? selectedStudent.teacherEmail ?? 'N/A'}</strong>
                          </div>
                          <div>
                            <span>Admission date</span>
                            <strong>{formatDisplayDate(selectedDetail?.admissiondate)}</strong>
                          </div>
                          <div>
                            <span>Created</span>
                            <strong>{formatDisplayDate(selectedDetail?.createdAt)}</strong>
                          </div>
                          <div>
                            <span>Updated</span>
                            <strong>{formatDisplayDate(selectedDetail?.updatedAt)}</strong>
                          </div>
                        </div>
                      </article>

                      <article className="parent-detail-card parent-detail-card-wide">
                        <header>
                          <div>
                            <p className="section-eyebrow">Guardians</p>
                            <h4>Parent information</h4>
                          </div>
                          <LuUsers />
                        </header>
                        <div
                          className={
                            activeParentStudentGuardianProfiles.length >= 2
                              ? 'parent-guardian-stack two-up'
                              : 'parent-guardian-stack'
                          }
                        >
                          {activeParentStudentGuardianProfiles.length === 0 ? (
                            <p className="parent-empty-copy">No guardian details returned by the backend yet.</p>
                          ) : (
                            activeParentStudentGuardianProfiles.map((guardian) => (
                              <article key={guardian.id} className="parent-guardian-card">
                                <div className="parent-guardian-head">
                                  <div>
                                    <strong>{guardian.name}</strong>
                                    <p>
                                      {guardian.relation ?? 'Relation N/A'}
                                      {guardian.type ? ` · ${guardian.type}` : ''}
                                    </p>
                                  </div>
                                  <span>{guardian.type ?? 'N/A'}</span>
                                </div>
                                <div className="parent-detail-specs parent-detail-specs-compact">
                                  <div>
                                    <span>Phone 1</span>
                                    <strong>{guardian.phone1 ?? 'N/A'}</strong>
                                  </div>
                                  <div>
                                    <span>Phone 2</span>
                                    <strong>{guardian.phone2 ?? 'N/A'}</strong>
                                  </div>
                                  <div>
                                    <span>Email</span>
                                    <strong>{guardian.user?.email ?? 'N/A'}</strong>
                                  </div>
                                  <div>
                                    <span>Gender</span>
                                    <strong>{guardian.user?.gender ?? 'N/A'}</strong>
                                  </div>
                                  <div>
                                    <span>Aadhaar</span>
                                    <strong>{guardian.adharnumber ?? 'N/A'}</strong>
                                  </div>
                                  <div>
                                    <span>Qualification</span>
                                    <strong>{guardian.qualification ?? 'N/A'}</strong>
                                  </div>
                                </div>
                              </article>
                            ))
                          )}
                        </div>
                      </article>

                      <article className="parent-detail-card parent-detail-card-wide">
                        <header>
                          <div>
                            <p className="section-eyebrow">Record summary</p>
                            <h4>Extra context</h4>
                          </div>
                          <LuShieldCheck />
                        </header>
                        <div className="parent-detail-specs parent-detail-specs-compact">
                          <div>
                            <span>Primary guardian</span>
                            <strong>{selectedStudent.primaryGuardianName ?? 'N/A'}</strong>
                          </div>
                          <div>
                            <span>Guardians linked</span>
                            <strong>{selectedStudent.guardianCount}</strong>
                          </div>
                          <div>
                            <span>Last updated</span>
                            <strong>{formatDisplayDate(selectedDetail?.updatedAt)}</strong>
                          </div>
                          <div>
                            <span>Detail loaded</span>
                            <strong>{selectedDetail ? 'Yes' : 'No'}</strong>
                          </div>
                        </div>
                      </article>
                    </div>
                  ) : null}

                  {parentDashboardTab === 'exams' ? (
                    <section className="parent-tab-panel">
                      <div className="parent-tab-panel-head">
                        <div>
                          <p className="section-eyebrow">Exams</p>
                          <h4>Exam history</h4>
                          <p className="parent-tab-panel-copy">
                            Filter every result by subject, score band, or date without overloading the overview.
                          </p>
                        </div>
                        <div className="parent-tab-panel-summary">
                          <div>
                            <span>Exams</span>
                            <strong>{activeParentStudentExamRows.length}</strong>
                          </div>
                          <div>
                            <span>Average</span>
                            <strong>{activeParentStudentSummary.averageMarks}%</strong>
                          </div>
                          <div>
                            <span>Best</span>
                            <strong>{activeParentStudentExamRows.length ? `${Math.max(...activeParentStudentExamRows.map((row) => row.percent))}%` : 'N/A'}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="parent-filter-bar">
                        <label className="field-block">
                          <span className="field-label">Search</span>
                          <input
                            type="text"
                            placeholder="Search exam, subject, class..."
                            value={parentExamSearch}
                            onChange={(event) => setParentExamSearch(event.target.value)}
                          />
                        </label>
                        <label className="field-block">
                          <span className="field-label">Subject</span>
                          <select value={parentExamSubjectFilter} onChange={(event) => setParentExamSubjectFilter(event.target.value)}>
                            <option value="ALL">All subjects</option>
                            {parentExamSubjectOptions.map((subject) => (
                              <option key={subject} value={subject}>
                                {subject}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="field-block">
                          <span className="field-label">Band</span>
                          <select
                            value={parentExamBandFilter}
                            onChange={(event) => setParentExamBandFilter(event.target.value as 'ALL' | 'EXCELLENT' | 'GOOD' | 'NEEDS_ATTENTION')}
                          >
                            <option value="ALL">All bands</option>
                            <option value="EXCELLENT">Excellent</option>
                            <option value="GOOD">Good</option>
                            <option value="NEEDS_ATTENTION">Needs attention</option>
                          </select>
                        </label>
                        <label className="field-block">
                          <span className="field-label">Sort</span>
                          <select value={parentExamSort} onChange={(event) => setParentExamSort(event.target.value as 'recent' | 'highest' | 'lowest')}>
                            <option value="recent">Most recent</option>
                            <option value="highest">Highest score</option>
                            <option value="lowest">Lowest score</option>
                          </select>
                        </label>
                      </div>

                      <div className="parent-record-grid">
                        {filteredParentExamRows.length === 0 ? (
                          <div className="parent-empty-state parent-empty-state-wide">
                            <LuBookOpen />
                            <h4>No exams matched the current filters</h4>
                            <p>Try a different subject or broaden the score band.</p>
                          </div>
                        ) : (
                          filteredParentExamRows.map((row) => (
                            <article key={row.id} className="parent-record-card">
                              <div className="parent-record-card-head">
                                <div>
                                  <strong>{row.examName}</strong>
                                  <p>
                                    {row.subjectName} · {row.className} - {row.section}
                                  </p>
                                </div>
                                <span className={`parent-band band-${row.band.toLowerCase()}`}>{row.band.replace('_', ' ')}</span>
                              </div>
                              <div className="parent-progress-track">
                                <span style={{ width: `${Math.max(row.percent, 6)}%` }} />
                              </div>
                              <div className="parent-record-card-footer">
                                <span>{row.marks} scored</span>
                                <span>{row.totalMarks} total</span>
                                <span>{row.percent}%</span>
                                <span>{formatDisplayDate(row.examDate)}</span>
                              </div>
                            </article>
                          ))
                        )}
                      </div>
                    </section>
                  ) : null}

                  {parentDashboardTab === 'fees' ? (
                    <section className="parent-tab-panel">
                      <div className="parent-tab-panel-head">
                        <div>
                          <p className="section-eyebrow">Fees</p>
                          <h4>Fee ledger</h4>
                          <p className="parent-tab-panel-copy">
                            Review payment history, balances, and fee type breakdowns from a dedicated tab.
                          </p>
                        </div>
                        <div className="parent-tab-panel-summary">
                          <div>
                            <span>Total</span>
                            <strong>{formatInr(activeParentStudentSummary.feeTotal)}</strong>
                          </div>
                          <div>
                            <span>Paid</span>
                            <strong>{formatInr(activeParentStudentSummary.feePaid)}</strong>
                          </div>
                          <div>
                            <span>Remaining</span>
                            <strong>{formatInr(activeParentStudentSummary.feeRemaining)}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="parent-filter-bar">
                        <label className="field-block">
                          <span className="field-label">Search</span>
                          <input
                            type="text"
                            placeholder="Search fee type, year, status..."
                            value={parentFeeSearch}
                            onChange={(event) => setParentFeeSearch(event.target.value)}
                          />
                        </label>
                        <label className="field-block">
                          <span className="field-label">Type</span>
                          <select value={parentFeeTypeFilter} onChange={(event) => setParentFeeTypeFilter(event.target.value as any)}>
                            <option value="ALL">All types</option>
                            <option value="TUITION">Tuition</option>
                            <option value="BUS">Bus</option>
                            <option value="EXAM">Exam</option>
                            <option value="OTHER">Other</option>
                          </select>
                        </label>
                        <label className="field-block">
                          <span className="field-label">Status</span>
                          <select value={parentFeeStatusFilter} onChange={(event) => setParentFeeStatusFilter(event.target.value as any)}>
                            <option value="ALL">All statuses</option>
                            <option value="PAID">Paid</option>
                            <option value="PARTIAL">Partial</option>
                            <option value="PENDING">Pending</option>
                          </select>
                        </label>
                        <label className="field-block">
                          <span className="field-label">Academic year</span>
                          <select value={parentFeeYearFilter} onChange={(event) => setParentFeeYearFilter(event.target.value)}>
                            <option value="ALL">All years</option>
                            {parentFeeYearOptions.map((year) => (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="field-block">
                          <span className="field-label">Sort</span>
                          <select value={parentFeeSort} onChange={(event) => setParentFeeSort(event.target.value as any)}>
                            <option value="recent">Most recent</option>
                            <option value="remaining">Highest balance</option>
                            <option value="paid">Highest paid</option>
                          </select>
                        </label>
                      </div>

                      <div className="parent-ledger-list">
                        {filteredParentFeeRows.length === 0 ? (
                          <div className="parent-empty-state parent-empty-state-wide">
                            <LuCircleDollarSign />
                            <h4>No fee records matched the current filters</h4>
                            <p>Try another type or status filter to reveal the ledger.</p>
                          </div>
                        ) : (
                          filteredParentFeeRows.map((fee) => (
                            <article key={fee.id} className="parent-ledger-card">
                              <div className="parent-ledger-head">
                                <div>
                                  <strong>{fee.type}</strong>
                                  <p>{fee.academicYear}</p>
                                </div>
                                <span>{formatInr(fee.total)}</span>
                              </div>
                              <div className="parent-ledger-meta">
                                <span>Paid {formatInr(fee.paid)}</span>
                                <span>Remaining {formatInr(fee.remaining)}</span>
                                <span>{fee.paymentCount} payment{fee.paymentCount === 1 ? '' : 's'}</span>
                                <span className={`parent-band band-${fee.status.toLowerCase()}`}>{fee.status}</span>
                              </div>
                              <div className="parent-ledger-payments">
                                <div className="parent-ledger-payment">
                                  <strong>{formatInr(fee.paid)}</strong>
                                  <span>Collected</span>
                                  <span>{fee.latestPaymentMethod ?? 'N/A'}</span>
                                </div>
                                <div className="parent-ledger-payment">
                                  <strong>{formatInr(fee.remaining)}</strong>
                                  <span>Due</span>
                                  <span>{fee.latestPaymentStatus ?? 'N/A'}</span>
                                </div>
                              </div>
                            </article>
                          ))
                        )}
                      </div>
                    </section>
                  ) : null}

                  {parentDashboardTab === 'attendance' ? (
                    <section className="parent-tab-panel">
                      <div className="parent-tab-panel-head">
                        <div>
                          <p className="section-eyebrow">Attendance</p>
                          <h4>Presence overview</h4>
                          <p className="parent-tab-panel-copy">
                            Filter monthly attendance sessions and spot trends without cluttering the overview screen.
                          </p>
                        </div>
                        <div className="parent-tab-panel-summary">
                          <div>
                            <span>Present</span>
                            <strong>{activeParentStudentAttendanceSummary.present}</strong>
                          </div>
                          <div>
                            <span>Absent</span>
                            <strong>{activeParentStudentAttendanceSummary.absent}</strong>
                          </div>
                          <div>
                            <span>Rate</span>
                            <strong>{activeParentStudentAttendanceSummary.percent}%</strong>
                          </div>
                        </div>
                      </div>

                      <div className="parent-filter-bar">
                        <label className="field-block">
                          <span className="field-label">Search</span>
                          <input
                            type="text"
                            placeholder="Search date, month, teacher..."
                            value={parentAttendanceSearch}
                            onChange={(event) => setParentAttendanceSearch(event.target.value)}
                          />
                        </label>
                        <label className="field-block">
                          <span className="field-label">Status</span>
                          <select
                            value={parentAttendanceStatusFilter}
                            onChange={(event) => setParentAttendanceStatusFilter(event.target.value as 'ALL' | 'PRESENT' | 'ABSENT')}
                          >
                            <option value="ALL">All statuses</option>
                            <option value="PRESENT">Present</option>
                            <option value="ABSENT">Absent</option>
                          </select>
                        </label>
                        <label className="field-block">
                          <span className="field-label">Month</span>
                          <select value={parentAttendanceMonthFilter} onChange={(event) => setParentAttendanceMonthFilter(event.target.value)}>
                            <option value="ALL">All months</option>
                            {parentAttendanceMonthOptions.map((month) => (
                              <option key={month} value={month}>
                                {month}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="field-block">
                          <span className="field-label">Sort</span>
                          <select
                            value={parentAttendanceSort}
                            onChange={(event) => setParentAttendanceSort(event.target.value as 'recent' | 'oldest')}
                          >
                            <option value="recent">Most recent</option>
                            <option value="oldest">Oldest first</option>
                          </select>
                        </label>
                      </div>

                      <div className="parent-attendance-layout parent-attendance-layout-tab">
                        <div className="parent-attendance-ring">
                          <svg viewBox="0 0 220 220" role="img" aria-label="Attendance summary">
                            <circle cx="110" cy="110" r="82" className="status-donut-base" />
                            <circle cx="110" cy="110" r="82" className="status-donut-zero-ring" />
                            <circle cx="110" cy="110" r="54" fill="#fff" />
                            <text x="110" y="104" textAnchor="middle" className="status-donut-value">
                              {activeParentStudentAttendanceSummary.percent}%
                            </text>
                            <text x="110" y="124" textAnchor="middle" className="status-donut-sub">
                              attendance
                            </text>
                          </svg>
                        </div>
                        <div className="parent-attendance-copy">
                          <div className="parent-attendance-grid">
                            <div>
                              <span>Present</span>
                              <strong>{activeParentStudentAttendanceSummary.present}</strong>
                            </div>
                            <div>
                              <span>Absent</span>
                              <strong>{activeParentStudentAttendanceSummary.absent}</strong>
                            </div>
                            <div>
                              <span>Total</span>
                              <strong>{activeParentStudentAttendanceSummary.total}</strong>
                            </div>
                            <div>
                              <span>Class teacher</span>
                              <strong>{selectedStudent.teacherName ?? 'N/A'}</strong>
                            </div>
                          </div>
                          <p>
                            Attendance sessions are pulled from the class feed. Use the filters to narrow down by month or status.
                          </p>
                        </div>
                      </div>

                      <div className="parent-record-grid attendance-grid">
                        {filteredParentAttendanceRows.length === 0 ? (
                          <div className="parent-empty-state parent-empty-state-wide">
                            <LuClock3 />
                            <h4>No attendance records matched the current filters</h4>
                            <p>Try another month or widen the search.</p>
                          </div>
                        ) : (
                          filteredParentAttendanceRows.map((row) => (
                            <article key={row.sessionId} className="parent-record-card attendance-card">
                              <div className="parent-record-card-head">
                                <div>
                                  <strong>{formatDisplayDate(row.date)}</strong>
                                  <p>
                                    {row.className} - {row.section} · {row.takenBy}
                                  </p>
                                </div>
                                <span className={`parent-band band-${row.status.toLowerCase()}`}>{row.status}</span>
                              </div>
                              <div className="parent-record-card-footer">
                                <span>{row.monthKey}</span>
                                <span>Session {row.sessionId}</span>
                              </div>
                            </article>
                          ))
                        )}
                      </div>
                    </section>
                  ) : null}
                </div>
              </>
            )}
          </section>
        </section>
      </section>
    );
  };

  const renderMarksModule = () => (
    <article className="panel module-panel">
      <div className="marks-module-head">
        <div>
          <h3>Marks Management</h3>
          <p className="marks-subtitle">
            Manage and view student marks with class-wise and exam-wise controls in one ERP workspace.
          </p>
        </div>
        <div className="marks-head-actions">
          <div className="marks-mode-switch" role="tablist" aria-label="Marks mode switch">
            {canManageMarks ? (
              <button
                type="button"
                className={marksMode === 'manage' ? 'active' : ''}
                onClick={() => setMarksMode('manage')}
              >
                Manage Marks
              </button>
            ) : null}
            <button type="button" className={marksMode === 'view' ? 'active' : ''} onClick={() => setMarksMode('view')}>
              View Marks
            </button>
          </div>
          {canManageMarks && marksMode === 'manage' ? (
            <button type="button" className="create-exam-cta" disabled={marksSaving} onClick={saveBulkMarks}>
              {marksSaving ? 'Saving...' : 'Save Marks'}
            </button>
          ) : null}
        </div>
      </div>

      {marksModuleLoading ? (
        <div className="class-loader-wrap">
          <div className="class-loader" role="status" aria-live="polite">
            <span className="loader-ring outer" />
            <span className="loader-ring inner" />
            <img src={logo} alt="IDPS logo loading" />
          </div>
          <p>Loading Marks Management...</p>
        </div>
      ) : (
        <section className="marks-panel">
          <div className="marks-filter-bar">
            <label className="field-block">
              <span className="field-label">Class *</span>
              <select
                value={selectedMarksClassId ?? ''}
                onChange={(event) => setSelectedMarksClassId(event.target.value ? Number(event.target.value) : null)}
              >
                <option value="">Select Class</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} - {cls.section}
                  </option>
                ))}
              </select>
            </label>
            <label className="field-block">
              <span className="field-label">Subject *</span>
              <select
                value={selectedMarksSubjectId ?? ''}
                onChange={(event) => setSelectedMarksSubjectId(event.target.value ? Number(event.target.value) : null)}
                disabled={!selectedMarksClassId}
              >
                <option value="">Select Subject</option>
                {marksSubjectOptions.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field-block">
              <span className="field-label">Exam *</span>
              <select
                value={selectedMarksExamId ?? ''}
                onChange={(event) => setSelectedMarksExamId(event.target.value ? Number(event.target.value) : null)}
                disabled={!selectedMarksClassId || !selectedMarksSubjectId}
              >
                <option value="">Select Exam</option>
                {marksExamOptions.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.name} ({exam.subject?.name ?? subjects.find((item) => item.id === exam.subjectId)?.name ?? 'Subject'})
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="marks-context-row">
            <p>
              <strong>Action:</strong> {marksMode === 'manage' ? 'Manage Marks' : 'View Marks'}
            </p>
            <p>
              <strong>Class:</strong> {selectedMarksClass ? `${selectedMarksClass.name} - ${selectedMarksClass.section}` : 'Not selected'}
            </p>
            <p>
              <strong>Subject:</strong> {subjects.find((subject) => subject.id === selectedMarksSubjectId)?.name ?? 'Not selected'}
            </p>
            <p>
              <strong>Exam:</strong> {selectedMarksExam?.name ?? 'Not selected'}
            </p>
            <p>
              <strong>Total Marks:</strong> {selectedMarksExam?.totalMarks ?? 'N/A'}
            </p>
          </div>

          {!selectedMarksClassId || !selectedMarksSubjectId || !selectedMarksExamId ? (
            <div className="marks-empty-state">
              <p>Select Class, Subject, and Exam to continue.</p>
            </div>
          ) : (
            <div className="marks-table-wrap">
              <table className="marks-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Roll No</th>
                    <th>Marks</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {marksStudentRows.length === 0 ? (
                    <tr>
                      <td colSpan={4}>
                        <p className="marks-empty-inline">No students found in this class.</p>
                      </td>
                    </tr>
                  ) : null}
                  {marksStudentRows.map((student) => {
                    const isEditable = canManageMarks && marksMode === 'manage';
                    return (
                      <tr key={student.id}>
                        <td>{student.name}</td>
                        <td>{`R-${String(student.id).padStart(4, '0')}`}</td>
                        <td>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={marksDraft[student.id] ?? ''}
                            placeholder={isEditable ? 'Enter marks' : 'N/A'}
                            readOnly={!isEditable}
                            onChange={(event) => {
                              if (!isEditable) return;
                              const next = event.target.value.replace(/[^\d]/g, '');
                              setMarksDraft((prev) => ({ ...prev, [student.id]: next }));
                              setMarksErrors((prev) => ({ ...prev, [student.id]: '' }));
                            }}
                          />
                        </td>
                        <td>
                          {marksErrors[student.id] ? (
                            <span className="marks-badge error">{marksErrors[student.id]}</span>
                          ) : (
                            <span className="marks-badge ok">
                              {existingMarksByStudent.has(student.id) ? 'Recorded' : 'Pending'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </article>
  );

  function getFeePaidAmount(fee: FeeOption) {
    return fee.payments.filter((payment) => payment.status === 'SUCCESS').reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0);
  }

  const getFeeRemainingAmount = (fee: FeeOption) => Math.max(Number(fee.total ?? 0) - getFeePaidAmount(fee), 0);

  const submitAssignFees = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canManageFees) {
      toast.error('You are not authorized to assign fees.');
      return;
    }

    if (!assignFeeForm.type || !assignFeeForm.total || !assignFeeForm.academicYear) {
      toast.error('Fill all required fee assignment fields.');
      return;
    }

    const total = Number(assignFeeForm.total);
    if (!Number.isFinite(total) || total <= 0) {
      toast.error('Fee amount should be greater than 0.');
      return;
    }

    const targetStudents =
      assignFeeForm.targetMode === 'class'
        ? classes.find((cls) => cls.id === Number(assignFeeForm.classId))?.students.map((student) => student.id) ?? []
        : assignFeeForm.studentIds;

    if (targetStudents.length === 0) {
      toast.error('Select at least one student to assign fee.');
      return;
    }

    setAssignFeeLoading(true);
    try {
      const outcomes = await Promise.all(
        targetStudents.map(async (studentId) => {
          const response = await fetch(`${API_BASE}/student/create-fee`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              studentId,
              type: assignFeeForm.type,
              total,
              academicYear: assignFeeForm.academicYear,
            }),
          });
          const result = await readJson<{ message?: string }>(response);
          return {
            ok: response.ok,
            message: result?.message ?? (response.ok ? 'Assigned' : 'Failed'),
          };
        }),
      );

      const successCount = outcomes.filter((item) => item.ok).length;
      const failed = outcomes.filter((item) => !item.ok);

      if (successCount > 0) {
        toast.success(`Fees assigned to ${successCount} student(s).`);
      }
      if (failed.length > 0) {
        toast.error(failed[0].message || 'Some fee assignments failed.');
      }

      setShowAssignFeeModal(false);
      setAssignFeeForm({
        targetMode: 'class',
        classId: '',
        studentIds: [],
        type: 'TUITION',
        total: '',
        academicYear: '',
      });
      await loadFeeModuleData();
    } catch {
      toast.error('Network error while assigning fees.');
    } finally {
      setAssignFeeLoading(false);
    }
  };

  const openRecordPaymentModal = (fee: FeeOption) => {
    setSelectedFeeForPayment(fee);
    setPaymentForm({
      feeId: String(fee.id),
      amount: '',
      method: 'ONLINE',
      status: 'SUCCESS',
    });
    setShowRecordPaymentModal(true);
  };

  const openStudentDetails = (studentId: number) => {
    setFeeStudentDetailId(studentId);
  };

  const openStudentAddPayment = (studentId: number) => {
    const studentFees = fees.filter((fee) => fee.studentId === studentId);
    const payableFee = studentFees.find((fee) => getFeeRemainingAmount(fee) > 0) ?? studentFees[0] ?? null;
    if (!payableFee) {
      toast.info('No fee record available for this student.');
      return;
    }
    openRecordPaymentModal(payableFee);
  };

  const openStudentEditFees = (studentId: number) => {
    const studentFees = fees.filter((fee) => fee.studentId === studentId);
    const editableFee = studentFees.find((fee) => getFeeRemainingAmount(fee) > 0) ?? studentFees[0] ?? null;
    if (!editableFee) {
      toast.info('No fee record available for this student.');
      return;
    }
    openEditFeeModal(editableFee);
  };

  const openManageStudentDetailsModal = () => {
    if (!manageSelectedStudent) {
      toast.info('Select a student first.');
      return;
    }
    setShowManageStudentDetailsModal(true);
  };

  const closeManageStudentDetailsModal = () => {
    setShowManageStudentDetailsModal(false);
  };

  const closeStudentInsightsModal = () => {
    setShowStudentInsightsModal(false);
    setStudentAction('list');
  };

  const scrollToStudentInsightSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    if (feePage !== 'manage' || manageStudentRows.length === 0) {
      return;
    }

    const hasVisibleSelection = manageStudentRows.some((row) => row.id === feeStudentDetailId);
    if (!hasVisibleSelection) {
      setFeeStudentDetailId(manageStudentRows[0].id);
    }
  }, [feePage, feeStudentDetailId, manageStudentRows]);

  const submitRecordPayment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canManageFees || !selectedFeeForPayment) {
      toast.error('You are not authorized to record payments.');
      return;
    }

    const amount = Number(paymentForm.amount);
    const remaining = getFeeRemainingAmount(selectedFeeForPayment);

    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error('Payment amount should be greater than 0.');
      return;
    }

    if (amount > remaining) {
      toast.error(`Amount cannot exceed remaining balance (${remaining}).`);
      return;
    }

    setRecordPaymentLoading(true);
    try {
      const response = await fetch(`${API_BASE}/student/create-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          feeId: Number(paymentForm.feeId),
          amount,
          method: paymentForm.method,
          status: paymentForm.status,
        }),
      });

      const result = await readJson<{ message?: string }>(response);
      if (!response.ok) {
        toast.error(result?.message ?? 'Failed to record payment.');
        return;
      }

      toast.success(result?.message ?? 'Payment recorded successfully.');
      setShowRecordPaymentModal(false);
      setSelectedFeeForPayment(null);
      await loadFeeModuleData();
    } catch {
      toast.error('Network error while recording payment.');
    } finally {
      setRecordPaymentLoading(false);
    }
  };

  const openEditFeeModal = (fee: FeeOption) => {
    setEditFeeForm({
      id: String(fee.id),
      type: fee.type,
      total: String(Number(fee.total ?? 0)),
      academicYear: fee.academicYear,
    });
    setShowEditFeeModal(true);
  };

  const submitUpdateFee = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canManageFees) {
      toast.error('You are not authorized to update fees.');
      return;
    }
    if (!editFeeForm.id || !editFeeForm.total || !editFeeForm.academicYear) {
      toast.error('Please fill all required fee fields.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/student/update-fee/${editFeeForm.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: editFeeForm.type,
          total: Number(editFeeForm.total),
          academicYear: editFeeForm.academicYear,
        }),
      });
      const result = await readJson<{ message?: string }>(response);
      if (!response.ok) {
        toast.error(result?.message ?? 'Failed to update fee.');
        return;
      }
      toast.success(result?.message ?? 'Fee updated successfully.');
      setShowEditFeeModal(false);
      await loadFeeModuleData();
    } catch {
      toast.error('Network error while updating fee.');
    }
  };

  const openEditPaymentModal = (payment: FeePaymentOption) => {
    setEditPaymentForm({
      id: String(payment.id),
      feeId: String(payment.feeId),
      amount: String(Number(payment.amount ?? 0)),
      method: payment.method,
      status: payment.status,
    });
    setShowEditPaymentModal(true);
  };

  const submitUpdatePayment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canManageFees || !editPaymentForm.id) {
      toast.error('You are not authorized to update payment records.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/student/update-payment/${editPaymentForm.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          feeId: Number(editPaymentForm.feeId),
          amount: Number(editPaymentForm.amount),
          method: editPaymentForm.method,
          status: editPaymentForm.status,
        }),
      });
      const result = await readJson<{ message?: string }>(response);
      if (!response.ok) {
        toast.error(result?.message ?? 'Failed to update payment.');
        return;
      }
      toast.success(result?.message ?? 'Payment updated successfully.');
      setShowEditPaymentModal(false);
      await loadFeeModuleData();
    } catch {
      toast.error('Network error while updating payment.');
    }
  };

  const renderFeeModule = () => (
    <article className="panel module-panel finance-root">
      <header className="finance-head">
        <div>
          <h3>Fee Management</h3>
          <p>School finance workspace</p>
        </div>
      </header>

      <nav className="finance-tabs" role="tablist" aria-label="Fee pages">
        <button type="button" className={feePage === 'overview' ? 'active' : ''} onClick={() => setFeePage('overview')}>
          Overview
        </button>
        {canManageFees ? (
          <button type="button" className={feePage === 'manage' ? 'active' : ''} onClick={() => setFeePage('manage')}>
            Manage Fees
          </button>
        ) : null}
        <button type="button" className={feePage === 'transactions' ? 'active' : ''} onClick={() => setFeePage('transactions')}>
          Transactions
        </button>
      </nav>

      {feeModuleLoading ? (
        <div className="class-loader-wrap finance-loader">
          <div className="class-loader" role="status" aria-live="polite">
            <span className="loader-ring outer" />
            <span className="loader-ring inner" />
            <img src={logo} alt="IDPS logo loading" />
          </div>
          <p>Loading Fee Management...</p>
        </div>
      ) : (
        <section className="finance-content">
          {feePage === 'overview' ? (
            <>
              <section className="finance-overview">
                <section className="finance-kpis modern">
                  <article>
                    <span className="finance-kpi-icon neutral"><LuUsers /></span>
                    <div>
                      <p>Total Records</p>
                      <strong>{feeOverview.totalFees}</strong>
                      <span className="finance-kpi-sub">{formatInr(feeOverview.totalAmount)} assigned</span>
                    </div>
                  </article>
                  <article>
                    <span className="finance-kpi-icon paid"><LuUserRoundCheck /></span>
                    <div>
                      <p>Paid</p>
                      <strong>{feeOverview.paidFees}</strong>
                      <span className="finance-kpi-sub">{formatInr(feeOverview.paidAmount)} collected</span>
                    </div>
                  </article>
                  <article>
                    <span className="finance-kpi-icon partial"><LuCircleDollarSign /></span>
                    <div>
                      <p>Partial</p>
                      <strong>{feeOverview.partialFees}</strong>
                      <span className="finance-kpi-sub">In progress</span>
                    </div>
                  </article>
                  <article>
                    <span className="finance-kpi-icon pending"><LuBookOpen /></span>
                    <div>
                      <p>Pending</p>
                      <strong>{feeOverview.pendingFees}</strong>
                      <span className="finance-kpi-sub">{formatInr(feeOverview.pendingAmount)} remaining</span>
                    </div>
                  </article>
                  <article>
                    <span className="finance-kpi-icon overdue"><LuBookCopy /></span>
                    <div>
                      <p>Overdue</p>
                      <strong>{feeOverview.overdueFees}</strong>
                      <span className="finance-kpi-sub">Needs attention</span>
                    </div>
                  </article>
                  <article>
                    <span className="finance-kpi-icon accent"><LuGauge /></span>
                    <div>
                      <p>Collection</p>
                      <strong>{feeOverview.collectionRate}%</strong>
                      <span className="finance-kpi-sub">Completion rate</span>
                    </div>
                  </article>
                </section>

                <section className="finance-visuals finance-visuals-modern two-up">
                  <article className="finance-card status-spectrum-card">
                    <header>
                      <h4>Status Spectrum</h4>
                      <span className="finance-card-meta">
                        {formatInr(feeOverview.paidAmount)} collected of {formatInr(feeOverview.totalAmount)}
                      </span>
                    </header>
                    <div className="status-spectrum-body">
                      <div className="status-donut-panel">
                        <div className="status-donut">
                          <svg viewBox="0 0 180 180" role="img" aria-label="Collected versus remaining donut chart">
                            {collectionDonutSegments.length === 0 ? (
                              <circle cx="90" cy="90" r="72" className="status-donut-base" />
                            ) : (
                              collectionDonutSegments.map((segment) => (
                                <path
                                  key={segment.key}
                                  d={segment.path}
                                  fill={segment.color}
                                  className="status-donut-segment"
                                  onMouseMove={(event) => {
                                    setOverviewTooltip({
                                      x: event.clientX,
                                      y: event.clientY,
                                      title: segment.label,
                                      lines: [
                                        `${segment.share.toFixed(1)}% of total fees`,
                                        `${formatInr(segment.amount)}`,
                                        segment.key === 'COLLECTED'
                                          ? `Collected amount`
                                          : `Remaining amount`,
                                      ],
                                    });
                                  }}
                                  onMouseLeave={() => setOverviewTooltip(null)}
                                />
                              ))
                            )}
                            <circle cx="90" cy="90" r="46" fill="#ffffff" />
                            <text x="90" y="84" textAnchor="middle" className="status-donut-value">
                              {feeOverview.paidAmountPercent}%
                            </text>
                            <text x="90" y="103" textAnchor="middle" className="status-donut-sub">
                              collected
                            </text>
                          </svg>
                        </div>
                        <div className="status-donut-caption">
                          <strong>{formatInr(feeOverview.paidAmount)}</strong>
                          <span>Collected of {formatInr(feeOverview.totalAmount)}</span>
                        </div>
                      </div>
                      <div className="status-spectrum-side">
                        <div className="status-summary-grid">
                          <div className="status-summary-card">
                            <span>Total School Fees</span>
                            <strong>{formatInr(feeOverview.totalAmount)}</strong>
                          </div>
                          <div className="status-summary-card">
                            <span>Total Collected</span>
                            <strong>{formatInr(feeOverview.paidAmount)}</strong>
                          </div>
                          <div className="status-summary-card">
                            <span>Pending Amount</span>
                            <strong>{formatInr(feeOverview.pendingAmount)}</strong>
                          </div>
                          <div className="status-summary-card">
                            <span>Collection Percentage</span>
                            <strong>{feeOverview.paidAmountPercent}%</strong>
                          </div>
                        </div>
                        <div className="status-type-panel">
                          <div className="status-type-panel-head">
                            <span>Fee Type Breakdown</span>
                            <small>Collected vs pending by fee type</small>
                          </div>
                          <div className="status-type-list">
                            {feeTypeInsights.map((item) => {
                              const collectedShare = item.totalAmount ? (item.paidAmount / item.totalAmount) * 100 : 0;
                              const pendingShare = item.totalAmount ? (item.pendingAmount / item.totalAmount) * 100 : 0;
                              return (
                                <div
                                  key={item.key}
                                  className="status-type-item"
                                  onMouseMove={(event) => {
                                    setOverviewTooltip({
                                      x: event.clientX,
                                      y: event.clientY,
                                      title: item.label,
                                      lines: [
                                        `${item.count} fee records`,
                                        `${item.share.toFixed(1)}% of school fees`,
                                        `Collected ${formatInr(item.paidAmount)}`,
                                        `Pending ${formatInr(item.pendingAmount)}`,
                                      ],
                                    });
                                  }}
                                  onMouseLeave={() => setOverviewTooltip(null)}
                                >
                                  <div className="status-type-item-head">
                                    <div className="status-type-item-title">
                                      <span className="status-dot" style={{ background: item.color }} />
                                      <strong>{item.label}</strong>
                                    </div>
                                    <strong className="status-type-item-amount">{formatInr(item.totalAmount)}</strong>
                                  </div>
                                  <div className="status-type-item-track">
                                    <span
                                      className="status-type-item-collected"
                                      style={{ background: item.color, width: `${Math.max(collectedShare, 4)}%` }}
                                    />
                                    <span
                                      className="status-type-item-pending"
                                      style={{ width: `${Math.max(pendingShare, 0)}%` }}
                                    />
                                  </div>
                                  <div className="status-type-item-foot">
                                    <span>{collectedShare.toFixed(0)}% collected</span>
                                    <span>{pendingShare.toFixed(0)}% pending</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>

                  <article className="finance-card class-gallery-card">
                    <header>
                      <h4>Class Collection Gallery</h4>
                      <span className="finance-card-meta">All classes</span>
                    </header>
                    <div className="class-gallery-meta">
                      <div>
                        <span className="class-gallery-meta-icon"><LuUsers /></span>
                        <span>Active Classes</span>
                        <strong>{classFeeInsights.length}</strong>
                      </div>
                      <div>
                        <span className="class-gallery-meta-icon"><LuGauge /></span>
                        <span>Average Collection</span>
                        <strong>
                          {classFeeInsights.length
                            ? Math.round(classFeeInsights.reduce((sum, item) => sum + item.percent, 0) / classFeeInsights.length)
                            : 0}
                          %
                        </strong>
                      </div>
                      <div>
                        <span className="class-gallery-meta-icon"><LuCircleDollarSign /></span>
                        <span>Total Collection</span>
                        <strong>{formatInr(classFeeInsights.reduce((sum, item) => sum + item.paidAmount, 0))}</strong>
                      </div>
                    </div>
                    <div className="class-gallery-chart scroll">
                      {classFeeInsights.map((item) => {
                        const totalHeight = (item.totalAmount / classFeeMaxAmount) * 100;
                        const paidHeight = item.totalAmount ? (item.paidAmount / item.totalAmount) * 100 : 0;
                        const isNeutral = item.totalAmount === 0 || item.percent === 0;
                        return (
                          <div key={item.classId} className={isNeutral ? 'class-gallery-bar neutral' : 'class-gallery-bar'}>
                            <div
                              className="class-gallery-stack"
                              onMouseMove={(event) => {
                                setOverviewTooltip({
                                  x: event.clientX,
                                  y: event.clientY,
                                  title: item.label,
                                  lines: [
                                    `Total: ${formatInr(item.totalAmount)}`,
                                    `Paid: ${formatInr(item.paidAmount)}`,
                                    `Pending: ${formatInr(item.pendingAmount)}`,
                                  ],
                                });
                              }}
                              onMouseLeave={() => setOverviewTooltip(null)}
                            >
                              <span
                                className="class-gallery-total"
                                style={{ height: `${Math.max(totalHeight, 6)}%` }}
                              >
                                <span
                                  className="class-gallery-paid"
                                  style={{ height: `${Math.max(paidHeight, isNeutral ? 18 : 6)}%` }}
                                />
                              </span>
                            </div>
                            <div className="class-gallery-label" title={item.label}>
                              <span>{item.label}</span>
                              <small>{item.percent}% • {formatInr(item.totalAmount)}</small>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </article>

                </section>

                {overviewTooltip ? (
                  <div
                    className="finance-tooltip"
                    style={{ left: overviewTooltip.x + 12, top: overviewTooltip.y + 12 }}
                  >
                    <strong>{overviewTooltip.title}</strong>
                    {overviewTooltip.lines.map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                  </div>
                ) : null}
              </section>
            </>
          ) : null}

          {feePage === 'manage' && canManageFees ? (
            <section className="finance-manage-shell">
              <section className="finance-manage-toolbar">
                <div className="finance-manage-search">
                  <label className="field-block finance-search-field">
                    <span className="field-label">Search Student</span>
                    <div className="finance-search-input">
                      <LuSearch />
                      <input
                        type="text"
                        placeholder="Search by name, class, section..."
                        value={manageStudentSearch}
                        onChange={(event) => setManageStudentSearch(event.target.value)}
                      />
                    </div>
                  </label>
                </div>

                <div className="finance-manage-filters">
                  <label className="field-block">
                    <span className="field-label">Class</span>
                    <select
                      value={manageStudentClassId ?? ''}
                      onChange={(event) => {
                        const classId = event.target.value ? Number(event.target.value) : null;
                        setManageStudentClassId(classId);
                        setManageStudentSection('');
                      }}
                    >
                      <option value="">All Classes</option>
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name} - {cls.section}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="field-block">
                    <span className="field-label">Section</span>
                    <select
                      value={manageStudentSection}
                      onChange={(event) => setManageStudentSection(event.target.value)}
                      disabled={manageStudentClassId == null}
                    >
                      <option value="">All Sections</option>
                      {manageStudentSections.map((section) => (
                        <option key={section} value={section}>
                          {section}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="field-block">
                    <span className="field-label">Fee Status</span>
                    <select
                      value={manageStudentStatus}
                      onChange={(event) => setManageStudentStatus(event.target.value as typeof manageStudentStatus)}
                    >
                      <option value="ALL">All Status</option>
                      <option value="PAID">Paid</option>
                      <option value="PARTIAL">Partial</option>
                      <option value="PENDING">Pending</option>
                      <option value="OVERDUE">Overdue</option>
                    </select>
                  </label>
                  <label className="field-block">
                    <span className="field-label">Fee Type</span>
                    <select value={manageStudentType} onChange={(event) => setManageStudentType(event.target.value as typeof manageStudentType)}>
                      <option value="ALL">All Types</option>
                      <option value="TUITION">Tuition</option>
                      <option value="BUS">Transport</option>
                      <option value="EXAM">Exam</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </label>
                </div>

                <div className="finance-manage-actions">
                  <button
                    type="button"
                    className="finance-secondary-btn"
                    onClick={() => {
                      setManageStudentSearch('');
                      setManageStudentClassId(null);
                      setManageStudentSection('');
                      setManageStudentStatus('ALL');
                      setManageStudentType('ALL');
                    }}
                  >
                    Clear Filters
                  </button>
                  <button type="button" className="finance-primary-btn" onClick={() => setShowAssignFeeModal(true)}>
                    Assign Fees
                  </button>
                </div>
              </section>

              <section className="finance-manage-grid">
                <article className="finance-card finance-manage-list-card">
                  <header className="finance-manage-card-head">
                    <div>
                      <h4>Manage Students</h4>
                      <p>{manageStudentRows.length} student(s) match the selected filters</p>
                    </div>
                    <span className="finance-card-meta">
                      <LuSlidersHorizontal />
                      Live filters
                    </span>
                  </header>

                  <div className="finance-manage-list-head">
                    <span>Student</span>
                    <span>Status</span>
                    <span>Summary</span>
                    <span>Actions</span>
                  </div>

                  <div className="finance-manage-list">
                    {manageStudentRows.length === 0 ? (
                      <p className="fee-empty">No students match the current filters.</p>
                    ) : (
                      manageStudentRows.map((row) => {
                        const isActive = feeStudentDetailId === row.id;
                        const statusClass =
                          row.status === 'PAID'
                            ? 'paid'
                            : row.status === 'PARTIAL'
                              ? 'partial'
                              : row.status === 'OVERDUE'
                                ? 'overdue'
                                : 'pending';
                        return (
                          <article
                            key={row.id}
                            className={`finance-manage-row ${isActive ? 'active' : ''}`}
                            onClick={() => openStudentDetails(row.id)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                openStudentDetails(row.id);
                              }
                            }}
                          >
                            <div className="finance-manage-row-student">
                              <strong>{row.name}</strong>
                              <span>
                                {row.classLabel} {row.section ? `· Section ${row.section}` : ''}
                              </span>
                              <small>
                                {row.feeCount} fee record{row.feeCount === 1 ? '' : 's'} · {row.paymentCount} payment
                                {row.paymentCount === 1 ? '' : 's'}
                              </small>
                            </div>
                            <div className="finance-manage-row-status">
                              <span className={`status-chip ${statusClass}`}>{row.status}</span>
                              <small>{row.feeTypes.join(', ')}</small>
                            </div>
                            <div className="finance-manage-row-summary">
                              <span>
                                Total
                                <strong>{formatInr(row.totalAmount)}</strong>
                              </span>
                              <span>
                                Paid
                                <strong>{formatInr(row.paidAmount)}</strong>
                              </span>
                              <span>
                                Balance
                                <strong>{formatInr(row.pendingAmount)}</strong>
                              </span>
                            </div>
                            <div className="finance-manage-row-actions">
                              <button
                                type="button"
                                className="finance-action-btn"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  openStudentEditFees(row.id);
                                }}
                              >
                                Edit Fees
                              </button>
                              <button
                                type="button"
                                className="finance-action-btn"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  openStudentAddPayment(row.id);
                                }}
                              >
                                Add Payment
                              </button>
                              <button
                                type="button"
                                className="finance-action-btn"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  openStudentDetails(row.id);
                                }}
                              >
                                View Previous Payments
                              </button>
                            </div>
                          </article>
                        );
                      })
                    )}
                  </div>
                </article>

                <article className="finance-card finance-manage-detail-card">
                  <header className="finance-manage-detail-head">
                    <div>
                      <h4>{manageSelectedStudent?.name ?? 'Student Overview'}</h4>
                      <p>
                        {manageSelectedStudent
                          ? `${manageSelectedStudent.classLabel}${manageSelectedStudent.section ? ` · Section ${manageSelectedStudent.section}` : ''}`
                          : 'Choose a student from the list to inspect fee history.'}
                      </p>
                    </div>
                    {manageSelectedStudent ? (
                      <span
                        className={`status-chip ${
                          manageSelectedStudent.status === 'PAID'
                            ? 'paid'
                            : manageSelectedStudent.status === 'PARTIAL'
                              ? 'partial'
                              : manageSelectedStudent.status === 'OVERDUE'
                                ? 'overdue'
                                : 'pending'
                        }`}
                      >
                        {manageSelectedStudent.status}
                      </span>
                    ) : null}
                  </header>

                  {manageSelectedStudent ? (
                    <div className="finance-manage-detail-body compact">
                      <section className="finance-manage-summary-compact">
                        <article className="finance-manage-chart-card summary">
                          <header>
                            <h5>Collected vs Remaining</h5>
                            <span>{formatInr(selectedStudentFeeSummary.paid)} collected</span>
                          </header>
                          <div className="finance-manage-donut compact">
                            <svg viewBox="0 0 180 180" role="img" aria-label="Collected versus remaining donut chart">
                              {manageSelectedStudentCollectionSegments.length === 0 ? (
                                <>
                                  <circle cx="90" cy="90" r="72" className="status-donut-base" />
                                  <circle cx="90" cy="90" r="72" className="status-donut-zero-ring" />
                                </>
                              ) : (
                                manageSelectedStudentCollectionSegments.map((segment) => (
                                  <path
                                    key={segment.key}
                                    d={segment.path}
                                    fill={segment.color}
                                    className="status-donut-segment"
                                    onMouseMove={(event) => {
                                      setOverviewTooltip({
                                        x: event.clientX,
                                        y: event.clientY,
                                        title: segment.label,
                                        lines: [
                                          `${segment.share.toFixed(1)}% of total fees`,
                                          `${formatInr(segment.amount)}`,
                                          segment.key === 'PAID' ? 'Collected amount' : 'Remaining amount',
                                        ],
                                      });
                                    }}
                                    onMouseLeave={() => setOverviewTooltip(null)}
                                  />
                                ))
                              )}
                              <circle cx="90" cy="90" r="46" fill="#ffffff" />
                              <text x="90" y="84" textAnchor="middle" className="status-donut-value">
                                {selectedStudentFeeSummary.total
                                  ? Math.round((selectedStudentFeeSummary.paid / selectedStudentFeeSummary.total) * 100)
                                  : 0}
                                %
                              </text>
                              <text x="90" y="103" textAnchor="middle" className="status-donut-sub">
                                collected
                              </text>
                            </svg>
                          </div>
                          <div className="finance-manage-donut-caption">
                            <strong>{formatInr(selectedStudentFeeSummary.paid)}</strong>
                            <span>Collected of {formatInr(selectedStudentFeeSummary.total)}</span>
                          </div>
                        </article>

                        <div className="finance-manage-compact-right">
                          <section className="finance-manage-metrics compact">
                            <article>
                              <span>Total Fees</span>
                              <strong>{formatInr(selectedStudentFeeSummary.total)}</strong>
                            </article>
                            <article>
                              <span>Total Collected</span>
                              <strong>{formatInr(selectedStudentFeeSummary.paid)}</strong>
                            </article>
                            <article>
                              <span>Balance</span>
                              <strong>{formatInr(selectedStudentFeeSummary.remaining)}</strong>
                            </article>
                            <article>
                              <span>Collection %</span>
                              <strong>
                                {selectedStudentFeeSummary.total ? Math.round((selectedStudentFeeSummary.paid / selectedStudentFeeSummary.total) * 100) : 0}%
                              </strong>
                            </article>
                          </section>

                          <section className="finance-manage-compact-facts">
                            <article>
                              <span>Records</span>
                              <strong>{manageSelectedStudent.fees.length}</strong>
                            </article>
                            <article>
                              <span>Payments</span>
                              <strong>{manageSelectedStudentPayments.length}</strong>
                            </article>
                            <article>
                              <span>Types</span>
                              <strong>{manageSelectedStudentTypeBreakdown.length}</strong>
                            </article>
                            <article>
                              <span>Largest Fee</span>
                              <strong>{formatInr(Math.max(...manageSelectedStudent.fees.map((fee) => Number(fee.total ?? 0)), 0))}</strong>
                            </article>
                            <article>
                              <span>Last Payment</span>
                              <strong title={manageSelectedStudentPayments[0]?.createdAt ?? undefined}>
                                {manageSelectedStudentLastPaymentLabel}
                              </strong>
                            </article>
                            <article>
                              <span>Paid Fees</span>
                              <strong>{manageSelectedStudent.fees.filter((fee) => getFeeRemainingAmount(fee) <= 0).length}</strong>
                            </article>
                          </section>
                        </div>
                      </section>

                      <div className="finance-manage-compact-actions">
                        <button type="button" className="finance-manage-full-btn" onClick={openManageStudentDetailsModal}>
                          Full Details
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="fee-empty">Select a student from the list to view a compact fee overview.</p>
                  )}
                </article>
              </section>
            </section>
          ) : null}

          {showManageStudentDetailsModal && manageSelectedStudent ? (
            <div className="modal-overlay nested">
              <div className="student-modal manage-fee-detail-modal">
                <header className="student-modal-head">
                  <div>
                    <h4>{manageSelectedStudent.name} - Fee Details</h4>
                    <p>
                      {manageSelectedStudent.classLabel}
                      {manageSelectedStudent.section ? ` · Section ${manageSelectedStudent.section}` : ''}
                    </p>
                  </div>
                  <button type="button" className="modal-close-btn" onClick={closeManageStudentDetailsModal}>
                    Close
                  </button>
                </header>

                <div className="manage-fee-detail-summary-grid">
                  <article>
                    <span>Total Fees</span>
                    <strong>{formatInr(selectedStudentFeeSummary.total)}</strong>
                  </article>
                  <article>
                    <span>Total Collected</span>
                    <strong>{formatInr(selectedStudentFeeSummary.paid)}</strong>
                  </article>
                  <article>
                    <span>Balance</span>
                    <strong>{formatInr(selectedStudentFeeSummary.remaining)}</strong>
                  </article>
                  <article>
                    <span>Collection %</span>
                    <strong>
                      {selectedStudentFeeSummary.total ? Math.round((selectedStudentFeeSummary.paid / selectedStudentFeeSummary.total) * 100) : 0}%
                    </strong>
                  </article>
                </div>

                <div className="manage-fee-detail-charts">
                  <article className="manage-fee-detail-chart-card donut-card">
                    <header>
                      <h5>Collected vs Remaining</h5>
                    </header>
                    <div className="manage-fee-detail-donut">
                      <svg viewBox="0 0 220 220" role="img" aria-label="Collected versus remaining donut chart">
                        {manageSelectedStudentCollectionSegments.length === 0 ? (
                          <>
                            <circle cx="110" cy="110" r="82" className="status-donut-base" />
                            <circle cx="110" cy="110" r="82" className="status-donut-zero-ring" />
                          </>
                        ) : (
                          manageSelectedStudentCollectionSegments.map((segment) => (
                            <path
                              key={segment.key}
                              d={segment.path}
                              fill={segment.color}
                              className="status-donut-segment"
                              onMouseMove={(event) => {
                                setOverviewTooltip({
                                  x: event.clientX,
                                  y: event.clientY,
                                  title: segment.label,
                                  lines: [
                                    `${segment.share.toFixed(1)}% of total fees`,
                                    `${formatInr(segment.amount)}`,
                                    segment.key === 'PAID' ? 'Collected amount' : 'Remaining amount',
                                  ],
                                });
                              }}
                              onMouseLeave={() => setOverviewTooltip(null)}
                            />
                          ))
                        )}
                        <circle cx="110" cy="110" r="54" fill="#ffffff" />
                        <text x="110" y="104" textAnchor="middle" className="status-donut-value">
                          {selectedStudentFeeSummary.total
                            ? Math.round((selectedStudentFeeSummary.paid / selectedStudentFeeSummary.total) * 100)
                            : 0}
                          %
                        </text>
                        <text x="110" y="124" textAnchor="middle" className="status-donut-sub">
                          collected
                        </text>
                      </svg>
                    </div>
                    <div className="manage-fee-detail-donut-caption">
                      <strong>{formatInr(selectedStudentFeeSummary.paid)}</strong>
                      <span>Collected of {formatInr(selectedStudentFeeSummary.total)}</span>
                    </div>
                  </article>

                  <article className="manage-fee-detail-chart-card type-card">
                    <header>
                      <h5>Fee Type Breakdown</h5>
                    </header>
                    <div className="manage-fee-detail-type-list">
                      {manageSelectedStudentTypeBreakdown.map((item) => {
                        const collectedShare = item.totalAmount ? (item.paidAmount / item.totalAmount) * 100 : 0;
                        const pendingShare = item.totalAmount ? (item.pendingAmount / item.totalAmount) * 100 : 0;
                        return (
                          <div
                            key={item.key}
                            className="manage-fee-detail-type-item"
                            onMouseMove={(event) => {
                              setOverviewTooltip({
                                x: event.clientX,
                                y: event.clientY,
                                title: item.label,
                                lines: [
                                  `${item.count} fee records`,
                                  `Total ${formatInr(item.totalAmount)}`,
                                  `Collected ${formatInr(item.paidAmount)}`,
                                  `Pending ${formatInr(item.pendingAmount)}`,
                                ],
                              });
                            }}
                            onMouseLeave={() => setOverviewTooltip(null)}
                          >
                            <div className="manage-fee-detail-type-head">
                              <div className="finance-manage-type-title">
                                <span className="status-dot" style={{ background: item.color }} />
                                <strong>{item.label}</strong>
                              </div>
                              <strong>{formatInr(item.totalAmount)}</strong>
                            </div>
                            <div className="manage-fee-detail-type-track">
                              <span
                                className="manage-fee-detail-type-collected"
                                style={{ background: item.color, width: `${Math.max(collectedShare, 4)}%` }}
                              />
                              <span className="manage-fee-detail-type-pending" style={{ width: `${Math.max(pendingShare, 0)}%` }} />
                            </div>
                            <div className="manage-fee-detail-type-foot">
                              <span>{collectedShare.toFixed(0)}% collected</span>
                              <span>{pendingShare.toFixed(0)}% pending</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </article>
                </div>

                <div className="manage-fee-detail-panels">
                  <section className="manage-fee-detail-panel ledger-panel">
                    <header>
                      <div>
                        <h5>Fee Ledger</h5>
                        <span>All fee types for this student</span>
                      </div>
                    </header>
                    <div className="manage-fee-detail-ledger-head">
                      <span>Date</span>
                      <span className="manage-fee-detail-ledger-type">Fee Type</span>
                      <span>Amount</span>
                      <span>Paid</span>
                      <span>Balance</span>
                      <span>Status</span>
                    </div>
                    <div className="manage-fee-detail-ledger-body">
                      {manageSelectedStudent.fees.map((fee) => {
                        const paidAmount = getFeePaidAmount(fee);
                        const remainingAmount = getFeeRemainingAmount(fee);
                        const feeStatus = remainingAmount <= 0 ? 'PAID' : paidAmount > 0 ? 'PARTIAL' : 'PENDING';
                        return (
                          <div key={fee.id} className="manage-fee-detail-ledger-row">
                            <span>{new Date(fee.createdAt).toLocaleDateString()}</span>
                            <span className="manage-fee-detail-ledger-type">{fee.type}</span>
                            <span>{formatInr(Number(fee.total ?? 0))}</span>
                            <span>{formatInr(paidAmount)}</span>
                            <span>{formatInr(remainingAmount)}</span>
                            <span>
                              <i className={`status-chip ${feeStatus === 'PAID' ? 'paid' : feeStatus === 'PARTIAL' ? 'partial' : 'pending'}`}>
                                {feeStatus}
                              </i>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  <section className="manage-fee-detail-panel">
                    <header>
                      <div>
                        <h5>Full Payment History</h5>
                        <span>{manageSelectedStudentPayments.length} payments recorded</span>
                      </div>
                    </header>
                    <div className="manage-fee-detail-history">
                      {manageSelectedStudentPayments.length === 0 ? (
                        <p className="fee-empty">No payment history available for this student.</p>
                      ) : (
                        manageSelectedStudentPayments.map((payment) => (
                          <article key={payment.id} className="manage-fee-detail-history-item">
                            <div className="finance-manage-history-badge">
                              <span className={`status-chip ${payment.status === 'SUCCESS' ? 'paid' : 'pending'}`}>
                                {payment.status}
                              </span>
                              <small>{payment.fee.type}</small>
                            </div>
                            <div className="finance-manage-history-meta">
                              <strong>{formatInr(Number(payment.amount ?? 0))}</strong>
                              <span>{new Date(payment.createdAt).toLocaleString()}</span>
                            </div>
                            <div className="finance-manage-history-extra">
                              <span>{payment.method}</span>
                              <span>Fee #{payment.fee.id}</span>
                            </div>
                          </article>
                        ))
                      )}
                    </div>
                  </section>
                </div>
              </div>
            </div>
          ) : null}

          {feePage === 'transactions' ? (
            <section className="finance-card finance-full">
              <div className="finance-full-head">
                <h4>Transactions</h4>
              </div>
              <div className="finance-txn-table" role="table" aria-label="Fee transactions">
                <div className="finance-txn-head" role="row">
                  <span role="columnheader">Student</span>
                  <span role="columnheader">Class</span>
                  <span role="columnheader">Amount</span>
                  <span role="columnheader">Method</span>
                  <span role="columnheader">Status</span>
                  <span role="columnheader">Date</span>
                </div>
                <div className="finance-txn-body" role="rowgroup">
                  {feeTransactions.length ? (
                    feeTransactions.map((payment) => (
                      <div key={payment.id} className="finance-txn-row" role="row">
                        <span role="cell">{payment.studentName}</span>
                        <span role="cell">{payment.classLabel}</span>
                        <span role="cell">{Number(payment.amount).toFixed(2)}</span>
                        <span role="cell">{payment.method}</span>
                        <span role="cell">{payment.status}</span>
                        <span role="cell">{new Date(payment.createdAt).toLocaleDateString()}</span>
                      </div>
                    ))
                  ) : (
                    <div className="finance-txn-empty" role="status" aria-live="polite">
                      No transaction records available.
                    </div>
                  )}
                </div>
              </div>
            </section>
          ) : null}

          {feePage === 'student-details' ? (
            <section className="finance-student-shell">
              <aside className="finance-student-list">
                <h4>Student Search</h4>
                <input
                  type="text"
                  placeholder="Search student name or class..."
                  value={feeStudentSearch}
                  onChange={(event) => setFeeStudentSearch(event.target.value)}
                />
                <div className="finance-student-scroll">
                  {filteredFeeStudents.map((student) => (
                    <button
                      key={student.id}
                      type="button"
                      className={feeStudentDetailId === student.id ? 'active' : ''}
                      onClick={() => setFeeStudentDetailId(student.id)}
                    >
                      <strong>{student.name}</strong>
                      <span>{student.classLabel}</span>
                    </button>
                  ))}
                </div>
              </aside>

              <div className="finance-student-main">
                {!feeStudentDetailId ? <p className="multi-help">Select a student to view fee and payment history.</p> : null}
                {feeStudentDetailId ? (
                  <>
                    <section className="finance-kpis compact">
                      <article><p>Total Fees</p><strong>{selectedStudentFeeSummary.total.toFixed(2)}</strong></article>
                      <article><p>Paid</p><strong>{selectedStudentFeeSummary.paid.toFixed(2)}</strong></article>
                      <article><p>Remaining</p><strong>{selectedStudentFeeSummary.remaining.toFixed(2)}</strong></article>
                    </section>

                    {selectedStudentFeeRows.map((fee) => (
                      <article key={fee.id} className="finance-student-fee-card">
                        <header>
                          <strong>{fee.type} | {fee.academicYear}</strong>
                          <span>Remaining: {getFeeRemainingAmount(fee).toFixed(2)}</span>
                        </header>
                        <div className="finance-action-group">
                          {canManageFees ? (
                            <>
                              <button type="button" className="finance-action-btn" onClick={() => openRecordPaymentModal(fee)}>
                                Record Payment
                              </button>
                              <button type="button" className="finance-action-btn" onClick={() => openEditFeeModal(fee)}>
                                Edit Fee
                              </button>
                            </>
                          ) : null}
                        </div>
                        <div className="finance-detail-head">
                          <span>Amount</span>
                          <span>Method</span>
                          <span>Status</span>
                          <span>Date</span>
                          <span>Action</span>
                        </div>
                        <div className="finance-detail-body">
                          {(fee.payments ?? []).map((payment) => (
                            <div key={payment.id} className="finance-detail-row">
                              <span>{Number(payment.amount).toFixed(2)}</span>
                              <span>{payment.method}</span>
                              <span>{payment.status}</span>
                              <span>{new Date(payment.createdAt).toLocaleDateString()}</span>
                              <span>
                                {canManageFees ? (
                                  <button type="button" className="finance-action-btn" onClick={() => openEditPaymentModal(payment)}>
                                    Edit Payment
                                  </button>
                                ) : (
                                  'Read Only'
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      </article>
                    ))}
                  </>
                ) : null}
              </div>
            </section>
          ) : null}
        </section>
      )}

      {showAssignFeeModal ? (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <section className="exam-modal">
            <div className="student-modal-head">
              <div>
                <h4>Assign Fees</h4>
                <p>Assign fees to a class or selected students.</p>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setShowAssignFeeModal(false)}>
                Close
              </button>
            </div>
            <form className="exam-form" onSubmit={submitAssignFees}>
              <label className="field-block">
                <span className="field-label">Target Mode *</span>
                <select
                  value={assignFeeForm.targetMode}
                  onChange={(event) =>
                    setAssignFeeForm((prev) => ({
                      ...prev,
                      targetMode: event.target.value as 'class' | 'students',
                      studentIds: [],
                    }))
                  }
                >
                  <option value="class">Full Class</option>
                  <option value="students">Individual Students</option>
                </select>
              </label>
              <label className="field-block">
                <span className="field-label">Class *</span>
                <select
                  value={assignFeeForm.classId}
                  onChange={(event) => setAssignFeeForm((prev) => ({ ...prev, classId: event.target.value, studentIds: [] }))}
                  required
                >
                  <option value="">Select Class</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} - {cls.section}
                    </option>
                  ))}
                </select>
              </label>
              {assignFeeForm.targetMode === 'students' ? (
                <div className="exam-class-selector">
                  <div className="exam-class-selector-head">
                    <h5>Select Students *</h5>
                    <span>{assignFeeForm.studentIds.length} selected</span>
                  </div>
                  <div className="exam-class-selector-list">
                    {assignableStudents.map((student) => {
                      const checked = assignFeeForm.studentIds.includes(student.id);
                      return (
                        <label key={student.id} className={checked ? 'exam-class-option checked' : 'exam-class-option'}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(event) => {
                              const isChecked = event.target.checked;
                              setAssignFeeForm((prev) => ({
                                ...prev,
                                studentIds: isChecked
                                  ? [...prev.studentIds, student.id]
                                  : prev.studentIds.filter((id) => id !== student.id),
                              }));
                            }}
                          />
                          <div>
                            <strong>{student.name}</strong>
                            <p>ID: {student.id}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ) : null}
              <label className="field-block">
                <span className="field-label">Fee Type *</span>
                <select
                  value={assignFeeForm.type}
                  onChange={(event) =>
                    setAssignFeeForm((prev) => ({
                      ...prev,
                      type: event.target.value as 'TUITION' | 'BUS' | 'EXAM' | 'OTHER',
                    }))
                  }
                  required
                >
                  <option value="TUITION">TUITION</option>
                  <option value="BUS">BUS</option>
                  <option value="EXAM">EXAM</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </label>
              <label className="field-block">
                <span className="field-label">Amount *</span>
                <input
                  type="number"
                  min={1}
                  value={assignFeeForm.total}
                  onChange={(event) => setAssignFeeForm((prev) => ({ ...prev, total: event.target.value }))}
                  required
                />
              </label>
              <label className="field-block">
                <span className="field-label">Academic Year *</span>
                <input
                  type="text"
                  placeholder="2026-2027"
                  value={assignFeeForm.academicYear}
                  onChange={(event) => setAssignFeeForm((prev) => ({ ...prev, academicYear: event.target.value }))}
                  required
                />
              </label>
              <div className="student-modal-actions">
                <button type="submit" disabled={assignFeeLoading}>
                  {assignFeeLoading ? 'Assigning...' : 'Assign Fees'}
                </button>
                <button type="button" className="secondary" onClick={() => setShowAssignFeeModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}

      {showRecordPaymentModal && selectedFeeForPayment ? (
        <div className="modal-overlay nested" role="dialog" aria-modal="true">
          <section className="exam-modal">
            <div className="student-modal-head">
              <div>
                <h4>Record Payment</h4>
                <p>
                  {selectedFeeForPayment.student?.name ?? `Student ${selectedFeeForPayment.studentId}`} | Remaining:{' '}
                  {getFeeRemainingAmount(selectedFeeForPayment).toFixed(2)}
                </p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => {
                  setShowRecordPaymentModal(false);
                  setSelectedFeeForPayment(null);
                }}
              >
                Close
              </button>
            </div>
            <form className="exam-form" onSubmit={submitRecordPayment}>
              <label className="field-block">
                <span className="field-label">Amount Paid *</span>
                <input
                  type="number"
                  min={1}
                  value={paymentForm.amount}
                  onChange={(event) => setPaymentForm((prev) => ({ ...prev, amount: event.target.value }))}
                  required
                />
              </label>
              <label className="field-block">
                <span className="field-label">Payment Mode *</span>
                <select
                  value={paymentForm.method}
                  onChange={(event) => setPaymentForm((prev) => ({ ...prev, method: event.target.value as 'ONLINE' | 'CASH' }))}
                >
                  <option value="ONLINE">ONLINE</option>
                  <option value="CASH">CASH</option>
                </select>
              </label>
              <label className="field-block">
                <span className="field-label">Status *</span>
                <select
                  value={paymentForm.status}
                  onChange={(event) =>
                    setPaymentForm((prev) => ({ ...prev, status: event.target.value as 'PENDING' | 'SUCCESS' | 'REJECTED' }))
                  }
                >
                  <option value="SUCCESS">SUCCESS</option>
                  <option value="PENDING">PENDING</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </label>
              <div className="student-modal-actions">
                <button type="submit" disabled={recordPaymentLoading}>
                  {recordPaymentLoading ? 'Saving...' : 'Record Payment'}
                </button>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => {
                    setShowRecordPaymentModal(false);
                    setSelectedFeeForPayment(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}

      {showEditFeeModal ? (
        <div className="modal-overlay nested" role="dialog" aria-modal="true">
          <section className="exam-modal">
            <div className="student-modal-head">
              <div>
                <h4>Update Fee</h4>
                <p>Modify fee type, amount, and academic year.</p>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setShowEditFeeModal(false)}>
                Close
              </button>
            </div>
            <form className="exam-form" onSubmit={submitUpdateFee}>
              <label className="field-block">
                <span className="field-label">Fee Type *</span>
                <select value={editFeeForm.type} onChange={(event) => setEditFeeForm((prev) => ({ ...prev, type: event.target.value as 'TUITION' | 'BUS' | 'EXAM' | 'OTHER' }))}>
                  <option value="TUITION">TUITION</option>
                  <option value="BUS">BUS</option>
                  <option value="EXAM">EXAM</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </label>
              <label className="field-block">
                <span className="field-label">Amount *</span>
                <input type="number" min={1} value={editFeeForm.total} onChange={(event) => setEditFeeForm((prev) => ({ ...prev, total: event.target.value }))} required />
              </label>
              <label className="field-block">
                <span className="field-label">Academic Year *</span>
                <input type="text" value={editFeeForm.academicYear} onChange={(event) => setEditFeeForm((prev) => ({ ...prev, academicYear: event.target.value }))} required />
              </label>
              <div className="student-modal-actions">
                <button type="submit">Update Fee</button>
                <button type="button" className="secondary" onClick={() => setShowEditFeeModal(false)}>Cancel</button>
              </div>
            </form>
          </section>
        </div>
      ) : null}

      {showEditPaymentModal ? (
        <div className="modal-overlay nested" role="dialog" aria-modal="true">
          <section className="exam-modal">
            <div className="student-modal-head">
              <div>
                <h4>Update Payment</h4>
                <p>Edit payment amount, method, and status.</p>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setShowEditPaymentModal(false)}>
                Close
              </button>
            </div>
            <form className="exam-form" onSubmit={submitUpdatePayment}>
              <label className="field-block">
                <span className="field-label">Amount *</span>
                <input
                  type="number"
                  min={1}
                  value={editPaymentForm.amount}
                  onChange={(event) => setEditPaymentForm((prev) => ({ ...prev, amount: event.target.value }))}
                  required
                />
              </label>
              <label className="field-block">
                <span className="field-label">Payment Mode *</span>
                <select
                  value={editPaymentForm.method}
                  onChange={(event) => setEditPaymentForm((prev) => ({ ...prev, method: event.target.value as 'ONLINE' | 'CASH' }))}
                >
                  <option value="ONLINE">ONLINE</option>
                  <option value="CASH">CASH</option>
                </select>
              </label>
              <label className="field-block">
                <span className="field-label">Status *</span>
                <select
                  value={editPaymentForm.status}
                  onChange={(event) =>
                    setEditPaymentForm((prev) => ({ ...prev, status: event.target.value as 'PENDING' | 'SUCCESS' | 'REJECTED' }))
                  }
                >
                  <option value="SUCCESS">SUCCESS</option>
                  <option value="PENDING">PENDING</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </label>
              <div className="student-modal-actions">
                <button type="submit">Update Payment</button>
                <button type="button" className="secondary" onClick={() => setShowEditPaymentModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </article>
  );

  const validateExamCreateForm = (form: {
    name: string;
    subjectId: string;
    totalMarks: string;
    examDate: string;
    classIds: number[];
  }) => {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = 'Exam name is required.';
    if (!form.subjectId) errors.subjectId = 'Subject is required.';
    if (!form.totalMarks || Number(form.totalMarks) <= 0) errors.totalMarks = 'Total marks must be greater than 0.';
    if (!form.examDate) errors.examDate = 'Exam date is required.';
    if (form.classIds.length === 0) errors.classIds = 'Select at least one class.';
    return errors;
  };

  const validateExamEditForm = (form: {
    id: string;
    name: string;
    subjectId: string;
    totalMarks: string;
    examDate: string;
    classId: string;
  }) => {
    const errors: Record<string, string> = {};
    if (!form.id) errors.id = 'Exam id missing.';
    if (!form.name.trim()) errors.name = 'Exam name is required.';
    if (!form.subjectId) errors.subjectId = 'Subject is required.';
    if (!form.totalMarks || Number(form.totalMarks) <= 0) errors.totalMarks = 'Total marks must be greater than 0.';
    if (!form.examDate) errors.examDate = 'Exam date is required.';
    if (!form.classId) errors.classId = 'Class is required.';
    return errors;
  };

  const createExam = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = validateExamCreateForm(createExamForm);
    setCreateExamErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error('Please fix the highlighted fields.');
      return;
    }

    setCreateExamLoading(true);
    try {
      const outcomes: Array<{ ok: boolean; message: string }> = [];
      for (const classId of createExamForm.classIds) {
        const response = await fetch(`${API_BASE}/class/create-exam`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            exam_name: createExamForm.name,
            totalMarks: Number(createExamForm.totalMarks),
            subjectId: Number(createExamForm.subjectId),
            examDate: new Date(createExamForm.examDate).toISOString(),
            classId,
          }),
        });

        const result = await readJson<{ message?: string }>(response);
        outcomes.push({ ok: response.ok, message: result?.message ?? (response.ok ? 'Created' : 'Failed') });
      }

      const failed = outcomes.filter((outcome) => !outcome.ok);
      if (failed.length > 0) {
        toast.error(failed[0].message);
      } else {
        toast.success('Exam created for selected classes.');
      }

      setCreateExamForm({
        name: '',
        subjectId: '',
        totalMarks: '',
        examDate: '',
        classIds: [],
      });
      setCreateExamClassSearch('');
      setCreateExamErrors({});
      setShowCreateExamModal(false);
      await loadExamModuleData();
    } catch {
      toast.error('Network error while creating exam.');
    } finally {
      setCreateExamLoading(false);
    }
  };

  const openEditExam = (exam: ExamOption) => {
    setEditingExamId(exam.id);
    setEditExamErrors({});
    const examDate = exam.examDate ? new Date(exam.examDate).toISOString().slice(0, 10) : '';
    setEditExamForm({
      id: String(exam.id),
      name: exam.name ?? '',
      subjectId: String(exam.subjectId ?? ''),
      totalMarks: String(exam.totalMarks ?? ''),
      examDate,
      classId: String(exam.classId ?? ''),
    });
  };

  const updateExam = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = validateExamEditForm(editExamForm);
    setEditExamErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error('Please fix the highlighted fields.');
      return;
    }

    setUpdateExamLoading(true);
    try {
      const response = await fetch(`${API_BASE}/class/update-exam/${editExamForm.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editExamForm.name,
          totalMarks: Number(editExamForm.totalMarks),
          subjectId: Number(editExamForm.subjectId),
          examDate: new Date(editExamForm.examDate).toISOString(),
          classId: Number(editExamForm.classId),
        }),
      });

      const result = await readJson<{ message?: string }>(response);
      if (!response.ok) {
        toast.error(result?.message ?? 'Failed to update exam.');
        return;
      }

      toast.success(result?.message ?? 'Exam updated successfully.');
      setEditingExamId(null);
      setEditExamErrors({});
      await loadExamModuleData();
    } catch {
      toast.error('Network error while updating exam.');
    } finally {
      setUpdateExamLoading(false);
    }
  };

  const filteredSubjectRows = useMemo(() => {
    const query = subjectSearch.trim().toLowerCase();
    if (!query) {
      return subjects;
    }
    return subjects.filter((subject) => subject.name.toLowerCase().includes(query) || String(subject.id).includes(query));
  }, [subjects, subjectSearch]);

  const filteredSubjectClassOptions = useMemo(() => {
    const query = subjectClassSearch.trim().toLowerCase();
    if (!query) {
      return classes;
    }
    return classes.filter((cls) => String(cls.name).toLowerCase().includes(query) || cls.section.toLowerCase().includes(query));
  }, [classes, subjectClassSearch]);

  const filteredEditSubjectClassOptions = useMemo(() => {
    const query = editSubjectClassSearch.trim().toLowerCase();
    if (!query) {
      return classes;
    }
    return classes.filter((cls) => String(cls.name).toLowerCase().includes(query) || cls.section.toLowerCase().includes(query));
  }, [classes, editSubjectClassSearch]);

  const validateSubjectCreateForm = (form: { name: string; classIds: number[] }) => {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = 'Subject name is required.';
    if (form.classIds.length === 0) errors.classIds = 'Select at least one class.';
    return errors;
  };

  const validateSubjectEditForm = (form: { id: string; name: string; classIds: number[] }) => {
    const errors: Record<string, string> = {};
    if (!form.id) errors.id = 'Subject id missing.';
    if (!form.name.trim()) errors.name = 'Subject name is required.';
    return errors;
  };

  const createSubject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = validateSubjectCreateForm(createSubjectForm);
    setCreateSubjectErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error('Please fix the highlighted fields.');
      return;
    }

    setCreateSubjectLoading(true);
    try {
      const outcomes: Array<{ ok: boolean; message: string }> = [];
      for (const classId of createSubjectForm.classIds) {
        const response = await fetch(`${API_BASE}/class/create-subject`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: createSubjectForm.name,
            classId,
          }),
        });
        const result = await readJson<{ message?: string }>(response);
        outcomes.push({ ok: response.ok, message: result?.message ?? (response.ok ? 'Created' : 'Failed') });
      }

      const failed = outcomes.filter((outcome) => !outcome.ok);
      if (failed.length > 0) {
        toast.error(failed[0].message);
      } else {
        toast.success('Subject assigned to selected classes.');
      }

      setCreateSubjectForm({ name: '', classIds: [] });
      setSubjectClassSearch('');
      setCreateSubjectErrors({});
      setShowCreateSubjectModal(false);
      await loadSubjectModuleData();
    } catch {
      toast.error('Network error while creating subject.');
    } finally {
      setCreateSubjectLoading(false);
    }
  };

  const openEditSubject = (subject: SubjectOption) => {
    setEditingSubjectId(subject.id);
    setEditSubjectErrors({});
    setEditSubjectClassSearch('');
    setEditSubjectForm({
      id: String(subject.id),
      name: subject.name,
      classIds: (subject.classsubject ?? [])
        .map((mapping) => mapping.class?.id ?? mapping.classId)
        .filter((id): id is number => typeof id === 'number'),
    });
  };

  const updateSubject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = validateSubjectEditForm(editSubjectForm);
    setEditSubjectErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error('Please fix the highlighted fields.');
      return;
    }

    setUpdateSubjectLoading(true);
    try {
      const response = await fetch(`${API_BASE}/class/update-subject/${editSubjectForm.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editSubjectForm.name,
        }),
      });

      const result = await readJson<{ message?: string }>(response);
      if (!response.ok) {
        toast.error(result?.message ?? 'Failed to update subject.');
        return;
      }

      const mappingResponse = await fetch(`${API_BASE}/class/update-subject-classes/${editSubjectForm.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          classIds: editSubjectForm.classIds,
        }),
      });

      const mappingResult = await readJson<{ message?: string }>(mappingResponse);
      if (!mappingResponse.ok) {
        toast.error(mappingResult?.message ?? 'Failed to update subject classes.');
        return;
      }

      toast.success(result?.message ?? 'Subject updated successfully.');
      setEditingSubjectId(null);
      setEditSubjectErrors({});
      await loadSubjectModuleData();
    } catch {
      toast.error('Network error while updating subject.');
    } finally {
      setUpdateSubjectLoading(false);
    }
  };

  const studentImportValidRows = useMemo(() => studentImportRows.filter((row) => row.valid), [studentImportRows]);
  const studentImportInvalidRows = useMemo(() => studentImportRows.filter((row) => !row.valid), [studentImportRows]);
  const studentImportPreviewRows = useMemo(() => studentImportRows, [studentImportRows]);
  const studentImportSummary = useMemo(() => {
    const validRows = studentImportValidRows;
    const invalidRows = studentImportInvalidRows;
    const fatherKeys = new Set<string>();
    const motherKeys = new Set<string>();
    let fatherCount = 0;
    let motherCount = 0;
    let reusedParents = 0;

    for (const row of validRows) {
      const father = row.parents.father;
      if (father.name || father.phone || father.aadhar) {
        fatherCount += 1;
        const key = buildParentImportKey(father, 'FATHER');
        if (!fatherKeys.has(key)) {
          fatherKeys.add(key);
          const matched = parents.some((parent) => {
            const parentKey =
              (parent.type === 'FATHER'
                ? 'FATHER'
                : parent.type === 'MOTHER'
                  ? 'MOTHER'
                  : normalizeImportText(parent.relation).toUpperCase()) || 'GUARDIAN';
            const normalizedAadhar = normalizeImportDigits(parent.adharnumber);
            const normalizedPhone = normalizeImportDigits(parent.phone1);
            const importAadhar = normalizeImportDigits(father.aadhar);
            const importPhone = normalizeImportDigits(father.phone);
            const importName = normalizeImportText(father.name).toLowerCase();
            const parentName = normalizeImportText(parent.name).toLowerCase();
            return (
              parentKey === 'FATHER' &&
              ((importAadhar && normalizedAadhar === importAadhar) ||
                (!importAadhar && importPhone && normalizedPhone === importPhone) ||
                (!importAadhar && !importPhone && importName && parentName === importName))
            );
          });
          if (matched) reusedParents += 1;
        }
      }

      const mother = row.parents.mother;
      if (mother.name || mother.phone || mother.aadhar) {
        motherCount += 1;
        const key = buildParentImportKey(mother, 'MOTHER');
        if (!motherKeys.has(key)) {
          motherKeys.add(key);
          const matched = parents.some((parent) => {
            const parentKey =
              (parent.type === 'MOTHER'
                ? 'MOTHER'
                : parent.type === 'FATHER'
                  ? 'FATHER'
                  : normalizeImportText(parent.relation).toUpperCase()) || 'GUARDIAN';
            const normalizedAadhar = normalizeImportDigits(parent.adharnumber);
            const normalizedPhone = normalizeImportDigits(parent.phone1);
            const importAadhar = normalizeImportDigits(mother.aadhar);
            const importPhone = normalizeImportDigits(mother.phone);
            const importName = normalizeImportText(mother.name).toLowerCase();
            const parentName = normalizeImportText(parent.name).toLowerCase();
            return (
              parentKey === 'MOTHER' &&
              ((importAadhar && normalizedAadhar === importAadhar) ||
                (!importAadhar && importPhone && normalizedPhone === importPhone) ||
                (!importAadhar && !importPhone && importName && parentName === importName))
            );
          });
          if (matched) reusedParents += 1;
        }
      }
    }

    return {
      totalRows: studentImportRows.length,
      studentsToCreate: validRows.length,
      motherCount,
      fatherCount,
      reusedParents,
      skippedRows: invalidRows.length,
    };
  }, [parents, studentImportInvalidRows, studentImportRows.length, studentImportValidRows]);

  return (
    <main className="dashboard-page">
      {user.role !== 'PRINCIPAL' && user.role !== 'PARENT' ? (
        <header className="dashboard-header">
          <div className="nav-brand">
            <img src={logo} alt="IDPS Logo" className="nav-logo" />
            <div>
              <p className="role-chip">{user.role}</p>
              <h1>{roleTitle}</h1>
              <p className="dashboard-subtitle">Welcome back, {user.name}</p>
            </div>
          </div>

          <div className="nav-user">
            <span>{user.name.charAt(0).toUpperCase()}</span>
          </div>
        </header>
      ) : null}

      {user.role === 'PRINCIPAL' ? (
        <section className="principal-shell">
          <aside className="principal-menu">
            <div className="principal-menu-top">
              <div className="principal-menu-brand">
                <img src={logo} alt="IDPS Logo" />
                <span>IDPS KOVVUR</span>
              </div>
            </div>
            <div className="principal-menu-list">
              {principalMenus.map((menu) => (
                <button
                  key={menu.name}
                  type="button"
                  className={activePrincipalMenu === menu.name ? 'principal-menu-btn active' : 'principal-menu-btn'}
                  onClick={() => setActivePrincipalMenu(menu.name)}
                >
                  <menu.Icon />
                  {menu.name}
                </button>
              ))}
            </div>

            <div className="principal-menu-footer">
              <button type="button" className="principal-menu-btn">
                <LuSettings />
                Settings
              </button>
              <button type="button" className="principal-menu-btn logout-side" onClick={onLogout}>
                <LuLogOut />
                Logout
              </button>
            </div>
          </aside>

          <section className="principal-board">
            {activePrincipalMenu === 'Import Data' ? (
              <article className="panel module-panel import-module">
                <div className="import-header">
                  <div>
                    <p className="section-eyebrow">Bulk import</p>
                    <h3>Students Data Import</h3>
                    <p className="student-subtitle">Upload a CSV, validate the rows, and create students plus parent links in one pass.</p>
                  </div>
                  <div className="import-header-badge">
                    <LuUpload />
                    CSV import
                  </div>
                </div>

                <div className="import-toolbar">
                  <label className="import-file-button">
                    <input type="file" accept=".csv,text/csv" onChange={handleStudentImportFileInput} />
                    <span>{studentImportFileName || 'Choose CSV file'}</span>
                  </label>
                  <label className="import-input-group">
                    <span>Class</span>
                    <select
                      value={studentImportClassId}
                      onChange={(event) => setStudentImportClassId(event.target.value)}
                    >
                      <option value="">Apply to all rows</option>
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name}-{cls.section}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    className="import-action import-action-primary"
                    onClick={handleStudentImportSubmit}
                    disabled={studentImportParsing || studentImportImporting || !studentImportRows.length || !studentImportValidRows.length}
                  >
                    {studentImportImporting ? 'Importing...' : 'Review & Confirm'}
                  </button>
                  <button
                    type="button"
                    className="import-action import-action-secondary"
                    onClick={handleStudentImportReset}
                  >
                    Reset
                  </button>
                </div>

                <div className="import-summary-grid">
                  <div className="import-summary-card">
                    <span>Total Rows</span>
                    <strong>{studentImportSummary.totalRows}</strong>
                  </div>
                  <div className="import-summary-card success">
                    <span>Students</span>
                    <strong>{studentImportSummary.studentsToCreate}</strong>
                  </div>
                  <div className="import-summary-card warning">
                    <span>Skipped</span>
                    <strong>{studentImportSummary.skippedRows}</strong>
                  </div>
                  <div className="import-summary-card">
                    <span>Class</span>
                    <strong>{studentImportClassId ? classes.find((cls) => String(cls.id) === studentImportClassId)?.name ?? '—' : '—'}</strong>
                  </div>
                  <div className="import-summary-card success">
                    <span>Mothers</span>
                    <strong>{studentImportSummary.motherCount}</strong>
                  </div>
                  <div className="import-summary-card success">
                    <span>Fathers</span>
                    <strong>{studentImportSummary.fatherCount}</strong>
                  </div>
                  <div className="import-summary-card warning">
                    <span>Reusable Parents</span>
                    <strong>{studentImportSummary.reusedParents}</strong>
                  </div>
                  <div className="import-summary-card">
                    <span>Invalid Rows</span>
                    <strong>{studentImportSummary.skippedRows}</strong>
                  </div>
                </div>

                {studentImportParsing ? (
                  <div className="import-state">Reading and validating CSV rows...</div>
                ) : null}

                {studentImportResult ? (
                  <div className="import-result-banner">
                    <div>
                      <p>Import completed for {studentImportResult.className || `Class ${studentImportResult.classId ?? ''}`}</p>
                      <strong>
                        {studentImportResult.createdStudents} student(s) created, {studentImportResult.createdParents} parent record(s) created
                      </strong>
                    </div>
                    <div className="import-result-meta">
                      <span>Mothers: {studentImportResult.createdMothers}</span>
                      <span>Fathers: {studentImportResult.createdFathers}</span>
                      <span>Linked: {studentImportResult.linkedParents}</span>
                      <span>Relations: {studentImportResult.linkedRelations}</span>
                      <span>Reused: {studentImportResult.reusedParents}</span>
                      <span>Skipped: {studentImportResult.skippedRows}</span>
                    </div>
                  </div>
                ) : null}

                <div className="import-grid">
                  <section className="import-card import-card-wide">
                    <div className="import-card-head">
                      <div>
                        <h4>Preview Table</h4>
                        <span>{studentImportPreviewRows.length} parsed row(s)</span>
                      </div>
                      <span>{studentImportPreviewRows.length} row(s)</span>
                    </div>
                    <div className="import-table-scroll">
                      <table className="import-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Admission No</th>
                            <th>Student</th>
                            <th>Gender</th>
                            <th>DOB</th>
                            <th>Parents</th>
                            <th>Status</th>
                            <th>Reason</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {studentImportPreviewRows.length ? (
                            studentImportPreviewRows.map((row, index) => (
                              <tr key={row.rowNumber} className={row.valid ? 'row-valid' : 'row-invalid'}>
                                <td>{row.rowNumber}</td>
                                <td>{row.admissionno}</td>
                                <td>
                                  <strong>{row.name || '—'}</strong>
                                </td>
                                <td>{row.gender || '—'}</td>
                                <td>{row.dob || '—'}</td>
                                <td>
                                  <div className="import-parent-stack">
                                    <span>F: {row.parents.father.name || '—'}</span>
                                    <span>M: {row.parents.mother.name || '—'}</span>
                                  </div>
                                </td>
                                <td>
                                  <span className={row.valid ? 'import-status success' : 'import-status danger'}>
                                    {row.valid ? 'Ready' : 'Review'}
                                  </span>
                                </td>
                                <td className="import-error-cell">
                                  {row.errors.length ? row.errors.join(' • ') : '—'}
                                </td>
                                <td>
                                  <button type="button" className="import-row-edit-btn" onClick={() => openStudentImportRowEditor(row, index)}>
                                    <LuPencil />
                                    Edit
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={9}>
                                <div className="import-empty">
                                  Upload a CSV file to see the parsed rows here.
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </section>

                  <section className="import-card import-card-side">
                    <div className="import-card-head">
                      <div>
                        <h4>Validation</h4>
                        <span>Rows ready for bulk insert</span>
                      </div>
                      <span>{studentImportValidRows.length}</span>
                    </div>

                    <div className="import-validation-stack">
                      <div className="import-validation-pill success">
                        <LuCircleCheck />
                        <div>
                          <strong>{studentImportValidRows.length}</strong>
                          <span>Valid rows</span>
                        </div>
                      </div>
                      <div className="import-validation-pill warning">
                        <LuCircleAlert />
                        <div>
                          <strong>{studentImportInvalidRows.length}</strong>
                          <span>Rows to fix</span>
                        </div>
                      </div>
                    </div>

                    <div className="import-note">
                      Students, parents, and parent-student links are created inside transactional batches, so a bad row will not break the entire import.
                    </div>

                    <button
                      type="button"
                      className="import-link-button"
                      onClick={downloadStudentImportErrors}
                      disabled={!studentImportInvalidRows.length}
                    >
                      <LuDownload />
                      Download error report
                    </button>

                    <div className="import-error-panel">
                      <div className="import-card-head compact">
                        <div>
                          <h4>Validation errors</h4>
                          <span>First few issues</span>
                        </div>
                      </div>
                      {studentImportInvalidRows.length ? (
                        <ul className="import-error-list">
                          {studentImportInvalidRows.slice(0, 6).map((row) => (
                            <li key={row.rowNumber}>
                              <strong>Row {row.rowNumber}</strong>
                              <span>{row.errors.join(' • ')}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="import-empty small">No validation errors yet.</div>
                      )}
                    </div>
                  </section>
                </div>

                {showStudentImportConfirm ? (
                  <div
                    className="import-modal-overlay"
                    role="presentation"
                    onClick={() => setShowStudentImportConfirm(false)}
                  >
                    <div className="import-modal import-confirm-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
                      <div className="import-modal-head">
                        <div>
                          <p className="section-eyebrow">Confirm import</p>
                          <h4>Review the final counts before uploading</h4>
                        </div>
                        <button type="button" className="import-modal-close" onClick={() => setShowStudentImportConfirm(false)}>
                          Close
                        </button>
                      </div>

                      <div className="import-summary-grid confirm">
                        <div className="import-summary-card">
                          <span>Total Rows</span>
                          <strong>{studentImportSummary.totalRows}</strong>
                        </div>
                        <div className="import-summary-card success">
                          <span>Students to Create</span>
                          <strong>{studentImportSummary.studentsToCreate}</strong>
                        </div>
                        <div className="import-summary-card success">
                          <span>Mother Records</span>
                          <strong>{studentImportSummary.motherCount}</strong>
                        </div>
                        <div className="import-summary-card success">
                          <span>Father Records</span>
                          <strong>{studentImportSummary.fatherCount}</strong>
                        </div>
                        <div className="import-summary-card warning">
                          <span>Reused Parents</span>
                          <strong>{studentImportSummary.reusedParents}</strong>
                        </div>
                        <div className="import-summary-card warning">
                          <span>Skipped Rows</span>
                          <strong>{studentImportSummary.skippedRows}</strong>
                        </div>
                      </div>

                      <div className="import-note">
                        Students and parents will be written in transactional batches. Invalid rows will stay skipped and can be exported with the error report.
                      </div>

                      <div className="import-modal-actions">
                        <button type="button" className="import-action import-action-secondary" onClick={() => setShowStudentImportConfirm(false)}>
                          Back to review
                        </button>
                        <button
                          type="button"
                          className="import-action import-action-primary"
                          onClick={handleStudentImportConfirm}
                          disabled={studentImportImporting}
                        >
                          Confirm & Import
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}

                {studentImportEditForm ? (
                  <div
                    className="import-modal-overlay"
                    role="presentation"
                    onClick={() => {
                      setStudentImportEditIndex(null);
                      setStudentImportEditForm(null);
                    }}
                  >
                    <div className="import-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
                      <div className="import-modal-head">
                        <div>
                          <p className="section-eyebrow">Edit Row</p>
                          <h4>Update preview data before upload</h4>
                        </div>
                        <button
                          type="button"
                          className="import-modal-close"
                          onClick={() => {
                            setStudentImportEditIndex(null);
                            setStudentImportEditForm(null);
                          }}
                        >
                          Close
                        </button>
                      </div>

                      <div className="import-modal-grid">
                        <label>
                          <span>Admission No</span>
                          <input
                            type="text"
                            value={studentImportEditForm.admissionno}
                            onChange={(event) =>
                              setStudentImportEditForm((prev) => (prev ? { ...prev, admissionno: event.target.value } : prev))
                            }
                          />
                        </label>
                        <label>
                          <span>Student Name</span>
                          <input
                            type="text"
                            value={studentImportEditForm.name}
                            onChange={(event) => setStudentImportEditForm((prev) => (prev ? { ...prev, name: event.target.value } : prev))}
                          />
                        </label>
                        <label>
                          <span>Gender</span>
                          <select
                            value={studentImportEditForm.gender}
                            onChange={(event) =>
                              setStudentImportEditForm((prev) => (prev ? { ...prev, gender: event.target.value as 'MALE' | 'FEMALE' | '' } : prev))
                            }
                          >
                            <option value="">Select Gender</option>
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                          </select>
                        </label>
                        <label>
                          <span>DOB</span>
                          <input
                            type="date"
                            value={studentImportEditForm.dob}
                            onChange={(event) => setStudentImportEditForm((prev) => (prev ? { ...prev, dob: event.target.value } : prev))}
                          />
                        </label>
                        <label>
                          <span>Aadhaar</span>
                          <input
                            type="text"
                            value={studentImportEditForm.adharnumber}
                            onChange={(event) =>
                              setStudentImportEditForm((prev) =>
                                prev ? { ...prev, adharnumber: normalizeImportDigits(event.target.value) } : prev,
                              )
                            }
                          />
                        </label>
                        <label>
                          <span>Pincode</span>
                          <input
                            type="text"
                            value={studentImportEditForm.pincode}
                            onChange={(event) =>
                              setStudentImportEditForm((prev) =>
                                prev ? { ...prev, pincode: normalizeImportDigits(event.target.value) } : prev,
                              )
                            }
                          />
                        </label>
                        <label>
                          <span>Mother Tongue</span>
                          <select
                            value={studentImportEditForm.mothertongue}
                            onChange={(event) =>
                              setStudentImportEditForm((prev) =>
                                prev ? { ...prev, mothertongue: event.target.value as StudentImportPreviewRow['mothertongue'] } : prev,
                              )
                            }
                          >
                            <option value="">Select</option>
                            <option value="TELUGU">Telugu</option>
                            <option value="URGU">Urgu</option>
                            <option value="ENGLISH">English</option>
                          </select>
                        </label>
                        <label>
                          <span>Social Category</span>
                          <select
                            value={studentImportEditForm.socialcategory}
                            onChange={(event) =>
                              setStudentImportEditForm((prev) =>
                                prev ? { ...prev, socialcategory: event.target.value as StudentImportPreviewRow['socialcategory'] } : prev,
                              )
                            }
                          >
                            <option value="">Select</option>
                            <option value="OC">OC</option>
                            <option value="BC_A">BC-A</option>
                            <option value="BC_B">BC-B</option>
                            <option value="BC_C">BC-C</option>
                            <option value="BC_D">BC-D</option>
                            <option value="BC_E">BC-E</option>
                            <option value="MBC_DNC">MBC-DNC</option>
                            <option value="SC">SC</option>
                            <option value="ST">ST</option>
                          </select>
                        </label>
                        <label>
                          <span>Blood Group</span>
                          <select
                            value={studentImportEditForm.bloodgroup}
                            onChange={(event) =>
                              setStudentImportEditForm((prev) =>
                                prev ? { ...prev, bloodgroup: event.target.value as StudentImportPreviewRow['bloodgroup'] } : prev,
                              )
                            }
                          >
                            <option value="">Select</option>
                            <option value="A_POS">A+</option>
                            <option value="A_NEG">A-</option>
                            <option value="B_POS">B+</option>
                            <option value="B_NEG">B-</option>
                            <option value="AB_POS">AB+</option>
                            <option value="AB_NEG">AB-</option>
                            <option value="O_POS">O+</option>
                            <option value="O_NEG">O-</option>
                          </select>
                        </label>
                        <label>
                          <span>Admission Date</span>
                          <input
                            type="date"
                            value={studentImportEditForm.admissiondate}
                            onChange={(event) =>
                              setStudentImportEditForm((prev) => (prev ? { ...prev, admissiondate: event.target.value } : prev))
                            }
                          />
                        </label>
                        <label>
                          <span>Height</span>
                          <input
                            type="text"
                            value={studentImportEditForm.height}
                            onChange={(event) =>
                              setStudentImportEditForm((prev) =>
                                prev ? { ...prev, height: String(normalizeImportInteger(event.target.value) ?? '') } : prev,
                              )
                            }
                          />
                        </label>
                        <label>
                          <span>Weight</span>
                          <input
                            type="text"
                            value={studentImportEditForm.weight}
                            onChange={(event) =>
                              setStudentImportEditForm((prev) =>
                                prev ? { ...prev, weight: String(normalizeImportInteger(event.target.value) ?? '') } : prev,
                              )
                            }
                          />
                        </label>
                        <label className="import-modal-full">
                          <span>Address</span>
                          <textarea
                            value={studentImportEditForm.address}
                            onChange={(event) =>
                              setStudentImportEditForm((prev) => (prev ? { ...prev, address: event.target.value } : prev))
                            }
                          />
                        </label>
                        <label>
                          <span>Father Name</span>
                          <input
                            type="text"
                            value={studentImportEditForm.parents.father.name}
                            onChange={(event) =>
                              setStudentImportEditForm((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      parents: {
                                        ...prev.parents,
                                        father: { ...prev.parents.father, name: event.target.value },
                                      },
                                    }
                                  : prev,
                              )
                            }
                          />
                        </label>
                        <label>
                          <span>Father Phone</span>
                          <input
                            type="text"
                            value={studentImportEditForm.parents.father.phone}
                            onChange={(event) =>
                              setStudentImportEditForm((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      parents: {
                                        ...prev.parents,
                                        father: { ...prev.parents.father, phone: normalizeImportDigits(event.target.value) },
                                      },
                                    }
                                  : prev,
                              )
                            }
                          />
                        </label>
                        <label>
                          <span>Father Aadhar</span>
                          <input
                            type="text"
                            value={studentImportEditForm.parents.father.aadhar}
                            onChange={(event) =>
                              setStudentImportEditForm((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      parents: {
                                        ...prev.parents,
                                        father: { ...prev.parents.father, aadhar: normalizeImportDigits(event.target.value) },
                                      },
                                    }
                                  : prev,
                              )
                            }
                          />
                        </label>
                        <label>
                          <span>Father Qualification</span>
                          <input
                            type="text"
                            value={studentImportEditForm.parents.father.qualification}
                            onChange={(event) =>
                              setStudentImportEditForm((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      parents: {
                                        ...prev.parents,
                                        father: { ...prev.parents.father, qualification: event.target.value },
                                      },
                                    }
                                  : prev,
                              )
                            }
                          />
                        </label>
                        <label>
                          <span>Mother Name</span>
                          <input
                            type="text"
                            value={studentImportEditForm.parents.mother.name}
                            onChange={(event) =>
                              setStudentImportEditForm((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      parents: {
                                        ...prev.parents,
                                        mother: { ...prev.parents.mother, name: event.target.value },
                                      },
                                    }
                                  : prev,
                              )
                            }
                          />
                        </label>
                        <label>
                          <span>Mother Phone</span>
                          <input
                            type="text"
                            value={studentImportEditForm.parents.mother.phone}
                            onChange={(event) =>
                              setStudentImportEditForm((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      parents: {
                                        ...prev.parents,
                                        mother: { ...prev.parents.mother, phone: normalizeImportDigits(event.target.value) },
                                      },
                                    }
                                  : prev,
                              )
                            }
                          />
                        </label>
                        <label>
                          <span>Mother Aadhar</span>
                          <input
                            type="text"
                            value={studentImportEditForm.parents.mother.aadhar}
                            onChange={(event) =>
                              setStudentImportEditForm((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      parents: {
                                        ...prev.parents,
                                        mother: { ...prev.parents.mother, aadhar: normalizeImportDigits(event.target.value) },
                                      },
                                    }
                                  : prev,
                              )
                            }
                          />
                        </label>
                        <label>
                          <span>Mother Qualification</span>
                          <input
                            type="text"
                            value={studentImportEditForm.parents.mother.qualification}
                            onChange={(event) =>
                              setStudentImportEditForm((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      parents: {
                                        ...prev.parents,
                                        mother: { ...prev.parents.mother, qualification: event.target.value },
                                      },
                                    }
                                  : prev,
                              )
                            }
                          />
                        </label>
                      </div>

                      <div className="import-modal-actions">
                        <button
                          type="button"
                          className="import-action import-action-secondary"
                          onClick={() => {
                            setStudentImportEditIndex(null);
                            setStudentImportEditForm(null);
                          }}
                        >
                          Cancel
                        </button>
                        <button type="button" className="import-action import-action-primary" onClick={saveStudentImportRowEditor}>
                          Save row
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </article>
            ) : activePrincipalMenu === 'Dashboard' ? (
              <section className="dashboard-soon">
                <p className="dashboard-soon-kicker">Dashboard</p>
                <h3>This section is building soon</h3>
                <p>We’re preparing a cleaner school ERP analytics hub for this area.</p>
              </section>
            ) : activePrincipalMenu === 'Students' ? (
              <article className="panel module-panel student-module-panel">
                <div className="student-module-head">
                  <div>
                    <h3>Student Management</h3>
                    <p className="student-subtitle">Admissions, profiles, and lifecycle operations in one workspace.</p>
                  </div>
                  <button
                    type="button"
                    className="create-student-cta"
                    onClick={() => {
                      setShowCreateStudentModal(true);
                    }}
                  >
                    Create Student
                  </button>
                </div>

                {studentModuleLoading ? (
                  <div className="class-loader-wrap">
                    <div className="class-loader" role="status" aria-live="polite">
                      <span className="loader-ring outer" />
                      <span className="loader-ring inner" />
                      <img src={logo} alt="IDPS logo loading" />
                    </div>
                    <p>Loading Student Management...</p>
                  </div>
                ) : (
                  <div className="student-module-grid">
                    <section className="student-class-overview-card">
                      <div className="student-workspace-head">
                        <div>
                          <h4>Class-wise Overview</h4>
                          <p>Select a class to expand the full student list. Search by name, admission no, phone, or parent detail.</p>
                        </div>
                        <div className="student-global-search">
                          <span>Global Search</span>
                          <div className="student-global-search-input">
                            <LuSearch aria-hidden="true" />
                            <input
                              type="text"
                              value={studentDirectorySearch}
                              onChange={(event) => setStudentDirectorySearch(event.target.value)}
                              placeholder="Search students, admission no, phone, or parent..."
                            />
                          </div>
                          {studentDirectorySearch.trim() ? (
                            <div className="student-search-results-panel">
                              {studentSearchResults.length === 0 ? (
                                <p className="student-empty small">No matching students found.</p>
                              ) : (
                                studentSearchResults.map((row) => {
                                  const profile = studentProfiles[row.id];
                                  const parentLabel = (profile?.parents ?? [])
                                    .map((item) => item.parent?.name ?? '')
                                    .filter(Boolean)
                                    .join(' · ');
                                  return (
                                    <button
                                      key={row.id}
                                      type="button"
                                      className="student-search-result"
                                      onClick={() => {
                                        setStudentDirectorySearch('');
                                        void openStudentView(row.id);
                                      }}
                                    >
                                      <div>
                                        <strong>{row.name}</strong>
                                        <span>
                                          {row.className} - {row.section} · {row.admissionno ?? 'N/A'}
                                        </span>
                                      </div>
                                      <small>{parentLabel || profile?.parents?.[0]?.parent?.phone1 || 'Open profile'}</small>
                                    </button>
                                  );
                                })
                              )}
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div className="student-class-grid">
                        {studentClassCards.map((cls) => {
                          const selected = selectedStudentClassId === cls.id;
                          return (
                            <button
                              key={cls.id}
                              type="button"
                              className={selected ? 'student-class-card selected' : 'student-class-card'}
                              onClick={() => setSelectedStudentClassId((prev) => (prev === cls.id ? null : cls.id))}
                            >
                              <div className="student-class-card-top">
                                <strong>{cls.name}</strong>
                                <span>{cls.section}</span>
                              </div>
                              <div className="student-class-card-meta">
                                <div>
                                  <span>Students</span>
                                  <strong>{cls.totalStudents}</strong>
                                </div>
                                <div>
                                  <span>Teacher</span>
                                  <strong>{cls.teacherName}</strong>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </section>

                    <section className="student-list-card student-list-card-full">
                      <div className="student-list-toolbar">
                        <div className="student-list-toolbar-copy">
                          <strong>{selectedStudentClass ? `${selectedStudentClass.name} - ${selectedStudentClass.section}` : 'All Students'}</strong>
                          <span>
                            {selectedStudentDirectoryRows.length} student(s)
                            {selectedStudentClass ? ' in the selected class' : ' available in the workspace'}
                          </span>
                        </div>
                        {selectedStudentClassId ? (
                          <button
                            type="button"
                            className="ghost-btn"
                            onClick={() => setSelectedStudentClassId(null)}
                          >
                            View All
                          </button>
                        ) : null}
                      </div>

                      <div className="student-table-head">
                        <span>Name</span>
                        <span>Admission No</span>
                        <span>Class</span>
                        <span>Parent</span>
                        <span>Actions</span>
                      </div>
                      <div className="student-table-body">
                        {selectedStudentDirectoryRows.length === 0 ? <p className="student-empty">No students found.</p> : null}
                        {selectedStudentDirectoryRows.map((row) => {
                          const profile = studentProfiles[row.id];
                          const rowParents = (row.parents ?? []).flatMap((item) => (item.parent ? [item.parent] : []));
                          const fatherName = rowParents.find((parent) => parent.relation === 'Father' || parent.type === 'FATHER')?.name;
                          const motherName = rowParents.find((parent) => parent.relation === 'Mother' || parent.type === 'MOTHER')?.name;
                          const fallbackParentName = (profile?.parents ?? [])
                            .map((item) => item.parent?.name ?? '')
                            .find((name) => Boolean(name));
                          const parentLabel = fatherName ?? motherName ?? fallbackParentName ?? 'View for details';
                          return (
                            <article key={row.id} className="student-table-row">
                              <span>{row.name}</span>
                              <span>{row.admissionno ?? 'N/A'}</span>
                              <span>
                                {row.className}
                                {row.section ? ` - ${row.section}` : ''}
                              </span>
                              <span>{parentLabel}</span>
                              <div className="student-row-actions">
                                <button type="button" className="ghost-btn" onClick={() => openStudentView(row.id)}>
                                  View
                                </button>
                                <button type="button" className="ghost-btn" onClick={() => openStudentEdit(row.id)}>
                                  Edit
                                </button>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    </section>

                    <aside className="student-side-panels">
                      {studentAction === 'edit' ? (
                        <form className="student-form-card" onSubmit={updateStudent}>
                          <h4>Edit Student</h4>
                          {studentProfileLoading ? <p>Loading profile...</p> : null}
                          <input
                            type="text"
                            placeholder="Student Name *"
                            value={editStudentForm.name}
                            onChange={(event) => setEditStudentForm((prev) => ({ ...prev, name: event.target.value }))}
                            required
                          />
                          <select
                            value={editStudentForm.gender}
                            onChange={(event) => setEditStudentForm((prev) => ({ ...prev, gender: event.target.value }))}
                            required
                          >
                            <option value="MALE">MALE</option>
                            <option value="FEMALE">FEMALE</option>
                          </select>
                          <input
                            type="date"
                            value={editStudentForm.dob}
                            onChange={(event) => setEditStudentForm((prev) => ({ ...prev, dob: event.target.value }))}
                          />
                          <select
                            value={editStudentForm.classId}
                            onChange={(event) => setEditStudentForm((prev) => ({ ...prev, classId: event.target.value }))}
                            required
                          >
                            <option value="">Select Class *</option>
                            {classes.map((cls) => (
                              <option key={cls.id} value={cls.id}>
                                {cls.name} - {cls.section}
                              </option>
                            ))}
                          </select>
                          <select
                            value={editStudentForm.busId}
                            onChange={(event) => setEditStudentForm((prev) => ({ ...prev, busId: event.target.value }))}
                          >
                            <option value="">Select Bus (Optional)</option>
                            {buses.map((bus) => (
                              <option key={bus.id} value={bus.id}>
                                {bus.busNumber ? `Bus ${bus.busNumber}` : `Bus ${bus.id}`}
                                {bus.routeName ? ` - ${bus.routeName}` : ''}
                              </option>
                            ))}
                          </select>
                          <div className="student-edit-actions">
                            <button type="submit" disabled={updateStudentLoading}>
                              {updateStudentLoading ? 'Updating...' : 'Update Student'}
                            </button>
                            <button type="button" className="secondary" onClick={() => setStudentAction('list')}>
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <article className="student-profile-card student-profile-card-compact">
                          <h4>Class Insights</h4>
                          <p className="student-side-note">
                            Use the class cards above to move between sections. Click <strong>View</strong> for a full-screen student profile.
                          </p>
                          <div className="student-compact-kpis">
                            <div>
                              <span>Students</span>
                              <strong>{studentDirectoryRows.length}</strong>
                            </div>
                            <div>
                              <span>Classes</span>
                              <strong>{classes.length}</strong>
                            </div>
                            <div>
                              <span>Profiles</span>
                              <strong>{Object.keys(studentProfiles).length}</strong>
                            </div>
                          </div>
                          <div className="student-insight-preview">
                            <span className="student-preview-dot" />
                            <p>Search results open complete student records with parent, fee, exam, and attendance details.</p>
                          </div>
                        </article>
                      )}
                    </aside>
                  </div>
                )}

                {showCreateStudentModal ? (
                  <div className="modal-overlay" role="dialog" aria-modal="true">
                    <section className="student-modal">
                      <div className="student-modal-head">
                        <div>
                          <h4>Create Student</h4>
                          <p>Fill student details and assign parents with quick search.</p>
                        </div>
                        <button type="button" className="modal-close-btn" onClick={() => setShowCreateStudentModal(false)}>
                          Close
                        </button>
                      </div>

                      <form className="student-modal-form" onSubmit={createStudent}>
                        <div className="student-modal-grid">
                          <label>
                            Name *
                            <input
                              type="text"
                              value={studentForm.name}
                              onChange={(event) => setStudentForm((prev) => ({ ...prev, name: event.target.value }))}
                              required
                            />
                          </label>
                          <label>
                            Gender *
                            <select
                              value={studentForm.gender}
                              onChange={(event) => setStudentForm((prev) => ({ ...prev, gender: event.target.value }))}
                              required
                            >
                              <option value="MALE">MALE</option>
                              <option value="FEMALE">FEMALE</option>
                            </select>
                          </label>
                          <label>
                            Date Of Birth *
                            <input
                              type="date"
                              value={studentForm.dob}
                              onChange={(event) => setStudentForm((prev) => ({ ...prev, dob: event.target.value }))}
                              required
                            />
                          </label>
                          <label>
                            Class *
                            <select
                              value={studentForm.classId}
                              onChange={(event) => setStudentForm((prev) => ({ ...prev, classId: event.target.value }))}
                              required
                            >
                              <option value="">Select Class *</option>
                              {classes.map((cls) => (
                                <option key={cls.id} value={cls.id}>
                                  {cls.name} - {cls.section}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label>
                            Bus (Optional)
                            <select
                              value={studentForm.busId}
                              onChange={(event) => setStudentForm((prev) => ({ ...prev, busId: event.target.value }))}
                            >
                              <option value="">Select Bus</option>
                              {buses.map((bus) => (
                                <option key={bus.id} value={bus.id}>
                                  {bus.busNumber ? `Bus ${bus.busNumber}` : `Bus ${bus.id}`}
                                  {bus.routeName ? ` - ${bus.routeName}` : ''}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>

                        <div className="parent-selector-card">
                          <div className="parent-selector-head">
                            <h5>Assign Parents *</h5>
                            <button type="button" className="ghost-btn" onClick={() => setShowQuickParentModal(true)}>
                              Create Parent
                            </button>
                          </div>
                          <input
                            type="text"
                            placeholder="Search parent by name or phone..."
                            value={studentParentSearch}
                            onChange={(event) => setStudentParentSearch(event.target.value)}
                          />
                          <div className="parent-options-list">
                            {attachmentsLoading ? <p className="multi-help">Loading parents...</p> : null}
                            {!attachmentsLoading && filteredStudentParentOptions.length === 0 ? (
                              <p className="multi-help">No parent found.</p>
                            ) : null}
                            {filteredStudentParentOptions.map((parent) => {
                              const checked = studentForm.parentIds.includes(parent.id);
                              return (
                                <label key={parent.id} className={checked ? 'parent-option checked' : 'parent-option'}>
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={(event) => {
                                      const isChecked = event.target.checked;
                                      setStudentForm((prev) => ({
                                        ...prev,
                                        parentIds: isChecked
                                          ? [...prev.parentIds, parent.id]
                                          : prev.parentIds.filter((id) => id !== parent.id),
                                      }));
                                    }}
                                  />
                                  <div>
                                    <strong>{parent.name}</strong>
                                    <p>
                                      {parent.relation ?? 'N/A'} | {parent.phone1 ?? 'N/A'}
                                      {parent.phone2 ? `, ${parent.phone2}` : ''} | {parent.village ?? 'N/A'}
                                    </p>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>

                        <div className="student-modal-actions">
                          <button type="submit" disabled={createStudentLoading}>
                            {createStudentLoading ? 'Creating...' : 'Create Student'}
                          </button>
                          <button type="button" className="secondary" onClick={() => setShowCreateStudentModal(false)}>
                            Cancel
                          </button>
                        </div>
                      </form>
                    </section>
                  </div>
                ) : null}

                {showStudentInsightsModal && activeStudentId ? (
                  <div className="modal-overlay student-insight-overlay" role="dialog" aria-modal="true">
                    <section className="student-insight-modal">
                      <header className="student-insight-head">
                        <div className="student-insight-head-left">
                          <div className="student-insight-avatar">
                            {activeStudentProfile?.name?.trim().charAt(0).toUpperCase() ?? 'S'}
                          </div>
                          <div className="student-insight-title">
                            <p>Student Overview</p>
                            <h4>{activeStudentProfile?.name ?? `Student ${activeStudentId}`}</h4>
                            <span>
                              {activeStudentClass ? `${activeStudentClass.name} - ${activeStudentClass.section}` : 'Class not assigned'}
                              {activeStudentProfile?.bus
                                ? ` · Bus ${activeStudentProfile.bus?.busNumber ?? activeStudentProfile.bus?.id}`
                                : ''}
                            </span>
                          </div>
                        </div>
                        <div className="student-insight-head-actions">
                          <div className="student-insight-head-metrics">
                            <div>
                              <span>Fees</span>
                              <strong>{activeStudentFeeSummary.feeCount}</strong>
                            </div>
                            <div>
                              <span>Payments</span>
                              <strong>{activeStudentFeeSummary.paymentCount}</strong>
                            </div>
                            <div>
                              <span>Avg Marks</span>
                              <strong>{activeStudentMarksSummary.average}%</strong>
                            </div>
                          </div>
                          <button type="button" className="modal-close-btn" onClick={closeStudentInsightsModal}>
                            Close
                          </button>
                        </div>
                      </header>

                      <nav className="student-insight-nav" aria-label="Student insight sections">
                        <button type="button" onClick={() => scrollToStudentInsightSection('student-profile-summary')}>
                          Profile
                        </button>
                        <button type="button" onClick={() => scrollToStudentInsightSection('student-fee-summary')}>
                          Fees
                        </button>
                        <button type="button" onClick={() => scrollToStudentInsightSection('student-performance-summary')}>
                          Performance
                        </button>
                        <button type="button" onClick={() => scrollToStudentInsightSection('student-attendance-summary')}>
                          Attendance
                        </button>
                      </nav>

                      <div className="student-insight-body">
                        {studentProfileLoading ? (
                          <div className="class-loader-wrap student-insight-loading">
                            <div className="class-loader" role="status" aria-live="polite">
                              <span className="loader-ring outer" />
                              <span className="loader-ring inner" />
                              <img src={logo} alt="IDPS logo loading" />
                            </div>
                            <p>Loading Student Profile...</p>
                          </div>
                        ) : (
                          <>
                            <section id="student-profile-summary" className="student-insight-grid">
                              <article className="student-insight-card student-insight-card-span-2">
                                <header>
                                  <h5>Student Details</h5>
                                  <span>Identity, enrollment, and basic record</span>
                                </header>
                                <div className="student-insight-specs student-insight-specs-wide">
                                  <div>
                                    <span>Name</span>
                                    <strong>{activeStudentProfile?.name ?? 'N/A'}</strong>
                                  </div>
                                  <div>
                                    <span>Admission No</span>
                                    <strong>{activeStudentProfile?.admissionno ?? 'N/A'}</strong>
                                  </div>
                                  <div>
                                    <span>Gender</span>
                                    <strong>{activeStudentProfile?.gender ?? 'N/A'}</strong>
                                  </div>
                                  <div>
                                    <span>DOB</span>
                                    <strong>{formatDisplayDate(activeStudentProfile?.dob)}</strong>
                                  </div>
                                  <div>
                                    <span>Student ID</span>
                                    <strong>{activeStudentProfile?.id ?? activeStudentId}</strong>
                                  </div>
                                  <div>
                                    <span>Admission Date</span>
                                    <strong>{formatDisplayDate(activeStudentProfile?.admissiondate)}</strong>
                                  </div>
                                  <div>
                                    <span>Blood Group</span>
                                    <strong>{activeStudentProfile?.bloodgroup ?? 'N/A'}</strong>
                                  </div>
                                  <div>
                                    <span>Mother Tongue</span>
                                    <strong>{activeStudentProfile?.mothertongue ?? 'N/A'}</strong>
                                  </div>
                                  <div>
                                    <span>Category</span>
                                    <strong>{activeStudentProfile?.socialcategory ?? 'N/A'}</strong>
                                  </div>
                                  <div>
                                    <span>Aadhaar</span>
                                    <strong>{activeStudentProfile?.adharnumber ?? 'N/A'}</strong>
                                  </div>
                                  <div>
                                    <span>Height</span>
                                    <strong>{activeStudentProfile?.height ? `${activeStudentProfile.height} cm` : 'N/A'}</strong>
                                  </div>
                                  <div>
                                    <span>Weight</span>
                                    <strong>{activeStudentProfile?.weight ? `${activeStudentProfile.weight} kg` : 'N/A'}</strong>
                                  </div>
                                  <div className="student-insight-specs-full">
                                    <span>Address</span>
                                    <strong>{activeStudentProfile?.address ?? 'N/A'}</strong>
                                  </div>
                                  <div>
                                    <span>Pincode</span>
                                    <strong>{activeStudentProfile?.pincode ?? 'N/A'}</strong>
                                  </div>
                                </div>
                              </article>

                              <article className="student-insight-card">
                                <header>
                                  <h5>Parent Details</h5>
                                  <span>Mother, father, and guardian records</span>
                                </header>
                                <div className="student-insight-parent-grid">
                                  {activeStudentParents.length === 0 ? (
                                    <p className="student-insight-empty">No parent data available.</p>
                                  ) : (
                                    activeStudentParents.map((parent, index) => (
                                      <article key={parent.id ?? index} className="student-insight-parent-card">
                                        <div className="student-insight-parent-head">
                                          <div>
                                            <strong>{parent.name ?? 'Parent'}</strong>
                                            <span>
                                              {parent.relation ?? 'Relation N/A'}
                                              {parent.type ? ` · ${parent.type}` : ''}
                                            </span>
                                          </div>
                                          <span className="student-insight-parent-badge">{parent.type ?? 'N/A'}</span>
                                        </div>
                                        <div className="student-insight-specs student-insight-specs-parent">
                                          <div>
                                            <span>Phone 1</span>
                                            <strong>{parent.phone1 ?? 'N/A'}</strong>
                                          </div>
                                          <div>
                                            <span>Phone 2</span>
                                            <strong>{parent.phone2 ?? 'N/A'}</strong>
                                          </div>
                                          <div>
                                            <span>Aadhaar</span>
                                            <strong>{parent.adharnumber ?? 'N/A'}</strong>
                                          </div>
                                          <div>
                                            <span>Qualification</span>
                                            <strong>{parent.qualification ?? 'N/A'}</strong>
                                          </div>
                                          <div>
                                            <span>Email</span>
                                            <strong>{parent.user?.email ?? 'N/A'}</strong>
                                          </div>
                                          <div>
                                            <span>Gender</span>
                                            <strong>{parent.user?.gender ?? 'N/A'}</strong>
                                          </div>
                                        </div>
                                      </article>
                                    ))
                                  )}
                                </div>
                              </article>

                              <article className="student-insight-card">
                                <header>
                                  <h5>Class Info</h5>
                                  <span>Academic context</span>
                                </header>
                                <div className="student-insight-specs">
                                  <div>
                                    <span>Class</span>
                                    <strong>{activeStudentClass ? `${activeStudentClass.name} - ${activeStudentClass.section}` : 'N/A'}</strong>
                                  </div>
                                  <div>
                                    <span>Teacher</span>
                                    <strong>{activeStudentClass?.teacher?.name ?? 'N/A'}</strong>
                                  </div>
                                  <div>
                                    <span>Teacher Email</span>
                                    <strong>{activeStudentClass?.teacher?.user?.email ?? 'N/A'}</strong>
                                  </div>
                                  <div>
                                    <span>Bus</span>
                                    <strong>
                                      {activeStudentProfile?.bus
                                        ? `Bus ${activeStudentProfile.bus?.busNumber ?? activeStudentProfile.bus?.id}`
                                        : 'N/A'}
                                    </strong>
                                  </div>
                                  <div>
                                    <span>Section</span>
                                    <strong>{activeStudentClass?.section ?? 'N/A'}</strong>
                                  </div>
                                </div>
                              </article>

                              <article className="student-insight-card">
                                <header>
                                  <h5>Record Summary</h5>
                                  <span>Administrative details</span>
                                </header>
                                <div className="student-insight-specs">
                                  <div>
                                    <span>Primary Guardian</span>
                                    <strong>{activeStudentPrimaryParent?.name ?? 'N/A'}</strong>
                                  </div>
                                  <div>
                                    <span>Phone</span>
                                    <strong>{activeStudentPrimaryParent?.phone1 ?? 'N/A'}</strong>
                                  </div>
                                  <div>
                                    <span>Alt Phone</span>
                                    <strong>{activeStudentPrimaryParent?.phone2 ?? 'N/A'}</strong>
                                  </div>
                                  <div>
                                    <span>Last Updated</span>
                                    <strong>{formatDisplayDate(activeStudentProfile?.updatedAt)}</strong>
                                  </div>
                                  <div>
                                    <span>Created</span>
                                    <strong>{formatDisplayDate(activeStudentProfile?.createdAt)}</strong>
                                  </div>
                                </div>
                              </article>

                              <article className="student-insight-card">
                                <header>
                                  <h5>Quick Stats</h5>
                                  <span>Live student snapshot</span>
                                </header>
                                <div className="student-insight-mini-grid">
                                  <div>
                                    <span>Total Fees</span>
                                    <strong>{formatInr(activeStudentFeeSummary.total)}</strong>
                                  </div>
                                  <div>
                                    <span>Collected</span>
                                    <strong>{formatInr(activeStudentFeeSummary.paid)}</strong>
                                  </div>
                                  <div>
                                    <span>Balance</span>
                                    <strong>{formatInr(activeStudentFeeSummary.remaining)}</strong>
                                  </div>
                                  <div>
                                    <span>Avg Marks</span>
                                    <strong>{activeStudentMarksSummary.average}%</strong>
                                  </div>
                                </div>
                              </article>

                              <article className="student-insight-card">
                                <header>
                                  <h5>Additional Info</h5>
                                  <span>Remarks and records</span>
                                </header>
                                <div className="student-insight-specs">
                                  <div>
                                    <span>Admission Status</span>
                                    <strong>Active</strong>
                                  </div>
                                  <div>
                                    <span>Parents Linked</span>
                                    <strong>{activeStudentParents.length}</strong>
                                  </div>
                                  <div>
                                    <span>Fee Records</span>
                                    <strong>{activeStudentFeeSummary.feeCount}</strong>
                                  </div>
                                  <div>
                                    <span>Marks Records</span>
                                    <strong>{activeStudentMarksSummary.totalExams}</strong>
                                  </div>
                                  <div>
                                    <span>Payments</span>
                                    <strong>{activeStudentFeeSummary.paymentCount}</strong>
                                  </div>
                                  <div>
                                    <span>Profile Loaded</span>
                                    <strong>{activeStudentProfile ? 'Yes' : 'No'}</strong>
                                  </div>
                                </div>
                              </article>
                            </section>

                            <section id="student-fee-summary" className="student-insight-two-up">
                              <article className="student-insight-card student-insight-donut-card">
                                <header>
                                  <h5>Fee Status</h5>
                                  <span>Collected vs remaining</span>
                                </header>
                                <div className="student-insight-donut">
                                  <svg viewBox="0 0 220 220" role="img" aria-label="Collected versus remaining fees chart">
                                    {activeStudentCollectionSegments.length === 0 ? (
                                      <>
                                        <circle cx="110" cy="110" r="82" className="status-donut-base" />
                                        <circle cx="110" cy="110" r="82" className="status-donut-zero-ring" />
                                      </>
                                    ) : (
                                      activeStudentCollectionSegments.map((segment) => (
                                        <path
                                          key={segment.key}
                                          d={segment.path}
                                          fill={segment.color}
                                          className="status-donut-segment"
                                          onMouseMove={(event) => {
                                            setOverviewTooltip({
                                              x: event.clientX,
                                              y: event.clientY,
                                              title: segment.label,
                                              lines: [
                                                `${segment.share.toFixed(1)}% of fee total`,
                                                formatInr(segment.amount),
                                                segment.key === 'PAID' ? 'Collected amount' : 'Remaining amount',
                                              ],
                                            });
                                          }}
                                          onMouseLeave={() => setOverviewTooltip(null)}
                                        />
                                      ))
                                    )}
                                    <circle cx="110" cy="110" r="54" fill="#ffffff" />
                                    <text x="110" y="104" textAnchor="middle" className="status-donut-value">
                                      {activeStudentFeeSummary.total ? activeStudentFeeSummary.collectionRate : 0}%
                                    </text>
                                    <text x="110" y="124" textAnchor="middle" className="status-donut-sub">
                                      collected
                                    </text>
                                  </svg>
                                </div>
                                <div className="student-insight-donut-caption">
                                  <strong>{formatInr(activeStudentFeeSummary.paid)}</strong>
                                  <span>of {formatInr(activeStudentFeeSummary.total)}</span>
                                </div>
                              </article>

                              <article className="student-insight-card">
                                <header>
                                  <h5>Fee Breakdown</h5>
                                  <span>By fee type</span>
                                </header>
                                <div className="student-insight-type-list">
                                  {activeStudentFeeTypeBreakdown.length === 0 ? (
                                    <p className="student-insight-empty">No fee records available.</p>
                                  ) : (
                                    activeStudentFeeTypeBreakdown.map((item) => {
                                      const collectedShare = item.totalAmount ? (item.paidAmount / item.totalAmount) * 100 : 0;
                                      const pendingShare = item.totalAmount ? (item.pendingAmount / item.totalAmount) * 100 : 0;
                                      return (
                                        <div
                                          key={item.key}
                                          className="student-insight-type-item"
                                          onMouseMove={(event) => {
                                            setOverviewTooltip({
                                              x: event.clientX,
                                              y: event.clientY,
                                              title: item.label,
                                              lines: [
                                                `${item.count} fee record(s)`,
                                                `Total ${formatInr(item.totalAmount)}`,
                                                `Collected ${formatInr(item.paidAmount)}`,
                                                `Pending ${formatInr(item.pendingAmount)}`,
                                              ],
                                            });
                                          }}
                                          onMouseLeave={() => setOverviewTooltip(null)}
                                        >
                                          <div className="manage-fee-detail-type-head">
                                            <div className="finance-manage-type-title">
                                              <span className="status-dot" style={{ background: item.color }} />
                                              <strong>{item.label}</strong>
                                            </div>
                                            <strong>{formatInr(item.totalAmount)}</strong>
                                          </div>
                                          <div className="manage-fee-detail-type-track">
                                            <span
                                              className="manage-fee-detail-type-collected"
                                              style={{ background: item.color, width: `${Math.max(collectedShare, 4)}%` }}
                                            />
                                            <span className="manage-fee-detail-type-pending" style={{ width: `${Math.max(pendingShare, 0)}%` }} />
                                          </div>
                                          <div className="manage-fee-detail-type-foot">
                                            <span>{collectedShare.toFixed(0)}% collected</span>
                                            <span>{pendingShare.toFixed(0)}% pending</span>
                                          </div>
                                        </div>
                                      );
                                    })
                                  )}
                                </div>
                              </article>
                            </section>

                            <section id="student-performance-summary" className="student-insight-two-up">
                              <article className="student-insight-card">
                                <header>
                                  <h5>Marks Trend</h5>
                                  <span>Recent exam performance</span>
                                </header>
                                <div className="student-insight-bars">
                                  {activeStudentMarksRows.length === 0 ? (
                                    <p className="student-insight-empty">No marks records available.</p>
                                  ) : (
                                    activeStudentMarksRows.slice(0, 6).map((row) => (
                                      <div
                                        key={row.id}
                                        className="student-insight-bar-row"
                                        onMouseMove={(event) => {
                                          setOverviewTooltip({
                                            x: event.clientX,
                                            y: event.clientY,
                                            title: row.examName,
                                            lines: [
                                              `${row.marks} of ${row.totalMarks}`,
                                              `${row.percent}%`,
                                              row.subjectName,
                                            ],
                                          });
                                        }}
                                        onMouseLeave={() => setOverviewTooltip(null)}
                                      >
                                        <div className="student-insight-bar-meta">
                                          <strong>{row.examName}</strong>
                                          <span>{row.subjectName}</span>
                                        </div>
                                        <div className="student-insight-bar-track">
                                          <span className="student-insight-bar-fill" style={{ width: `${Math.max(row.percent, 4)}%` }} />
                                        </div>
                                        <strong className="student-insight-bar-value">{row.percent}%</strong>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </article>

                              <article className="student-insight-card">
                                <header>
                                  <h5>Exam Snapshot</h5>
                                  <span>Latest scoring summary</span>
                                </header>
                                <div className="student-insight-mini-grid">
                                  <div>
                                    <span>Exams</span>
                                    <strong>{activeStudentMarksSummary.totalExams}</strong>
                                  </div>
                                  <div>
                                    <span>Average</span>
                                    <strong>{activeStudentMarksSummary.average}%</strong>
                                  </div>
                                  <div>
                                    <span>Best</span>
                                    <strong>{activeStudentMarksSummary.best}%</strong>
                                  </div>
                                  <div>
                                    <span>Latest</span>
                                    <strong>{activeStudentMarksSummary.latest?.examName ?? 'N/A'}</strong>
                                  </div>
                                </div>
                              </article>
                            </section>

                            <section id="student-attendance-summary" className="student-insight-two-up">
                              <article className="student-insight-card student-insight-attendance-card">
                                <header>
                                  <h5>Attendance</h5>
                                  <span>Current feed status</span>
                                </header>
                                <div className="student-insight-attendance-wrap">
                                  <svg viewBox="0 0 220 220" role="img" aria-label="Attendance status indicator">
                                    <circle cx="110" cy="110" r="82" className="status-donut-base" />
                                    <circle cx="110" cy="110" r="82" className="status-donut-zero-ring" />
                                    <circle cx="110" cy="110" r="54" fill="#ffffff" />
                                    <text x="110" y="104" textAnchor="middle" className="status-donut-value">
                                      0%
                                    </text>
                                    <text x="110" y="124" textAnchor="middle" className="status-donut-sub">
                                      unavailable
                                    </text>
                                  </svg>
                                  <div className="student-insight-attendance-copy">
                                    <strong>Attendance feed not connected</strong>
                                    <p>
                                      Once attendance data is linked, this space will show present/absent trends, percentages, and a
                                      monthly summary.
                                    </p>
                                  </div>
                                </div>
                              </article>

                              <article className="student-insight-card">
                                <header>
                                  <h5>Payment History</h5>
                                  <span>{activeStudentPayments.length} payment(s)</span>
                                </header>
                                <div className="student-insight-history">
                                  {activeStudentPayments.length === 0 ? (
                                    <p className="student-insight-empty">No payment history available for this student.</p>
                                  ) : (
                                    activeStudentPayments.slice(0, 6).map((payment) => (
                                      <article key={payment.id} className="student-insight-history-item">
                                        <div>
                                          <strong>{formatInr(Number(payment.amount ?? 0))}</strong>
                                          <span>{payment.fee.type}</span>
                                        </div>
                                        <div>
                                          <span>{payment.method}</span>
                                          <strong>{payment.status}</strong>
                                        </div>
                                        <small>{new Date(payment.createdAt).toLocaleDateString()}</small>
                                      </article>
                                    ))
                                  )}
                                </div>
                              </article>
                            </section>
                          </>
                        )}
                      </div>
                    </section>
                  </div>
                ) : null}

                {showQuickParentModal ? (
                  <div className="modal-overlay nested" role="dialog" aria-modal="true">
                    <section className="quick-parent-modal">
                      <div className="student-modal-head">
                        <div>
                          <h4>Create Parent</h4>
                          <p>Add parent and immediately assign to student.</p>
                        </div>
                        <button type="button" className="modal-close-btn" onClick={() => setShowQuickParentModal(false)}>
                          Close
                        </button>
                      </div>

                      <form className="quick-parent-form" onSubmit={createParentFromStudent}>
                        <input
                          type="text"
                          placeholder="Parent Name *"
                          value={quickParentForm.name}
                          onChange={(event) => {
                            const value = event.target.value;
                            setQuickParentForm((prev) => ({ ...prev, name: value }));
                            setQuickParentErrors((prev) => ({ ...prev, name: '' }));
                          }}
                          required
                        />
                        {quickParentErrors.name ? <p className="form-error">{quickParentErrors.name}</p> : null}
                        <input
                          type="email"
                          placeholder="Email *"
                          value={quickParentForm.email}
                          onChange={(event) => {
                            const value = event.target.value;
                            setQuickParentForm((prev) => ({ ...prev, email: value }));
                            setQuickParentErrors((prev) => ({ ...prev, email: '' }));
                          }}
                          required
                        />
                        {quickParentErrors.email ? <p className="form-error">{quickParentErrors.email}</p> : null}
                        <select
                          value={quickParentForm.gender}
                          onChange={(event) => {
                            setQuickParentForm((prev) => ({ ...prev, gender: event.target.value as 'MALE' | 'FEMALE' }));
                            setQuickParentErrors((prev) => ({ ...prev, gender: '' }));
                          }}
                          required
                        >
                          <option value="MALE">MALE</option>
                          <option value="FEMALE">FEMALE</option>
                        </select>
                        {quickParentErrors.gender ? <p className="form-error">{quickParentErrors.gender}</p> : null}
                        <select
                          value={quickParentForm.relation}
                          onChange={(event) => {
                            setQuickParentForm((prev) => ({ ...prev, relation: event.target.value }));
                            setQuickParentErrors((prev) => ({ ...prev, relation: '' }));
                          }}
                          required
                        >
                          <option value="Father">Father</option>
                          <option value="Mother">Mother</option>
                          <option value="Guardian">Guardian</option>
                        </select>
                        {quickParentErrors.relation ? <p className="form-error">{quickParentErrors.relation}</p> : null}
                        <input
                          type="text"
                          placeholder="Phone 1 *"
                          maxLength={10}
                          value={quickParentForm.phone1}
                          onChange={(event) => {
                            const value = event.target.value.replace(/\D/g, '');
                            setQuickParentForm((prev) => ({ ...prev, phone1: value }));
                            setQuickParentErrors((prev) => ({ ...prev, phone1: '' }));
                          }}
                          required
                        />
                        {quickParentErrors.phone1 ? <p className="form-error">{quickParentErrors.phone1}</p> : null}
                        <input
                          type="text"
                          placeholder="Phone 2 (Optional)"
                          maxLength={10}
                          value={quickParentForm.phone2}
                          onChange={(event) => {
                            const value = event.target.value.replace(/\D/g, '');
                            setQuickParentForm((prev) => ({ ...prev, phone2: value }));
                            setQuickParentErrors((prev) => ({ ...prev, phone2: '' }));
                          }}
                        />
                        {quickParentErrors.phone2 ? <p className="form-error">{quickParentErrors.phone2}</p> : null}
                        <input
                          type="text"
                          placeholder="Village *"
                          value={quickParentForm.village}
                          onChange={(event) => {
                            const value = event.target.value;
                            setQuickParentForm((prev) => ({ ...prev, village: value }));
                            setQuickParentErrors((prev) => ({ ...prev, village: '' }));
                          }}
                          required
                        />
                        {quickParentErrors.village ? <p className="form-error">{quickParentErrors.village}</p> : null}
                        <div className="student-modal-actions">
                          <button type="submit" disabled={quickParentLoading}>
                            {quickParentLoading ? 'Creating...' : 'Create Parent'}
                          </button>
                          <button type="button" className="secondary" onClick={() => setShowQuickParentModal(false)}>
                            Cancel
                          </button>
                        </div>
                      </form>
                    </section>
                  </div>
                ) : null}
              </article>
            ) : activePrincipalMenu === 'Teachers' ? (
              <article className="panel module-panel">
                <div className="teacher-module-head">
                  <div>
                    <h3>Teacher Management</h3>
                    <p className="teacher-subtitle">Create teacher profiles and maintain faculty details.</p>
                  </div>
                  <button type="button" className="create-teacher-cta" onClick={() => setShowCreateTeacherForm((prev) => !prev)}>
                    {showCreateTeacherForm ? 'Close Create Form' : 'Create Teacher'}
                  </button>
                </div>

                {teacherModuleLoading ? (
                  <div className="class-loader-wrap">
                    <div className="class-loader" role="status" aria-live="polite">
                      <span className="loader-ring outer" />
                      <span className="loader-ring inner" />
                      <img src={logo} alt="IDPS logo loading" />
                    </div>
                    <p>Loading Teacher Management...</p>
                  </div>
                ) : (
                  <div className="teacher-module-grid">
                    <section className="teacher-list-card">
                      <div className="teacher-list-toolbar">
                        <input
                          type="text"
                          value={teacherSearch}
                          onChange={(event) => setTeacherSearch(event.target.value)}
                          placeholder="Search by name, email, phone, or gender..."
                        />
                        <span>{filteredTeacherRows.length} teachers</span>
                      </div>
                      <div className="teacher-table-head">
                        <span>Name</span>
                        <span>Email</span>
                        <span>Phone</span>
                        <span>Gender</span>
                        <span>Action</span>
                      </div>
                      <div className="teacher-table-body">
                        {filteredTeacherRows.length === 0 ? <p className="teacher-empty">No teachers found.</p> : null}
                        {filteredTeacherRows.map((teacher) => (
                          <article key={teacher.id} className="teacher-table-row">
                            <span>{teacher.name || teacher.user?.name || 'N/A'}</span>
                            <span>{teacher.user?.email || 'N/A'}</span>
                            <span>{teacher.phone || 'N/A'}</span>
                            <span>{teacher.gender || 'N/A'}</span>
                            <button type="button" className="edit-teacher-btn" onClick={() => openEditTeacher(teacher)}>
                              <LuPencil />
                            </button>
                          </article>
                        ))}
                      </div>
                    </section>

                    <aside className="teacher-side-panels">
                      {showCreateTeacherForm ? (
                        <form className="teacher-form-card" onSubmit={createTeacher}>
                          <h4>Create Teacher</h4>
                          <input
                            type="text"
                            placeholder="Teacher Name *"
                            value={createTeacherForm.name}
                            onChange={(event) => {
                              const value = event.target.value;
                              setCreateTeacherForm((prev) => ({ ...prev, name: value }));
                              setCreateTeacherErrors((prev) => ({ ...prev, name: '' }));
                            }}
                            required
                          />
                          {createTeacherErrors.name ? <p className="form-error">{createTeacherErrors.name}</p> : null}
                          <input
                            type="email"
                            placeholder="Email *"
                            value={createTeacherForm.email}
                            onChange={(event) => {
                              const value = event.target.value;
                              setCreateTeacherForm((prev) => ({ ...prev, email: value }));
                              setCreateTeacherErrors((prev) => ({ ...prev, email: '' }));
                            }}
                            required
                          />
                          {createTeacherErrors.email ? <p className="form-error">{createTeacherErrors.email}</p> : null}
                          <input
                            type="text"
                            placeholder="Phone Number *"
                            value={createTeacherForm.phone}
                            maxLength={10}
                            onChange={(event) => {
                              const value = event.target.value.replace(/\D/g, '');
                              setCreateTeacherForm((prev) => ({ ...prev, phone: value }));
                              setCreateTeacherErrors((prev) => ({ ...prev, phone: '' }));
                            }}
                            required
                          />
                          {createTeacherErrors.phone ? <p className="form-error">{createTeacherErrors.phone}</p> : null}
                          <select
                            value={createTeacherForm.gender}
                            onChange={(event) =>
                              {
                                setCreateTeacherForm((prev) => ({ ...prev, gender: event.target.value as 'MALE' | 'FEMALE' }));
                                setCreateTeacherErrors((prev) => ({ ...prev, gender: '' }));
                              }
                            }
                            required
                          >
                            <option value="MALE">MALE</option>
                            <option value="FEMALE">FEMALE</option>
                          </select>
                          {createTeacherErrors.gender ? <p className="form-error">{createTeacherErrors.gender}</p> : null}
                          <button type="submit" disabled={createTeacherLoading}>
                            {createTeacherLoading ? 'Creating...' : 'Create Teacher'}
                          </button>
                        </form>
                      ) : null}

                      {editingTeacherId ? (
                        <form className="teacher-form-card" onSubmit={updateTeacher}>
                          <h4>Edit Teacher</h4>
                          <input
                            type="text"
                            placeholder="Teacher Name *"
                            value={editTeacherForm.name}
                            onChange={(event) => {
                              const value = event.target.value;
                              setEditTeacherForm((prev) => ({ ...prev, name: value }));
                              setEditTeacherErrors((prev) => ({ ...prev, name: '' }));
                            }}
                            required
                          />
                          {editTeacherErrors.name ? <p className="form-error">{editTeacherErrors.name}</p> : null}
                          <input
                            type="email"
                            placeholder="Email *"
                            value={editTeacherForm.email}
                            onChange={(event) => {
                              const value = event.target.value;
                              setEditTeacherForm((prev) => ({ ...prev, email: value }));
                              setEditTeacherErrors((prev) => ({ ...prev, email: '' }));
                            }}
                            required
                          />
                          {editTeacherErrors.email ? <p className="form-error">{editTeacherErrors.email}</p> : null}
                          <input
                            type="text"
                            placeholder="Phone Number *"
                            value={editTeacherForm.phone}
                            maxLength={10}
                            onChange={(event) => {
                              const value = event.target.value.replace(/\D/g, '');
                              setEditTeacherForm((prev) => ({ ...prev, phone: value }));
                              setEditTeacherErrors((prev) => ({ ...prev, phone: '' }));
                            }}
                            required
                          />
                          {editTeacherErrors.phone ? <p className="form-error">{editTeacherErrors.phone}</p> : null}
                          <select
                            value={editTeacherForm.gender}
                            onChange={(event) =>
                              {
                                setEditTeacherForm((prev) => ({ ...prev, gender: event.target.value as 'MALE' | 'FEMALE' }));
                                setEditTeacherErrors((prev) => ({ ...prev, gender: '' }));
                              }
                            }
                            required
                          >
                            <option value="MALE">MALE</option>
                            <option value="FEMALE">FEMALE</option>
                          </select>
                          {editTeacherErrors.gender ? <p className="form-error">{editTeacherErrors.gender}</p> : null}
                          <div className="teacher-edit-actions">
                            <button type="submit" disabled={updateTeacherLoading}>
                              {updateTeacherLoading ? 'Updating...' : 'Update Teacher'}
                            </button>
                            <button type="button" className="secondary" onClick={() => setEditingTeacherId(null)}>
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : null}
                    </aside>
                  </div>
                )}
              </article>
            ) : activePrincipalMenu === 'Parents' ? (
              <article className="panel module-panel">
                <div className="parent-module-head">
                  <div>
                    <h3>Parent Management</h3>
                    <p className="parent-subtitle">Manage parent records and keep guardian details accurate.</p>
                  </div>
                  <button
                    type="button"
                    className="create-parent-cta"
                    onClick={() => setShowCreateParentForm((prev) => !prev)}
                  >
                    {showCreateParentForm ? 'Close Create Form' : 'Create Parent'}
                  </button>
                </div>

                {parentModuleLoading ? (
                  <div className="class-loader-wrap">
                    <div className="class-loader" role="status" aria-live="polite">
                      <span className="loader-ring outer" />
                      <span className="loader-ring inner" />
                      <img src={logo} alt="IDPS logo loading" />
                    </div>
                    <p>Loading Parent Management...</p>
                  </div>
                ) : (
                  <div className="parent-module-grid">
                    <section className="parent-list-card">
                      <div className="parent-list-toolbar">
                        <input
                          type="text"
                          value={parentSearch}
                          onChange={(event) => setParentSearch(event.target.value)}
                          placeholder="Search by name, relation, phone, village..."
                        />
                        <span>{filteredParentRows.length} parents</span>
                      </div>

                      <div className="parent-table-head">
                        <span>Name</span>
                        <span>Relation</span>
                        <span>Phone 1</span>
                        <span>Phone 2</span>
                        <span>Village</span>
                        <span>Action</span>
                      </div>
                      <div className="parent-table-body">
                        {filteredParentRows.length === 0 ? <p className="parent-empty">No parents found.</p> : null}
                        {filteredParentRows.map((parent) => (
                          <article key={parent.id} className="parent-table-row">
                            <span>{parent.name || 'N/A'}</span>
                            <span>{parent.relation || 'N/A'}</span>
                            <span>{parent.phone1 || 'N/A'}</span>
                            <span>{parent.phone2 || 'N/A'}</span>
                            <span>{parent.village || 'N/A'}</span>
                            <button type="button" className="edit-parent-btn" onClick={() => openEditParent(parent)}>
                              <LuPencil />
                            </button>
                          </article>
                        ))}
                      </div>
                    </section>

                    <aside className="parent-side-panels">
                      {showCreateParentForm ? (
                        <form className="parent-form-card" onSubmit={createParent}>
                          <h4>Create Parent</h4>
                          <input
                            type="text"
                            placeholder="Parent Name *"
                            value={createParentForm.name}
                            onChange={(event) => {
                              const value = event.target.value;
                              setCreateParentForm((prev) => ({ ...prev, name: value }));
                              setCreateParentErrors((prev) => ({ ...prev, name: '' }));
                            }}
                            required
                          />
                          {createParentErrors.name ? <p className="form-error">{createParentErrors.name}</p> : null}
                          <input
                            type="email"
                            placeholder="Email *"
                            value={createParentForm.email}
                            onChange={(event) => {
                              const value = event.target.value;
                              setCreateParentForm((prev) => ({ ...prev, email: value }));
                              setCreateParentErrors((prev) => ({ ...prev, email: '' }));
                            }}
                            required
                          />
                          {createParentErrors.email ? <p className="form-error">{createParentErrors.email}</p> : null}
                          <select
                            value={createParentForm.gender}
                            onChange={(event) => {
                              setCreateParentForm((prev) => ({ ...prev, gender: event.target.value as 'MALE' | 'FEMALE' }));
                              setCreateParentErrors((prev) => ({ ...prev, gender: '' }));
                            }}
                            required
                          >
                            <option value="MALE">MALE</option>
                            <option value="FEMALE">FEMALE</option>
                          </select>
                          {createParentErrors.gender ? <p className="form-error">{createParentErrors.gender}</p> : null}
                          <select
                            value={createParentForm.relation}
                            onChange={(event) => {
                              const value = event.target.value;
                              setCreateParentForm((prev) => ({ ...prev, relation: value }));
                              setCreateParentErrors((prev) => ({ ...prev, relation: '' }));
                            }}
                            required
                          >
                            <option value="Father">Father</option>
                            <option value="Mother">Mother</option>
                            <option value="Guardian">Guardian</option>
                          </select>
                          {createParentErrors.relation ? <p className="form-error">{createParentErrors.relation}</p> : null}
                          <input
                            type="text"
                            placeholder="Phone 1 *"
                            value={createParentForm.phone1}
                            maxLength={10}
                            onChange={(event) => {
                              const value = event.target.value.replace(/\D/g, '');
                              setCreateParentForm((prev) => ({ ...prev, phone1: value }));
                              setCreateParentErrors((prev) => ({ ...prev, phone1: '' }));
                            }}
                            required
                          />
                          {createParentErrors.phone1 ? <p className="form-error">{createParentErrors.phone1}</p> : null}
                          <input
                            type="text"
                            placeholder="Phone 2 (Optional)"
                            value={createParentForm.phone2}
                            maxLength={10}
                            onChange={(event) => {
                              const value = event.target.value.replace(/\D/g, '');
                              setCreateParentForm((prev) => ({ ...prev, phone2: value }));
                              setCreateParentErrors((prev) => ({ ...prev, phone2: '' }));
                            }}
                          />
                          {createParentErrors.phone2 ? <p className="form-error">{createParentErrors.phone2}</p> : null}
                          <input
                            type="text"
                            placeholder="Village *"
                            value={createParentForm.village}
                            onChange={(event) => {
                              const value = event.target.value;
                              setCreateParentForm((prev) => ({ ...prev, village: value }));
                              setCreateParentErrors((prev) => ({ ...prev, village: '' }));
                            }}
                            required
                          />
                          {createParentErrors.village ? <p className="form-error">{createParentErrors.village}</p> : null}
                          <button type="submit" disabled={createParentLoading}>
                            {createParentLoading ? 'Creating...' : 'Create Parent'}
                          </button>
                        </form>
                      ) : null}

                      {editingParentId ? (
                        <form className="parent-form-card" onSubmit={updateParent}>
                          <h4>Edit Parent</h4>
                          <input
                            type="text"
                            placeholder="Parent Name *"
                            value={editParentForm.name}
                            onChange={(event) => {
                              const value = event.target.value;
                              setEditParentForm((prev) => ({ ...prev, name: value }));
                              setEditParentErrors((prev) => ({ ...prev, name: '' }));
                            }}
                            required
                          />
                          {editParentErrors.name ? <p className="form-error">{editParentErrors.name}</p> : null}
                          <input
                            type="email"
                            placeholder="Email *"
                            value={editParentForm.email}
                            onChange={(event) => {
                              const value = event.target.value;
                              setEditParentForm((prev) => ({ ...prev, email: value }));
                              setEditParentErrors((prev) => ({ ...prev, email: '' }));
                            }}
                            required
                          />
                          {editParentErrors.email ? <p className="form-error">{editParentErrors.email}</p> : null}
                          <select
                            value={editParentForm.gender}
                            onChange={(event) => {
                              setEditParentForm((prev) => ({ ...prev, gender: event.target.value as 'MALE' | 'FEMALE' }));
                              setEditParentErrors((prev) => ({ ...prev, gender: '' }));
                            }}
                            required
                          >
                            <option value="MALE">MALE</option>
                            <option value="FEMALE">FEMALE</option>
                          </select>
                          {editParentErrors.gender ? <p className="form-error">{editParentErrors.gender}</p> : null}
                          <select
                            value={editParentForm.relation}
                            onChange={(event) => {
                              const value = event.target.value;
                              setEditParentForm((prev) => ({ ...prev, relation: value }));
                              setEditParentErrors((prev) => ({ ...prev, relation: '' }));
                            }}
                            required
                          >
                            <option value="Father">Father</option>
                            <option value="Mother">Mother</option>
                            <option value="Guardian">Guardian</option>
                          </select>
                          {editParentErrors.relation ? <p className="form-error">{editParentErrors.relation}</p> : null}
                          <input
                            type="text"
                            placeholder="Phone 1 *"
                            value={editParentForm.phone1}
                            maxLength={10}
                            onChange={(event) => {
                              const value = event.target.value.replace(/\D/g, '');
                              setEditParentForm((prev) => ({ ...prev, phone1: value }));
                              setEditParentErrors((prev) => ({ ...prev, phone1: '' }));
                            }}
                            required
                          />
                          {editParentErrors.phone1 ? <p className="form-error">{editParentErrors.phone1}</p> : null}
                          <input
                            type="text"
                            placeholder="Phone 2 (Optional)"
                            value={editParentForm.phone2}
                            maxLength={10}
                            onChange={(event) => {
                              const value = event.target.value.replace(/\D/g, '');
                              setEditParentForm((prev) => ({ ...prev, phone2: value }));
                              setEditParentErrors((prev) => ({ ...prev, phone2: '' }));
                            }}
                          />
                          {editParentErrors.phone2 ? <p className="form-error">{editParentErrors.phone2}</p> : null}
                          <input
                            type="text"
                            placeholder="Village *"
                            value={editParentForm.village}
                            onChange={(event) => {
                              const value = event.target.value;
                              setEditParentForm((prev) => ({ ...prev, village: value }));
                              setEditParentErrors((prev) => ({ ...prev, village: '' }));
                            }}
                            required
                          />
                          {editParentErrors.village ? <p className="form-error">{editParentErrors.village}</p> : null}
                          <div className="parent-edit-actions">
                            <button type="submit" disabled={updateParentLoading}>
                              {updateParentLoading ? 'Updating...' : 'Update Parent'}
                            </button>
                            <button type="button" className="secondary" onClick={() => setEditingParentId(null)}>
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : null}
                    </aside>
                  </div>
                )}
              </article>
            ) : activePrincipalMenu === 'Subject' ? (
              <article className="panel module-panel">
                <div className="subject-module-head">
                  <div>
                    <h3>Subject Management</h3>
                    <p className="subject-subtitle">Create, search, and update subjects with structured controls.</p>
                  </div>
                  <button type="button" className="create-subject-cta" onClick={() => setShowCreateSubjectModal(true)}>
                    Create Subject
                  </button>
                </div>

                {subjectModuleLoading ? (
                  <div className="class-loader-wrap">
                    <div className="class-loader" role="status" aria-live="polite">
                      <span className="loader-ring outer" />
                      <span className="loader-ring inner" />
                      <img src={logo} alt="IDPS logo loading" />
                    </div>
                    <p>Loading Subject Management...</p>
                  </div>
                ) : (
                  <section className="subject-list-card">
                    <div className="subject-list-toolbar">
                      <input
                        type="text"
                        value={subjectSearch}
                        onChange={(event) => setSubjectSearch(event.target.value)}
                        placeholder="Search subject by name or ID..."
                      />
                      <span>{filteredSubjectRows.length} subjects</span>
                    </div>
                    <div className="subject-table-head">
                      <span>Subject ID</span>
                      <span>Subject Name</span>
                      <span>Assigned Classes</span>
                      <span>Action</span>
                    </div>
                    <div className="subject-table-body">
                      {filteredSubjectRows.length === 0 ? <p className="subject-empty">No subjects found.</p> : null}
                      {filteredSubjectRows.map((subject) => (
                        <article key={subject.id} className="subject-table-row">
                          <span>{subject.id}</span>
                          <span>{subject.name}</span>
                          <span>{subject.classsubject?.length ?? 0}</span>
                          <button type="button" className="edit-subject-btn" onClick={() => openEditSubject(subject)}>
                            <LuPencil />
                          </button>
                        </article>
                      ))}
                    </div>
                  </section>
                )}

                {showCreateSubjectModal ? (
                  <div className="modal-overlay" role="dialog" aria-modal="true">
                    <section className="subject-modal">
                      <div className="student-modal-head">
                        <div>
                          <h4>Create Subject</h4>
                          <p>Subject ID is auto-generated after creation.</p>
                        </div>
                        <button type="button" className="modal-close-btn" onClick={() => setShowCreateSubjectModal(false)}>
                          Close
                        </button>
                      </div>
                      <form className="subject-form subject-form-create" onSubmit={createSubject}>
                        <label className="field-block">
                          <span className="field-label">Subject Name *</span>
                          <input
                            type="text"
                            value={createSubjectForm.name}
                            onChange={(event) => {
                              setCreateSubjectForm((prev) => ({ ...prev, name: event.target.value }));
                              setCreateSubjectErrors((prev) => ({ ...prev, name: '' }));
                            }}
                            required
                          />
                          {createSubjectErrors.name ? <p className="form-error">{createSubjectErrors.name}</p> : null}
                        </label>
                        <div className="exam-class-selector">
                          <div className="exam-class-selector-head">
                            <h5>Assign Classes *</h5>
                            <span>{createSubjectForm.classIds.length} selected</span>
                          </div>
                          <input
                            type="text"
                            className="exam-class-search"
                            placeholder="Search class by grade or section..."
                            value={subjectClassSearch}
                            onChange={(event) => setSubjectClassSearch(event.target.value)}
                          />
                          <div className="exam-selected-chips">
                            {createSubjectForm.classIds.length === 0 ? <span className="exam-chip empty">No classes selected</span> : null}
                            {createSubjectForm.classIds.map((classId) => {
                              const cls = classes.find((item) => item.id === classId);
                              return cls ? (
                                <button
                                  key={classId}
                                  type="button"
                                  className="exam-chip"
                                  onClick={() =>
                                    setCreateSubjectForm((prev) => ({
                                      ...prev,
                                      classIds: prev.classIds.filter((id) => id !== classId),
                                    }))
                                  }
                                >
                                  {cls.name}-{cls.section} ✕
                                </button>
                              ) : null;
                            })}
                          </div>
                          <div className="exam-class-selector-list">
                            {filteredSubjectClassOptions.length === 0 ? <p className="multi-help">No class found.</p> : null}
                            {filteredSubjectClassOptions.map((cls) => {
                              const checked = createSubjectForm.classIds.includes(cls.id);
                              return (
                                <label key={cls.id} className={checked ? 'exam-class-option checked' : 'exam-class-option'}>
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={(event) => {
                                      const isChecked = event.target.checked;
                                      setCreateSubjectForm((prev) => ({
                                        ...prev,
                                        classIds: isChecked
                                          ? [...prev.classIds, cls.id]
                                          : prev.classIds.filter((id) => id !== cls.id),
                                      }));
                                      setCreateSubjectErrors((prev) => ({ ...prev, classIds: '' }));
                                    }}
                                  />
                                  <div>
                                    <strong>
                                      {cls.name} - {cls.section}
                                    </strong>
                                    <p>{(cls.students ?? []).length} students</p>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                        {createSubjectErrors.classIds ? <p className="form-error">{createSubjectErrors.classIds}</p> : null}
                        <div className="student-modal-actions">
                          <button type="submit" disabled={createSubjectLoading}>
                            {createSubjectLoading ? 'Creating...' : 'Create Subject'}
                          </button>
                          <button type="button" className="secondary" onClick={() => setShowCreateSubjectModal(false)}>
                            Cancel
                          </button>
                        </div>
                      </form>
                    </section>
                  </div>
                ) : null}

                {editingSubjectId ? (
                  <div className="modal-overlay nested" role="dialog" aria-modal="true">
                    <section className="subject-modal">
                      <div className="student-modal-head">
                        <div>
                          <h4>Edit Subject</h4>
                          <p>Update subject details.</p>
                        </div>
                        <button type="button" className="modal-close-btn" onClick={() => setEditingSubjectId(null)}>
                          Close
                        </button>
                      </div>
                      <form className="subject-form" onSubmit={updateSubject}>
                        <label className="field-block">
                          <span className="field-label">Subject Name *</span>
                          <input
                            type="text"
                            value={editSubjectForm.name}
                            onChange={(event) => {
                              setEditSubjectForm((prev) => ({ ...prev, name: event.target.value }));
                              setEditSubjectErrors((prev) => ({ ...prev, name: '' }));
                            }}
                            required
                          />
                          {editSubjectErrors.name ? <p className="form-error">{editSubjectErrors.name}</p> : null}
                        </label>
                        <div className="exam-class-selector">
                          <div className="exam-class-selector-head">
                            <h5>Update Class Assignments *</h5>
                            <span>{editSubjectForm.classIds.length} selected</span>
                          </div>
                          <input
                            type="text"
                            className="exam-class-search"
                            placeholder="Search class by grade or section..."
                            value={editSubjectClassSearch}
                            onChange={(event) => setEditSubjectClassSearch(event.target.value)}
                          />
                          <div className="exam-selected-chips">
                            {editSubjectForm.classIds.length === 0 ? <span className="exam-chip empty">No classes selected</span> : null}
                            {editSubjectForm.classIds.map((classId) => {
                              const cls = classes.find((item) => item.id === classId);
                              return cls ? (
                                <button
                                  key={classId}
                                  type="button"
                                  className="exam-chip"
                                  onClick={() =>
                                    setEditSubjectForm((prev) => ({
                                      ...prev,
                                      classIds: prev.classIds.filter((id) => id !== classId),
                                    }))
                                  }
                                >
                                  {cls.name}-{cls.section} ✕
                                </button>
                              ) : null;
                            })}
                          </div>
                          <div className="exam-class-selector-list">
                            {filteredEditSubjectClassOptions.length === 0 ? <p className="multi-help">No class found.</p> : null}
                            {filteredEditSubjectClassOptions.map((cls) => {
                              const checked = editSubjectForm.classIds.includes(cls.id);
                              return (
                                <label key={cls.id} className={checked ? 'exam-class-option checked' : 'exam-class-option'}>
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={(event) => {
                                      const isChecked = event.target.checked;
                                      setEditSubjectForm((prev) => ({
                                        ...prev,
                                        classIds: isChecked
                                          ? [...prev.classIds, cls.id]
                                          : prev.classIds.filter((id) => id !== cls.id),
                                      }));
                                      setEditSubjectErrors((prev) => ({ ...prev, classIds: '' }));
                                    }}
                                  />
                                  <div>
                                    <strong>
                                      {cls.name} - {cls.section}
                                    </strong>
                                    <p>{(cls.students ?? []).length} students</p>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                        {editSubjectErrors.classIds ? <p className="form-error">{editSubjectErrors.classIds}</p> : null}
                        <div className="student-modal-actions">
                          <button type="submit" disabled={updateSubjectLoading}>
                            {updateSubjectLoading ? 'Updating...' : 'Update Subject'}
                          </button>
                          <button type="button" className="secondary" onClick={() => setEditingSubjectId(null)}>
                            Cancel
                          </button>
                        </div>
                      </form>
                    </section>
                  </div>
                ) : null}
              </article>
            ) : activePrincipalMenu === 'Exam' ? (
              <article className="panel module-panel">
                <div className="exam-module-head">
                  <div>
                    <h3>Exam Management</h3>
                    <p className="exam-subtitle">Create and manage exams class-wise with streamlined operations.</p>
                  </div>
                  <button
                    type="button"
                    className="create-exam-cta"
                    onClick={() => {
                      setCreateExamClassSearch('');
                      setShowCreateExamModal(true);
                    }}
                  >
                    Create Exam
                  </button>
                </div>

                <nav className="exam-breadcrumb" aria-label="Exam navigation breadcrumb">
                  <button type="button" className="crumb-link" onClick={() => setSelectedExamClassId(null)}>
                    Classes
                  </button>
                  <span className="crumb-sep">›</span>
                  {selectedExamClassId ? (
                    <>
                      <button type="button" className="crumb-link" onClick={() => setSelectedExamClassId(null)}>
                        Grade {selectedExamClass?.name} - {selectedExamClass?.section}
                      </button>
                      <span className="crumb-sep">›</span>
                      <span className="crumb-current">Exams</span>
                    </>
                  ) : (
                    <span className="crumb-current">Exams</span>
                  )}
                </nav>

                {examModuleLoading ? (
                  <div className="class-loader-wrap">
                    <div className="class-loader" role="status" aria-live="polite">
                      <span className="loader-ring outer" />
                      <span className="loader-ring inner" />
                      <img src={logo} alt="IDPS logo loading" />
                    </div>
                    <p>Loading Exam Management...</p>
                  </div>
                ) : (
                  <>
                    {!selectedExamClassId ? (
                      <section className="exam-class-grid">
                        {classes.map((cls) => (
                          <button key={cls.id} type="button" className="exam-class-card" onClick={() => setSelectedExamClassId(cls.id)}>
                            <h4>
                              Class {cls.name} - {cls.section}
                            </h4>
                            <p>{(cls.students ?? []).length} students</p>
                          </button>
                        ))}
                      </section>
                    ) : (
                      <section className="exam-list-card">
                        <div className="exam-list-head">
                          <div>
                            <h4>
                              Exams for Class {selectedExamClass?.name} - {selectedExamClass?.section}
                            </h4>
                            <p>{filteredClassExams.length} exam(s)</p>
                          </div>
                          <button type="button" className="ghost-btn" onClick={() => setSelectedExamClassId(null)}>
                            All Classes
                          </button>
                        </div>
                        <div className="exam-table-head">
                          <span>Exam Name</span>
                          <span>Subject</span>
                          <span>Total Marks</span>
                          <span>Date</span>
                          <span>Action</span>
                        </div>
                        <div className="exam-table-body">
                          {filteredClassExams.length === 0 ? <p className="exam-empty">No exams found for this class.</p> : null}
                          {filteredClassExams.map((exam) => (
                            <article key={exam.id} className="exam-table-row">
                              <span>{exam.name}</span>
                              <span>{exam.subject?.name ?? subjects.find((subject) => subject.id === exam.subjectId)?.name ?? 'N/A'}</span>
                              <span>{exam.totalMarks ?? 'N/A'}</span>
                              <span>{exam.examDate ? new Date(exam.examDate).toLocaleDateString() : 'N/A'}</span>
                              <button type="button" className="edit-exam-btn" onClick={() => openEditExam(exam)}>
                                <LuPencil />
                              </button>
                            </article>
                          ))}
                        </div>
                      </section>
                    )}
                  </>
                )}

                {showCreateExamModal ? (
                  <div className="modal-overlay" role="dialog" aria-modal="true">
                    <section className="exam-modal">
                      <div className="student-modal-head">
                        <div>
                          <h4>Create Exam</h4>
                          <p>Create same exam across one or more classes.</p>
                        </div>
                        <button
                          type="button"
                          className="modal-close-btn"
                          onClick={() => {
                            setCreateExamClassSearch('');
                            setShowCreateExamModal(false);
                          }}
                        >
                          Close
                        </button>
                      </div>
                      <form className="exam-form" onSubmit={createExam}>
                        <div className="exam-form-grid">
                          <label className="field-block">
                            <span className="field-label">Exam Name *</span>
                            <input
                              type="text"
                              value={createExamForm.name}
                              onChange={(event) => {
                                setCreateExamForm((prev) => ({ ...prev, name: event.target.value }));
                                setCreateExamErrors((prev) => ({ ...prev, name: '' }));
                              }}
                              required
                            />
                            {createExamErrors.name ? <p className="form-error">{createExamErrors.name}</p> : null}
                          </label>
                          <label className="field-block">
                            <span className="field-label">Subject *</span>
                            <select
                              value={createExamForm.subjectId}
                              onChange={(event) => {
                                setCreateExamForm((prev) => ({ ...prev, subjectId: event.target.value }));
                                setCreateExamErrors((prev) => ({ ...prev, subjectId: '' }));
                              }}
                              required
                            >
                              <option value="">Select Subject</option>
                              {subjects.map((subject) => (
                                <option key={subject.id} value={subject.id}>
                                  {subject.name}
                                </option>
                              ))}
                            </select>
                            {createExamErrors.subjectId ? <p className="form-error">{createExamErrors.subjectId}</p> : null}
                          </label>
                          <label className="field-block">
                            <span className="field-label">Total Marks *</span>
                            <input
                              type="number"
                              min={1}
                              value={createExamForm.totalMarks}
                              onChange={(event) => {
                                setCreateExamForm((prev) => ({ ...prev, totalMarks: event.target.value }));
                                setCreateExamErrors((prev) => ({ ...prev, totalMarks: '' }));
                              }}
                              required
                            />
                            {createExamErrors.totalMarks ? <p className="form-error">{createExamErrors.totalMarks}</p> : null}
                          </label>
                          <label className="field-block">
                            <span className="field-label">Exam Date *</span>
                            <input
                              type="date"
                              value={createExamForm.examDate}
                              onChange={(event) => {
                                setCreateExamForm((prev) => ({ ...prev, examDate: event.target.value }));
                                setCreateExamErrors((prev) => ({ ...prev, examDate: '' }));
                              }}
                              required
                            />
                            {createExamErrors.examDate ? <p className="form-error">{createExamErrors.examDate}</p> : null}
                          </label>
                        </div>
                        <div className="exam-class-selector">
                          <div className="exam-class-selector-head">
                            <h5>Select Classes *</h5>
                            <span>{createExamForm.classIds.length} selected</span>
                          </div>
                          <input
                            type="text"
                            className="exam-class-search"
                            placeholder="Search class by grade or section..."
                            value={createExamClassSearch}
                            onChange={(event) => setCreateExamClassSearch(event.target.value)}
                          />
                          <div className="exam-selected-chips">
                            {createExamForm.classIds.length === 0 ? <span className="exam-chip empty">No classes selected</span> : null}
                            {createExamForm.classIds.map((classId) => {
                              const cls = classes.find((item) => item.id === classId);
                              return cls ? (
                                <button
                                  key={classId}
                                  type="button"
                                  className="exam-chip"
                                  onClick={() =>
                                    setCreateExamForm((prev) => ({
                                      ...prev,
                                      classIds: prev.classIds.filter((id) => id !== classId),
                                    }))
                                  }
                                >
                                  {cls.name}-{cls.section} ✕
                                </button>
                              ) : null;
                            })}
                          </div>
                          <div className="exam-class-selector-list">
                            {filteredCreateExamClasses.length === 0 ? <p className="multi-help">No classes found.</p> : null}
                            {filteredCreateExamClasses.map((cls) => {
                              const checked = createExamForm.classIds.includes(cls.id);
                              return (
                                <label key={cls.id} className={checked ? 'exam-class-option checked' : 'exam-class-option'}>
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={(event) => {
                                      const isChecked = event.target.checked;
                                      setCreateExamForm((prev) => ({
                                        ...prev,
                                        classIds: isChecked
                                          ? [...prev.classIds, cls.id]
                                          : prev.classIds.filter((id) => id !== cls.id),
                                      }));
                                      setCreateExamErrors((prev) => ({ ...prev, classIds: '' }));
                                    }}
                                  />
                                  <div>
                                    <strong>
                                      Class {cls.name} - {cls.section}
                                    </strong>
                                    <p>{(cls.students ?? []).length} students</p>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                        {createExamErrors.classIds ? <p className="form-error">{createExamErrors.classIds}</p> : null}
                        <div className="student-modal-actions">
                          <button type="submit" disabled={createExamLoading}>
                            {createExamLoading ? 'Creating...' : 'Create Exam'}
                          </button>
                          <button
                            type="button"
                            className="secondary"
                            onClick={() => {
                              setCreateExamClassSearch('');
                              setShowCreateExamModal(false);
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </section>
                  </div>
                ) : null}

                {editingExamId ? (
                  <div className="modal-overlay nested" role="dialog" aria-modal="true">
                    <section className="exam-modal">
                      <div className="student-modal-head">
                        <div>
                          <h4>Edit Exam</h4>
                          <p>Update exam details for the selected class.</p>
                        </div>
                        <button type="button" className="modal-close-btn" onClick={() => setEditingExamId(null)}>
                          Close
                        </button>
                      </div>
                      <form className="exam-form" onSubmit={updateExam}>
                        <input
                          type="text"
                          placeholder="Exam Name *"
                          value={editExamForm.name}
                          onChange={(event) => {
                            setEditExamForm((prev) => ({ ...prev, name: event.target.value }));
                            setEditExamErrors((prev) => ({ ...prev, name: '' }));
                          }}
                          required
                        />
                        {editExamErrors.name ? <p className="form-error">{editExamErrors.name}</p> : null}
                        <select
                          value={editExamForm.subjectId}
                          onChange={(event) => {
                            setEditExamForm((prev) => ({ ...prev, subjectId: event.target.value }));
                            setEditExamErrors((prev) => ({ ...prev, subjectId: '' }));
                          }}
                          required
                        >
                          <option value="">Select Subject *</option>
                          {subjects.map((subject) => (
                            <option key={subject.id} value={subject.id}>
                              {subject.name}
                            </option>
                          ))}
                        </select>
                        {editExamErrors.subjectId ? <p className="form-error">{editExamErrors.subjectId}</p> : null}
                        <input
                          type="number"
                          placeholder="Total Marks *"
                          value={editExamForm.totalMarks}
                          onChange={(event) => {
                            setEditExamForm((prev) => ({ ...prev, totalMarks: event.target.value }));
                            setEditExamErrors((prev) => ({ ...prev, totalMarks: '' }));
                          }}
                          required
                        />
                        {editExamErrors.totalMarks ? <p className="form-error">{editExamErrors.totalMarks}</p> : null}
                        <input
                          type="date"
                          value={editExamForm.examDate}
                          onChange={(event) => {
                            setEditExamForm((prev) => ({ ...prev, examDate: event.target.value }));
                            setEditExamErrors((prev) => ({ ...prev, examDate: '' }));
                          }}
                          required
                        />
                        {editExamErrors.examDate ? <p className="form-error">{editExamErrors.examDate}</p> : null}
                        <select
                          value={editExamForm.classId}
                          onChange={(event) => {
                            setEditExamForm((prev) => ({ ...prev, classId: event.target.value }));
                            setEditExamErrors((prev) => ({ ...prev, classId: '' }));
                          }}
                          required
                        >
                          <option value="">Select Class *</option>
                          {classes.map((cls) => (
                            <option key={cls.id} value={cls.id}>
                              {cls.name} - {cls.section}
                            </option>
                          ))}
                        </select>
                        {editExamErrors.classId ? <p className="form-error">{editExamErrors.classId}</p> : null}
                        <div className="student-modal-actions">
                          <button type="submit" disabled={updateExamLoading}>
                            {updateExamLoading ? 'Updating...' : 'Update Exam'}
                          </button>
                          <button type="button" className="secondary" onClick={() => setEditingExamId(null)}>
                            Cancel
                          </button>
                        </div>
                      </form>
                    </section>
                  </div>
                ) : null}
              </article>
            ) : activePrincipalMenu === 'Marks' ? (
              renderMarksModule()
            ) : activePrincipalMenu === 'Payments' ? (
              renderFeeModule()
            ) : activePrincipalMenu === 'Class' ? (
              <article className="panel module-panel">
                <div className="class-module-head">
                  <div>
                    <h3>Class Management</h3>
                    <p className="class-subtitle">Create classes, assign class teachers, and manage class details.</p>
                  </div>
                  <button type="button" className="create-class-cta" onClick={() => setShowCreateClassForm((prev) => !prev)}>
                    {showCreateClassForm ? 'Close Create Form' : 'Create Class'}
                  </button>
                </div>

                {classModuleLoading ? (
                  <div className="class-loader-wrap">
                    <div className="class-loader" role="status" aria-live="polite">
                      <span className="loader-ring outer" />
                      <span className="loader-ring inner" />
                      <img src={logo} alt="IDPS logo loading" />
                    </div>
                    <p>Loading Class Management...</p>
                  </div>
                ) : (
                  <div className="class-module-grid">
                    <section className="class-list-card">
                      <div className="class-list-toolbar">
                        <input
                          type="text"
                          value={classSearch}
                          onChange={(event) => setClassSearch(event.target.value)}
                          placeholder="Search by class, section, or teacher..."
                        />
                        <span>{filteredClassRows.length} classes</span>
                      </div>

                      <div className="class-table-head">
                        <span>Class</span>
                        <span>Section</span>
                        <span>Class Teacher</span>
                        <span>Action</span>
                      </div>
                      <div className="class-table-body">
                        {filteredClassRows.length === 0 ? <p className="class-empty">No classes found.</p> : null}
                        {filteredClassRows.map((cls) => {
                          const mappedTeacher = teacherById.get(cls.teacherId ?? -1);
                          const teacherName = cls.teacher?.name ?? mappedTeacher?.name ?? 'Not Assigned';
                          const teacherPhone = mappedTeacher?.phone ?? '';
                          return (
                            <article key={cls.id} className="class-table-row">
                              <span>Class {cls.name}</span>
                              <span>{cls.section}</span>
                              <span>{teacherPhone ? `${teacherName} - ${teacherPhone}` : teacherName}</span>
                              <button type="button" className="edit-class-btn" onClick={() => openEditClass(cls)}>
                                <LuPencil />
                              </button>
                            </article>
                          );
                        })}
                      </div>
                    </section>

                    <aside className="class-side-panels">
                      {showCreateClassForm ? (
                        <form className="class-form-card" onSubmit={createClass}>
                          <h4>Create Class</h4>
                          <input
                            type="text"
                            placeholder="Class Name (e.g. PP1, 1-A) *"
                            value={createClassForm.name}
                            onChange={(event) => setCreateClassForm((prev) => ({ ...prev, name: event.target.value.toUpperCase() }))}
                            required
                          />
                          <input
                            type="text"
                            placeholder="Section (e.g. A) *"
                            value={createClassForm.section}
                            onChange={(event) =>
                              setCreateClassForm((prev) => ({ ...prev, section: event.target.value.toUpperCase() }))
                            }
                            required
                          />
                          <select
                            value={createClassForm.teacherId}
                            onChange={(event) =>
                              setCreateClassForm((prev) => ({ ...prev, teacherId: event.target.value }))
                            }
                            required
                          >
                            <option value="">Select Teacher *</option>
                            {teachers.map((teacher) => (
                              <option key={teacher.id} value={teacher.id}>
                                {(teacher.name || teacher.user?.name || `Teacher ${teacher.id}`) +
                                  (teacher.phone ? ` - ${teacher.phone}` : '')}
                              </option>
                            ))}
                          </select>
                          <button type="submit" disabled={createClassLoading}>
                            {createClassLoading ? 'Creating...' : 'Create Class'}
                          </button>
                        </form>
                      ) : null}

                      {editingClassId ? (
                        <form className="class-form-card" onSubmit={updateClass}>
                          <h4>Edit Class</h4>
                          <input
                            type="text"
                            placeholder="Class Name *"
                            value={editClassForm.name}
                            onChange={(event) => setEditClassForm((prev) => ({ ...prev, name: event.target.value.toUpperCase() }))}
                            required
                          />
                          <input
                            type="text"
                            placeholder="Section *"
                            value={editClassForm.section}
                            onChange={(event) =>
                              setEditClassForm((prev) => ({ ...prev, section: event.target.value.toUpperCase() }))
                            }
                            required
                          />
                          <select
                            value={editClassForm.teacherId}
                            onChange={(event) => setEditClassForm((prev) => ({ ...prev, teacherId: event.target.value }))}
                            required
                          >
                            <option value="">Select Teacher *</option>
                            {teachers.map((teacher) => (
                              <option key={teacher.id} value={teacher.id}>
                                {(teacher.name || teacher.user?.name || `Teacher ${teacher.id}`) +
                                  (teacher.phone ? ` - ${teacher.phone}` : '')}
                              </option>
                            ))}
                          </select>
                          <div className="class-edit-actions">
                            <button type="submit" disabled={updateClassLoading}>
                              {updateClassLoading ? 'Updating...' : 'Update Class'}
                            </button>
                            <button type="button" className="secondary" onClick={() => setEditingClassId(null)}>
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : null}
                    </aside>
                  </div>
                )}
              </article>
            ) : (
              <article className="panel module-panel">
                <div className="profile-block">
                  <h3>Principal Profile</h3>
                  <p>Name: {user.name}</p>
                  <p>Email: {user.email}</p>
                  <p>Role: {user.role}</p>
                </div>
              </article>
            )}
          </section>
        </section>
      ) : user.role === 'PARENT' ? (
        <section className="non-principal-shell parent-shell">{renderParentDashboard()}</section>
      ) : (
        <section className="non-principal-shell">
          {canViewMarks ? renderMarksModule() : null}
          {canViewFees ? renderFeeModule() : null}
          <section className="dashboard-grid">
            {roleItems.map((item) => (
              <article key={item} className="dashboard-card">
                <h2>{item}</h2>
                <p>Module ready. We can now plug this card directly into backend routes.</p>
              </article>
            ))}

            <article className="dashboard-card profile-card">
              <h2>Profile Summary</h2>
              <p>Name: {user.name}</p>
              <p>Email: {user.email}</p>
              <p>Gender: {user.gender}</p>
              <p>Role: {user.role}</p>
            </article>
          </section>
        </section>
      )}
    </main>
  );
}

function App() {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const [token, setToken] = useState('');
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);

  useEffect(() => {
    const existingToken = localStorage.getItem(TOKEN_KEY);
    const existingUser = localStorage.getItem(USER_KEY);

    if (existingToken && existingUser) {
      try {
        const parsedUser = JSON.parse(existingUser) as User;
        setToken(existingToken);
        setLoggedInUser(parsedUser);
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
  }, []);

  useEffect(() => {
    if (!token || !loggedInUser) {
      document.title = 'IDPS | Login';
    }
  }, [token, loggedInUser]);

  const sendOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const body = await readJson<LoginResponse>(response);
      const message = body?.message ?? 'Unable to send OTP.';

      if (!response.ok) {
        toast.error(message);
        return;
      }

      toast.success(message);
      setStep('otp');
    } catch {
      toast.error('Network error while sending OTP.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/otp-verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const body = await readJson<VerifyResponse>(response);
      const message = body?.message ?? 'OTP verification failed.';

      if (!response.ok) {
        toast.error(message);
        return;
      }

      if (!body?.token || !body.user) {
        toast.error('Login response missing token or user.');
        return;
      }

      setToken(body.token);
      setLoggedInUser(body.user);
      localStorage.setItem(TOKEN_KEY, body.token);
      localStorage.setItem(USER_KEY, JSON.stringify(body.user));
      toast.success(message);
    } catch {
      toast.error('Network error while verifying OTP.');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken('');
    setLoggedInUser(null);
    setOtp('');
    setEmail('');
    setStep('email');
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(PRINCIPAL_MENU_KEY);
    document.title = 'IDPS | Login';
    toast.info('Logged out successfully.');
  };

  if (token && loggedInUser) {
    return (
      <>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop />
        <Dashboard user={loggedInUser} token={token} onLogout={logout} />
      </>
    );
  }

  return (
    <main className="login-page">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop />

      <div className="background-art" aria-hidden="true">
        <img src={logo} alt="" />
      </div>

      <section className="login-shell">
        <section className="login-card">
          <div className="login-card-header">
            <div className="login-card-mark">
              <img src={logo} alt="" />
            </div>
            <div>
              <p>Secure Access</p>
              <h2>Sign in to your portal</h2>
            </div>
          </div>

          <div className="login-badges" aria-hidden="true">
            <span>OTP Protected</span>
            <span>Role Based</span>
            <span>Mobile Ready</span>
          </div>

          {step === 'email' ? (
            <form onSubmit={sendOtp} className="form login-form">
              <label>
                Email
                <input
                  type="email"
                  required
                  placeholder="example@gmail.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>
              <p className="login-note">We will send a 6-digit OTP to this email address.</p>
              <button type="submit" disabled={loading}>
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          ) : null}

          {step === 'otp' ? (
            <form onSubmit={verifyOtp} className="form login-form">
              <label>
                Email
                <input type="email" value={email} disabled />
              </label>

              <label>
                OTP
                <input
                  type="text"
                  inputMode="numeric"
                  minLength={6}
                  maxLength={6}
                  required
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value)}
                />
              </label>

              <div className="row-actions">
                <button type="submit" disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
                <button type="button" className="secondary" onClick={() => setStep('email')}>
                  Change Email
                </button>
              </div>
            </form>
          ) : null}
        </section>
      </section>
    </main>
  );
}

export default App;
