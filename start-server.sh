cd server && source venv/bin/activate;
# USE_HTTPS=1
uvicorn app.main:app --reload;