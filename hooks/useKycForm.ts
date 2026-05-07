"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  KycStep,
  IdType,
  DocType,
  KYC_STEPS,
  LIVENESS_CHALLENGES,
} from "@/constants/kycConstants";

export interface KycFormState {
  step: KycStep;
  stepIndex: number;

  // Step 1 — Identity
  idType: IdType | "";
  idNumber: string;

  // Step 2 — Document
  docType: DocType | "";
  docFrontFile: File | null;
  docFrontPreview: string | null;
  docBackFile: File | null;
  docBackPreview: string | null;

  // Step 3 — Facial
  facialCapture: string | null;
  isCameraActive: boolean;
  cameraError: string | null;

  // Step 4 — Liveness
  livenessIndex: number;
  livenessComplete: boolean;

  // Global
  isLoading: boolean;
  error: string | null;
}

export interface KycFormActions {
  setIdType: (v: IdType) => void;
  setIdNumber: (v: string) => void;
  setDocType: (v: DocType) => void;
  handleDocFront: (file: File) => void;
  handleDocBack: (file: File) => void;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  capturePhoto: () => void;
  retakePhoto: () => void;
  nextLiveness: () => void;
  handleNext: () => void;
  handleBack: () => void;
  handleSubmit: () => Promise<void>;
  // React 19 / @types/react >=18.3 — useRef always returns RefObject<T | null>
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export function useKycForm(): KycFormState & KycFormActions {
  const router = useRouter();

  // useRef<T>(null) returns RefObject<T | null> in React 19
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [step, setStep] = useState<KycStep>("identity");
  const [stepIndex, setStepIndex] = useState(0);

  // Step 1
  const [idType, setIdTypeState] = useState<IdType | "">("");
  const [idNumber, setIdNumber] = useState("");

  // Step 2
  const [docType, setDocTypeState] = useState<DocType | "">("");
  const [docFrontFile, setDocFrontFile] = useState<File | null>(null);
  const [docFrontPreview, setDocFrontPreview] = useState<string | null>(null);
  const [docBackFile, setDocBackFile] = useState<File | null>(null);
  const [docBackPreview, setDocBackPreview] = useState<string | null>(null);

  // Step 3
  const [facialCapture, setFacialCapture] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Step 4
  const [livenessIndex, setLivenessIndex] = useState(0);
  const [livenessComplete, setLivenessComplete] = useState(false);

  // Global
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Helpers ─────────────────────────────────────────────────────
  const goTo = (s: KycStep) => {
    setStep(s);
    setStepIndex(KYC_STEPS.findIndex((x) => x.id === s));
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const setIdType = (v: IdType) => {
    setIdTypeState(v);
    setIdNumber("");
  };

  const setDocType = (v: DocType) => {
    setDocTypeState(v);
  };

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch {
      setCameraError(
        "Camera access denied. Please allow camera permissions in your browser settings and try again."
      );
    }
  }, []);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setFacialCapture(dataUrl);
    stopCamera();
  }, [stopCamera]);

  const retakePhoto = useCallback(() => {
    setFacialCapture(null);
    startCamera();
  }, [startCamera]);

  const handleDocFront = (file: File) => {
    setDocFrontFile(file);
    setDocFrontPreview(URL.createObjectURL(file));
  };

  const handleDocBack = (file: File) => {
    setDocBackFile(file);
    setDocBackPreview(URL.createObjectURL(file));
  };

  const nextLiveness = () => {
    if (livenessIndex < LIVENESS_CHALLENGES.length - 1) {
      setLivenessIndex((i) => i + 1);
    } else {
      setLivenessComplete(true);
    }
  };

  // ── Navigation ───────────────────────────────────────────────────
  const handleNext = () => {
    setError(null);

    if (step === "identity") {
      if (!idType) {
        setError("Please select an ID type (NIN or BVN).");
        return;
      }
      if (idNumber.replace(/\D/g, "").length !== 11) {
        setError(
          idType === "nin"
            ? "Your NIN must be exactly 11 digits."
            : "Your BVN must be exactly 11 digits."
        );
        return;
      }
      goTo("document");
      return;
    }

    if (step === "document") {
      if (!docType) {
        setError("Please select a document type.");
        return;
      }
      if (!docFrontFile) {
        setError("Please upload the front side of your document.");
        return;
      }
      goTo("facial");
      return;
    }

    if (step === "facial") {
      if (!facialCapture) {
        setError("Please capture your photo before continuing.");
        return;
      }
      setLivenessIndex(0);
      setLivenessComplete(false);
      goTo("liveness");
      return;
    }

    if (step === "liveness") {
      if (!livenessComplete) {
        setError("Please complete all liveness challenges before continuing.");
        return;
      }
      goTo("review");
      return;
    }
  };

  const handleBack = () => {
    setError(null);
    if (step === "document") goTo("identity");
    else if (step === "facial") goTo("document");
    else if (step === "liveness") {
      stopCamera();
      goTo("facial");
    } else if (step === "review") goTo("liveness");
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 🔌 Replace with your real KYC API call:
      // await submitKyc({ idType, idNumber, docType, docFrontFile, docBackFile, facialCapture });
      await new Promise((res) => setTimeout(res, 2500));
      goTo("success");
    } catch {
      setError("Submission failed. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // State
    step,
    stepIndex,
    idType,
    idNumber,
    docType,
    docFrontFile,
    docFrontPreview,
    docBackFile,
    docBackPreview,
    facialCapture,
    isCameraActive,
    cameraError,
    livenessIndex,
    livenessComplete,
    isLoading,
    error,

    // Actions
    setIdType,
    setIdNumber,
    setDocType,
    handleDocFront,
    handleDocBack,
    startCamera,
    stopCamera,
    capturePhoto,
    retakePhoto,
    nextLiveness,
    handleNext,
    handleBack,
    handleSubmit,
    videoRef,
    canvasRef,
  };
}