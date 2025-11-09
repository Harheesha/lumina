import streamlit as st
import pandas as pd
import joblib
import json
import numpy as np
import matplotlib.pyplot as plt

st.set_page_config(page_title="Lumina Health Malaria Risk Analytics", layout="wide")

model = joblib.load('lumina_health_final_calibrated_xgb.joblib')
with open("feature_columns.json") as f:
    feat_cols = json.load(f)
importances = model.base_estimator_.feature_importances_

profile_data = {}
side_fields = [
    ["Household_Size", 0, 10, 1],
    ["Age", 0, 99, 18],
    ["Sex", 0, 1, 1],
    ["Pregnant", 0, 1, 0],
    ["Wealth_Index", 1, 5, 3],
    ["Bednet_Owned", 0, 1, 1],
    ["Bednet_Used", 0, 1, 1],
    ["Malaria_Tested", 0, 1, 1],
    ["Recent_Fever", 0, 1, 0],
    ["AntiMalaria_Meds", 0, 1, 1],
    ["Water_Access", 0, 1, 1],
    ["Cluster", 101, 129, 110],
    ["Climate_Score", 30, 100, 60],
    ["Month", 5, 10, 7]
]
for col, mn, mx, df in side_fields:
    profile_data[col] = st.sidebar.number_input(col, mn, mx, df)
states = [s.replace("State_", "") for s in feat_cols if s.startswith("State_")]
selected_state = st.sidebar.selectbox("State", states)
for s in ["State_" + state for state in states]:
    profile_data[s] = 1 if s == "State_" + selected_state else 0
source_types = [s.replace("Source_of_Net_", "") for s in feat_cols if s.startswith("Source_of_Net_")]
selected_source = st.sidebar.selectbox("Source of Net", source_types)
for s in ["Source_of_Net_" + src for src in source_types]:
    profile_data[s] = 1 if s == "Source_of_Net_" + selected_source else 0

if 'session_log' not in st.session_state:
    st.session_state['session_log'] = []

st.title("Lumina Health: Malaria Risk Prediction")
st.write("Enter household and environmental features. The predictive model provides immediate malaria risk assessment and suggested interventions.")

if st.button("Predict Malaria Risk"):
    inp_df = pd.DataFrame([profile_data])[feat_cols]
    prob = model.predict_proba(inp_df)[:, 1][0]
    if prob > 0.6:
        recommendation = "High malaria risk: prioritize urgent intervention."
    elif prob > 0.25:
        recommendation = "Moderate risk: reinforce education and plan outreach."
    else:
        recommendation = "Low risk: maintain prevention practices."
    st.session_state['session_log'].append(dict(Risk_Score=prob, Recommendation=recommendation, **profile_data))
    st.subheader("Prediction Output")
    st.metric("Malaria Risk", f"{prob:.2f}")
    st.write("Recommendation:", recommendation)

st.subheader("Session Prediction Log")
session_df = pd.DataFrame(st.session_state['session_log'])
st.dataframe(session_df)

if st.button("Download CSV Report"):
    session_df.to_csv("lumina_session_log.csv", index=False)
    st.success("CSV report saved.")

st.subheader("Top Model Features")
indices = np.argsort(importances)[::-1]
top_n = 12
fig, ax = plt.subplots(figsize=(8, 3))
ax.bar(np.array(feat_cols)[indices[:top_n]], importances[indices[:top_n]])
plt.xticks(rotation=45, ha='right', fontsize=9)
ax.set_title("Feature Importances")
st.pyplot(fig)
