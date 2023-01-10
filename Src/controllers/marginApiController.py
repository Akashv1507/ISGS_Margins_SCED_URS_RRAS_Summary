from flask import Blueprint, jsonify
from Src.appConfig import getAppConfig
import datetime as dt
import requests

isgsMarginApiController = Blueprint('isgsMarginApiController', __name__, template_folder='templates')

appconfig= getAppConfig()

@isgsMarginApiController.route('/api/getIsgsMargins/<targetDate>')
def isgsMarginsApi(targetDate:str):
    targetDateTimeStamp= dt.datetime.strptime(targetDate, '%Y-%m-%d')
    targetDateStr= targetDateTimeStamp.strftime('%d-%m-%Y')
    apiUsername = appconfig['wbesApiUser']
    apiPass= appconfig['wbesApiPass']
    isgsGenList= appconfig['isgsGenList']
    genRespObj = {}
    for isgsGen in isgsGenList: 
        marginApiUrl = f'https://wbes.wrldc.in/WebAccess/GetFilteredSchdData?USER={apiUsername}&PASS={apiPass}&DATE={targetDateStr}&ACR={isgsGen}'
        try:
            resp = requests.get(marginApiUrl)
            if not resp.status_code == 200:
                print(resp.status_code)
                print("unable to get data from wbes api")
                genRespObj[isgsGen]=[]
                continue
            respJson = resp.json()
            isgsGenSdlData = respJson["groupWiseDataList"][0]["netScheduleSummary"]["NET_Total"].split(',')
            isgsGenOnBarDcData = respJson["decList"][0]["DCOnBarForSchd"].split(',')
            if (len(isgsGenSdlData)== 0) or (len(isgsGenOnBarDcData) == 0):
                genRespObj[isgsGen]=[]
            else:
                genDataList = []
                blkNo=1
                for sdlVal, onBarDcVal in zip(isgsGenSdlData,isgsGenOnBarDcData):
                    genDataList.append({'blkNo':blkNo, 'val':float(onBarDcVal)- (-1*(float(sdlVal)))})
                    blkNo= blkNo+1
                genRespObj[isgsGen] = genDataList
        except Exception as err:
            print(f'Error while making API call is {err}')
            genRespObj[isgsGen]=[]
            continue
    return jsonify(genRespObj)


    
    