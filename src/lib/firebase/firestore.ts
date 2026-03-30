import { collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, Timestamp, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "./client";
import { Candidate } from "../types";

export interface RecruiterNotes {
  salaryExpectation?: string;
  workArrangement?: string;
  strongPoints?: string;
  weakPoints?: string;
  general?: string;
}

export interface InterviewRecord {
  id: string;
  userId: string;
  candidateName: string;
  roleTitle: string;
  cvUrl?: string;
  jdUrl?: string;
  cvText?: string;
  jdText?: string;
  analysis: any;
  questions: any[];
  notes?: string;
  recruiterNotes?: RecruiterNotes;
  createdAt: Date;
}

// ── Process (multi-candidate) persistence ──

export interface ProcessRecord {
  id: string;
  userId: string;
  roleName: string;
  jdText: string;
  candidates: Candidate[];
  createdAt: Date;
  updatedAt: Date;
}

export const saveProcess = async (userId: string, roleName: string, jdText: string, candidates: Candidate[]): Promise<string> => {
  const ref = doc(collection(db, "processes"));
  const now = new Date();
  await setDoc(ref, {
    userId,
    roleName,
    jdText,
    candidates: JSON.parse(JSON.stringify(candidates)),
    createdAt: Timestamp.fromDate(now),
    updatedAt: Timestamp.fromDate(now),
  });
  return ref.id;
};

export const updateProcess = async (processId: string, candidates: Candidate[]) => {
  const ref = doc(db, "processes", processId);
  await updateDoc(ref, {
    candidates: JSON.parse(JSON.stringify(candidates)),
    updatedAt: Timestamp.fromDate(new Date()),
  });
};

export const getProcess = async (processId: string): Promise<ProcessRecord | null> => {
  const snap = await getDoc(doc(db, "processes", processId));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    id: snap.id,
    userId: data.userId,
    roleName: data.roleName || "Sem título",
    jdText: data.jdText,
    candidates: data.candidates,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
  };
};

export const getUserProcesses = async (userId: string): Promise<ProcessRecord[]> => {
  const q = query(
    collection(db, "processes"),
    where("userId", "==", userId),
    orderBy("updatedAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => {
    const data = d.data();
    return {
      id: d.id,
      userId: data.userId,
      roleName: data.roleName || "Sem título",
      jdText: data.jdText,
      candidates: data.candidates,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    };
  });
};

export const deleteProcess = async (processId: string) => {
  await deleteDoc(doc(db, "processes", processId));
};

// ── Legacy interview functions ──

const cleanObject = (obj: any) => {
  const cleaned = { ...obj };
  Object.keys(cleaned).forEach(key => cleaned[key] === undefined && delete cleaned[key]);
  return cleaned;
};

export const saveInterview = async (interview: Omit<InterviewRecord, "id" | "createdAt">) => {
  const interviewsRef = collection(db, "interviews");
  const newDocRef = doc(interviewsRef);
  const newRecord: InterviewRecord = { ...cleanObject(interview), id: newDocRef.id, createdAt: new Date() };
  await setDoc(newDocRef, { ...newRecord, createdAt: Timestamp.fromDate(newRecord.createdAt) });
  return newRecord;
};

export const getUserInterviews = async (userId: string): Promise<InterviewRecord[]> => {
  const q = query(collection(db, "interviews"), where("userId", "==", userId), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ ...d.data(), id: d.id, createdAt: d.data().createdAt.toDate() } as InterviewRecord));
};

export const updateInterviewNotes = async (interviewId: string, notes: string, recruiterNotes?: RecruiterNotes) => {
  const updateData: any = { notes };
  if (recruiterNotes !== undefined) updateData.recruiterNotes = recruiterNotes;
  await updateDoc(doc(db, "interviews", interviewId), updateData);
};

export const deleteInterview = async (interviewId: string) => {
  await deleteDoc(doc(db, "interviews", interviewId));
};
