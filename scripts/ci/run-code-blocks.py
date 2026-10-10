"""Run every extracted lesson code block.

Each block runs with a small prelude (common imports + synthetic X/y splits) and the lesson's
earlier blocks (each wrapped in try/except, so one failure does not cascade). Blocks listed in
expected-failures.txt are intentional fragments (they use names the lesson only describes, need a
GPU, network access or a private dataset); every other failure fails the run.

usage: python run-code-blocks.py <code-dir> [--filter SUBSTRING]
"""
import argparse, json, os, pathlib, subprocess, sys, tempfile, textwrap

HERE = pathlib.Path(__file__).parent
REGRESSION_LESSONS = ('03_linear_regression', '04_linear_model_regularization', '06_regression_metrics')
PRELUDE = '''
import math, warnings; warnings.filterwarnings("ignore")
import numpy as np, pandas as pd
import torch, torch.nn as nn, torch.nn.functional as F
from sklearn.model_selection import train_test_split
rng = np.random.default_rng(0)
torch.manual_seed(0)
if REG:
    from sklearn.datasets import make_regression
    X, y = make_regression(n_samples=400, n_features=8, noise=10.0, random_state=0)
else:
    from sklearn.datasets import make_classification
    X, y = make_classification(n_samples=600, n_features=8, n_informative=5, weights=[0.8, 0.2], random_state=0)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=0)
X_val, y_val = X_valid, y_valid = X_test, y_test
feature_names = [f"f{i}" for i in range(X.shape[1])]
'''


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('code_dir')
    ap.add_argument('--filter', default='')
    args = ap.parse_args()
    code_dir = pathlib.Path(args.code_dir)
    index = json.loads((code_dir / 'index.json').read_text(encoding='utf-8'))
    expected = {l.split('#')[0].strip() for l in (HERE / 'expected-failures.txt').read_text(encoding='utf-8').splitlines()}
    expected.discard('')
    env = dict(os.environ, MPLBACKEND='Agg', CUDA_VISIBLE_DEVICES='', OMP_NUM_THREADS='2', HF_HUB_OFFLINE='1')

    by_lesson = {}
    for item in index:
        by_lesson.setdefault(item['file'], []).append(item)

    unexpected, fixed, total = [], [], 0
    for lesson, items in by_lesson.items():
        reg = any(k in lesson for k in REGRESSION_LESSONS)
        for i, item in enumerate(items):
            if args.filter not in item['name']:
                continue
            total += 1
            prior = ''.join('try:\n' + textwrap.indent((code_dir / p['name']).read_text(encoding='utf-8'), '    ')
                            + '\n    pass\nexcept BaseException:\n    pass\n' for p in items[:i])
            script = f'REG = {reg}\n{PRELUDE}\n{prior}\n' + (code_dir / item['name']).read_text(encoding='utf-8')
            with tempfile.TemporaryDirectory() as tmp:
                sp = pathlib.Path(tmp) / 'block.py'
                sp.write_text(script, encoding='utf-8')
                try:
                    p = subprocess.run([sys.executable, '-X', 'utf8', str(sp)], cwd=tmp, env=env, capture_output=True,
                                       text=True, encoding='utf-8', errors='replace', timeout=240)
                    ok, err = p.returncode == 0, p.stderr.strip().splitlines()
                    msg = next((l for l in reversed(err) if l and not l.startswith(' ')), '') if not ok else ''
                except subprocess.TimeoutExpired:
                    ok, msg = False, 'timeout'
            where = f"{item['file']}:{item['line']}"
            if ok and item['name'] in expected:
                fixed.append(item['name'])
            if not ok and item['name'] not in expected:
                unexpected.append(f"{item['name']} ({where}): {msg}")
            print(f"{'ok' if ok else ('expected' if item['name'] in expected else 'FAIL'):9} {item['name']}  {msg[:110]}", flush=True)

    print(f'\n{total} blocks, {len(unexpected)} unexpected failure(s).')
    if fixed:
        print('Now passing, remove from expected-failures.txt:\n  ' + '\n  '.join(fixed))
    if unexpected:
        print('Unexpected failures:\n  ' + '\n  '.join(unexpected))
        sys.exit(1)


if __name__ == '__main__':
    main()
