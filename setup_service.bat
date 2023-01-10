call nssm.exe install wrldc_isgsMargin_Urs "%cd%\server.exe"
rem call nssm.exe edit mis_psp_scada
call nssm.exe set wrldc_isgsMargin_Urs AppStdout "%cd%\logs\wrldc_isgsMargin_Urs.log"
call nssm.exe set wrldc_isgsMargin_Urs AppStderr "%cd%\logs\wrldc_isgsMargin_Urs.log"
call nssm set wrldc_isgsMargin_Urs AppRotateFiles 1
call nssm set wrldc_isgsMargin_Urs AppRotateOnline 1
call nssm set wrldc_isgsMargin_Urs AppRotateSeconds 86400
call nssm set wrldc_isgsMargin_Urs AppRotateBytes 1048576
call sc start wrldc_isgsMargin_Urs