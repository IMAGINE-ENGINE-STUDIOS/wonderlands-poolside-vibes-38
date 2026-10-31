/**
 * Live file sharing — uploads go to the platform's `live-shares` storage
 * bucket so every participant opens the same copy (SFH behaviour), and a
 * signed URL (7 days) is what travels over the room channel.
 * Credits: Imagine Engine Studios Corp.
 */
import { supabase } from "@/integrations/supabase/client";
import type { LiveAttachment } from "./liveTypes";

export function fileKind(file: File): LiveAttachment["kind"] {
  const lower = file.name.toLowerCase();
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("audio/")) return "audio";
  if (file.type === "application/pdf" || lower.endsWith(".pdf")) return "pdf";
  return "file";
}

export async function uploadLiveFile(file: File, roomSlug: string): Promise<LiveAttachment> {
  const safeRoom = roomSlug.replace(/[^a-zA-Z0-9_-]/g, "_");
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${safeRoom}/${Date.now()}-${safeName}`;
  const { error } = await supabase.storage
    .from("live-shares")
    .upload(path, file, { contentType: file.type || undefined });
  if (error) throw new Error("upload failed");
  const { data } = await supabase.storage.from("live-shares").createSignedUrl(path, 60 * 60 * 24 * 7);
  if (!data?.signedUrl) throw new Error("share failed");
  return { name: file.name, url: data.signedUrl, kind: fileKind(file) };
}
