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

  // Keep ref to conversationId to avoid stale closures in callbacks
  const convIdRef = useRef(conversationId);
  useEffect(() => {
    convIdRef.current = conversationId;
  }, [conversationId]);

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

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
    setState('ready');
  }, []);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    speechService.stopSpeaking();
    setState('ready');
  }, []);

  // Submit recognized query to existing backend
  const submitQuery = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) {
        setState('ready');
        return;
      }

      setState('preparing');
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
        const res = await api.chat.sendMessage(trimmed, languageRef.current, convIdRef.current);

        if (res.conversationId && !convIdRef.current) {
          onConversationIdChange?.(res.conversationId);
        }

        const assistantMsg = res.message;
        onNewMessage?.(assistantMsg);

        const spokenText = assistantMsg.speechContent || assistantMsg.content;
        setLastSpokenSummary(spokenText);
        setLastAssistantWords(assistantMsg.content);
        setLastAssistantMessage(assistantMsg);

        // Language synchronization
        let activeLang = languageRef.current;
        if (assistantMsg.language && assistantMsg.language !== languageRef.current) {
          activeLang = assistantMsg.language as SupportedLanguageCode;
          onLanguageChange?.(activeLang);
        }

        // Start speaking the natural spoken version
        setState('speaking');
        speechService.speakNatural(spokenText, activeLang, {
          gender: voiceGenderRef.current,
          provider: providerChoiceRef.current,
          onStart: () => {
            setState('speaking');
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
              setTimeout(() => {
                startListening();
              }, 400);
            } else {
              setState('ready');
            }
          },
          onInterrupted: () => {
            // Already handled
          },
          onError: () => {
            setState('ready');
          },
        });
      } catch (err: any) {
        console.error('[Voice Assistant error]', err);
        setErrorMessage(err.message || 'Could not get answer. Please tap microphone to try again.');
        setState('error');
      }
    },
    [onNewMessage, onConversationIdChange, onLanguageChange]
  );

  // Start listening session with turn-taking and interruption support
  const startListening = useCallback(() => {
    // 1. If currently speaking, handle interruption
    if (stateRef.current === 'speaking') {
      setState('interrupted');
      speechService.stopSpeaking();
      // Brief pause for natural audio transition
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
      setState('listening');

      const ok = speechService.startRecognition(languageRef.current, {
        onStart: () => {
          setState('listening');
        },
        onInterimResult: (interim) => {
          setInterimTranscript(interim);
        },
        onFinalResult: (final) => {
          setInterimTranscript(final);
          setLastFarmerWords(final);
          setState('understanding');
          // Short delay to let user see recognized text before auto-submitting
          setTimeout(() => {
            submitQuery(final);
          }, 350);
        },
        onError: (err) => {
          setErrorMessage(err.message);
          setIsPermissionDenied(err.isPermissionDenied);
          setState('error');
        },
        onEnd: () => {
          if (stateRef.current === 'listening') {
            setState('ready');
          }
        },
      });

      if (!ok) {
        setState('error');
      }
    }
  }, [submitQuery]);

  // Repeat previous response aloud
  const repeatResponse = useCallback(() => {
    const textToRepeat = lastSpokenSummary || lastAssistantWords;
    if (!textToRepeat) return;
    setState('speaking');
    speechService.speakNatural(textToRepeat, languageRef.current, {
      gender: voiceGenderRef.current,
      provider: providerChoiceRef.current,
      onStart: () => {
        setState('speaking');
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
        setState('ready');
      },
      onError: () => {
        setState('ready');
      },
      onInterrupted: () => {
        // Handled
      },
    });
  }, [lastSpokenSummary, lastAssistantWords]);

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
