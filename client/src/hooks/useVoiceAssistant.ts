import { useState, useEffect, useRef, useCallback } from 'react';
import {
  speechService,
  SupportedLanguageCode,
  TtsProviderChoice,
  ActiveTtsProvider,
} from '../services/speechService';
import { ChatMessage } from '../types';
import { api } from '../services/api';

export type VoiceAssistantState =
  | 'ready'
  | 'listening'
  | 'understanding'
  | 'preparing'
  | 'speaking'
  | 'interrupted'
  | 'error';

export interface UseVoiceAssistantOptions {
  language: SupportedLanguageCode;
  initialGender?: 'female' | 'male';
  initialProvider?: TtsProviderChoice;
  onLanguageChange?: (lang: SupportedLanguageCode) => void;
  conversationId?: string;
  onConversationIdChange?: (id: string) => void;
  onNewMessage?: (msg: ChatMessage) => void;
}

// Helper: Detect whether the recognized speech is an echo of the assistant's own voice
function isEchoOfAssistant(recognized: string, assistantReply: string, spokenSummary: string): boolean {
  if (!recognized) return false;
  const clean = (s: string) =>
    (s || '')
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  const r = clean(recognized);
  const a = clean(assistantReply);
  const s = clean(spokenSummary);
  if (!r || r.length < 3) return false;

  // Direct containment
  if ((a && a.includes(r)) || (s && s.includes(r))) {
    return true;
  }

  // Word overlap check (>60% of recognized words are contained in the assistant's speech)
  const words = r.split(' ').filter((w) => w.length > 2);
  if (words.length >= 2) {
    const inA = words.filter((w) => a.includes(w)).length;
    const inS = words.filter((w) => s.includes(w)).length;
    if (inA / words.length >= 0.6 || inS / words.length >= 0.6) {
      return true;
    }
  }
  return false;
}

