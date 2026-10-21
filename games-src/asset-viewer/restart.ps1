Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match 'serve\.py|workers_watch\.py' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
Start-Sleep 1
Start-Process 'C:\Miniforge3\python.exe' -ArgumentList 'viewer\serve.py' -WorkingDirectory 'C:\Users\kourisa\Desktop\TALON_assets' -WindowStyle Minimized
# the Workers page reads workers.json, which only this watchdog writes (it sat 66 h stale when nothing started it, 2026-10-20)
Start-Process 'C:\Miniforge3\python.exe' -ArgumentList 'viewer\workers_watch.py' -WorkingDirectory 'C:\Users\kourisa\Desktop\TALON_assets' -WindowStyle Minimized
'viewer + workers watchdog restarted: http://127.0.0.1:8765/workers.html'
