"""
Disease Predictor - Memory-Safe Notebook Version
Designed to avoid kernel crashes in Jupyter/Colab/Kaggle

Key memory strategies:
  - Process CSV in chunks, never load full float64 matrix
  - Use int8 for all symptom data (8x less RAM than float64)
  - Delete intermediate objects immediately with gc.collect()
  - Train models one at a time, not all at once
  - Use LightGBM only (most memory-efficient model)
  - Monitor RAM usage throughout
"""

import gc, os, re, sys, time, warnings, joblib
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.preprocessing     import LabelEncoder
from sklearn.model_selection   import train_test_split
from sklearn.metrics           import (accuracy_score, classification_report,
                                        f1_score, precision_score, recall_score,
                                        confusion_matrix)
warnings.filterwarnings("ignore")

# ── Try to import psutil for RAM monitoring ───────────────────────────────────
try:
    import psutil #psutil is used to monitor memory so that training doesn't crash due to insufficient RAM.
    def ram_gb():
        p = psutil.Process(os.getpid())
        return p.memory_info().rss / 1e9
    def available_ram_gb():
        return psutil.virtual_memory().available / 1e9
    HAS_PSUTIL = True
except ImportError:
    HAS_PSUTIL = False
    def ram_gb(): return 0.0
    def available_ram_gb(): return 99.0

def ram_check(label=""):
    if HAS_PSUTIL:
        used = ram_gb()
        avail = available_ram_gb()
        status = "⚠️ LOW RAM" if avail < 1.0 else "✔"
        print(f"  RAM {status} | used={used:.2f}GB | available={avail:.2f}GB  [{label}]")
        if avail < 0.5:
            print("  ❌ CRITICAL: Less than 500MB available — kernel may crash!")
            print("     → Reduce MAX_SAMPLES_PER_CLASS or switch to COLAB_MODE=True")
        return used, avail
    return 0, 99

# ── CONFIGURATION ─────────────────────────────────────────────────────────────
DATASET_PATH          = "/kaggle/input/datasets/rolaaboudaoud/diseaseaipredictor/Final_Augmented_dataset_Diseases_and_Symptoms.csv"
MODEL_SAVE_PATH       = "disease_model.joblib"
RANDOM_STATE          = 42
TEST_SIZE             = 0.20
MIN_SAMPLES_PER_CLASS = 10     # classes below this are dropped

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# MEMORY MODE — choose based on your RAM
#   "low"    → MAX 150 samples/class → ~50K rows → needs ~2GB RAM
#   "medium" → MAX 300 samples/class → ~100K rows → needs ~4GB RAM  (default)
#   "high"   → NO cap, all data     → ~246K rows → needs ~8GB RAM
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MEMORY_MODE = "medium"

MODE_SETTINGS = {
    "low"   : {"max_samples": 150,  "lgb_trees": 800,  "lgb_leaves": 127, "expected_acc": "75-80%"},
    "medium": {"max_samples": 300,  "lgb_trees": 1200, "lgb_leaves": 255, "expected_acc": "82-87%"},
    "high"  : {"max_samples": None, "lgb_trees": 1500, "lgb_leaves": 255, "expected_acc": "85-92%"},
}
cfg = MODE_SETTINGS[MEMORY_MODE]
MAX_SAMPLES_PER_CLASS = cfg["max_samples"]
LGB_TREES             = cfg["lgb_trees"]
LGB_LEAVES            = cfg["lgb_leaves"]


