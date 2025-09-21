# Here are your Instructions
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install fastapi uvicorn motor pymongo python-dotenv requests python-multipart pydantic 

# backend/.env
MONGO_URL=mongodb://localhost:27017
DB_NAME=pearl_ecommerce

# jalankan backend
cd backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload

# Install Node.js dari nodejs.org (versi LTS)
# Install Expo CLI globally
npm install -g @expo/cli

cd frontend
npm install
# atau
yarn install
