import json
import os
import random
import numpy as np
from datetime import datetime
import mlflow


def load_params(path):
    with open(path, 'r') as f:
        return json.load(f)

def set_global_seed(seed):
    random.seed(seed)
    np.random.seed(seed)

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


def run(control_config, treatment_config, seed=42, model_version="1.0"):
    """Run paired control/treatment simulations and log with MLflow."""

    mlflow.set_tracking_uri(os.getenv("MLFLOW_TRACKING_URI", "file:/mlruns"))
    mlflow.set_experiment("NeoMag-Sim")

    ctrl_params = load_params(control_config)
    trt_params = load_params(treatment_config)

    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    ctrl_out = os.path.join('outputs', f'control_{timestamp}')
    trt_out = os.path.join('outputs', f'treatment_{timestamp}')

    with mlflow.start_run() as run_ctx:
        mlflow.log_params({f'control_{k}': v for k, v in ctrl_params.items()})
        mlflow.log_params({f'treatment_{k}': v for k, v in trt_params.items()})
        mlflow.log_param("seed", seed)
        mlflow.log_param("model_version", model_version)

        ctrl_results = simulate(ctrl_params, seed)
        ctrl_path = save_results(ctrl_results, ctrl_out)
        mlflow.log_metric('control_final_population',
                          ctrl_results['data'][-1]['population'])
        mlflow.log_artifacts(ctrl_out, artifact_path='control')

        # treatment uses same seed for identical start
        trt_results = simulate(trt_params, seed)
        trt_path = save_results(trt_results, trt_out)
        mlflow.log_metric('treatment_final_population',
                          trt_results['data'][-1]['population'])
        mlflow.log_artifacts(trt_out, artifact_path='treatment')

        print(f"MLflow run completed: {mlflow.get_tracking_uri()}/#/experiments/{run_ctx.info.experiment_id}/runs/{run_ctx.info.run_id}")

    print(f'Control results saved to {ctrl_path}')
    print(f'Treatment results saved to {trt_path}')

if __name__ == '__main__':
    run('experiment_configs/control.json', 'experiment_configs/treatment.json')
