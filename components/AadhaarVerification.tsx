'use client';

import { useState } from 'react';
import { Camera, Upload, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface AadhaarVerificationProps {
  onVerified: (data: { age: number; dob: string }) => void;
}

export function AadhaarVerification({ onVerified }: AadhaarVerificationProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        setPreview(base64String);

        const res = await fetch('/api/verify-aadhaar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64Data }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Verification failed');

        if (data.isVerified) {
          setSuccess(true);
          onVerified({ age: data.age, dob: data.dob });
        } else {
          throw new Error('Could not verify Aadhaar details.');
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setError(err.message || 'Error uploading image.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-sm">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Camera className="h-4 w-4 text-indigo-400" />
          Aadhaar Age Verification
        </h3>
        <p className="text-xs text-slate-400 mt-1">Upload your Aadhaar card to verify your age.</p>
      </div>

      {!success && !preview && (
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-slate-950/50 py-8 transition-all hover:border-indigo-500/50 hover:bg-slate-900">
          <Upload className="h-8 w-8 text-slate-500 mb-3" />
          <span className="text-sm font-medium text-slate-300">Click to upload image</span>
          <span className="text-xs text-slate-500 mt-1">JPG, PNG up to 5MB</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={loading}
          />
        </label>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-6 text-indigo-400">
          <Loader2 className="h-8 w-8 animate-spin mb-2" />
          <span className="text-xs font-medium animate-pulse">AI is verifying your ID...</span>
        </div>
      )}

      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-rose-500/10 p-3 text-rose-400 border border-rose-500/20">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="text-xs">{error}</div>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 rounded-xl bg-emerald-500/10 p-4 border border-emerald-500/20">
          <CheckCircle2 className="h-8 w-8 text-emerald-400 shrink-0" />
          <div>
            <div className="text-sm font-bold text-emerald-400">Verified Successfully</div>
            <div className="text-xs text-emerald-500/80">Your age has been confirmed.</div>
          </div>
        </div>
      )}
    </div>
  );
}
