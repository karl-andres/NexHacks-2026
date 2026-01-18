# ModelSense: AI-Powered 3D Generation

ModelSense is a comprehensive Next.js application that integrates real-time computer vision with the Microsoft TRELLIS text-to-3D model to generate, preview, and export 3D-printable models.

## Key Features

* **Real-time Vision Feed**: Captures visual input through a specialized interface to drive the 3D generation process.
* **TRELLIS 3D Inference**: Leverages the `trellis-text-xlarge` model for high-fidelity conversion from text descriptions to 3D assets.
* **Live 3D Preview**: Interactive inspection of generated models using a specialized 3D canvas powered by `@react-three/fiber` and `three.js`.
* **Multi-Format Export**: Generates physical-ready STL, GLB, and PLY files suitable for 3D printing and digital rendering.
* **Serverless GPU Infrastructure**: Optimized for A100-40GB GPUs with intelligent scaledown windows to manage costs while maintaining performance.

## 🛠️ Tech Stack

* **Frontend**: Next.js 15+ (App Router), React 19, Tailwind CSS, and Radix UI.
* **3D Rendering**: Three.js and `@react-three/fiber`.
* **Backend Inference**: Modal, Python, FastAPI, and Microsoft TRELLIS.
* **Development**: TypeScript, ESLint, and PostCSS.

## 📂 Project Structure

* `app/`: Contains the main application routes, including the primary dashboard and the STL generation API proxy.
* `backend/`: Modal-based Python scripts for model deployment and GPU inference.
* `components/`: Reusable UI components, including the 3D canvas and the vision feed controller.
* `lib/`: Core utilities and environment configuration.

## ⚙️ Setup Instructions

### 1. Backend Setup (Modal)
The backend requires a Modal account and the Modal CLI.

1.  **Install Modal CLI**:
    ```bash
    pip install modal
    modal token new
    ```
2.  **Download Model Weights** (Run once to cache the weights in a Volume):
    ```bash
    cd backend
    modal run trellis_modal.py::download_models
    ```
3.  **Deploy the API**:
    ```bash
    modal deploy trellis_modal.py
    ```
4.  Copy the resulting endpoint URL for the frontend configuration.

### 2. Frontend Setup
1.  **Configure Environment**:
    Create a `.env.local` file in the root directory and add your Modal endpoint:
    ```env
    STL_API_URL=[https://your-workspace--trellis-3d-generate-stl.modal.run](https://your-workspace--trellis-3d-generate-stl.modal.run)
    ```
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Run Development Server**:
    ```bash
    npm run dev
    ```
4.  Open [http://localhost:3000](http://localhost:3000) to access the ModelSense dashboard.

## 🧪 Usage

* **Capture**: Activate the vision feed to capture an object or scene.
* **Generate**: The system generates a descriptive prompt and triggers the TRELLIS pipeline.
* **Preview**: Rotate, zoom, and inspect the generated geometry in the live 3D canvas.
* **Export**: Download the model as an STL file for 3D printing.