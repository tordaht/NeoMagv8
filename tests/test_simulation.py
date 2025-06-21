import json
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from run_experiments import simulate, load_params, run

def test_simulate_length():
    params = load_params('experiment_configs/control.json')
    results = simulate(params, seed=0)
    assert len(results['data']) == params['steps']

def test_population_int():
    params = load_params('experiment_configs/control.json')
    results = simulate(params, seed=0)
    assert all(isinstance(step['population'], int) for step in results['data'])

from pathlib import Path


def test_run_creates_mlruns(tmp_path):
    os.chdir(tmp_path)
    base = Path(__file__).resolve().parents[1]
    os.environ['MLFLOW_TRACKING_URI'] = f'file:{tmp_path / "mlruns"}'
    run(str(base / 'experiment_configs' / 'control.json'),
        str(base / 'experiment_configs' / 'treatment.json'), seed=1)
    assert (tmp_path / 'mlruns').exists()
