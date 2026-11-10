import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Card, Chip, ListRow, Row, RowBadge, Txt } from '@/components/ui';
import { EXERCISE_BY_ID, EXERCISES } from '@/data/exercises';
import { ROUTINES } from '@/data/routines';
import { plural } from '@/lib/format';
import type { ExerciseDef } from '@/lib/types';
import { C, R, S, SIZE, T } from '@/theme';

export type ExerciseFilter = 'plan' | 'care' | 'swaps' | 'all';

const FILTERS: { value: ExerciseFilter; label: string }[] = [
  { value: 'plan', label: 'In plan' },
  { value: 'care', label: 'Care' },
  { value: 'swaps', label: 'Swaps' },
  { value: 'all', label: 'All' },
];

const IN_PLAN = new Set(ROUTINES.flatMap((r) => r.items.map((i) => i.exerciseId)));

/** Two letters on the row's badge, so the muscle can be told at a glance. */
const MUSCLE_CODE: Record<string, string> = {
  chest: 'Ch',
  back: 'Ba',
  shoulders: 'Sh',
  biceps: 'Bi',
  triceps: 'Tr',
  quads: 'Qu',
  hamstrings: 'Ha',
  glutes: 'Gl',
  calves: 'Ca',
  core: 'Co',
  mobility: 'Mo',
};

/**
 * Search, filters and the exercise rows. The Library shows it to browse; the workout shows it to
 * add an exercise or to swap one, in which case the suggested swaps come first.
 */
export function ExerciseList({
  initialFilter,
  swapFor,
  adds,
  onChoose,
}: {
  initialFilter: ExerciseFilter;
  /** The exercise being swapped: its suggested swaps lead the list and it is left out itself. */
  swapFor?: ExerciseDef;
  /** Rows end in a plus instead of a chevron: choosing one adds it to the workout. */
  adds?: boolean;
  onChoose: (e: ExerciseDef) => void;
}) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ExerciseFilter>(initialFilter);

  const q = query.trim().toLowerCase();
  let list: ExerciseDef[] = EXERCISES.filter((e) => {
    if (filter === 'plan' && !(e.kind === 'main' && IN_PLAN.has(e.id))) return false;
    if (filter === 'care' && e.kind !== 'care') return false;
    if (filter === 'swaps' && e.kind !== 'alternative') return false;
    if (q && !`${e.name} ${e.muscles} ${e.primary}`.toLowerCase().includes(q)) return false;
    return true;
  });
  if (swapFor && !q) {
    const first = swapFor.swaps.map((id) => EXERCISE_BY_ID[id]).filter(Boolean);
    const firstIds = new Set(first.map((e) => e.id));
    list = [...first, ...list.filter((e) => !firstIds.has(e.id) && e.id !== swapFor.id)];
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.search}>
        <Ionicons name="search" size={20} color={C.textFaint} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search exercises or muscles"
          placeholderTextColor={C.textFaint}
          accessibilityLabel="Search exercises or muscles"
          style={styles.searchInput}
          autoCorrect={false}
          enterKeyHint="search"
        />
        {query ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => setQuery('')} style={styles.clear}>
            <Ionicons name="close-circle" size={20} color={C.textFaint} />
          </Pressable>
        ) : null}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters} contentContainerStyle={styles.filtersContent}>
        {FILTERS.map((f) => (
          <Chip key={f.value} label={f.label} selected={filter === f.value} onPress={() => setFilter(f.value)} />
        ))}
      </ScrollView>

      <Row style={{ justifyContent: 'space-between' }} align="baseline">
        <Txt v="label">{FILTERS.find((f) => f.value === filter)?.label}</Txt>
        <Txt v="caption">{plural(list.length, 'exercise')}</Txt>
      </Row>
      {swapFor && !q ? <Txt v="small">Suggested swaps from the guide are at the top.</Txt> : null}

      {list.length === 0 ? (
        <Txt v="small" style={{ textAlign: 'center', marginTop: S.lg }}>
          {q ? `No exercises match “${query.trim()}”.` : 'Nothing here.'}
        </Txt>
      ) : (
        <Card variant="list" style={styles.list}>
          {list.map((e, i) => {
            const suggested = swapFor?.swaps.includes(e.id);
            return (
              <ListRow
                key={e.id}
                leading={<RowBadge square label={MUSCLE_CODE[e.primary] ?? '?'} />}
                title={e.name}
                subtitle={`${suggested ? 'Suggested swap · ' : ''}${e.dose ? `${e.dose} · ` : ''}${e.muscles}`}
                onPress={() => onChoose(e)}
                chevron={!adds}
                endIcon={adds ? 'add-circle-outline' : undefined}
                divider={i < list.length - 1}
              />
            );
          })}
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: S.md },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: C.control,
    borderRadius: R.control,
    paddingLeft: 14,
    height: 48,
  },
  searchInput: { ...T.rowTitle, fontWeight: '400', flex: 1, color: C.text, height: 48, minWidth: 0 },
  clear: { width: SIZE.touch, height: 48, alignItems: 'center', justifyContent: 'center' },
  // The chips scroll to the screen edge instead of being cut off at the gutter.
  filters: { marginHorizontal: -S.gutter, flexGrow: 0 },
  filtersContent: { paddingHorizontal: S.gutter, gap: S.sm },
  list: { paddingHorizontal: S.md },
});
