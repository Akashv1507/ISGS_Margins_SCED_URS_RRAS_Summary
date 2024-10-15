from flask import Flask, jsonify, render_template
from waitress import serve
from datetime import datetime as dt, timedelta
import warnings
from Src.appConfig import getAppConfig
from Src.controllers.new_marginApiController import isgsMarginApiController
from Src.controllers.new_scedApiController import isgsScedApiController
from Src.controllers.new_rrasApiController import isgsRrasApiController
from Src.controllers.ursSummaryApiController import ursSumaaryApiController
from Src.controllers.new_schVsEntApiController import schVsEntApiController
from Src.controllers.schVsEntOtherRegionApiController import schVsEntOtherRegionApiController
from Src.controllers.rooftopSolarController import rooftopSolarApiController
warnings.filterwarnings("ignore")

app = Flask(__name__)

# get application config
appConfig = getAppConfig()
app.config['SECRET_KEY'] = appConfig['flaskSecret']


app.register_blueprint(isgsMarginApiController)
app.register_blueprint(isgsScedApiController)
app.register_blueprint(isgsRrasApiController)
app.register_blueprint(ursSumaaryApiController)
app.register_blueprint(schVsEntApiController)
app.register_blueprint(schVsEntOtherRegionApiController)
app.register_blueprint(rooftopSolarApiController)

@app.route('/')
def index():
    return render_template('index.html.j2')

@app.route('/isgsMargins')
def isgsMarginsIndex():
    return render_template('IsgsMargins.html.j2')

@app.route('/isgsSced')
def isgsScedIndex():
    return render_template('IsgsSced.html.j2')

@app.route('/isgsRras')
def isgsRrasIndex():
    return render_template('IsgsRras.html.j2')

@app.route('/isgsUrs')
def isgsUrsIndex():
    return render_template('IsgsUrs.html.j2')

@app.route('/entitlementVsSch')
def entitlementVsSchIndex():
    return render_template('entitlementVsSchedule.html.j2')

@app.route('/rooftopSolar')
def rooftopSolar():
    return render_template('rooftopSolar.html.j2')


if __name__ == '__main__':
    serverMode: str = appConfig['mode']
    if serverMode.lower() == 'd':
        app.run(host="localhost", port=int(appConfig['flaskPort']), debug=True)
    else:
        # serve(app, host='0.0.0.0', port=int(appConfig['flaskPort']),  threads=1)
        serve(app, host='0.0.0.0', port=int(appConfig['flaskPort']), threads=4, channel_timeout=60)