# LabLoop - Interactive ML Experiment Dashboard

LabLoop is a futuristic web application designed to help data scientists and researchers simulate and visualize machine learning experiments. Powered by **Google's Gemini 3** model, it takes a high-level user goal and automatically generates a comparative study of suitable ML models, simulates their training and evaluation, and presents a final recommendation.

## Features

-   **Intelligent Experiment Planning**: Describe your ML goal in natural language, and the AI agents will architect a complete comparison study.
-   **Real-time Simulation**: Watch as the dashboard simulates the training pipeline, complete with live logs and status updates for each model.
-   **Comparative Analysis**: View side-by-side benchmarks of Accuracy, Latency, and Model Size to make data-driven decisions.
-   **Gemini 3 Powered**: Utilizes the latest `gemini-3-pro-preview` model for deep reasoning and realistic metric simulation.

## Tech Stack

-   **Frontend**: React 19, TypeScript
-   **Styling**: Tailwind CSS
-   **AI Integration**: Google GenAI SDK (`@google/genai`)
-   **Icons**: Lucide React

## Getting Started

1.  **Clone the repository**

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Ensure you have a valid Google Gemini API key. This application expects the key to be available in the environment as `API_KEY`.

4.  **Run the application**
    ```bash
    npm start
    ```

## Usage

1.  Enter a machine learning goal (e.g., "Detect credit card fraud with high precision").
2.  Click **Run**.
3.  Wait for the AI to generate an Experiment Plan.
4.  Watch the **Live Execution** as models are "trained" and "evaluated".
5.  Review the **Final Results** to see the recommended model and detailed metrics.