Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match 'serve\.py' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
Start-Sleep 1
Start-Process 'C:\Miniforge3\python.exe' -ArgumentList 'viewer\serve.py' -WorkingDirectory 'C:\Users\kourisa\Desktop\game-assets' -WindowStyle Minimized
'viewer restarted: http://127.0.0.1:8765/assets.html'
