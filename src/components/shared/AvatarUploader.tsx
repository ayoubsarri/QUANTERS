"use client";

import React, { useRef, useState } from "react";
import { Camera, CheckCircle2, Sparkles, UploadCloud } from "lucide-react";
import { compressAndResizeImage, CompressedImageResult, formatBytes } from "@/lib/utils/imageCompressor";
import { useQuantersStore } from "@/lib/store/useQuantersStore";

interface AvatarUploaderProps {
  currentAvatarUrl: string;
  onAvatarCompressed: (dataUrl: string, meta?: CompressedImageResult) => void;
  compact?: boolean;
}

export function AvatarUploader({
  currentAvatarUrl,
  onAvatarCompressed,
  compact = false,
}: AvatarUploaderProps) {
  const settings = useQuantersStore((s) => s.settings);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [stats, setStats] = useState<CompressedImageResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setCompressing(true);
    try {
      const result = await compressAndResizeImage(file, {
        maxDimension: settings.maxImageDimensionPx || 256,
        squareCrop: true,
        quality: (settings.webpCompressionQuality || 78) / 100,
      });
      setStats(result);
      onAvatarCompressed(result.dataUrl, result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process image.");
    } finally {
      setCompressing(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative group">
        <img
          src={currentAvatarUrl}
          alt="Member Avatar"
          className={`${
            compact ? "w-16 h-16" : "w-20 h-20"
          } rounded-full object-cover border-2 border-white shadow-md`}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#1D63EB] text-white flex items-center justify-center shadow-md hover:bg-blue-700 transition"
          title="Upload & auto-compress avatar"
        >
          <Camera className="w-3.5 h-3.5" />
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {!compact && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1D63EB] bg-[#E0F0FF] px-3 py-1 rounded-full hover:bg-blue-100 transition"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          {compressing ? "Uploading..." : "Change Photo"}
        </button>
      )}

      {stats && (
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Photo updated</span>
        </div>
      )}

      {error && <p className="text-[11px] text-red-600 font-medium">{error}</p>}
    </div>
  );
}
