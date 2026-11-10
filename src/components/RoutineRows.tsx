import { Button, ListRow, RowBadge } from '@/components/ui';
import { getExercise } from '@/data/exercises';
import { ROUTINES } from '@/data/routines';
import { formatDate } from '@/lib/format';
import { hardSetCount } from '@/lib/program';
import type { PhaseId, RoutineId, Workout } from '@/lib/types';

/**
 * Every session of the plan as a row with its own Start button: the scheduled one in white, the
 * rest outlined. Used by the Plan tab and by "Choose another day" on Today.
 */
export function RoutineRows({
  todayRoutineId,
  onStart,
  onOpen,
  details,
  lastDivider,
}: {
  /** The session scheduled for today, if today is a gym day. */
  todayRoutineId?: RoutineId;
  onStart: (id: RoutineId) => void;
  /** What tapping the row itself does: open the preview, or start it. */
  onOpen: (id: RoutineId) => void;
  /** Adds a line with this week's sets and when the session was last done. */
  details?: { phase: PhaseId; workouts: Workout[] };
  /** Draw a line under the last row too, when more rows follow in the same card. */
  lastDivider?: boolean;
}) {
  // The sessions of the week are numbered; an optional one gets a plus instead.
  const numbered = ROUTINES.filter((r) => !r.optional).map((r) => r.id);
  return (
    <>
      {ROUTINES.map((r, i) => {
        const today = r.id === todayRoutineId;
        const last = details?.workouts.find((w) => w.routineId === r.id);
        return (
          <ListRow
            key={r.id}
            leading={r.optional ? <RowBadge icon="add" /> : <RowBadge label={String(numbered.indexOf(r.id) + 1)} />}
            title={r.name}
            subtitle={`${r.optional ? 'Optional' : r.focus} · ${r.minutes} min${today ? ' · today' : ''}`}
            caption={
              details
                ? `${hardSetCount(r, getExercise, { phase: details.phase })} sets · ${last ? `last ${formatDate(last.startedAt)}` : 'not done yet'}`
                : undefined
            }
            onPress={() => onOpen(r.id)}
            divider={lastDivider || i < ROUTINES.length - 1}
            trailing={
              <Button
                size="pill"
                variant={today ? 'primary' : 'outline'}
                title="Start"
                accessibilityLabel={`Start ${r.name}`}
                onPress={() => onStart(r.id)}
              />
            }
          />
        );
      })}
    </>
  );
}
