/**
 * Genius appointment desk — a local slot-filling conversation that ends in a
 * real booking.
 *
 * Genius collects the guest's name, a way to reach them, a WhatsApp
 * preference and a preferred time, then books it through the
 * `book-appointment` function (stored for the Wonderlands team and confirmed by
 * email). All of the language here is composed in the browser — no paid text
 * service is used.
 */

import { supabase } from '@/integrations/supabase/client';
import type { NarratorAction } from '@/lib/narratorStore';

export const SCHEDULE_LINK = 'https://calendly.com/wonderlandsworlds/30min';

export type BookingStep = 'name' | 'contact' | 'when' | 'whatsapp' | 'confirm';

interface BookingDraft {
  name?: string;
  email?: string;
  phone?: string;
  whatsapp?: boolean;
  whenText?: string;
  preferredAt?: string | null;
  topic?: string;
}

let step: BookingStep | null = null;
let draft: BookingDraft = {};

export const isBookingActive = () => step !== null;

export function cancelBooking() {
  step = null;
  draft = {};
}

/** True when the guest is asking for an appointment / consultation / call. */
export function wantsAppointment(text: string) {
  const t = text.toLowerCase();
  return /\b(book|schedule|set up|arrange|reserve)\b.*\b(appointment|consultation|call|visit|meeting|survey|walk ?through)\b/.test(t)
    || /\b(appointment|consultation)\b.*\b(please|can you|could you|i want|i need|id like|i would like)\b/.test(t)
    || /\b(talk to (a|someone|a person|a human|sales)|speak (to|with) (someone|a person|a human))\b/.test(t);
}

const chips = (labels: string[]): NarratorAction[] => labels.map((label) => ({ label, type: 'branch', payload: label }));

/** Open the appointment conversation. */
export function startBooking(topic?: string): { reply: string; actions: NarratorAction[] } {
  step = 'name';
  draft = { topic };
  return {
    reply: 'I can book that with a Wonderlands designer. What name should I put it under?',
    actions: chips(['Cancel the booking']),
  };
}

/* ------------------------------ time reading ------------------------------ */

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

/** Best-effort natural time reading — falls back to keeping the guest's words. */
function readWhen(text: string): { at: Date | null; label: string } {
  const t = text.toLowerCase();
  const now = new Date();
  const target = new Date(now);
  let matched = false;

  if (/\btoday\b/.test(t)) matched = true;
  else if (/\btomorrow\b/.test(t)) {
    target.setDate(target.getDate() + 1);
    matched = true;
  } else {
    const day = DAYS.findIndex((d) => new RegExp(`\\b${d}\\b`).test(t));
    if (day >= 0) {
      const ahead = (day - target.getDay() + 7) || 7;
      target.setDate(target.getDate() + (/\bnext\b/.test(t) ? ahead + 7 : ahead));
      matched = true;
    }
  }

  const clock = t.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/);
  if (clock) {
    let hour = Number(clock[1]);
    const minute = clock[2] ? Number(clock[2]) : 0;
    const suffix = clock[3];
    if (suffix === 'pm' && hour < 12) hour += 12;
    if (suffix === 'am' && hour === 12) hour = 0;
    if (!suffix && hour <= 7) hour += 12; // "at 3" reads as the afternoon
    if (hour >= 0 && hour <= 23) {
      target.setHours(hour, minute, 0, 0);
      matched = true;
    }
  } else if (/\bmorning\b/.test(t)) {
    target.setHours(10, 0, 0, 0);
  } else if (/\bafternoon\b/.test(t)) {
    target.setHours(14, 0, 0, 0);
  } else if (/\bevening\b/.test(t)) {
    target.setHours(17, 0, 0, 0);
  } else {
    target.setHours(10, 0, 0, 0);
  }

  if (!matched) return { at: null, label: text.trim() };
  const label = target.toLocaleString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
  return { at: target, label };
}

const EMAIL = /[^\s@]+@[^\s@]+\.[a-z]{2,}/i;
const PHONE = /(\+?\d[\d\-().\s]{7,}\d)/;

