import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Segmented, Txt } from '@/components/ui';
import { EXERCISE_BY_ID, EXERCISES } from '@/data/exercises';
import { ROUTINES } from '@/data/routines';
import type { ExerciseDef } from '@/lib/types';
import { useStore } from '@/store/useStore';
import { C, R, S } from '@/theme';

type Filter = 'plan' | 'care' | 'swaps' | 'all';

const IN_PLAN = new Set(ROUTINES.flatMap((r) => r.items.map((i) => i.exerciseId)));

const MUSCLE_LABEL: Record<string, string> = {
  chest: 'Chest',
  back: 'Back',
  shoulders: 'Shoulders',
  biceps: 'Biceps',
  triceps: 'Triceps',
  quads: 'Quads',
  hamstrings: 'Hamstrings',
  glutes: 'Glutes',
  calves: 'Calves',
  core: 'Core',
  mobility: 'Mobility',
};

export default function ExercisesScreen() {
  const { pick, swap } = useLocalSearchParams<{ pick?: string; swap?: string }>();
  const addExercise = useStore((s) => s.addExercise);
  const swapExercise = useStore((s) => s.swapExercise);
  const active = useStore((s) => s.active);
  const insets = useSafeAreaInsets();
  const swapping = swap ? active?.exercises.find((e) => e.id === swap) : undefined;
  const swappingDef = swapping ? EXERCISE_BY_ID[swapping.exerciseId] : undefined;
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>(swappingDef ? 'all' : pick ? 'all' : 'plan');

  const q = query.trim().toLowerCase();
  let list: ExerciseDef[] = EXERCISES.filter((e) => {
    if (filter === 'plan' && !(e.kind === 'main' && IN_PLAN.has(e.id))) return false;
    if (filter === 'care' && e.kind !== 'care') return false;
    if (filter === 'swaps' && e.kind !== 'alternative') return false;
    if (q && !`${e.name} ${e.muscles} ${e.primary}`.toLowerCase().includes(q)) return false;
    return true;
  });
  if (swappingDef && !q) {
    const first = swappingDef.swaps.map((id) => EXERCISE_BY_ID[id]).filter(Boolean);
    const firstIds = new Set(first.map((e) => e.id));
    list = [...first, ...list.filter((e) => !firstIds.has(e.id) && e.id !== swappingDef.id)];
  }

  const onPick = (e: ExerciseDef) => {
    if (swapping) {
      swapExercise(swapping.id, e.id);
      router.back();
    } else if (pick) {
      addExercise(e.id);
      router.back();
    } else {
      router.push(`/exercise/${e.id}`);
    }
  };

  const title = swappingDef ? `Swap ${swappingDef.name}` : pick ? 'Add exercise' : 'Exercises';

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Stack.Screen options={{ title }} />
      <View style={{ paddingHorizontal: S.lg, paddingTop: S.sm, gap: S.md }}>
        <View style={styles.search}>
          <Ionicons name="search" size={18} color={C.faint} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search exercises or muscles"
            placeholderTextColor={C.faint}
            style={styles.searchInput}
            autoCorrect={false}
          />
          {query ? (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={C.faint} />
            </Pressable>
          ) : null}
        </View>
        <Segmented<Filter>
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'plan', label: 'In plan' },
            { value: 'care', label: 'Care' },
            { value: 'swaps', label: 'Swaps' },
            { value: 'all', label: 'All' },
          ]}
        />
        {swappingDef ? <Txt v="small">Suggested swaps from the guide are at the top.</Txt> : null}
      </View>
      <FlatList
        data={list}
        keyExtractor={(e) => e.id}
        contentContainerStyle={{ padding: S.lg, gap: S.sm, paddingBottom: insets.bottom + S.xl }}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item: e }) => {
          const suggested = swappingDef?.swaps.includes(e.id);
          return (
            <Pressable onPress={() => onPick(e)} style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}>
              <View style={[styles.icon, { backgroundColor: e.kind === 'care' ? C.greenSoft : e.kind === 'alternative' ? C.orangeSoft : C.accentSoft }]}>
                <Text style={[styles.iconText, { color: e.kind === 'care' ? C.green : e.kind === 'alternative' ? C.orange : C.accent }]}>
                  {MUSCLE_LABEL[e.primary]?.slice(0, 2) ?? '?'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{e.name}</Text>
                <Text style={styles.sub} numberOfLines={1}>
                  {suggested ? 'Suggested swap · ' : ''}
                  {e.dose ? `${e.dose} · ` : ''}
                  {e.muscles}
                </Text>
              </View>
              <Ionicons name={pick || swapping ? 'add-circle-outline' : 'chevron-forward'} size={22} color={pick || swapping ? C.accent : C.faint} />
            </Pressable>
          );
        }}
        ListEmptyComponent={<Txt v="small" style={{ textAlign: 'center', marginTop: S.xl }}>No exercises match “{query}”.</Txt>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    backgroundColor: C.surface,
    borderRadius: R.md,
    paddingHorizontal: S.md,
    height: 44,
  },
  searchInput: { flex: 1, color: C.text, fontSize: 16, height: 44 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    backgroundColor: C.surface,
    borderRadius: R.md,
    padding: S.md,
  },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontWeight: '800', fontSize: 13 },
  name: { color: C.text, fontSize: 16, fontWeight: '700' },
  sub: { color: C.muted, fontSize: 12, marginTop: 2 },
});
