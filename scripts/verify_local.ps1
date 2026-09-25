$ErrorActionPreference = 'Stop'
$env:PYTHONIOENCODING = 'utf-8'
python -m genvm_linter.cli check contracts\rule_delta.py
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
python -m genvm_linter.cli check contracts\federal_register_source_probe.py
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
python -m pytest -q -p no:cacheprovider
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Push-Location frontend
try { npm run build; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE } } finally { Pop-Location }
