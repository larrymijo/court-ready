import { beforeEach, describe, expect, it } from '@jest/globals';
import { dismissUpdate, isNewerBuild, isUpdateReady, markUpdateReady, resetUpdateState } from '@/lib/appUpdate';

describe('isNewerBuild', () => {
  it('is true only when both builds are known and differ', () => {
    expect(isNewerBuild('aaa', 'bbb')).toBe(true);
    expect(isNewerBuild('aaa', 'aaa')).toBe(false);
  });

  it('stays quiet when either side is unknown', () => {
    // A dev server has no build id; a service worker from before this feature doesn't answer.
    expect(isNewerBuild(undefined, 'bbb')).toBe(false);
    expect(isNewerBuild('aaa', undefined)).toBe(false);
    expect(isNewerBuild('', 'bbb')).toBe(false);
  });
});

describe('the update notice', () => {
  beforeEach(resetUpdateState);

  it('is off until a newer build is ready', () => {
    expect(isUpdateReady()).toBe(false);
    markUpdateReady();
    expect(isUpdateReady()).toBe(true);
  });

  it('stays hidden after "Later", even if the check runs again', () => {
    markUpdateReady();
    dismissUpdate();
    expect(isUpdateReady()).toBe(false);
    markUpdateReady();
    expect(isUpdateReady()).toBe(false);
  });
});
