from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import pandas as pd
from dotenv import load_dotenv
import os

load_dotenv()

# Load model and encoders
model = joblib.load('models/karinderya_sales_model.pkl')
day_encoder = joblib.load('models/day_encoder.pkl')
time_encoder = joblib.load('models/time_encoder.pkl')
dish_encoder = joblib.load('models/dish_encoder.pkl')

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL")],  # Or specify frontend domain: ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Input data model
class PredictRequest(BaseModel):
    day_of_week: str  # e.g., "Friday"
    time_of_day: str  # "AM" or "PM"
    is_weekend: bool
    total_sales: float  # e.g., 12.0

# Prediction endpoint
@app.post("/predict")
def predict_dish(request: PredictRequest):
    try:
        # Encode input
        day_encoded = day_encoder.transform([request.day_of_week])[0]
        time_encoded = time_encoder.transform([request.time_of_day])[0]

        # Prepare input as DataFrame with feature names
        input_data = pd.DataFrame(
            [[day_encoded, time_encoded, request.is_weekend, request.total_sales]],
            columns=['Day_of_Week_Encoded', 'Time_of_Day_Encoded', 'Is_Weekend', 'Total_Sales']
        )

        # Predict probabilities
        probabilities = model.predict_proba(input_data)[0]
        percentages = 100 * probabilities / np.sum(probabilities)

        # Decode dish labels
        dish_labels = dish_encoder.inverse_transform(np.arange(len(percentages)).reshape(-1, 1)).flatten()

        # Prepare result
        result = sorted(
            [{"dish": dish, "predicted_sales_percentage": round(percent, 2)}
             for dish, percent in zip(dish_labels, percentages)],
            key=lambda x: x['predicted_sales_percentage'],
            reverse=True
        )

        return {"predictions": result}

    except Exception as e:
        return {"error": str(e)}
