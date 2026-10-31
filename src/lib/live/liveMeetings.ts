/**
 * Wonderlands Live meetings — created on the device (no schema change
 * needed), with the unique session link as the single source of truth.
 * Booking flows (Genius, Consultation, CRM) stamp the same link into the
 * appointment record so the team and the guest share one link.
 * Credits: Imagine Engine Studios Corp.
 */
import { supabase } from "@/integrations/supabase/client";
import { liveLink, newRoomSlug, type LiveMeeting } from "./liveTypes";

const KEY = "wlive:meetings:v1";
export const GUEST_NAME_KEY = "wlive:name";

export function loadMeetings(): LiveMeeting[] {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as LiveMeeting[]) : [];
    return Array.isArray(list) ? list.filter((m) => m && m.slug) : [];
  } catch {
    return [];
  }
}

function saveMeetings(list: LiveMeeting[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 60)));
  } catch {
    /* storage full/blocked — the link itself still works */
  }
}

export function createMeeting(input: { title?: string; guestName?: string; guestEmail?: string; startsAt?: string | null }): LiveMeeting {
  const title = (input.title ?? "").trim() || "Wonderlands consultation";
  // Never reuse an ID: regenerate until the slug is unique on this device.
  const taken = new Set(loadMeetings().map((m) => m.slug));
  let slug = newRoomSlug(title);
  while (taken.has(slug)) slug = newRoomSlug(title);
  const meeting: LiveMeeting = {
    slug,
    title,
    guestName: input.guestName?.trim() || undefined,
    guestEmail: input.guestEmail?.trim() || undefined,
    startsAt: input.startsAt ?? null,
    createdAt: Date.now(),
  };
  saveMeetings([meeting, ...loadMeetings()]);
  return meeting;
}

export function deleteMeeting(slug: string) {
  saveMeetings(loadMeetings().filter((m) => m.slug !== slug));
}

export function meetingTitle(slug: string): string | null {
  return loadMeetings().find((m) => m.slug === slug)?.title ?? null;
}

/** A fresh session link for booking flows (Genius / Consultation / CRM). */
export function freshMeetingLink(title?: string): { slug: string; link: string } {
  const m = createMeeting({ title });
  return { slug: m.slug, link: liveLink(m.slug) };
}

/**
 * Host powers require a signed-in Wonderlands team account: a main admin,
 * or a member of any company on the platform (the business/team accounts).
 * Guests never need an account.
 */
export async function canHost(): Promise<boolean> {
  try {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) return false;
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if ((profile as { role?: string } | null)?.role === "main_admin") return true;
    const { data: memberships } = await supabase
      .from("company_members")
      .select("id")
      .eq("user_id", user.id)
      .limit(1);
    return !!(memberships && memberships.length > 0);
  } catch {
    return false;
  }
}
