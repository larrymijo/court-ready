import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useIsFocused } from 'expo-router';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, AppState, Easing, Platform, Pressable, StyleSheet, View } from 'react-native';

import { Sheet, Txt } from '@/components/ui';
import { findExercise } from '@/lib/exerciseCatalog';
import { getMovementPair } from '@/lib/exerciseMedia';
import type { ExerciseDef } from '@/lib/types';
import { C, R, S, SIZE } from '@/theme';

type Pair = NonNullable<ReturnType<typeof getMovementPair>>;

/** Only the detail page or an open preview mounts a player. List rows load one still. */
export function MovementLoop({ name, pair, visible = true }: { name: string; pair: Pair; visible?: boolean }) {
  const focused = useIsFocused();
  const [foreground, setForeground] = useState(AppState.currentState === 'active');
  const [reduceMotion, setReduceMotion] = useState<boolean>();
  const [paused, setPaused] = useState(false);
  const [showEnd, setShowEnd] = useState(false);
  const [startLoaded, setStartLoaded] = useState(false);
  const [endLoaded, setEndLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [phase] = useState(() => new Animated.Value(0));
  const ready = startLoaded && endLoaded && !failed;
  const playing = ready && visible && focused && foreground && reduceMotion === false && !paused;

  useEffect(() => {
    let current = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (current) setReduceMotion(enabled);
    }).catch(() => { if (current) setReduceMotion(true); });
    const motion = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
      current = false;
      setReduceMotion(enabled);
    });
    const app = AppState.addEventListener('change', (state) => setForeground(state === 'active'));
    return () => { current = false; motion?.remove(); app?.remove(); };
  }, []);

  useEffect(() => {
    if (!playing) return;
    phase.setValue(0);
    const animation = Animated.loop(Animated.timing(phase, {
      toValue: 1, duration: 2800, easing: Easing.linear, isInteraction: false, useNativeDriver: Platform.OS !== 'web',
    }));
    animation.start();
    return () => {
      animation.stop();
      phase.stopAnimation((position) => phase.setValue(position >= 0.43 && position < 0.93 ? 0.5 : 0));
    };
  }, [phase, playing]);

  const opacity = reduceMotion ? Number(showEnd) : phase.interpolate({
    inputRange: [0, 0.36, 0.5, 0.86, 1], outputRange: [0, 0, 1, 1, 0],
  });
  const control = reduceMotion ? (showEnd ? 'Show start position' : 'Show end position') : (paused ? 'Play' : 'Pause');
  if (failed) return <Txt v="small">Movement photos unavailable.</Txt>;
  return (
    <Pressable
      style={styles.player}
      accessibilityRole="button"
      accessibilityLabel={`${name} movement photos. ${ready ? control : 'Loading'}`}
      disabled={!ready || reduceMotion === undefined}
      onPress={() => reduceMotion ? setShowEnd(!showEnd) : setPaused(!paused)}>
      <Image source={pair.start} style={StyleSheet.absoluteFill} contentFit="contain" accessible={false} accessibilityLabel=""
        onLoad={() => setStartLoaded(true)} onError={() => setFailed(true)} />
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity }]}>
        <Image source={pair.end} style={StyleSheet.absoluteFill} contentFit="contain" accessible={false} accessibilityLabel=""
          onLoad={() => setEndLoaded(true)} onError={() => setFailed(true)} />
      </Animated.View>
      {ready && reduceMotion !== undefined ? (
        <View style={styles.control}>
          <Ionicons name={reduceMotion ? 'swap-horizontal' : paused ? 'play' : 'pause'} color={C.text} size={15} />
          <Txt v="caption" color={C.text}>{control}</Txt>
        </View>
      ) : null}
    </Pressable>
  );
}

/** The thumbnail's independent button keeps browsing and checking a step separate from watching it. */
export function MovementPreview({ exercise, pair, showName }: { exercise: ExerciseDef; pair: Pair; showName?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable style={styles.preview} accessibilityRole="button" accessibilityLabel={`Preview ${exercise.name} movement`}
        onPress={() => setOpen(true)}>
        <View style={styles.thumbnail}>
          <Image source={pair.start} style={StyleSheet.absoluteFill} contentFit="contain" accessible={false} accessibilityLabel="" />
          <View style={styles.playMark}><Ionicons name="play" size={11} color={C.text} /></View>
        </View>
        {showName ? <Txt v="small" numberOfLines={2} style={{ flexShrink: 1 }}>{exercise.name}</Txt> : null}
      </Pressable>
      {open ? (
        <Sheet visible title={exercise.name} onClose={() => setOpen(false)} closeLabel="Close">
          <MovementLoop name={exercise.name} pair={pair} />
        </Sheet>
      ) : null}
    </>
  );
}

export function ChecklistMovementPreviews({ ids }: { ids?: readonly string[] }) {
  const previews = (ids ?? []).flatMap((id) => {
    const pair = getMovementPair(id);
    const exercise = pair && findExercise(id);
    return pair && exercise ? [<MovementPreview key={id} exercise={exercise} pair={pair} showName />] : [];
  });
  return previews.length ? <View style={styles.checklistPreviews}>{previews}</View> : null;
}

const styles = StyleSheet.create({
  player: { width: '100%', maxWidth: 480, alignSelf: 'center', aspectRatio: 1.5, backgroundColor: C.control, overflow: 'hidden', borderRadius: R.control },
  control: { position: 'absolute', bottom: S.sm, right: S.sm, flexDirection: 'row', alignItems: 'center', gap: S.xs, backgroundColor: C.surface, borderRadius: R.pill, paddingVertical: S.xs, paddingHorizontal: S.sm },
  preview: { minHeight: SIZE.touch, minWidth: SIZE.touch, maxWidth: '100%', flexDirection: 'row', alignItems: 'center', gap: S.sm },
  thumbnail: { width: SIZE.touch, height: SIZE.touch, borderRadius: R.small, overflow: 'hidden', backgroundColor: C.control },
  playMark: { position: 'absolute', right: 2, bottom: 2, borderRadius: R.pill, width: 17, height: 17, justifyContent: 'center', alignItems: 'center', backgroundColor: C.surface },
  checklistPreviews: { alignItems: 'flex-start', gap: S.xs, paddingBottom: S.sm },
});
