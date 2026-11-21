import React, { Suspense, lazy, useEffect, useLayoutEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import {
  dispatchFlushScroll,
  markPendingScrollRestore,
  patchResumeState,
} from '../utils/resumeState';

const ContactModal = lazy(() => import('./ContactModal'));
const PortfolioExperience = lazy(() => import('./PortfolioExperience'));

const HX = (u: string, w: number, q: number) =>
  `https://images.higgs.ai/?default=1&output=webp&url=${encodeURIComponent(u)}&w=${w}&q=${q}`;
const CF = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/';

function getStudioAssets(isMobile: boolean) {
  const plateW = isMobile ? 1080 : 2048;
  const plateQ = isMobile ? 80 : 85;
  const badgeW = isMobile ? 640 : 1200;
  return {
    plate: HX(CF + 'hf_20261111_001031_a09dc558-2c69-4e05-83a4-5f01ebdd1363.png', plateW, plateQ),
    casePlate: HX(CF + 'hf_20261111_001031_4a7c3fd9-2168-4219-9736-096a17bbb0e2.png', plateW, plateQ),
    cut: HX(CF + 'hf_20261111_001143_ec356b1a-50a2-4b50-82fc-e346c914a406.png', plateW, plateQ),
    badge: HX(CF + 'hf_20261111_001143_65c037e6-0768-4b12-9f17-17be132ce16b.png', badgeW, plateQ),
    trans: CF + 'hf_20261111_001144_2b054228-95af-41d5-922d-b02979fe485b.mp4',
  };
}

const EASE = 'cubic-bezier(.2,.8,.2,1)';

const BadgeCardContent: React.FC<{
  badgeSrc: string;
  cutSrc: string;
  isMain?: boolean;
  onHitEnter?: () => void;
}> = React.memo(({ badgeSrc, cutSrc, isMain, onHitEnter }) => (
  <>
    <img src={badgeSrc} alt="" decoding="async" />
    <div className="haldoren-card">
      <h4>
        AI AUTOMATION &amp;
        <br />
        VOICE AGENT
        <br />
        SPECIALIST
      </h4>
      <span className="haldoren-yr">2026</span>
      <div className="haldoren-role">AI AUTOMATION &amp; NO-CODE</div>
      <div
        className="haldoren-ph"
        style={{ backgroundImage: `url("${cutSrc}")` }}
      />
      <div className="haldoren-row">
        <span>NAME</span>
        <b>REHAN SHAIKH</b>
      </div>
      <div className="haldoren-row">
        <span>FOCUS</span>
        <b>AI AUTOMATION &amp; NO-CODE</b>
      </div>
      <div className="haldoren-row">
        <span>WHATSAPP</span>
        <b>+91 9014700399</b>
      </div>
      <div className="haldoren-row">
        <span>EMAIL</span>
        <b>rehanshaikhsalam@gmail.com</b>
      </div>
    </div>
    {isMain && (
      <div
        className="haldoren-hit"
        onPointerEnter={onHitEnter}
        aria-label="Swing lanyard badge"
      />
    )}
  </>
));

BadgeCardContent.displayName = 'BadgeCardContent';

export const LaptopDiveOpening: React.FC = () => {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCaseMounted, setIsCaseMounted] = useState(false);
  const [isMobileViewport] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 820 : false
  );
  const assets = useMemo(() => getStudioAssets(isMobileViewport), [isMobileViewport]);

  const stageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const plateRef = useRef<HTMLImageElement>(null);
  const cutRef = useRef<HTMLImageElement>(null);
  const wmRef = useRef<SVGSVGElement>(null);
  const mWmRef = useRef<SVGSVGElement>(null);
  const scriptRef = useRef<HTMLDivElement>(null);
  const mScriptRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const mBadgeRef = useRef<HTMLDivElement>(null);
  const transRef = useRef<HTMLVideoElement>(null);
  const caseplateRef = useRef<HTMLImageElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const screenWrapRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const tagRefs = useRef<(HTMLElement | null)[]>([]);

  const modeRef = useRef<'hero' | 'case'>('hero');
  const busyRef = useRef(false);
  const swayAnimRef = useRef<Animation | null>(null);
  const transReadyRef = useRef(false);
  const enteredRef = useRef(false);
  const wheelLockRef = useRef(0);
  const touchStartRef = useRef<{
    x: number;
    y: number;
    scrollTop: number;
    inScroller: boolean;
  } | null>(null);
  const timersRef = useRef<Set<number>>(new Set());

  const scheduleTimer = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timersRef.current.delete(id);
      fn();
    }, ms);
    timersRef.current.add(id);
    return id;
  }, []);

  const rmRef = useRef(
    typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  const dur = useCallback((ms: number) => (rmRef.current ? 0 : ms), []);

  const setBusy = useCallback((v: boolean) => {
    busyRef.current = v;
    document.body.classList.toggle('haldoren-busy', v);
  }, []);

  const stopSway = useCallback(() => {
    if (swayAnimRef.current) {
      swayAnimRef.current.cancel();
      swayAnimRef.current = null;
    }
  }, []);

  const startSway = useCallback(() => {
    if (rmRef.current || !badgeRef.current || window.innerWidth <= 820 || document.hidden) return;
    stopSway();
    swayAnimRef.current = badgeRef.current.animate(
      [{ transform: 'rotate(-1.1deg)' }, { transform: 'rotate(1.1deg)' }],
      {
        duration: 3200,
        iterations: Infinity,
        direction: 'alternate',
        easing: 'ease-in-out',
      }
    );
  }, [stopSway]);

  const handleBadgeHover = useCallback(() => {
    if (rmRef.current || modeRef.current !== 'hero' || busyRef.current || !badgeRef.current) {
      return;
    }
    badgeRef.current.animate(
      [
        { transform: 'rotate(0deg)' },
        { transform: 'rotate(-6deg)' },
        { transform: 'rotate(4deg)' },
        { transform: 'rotate(-2deg)' },
        { transform: 'rotate(0deg)' },
      ],
      {
        duration: 1400,
        easing: 'ease-out',
        composite: 'add',
      }
    );
  }, []);

  const computeN = useCallback(() => {
    const W = window.innerWidth;
    const H = window.innerHeight;
    return W > 820 ? Math.min(W / 1440, H / 900) : W / 430;
  }, []);

  const fitHero = useCallback((p: { x: number; y: number; s: number }) => {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const { x, y, s } = p;
    const vl = Math.max(0, -x / s);
    const vr = Math.min(1440, (W - x) / s);
    const pad = 18 / s;

    if (wmRef.current) {
      wmRef.current.style.left = vl + 0.6 * pad + 'px';
      wmRef.current.style.width = vr - vl - 1.2 * pad + 'px';
    }
    if (badgeRef.current) {
      badgeRef.current.style.left = Math.min(986, vr - pad - 417) + 'px';
      const vb = Math.min(810, (H - y) / s);
      badgeRef.current.style.top = Math.min(-165, vb - 56 / s - 935) + 'px';
    }
    if (scriptRef.current) {
      scriptRef.current.style.left = vl + pad + 70 + 'px';
    }
  }, []);

  const pose = useCallback((m: 'hero' | 'case') => {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const mobile = W <= 820;
    const u = Math.min(W / 1440, H / 900);

    if (!mobile) {
      const cover = Math.max(W / 1440, H / 810);
      if (m === 'hero') {
        const s = cover;
        const x = (W - 1440 * s) / 2;
        const y = 0;
        return { x, y, s, mobile: false };
      }
      const top = 66 * u;
      const fit = (H - top - 28 * u) / (762 - 79);
      let s: number;
      let y: number;
      if (fit >= cover) {
        s = cover;
        y = Math.min(0, Math.max(H - 810 * s, top - 79 * s));
      } else {
        s = fit;
        y = top - 79 * fit;
      }
      const x = (W - 1440 * s) / 2;
      return { x, y, s, mobile: false };
    }

    if (m === 'hero') {
      const s = Math.min(W / 650, (0.62 * H) / 810);
      const x = W / 2 - 805 * s;
      const y = H - 790 * s;
      return { x, y, s, mobile: true };
    }

    const topSpace = 96;
    const bottomSpace = 68;
    const s = Math.min((W - 20) / 905, Math.max(0.24, (H - topSpace - bottomSpace) / (762 - 95)));
    const x = W / 2 - 720 * s;
    const laptopH = (762 - 95) * s;
    const y = topSpace + Math.max(0, (H - topSpace - bottomSpace - laptopH) / 2) - 95 * s;
    return { x, y, s, mobile: true };
  }, []);

  const place = useCallback(
    (m: 'hero' | 'case') => {
      const W = window.innerWidth;
      const n = computeN();
      document.documentElement.style.setProperty('--n', n + 'px');

      const mobile = W <= 820;
      if (frameRef.current) {
        frameRef.current.classList.toggle('d-fade', !mobile);
        frameRef.current.classList.toggle('m-fade', mobile);
      }

      if (mobile) {
        const mbWidth = 0.27 * W;
        document.documentElement.style.setProperty('--mbs', (mbWidth / 582).toFixed(6));
      }

      const p = pose(m);
      if (frameRef.current) {
        frameRef.current.style.transform = `translate(${p.x}px, ${p.y}px) scale(${p.s})`;
        frameRef.current.classList.toggle('m-case', m === 'case');
      }
      if (stageRef.current) {
        stageRef.current.classList.toggle('m-case', m === 'case');
      }

      if (!mobile && m === 'hero') {
        fitHero(p);
      }
    },
    [computeN, fitHero, pose]
  );

  const openStudioContact = useCallback(() => {
    setIsContactOpen(true);
    patchResumeState({ studioContactOpen: true });
  }, []);

  const closeStudioContact = useCallback(() => {
    setIsContactOpen(false);
    patchResumeState({ studioContactOpen: false });
  }, []);

  const openExpanded = useCallback(() => {
    dispatchFlushScroll();
    markPendingScrollRestore();
    setIsExpanded(true);
    patchResumeState({ isExpanded: true });
  }, []);

  const closeExpanded = useCallback(() => {
    dispatchFlushScroll();
    markPendingScrollRestore();
    setIsExpanded(false);
    patchResumeState({ isExpanded: false });
  }, []);

  useLayoutEffect(() => {
    document.documentElement.classList.add('haldoren-mode');
    document.body.classList.add('haldoren-mode');
    document.body.classList.remove('is-case');

    modeRef.current = 'hero';
    place('hero');
    patchResumeState({ mode: 'hero', isExpanded: false, studioContactOpen: false });

    let resizeRaf = 0;
    const onResize = () => {
      if (resizeRaf) return;
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = 0;
        frameRef.current?.classList.remove('glide');
        place(modeRef.current);
      });
    };
    window.addEventListener('resize', onResize, { passive: true });

    return () => {
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      window.removeEventListener('resize', onResize);
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current.clear();
      document.documentElement.classList.remove('haldoren-mode');
      document.body.classList.remove('haldoren-mode', 'is-case', 'haldoren-busy');
    };
  }, [place]);

  // Pause lanyard sway when tab is hidden to save battery/CPU
  useEffect(() => {
    const onVisChange = () => {
      if (document.hidden) {
        stopSway();
      } else if (modeRef.current === 'hero' && !busyRef.current && enteredRef.current) {
        startSway();
      }
    };
    document.addEventListener('visibilitychange', onVisChange);
    return () => document.removeEventListener('visibilitychange', onVisChange);
  }, [startSway, stopSway]);

  // Defer transition video prefetch & PortfolioExperience chunk warmup until idle after hero renders
  useEffect(() => {
    const trans = transRef.current;
    if (!trans) return;

    let cancelled = false;
    let blobUrl: string | null = null;
    let idleTimer = 0;
    let idleHandle: number | null = null;

    const onLoaded = () => {
      transReadyRef.current = true;
      try {
        trans.currentTime = 0;
      } catch {
        // ignore seek error on initial load
      }
    };
    trans.addEventListener('loadeddata', onLoaded, { once: true });

    const startPrefetch = () => {
      if (cancelled) return;
      // Warm up PortfolioExperience JS chunk silently in background
      void import('./PortfolioExperience');

      // Respect Data Saver or very slow mobile connections for transition video
      const navConn = (
        navigator as Navigator & {
          connection?: { saveData?: boolean; effectiveType?: string };
        }
      ).connection;
      if (
        navConn?.saveData ||
        navConn?.effectiveType === '2g' ||
        navConn?.effectiveType === 'slow-2g'
      ) {
        return;
      }

      fetch(assets.trans)
        .then((res) => {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.blob();
        })
        .then((blob) => {
          if (cancelled) return;
          blobUrl = URL.createObjectURL(blob);
          trans.src = blobUrl;
        })
        .catch(() => {
          if (!cancelled) trans.src = assets.trans;
        });
    };

    const delayMs = isMobileViewport ? 1800 : 800;
    idleTimer = window.setTimeout(() => {
      const ric = (window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback;
      if (typeof ric === 'function') {
        idleHandle = ric(startPrefetch, { timeout: 2500 });
      } else {
        startPrefetch();
      }
    }, delayMs);

    return () => {
      cancelled = true;
      window.clearTimeout(idleTimer);
      const cic = (window as Window & { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback;
      if (idleHandle !== null && typeof cic === 'function') {
        cic(idleHandle);
      }
      trans.removeEventListener('loadeddata', onLoaded);
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [assets.trans, isMobileViewport]);

  useEffect(() => {
    const runEntrance = () => {
      if (enteredRef.current) return;
      enteredRef.current = true;

      const preEls = document.querySelectorAll('.haldoren-pre');
      if (modeRef.current !== 'hero' || busyRef.current) {
        preEls.forEach((el) => el.classList.remove('haldoren-pre'));
        return;
      }

      if (rmRef.current) {
        preEls.forEach((el) => {
          el.classList.remove('haldoren-pre');
          (el as HTMLElement).style.opacity = '';
        });
        if (hintRef.current) hintRef.current.style.opacity = '0.85';
        return;
      }

      requestAnimationFrame(() => {
        tagRefs.current.forEach((tag, i) => {
          if (!tag) return;
          tag.classList.remove('haldoren-pre');
          tag.animate(
            [
              { opacity: 0, transform: 'translateY(-40px) rotate(-4deg)' },
              { opacity: 1, transform: 'none' },
            ],
            {
              duration: 700,
              delay: 120 + i * 80,
              easing: 'cubic-bezier(.3,1.5,.5,1)',
              fill: 'both',
            }
          );
        });

        [wmRef.current, mWmRef.current].forEach((el) => {
          if (!el) return;
          el.classList.remove('haldoren-pre');
          el.animate(
            [
              { opacity: 0, transform: 'translateY(60px)', clipPath: 'inset(100% 0 0 0)' },
              { opacity: 1, transform: 'translateY(0)', clipPath: 'inset(0 0 0 0)' },
            ],
            {
              duration: 1100,
              delay: 260,
              easing: EASE,
              fill: 'both',
            }
          );
        });

        [scriptRef.current, mScriptRef.current].forEach((el) => {
          if (!el) return;
          el.classList.remove('haldoren-pre');
          el.animate(
            [
              { opacity: 0, clipPath: 'inset(0 100% 0 0)' },
              { opacity: 1, clipPath: 'inset(0 0 0 0)' },
            ],
            {
              duration: 900,
              delay: 1050,
              easing: 'cubic-bezier(.5,0,.3,1)',
              fill: 'both',
            }
          );
        });

        [badgeRef.current, mBadgeRef.current].forEach((el, idx) => {
          if (!el) return;
          el.classList.remove('haldoren-pre');
          const anim = el.animate(
            [
              { opacity: 0, transform: 'translateY(-120%) rotate(8deg)', offset: 0 },
              { opacity: 1, transform: 'translateY(0) rotate(-3deg)', offset: 0.6 },
              { opacity: 1, transform: 'translateY(0) rotate(1.6deg)', offset: 0.8 },
              { opacity: 1, transform: 'translateY(0) rotate(0deg)', offset: 1 },
            ],
            {
              duration: 1500,
              delay: 700,
              easing: EASE,
              fill: 'both',
            }
          );
          if (idx === 0) {
            anim.finished
              .then(() => {
                if (modeRef.current === 'hero' && !busyRef.current) startSway();
              })
              .catch(() => {});
          }
        });

        if (hintRef.current) {
          hintRef.current.classList.remove('haldoren-pre');
          hintRef.current.animate([{ opacity: 0 }, { opacity: 0.85 }], {
            duration: 600,
            delay: 1800,
            easing: EASE,
            fill: 'both',
          });
        }
      });
    };

    const plate = plateRef.current;
    const plateReady = new Promise<void>((resolve) => {
      if (!plate || plate.complete) {
        resolve();
      } else {
        plate.addEventListener('load', () => resolve(), { once: true });
        plate.addEventListener('error', () => resolve(), { once: true });
      }
    });
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
    const cap = new Promise<void>((resolve) => setTimeout(resolve, 2500));

    Promise.race([Promise.all([fontsReady, plateReady]), cap]).then(runEntrance);
    const failsafe = setTimeout(runEntrance, 4000);
    return () => clearTimeout(failsafe);
  }, [startSway]);

  const triggerFlash = useCallback((peak: number, duration: number) => {
    if (rmRef.current || !flashRef.current) return;
    flashRef.current.getAnimations().forEach((a) => a.cancel());
    flashRef.current.animate(
      [
        { opacity: 0, offset: 0 },
        { opacity: peak, offset: 0.25 },
        { opacity: 0, offset: 1 },
      ],
      { duration, easing: 'ease-out', fill: 'none' }
    );
  }, []);

  const heroOut = useCallback(() => {
    stopSway();
    const els = [
      wmRef.current,
      mWmRef.current,
      scriptRef.current,
      mScriptRef.current,
      badgeRef.current,
      mBadgeRef.current,
    ];
    els.forEach((el) => el?.getAnimations().forEach((a) => a.cancel()));
    if (rmRef.current) {
      els.forEach((el) => {
        if (el) el.style.opacity = '0';
      });
      return;
    }
    const opt: KeyframeAnimationOptions = {
      duration: 380,
      easing: 'cubic-bezier(.5,0,.75,0)',
      fill: 'both',
    };
    [wmRef.current, mWmRef.current].forEach((el) => {
      el?.animate(
        [
          { opacity: 1, transform: 'translateY(0)' },
          { opacity: 0, transform: 'translateY(-40px)' },
        ],
        opt
      );
    });
    [scriptRef.current, mScriptRef.current].forEach((el) => {
      el?.animate([{ opacity: 1 }, { opacity: 0 }], opt);
    });
    [badgeRef.current, mBadgeRef.current].forEach((el) => {
      el?.animate(
        [
          { opacity: 1, transform: 'translateY(0) rotate(0deg)' },
          { opacity: 0, transform: 'translateY(-110%) rotate(-6deg)' },
        ],
        opt
      );
    });
  }, [stopSway]);

  const heroIn = useCallback(() => {
    const els = [
      wmRef.current,
      mWmRef.current,
      scriptRef.current,
      mScriptRef.current,
      badgeRef.current,
      mBadgeRef.current,
    ];
    els.forEach((el) => el?.getAnimations().forEach((a) => a.cancel()));

    if (rmRef.current) {
      els.forEach((el) => {
        if (!el) return;
        el.style.opacity = '1';
        el.style.transform = '';
        el.style.clipPath = '';
      });
      return;
    }

    [wmRef.current, mWmRef.current].forEach((el) => {
      el?.animate(
        [
          { opacity: 0, transform: 'translateY(40px)', clipPath: 'inset(100% 0 0 0)' },
          { opacity: 1, transform: 'translateY(0)', clipPath: 'inset(0 0 0 0)' },
        ],
        { duration: 700, easing: EASE, fill: 'both' }
      );
    });

    [scriptRef.current, mScriptRef.current].forEach((el) => {
      el?.animate(
        [
          { opacity: 0, clipPath: 'inset(0 100% 0 0)' },
          { opacity: 1, clipPath: 'inset(0 0 0 0)' },
        ],
        { duration: 700, delay: 250, easing: 'cubic-bezier(.5,0,.3,1)', fill: 'both' }
      );
    });

    [badgeRef.current, mBadgeRef.current].forEach((el, idx) => {
      if (!el) return;
      const anim = el.animate(
        [
          { opacity: 0, transform: 'translateY(-110%) rotate(6deg)', offset: 0 },
          { opacity: 1, transform: 'translateY(0) rotate(-2deg)', offset: 0.7 },
          { opacity: 1, transform: 'translateY(0) rotate(0deg)', offset: 1 },
        ],
        { duration: 1100, easing: EASE, fill: 'both' }
      );
      if (idx === 0) {
        anim.finished
          .then(() => {
            if (modeRef.current === 'hero' && !busyRef.current) startSway();
          })
          .catch(() => {});
      }
    });
  }, [startSway]);

  const arriveCase = useCallback(() => {
    modeRef.current = 'case';
    document.body.classList.add('is-case');
    patchResumeState({ mode: 'case' });
    if (plateRef.current) plateRef.current.style.visibility = 'hidden';
    if (cutRef.current) cutRef.current.style.opacity = '0';

    if (screenRef.current) {
      screenRef.current.getAnimations().forEach((a) => a.cancel());
      screenRef.current.style.opacity = '1';
    }
    triggerFlash(0.28, 420);

    if (screenWrapRef.current) {
      screenWrapRef.current.getAnimations().forEach((a) => a.cancel());
      screenWrapRef.current.style.opacity = '1';
      screenWrapRef.current.style.transform = 'scale(1)';
      if (!rmRef.current) {
        const anim = screenWrapRef.current.animate(
          [
            { opacity: 0, transform: 'scale(1.04)' },
            { opacity: 1, transform: 'scale(1)' },
          ],
          { duration: 550, easing: EASE, fill: 'none' }
        );
        anim.finished.catch(() => {});
      }
    }

    scheduleTimer(() => {
      frameRef.current?.classList.remove('glide');
      setBusy(false);
    }, dur(560));
  }, [dur, scheduleTimer, setBusy, triggerFlash]);

  const playTransitionClip = useCallback(() => {
    return new Promise<void>((resolve) => {
      const trans = transRef.current;
      if (!trans) {
        resolve();
        return;
      }
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        resolve();
      };

      trans.playbackRate = 1.8;
      const playPromise = trans.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => finish());
      }

      const tick = () => {
        if (done) return;
        const d = trans.duration || 5.04;
        const p = trans.currentTime / d;
        if (trans.ended || p >= 0.995) {
          finish();
          return;
        }
        trans.playbackRate = Math.max(
          1.2,
          1.8 + 2.4 * Math.sin(Math.PI * Math.min(p * 1.08, 1))
        );
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      setTimeout(finish, 3400);
    });
  }, []);

  const toCase = useCallback(() => {
    if (busyRef.current || modeRef.current !== 'hero') return;
    setBusy(true);
    setIsCaseMounted(true);
    heroOut();

    // Ensure caseplate image is decoded before the transition video finishes
    const caseplatePreload = caseplateRef.current;
    const caseplateDecoded =
      caseplatePreload && typeof caseplatePreload.decode === 'function'
        ? caseplatePreload.decode().catch(() => {})
        : Promise.resolve();

    scheduleTimer(() => {
      const trans = transRef.current;
      const caseplate = caseplateRef.current;
      const plate = plateRef.current;
      const cut = cutRef.current;

      if (rmRef.current || !transReadyRef.current || !trans) {
        place('case');
        if (rmRef.current) {
          if (caseplate) caseplate.style.opacity = '1';
          arriveCase();
        } else if (caseplate) {
          caseplateDecoded.then(() => {
            caseplate.getAnimations().forEach((a) => a.cancel());
            caseplate.style.opacity = '1';
            caseplate
              .animate([{ opacity: 0 }, { opacity: 1 }], {
                duration: 450,
                easing: EASE,
                fill: 'none',
              })
              .finished.then(arriveCase)
              .catch(arriveCase);
          });
        } else {
          arriveCase();
        }
        return;
      }

      if (plate) plate.getAnimations().forEach((a) => a.cancel());
      if (cut) cut.getAnimations().forEach((a) => a.cancel());
      if (caseplate) caseplate.getAnimations().forEach((a) => a.cancel());

      try {
        trans.currentTime = 0;
      } catch {
        // ignore seek error
      }

      const clipPromise = playTransitionClip();

      const revealVideoLayer = () => {
        if (modeRef.current !== 'hero') return;
        trans.style.opacity = '1';
        if (cut) cut.style.opacity = '0';
        if (plate) plate.style.visibility = 'hidden';
      };

      const vWithCb = trans as HTMLVideoElement & {
        requestVideoFrameCallback?: (cb: () => void) => number;
      };
      if (typeof vWithCb.requestVideoFrameCallback === 'function') {
        vWithCb.requestVideoFrameCallback(() => revealVideoLayer());
      } else {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => revealVideoLayer());
        });
      }

      document.documentElement.style.setProperty('--glide', '1.6s');
      frameRef.current?.classList.add('glide');
      place('case');

      Promise.all([clipPromise, caseplateDecoded]).then(() => {
        if (modeRef.current !== 'hero') return;
        trans.pause();
        if (caseplate) {
          caseplate.getAnimations().forEach((a) => a.cancel());
          caseplate.style.opacity = '1';
        }
        trans.style.opacity = '0';
        arriveCase();
      });
    }, dur(330));
  }, [arriveCase, dur, heroOut, place, playTransitionClip, scheduleTimer, setBusy]);

  const toHero = useCallback(() => {
    if (busyRef.current || modeRef.current !== 'case') return;
    setBusy(true);
    dispatchFlushScroll();
    setIsExpanded(false);
    patchResumeState({ mode: 'hero', isExpanded: false });

    const plate = plateRef.current;
    const cut = cutRef.current;
    const caseplate = caseplateRef.current;
    const trans = transRef.current;

    if (trans) {
      trans.pause();
      trans.style.opacity = '0';
      try {
        trans.currentTime = 0;
      } catch {
        // ignore reset seek error
      }
    }

    if (screenRef.current) {
      screenRef.current.getAnimations().forEach((a) => a.cancel());
      if (!rmRef.current) {
        screenRef.current.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: 300,
          easing: EASE,
          fill: 'both',
        });
      } else {
        screenRef.current.style.opacity = '0';
      }
    }

    modeRef.current = 'hero';
    document.body.classList.remove('is-case');
    document.documentElement.style.setProperty('--glide', '0.9s');
    frameRef.current?.classList.add('glide');
    place('hero');

    if (plate) {
      plate.getAnimations().forEach((a) => a.cancel());
      plate.style.visibility = 'visible';
      plate.style.opacity = '1';
    }
    if (cut) {
      cut.getAnimations().forEach((a) => a.cancel());
      cut.style.visibility = 'visible';
      cut.style.opacity = '1';
    }
    if (caseplate) {
      caseplate.getAnimations().forEach((a) => a.cancel());
    }

    if (rmRef.current) {
      if (caseplate) caseplate.style.opacity = '0';
      if (plate) {
        plate.style.filter = '';
        plate.style.transform = '';
      }
      if (cut) {
        cut.style.filter = '';
        cut.style.transform = '';
      }
      heroIn();
      frameRef.current?.classList.remove('glide');
      setBusy(false);
      return;
    }

    const isMobileNow = window.innerWidth <= 820;

    caseplate?.animate(
      isMobileNow
        ? [{ opacity: 1 }, { opacity: 0 }]
        : [
            { opacity: 1, filter: 'blur(0px)' },
            { opacity: 0, filter: 'blur(12px)' },
          ],
      { duration: isMobileNow ? 550 : 800, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'both' }
    );

    const zoomOutKeyframes = isMobileNow
      ? [{ transform: 'scale(1.08)' }, { transform: 'scale(1)' }]
      : [
          { transform: 'scale(1.12)', filter: 'blur(8px)' },
          { transform: 'scale(1)', filter: 'blur(0px)' },
        ];
    const zoomOutOptions: KeyframeAnimationOptions = {
      duration: isMobileNow ? 650 : 900,
      easing: EASE,
      fill: 'both',
    };

    plate?.animate(zoomOutKeyframes, zoomOutOptions);
    cut?.animate(zoomOutKeyframes, zoomOutOptions);

    scheduleTimer(heroIn, isMobileNow ? 180 : 250);

    scheduleTimer(() => {
      if (modeRef.current === 'hero') {
        setIsCaseMounted(false);
      }
      caseplate?.getAnimations().forEach((a) => a.cancel());
      if (caseplate) {
        caseplate.style.opacity = '0';
        caseplate.style.filter = '';
      }
      plate?.getAnimations().forEach((a) => a.cancel());
      cut?.getAnimations().forEach((a) => a.cancel());
      if (plate) {
        plate.style.transform = '';
        plate.style.filter = '';
      }
      if (cut) {
        cut.style.transform = '';
        cut.style.filter = '';
      }
      frameRef.current?.classList.remove('glide');
      setBusy(false);
    }, isMobileNow ? 720 : 1000);
  }, [heroIn, place, scheduleTimer, setBusy]);

  useEffect(() => {
    const getScreenScroller = (target: EventTarget | null) => {
      if (!(target instanceof Node) || !screenRef.current?.contains(target)) {
        return null;
      }
      return screenRef.current.querySelector<HTMLElement>('[data-portfolio-scroll="true"]');
    };

    const onWheel = (e: WheelEvent) => {
      if (isContactOpen || isExpanded) return;
      if (modeRef.current === 'case') {
        const scroller = getScreenScroller(e.target);
        if (scroller) {
          if (e.deltaY > 0 || scroller.scrollTop > 2) {
            return;
          }
        }
      }
      e.preventDefault();
      const now = performance.now();
      if (busyRef.current || now < wheelLockRef.current) return;
      if (Math.abs(e.deltaY) < 18) return;
      wheelLockRef.current = now + 900;

      if (modeRef.current === 'hero' && e.deltaY > 0) {
        toCase();
      } else if (modeRef.current === 'case' && e.deltaY < 0) {
        toHero();
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      if (isContactOpen || isExpanded || e.touches.length !== 1) return;
      const scroller = getScreenScroller(e.target);
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        scrollTop: scroller ? scroller.scrollTop : 0,
        inScroller: Boolean(scroller),
      };
    };

    const onTouchMove = (e: TouchEvent) => {
      if (isContactOpen || isExpanded) return;
      if (modeRef.current === 'hero') e.preventDefault();
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current || busyRef.current || isContactOpen || isExpanded) {
        touchStartRef.current = null;
        return;
      }
      const start = touchStartRef.current;
      const t = e.changedTouches[0];
      const dy = t.clientY - start.y;
      touchStartRef.current = null;
      if (Math.abs(dy) < 40) return;

      if (modeRef.current === 'case') {
        const scroller = getScreenScroller(e.target);
        if (start.inScroller || scroller) {
          // Only allow pull-to-exit if the gesture STARTED at the very top and was an intentional pull
          if (start.scrollTop > 2 || (scroller && scroller.scrollTop > 2) || dy < 85) {
            return;
          }
        }
      }

      if (modeRef.current === 'hero' && dy <= -40) {
        toCase();
      } else if (modeRef.current === 'case' && dy >= 40) {
        toHero();
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (isContactOpen) return;
      if (e.key === 'Escape' && isExpanded) {
        closeExpanded();
        return;
      }
      if (modeRef.current === 'hero') {
        if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
          e.preventDefault();
          toCase();
        }
      } else if (modeRef.current === 'case' && !isExpanded) {
        if (e.key === 'Escape') {
          toHero();
        }
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [closeExpanded, isContactOpen, isExpanded, toCase, toHero]);

  return (
    <>
      <div className="haldoren-stage" ref={stageRef}>
        <div className="haldoren-frame d-fade" ref={frameRef}>
          <img
            className="haldoren-plate"
            ref={plateRef}
            src={assets.plate}
            alt=""
            decoding="async"
            fetchPriority="high"
          />

          <svg
            className="haldoren-wm haldoren-pre"
            ref={wmRef}
            viewBox="0 0 1440 260"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="wmGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="0.5" stopColor="#f1f5f3" stopOpacity="0.9" />
                <stop offset="1" stopColor="#d7e6de" stopOpacity="0.28" />
              </linearGradient>
            </defs>
            <text
              x="14"
              y="214"
              textLength="1412"
              lengthAdjust="spacingAndGlyphs"
              fill="url(#wmGrad)"
            >
              REHAN SHAIKH
            </text>
          </svg>

          <img
            className="haldoren-cut"
            ref={cutRef}
            src={assets.cut}
            alt="Rehan Shaikh portrait"
            decoding="async"
            fetchPriority="high"
          />

          <div className="haldoren-badge haldoren-pre" ref={badgeRef}>
            <BadgeCardContent
              badgeSrc={assets.badge}
              cutSrc={assets.cut}
              isMain
              onHitEnter={handleBadgeHover}
            />
          </div>

          <div className="haldoren-script haldoren-pre" ref={scriptRef} aria-hidden="true">
            AI Automation &amp; No-Code
          </div>

          <video
            className="haldoren-trans"
            ref={transRef}
            muted
            playsInline
            preload="none"
            crossOrigin="anonymous"
          />

          <img
            className="haldoren-caseplate"
            ref={caseplateRef}
            src={assets.casePlate}
            alt=""
            decoding="async"
          />

          <div className="haldoren-screen" ref={screenRef}>
            <div className="haldoren-screen-iframe-wrap" ref={screenWrapRef}>
              <div className="haldoren-screen-iframe">
                {isCaseMounted && !isExpanded && (
                  <Suspense fallback={<div className="w-full h-full bg-[#0C0C0C]" />}>
                    <PortfolioExperience embedded bezel />
                  </Suspense>
                )}
              </div>
            </div>
            <div className="haldoren-flash" ref={flashRef} />
          </div>
        </div>
      </div>

      {/* Viewport-pinned Haldoren UI */}
      <div className="haldoren-ui">
        <div className="haldoren-m-only">
          <svg
            className="haldoren-m-wm haldoren-pre"
            ref={mWmRef}
            viewBox="0 0 1440 240"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="mWmGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="0.5" stopColor="#f1f5f3" stopOpacity="0.9" />
                <stop offset="1" stopColor="#d7e6de" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            <text
              x="10"
              y="210"
              textLength="1420"
              lengthAdjust="spacingAndGlyphs"
              fill="url(#mWmGrad)"
            >
              REHAN SHAIKH
            </text>
          </svg>
          <div className="haldoren-m-script haldoren-pre" ref={mScriptRef} aria-hidden="true">
            AI Automation &amp; No-Code
          </div>
          <div className="haldoren-m-badge haldoren-pre" ref={mBadgeRef}>
            <div className="haldoren-badge">
              <BadgeCardContent badgeSrc={assets.badge} cutSrc={assets.cut} />
            </div>
          </div>
        </div>

        <button
          type="button"
          className="haldoren-tag haldoren-t1 haldoren-pre"
          ref={(el) => {
            tagRefs.current[0] = el;
          }}
          onClick={toHero}
        >
          my studio
        </button>
        <button
          type="button"
          className="haldoren-tag haldoren-t2 haldoren-pre"
          ref={(el) => {
            tagRefs.current[1] = el;
          }}
          onClick={toCase}
        >
          portfolio
        </button>
        <a
          href="#contacts"
          className="haldoren-tag haldoren-t3 haldoren-pre"
          ref={(el) => {
            tagRefs.current[2] = el;
          }}
          onClick={(e) => {
            e.preventDefault();
            openStudioContact();
          }}
        >
          contacts
        </a>
        <a
          href="#discuss"
          className="haldoren-tag haldoren-t4 haldoren-pre"
          ref={(el) => {
            tagRefs.current[3] = el;
          }}
          onClick={(e) => {
            e.preventDefault();
            openStudioContact();
          }}
        >
          discuss a project
        </a>

        <button type="button" className="haldoren-logo" onClick={toHero}>
          REHAN SHAIKH
        </button>

        <div className="haldoren-hint haldoren-pre" ref={hintRef}>
          <span className="haldoren-line" aria-hidden="true" />
          <span>scroll into the work</span>
        </div>
      </div>

      <button
        type="button"
        className="haldoren-expand-btn"
        onClick={openExpanded}
        aria-label="Expand portfolio fullscreen"
      >
        <Maximize2 className="w-3.5 h-3.5" />
        <span>Expand Screen</span>
      </button>

      {isExpanded && (
        <div className="haldoren-expanded-overlay">
          <div className="haldoren-expanded-bar">
            <button type="button" onClick={toHero}>
              ← Back to Studio
            </button>
            <button
              type="button"
              onClick={closeExpanded}
              className="inline-flex items-center gap-1.5"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Laptop View</span>
            </button>
          </div>
          <div className="haldoren-expanded-iframe">
            <Suspense fallback={<div className="w-full h-full bg-[#0C0C0C]" />}>
              <PortfolioExperience embedded />
            </Suspense>
          </div>
        </div>
      )}

      {isContactOpen && (
        <Suspense fallback={null}>
          <ContactModal isOpen={isContactOpen} onClose={closeStudioContact} />
        </Suspense>
      )}
    </>
  );
};

export default LaptopDiveOpening;
