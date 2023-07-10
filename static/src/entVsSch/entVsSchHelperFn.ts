import {schVsEntRespObj, schVsEntTblRow, isgsValObj} from "../respInterfaceObj"

export const getTblRows= (schVsEntRespObj:schVsEntRespObj):schVsEntTblRow[]=>{
    

    let schVsEntTblRows: schVsEntTblRow[]= []

    if(schVsEntRespObj['EntOnBar_Sum'].length===0 ||schVsEntRespObj['ReqOnBar_Sum'].length==0||schVsEntRespObj['ScheduleAmount_Sum'].length==0)
    {
      schVsEntTblRows.push({'blkNo':"No Data Found", 'onBarEnt':"No Data Found", 
        'onBarReq':"No Data Found", 'sdlAmount':"No Data Found", 'diffSdlEnt': "No Data Found", 'diffSdlReq':"No Data Found"})
      return schVsEntTblRows
    }

    for (let i = 0; i <= 95; i++) {

      const onBarEntVal = Math.round(schVsEntRespObj['EntOnBar_Sum'][i])
      const onBarReqVal = Math.round(schVsEntRespObj['ReqOnBar_Sum'][i])
      const sdlVal = Math.round(schVsEntRespObj['ScheduleAmount_Sum'][i])
      const diffSdlEntVal = sdlVal-onBarEntVal
      const diffSdlReqVal = sdlVal-onBarReqVal
  
      schVsEntTblRows.push({'blkNo':i+1, 'onBarEnt':onBarEntVal, 'onBarReq': onBarReqVal, 'sdlAmount':sdlVal, 'diffSdlEnt':diffSdlEntVal, 'diffSdlReq': diffSdlReqVal})
      }
    
    return schVsEntTblRows
}

export const getPlotData= (entityList:number[]):isgsValObj[]=>{
    
                                
  let entityPlotData: isgsValObj[]= []
  if (entityList.length !=96){
    return entityPlotData
  }
 
  for (let i = 0; i <= 95; i++) {
    
      entityPlotData.push({'blkNo':i+1, 'val' :entityList[i]})
   
  }
  return entityPlotData
}

export const getStateNameFromAcr= (stateAcr:string):string=>{
  let stateName = ""
  
  if (stateAcr ==="MSEB_State"){
    stateName = "MH"
   
  }else if (stateAcr ==="GEB_State") {
    stateName = "Guj"
    
  } else if (stateAcr ==="MP_State")  {
    stateName = "MP"
    
  } else if (stateAcr ==="CSEB_State"){
    stateName = "Chatt"

  }

  return stateName
 
  
}