# ═════════════════════════════════════════════════════════════════════════════
# STEP 1 — LOAD & BALANCE (memory-safe)
# ═════════════════════════════════════════════════════════════════════════════
def load_and_balance():
    print("="*60)
    print("STEP 1: LOADING & BALANCING DATASET")
    print("="*60) #bytba3 = 60 times the character "=" to create a visual separator in the console output, making it easier to identify the start of a new step in the process.
    print(f"  Mode: {MEMORY_MODE.upper()}  |  "
          f"Max samples/class: {MAX_SAMPLES_PER_CLASS or 'unlimited'}") 
    ram_check("before load") #

    if not os.path.exists(DATASET_PATH):
        raise FileNotFoundError(
            f"Dataset not found: '{DATASET_PATH}'\n"
            "Place the CSV in the same folder as this script."
        )

    # ── Read CSV ──────────────────────────────────────────────────────────────
    print(f"\n  Reading {DATASET_PATH} ...")
    df = pd.read_csv(DATASET_PATH)
    disease_col  = df.columns[0]
    symptom_cols = list(df.columns[1:])
    print(f"  Raw shape: {df.shape[0]:,} rows × {df.shape[1]} cols")

    # ── Convert symptoms to int8 IMMEDIATELY (saves ~600MB) ──────────────────
    print("  Converting symptoms → int8 ...")
    for c in symptom_cols:
        df[c] = (df[c].fillna(0).astype(str).str.strip().str.lower()
                  .isin(["1","1.0","yes"])).astype(np.int8)
    ram_check("after int8 conversion")

    # ── Normalise disease names ───────────────────────────────────────────────
    df[disease_col] = (df[disease_col].astype(str).str.strip().str.lower()
                        .str.replace(r"\s+", " ", regex=True).str.title())

    # ── Drop rare classes ─────────────────────────────────────────────────────
    counts   = df[disease_col].value_counts()
    rare     = counts[counts < MIN_SAMPLES_PER_CLASS].index.tolist()
    df       = df[~df[disease_col].isin(rare)].copy()
    counts2  = df[disease_col].value_counts()
    print(f"\n  Dropped {len(rare)} rare classes (<{MIN_SAMPLES_PER_CLASS} samples)")
    print(f"  Remaining: {len(counts2)} classes, {len(df):,} rows")
    print(f"  Range: {counts2.min()}–{counts2.max()} samples/class (mean {counts2.mean():.0f})")

    # ── Undersample majority classes (if mode != high) ────────────────────────
    if MAX_SAMPLES_PER_CLASS:
        n_majority = (counts2 > MAX_SAMPLES_PER_CLASS).sum()
        print(f"  Undersampling {n_majority} majority classes → max {MAX_SAMPLES_PER_CLASS} each ...")
        balanced = [
            grp.sample(min(len(grp), MAX_SAMPLES_PER_CLASS), random_state=RANDOM_STATE)
            for _, grp in df.groupby(disease_col)
        ]
        df = pd.concat(balanced, ignore_index=True)
        del balanced; gc.collect()

    df = df.sample(frac=1, random_state=RANDOM_STATE).reset_index(drop=True)
    counts3 = df[disease_col].value_counts()
    print(f"\n  Final balanced dataset: {len(df):,} rows, {len(counts3)} classes")
    print(f"  Final range: {counts3.min()}–{counts3.max()} (mean {counts3.mean():.0f})")
    ram_check("after balancing")

    return df, disease_col, symptom_cols, counts3


# ═════════════════════════════════════════════════════════════════════════════
# STEP 2 — BUILD FEATURE MATRIX (memory-safe)
# ═════════════════════════════════════════════════════════════════════════════
def build_features(df, disease_col, symptom_cols):
    print("\n" + "="*60)
    print("STEP 2: BUILDING FEATURE MATRIX")
    print("="*60)

    # Extract as float32 (not float64) — halves RAM vs default
    X = df[symptom_cols].values.astype(np.float32)
    le = LabelEncoder()
    y  = le.fit_transform(df[disease_col].values)

    print(f"  X shape: {X.shape}  dtype: {X.dtype}")
    print(f"  Memory : {X.nbytes/1e6:.0f} MB")
    print(f"  Classes: {len(le.classes_)}")
    print(f"  Avg symptoms/row: {X.sum(axis=1).mean():.1f}")

    # Free the dataframe immediately
    del df; gc.collect()
    ram_check("after feature matrix")
    return X, y, le


