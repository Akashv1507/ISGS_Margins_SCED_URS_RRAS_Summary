from flask import Blueprint, jsonify
from Src.appConfig import getAppConfig
import datetime as dt
import requests

isgsScedApiController = Blueprint('isgsScedApiController', __name__, template_folder='templates')

appconfig= getAppConfig()

@isgsScedApiController.route('/api/getIsgsSced/<targetDate>')
def isgsScedIndex(targetDate:str): 
    targetDateTimeStamp= dt.datetime.strptime(targetDate, '%Y-%m-%d')
    targetDateStr= targetDateTimeStamp.strftime('%d-%m-%Y')
    apiUsername = appconfig['wbesApiUser']
    apiPass= appconfig['wbesApiPass']
    isgsGenList= appconfig['isgsGenList']
    genRespObj = {}
    for isgsGen in isgsGenList: 
        ScedApiUrl = f'https://wbes.wrldc.in/WebAccess/GetFilteredSchdData?USER={apiUsername}&PASS={apiPass}&DATE={targetDateStr}&ACR={isgsGen}'
        try:
            resp = requests.get(ScedApiUrl)
            if not resp.status_code == 200:
                print(resp.status_code)
                print("unable to get data from wbes api")
                genRespObj[isgsGen]=[]
                continue
            respJson = resp.json()
            isgsGenScedData = respJson["groupWiseDataList"][0]["netScheduleSummary"]["SCED"].split(',')
            if (len(isgsGenScedData)== 0) :
                genRespObj[isgsGen]=[]
            else:
                genDataList = []
                blkNo=1
                for scedVal in isgsGenScedData:
                    genDataList.append({'blkNo':blkNo, 'val':-1*float(scedVal)})
                    blkNo= blkNo+1
                genRespObj[isgsGen] = genDataList
        except Exception as err:
            print(f'Error while making API call is {err}')
            genRespObj[isgsGen]=[]
            continue
    return jsonify(genRespObj)


    
    