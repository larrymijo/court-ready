import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useState, type ReactNode } from 'react';
import { Pressable, ScrollView, SectionList, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Chip, ListRow, RowBadge, SectionTitle, Sheet, Txt } from '@/components/ui';
import { EXERCISES } from '@/data/exercises';
import { exerciseCategory, filterExercises, recentExercises } from '@/lib/browseExercises';
import { EQUIPMENT, exerciseLabel, MUSCLE_GROUPS } from '@/lib/exerciseCatalog';
import { planExerciseIds } from '@/lib/planView';
import type { Equipment, ExerciseDef, MuscleGroup } from '@/lib/types';
import { useStore } from '@/store/useStore';
import { C, R, S, SIZE, T } from '@/theme';

type ExerciseSection = { key: string; data: ExerciseDef[] };

interface Props {
  header?: ReactNode;
  /** A tab supplies its floating-bar clearance. Other screens are below a stack header. */
  tabBottomPad?: number;
  bottomPad?: number;
  pick?: boolean;
  swapFor?: ExerciseDef;
  excludedIds?: ReadonlySet<string>;
  selectedIds?: readonly string[];
  onChoose: (exercise: ExerciseDef) => void;
}

/** The Library and both pickers share the same searchable, windowed list. */
export function ExerciseList({ header, tabBottomPad, bottomPad = S.xl, pick, swapFor, excludedIds, selectedIds, onChoose }: Props) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [muscle, setMuscle] = useState<MuscleGroup | null>(null);
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [showEquipment, setShowEquipment] = useState(false);
  const [expandPlans, setExpandPlans] = useState(false);
  const custom = useStore((s) => s.customExercises);
  const plans = useStore((s) => s.plans);
  const activePlanId = useStore((s) => s.activePlanId);
  const workouts = useStore((s) => s.workouts);

  const catalog = useMemo(() => [...EXERCISES, ...custom.filter((ex) => !ex.archived)]
    .filter((ex) => !(pick && (ex.kind === 'drill' || ex.kind === 'stretch')) && ex.id !== swapFor?.id && !excludedIds?.has(ex.id))
    .sort((a, b) => a.name.localeCompare(b.name)), [custom, excludedIds, pick, swapFor?.id]);
  const byId = useMemo(() => new Map(catalog.map((ex) => [ex.id, ex])), [catalog]);
  const inPlans = useMemo(() => {
    // The active plan's exercises come first, in their prescribed order.
    const ordered = [plans.find((p) => p.id === activePlanId), ...plans.filter((p) => p.id !== activePlanId)];
    const ids = new Set(ordered.flatMap((p) => [...planExerciseIds(p)]));
    return [...ids].flatMap((id) => byId.get(id) ?? []);
  }, [activePlanId, byId, plans]);
  const recent = useMemo(() => recentExercises(workouts, byId), [workouts, byId]);
  const sections = useMemo((): ExerciseSection[] => {
    if (query.trim() || muscle || equipment) {
      const data = filterExercises(catalog, query, muscle, equipment);
      return data.length ? [{ key: 'Results', data }] : [];
    }
    const groups = [
      { key: 'Suggested swaps', data: (swapFor?.swaps ?? []).flatMap((id) => byId.get(id) ?? []) },
      { key: 'In your plans', data: expandPlans ? inPlans : inPlans.slice(0, 3) },
      { key: 'Recent', data: recent },
      { key: 'Your exercises', data: custom.flatMap((ex) => byId.get(ex.id) ?? []) },
      { key: 'All exercises', data: catalog },
    ];
    return groups.filter((group) => group.data.length > 0);
  }, [byId, catalog, custom, equipment, expandPlans, inPlans, muscle, query, recent, swapFor]);

  const equipmentOptions = [null, ...EQUIPMENT].map((value) => ({
    label: value ? exerciseLabel(value) : 'All equipment',
    icon: equipment === value ? 'checkmark' as const : undefined,
    onPress: () => setEquipment(value),
  }));

  return (
    <>
      <SectionList<ExerciseDef, ExerciseSection>
        style={styles.screen}
        contentContainerStyle={{
          paddingHorizontal: S.gutter,
          paddingTop: (tabBottomPad != null ? insets.top : 0) + 10,
          paddingBottom: tabBottomPad ?? bottomPad + insets.bottom,
        }}
        sections={sections}
        keyExtractor={(ex) => ex.id}
        extraData={selectedIds}
        stickySectionHeadersEnabled={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
        ListHeaderComponent={
          <View style={styles.header}>
            {header}
            <View style={styles.search}>
              <Ionicons name="search" size={20} color={C.textFaint} />
              <TextInput
                value={query} onChangeText={setQuery} placeholder="Search exercises"
                placeholderTextColor={C.textFaint} accessibilityLabel="Search exercises"
                style={styles.searchInput} autoCorrect={false} enterKeyHint="search"
              />
              {query ? (
                <Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => setQuery('')} style={styles.clear}>
                  <Ionicons name="close-circle" size={20} color={C.textFaint} />
                </Pressable>
              ) : null}
            </View>
            <View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" style={styles.filters} contentContainerStyle={styles.chips}>
                <Chip label="All muscles" selected={muscle === null} onPress={() => setMuscle(null)} />
                {MUSCLE_GROUPS.map((group) => (
                  <Chip key={group} label={exerciseLabel(group)} selected={muscle === group} onPress={() => setMuscle(group)} />
                ))}
              </ScrollView>
              <Button title={equipment ? exerciseLabel(equipment) : 'Equipment'} icon="options-outline" iconRight="chevron-down"
                accessibilityLabel={`Equipment filter, ${equipment ? exerciseLabel(equipment) : 'all equipment'}`}
                variant="ghost" onPress={() => setShowEquipment(true)} style={styles.equipment} />
            </View>
          </View>
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <SectionTitle title={section.key} right={section.key === 'In your plans' && inPlans.length > 3 ? (
              <Button title={expandPlans ? 'Show less' : `See all ${inPlans.length}`} variant="ghost" onPress={() => setExpandPlans(!expandPlans)} />
            ) : undefined} />
          </View>
        )}
        renderItem={({ item, index, section }) => {
          const last = index === section.data.length - 1;
          const selected = selectedIds?.includes(item.id);
          const icon = item.kind === 'drill' ? 'walk-outline' : item.kind === 'stretch' ? 'body-outline' : 'barbell-outline';
          const subtitle = `${exerciseCategory(item)} · ${exerciseLabel(item.equipment)}`;
          return (
            <View style={[styles.row, index === 0 && styles.first, last && styles.last]}>
              <ListRow
                leading={<RowBadge icon={icon} />} title={item.name} subtitle={subtitle}
                onPress={() => onChoose(item)} chevron={!selectedIds}
                endIcon={selectedIds ? selected ? 'checkmark-circle' : 'ellipse-outline' : undefined}
                accessibilityLabel={selectedIds ? `${item.name}, ${subtitle}, ${selected ? 'selected' : 'not selected'}` : undefined}
                divider={!last}
              />
            </View>
          );
        }}
        ListEmptyComponent={<Txt v="small" style={styles.empty}>No matching exercises. Try another muscle, equipment type or search.</Txt>}
      />
      <Sheet visible={showEquipment} title="Equipment" onClose={() => setShowEquipment(false)} actions={equipmentOptions} />
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  header: { gap: S.md },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.control, borderRadius: R.control, paddingLeft: 14, minHeight: 48 },
  searchInput: { ...T.rowTitle, fontWeight: '400', flex: 1, color: C.text, height: 48, minWidth: 0 },
  clear: { width: SIZE.touch, height: 48, alignItems: 'center', justifyContent: 'center' },
  filters: { marginHorizontal: -S.gutter, flexGrow: 0 },
  chips: { paddingHorizontal: S.gutter, gap: S.sm },
  equipment: { alignSelf: 'flex-end', paddingRight: 0 },
  sectionHeader: { paddingTop: S.sm, paddingBottom: S.sm },
  row: { backgroundColor: C.surface, paddingHorizontal: S.lg },
  first: { borderTopLeftRadius: R.card, borderTopRightRadius: R.card },
  last: { borderBottomLeftRadius: R.card, borderBottomRightRadius: R.card, marginBottom: S.md },
  empty: { paddingVertical: S.lg },
});
