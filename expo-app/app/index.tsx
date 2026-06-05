import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LoadingScreen from '../components/LoadingScreen';
import { fetchWordByDate, fetchPostsByWordId, createPost, Word, Post } from '../lib/api';
import {
  localDateKey,
  formatHeaderDate,
  displayWord,
  hasKorean,
  formatCommentTime,
  isWeekend,
} from '../lib/utils';

const MAX_COMMENT_LENGTH = 80;

type SwipeDir = 'left' | 'right';

export default function HomeScreen() {
  const [date, setDate] = useState('');
  const [word, setWord] = useState<Word | null>(null);
  const [loading, setLoading] = useState(true);
  const [noContent, setNoContent] = useState(false);
  const [error, setError] = useState(false);

  const [exampleIndex, setExampleIndex] = useState(0);
  const [swipeDir, setSwipeDir] = useState<SwipeDir>('left');
  const slideAnim = useRef(new Animated.Value(0)).current;

  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);

  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  const loadWord = useCallback(async (publishDate: string) => {
    setLoading(true);
    setNoContent(false);
    setError(false);
    setWord(null);
    try {
      const w = await fetchWordByDate(publishDate);
      if (!w) {
        setNoContent(true);
      } else {
        setWord(w);
        loadPosts(w.id);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPosts = async (wordId: string) => {
    setPostsLoading(true);
    try {
      const p = await fetchPostsByWordId(wordId);
      setPosts(p.slice().sort((a, b) => a.created_at.localeCompare(b.created_at)));
    } catch {
      // non-critical
    } finally {
      setPostsLoading(false);
    }
  };

  useEffect(() => {
    const d = localDateKey();
    setDate(d);
    loadWord(d);
  }, []);

  // Example carousel animation
  const animateToExample = (nextIndex: number, dir: SwipeDir) => {
    if (!word || nextIndex < 0 || nextIndex >= word.examples.length) return;
    setSwipeDir(dir);
    const fromX = dir === 'left' ? 60 : -60;
    slideAnim.setValue(fromX);
    setExampleIndex(nextIndex);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 120,
      friction: 12,
    }).start();
  };

  // Stable refs so PanResponder closures always see current values
  const wordRef = useRef<Word | null>(null);
  const exampleIndexRef = useRef(0);
  useEffect(() => { wordRef.current = word; }, [word]);
  useEffect(() => { exampleIndexRef.current = exampleIndex; }, [exampleIndex]);

  const animateToExampleRef = useRef(animateToExample);
  useEffect(() => { animateToExampleRef.current = animateToExample; });

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 10,
      onPanResponderRelease: (_, gs) => {
        const w = wordRef.current;
        const idx = exampleIndexRef.current;
        if (gs.dx < -40) {
          const next = idx + 1;
          if (w && next < w.examples.length) {
            animateToExampleRef.current(next, 'left');
          }
        } else if (gs.dx > 40) {
          const next = idx - 1;
          if (next >= 0) {
            animateToExampleRef.current(next, 'right');
          }
        }
      },
    })
  ).current;

  const handleCommentSubmit = async () => {
    if (!word) return;
    const trimmed = commentText.trim();
    if (!trimmed) { setFormError('Please write a comment.'); return; }
    if (hasKorean(trimmed)) { setFormError('Please write in English only.'); return; }
    if (trimmed.length > MAX_COMMENT_LENGTH) { setFormError(`Max ${MAX_COMMENT_LENGTH} characters.`); return; }

    setFormError('');
    setSubmitting(true);
    try {
      await createPost(word.id, trimmed);
      setCommentText('');
      setSubmitted(true);
      loadPosts(word.id);
    } catch (e: any) {
      setFormError(e.message ?? 'Failed to submit.');
    } finally {
      setSubmitting(false);
    }
  };

  const weekend = date ? isWeekend(date) : false;
  const heroImage = weekend
    ? require('../assets/heroes/hero_weekend.png')
    : require('../assets/heroes/hero_weekday.png');

  const examples = word?.examples ?? [];
  const currentExample = examples[exampleIndex];

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>🥔 Potato on the Subway</Text>
            {date ? (
              <Text style={styles.dateLabel}>{formatHeaderDate(date)}</Text>
            ) : null}
          </View>

          {/* Hero */}
          <View style={styles.heroWrap}>
            <Image source={heroImage} style={styles.hero} resizeMode="contain" />
          </View>

          {/* Word card */}
          {loading ? (
            <View style={styles.card}>
              <Text style={styles.shimmerText}>Loading...</Text>
            </View>
          ) : error ? (
            <View style={styles.card}>
              <Text style={styles.errorText}>Something went wrong. Please try again later.</Text>
            </View>
          ) : noContent || !word ? (
            <View style={styles.card}>
              <Text style={styles.noContentText}>No word for today.</Text>
              <Text style={styles.noContentSub}>See you on the next weekday! 🥔</Text>
            </View>
          ) : (
            <>
              <View style={styles.card}>
                <Text style={styles.wordText}>{displayWord(word.word)}</Text>
                <Text style={styles.meaningText}>{word.meaning_ko}</Text>
              </View>

              {/* Examples */}
              {examples.length > 0 && (
                <View style={styles.examplesSection}>
                  <Text style={styles.sectionLabel}>Examples</Text>
                  <View {...panResponder.panHandlers} style={styles.exampleCard}>
                    <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
                      {currentExample && (
                        <>
                          <Text style={styles.exampleEn}>{currentExample.en}</Text>
                          <Text style={styles.exampleKo}>{currentExample.ko}</Text>
                        </>
                      )}
                    </Animated.View>
                  </View>
                  {examples.length > 1 && (
                    <View style={styles.dots}>
                      {examples.map((_, i) => (
                        <TouchableOpacity
                          key={i}
                          onPress={() => animateToExample(i, i > exampleIndex ? 'left' : 'right')}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <View style={[styles.dot, i === exampleIndex && styles.dotActive]} />
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {/* Comment form */}
              <View style={styles.commentForm}>
                <Text style={styles.sectionLabel}>Leave a comment</Text>
                {submitted ? (
                  <Text style={styles.successText}>Comment submitted! ✓</Text>
                ) : (
                  <>
                    <TextInput
                      style={styles.input}
                      placeholder={`Use "${displayWord(word.word)}" in a sentence`}
                      placeholderTextColor="#aaa"
                      value={commentText}
                      onChangeText={(t) => {
                        setCommentText(t);
                        setFormError('');
                      }}
                      maxLength={MAX_COMMENT_LENGTH}
                      multiline
                    />
                    <View style={styles.inputMeta}>
                      {formError ? (
                        <Text style={styles.formError}>{formError}</Text>
                      ) : (
                        <Text style={styles.charCount}>
                          {commentText.length}/{MAX_COMMENT_LENGTH}
                        </Text>
                      )}
                      <TouchableOpacity
                        style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
                        onPress={handleCommentSubmit}
                        disabled={submitting}
                      >
                        <Text style={styles.submitBtnText}>
                          {submitting ? 'Submitting...' : 'Submit'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>

              {/* Comments list */}
              <View style={styles.commentsList}>
                {postsLoading ? (
                  <Text style={styles.postsLoadingText}>Loading comments...</Text>
                ) : posts.length === 0 ? (
                  <Text style={styles.noComments}>Be the first to comment!</Text>
                ) : (
                  posts.map((post) => (
                    <View key={post.id} style={styles.commentItem}>
                      <Text style={styles.commentContent}>{post.content}</Text>
                      <Text style={styles.commentTime}>{formatCommentTime(post.created_at)}</Text>
                    </View>
                  ))
                )}
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <LoadingScreen visible={loading} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f0ee',
  },
  flex: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },

  // Header
  header: {
    paddingTop: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  dateLabel: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },

  // Hero
  heroWrap: {
    alignItems: 'center',
    marginBottom: 12,
  },
  hero: {
    width: 180,
    height: 180,
  },

  // Word card
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  wordText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111',
    marginBottom: 4,
  },
  meaningText: {
    fontSize: 16,
    color: '#555',
  },
  shimmerText: {
    fontSize: 16,
    color: '#aaa',
  },
  errorText: {
    fontSize: 15,
    color: '#c00',
  },
  noContentText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
  },
  noContentSub: {
    fontSize: 14,
    color: '#888',
  },

  // Examples
  examplesSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#aaa',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  exampleCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    minHeight: 90,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
    overflow: 'hidden',
  },
  exampleEn: {
    fontSize: 15,
    color: '#111',
    lineHeight: 22,
    marginBottom: 6,
  },
  exampleKo: {
    fontSize: 13,
    color: '#888',
    lineHeight: 18,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ccc',
  },
  dotActive: {
    backgroundColor: '#111',
  },

  // Comment form
  commentForm: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#111',
    minHeight: 60,
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  inputMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  charCount: {
    fontSize: 12,
    color: '#aaa',
  },
  formError: {
    fontSize: 12,
    color: '#c00',
    flex: 1,
    marginRight: 8,
  },
  submitBtn: {
    backgroundColor: '#111',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  submitBtnDisabled: {
    backgroundColor: '#888',
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  successText: {
    fontSize: 14,
    color: '#4a9',
    marginTop: 4,
  },

  // Comments list
  commentsList: {
    gap: 8,
  },
  postsLoadingText: {
    fontSize: 13,
    color: '#aaa',
  },
  noComments: {
    fontSize: 13,
    color: '#aaa',
    textAlign: 'center',
    paddingVertical: 12,
  },
  commentItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  commentContent: {
    fontSize: 14,
    color: '#111',
    flex: 1,
    marginRight: 8,
    lineHeight: 20,
  },
  commentTime: {
    fontSize: 11,
    color: '#aaa',
    marginTop: 2,
  },
});
