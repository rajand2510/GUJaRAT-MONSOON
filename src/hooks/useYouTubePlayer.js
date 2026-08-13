'use client';
import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Singleton promise for loading the YouTube IFrame API script.
 * Ensures it's only loaded once even if multiple components use this hook.
 */
let ytAPILoadPromise = null;

function ensureYouTubeAPI() {
  if (ytAPILoadPromise) return ytAPILoadPromise;

  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Not in browser'));
  }

  // Already loaded
  if (window.YT?.Player) {
    ytAPILoadPromise = Promise.resolve(window.YT);
    return ytAPILoadPromise;
  }

  ytAPILoadPromise = new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve(window.YT);
    };

    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(script);
  });

  return ytAPILoadPromise;
}

/**
 * useYouTubePlayer – React hook for controlling a hidden YouTube player.
 *
 * @param {Object}   opts
 * @param {Function} opts.onEnded  – called when the current video finishes
 *
 * @returns {{ containerRef, isReady, duration, currentTime, loadAndPlay, cueVideo, play, pause, seekTo }}
 */
export function useYouTubePlayer({ onEnded } = {}) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const onEndedRef = useRef(onEnded);
  const [isReady, setIsReady] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const pollRef = useRef(null);

  // Keep callback ref fresh without re-creating the player
  onEndedRef.current = onEnded;

  // ── Initialise YouTube player ──────────────────────────────────────
  useEffect(() => {
    let destroyed = false;

    ensureYouTubeAPI().then((YT) => {
      if (destroyed || !containerRef.current) return;

      const player = new YT.Player(containerRef.current, {
        width: '1',
        height: '1',
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,   // hide annotations
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: () => {
            if (!destroyed) {
              playerRef.current = player;
              setIsReady(true);
            }
          },
          onStateChange: (e) => {
            if (e.data === YT.PlayerState.ENDED) {
              onEndedRef.current?.();
            }
          },
          onError: (e) => {
            console.error('YouTube Player Error:', e.data);
          },
        },
      });
    });

    return () => {
      destroyed = true;
      if (pollRef.current) clearInterval(pollRef.current);
      try { playerRef.current?.destroy?.(); } catch (_) { /* */ }
      playerRef.current = null;
      setIsReady(false);
    };
  }, []);

  // ── Poll current time & duration ───────────────────────────────────
  useEffect(() => {
    if (!isReady) return;

    pollRef.current = setInterval(() => {
      const p = playerRef.current;
      if (!p) return;

      try {
        const t = p.getCurrentTime?.();
        if (typeof t === 'number') setCurrentTime(t);

        const d = p.getDuration?.();
        if (typeof d === 'number' && d > 0) setDuration(d);
      } catch (_) { /* player might be destroyed */ }
    }, 250);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [isReady]);

  // ── Controls ───────────────────────────────────────────────────────

  /** Load a video and start playing immediately */
  const loadAndPlay = useCallback((videoId, startSeconds = 0) => {
    playerRef.current?.loadVideoById?.({ videoId, startSeconds });
  }, []);

  /** Load a video but don't play it (cue only) */
  const cueVideo = useCallback((videoId, startSeconds = 0) => {
    playerRef.current?.cueVideoById?.({ videoId, startSeconds });
    setCurrentTime(startSeconds);
    setDuration(0);
  }, []);

  /** Resume playback */
  const play = useCallback(() => {
    playerRef.current?.playVideo?.();
  }, []);

  /** Pause playback */
  const pause = useCallback(() => {
    playerRef.current?.pauseVideo?.();
  }, []);

  /** Seek to a position (seconds) */
  const seekTo = useCallback((seconds) => {
    playerRef.current?.seekTo?.(seconds, true);
    setCurrentTime(seconds);
  }, []);

  return {
    containerRef,
    isReady,
    duration,
    currentTime,
    loadAndPlay,
    cueVideo,
    play,
    pause,
    seekTo,
  };
}
