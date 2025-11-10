import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertCircle, TrendingUp, Users, Activity, Download, Upload } from 'lucide-react';

const MalariaRiskDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedModel, setSelectedModel] = useState('random_forest');
  const [predictionInput, setPredictionInput] = useState({
    state: 'Lagos',
    zone: 'South-West',
    urban_rural: 'urban',
    household_size: 5,
    num_children_under5: 2,
    has_mosquito_nets: 1,
    net_usage_rate: 0.8,
    stagnant_water_nearby: 0,
    distance_to_health_facility_km: 5,
    avg_annual_rainfall_mm: 1500,
    avg_temperature_celsius: 28
  });
  const [prediction, setPrediction] = useState(null);

  const models = {
    random_forest: {
      name: 'Random Forest',
      accuracy: 0.89,
      precision: 0.87,
      recall: 0.91,
      f1_score: 0.89,
      auc_roc: 0.94
    },
    gradient_boosting: {
      name: 'Gradient Boosting',
      accuracy: 0.91,
      precision: 0.89,
      recall: 0.93,
      f1_score: 0.91,
      auc_roc: 0.95
    },
    neural_network: {
      name: 'Neural Network',
      accuracy: 0.88,
      precision: 0.86,
      recall: 0.90,
      f1_score: 0.88,
      auc_roc: 0.93
    }
  };

  const featureImportance = [
    { feature: 'Avg Rainfall', importance: 0.18 },
    { feature: 'Stagnant Water', importance: 0.15 },
    { feature: 'Net Usage Rate', importance: 0.14 },
    { feature: 'Temperature', importance: 0.12 },
    { feature: 'Children Under 5', importance: 0.11 },
    { feature: 'Distance to Facility', importance: 0.10 },
    { feature: 'Has Nets', importance: 0.09 },
    { feature: 'Urban Rural', importance: 0.07 },
    { feature: 'Household Size', importance: 0.04 }
  ];

  const regionalRisk = [
    { zone: 'S-South', avgRisk: 0.78, population: 45000 },
    { zone: 'S-East', avgRisk: 0.65, population: 38000 },
    { zone: 'S-West', avgRisk: 0.58, population: 52000 },
    { zone: 'N-East', avgRisk: 0.72, population: 42000 },
    { zone: 'N-West', avgRisk: 0.68, population: 48000 },
    { zone: 'N-Central', avgRisk: 0.62, population: 35000 }
  ];

  const riskTrends = [
    { month: 'Jan', risk: 0.45 },
    { month: 'Feb', risk: 0.48 },
    { month: 'Mar', risk: 0.52 },
    { month: 'Apr', risk: 0.58 },
    { month: 'May', risk: 0.65 },
    { month: 'Jun', risk: 0.72 },
    { month: 'Jul', risk: 0.78 },
    { month: 'Aug', risk: 0.75 },
    { month: 'Sep', risk: 0.68 },
    { month: 'Oct', risk: 0.60 },
    { month: 'Nov', risk: 0.52 },
    { month: 'Dec', risk: 0.48 }
  ];

  const riskDistribution = [
    { category: 'Low Risk', value: 25, color: '#10b981' },
    { category: 'Medium Risk', value: 35, color: '#f59e0b' },
    { category: 'High Risk', value: 28, color: '#ef4444' },
    { category: 'Critical Risk', value: 12, color: '#7f1d1d' }
  ];

  const makePrediction = async () => {
  // Map frontend model names to backend names
  const payload = {
    model:
      selectedModel === 'gradient_boosting'
        ? 'xgboost'
        : selectedModel === 'neural_network'
        ? 'neural_net'
        : 'random_forest',
    ...predictionInput,
  };

  // Send POST request to Flask backend
  const response = await fetch('http://localhost:5000/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    // Handle error (e.g., show an alert)
    alert('Prediction failed. Try again.');
    return;
  }

  const result = await response.json();

  setPrediction({
    riskScore: result.riskScore,
    riskLevel:
      result.riskScore < 0.3
        ? 'Low'
        : result.riskScore < 0.5
        ? 'Medium'
        : result.riskScore < 0.7
        ? 'High'
        : 'Critical',
    confidence: 0.90, // You can adjust this or set with backend if available
    recommendations: [], // Fill as before
  });
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <Activity className="text-red-500" />
                Nigeria Malaria Risk Prediction System
              </h1>
              <p className="text-gray-600 mt-2">AI-Powered Risk Assessment Dashboard</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => alert('Upload CSV data')} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                <Upload size={18} />
                Upload
              </button>
              <button onClick={() => alert('Download report')} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
                <Download size={18} />
                Export
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="flex flex-wrap border-b">
            {['overview', 'prediction', 'analytics', 'models'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 min-w-[100px] px-6 py-4 text-center font-semibold transition ${
                  activeTab === tab ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Households</p>
                    <p className="text-3xl font-bold text-gray-800">2,000</p>
                  </div>
                  <Users className="text-blue-500" size={40} />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Avg Risk Score</p>
                    <p className="text-3xl font-bold text-orange-500">0.65</p>
                  </div>
                  <TrendingUp className="text-orange-500" size={40} />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">High Risk Areas</p>
                    <p className="text-3xl font-bold text-red-500">28%</p>
                  </div>
                  <AlertCircle className="text-red-500" size={40} />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Model Accuracy</p>
                    <p className="text-3xl font-bold text-green-500">91%</p>
                  </div>
                  <Activity className="text-green-500" size={40} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Regional Risk Assessment</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={regionalRisk}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="zone" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="avgRisk" fill="#ef4444" name="Avg Risk Score" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Risk Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={riskDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.category}: ${entry.value}%`}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {riskDistribution.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Monthly Risk Trends 2021</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={riskTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="risk" stroke="#ef4444" strokeWidth={3} name="Risk Score" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'prediction' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Household Risk Assessment</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <select
                      value={predictionInput.state}
                      onChange={(e) => setPredictionInput({...predictionInput, state: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option>Lagos</option>
                      <option>Kano</option>
                      <option>Rivers</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Zone</label>
                    <select
                      value={predictionInput.zone}
                      onChange={(e) => setPredictionInput({...predictionInput, zone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option>South-West</option>
                      <option>South-East</option>
                      <option>North-West</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Urban Rural</label>
                    <select
                      value={predictionInput.urban_rural}
                      onChange={(e) => setPredictionInput({...predictionInput, urban_rural: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="urban">Urban</option>
                      <option value="rural">Rural</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Household Size</label>
                    <input
                      type="number"
                      value={predictionInput.household_size}
                      onChange={(e) => setPredictionInput({...predictionInput, household_size: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Children Under 5</label>
                    <input
                      type="number"
                      value={predictionInput.num_children_under5}
                      onChange={(e) => setPredictionInput({...predictionInput, num_children_under5: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Net Usage Rate 0 to 1</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={predictionInput.net_usage_rate}
                      onChange={(e) => setPredictionInput({...predictionInput, net_usage_rate: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stagnant Water Nearby</label>
                    <select
                      value={predictionInput.stagnant_water_nearby}
                      onChange={(e) => setPredictionInput({...predictionInput, stagnant_water_nearby: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value={0}>No</option>
                      <option value={1}>Yes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Distance to Facility km</label>
                    <input
                      type="number"
                      value={predictionInput.distance_to_health_facility_km}
                      onChange={(e) => setPredictionInput({...predictionInput, distance_to_health_facility_km: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Avg Rainfall mm</label>
                    <input
                      type="number"
                      value={predictionInput.avg_annual_rainfall_mm}
                      onChange={(e) => setPredictionInput({...predictionInput, avg_annual_rainfall_mm: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Avg Temperature C</label>
                    <input
                      type="number"
                      value={predictionInput.avg_temperature_celsius}
                      onChange={(e) => setPredictionInput({...predictionInput, avg_temperature_celsius: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <button
                    onClick={makePrediction}
                    className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
                  >
                    Predict Risk Score
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {prediction ? (
                  <>
                    <div className="bg-white rounded-lg shadow-lg p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">Risk Assessment Results</h3>
                      
                      <div className="space-y-4">
                        <div className="text-center p-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-2">Predicted Risk Score</p>
                          <p className="text-5xl font-bold text-red-600">{prediction.riskScore}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-gray-600">Risk Level</p>
                            <p className={`text-2xl font-bold ${
                              prediction.riskLevel === 'Low' ? 'text-green-600' :
                              prediction.riskLevel === 'Medium' ? 'text-yellow-600' :
                              prediction.riskLevel === 'High' ? 'text-orange-600' :
                              'text-red-600'
                            }`}>{prediction.riskLevel}</p>
                          </div>
                          <div className="p-4 bg-green-50 rounded-lg">
                            <p className="text-sm text-gray-600">Confidence</p>
                            <p className="text-2xl font-bold text-green-600">{(prediction.confidence * 100).toFixed(0)}%</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">Recommended Interventions</h3>
                      <ul className="space-y-3">
                        {prediction.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                            <AlertCircle className="text-blue-500 mt-1 flex-shrink-0" size={20} />
                            <span className="text-gray-700">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                ) : (
                  <div className="bg-white rounded-lg shadow-lg p-6 h-full flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <Activity size={64} className="mx-auto mb-4" />
                      <p>Enter household data and predict</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Feature Importance Analysis</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={featureImportance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="feature" type="category" width={150} />
                  <Tooltip />
                  <Bar dataKey="importance" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Risk by Population</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="population" />
                    <YAxis dataKey="avgRisk" />
                    <Tooltip />
                    <Scatter data={regionalRisk} fill="#ef4444" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Key Insights</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-red-50 rounded-lg">
                    <p className="font-semibold text-red-800">High Risk Factors</p>
                    <p className="text-sm text-gray-700 mt-1">Rainfall and stagnant water strongest predictors</p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <p className="font-semibold text-yellow-800">Seasonal Patterns</p>
                    <p className="text-sm text-gray-700 mt-1">Peak risk during rainy season</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="font-semibold text-green-800">Intervention Impact</p>
                    <p className="text-sm text-gray-700 mt-1">High net usage reduces risk by 35 percent</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'models' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Model Performance</h3>
              
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full md:w-1/2 px-4 py-3 border rounded-lg mb-6"
              >
                <option value="random_forest">Random Forest</option>
                <option value="gradient_boosting">Gradient Boosting</option>
                <option value="neural_network">Neural Network</option>
              </select>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(models[selectedModel]).map(([key, value]) => {
                  if (key === 'name') return null;
                  return (
                    <div key={key} className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-xs text-gray-600 uppercase">{key.replace(/_/g, ' ')}</p>
                      <p className="text-2xl font-bold text-blue-600">{(value * 100).toFixed(1)}%</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MalariaRiskDashboard;