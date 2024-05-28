from flask import Blueprint, jsonify
from Src.appConfig import getAppConfig
import datetime as dt
from Src.services.scadaApiFetcher import ScadaApiFetcher
import pandas as pd
import numpy as np


rooftopSolarApiController = Blueprint('rooftopSolarApiController', __name__, template_folder='templates')

appConfig= getAppConfig()
#creating object of ScadaApiFetcher class 
obj_scadaApiFetcher = ScadaApiFetcher(appConfig['tokenUrl'], appConfig['apiBaseUrl'], appConfig['clientId'], appConfig['clientSecret'])
roofTopSolarScadaPoint=appConfig['roofTopSolarScadaPoint']

@rooftopSolarApiController.route('/api/getRooftopSolarData/<startTimeStr>/<endTimeStr>')
def rooftopSolarApi(startTimeStr:str, endTimeStr:str ):

    roofTopSolarDataDf= pd.DataFrame()
    startTimeStamp= dt.datetime.strptime(startTimeStr, '%Y-%m-%dT%H:%M')
    endTimeStamp= dt.datetime.strptime(endTimeStr, '%Y-%m-%dT%H:%M')
    try:
        resData = obj_scadaApiFetcher.fetchData(roofTopSolarScadaPoint, startTimeStamp, endTimeStamp)
        roofTopSolarDataDf = pd.DataFrame(resData, columns =['timestamp','value']) 
        roofTopSolarDataDf = roofTopSolarDataDf.sort_values(by=['timestamp'])
        #filtering between startTIme and endtime only
        roofTopSolarDataDf = roofTopSolarDataDf[(roofTopSolarDataDf['timestamp'] >= startTimeStamp) & (roofTopSolarDataDf['timestamp'] <= endTimeStamp)]

        # filling nan where value is zero
        roofTopSolarDataDf.loc[roofTopSolarDataDf['value'] == 0,'value'] = np.nan

        # handling missing values NANs
        roofTopSolarDataDf['value'].fillna(method='ffill', inplace= True)
        roofTopSolarDataDf['value'].fillna(method='bfill', inplace= True)
    except Exception as err:
        print(f'Error while making API call is {err}')
        return []    
    
    roofTopSolarData = []
    for ind in roofTopSolarDataDf.index:
        tempList = {"timestamp":dt.datetime.strftime(roofTopSolarDataDf['timestamp'][ind],'%Y-%m-%d %H:%M:%S' ), "val":round(roofTopSolarDataDf['value'][ind], 2) }
        roofTopSolarData.append(tempList)
    return jsonify(roofTopSolarData)


    
    