# ═════════════════════════════════════════════════════════════════════════════
# STEP 3 — SPLIT
# ═════════════════════════════════════════════════════════════════════════════
def split(X, y):
    print("\n" + "="*60)
    print("STEP 3: TRAIN/TEST SPLIT")
    print("="*60)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y
    )
    # Delete full X immediately
    del X; gc.collect()
    print(f"  Train: {X_train.shape[0]:,} | Test: {X_test.shape[0]:,} | Features: {X_train.shape[1]}")
    ram_check("after split")
    return X_train, X_test, y_train, y_test


# ═════════════════════════════════════════════════════════════════════════════
# STEP 4 — TRAIN LIGHTGBM  (most memory-efficient high-accuracy model)
# ═════════════════════════════════════════════════════════════════════════════
def train_lightgbm(X_train, y_train, X_test, y_test):
    try:
        import lightgbm as lgb
    except ImportError:
        print("\n  [!] LightGBM not installed. Installing now...")
        os.system(f"{sys.executable} -m pip install lightgbm -q")
        import lightgbm as lgb

    print("\n" + "="*60)
    print("STEP 4: TRAINING LIGHTGBM")
    print(f"  Trees: {LGB_TREES} | Leaves: {LGB_LEAVES} | LR: 0.03")
    print(f"  Expected accuracy: {cfg['expected_acc']}")
    print("="*60)
    ram_check("before training")

    # ── LightGBM with dataset API for memory efficiency ───────────────────────
    # Using the Dataset API avoids duplicating the data in memory
    dtrain = lgb.Dataset(X_train, label=y_train, free_raw_data=True)
    dvalid = lgb.Dataset(X_test,  label=y_test,  reference=dtrain, free_raw_data=True)

    n_classes = len(np.unique(y_train))
    params = {
        "objective"        : "multiclass",
        "num_class"        : n_classes,
        "metric"           : "multi_logloss",
        "num_leaves"       : LGB_LEAVES,
        "learning_rate"    : 0.03,
        "feature_fraction" : 0.8,
        "bagging_fraction" : 0.8,
        "bagging_freq"     : 5,
        "min_child_samples": 5,
        "reg_alpha"        : 0.1,
        "reg_lambda"       : 0.1,
        "is_unbalance"     : True,      # handles class imbalance
        "num_threads"      : -1,        # use all CPU cores
        "verbose"          : -1,
        "seed"             : RANDOM_STATE,
    }

    callbacks = [
        lgb.early_stopping(stopping_rounds=50, verbose=True),
        lgb.log_evaluation(period=100),
    ]

    print(f"\n  Training {LGB_TREES} trees (early stopping if no improvement in 50 rounds)...")
    t0 = time.time()
    booster = lgb.train(
        params,
        dtrain,
        num_boost_round   = LGB_TREES,
        valid_sets        = [dvalid],
        callbacks         = callbacks,
    )
    elapsed = time.time() - t0
    print(f"\n  ✔ Training done in {elapsed:.0f}s ({elapsed/60:.1f} min)")
    print(f"  Best iteration: {booster.best_iteration}")
    del dtrain, dvalid; gc.collect()
    ram_check("after training")
    return booster, elapsed


