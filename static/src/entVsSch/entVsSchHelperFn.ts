import {schVsEntRespObj, schVsEntTblRow, isgsValObj} from "../respInterfaceObj"

export const getTblRows= (schVsEntRespObj:schVsEntRespObj):schVsEntTblRow[]=>{
    

    let schVsEntTblRows: schVsEntTblRow[]= []

    if(schVsEntRespObj['EntOnBar_Sum'].length===0 ||schVsEntRespObj['ReqOnBar_Sum'].length==0||schVsEntRespObj['ScheduleAmount_Sum'].length==0)
    {
      schVsEntTblRows.push({'blkNo':"No Data Found", 'onBarEnt':"No Data Found", 
        'onBarReq':"No Data Found", 'sdlAmount':"No Data Found"})
      return schVsEntTblRows
    }

    for (let i = 0; i <= 95; i++) {
        
        schVsEntTblRows.push({'blkNo':i+1, 'onBarEnt':Math.round(schVsEntRespObj['EntOnBar_Sum'][i]), 
        'onBarReq':Math.round(schVsEntRespObj['ReqOnBar_Sum'][i]), 'sdlAmount':Math.round(schVsEntRespObj['ScheduleAmount_Sum'][i])
    })
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