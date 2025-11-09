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

profile_data = {}
profile_data['Household_Size'] = st.sidebar.number_input("Household Size", 1, 15, 4)
profile_data['Age'] = st.sidebar.number_input("Age", 0, 99, 18)
profile_data['Sex'] = {"Male": 0, "Female": 1}[st.sidebar.selectbox("Sex", ["Male", "Female"])]
profile_data['Pregnant'] = {"No": 0, "Yes": 1}[st.sidebar.selectbox("Pregnant", ["No", "Yes"])]
profile_data['Wealth_Index'] = st.sidebar.selectbox("Wealth Index (1=Poorest, 5=Richest)", [1,2,3,4,5])
profile_data['Bednet_Owned'] = {"No": 0, "Yes": 1}[st.sidebar.selectbox("Bednet Owned", ["No", "Yes"])]
profile_data['Bednet_Used'] = {"No": 0, "Yes": 1}[st.sidebar.selectbox("Bednet Used", ["No", "Yes"])]
profile_data['Malaria_Tested'] = {"No": 0, "Yes": 1}[st.sidebar.selectbox("Malaria Tested", ["No", "Yes"])]
profile_data['Recent_Fever'] = {"No": 0, "Yes": 1}[st.sidebar.selectbox("Recent Fever", ["No", "Yes"])]
profile_data['AntiMalaria_Meds'] = {"No": 0, "Yes": 1}[st.sidebar.selectbox("Anti-Malaria Meds", ["No", "Yes"])]
profile_data['Water_Access'] = {"No": 0, "Yes": 1}[st.sidebar.selectbox("Water Access", ["No", "Yes"])]
profile_data['Cluster'] = st.sidebar.selectbox("Cluster", list(range(101,130)))
profile_data['Climate_Score'] = st.sidebar.slider("Climate Score", 30, 100, 60)
profile_data['Month'] = st.sidebar.slider("Survey Month (5=May, ... 10=Oct)", 5, 10, 7)

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
    user_input = profile_data.copy()
    for col in feat_cols:
        if col not in user_input:
            user_input[col] = 0
    inp_df = pd.DataFrame([user_input])[feat_cols]
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
if hasattr(model, "feature_importances_"):
    importances = model.feature_importances_
elif hasattr(model, "base_estimator_") and hasattr(model.base_estimator_, "feature_importances_"):
    importances = model.base_estimator_.feature_importances_
else:
    importances = None

if importances is not None:
    indices = np.argsort(importances)[::-1]
    top_n = 12
    fig, ax = plt.subplots(figsize=(8, 3))
    ax.bar(np.array(feat_cols)[indices[:top_n]], importances[indices[:top_n]])
    plt.xticks(rotation=45, ha='right', fontsize=9)
    ax.set_title("Feature Importances")
    st.pyplot(fig)
else:
    st.info("Feature importances not available for this model type.")

import json
import plotly.express as px

with open('NGA_State_Boundaries_V2_-2781486175142980418.geojson', 'r') as f:
    nigeria_geo = json.load(f)

state_avg = pd.DataFrame({
    'State': ['Kano', 'Adamawa', 'Oyo', 'Lagos', 'Enugu', 'Borno', 'Kaduna', 'FCT', 'Benue', 'Rivers'],
    'Risk': [0.11, 0.10, 0.09, 0.085, 0.062, 0.058, 0.056, 0.04, 0.0, 0.0]
})

st.subheader("Malaria Risk by State: Nigeria Map")
fig = px.choropleth(
    state_avg,
    geojson=nigeria_geo,
    featureidkey="properties.statename",
    locations='State',
    color='Risk',
    color_continuous_scale='Reds',
    hover_name='State',
    projection='mercator'
)
fig.update_geos(fitbounds="locations", visible=False)
fig.update_layout(margin={"r":0,"t":30,"l":0,"b":0}, height=500)
st.plotly_chart(fig)
