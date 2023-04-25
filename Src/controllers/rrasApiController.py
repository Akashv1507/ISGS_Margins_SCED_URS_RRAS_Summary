from flask import Blueprint, jsonify
from Src.appConfig import getAppConfig
import datetime as dt
import requests

isgsRrasApiController = Blueprint('isgsRrasApiController', __name__, template_folder='templates')

appconfig= getAppConfig()

@isgsRrasApiController.route('/api/getIsgsRras/<targetDate>')
def isgsRrasIndex(targetDate:str):
    targetDateTimeStamp= dt.datetime.strptime(targetDate, '%Y-%m-%d')
    targetDateStr= targetDateTimeStamp.strftime('%d-%m-%Y') 
    apiUsername = appconfig['wbesApiUser']
    apiPass= appconfig['wbesApiPass']
    isgsGenList= appconfig['isgsGenList']
    genRespObj = {}
    for isgsGen in isgsGenList: 
        rrasApiUrl = f'https://wbes.wrldc.in/WebAccess/GetFilteredSchdData?USER={apiUsername}&PASS={apiPass}&DATE={targetDateStr}&ACR={isgsGen}'
        try:
            resp = requests.get(rrasApiUrl)
            if not resp.status_code == 200:
                print(resp.status_code)
                print("unable to get data from wbes api")
                genRespObj[isgsGen]=[]
                continue
            respJson = resp.json()
            isgsGenRrasData = respJson["groupWiseDataList"][0]["netScheduleSummary"]["AS_SHORTFALL"].split(',')
            
            if (len(isgsGenRrasData)== 0) :
                genRespObj[isgsGen]=[]
            else:
                genDataList = []
                blkNo=1
                for rrasVal in isgsGenRrasData:
                    genDataList.append({'blkNo':blkNo, 'val':-1*float(rrasVal)})
                    blkNo= blkNo+1
                genRespObj[isgsGen] = genDataList
        except Exception as err:
            print(f'Error while making API call is {err}')
            genRespObj[isgsGen]=[]
            continue
    return jsonify(genRespObj)


    
    