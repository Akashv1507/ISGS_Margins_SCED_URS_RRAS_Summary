from flask import Blueprint, jsonify
from Src.appConfig import getAppConfig
import datetime as dt
import requests
from typing import List
import pandas as pd

schVsEntApiController = Blueprint('schVsEntApiController', __name__, template_folder='templates')

appconfig= getAppConfig()

@schVsEntApiController.route('/api/getSchVsEnt/<targetDate>/<stateAcr>/<genType>')
def schVsEntIndex(targetDate:str, stateAcr:str, genType:str): 

    genRespObj = {}
    fuelGenList = ""
    targetDateTimeStamp= dt.datetime.strptime(targetDate, '%Y-%m-%d')
    targetDateStr= targetDateTimeStamp.strftime('%d-%m-%Y')
    apiUsername = appconfig['wbesApiUser']
    apiPass= appconfig['wbesApiPass']
    if genType == 'gasGenList':
        fuelGenList= appconfig['gasGenList']
    elif genType =='thermalGenList':
        fuelGenList= appconfig['thermalGenList']

    apiUrl = f'https://wbes.wrldc.in/WebAccess/GetFilteredSchdData?USER={apiUsername}&PASS={apiPass}&DATE={targetDateStr}&ACR={stateAcr}'
    try:
        resp = requests.get(apiUrl)
        if not resp.status_code == 200:
            print(resp.status_code)
            print("unable to get data from wbes api")    
        respJson = resp.json()
        requistionDcData = respJson["groupWiseDataList"][0]["entReqList"]
        fullschdData = respJson["groupWiseDataList"][0]["fullschdList"]
        entOnBarData = getRespObj(requistionDcData, fuelGenList, 'EntOnBar')
        entOffBarData = getRespObj(requistionDcData, fuelGenList, 'EntOffBar')   
        reqOffBarData = getRespObj(requistionDcData, fuelGenList, 'ReqOffBar')  
        reqOnBarData = getRespObj(requistionDcData, fuelGenList, 'ReqOnBar')
        scheduleAmountData = getRespObj(fullschdData, fuelGenList, 'ScheduleAmount')
        genRespObj = {**entOnBarData, **entOffBarData, **reqOffBarData, **reqOnBarData, **scheduleAmountData}     
    except Exception as err:
        print(f'Error while making API call is {err}')
        genRespObj = {'EntOffBar': {}, 'EntOnBar': {}, 'ReqOffBar':{},'ReqOnBar':{}, 'ScheduleAmount':{}, 'EntOffBar_Sum': [], 'EntOnBar_Sum': [], 'ReqOffBar_Sum': [], 'ReqOnBar_Sum': [], 'ScheduleAmount_Sum': []}
        return jsonify(genRespObj)
        
    return jsonify(genRespObj)

def getRespObj(listData:List, fuelGenList:List, paramAcr:str = ''):

    allGenAccumulator = {}
    validBuyerAcrList = ['MSEB_Beneficiary', 'GEB_Beneficiary', 'MPSEB_Beneficiary', 'CSEB_Beneficiary']
    # filtering Null, None or non truthy values
    listData = list(filter(None, listData))
    # filtering data by fuel type
    filteredData = list(filter(lambda gen: (gen['SellerAcr'] in fuelGenList) and (gen['BuyerAcr'] in validBuyerAcrList), listData))  
    
    for genData in filteredData:
        sellerAcr = genData['SellerAcr']
        allGenAccumulator[sellerAcr] = list(map(lambda x: float(x), genData[paramAcr].split(",")))

    allGenDf = pd.DataFrame.from_dict(allGenAccumulator, orient ='index') 
    allGenDf = allGenDf.apply(pd.to_numeric, errors='coerce')
    allGenSum = list(allGenDf.sum(axis = 0, skipna = True))
    return {paramAcr: allGenAccumulator, f'{paramAcr}_Sum': allGenSum}
