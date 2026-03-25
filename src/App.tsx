import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import type { IconType } from 'react-icons';
import {
  LuBookCopy,
  LuBookOpen,
  LuCircleDollarSign,
  LuGauge,
  LuGraduationCap,
  LuLogOut,
  LuPencil,
  LuSearch,
  LuSettings,
  LuSlidersHorizontal,
  LuUserRoundCheck,
  LuUsers,
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
};

type ClassStudent = {
  id: number;
  name: string;
};

type StudentMasterDetail = {
  id: number;
  name: string;
  photo?: string | null;
  gender?: 'MALE' | 'FEMALE';
  dob?: string | null;
  classId?: number | null;
  busId?: number | null;
  class?: {
    id: number;
    name: number;
    section: string;
  } | null;
  bus?: {
    id: number;
    busNumber?: string | number | null;
    routeName?: string | null;
  } | null;
  parents?: Array<{
    parent?: {
      id: number;
      name: string;
      relation?: string | null;
      phone1?: string | null;
      phone2?: string | null;
      village?: string | null;
    } | null;
  }>;
};

type ClassSection = {
  id: number;
  name: number;
  section: string;
  students: ClassStudent[];
  teacherId?: number | null;
  teacher?: {
    id: number;
    name: string;
  } | null;
  attendanceSessions?: Array<{
    id: number;
    date?: string;
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
  phone1?: string | null;
  phone2?: string | null;
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
      name: number;
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
    name: number;
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
      name: number;
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
    { name: 'Class', Icon: LuBookCopy },
    { name: 'Bus', Icon: LuCircleDollarSign },
    { name: 'Parents', Icon: LuUsers },
    { name: 'Teachers', Icon: LuUsers },
    { name: 'Attendance', Icon: LuUserRoundCheck },
    { name: 'Subject', Icon: LuBookCopy },
    { name: 'Exam', Icon: LuBookOpen },
    { name: 'Marks', Icon: LuBookOpen },
    { name: 'Payment', Icon: LuCircleDollarSign },
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

  const studentDirectoryRows = useMemo(() => {
    return classes.flatMap((cls) =>
      (cls.students ?? []).map((student) => ({
        id: student.id,
        name: student.name,
        className: cls.name,
        section: cls.section,
      })),
    );
  }, [classes]);

  const filteredStudentDirectoryRows = useMemo(() => {
    const query = studentDirectorySearch.trim().toLowerCase();
    if (!query) {
      return studentDirectoryRows;
    }

    return studentDirectoryRows.filter((row) => {
      const profile = studentProfiles[row.id];
      const parentText = (profile?.parents ?? [])
        .map((item) => item.parent?.name ?? '')
        .join(' ')
        .toLowerCase();
      return (
        row.name.toLowerCase().includes(query) ||
        String(row.className).toLowerCase().includes(query) ||
        row.section.toLowerCase().includes(query) ||
        parentText.includes(query)
      );
    });
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

  const loadClasses = async () => {
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
  };

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

  const loadStudentProfile = async (studentId: number) => {
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
    if (user.role === 'PRINCIPAL' && activePrincipalMenu === 'Payment') {
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
    if (!studentProfiles[studentId]) {
      setStudentProfileLoading(true);
      await loadStudentProfile(studentId);
      setStudentProfileLoading(false);
    }
  };

  const openStudentEdit = async (studentId: number) => {
    setActiveStudentId(studentId);
    setStudentAction('edit');
    setStudentProfileLoading(true);
    const profile = studentProfiles[studentId] ?? (await loadStudentProfile(studentId));
    if (profile) {
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
          name: Number(createClassForm.name),
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
          name: Number(editClassForm.name),
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

  const activeStudentPrimaryParent = useMemo(() => {
    return activeStudentProfile?.parents?.[0]?.parent ?? null;
  }, [activeStudentProfile]);

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

  return (
    <main className="dashboard-page">
      {user.role !== 'PRINCIPAL' ? (
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
            {activePrincipalMenu === 'Dashboard' ? (
              <section className="dashboard-soon">
                <p className="dashboard-soon-kicker">Dashboard</p>
                <h3>This section is building soon</h3>
                <p>We’re preparing a cleaner school ERP analytics hub for this area.</p>
              </section>
            ) : activePrincipalMenu === 'Students' ? (
              <article className="panel module-panel">
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
                    <section className="student-list-card">
                      <div className="student-list-toolbar">
                        <input
                          type="text"
                          value={studentDirectorySearch}
                          onChange={(event) => setStudentDirectorySearch(event.target.value)}
                          placeholder="Search by student, class, section, or parent..."
                        />
                        <span>{filteredStudentDirectoryRows.length} students</span>
                      </div>

                      <div className="student-table-head">
                        <span>Name</span>
                        <span>Class</span>
                        <span>Section</span>
                        <span>Parent</span>
                        <span>Actions</span>
                      </div>
                      <div className="student-table-body">
                        {filteredStudentDirectoryRows.length === 0 ? <p className="student-empty">No students found.</p> : null}
                        {filteredStudentDirectoryRows.map((row) => {
                          const profile = studentProfiles[row.id];
                          const parentLabel = profile?.parents?.[0]?.parent?.name ?? 'View for details';
                          return (
                            <article key={row.id} className="student-table-row">
                              <span>{row.name}</span>
                              <span>{row.className}</span>
                              <span>{row.section}</span>
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
                          <h4>Student Insights</h4>
                          <p className="student-side-note">
                            Click <strong>View</strong> to open a full-screen profile with student details, fees, exams, marks, and attendance.
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
                            <p>Profile cards, fee charts, marks trends, and attendance indicators will appear in the modal.</p>
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
                        {studentProfileLoading && !activeStudentProfile ? (
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
                              <article className="student-insight-card">
                                <header>
                                  <h5>Student Details</h5>
                                  <span>Identity and enrollment</span>
                                </header>
                                <div className="student-insight-specs">
                                  <div>
                                    <span>Name</span>
                                    <strong>{activeStudentProfile?.name ?? 'N/A'}</strong>
                                  </div>
                                  <div>
                                    <span>Gender</span>
                                    <strong>{activeStudentProfile?.gender ?? 'N/A'}</strong>
                                  </div>
                                  <div>
                                    <span>DOB</span>
                                    <strong>
                                      {activeStudentProfile?.dob ? new Date(activeStudentProfile.dob).toLocaleDateString() : 'N/A'}
                                    </strong>
                                  </div>
                                  <div>
                                    <span>Student ID</span>
                                    <strong>{activeStudentProfile?.id ?? activeStudentId}</strong>
                                  </div>
                                </div>
                              </article>

                              <article className="student-insight-card">
                                <header>
                                  <h5>Parent Details</h5>
                                  <span>Primary guardians</span>
                                </header>
                                <div className="student-insight-list">
                                  {(activeStudentProfile?.parents ?? []).length === 0 ? (
                                    <p className="student-insight-empty">No parent data available.</p>
                                  ) : (
                                    (activeStudentProfile?.parents ?? []).map((item, index) => (
                                      <article key={item.parent?.id ?? index} className="student-insight-list-item">
                                        <strong>{item.parent?.name ?? 'Parent'}</strong>
                                        <span>
                                          {item.parent?.relation ?? 'Relation N/A'}
                                          {item.parent?.phone1 ? ` · ${item.parent.phone1}` : ''}
                                        </span>
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
                                  <h5>Contact & Admission</h5>
                                  <span>Communication details</span>
                                </header>
                                <div className="student-insight-specs">
                                  <div>
                                    <span>Guardian</span>
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
                                    <span>Address</span>
                                    <strong>{activeStudentPrimaryParent?.village ?? 'N/A'}</strong>
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
                                    <span>Documents</span>
                                    <strong>N/A</strong>
                                  </div>
                                  <div>
                                    <span>Remarks</span>
                                    <strong>N/A</strong>
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
            ) : activePrincipalMenu === 'Payment' ? (
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
                            type="number"
                            placeholder="Class Name (e.g. 6) *"
                            value={createClassForm.name}
                            onChange={(event) => setCreateClassForm((prev) => ({ ...prev, name: event.target.value }))}
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
                            type="number"
                            placeholder="Class Name *"
                            value={editClassForm.name}
                            onChange={(event) => setEditClassForm((prev) => ({ ...prev, name: event.target.value }))}
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

      <section className="login-card">
        <h1>IDPS KOVVUR LOGIN</h1>
        <p className="subtitle">Secure OTP sign in for Principal, Teacher, Receptionist, and Parent.</p>

        {step === 'email' ? (
          <form onSubmit={sendOtp} className="form">
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
            <button type="submit" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        ) : null}

        {step === 'otp' ? (
          <form onSubmit={verifyOtp} className="form">
            <label>
              Email
              <input type="email" value={email} disabled />
            </label>

            <label>
              OTP
              <input
                type="text"
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
    </main>
  );
}

export default App;