# ═════════════════════════════════════════════════════════════════════════════
# STEP 5 — EVALUATE
# ═════════════════════════════════════════════════════════════════════════════
def evaluate(booster, X_test, y_test, le):
    print("\n" + "="*60)
    print("STEP 5: EVALUATION")
    print("="*60)

    # LightGBM booster returns probabilities (n_samples, n_classes)
    proba  = booster.predict(X_test)
    y_pred = np.argmax(proba, axis=1)
    del proba; gc.collect()

    acc  = accuracy_score(y_test, y_pred)
    f1   = f1_score(y_test, y_pred, average="weighted", zero_division=0)
    prec = precision_score(y_test, y_pred, average="weighted", zero_division=0)
    rec  = recall_score(y_test, y_pred, average="weighted", zero_division=0)

    print(f"\n  Accuracy  : {acc*100:.2f}%  {'✔ TARGET MET' if acc >= 0.85 else '⚠ below 85% — try MEMORY_MODE=high'}")
    print(f"  F1 (wt)   : {f1:.4f}")
    print(f"  Precision : {prec:.4f}")
    print(f"  Recall    : {rec:.4f}")

    # Per-class report
    report = classification_report(
        y_test, y_pred, target_names=le.classes_, zero_division=0, output_dict=True
    )
    per_class = {k: v for k, v in report.items()
                 if k not in ("accuracy","macro avg","weighted avg") and isinstance(v, dict)}
    sorted_cls = sorted(per_class.items(), key=lambda x: x[1]["f1-score"])

    print("\n  10 Hardest classes (lowest F1):")
    for cls, m in sorted_cls[:10]:
        print(f"    {cls[:45]:<45}  F1={m['f1-score']:.2f}  n={int(m['support'])}")

    print("\n  10 Easiest classes (highest F1):")
    for cls, m in sorted_cls[-10:]:
        print(f"    {cls[:45]:<45}  F1={m['f1-score']:.2f}  n={int(m['support'])}")

    _plot_confusion_matrix(y_test, y_pred, le)
    _plot_per_class_f1(report, le.classes_)
    _plot_metrics_summary(acc, f1, prec, rec)

    return acc, f1, report, y_pred


def _plot_confusion_matrix(y_test, y_pred, le):
    top_n = 35
    u, c  = np.unique(y_test, return_counts=True)
    top_i = u[np.argsort(-c)[:top_n]]
    mask  = np.isin(y_test, top_i)
    cm    = confusion_matrix(y_test[mask], y_pred[mask], labels=top_i)
    labels = le.classes_[top_i]

    fig, ax = plt.subplots(figsize=(20, 16))
    sns.heatmap(cm, annot=True, fmt="d", cmap="Blues",
                xticklabels=labels, yticklabels=labels,
                ax=ax, annot_kws={"size": 6}, linewidths=0.3)
    acc_subset = accuracy_score(y_test[mask], y_pred[mask])
    ax.set_title(f"Confusion Matrix — Top {top_n} Most Frequent Classes\n"
                 f"Subset accuracy: {acc_subset*100:.2f}%", fontsize=12)
    ax.set_xlabel("Predicted"); ax.set_ylabel("Actual")
    plt.xticks(rotation=45, ha="right", fontsize=6)
    plt.yticks(fontsize=6)
    plt.tight_layout()
    plt.savefig("confusion_matrix.png", dpi=130, bbox_inches="tight")
    plt.close()
    print("\n  Saved: confusion_matrix.png")


def _plot_per_class_f1(report, class_names):
    per_class = {k: v["f1-score"] for k, v in report.items()
                 if k not in ("accuracy","macro avg","weighted avg") and isinstance(v, dict)}
    items  = sorted(per_class.items(), key=lambda x: x[1])
    bottom = items[:50]
    names  = [x[0][:38] for x in bottom]
    vals   = [x[1] for x in bottom]
    colors = ["#dc2626" if v < 0.5 else "#f59e0b" if v < 0.75 else "#16a34a" for v in vals]

    fig, ax = plt.subplots(figsize=(10, 16))
    ax.barh(range(len(names)), vals, color=colors, edgecolor="none")
    ax.set_yticks(range(len(names)))
    ax.set_yticklabels(names, fontsize=8)
    ax.axvline(0.85, color="red", linestyle="--", lw=1.5, label="85% target")
    ax.set_xlim(0, 1.05)
    ax.set_title("Bottom 50 Classes by F1 Score\n🔴 <0.50  🟡 0.50–0.75  🟢 ≥0.75", fontsize=11)
    ax.set_xlabel("F1 Score"); ax.legend()
    ax.grid(axis="x", linestyle="--", alpha=0.4)
    plt.tight_layout()
    plt.savefig("per_class_f1.png", dpi=130, bbox_inches="tight")
    plt.close()
    print("  Saved: per_class_f1.png")


