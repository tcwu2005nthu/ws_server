:loop

start /B C:\Users\A30110\AppData\Local\Programs\Python\Python37\python.exe
@ping 127.0.0.1 -n 2 -w 1000 > nul
taskkill /f /im python.exe

goto loop