export function useVoiceAssistant({
  language,
  initialGender = 'female',
  initialProvider = 'auto',
  onLanguageChange,
  conversationId,
  onConversationIdChange,
  onNewMessage,
}: UseVoiceAssistantOptions) {
  const [state, setState] = useState<VoiceAssistantState>('ready');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [lastFarmerWords, setLastFarmerWords] = useState('');
  const [lastAssistantWords, setLastAssistantWords] = useState('');
  const [lastSpokenSummary, setLastSpokenSummary] = useState('');
  const [lastAssistantMessage, setLastAssistantMessage] = useState<ChatMessage | null>(null);
  const [autoListen, setAutoListen] = useState(false);
  const [voiceGender, setVoiceGender] = useState<'female' | 'male'>(initialGender);
  const [providerChoice, setProviderChoice] = useState<TtsProviderChoice>(initialProvider);
  const [ttsProvider, setTtsProvider] = useState<ActiveTtsProvider | null>(null);
  const [voiceName, setVoiceName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPermissionDenied, setIsPermissionDenied] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  // References to avoid stale closures
  const lastAssistantWordsRef = useRef('');
  const lastSpokenSummaryRef = useRef('');

  // Keep ref to conversationId to avoid stale closures in callbacks
  const convIdRef = useRef(conversationId);
  useEffect(() => {
    convIdRef.current = conversationId;
  }, [conversationId]);

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const updateState = useCallback((next: VoiceAssistantState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  const autoListenRef = useRef(autoListen);
  useEffect(() => {
    autoListenRef.current = autoListen;
  }, [autoListen]);

  const languageRef = useRef(language);
  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  const voiceGenderRef = useRef(voiceGender);
  useEffect(() => {
    voiceGenderRef.current = voiceGender;
    speechService.setGender(voiceGender);
  }, [voiceGender]);

  const providerChoiceRef = useRef(providerChoice);
  useEffect(() => {
    providerChoiceRef.current = providerChoice;
    speechService.setProvider(providerChoice);
  }, [providerChoice]);

  // Clean up audio & recognition on unmount
  useEffect(() => {
    return () => {
      speechService.stopRecognition();
      speechService.stopSpeaking();
    };
  }, []);

  // Stop listening/canceling
  const cancelListening = useCallback(() => {
    speechService.stopRecognition();
    setInterimTranscript('');
    updateState('ready');
  }, [updateState]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    speechService.stopSpeaking();
    updateState('ready');
  }, [updateState]);

  // Submit recognized query to existing backend
  const submitQuery = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) {
        updateState('ready');
        return;
      }

      // Stop any ongoing speech cleanly
      speechService.stopSpeaking();

      const tSubmit = performance.now();
      console.log(`[Voice Perf] Submitting query: "${trimmed}"`);

      updateState('preparing');
      setErrorMessage(null);

      // Create optimistic user message
      const userMsg: ChatMessage = {
        id: `voice-user-${Date.now()}`,
        role: 'user',
        content: trimmed,
        language: languageRef.current,
        createdAt: new Date().toISOString(),
      };
      onNewMessage?.(userMsg);

      try {
        let streamAssistantWords = '';
        const res = await api.chat.sendMessage(trimmed, languageRef.current, convIdRef.current, {
          onChunk: (chunk: string) => {
            streamAssistantWords += chunk;
            setLastAssistantWords(streamAssistantWords);
            lastAssistantWordsRef.current = streamAssistantWords;
          },
        });
        const tChat = performance.now();
        console.log(`[Voice Perf] Chat API responded in ${Math.round(tChat - tSubmit)}ms`);

        if (res.conversationId && !convIdRef.current) {
          onConversationIdChange?.(res.conversationId);
        }

        const assistantMsg = res.message;
        onNewMessage?.(assistantMsg);

        const spokenText = assistantMsg.speechContent || assistantMsg.content;
        setLastSpokenSummary(spokenText);
        setLastAssistantWords(assistantMsg.content);
        setLastAssistantMessage(assistantMsg);

        lastAssistantWordsRef.current = assistantMsg.content;
        lastSpokenSummaryRef.current = spokenText;

        // Language synchronization
        let activeLang = languageRef.current;
        if (assistantMsg.language && assistantMsg.language !== languageRef.current) {
          activeLang = assistantMsg.language as SupportedLanguageCode;
          onLanguageChange?.(activeLang);
        }

        // Start speaking the natural spoken version
        updateState('speaking');
        speechService.speakNatural(spokenText, activeLang, {
          gender: voiceGenderRef.current,
          provider: providerChoiceRef.current,
          onStart: () => {
            const tPlayback = performance.now();
            console.log(
              `[Voice Perf] Total turnaround to audio start: ${Math.round(tPlayback - tSubmit)}ms (Chat: ${Math.round(
                tChat - tSubmit
              )}ms, TTS/Audio Start: ${Math.round(tPlayback - tChat)}ms)`
            );
            updateState('speaking');
          },
          onProviderSelected: (provider, vName) => {
            setTtsProvider(provider);
            if (provider === 'gemini-tts') {
              setVoiceName(vName || (voiceGenderRef.current === 'male' ? 'Charon (Male)' : 'Aoede (Female)'));
              setVoiceNotice(null);
            } else if (provider === 'edge-neural') {
              setVoiceName(vName || `${activeLang.toUpperCase()} Regional Neural`);
              setVoiceNotice(null);
            } else {
              const matchedVoice = speechService.findBestVoice(activeLang);
              setVoiceName(vName || matchedVoice?.name || 'Device Default');
              if (!matchedVoice && activeLang !== 'en') {
                setVoiceNotice(
                  `Using browser voice fallback. ${activeLang.toUpperCase()} regional pack is not installed on this OS.`
                );
              } else {
                setVoiceNotice(null);
              }
            }
          },
          onEnd: () => {
            // Check if user enabled continuous conversation
            if (autoListenRef.current) {
              // Wait 800 ms after speech ends before restarting mic to prevent picking up audio tail/echo
              setTimeout(() => {
                startListening();
              }, 800);
            } else {
              updateState('ready');
            }
          },
          onInterrupted: () => {
            // Already handled
          },
          onError: () => {
            updateState('ready');
          },
        });
      } catch (err: any) {
        console.error('[Voice Assistant error]', err);
        setErrorMessage(err.message || 'Could not get answer. Please tap microphone to try again.');
        updateState('error');
      }
    },
    [onNewMessage, onConversationIdChange, onLanguageChange, updateState]
  );

  // Start listening session with turn-taking and interruption support
  const startListening = useCallback(() => {
    // Cleanly cancel previous speech first
    speechService.stopSpeaking();

    // If currently speaking, handle interruption with brief transition
    if (stateRef.current === 'speaking') {
      updateState('interrupted');
      setTimeout(() => {
        executeListening();
      }, 150);
      return;
    }

    executeListening();

    function executeListening() {
      setErrorMessage(null);
      setIsPermissionDenied(false);
      setInterimTranscript('');
      updateState('listening');

      let hadError = false;
      let hadFinal = false;

      const ok = speechService.startRecognition(languageRef.current, {
        onStart: () => {
          updateState('listening');
        },
        onInterimResult: (interim) => {
          setInterimTranscript(interim);
        },
        onFinalResult: (final) => {
          // Check if recognized words are an echo of the assistant's previous reply
          if (isEchoOfAssistant(final, lastAssistantWordsRef.current, lastSpokenSummaryRef.current)) {
            console.log('[Voice Perf] Ignored microphone echo of assistant speech:', final);
            hadFinal = true;
            setInterimTranscript('');
            if (autoListenRef.current) {
              setTimeout(() => {
                executeListening();
              }, 800);
            } else {
              updateState('ready');
            }
            return;
          }

          hadFinal = true;
          setInterimTranscript(final);
          setLastFarmerWords(final);
          updateState('understanding');
          // Immediate submission without artificial 350ms delay
          submitQuery(final);
        },
        onError: (err) => {
          hadError = true;
          setErrorMessage(err.message);
          setIsPermissionDenied(err.isPermissionDenied);
          updateState('error');
        },
        onEnd: () => {
          if (!hadError && !hadFinal && stateRef.current === 'listening') {
            updateState('ready');
          }
        },
      });

      if (!ok) {
        hadError = true;
        updateState('error');
      }
    }
  }, [submitQuery, updateState]);

  // Repeat previous response aloud
  const repeatResponse = useCallback(() => {
    const textToRepeat = lastSpokenSummary || lastAssistantWords;
    if (!textToRepeat) return;

    // Cleanly cancel any previous speech before starting repeat
    speechService.stopSpeaking();

    updateState('speaking');
    speechService.speakNatural(textToRepeat, languageRef.current, {
      gender: voiceGenderRef.current,
      provider: providerChoiceRef.current,
      onStart: () => {
        updateState('speaking');
      },
      onProviderSelected: (provider, vName) => {
        setTtsProvider(provider);
        if (provider === 'gemini-tts') {
          setVoiceName(vName || (voiceGenderRef.current === 'male' ? 'Charon (Male)' : 'Aoede (Female)'));
        } else if (provider === 'edge-neural') {
          setVoiceName(vName || `${languageRef.current.toUpperCase()} Regional Neural`);
        } else {
          const matchedVoice = speechService.findBestVoice(languageRef.current);
          setVoiceName(vName || matchedVoice?.name || 'Device Default');
        }
      },
      onEnd: () => {
        updateState('ready');
      },
      onError: () => {
        updateState('ready');
      },
      onInterrupted: () => {
        // Handled
      },
    });
  }, [lastSpokenSummary, lastAssistantWords, updateState]);

  return {
    state,
    interimTranscript,
    lastFarmerWords,
    lastAssistantWords,
    lastSpokenSummary,
    lastAssistantMessage,
    autoListen,
    setAutoListen,
    voiceGender,
    setVoiceGender,
    providerChoice,
    setProviderChoice,
    ttsProvider,
    voiceName,
    errorMessage,
    isPermissionDenied,
    voiceNotice,
    startListening,
    cancelListening,
    stopSpeaking,
    repeatResponse,
    submitQuery,
  };
}
