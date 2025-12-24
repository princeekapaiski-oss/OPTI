
Write-Host "Creating virtual environment..."
python -m venv venv
./venv/Scripts/Activate.ps1

Write-Host "Installing dependencies..."
pip install --upgrade pip
pip install -r backend/requirements.txt

Write-Host "Starting backend..."
python backend/app.py
