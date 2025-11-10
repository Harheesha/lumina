from flask import Flask, request, jsonify
import joblib, json, pandas as pd
from sklearn.preprocessing import LabelEncoder

app=Flask(__name__)
with open("feature_columns.json") as f: feature_cols=json.load(f)
with open("field_map.json") as f: field_map=json.load(f)
models = {m: f"{m}.joblib" for m in ['random_forest','xgboost','neural_net']}

def preprocess(df):
    for col in df.select_dtypes(include=["object","category"]).columns:
        df[col] = LabelEncoder().fit_transform(df[col].astype(str))
    return df

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    model_name = data.get("model","xgboost")
    clf = joblib.load(models[model_name])
    features = {field_map[k]: data[k] for k in field_map if k in data}
    df = pd.DataFrame([features])
    df = preprocess(df)
    pred = clf.predict(df[feature_cols])[0]
    return jsonify({"riskScore": round(float(pred), 3), "model": model_name})

# Batch endpoint omitted for brevity (same logic with model_name)

if __name__=="__main__":
    app.run(host="0.0.0.0",port=5000)