/**
 * Feed the guest's next answer into the booking conversation.
 * Returns null when no booking is in progress.
 */
export async function advanceBooking(
  text: string,
  context?: { product?: string; category?: string; route?: string },
): Promise<{ reply: string; actions: NarratorAction[] } | null> {
  if (!step) return null;
  const said = text.trim();

  if (/\b(cancel|never mind|nevermind|stop|forget it)\b/i.test(said)) {
    cancelBooking();
    return { reply: 'Cancelled — no appointment made. We can keep looking through the book.', actions: [] };
  }

  switch (step) {
    case 'name': {
      draft.name = said.replace(/^(i am|im|my name is|this is)\s+/i, '').slice(0, 80);
      step = 'contact';
      return {
        reply: `Lovely, ${draft.name}. What is the best email or phone number to confirm on?`,
        actions: chips(['Cancel the booking']),
      };
    }
    case 'contact': {
      const email = said.match(EMAIL)?.[0];
      const phone = said.match(PHONE)?.[0];
      if (!email && !phone) {
        return {
          reply: 'I just need an email address or a phone number to send the confirmation to.',
          actions: chips(['Cancel the booking']),
        };
      }
      draft.email = email;
      draft.phone = phone?.replace(/[^\d+]/g, '');
      step = draft.phone ? 'whatsapp' : 'when';
      return draft.phone
        ? {
            reply: 'May we also reach you on WhatsApp at that number?',
            actions: chips(['Yes, WhatsApp is fine', 'No, calls and email only']),
          }
        : {
            reply: 'When suits you? A day and a time is enough — say Friday at 3, for instance.',
            actions: chips(['Tomorrow at 10am', 'Friday at 3pm', 'Next week']),
          };
    }
    case 'whatsapp': {
      draft.whatsapp = /\b(yes|yeah|sure|ok|okay|fine|please|whatsapp)\b/i.test(said) && !/\bno\b/i.test(said);
      step = 'when';
      return {
        reply: 'Noted. When suits you? A day and a time is enough.',
        actions: chips(['Tomorrow at 10am', 'Friday at 3pm', 'Next week']),
      };
    }
    case 'when': {
      const { at, label } = readWhen(said);
      draft.preferredAt = at ? at.toISOString() : null;
      draft.whenText = label;
      step = 'confirm';
      return {
        reply: `${label} it is. Shall I book that with a designer?`,
        actions: chips(['Yes, book it', 'Cancel the booking']),
      };
    }
    case 'confirm': {
      if (!/\b(yes|yeah|book|confirm|please|do it|go ahead|ok|okay)\b/i.test(said)) {
        step = 'when';
        return {
          reply: 'No problem — what day and time would you prefer instead?',
          actions: chips(['Tomorrow at 10am', 'Friday at 3pm']),
        };
      }
      const payload = {
        name: draft.name || 'Wonderlands guest',
        email: draft.email ?? null,
        phone: draft.phone ?? null,
        whatsapp_optin: !!draft.whatsapp,
        preferred_at: draft.preferredAt,
        preferred_text: draft.whenText ?? null,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        topic: draft.topic || context?.product || context?.category || 'Outdoor living consultation',
        notes: context?.route ? `Requested from ${context.route}` : null,
      };
      const when = draft.whenText;
      try {
        const { data, error } = await supabase.functions.invoke('book-appointment', { body: payload });
        if (error) throw error;
        cancelBooking();
        return {
          reply: `Booked. A Wonderlands designer will confirm ${when}${data?.confirmationSent ? ' by email' : ''}. Shall we keep designing in the meantime?`,
          actions: chips(['Keep reading the book', 'Price my design']),
        };
      } catch {
        cancelBooking();
        return {
          reply: `I could not lodge that request just now. You can pick a time directly at ${SCHEDULE_LINK} and it lands with the same team.`,
          actions: [{ label: 'Open scheduling', type: 'navigate', payload: '/consent' }],
        };
      }
    }
  }
}
