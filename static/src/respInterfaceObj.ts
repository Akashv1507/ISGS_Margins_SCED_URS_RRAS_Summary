
export interface isgsValObj {
    blkNo: number;
    val: number;
  }

export interface apiRespObj {
    [isgsGenName: string]: isgsValObj[];
  }
 
export interface ursRespObj{
  gen:string;
  beneficiary:string;
  blockRange:string
  quantum:string
}

export interface ursRespObjList{
  ursSummary:ursRespObj[];
}

export interface plotDataPoints{
  x: number[];
  y: number[];
  type: string;
  name: string;
  hovertemplate: string;
}

export interface maxMargins{
  'traceName':string;
  'val':number;
  'pointInd':number;
}

export interface schVsEntRespObj{
  'EntOffBar': allGenData;
  'EntOnBar': allGenData;
  'ReqOffBar': allGenData;
  'ReqOnBar': allGenData;
  'ScheduleAmount':allGenData;
  'EntOffBar_Sum': number[];
  'EntOnBar_Sum': number[];
  'ReqOffBar_Sum': number[];
  'ReqOnBar_Sum': number[];
  'ScheduleAmount_Sum': number[]
  'Rev_No'?:number

}

export interface allGenData{
  [isgsGenName: string]: number[]
}

export interface schVsEntTblRow{
  'blkNo':number|string;
  'onBarEnt':number|string;
  'onBarReq':number|string;
  'sdlAmount':number|string;
  'diffSdlEnt':number|string;
  'diffSdlReq': number|string;
}
