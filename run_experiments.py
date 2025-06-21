import json
import os
import random
import numpy as np
import tensorflow as tf
from datetime import datetime


def load_params(path):
    with open(path, 'r') as f:
        return json.load(f)

def set_global_seed(seed):
    random.seed(seed)
    np.random.seed(seed)
    tf.random.set_seed(seed)

def simulate(params, seed):
    """Dummy simulation that uses RNG to generate results."""
    set_global_seed(seed)
    population = params.get('population', 100)
    steps = params.get('steps', 10)
    results = {'population': population, 'steps': steps, 'data': []}
    for step in range(steps):
        # simple random walk of population for demo
        population += np.random.randint(-5, 6)
        results['data'].append({'step': step, 'population': population})
    return results

def save_results(results, out_dir):
    os.makedirs(out_dir, exist_ok=True)
    path = os.path.join(out_dir, 'results.json')
    with open(path, 'w') as f:
        json.dump(results, f, indent=2)
    return path


def run(control_config, treatment_config, seed=42):
    ctrl_params = load_params(control_config)
    trt_params = load_params(treatment_config)

    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    ctrl_out = os.path.join('outputs', f'control_{timestamp}')
    trt_out = os.path.join('outputs', f'treatment_{timestamp}')

    ctrl_results = simulate(ctrl_params, seed)
    ctrl_path = save_results(ctrl_results, ctrl_out)

    # treatment uses same seed for identical start
    trt_results = simulate(trt_params, seed)
    trt_path = save_results(trt_results, trt_out)

    print(f'Control results saved to {ctrl_path}')
    print(f'Treatment results saved to {trt_path}')

if __name__ == '__main__':
    run('experiment_configs/control.json', 'experiment_configs/treatment.json')
