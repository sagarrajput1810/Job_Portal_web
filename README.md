# Job_Portal_web

.env
MONGO_URI=mongouri
PORT = 8000
SECRET_KEY = wsgrsrgsdgfsraefswefd
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_ATS_MODEL=phi4:mini



Install Ollama

Windows/macOS: download from https://ollama.com/download and follow the installer.
Linux: curl -fsSL https://ollama.com/install.sh | sh

Start the Ollama service

Open a new terminal and run ollama serve (Linux) or launch the Ollama app (macOS/Windows). Leave it running so it listens on http://localhost:11434.


ollama run phi4-mini


Restart your backend (cd backend && npm run dev) so it sees the running server.