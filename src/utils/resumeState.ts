export interface ContactDraft {
  name: string;
  email: string;
  service: string;
  budget: string;
  message: string;
}

export interface ResumeState {
  mode: 'hero' | 'case';
  isExpanded: boolean;
  studioContactOpen: boolean;
  portfolioContactOpen: boolean;
  resumeModalOpen: boolean;
  selectedProjectId: string | null;
  portfolioScrollY: number;
  portfolioScrollProgress: number;
  portfolioViewportWidth: number;
  portfolioViewportHeight: number;
  contactDraft: ContactDraft;
  contactSubmitted: boolean;
  updatedAt: number;
}

const STORAGE_KEY = 'rehan_portfolio_resume_state_v2';
const FLUSH_EVENT_NAME = 'rehan:portfolio-flush-scroll';

export const DEFAULT_CONTACT_DRAFT: ContactDraft = {
  name: '',
  email: '',
  service: 'Make.com Workflow Automation',
  budget: 'Freelance Project',
  message: '',
};

export const DEFAULT_RESUME_STATE: ResumeState = {
  mode: 'hero',
  isExpanded: false,
  studioContactOpen: false,
  portfolioContactOpen: false,
  resumeModalOpen: false,
  selectedProjectId: null,
  portfolioScrollY: 0,
  portfolioScrollProgress: 0,
  portfolioViewportWidth: 0,
  portfolioViewportHeight: 0,
  contactDraft: { ...DEFAULT_CONTACT_DRAFT },
  contactSubmitted: false,
  updatedAt: 0,
};

let memoryFallback: ResumeState | null = null;
let pendingScrollRestore = false;

export function markPendingScrollRestore(): void {
  pendingScrollRestore = true;
}

export function consumePendingScrollRestore(): boolean {
  const value = pendingScrollRestore;
  pendingScrollRestore = false;
  return value;
}

export function dispatchFlushScroll(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(FLUSH_EVENT_NAME));
}

export function subscribeFlushScroll(onFlush: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(FLUSH_EVENT_NAME, onFlush);
  return () => window.removeEventListener(FLUSH_EVENT_NAME, onFlush);
}

function mergeState(raw: Partial<ResumeState> | null | undefined): ResumeState {
  if (!raw || typeof raw !== 'object') {
    return {
      ...DEFAULT_RESUME_STATE,
      contactDraft: { ...DEFAULT_CONTACT_DRAFT },
    };
  }

  return {
    mode: raw.mode === 'case' ? 'case' : 'hero',
    isExpanded: Boolean(raw.isExpanded),
    studioContactOpen: Boolean(raw.studioContactOpen),
    portfolioContactOpen: Boolean(raw.portfolioContactOpen),
    resumeModalOpen: Boolean(raw.resumeModalOpen),
    selectedProjectId: typeof raw.selectedProjectId === 'string' ? raw.selectedProjectId : null,
    portfolioScrollY:
      typeof raw.portfolioScrollY === 'number' && Number.isFinite(raw.portfolioScrollY)
        ? Math.max(0, raw.portfolioScrollY)
        : 0,
    portfolioScrollProgress:
      typeof raw.portfolioScrollProgress === 'number' && Number.isFinite(raw.portfolioScrollProgress)
        ? Math.min(1, Math.max(0, raw.portfolioScrollProgress))
        : 0,
    portfolioViewportWidth:
      typeof raw.portfolioViewportWidth === 'number' && Number.isFinite(raw.portfolioViewportWidth)
        ? Math.max(0, raw.portfolioViewportWidth)
        : 0,
    portfolioViewportHeight:
      typeof raw.portfolioViewportHeight === 'number' && Number.isFinite(raw.portfolioViewportHeight)
        ? Math.max(0, raw.portfolioViewportHeight)
        : 0,
    contactDraft: {
      ...DEFAULT_CONTACT_DRAFT,
      ...(raw.contactDraft && typeof raw.contactDraft === 'object' ? raw.contactDraft : {}),
    },
    contactSubmitted: Boolean(raw.contactSubmitted),
    updatedAt: typeof raw.updatedAt === 'number' ? raw.updatedAt : 0,
  };
}

export function loadResumeState(): ResumeState {
  if (typeof window === 'undefined') {
    return mergeState(null);
  }

  if (memoryFallback) {
    return memoryFallback;
  }

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = mergeState(JSON.parse(raw) as Partial<ResumeState>);
      memoryFallback = parsed;
      return parsed;
    }
  } catch {
    // Ignore storage access restrictions and use memory fallback
  }

  return mergeState(memoryFallback);
}

export function saveResumeState(next: ResumeState): ResumeState {
  const normalized = mergeState({ ...next, updatedAt: Date.now() });
  memoryFallback = normalized;

  if (typeof window === 'undefined') {
    return normalized;
  }

  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  } catch {
    // Ignore storage quota/access restrictions
  }

  return normalized;
}

export function patchResumeState(
  updater: Partial<ResumeState> | ((prev: ResumeState) => Partial<ResumeState>)
): ResumeState {
  const current = loadResumeState();
  const partial = typeof updater === 'function' ? updater(current) : updater;
  return saveResumeState({
    ...current,
    ...partial,
    contactDraft: partial.contactDraft
      ? { ...current.contactDraft, ...partial.contactDraft }
      : current.contactDraft,
  });
}

export function subscribeResumeSync(onSync: (state: ResumeState) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleMessage = (e: MessageEvent) => {
    if (e.data && e.data.type === 'PORTFOLIO_SYNC') {
      onSync(loadResumeState());
    }
  };

  window.addEventListener('message', handleMessage);

  return () => {
    window.removeEventListener('message', handleMessage);
  };
}
