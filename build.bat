pyinstaller server.py
xcopy /s /i /y "templates" "dist/server/templates"
xcopy /s /i /y "Secret" "dist/server/Secret"
xcopy /s /i /y "static/dist" "dist/server/static/dist"
xcopy /s /i /y "static/Css" "dist/server/static/Css"

xcopy /s /i /y "static/node_modules/bootstrap/dist" "dist/server/static/node_modules/bootstrap/dist"
xcopy /s /i /y "static/node_modules/plotly.js-dist" "dist/server/static/node_modules/plotly.js-dist"