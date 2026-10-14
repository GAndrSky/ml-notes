"""Check the SQL course data: every reference solution runs on the seed database and returns rows,
tasks marked "ordered" really contain ORDER BY, and task ids/parts are consistent.
usage: python scripts/ci/check-sql-course.py   (from the repo root)"""
import json, pathlib, sqlite3, sys

text = pathlib.Path('11_sql/sql-course-data.js').read_text(encoding='utf-8')
data = json.loads(text[text.index('=') + 1:].strip().rstrip(';'))
db = sqlite3.connect(':memory:')
db.executescript(data['schemaSql'])
db.executescript(data['seedSql'])

problems = []
for t in data['tasks']:
    try:
        rows = db.execute(t['solution']).fetchall()
    except sqlite3.Error as e:
        problems.append(f"{t['id']}: solution fails: {e}")
        continue
    if not rows:
        problems.append(f"{t['id']}: solution returns no rows")
    tail = t['solution'].upper().rsplit(')', 1)[-1]   # the outermost query, after the last subquery/window
    if t['ordered'] and 'ORDER BY' not in tail:
        problems.append(f"{t['id']}: marked ordered but the final query has no ORDER BY")
    if not t['hints'] or not t['explain']:
        problems.append(f"{t['id']}: missing hints or explanation")
parts = sorted({t['part'] for t in data['tasks']})
for p in parts:
    page = list(pathlib.Path('11_sql').glob(f'0{p}_*.html'))
    if not page or f'data-sql-part="{p}"' not in page[0].read_text(encoding='utf-8'):
        problems.append(f'part {p}: no lesson page with data-sql-part="{p}"')

print(f"SQL course: {len(data['tasks'])} tasks, sqlite {sqlite3.sqlite_version}")
if problems:
    print('\n'.join(problems))
    sys.exit(1)
print('All reference solutions run and return rows.')
