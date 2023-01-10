call nssm.exe install mis_isgsMargin_Urs "%cd%\run_server.bat"
rem call nssm.exe edit mis_psp_scada
call nssm.exe set mis_isgsMargin_Urs AppStdout "%cd%\logs\mis_isgsMargin_Urs.log"
call nssm.exe set mis_isgsMargin_Urs AppStderr "%cd%\logs\mis_isgsMargin_Urs.log"
call sc start mis_isgsMargin_Urs