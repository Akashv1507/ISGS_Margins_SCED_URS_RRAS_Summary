pyinstaller server.py 





xcopy /s /i /y "Secret" "dist/server/Secret"

xcopy /s /i /y "templates" "dist/server/_internal/templates"
xcopy /s /i /y "static/dist" "dist/server/_internal/static/dist"
xcopy /s /i /y "static/Css" "dist/server/_internal/static/Css"

xcopy /s /i /y "static/node_modules/bootstrap/dist" "dist/server/_internal/static/node_modules/bootstrap/dist"
xcopy /s /i /y "static/node_modules/plotly.js-dist" "dist/server/_internal/static/node_modules/plotly.js-dist"
xcopy /s /i /y "static/node_modules/datatables.net-bs4" "dist/server/_internal/static/node_modules/datatables.net-bs4"
xcopy /s /i /y "static/node_modules/datatables.net-dt" "dist/server/_internal/static/node_modules/datatables.net-dt"
xcopy /s /i /y "static/node_modules/datatables.net" "dist/server/_internal/static/node_modules/datatables.net"
xcopy /s /i /y "static/node_modules/jquery" "dist/server/_internal/static/node_modules/jquery"
xcopy /s /i /y "static/node_modules/datatables.net-buttons" "dist/server/_internal/static/node_modules/datatables.net-buttons"
xcopy /s /i /y "static/node_modules/jszip" "dist/server/_internal/static/node_modules/jszip"
xcopy /s /i /y "static/node_modules/pdfmake" "dist/server/_internal/static/node_modules/pdfmake"