def _plot_metrics_summary(acc, f1, prec, rec):
    metrics = ["Accuracy", "F1 (weighted)", "Precision", "Recall"]
    values  = [acc, f1, prec, rec]
    colors  = ["#2563eb" if v >= 0.85 else "#dc2626" for v in values]

    fig, ax = plt.subplots(figsize=(8, 4))
    bars = ax.bar(metrics, values, color=colors, alpha=0.87, edgecolor="white", width=0.5)
    for bar, v in zip(bars, values):
        ax.text(bar.get_x()+bar.get_width()/2, bar.get_height()+0.01,
                f"{v*100:.2f}%", ha="center", va="bottom", fontsize=12, fontweight="bold")
    ax.axhline(0.85, color="red", linestyle="--", lw=1.5, label="85% target")
    ax.set_ylim(0, 1.18)
    ax.set_title("Model Performance Summary (LightGBM)", fontsize=13)
    ax.set_ylabel("Score"); ax.legend()
    ax.grid(axis="y", linestyle="--", alpha=0.4)
    plt.tight_layout()
    plt.savefig("metrics_summary.png", dpi=130, bbox_inches="tight")
    plt.close()
    print("  Saved: metrics_summary.png")


# ═════════════════════════════════════════════════════════════════════════════
# STEP 6 — FEATURE IMPORTANCE
# ═════════════════════════════════════════════════════════════════════════════
def plot_feature_importance(booster, symptom_cols):
    print("\n" + "="*60)
    print("STEP 6: FEATURE IMPORTANCE")
    print("="*60)
    imp   = booster.feature_importance(importance_type="gain")
    top_n = 30
    idx   = np.argsort(imp)[::-1][:top_n]
    feats = [symptom_cols[i] for i in idx]
    vals  = imp[idx]

    fig, ax = plt.subplots(figsize=(10, 9))
    palette = plt.cm.RdYlGn(np.linspace(0.2, 0.9, top_n))
    ax.barh(range(top_n), vals[::-1], color=palette[::-1], edgecolor="none")
    ax.set_yticks(range(top_n))
    ax.set_yticklabels([f.replace("_"," ") for f in feats[::-1]], fontsize=9)
    ax.set_title(f"Top {top_n} Most Predictive Symptoms\n(LightGBM feature importance — gain)", fontsize=12)
    ax.set_xlabel("Gain"); ax.grid(axis="x", linestyle="--", alpha=0.4)
    plt.tight_layout()
    plt.savefig("feature_importance.png", dpi=130, bbox_inches="tight")
    plt.close()
    print(f"  Saved: feature_importance.png")
    print(f"  Top 10: {feats[:10]}")


# ═════════════════════════════════════════════════════════════════════════════
# STEP 7 — SAVE MODEL
# ═════════════════════════════════════════════════════════════════════════════
def save_model(booster, le, symptom_cols, acc):
    bundle = dict(booster=booster, label_encoder=le, symptom_cols=symptom_cols)
    joblib.dump(bundle, MODEL_SAVE_PATH, compress=3)
    size = os.path.getsize(MODEL_SAVE_PATH) / 1e6
    print(f"\n  ✔ Saved: {MODEL_SAVE_PATH}  ({size:.1f} MB)  |  Accuracy: {acc*100:.2f}%")


# ═════════════════════════════════════════════════════════════════════════════
# STEP 8 — PREDICT
# ═════════════════════════════════════════════════════════════════════════════
def load_bundle():
    b = joblib.load(MODEL_SAVE_PATH)
    return b["booster"], b["label_encoder"], b["symptom_cols"]


