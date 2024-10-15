from flask import Blueprint, jsonify
from Src.appConfig import getAppConfig
import datetime as dt
import requests
from typing import List
import pandas as pd

schVsEntOtherRegionApiController = Blueprint('schVsEntOtherRegionApiController', __name__, template_folder='templates')

appconfig= getAppConfig()

@schVsEntOtherRegionApiController.route('/api/getSchVsEntOtherRegion/<targetDate>/<stateAcr>/<genType>')
def schVsEntIndex(targetDate:str, stateAcr:str, genType:str): 
    if genType == "thermalGenList":
        genRespObj = {}
        allGenRegionSchdData=[]
        allGenRegionEntReqData=[]
        targetDateTimeStamp= dt.datetime.strptime(targetDate, '%Y-%m-%d')
        targetDateStr= targetDateTimeStamp.strftime('%d-%m-%Y')
        stateGenList = appconfig[stateAcr]

        for gen in stateGenList:
            genName = gen['genName']
            regionApiName =gen['api']
            apiConfigUrl = appconfig[regionApiName]
            beneficiaryName = gen['beneficiaryName']
            apiUrl = apiConfigUrl.format(targetDateStr, stateAcr)

            try:
                resp = requests.get(apiUrl)
                if not resp.status_code == 200:
                    print(resp.status_code)
                    print("unable to get data from wbes api")    
                respJson = resp.json()
                fullEntReqData = respJson["groupWiseDataList"][0]["entReqList"]
                fullSchdData = respJson["groupWiseDataList"][0]["fullschdList"]
                # filtering Null, None or non truthy values
                fullEntReqData = list(filter(None, fullEntReqData))
                fullSchdData = list(filter(None, fullSchdData))

                genEntReqData=list(filter(lambda gen: (gen['SellerAcr'] == genName) and (gen['BuyerAcr'] == beneficiaryName), fullEntReqData))
                genSchdData= list(filter(lambda gen: (gen['SellerAcr'] == genName) and (gen['BuyerAcr'] == beneficiaryName) and (gen['ScheduleTypeName'] =='ISGS'), fullSchdData))
                if(len(genEntReqData)==1 and len(genSchdData)==1):
                    allGenRegionEntReqData.append(genEntReqData[0])
                    allGenRegionSchdData.append(genSchdData[0])
            except Exception as err:
                print(f'Error while making API call is {err}')   
        try:           
            entOnBarData = getRespObj(allGenRegionEntReqData, 'EntOnBar')
            entOffBarData = getRespObj(allGenRegionEntReqData, 'EntOffBar')   
            reqOffBarData = getRespObj(allGenRegionEntReqData, 'ReqOffBar')  
            reqOnBarData = getRespObj(allGenRegionEntReqData, 'ReqOnBar')
            scheduleAmountData = getRespObj(allGenRegionSchdData, 'ScheduleAmount')
            genRespObj = {**entOnBarData, **entOffBarData, **reqOffBarData, **reqOnBarData, **scheduleAmountData}     
        except Exception as err:
            print(f'Error while generating resp obj is {err}')
            genRespObj = {'EntOffBar': {}, 'EntOnBar': {}, 'ReqOffBar':{},'ReqOnBar':{}, 'ScheduleAmount':{}, 'EntOffBar_Sum': [], 'EntOnBar_Sum': [], 'ReqOffBar_Sum': [], 'ReqOnBar_Sum': [], 'ScheduleAmount_Sum': []}
            return jsonify(genRespObj)
            
        return jsonify(genRespObj)
    else:
        genRespObj = {'EntOffBar': {}, 'EntOnBar': {}, 'ReqOffBar':{},'ReqOnBar':{}, 'ScheduleAmount':{}, 'EntOffBar_Sum': [], 'EntOnBar_Sum': [], 'ReqOffBar_Sum': [], 'ReqOnBar_Sum': [], 'ScheduleAmount_Sum': []}
        return jsonify(genRespObj)


def getRespObj(listData:List, paramAcr:str = ''):

    allGenAccumulator = {}
     
    for genData in listData:
        sellerAcr = genData['SellerAcr']
        allGenAccumulator[sellerAcr] = list(map(lambda x: float(x), genData[paramAcr].split(",")))

    allGenDf = pd.DataFrame.from_dict(allGenAccumulator, orient ='index') 
    allGenDf = allGenDf.apply(pd.to_numeric, errors='coerce')
    allGenSum = list(allGenDf.sum(axis = 0, skipna = True))
    return {paramAcr: allGenAccumulator, f'{paramAcr}_Sum': allGenSum}
