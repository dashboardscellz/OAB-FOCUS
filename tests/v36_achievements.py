from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
INDEX = (ROOT / 'index.html').read_text(encoding='utf-8')
MOBILE = (ROOT / 'data' / 'v35-mobile-app.css').read_text(encoding='utf-8')


def test_progress_schema_persists_seen_badges():
    assert 'seenBadges:[]' in INDEX or 'seenBadges: []' in INDEX
    assert 'Array.isArray(p.seenBadges)' in INDEX


def test_add_xp_checks_achievements_after_level_update():
    m = re.search(r'function\s+addXp\s*\([^)]*\)\s*\{(.{0,1200}?)\}\s*function\s+updateLevelUI', INDEX, re.S)
    assert m, 'addXp function not found'
    body = m.group(1)
    assert 'prevLevel=levelInfo().level' in body.replace(' ', '')
    assert 'checkAchievements(prevLevel)' in body
    assert body.index('updateLevelUI()') < body.index('checkAchievements(prevLevel)')


def test_check_achievements_notifies_badges_and_level_up_and_marks_dirty():
    assert 'function checkAchievements(prevLevel)' in INDEX
    assert 'Conquista desbloqueada:' in INDEX
    assert 'Você subiu para o nível' in INDEX
    assert 'progress.seenBadges' in INDEX
    # A delayed notification avoids simultaneous unreadable toast bursts.
    assert 'setTimeout' in INDEX[INDEX.index('function checkAchievements(prevLevel)'):INDEX.index('function checkAchievements(prevLevel)')+2500]
    assert 'markDirty()' in INDEX[INDEX.index('function checkAchievements(prevLevel)'):INDEX.index('function checkAchievements(prevLevel)')+2500]


def test_toast_root_is_accessible_and_mobile_safe():
    assert re.search(r'id=["\\\']toastRoot["\\\'][^>]*aria-live=["\\\']polite["\\\']', INDEX) or re.search(r'aria-live=["\\\']polite["\\\'][^>]*id=["\\\']toastRoot["\\\']', INDEX)
    assert '.toast-root' in MOBILE
    assert 'var(--v3513-nav-h)' in MOBILE
    assert 'var(--v3516-bottom-safe)' in MOBILE