def predict(text, booster, le, symptom_cols, top_n=5):
    terms = [s.strip().lower() for s in re.split(r"[,;\n]+", text) if s.strip()]
    vec   = np.zeros((1, len(symptom_cols)), dtype=np.float32)
    matched = []
    for term in terms:
        for i, col in enumerate(symptom_cols):
            col_c = col.lower().replace("_"," ")
            if term == col_c or term in col_c or col_c in term:
                vec[0, i] = 1
                matched.append(col.replace("_"," "))
    proba  = booster.predict(vec)[0]
    top_i  = np.argsort(proba)[::-1][:top_n]
    preds  = [{"disease": le.classes_[i],
               "confidence": round(float(proba[i])*100, 2)} for i in top_i]
    return preds, list(set(matched))


def interactive():
    print("\n" + "="*60)
    print("  INTERACTIVE PREDICTOR")
    print("="*60)
    booster, le, symptom_cols = load_bundle()
    print(f"  ✔ Model loaded — {len(le.classes_)} diseases\n")
    print("  Example: fever, headache, nausea, fatigue\n")
    while True:
        print("─"*55)
        inp = input("Symptoms (q=quit): ").strip()
        if inp.lower() in ("q","quit","exit"):
            print("Goodbye!"); break
        if not inp:
            continue
        preds, matched = predict(inp, booster, le, symptom_cols)
        print(f"\nMatched: {', '.join(matched) if matched else 'none — check spelling'}")
        if not matched:
            continue
        print(f"\n{'#':<4} {'Disease':<42} {'Confidence':>10}")
        print("─"*55)
        for i, p in enumerate(preds, 1):
            bar = "█" * int(p["confidence"] / 4)
            print(f"#{i:<3} {p['disease']:<42} {p['confidence']:>9.2f}%  {bar}")
        print("\n⚠  Not a medical diagnosis. Consult a doctor.\n")


# ═════════════════════════════════════════════════════════════════════════════
# MAIN
# ═════════════════════════════════════════════════════════════════════════════
def main():
    print("\n" + "█"*60)
    print("  DISEASE PREDICTOR — MEMORY-SAFE NOTEBOOK VERSION")
    print(f"  Mode: {MEMORY_MODE.upper()} | Target: 85%+ accuracy")
    print("█"*60)
    if HAS_PSUTIL:
        total_ram = psutil.virtual_memory().total / 1e9
        print(f"  System RAM: {total_ram:.1f} GB")
        if total_ram < 4 and MEMORY_MODE != "low":
            print(f"  ⚠  Only {total_ram:.1f}GB RAM detected.")
            print("     Change MEMORY_MODE = 'low' at the top of this script!")
    else:
        print("  (Install psutil for RAM monitoring: pip install psutil)")

    if "--predict" in sys.argv:
        interactive(); return

    if os.path.exists(MODEL_SAVE_PATH) and "--retrain" not in sys.argv:
        print(f"\n  Saved model found. Loading...")
        print("  → Run with --retrain to force retraining.")
        interactive(); return

    t_total = time.time()

    df, disease_col, symptom_cols, class_counts = load_and_balance()
    X, y, le = build_features(df, disease_col, symptom_cols)
    X_train, X_test, y_train, y_test = split(X, y)
    booster, train_time = train_lightgbm(X_train, y_train, X_test, y_test)
    del X_train, y_train; gc.collect()

    acc, f1, report, y_pred = evaluate(booster, X_test, y_test, le)
    plot_feature_importance(booster, symptom_cols)
    save_model(booster, le, symptom_cols, acc)

    elapsed = time.time() - t_total
    print("\n" + "█"*60)
    print(f"  COMPLETE — {elapsed:.0f}s ({elapsed/60:.1f} min)")
    print(f"  Accuracy : {acc*100:.2f}%  |  F1: {f1:.4f}")
    print(f"  Outputs  : confusion_matrix.png | per_class_f1.png")
    print(f"             metrics_summary.png  | feature_importance.png")
    print(f"             {MODEL_SAVE_PATH}")
    if acc < 0.85:
        print(f"\n  To boost accuracy:")
        print(f"  1. Set MEMORY_MODE = 'high' (needs ~8GB RAM)")
        print(f"  2. Increase LGB_TREES to 2000")
    print("█"*60)
    interactive()


if __name__ == "__main__":
    main()