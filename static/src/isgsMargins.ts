import {PlotData, PlotTrace, setPlotTraces } from './plotUtils'
import {getIsgsMarginsData} from './fetchApiData'
import {apiRespObj, isgsValObj, plotDataPoints}  from './respInterfaceObj'
import { getLastUpdatedTimeStr} from './timeUtils'



let intervalID = null

window.onload = async () => {
    const today = ( d => new Date(d.setDate(d.getDate())) )(new Date).toISOString().slice(0,10);
    //setting targetdate to today
    (document.getElementById("targetDate") as HTMLInputElement).value= today;
    const periodicity = +(document.getElementById('periodicity') as HTMLInputElement).value
    intervalID = setInterval(refreshData , periodicity*60*1000);
    (document.getElementById('submitBtn') as HTMLButtonElement ).onclick = fetchData;
    refreshData()
}

//  fetch data and plot on button click
const fetchData = async()=>{
    let targetDateValue = (
        document.getElementById("targetDate") as HTMLInputElement
    ).value;
    plotData(targetDateValue)
}

const refreshData = async () =>{
    const today = ( d => new Date(d.setDate(d.getDate())) )(new Date).toISOString().slice(0,10);
    //setting targetdate to today
    (document.getElementById("targetDate") as HTMLInputElement).value= today;
    //get user inputs
    let targetDateValue = (
        document.getElementById("targetDate") as HTMLInputElement
    ).value;
    plotData(targetDateValue)
 };

const plotData = async (targetDateValue:string)=>{
    //to display error msg
    const errorDiv = document.getElementById("errorDiv") as HTMLDivElement;
    const plotDiv = document.getElementById("plotDiv") as any;
    const reserveInfoDiv = document.getElementById("reserveInfoDiv") as HTMLDivElement;
    const submitBtn = document.getElementById('submitBtn') as HTMLButtonElement;
    const lastUpdatedDiv = document.getElementById('lastUpdatedDiv') as HTMLButtonElement;
    // making submit button disabled till api call fetches data
    submitBtn.classList.add("button", "disabled")
    const lastUpdatedStr = getLastUpdatedTimeStr()
    lastUpdatedDiv.innerHTML = `Last Updated On ${lastUpdatedStr}`
    //validation checks, and displaying msg in error div
    if (targetDateValue === "" ) {
        errorDiv.classList.add("mt-4", "mb-4", "alert", "alert-danger")
        errorDiv.innerHTML = "<b> Please Enter a Valid Date</b>";
        submitBtn.classList.remove("button", "disabled");
    } else {
        //if reached this ,means no validation error ,emptying error div and making start date and end date in desired format
        errorDiv.classList.remove("mt-4", "mb-4", "alert", "alert-danger")
        errorDiv.innerHTML = "";
        try {
                let isgsMarginData:apiRespObj  = await getIsgsMarginsData(
                    targetDateValue
                );  
                if (isgsMarginData==null)   {
                   errorDiv.classList.add("mt-4", "mb-4", "alert", "alert-danger")
                   errorDiv.innerHTML = "<b>Oops !!! Data Fetch Unsuccessful For Selected Date. Please Try Again</b>" 
                }

                let isgsMarginPlotData: PlotData = {
                    title: `ISGS Margin ${targetDateValue.substring(0,10)}`,
                    traces: [],
                    yAxisTitle: "--MW--",
                };
                for (const prop in isgsMarginData) {
                   let singleGenMarginTrace: PlotTrace = {
                       name: `${prop}`,
                       data: isgsMarginData[prop],
                       type: "scatter",
                       hoverYaxisDisplay: "MW", 
                    //    fill: 'tonexty',
                       stackgroup: 'one'
                   };
                   isgsMarginPlotData.traces.push(singleGenMarginTrace);
                 } 
                 //line plot for sum Margins
                const allGenList =Object.keys(isgsMarginData)
                let allGenSumMargins:isgsValObj[] = []
                for (let blkInd=0; blkInd<96; blkInd++){
                    let sumMarginsForBlk= 0
                    for (let genInd=0; genInd<allGenList.length; genInd++){
                        const genName = allGenList[genInd]
                        // console.log(isgsScedData[genName][blkInd]['val'])
                        try{
                            const marginsVal=isgsMarginData[genName][blkInd]['val']
                            sumMarginsForBlk= sumMarginsForBlk + marginsVal
                        }
                        catch(err){
                            continue
                        }
                    }
                allGenSumMargins.push({'blkNo':blkInd+1, 'val':sumMarginsForBlk})
                }
                
                let sumScedTrace: PlotTrace = {
                    name: `Sum Margins`,
                    data: allGenSumMargins,
                    type: "lines",
                    line: {
                        width: 7,
                        color: "#ed6409",
                    },
                    hoverYaxisDisplay: "MW",     
                };
                isgsMarginPlotData.traces.push(sumScedTrace);
                //setting plot traces
                setPlotTraces(
                    `plotDiv`,
                    isgsMarginPlotData
                );  
                
                plotDiv.on('plotly_hover', function (data) {
                    reserveInfoDiv.innerHTML=""
                    if (data.points.length > 0) {
                        const pointIndex1:number = data.points[0]['pointNumber'];//current block
                        const plotDataValues = [];
                        let sumMargins ={}
                        //discarding sum margins tace values for calculating top 3 margins
                        for (var i =0 ; i < plotDiv.data.length ; i++) {
                            if(plotDiv.data[i]['name']!='Sum Margins'){
                                plotDataValues.push(plotDiv.data[i])
                            }
                            else{
                                sumMargins= plotDiv.data[i]
                            }
                        }
                        const pointIndex2= pointIndex1+1//current+1 Block
                        const pointIndex3= pointIndex1+2//current+2 Block
                        const pointIndex4= pointIndex1+3//current+3 Block
                        const point1SumMargins:number= sumMargins['y'][pointIndex1]
                        const point2SumMargins:number= sumMargins['y'][pointIndex2]
                        const point3SumMargins:number= sumMargins['y'][pointIndex3]
                        const point4SumMargins:number= sumMargins['y'][pointIndex4]
                        const point1MarginsDetails = getTop3Margins(pointIndex1, plotDataValues)
                        const point2MarginsDetails = getTop3Margins(pointIndex2, plotDataValues)
                        const point3MarginsDetails = getTop3Margins(pointIndex3, plotDataValues)
                        const point4MarginsDetails = getTop3Margins(pointIndex4, plotDataValues)
                        const tableData = [{'sumMargin':point1SumMargins, 'marginDetails':point1MarginsDetails},
                        {'sumMargin':point2SumMargins, 'marginDetails':point2MarginsDetails},
                        {'sumMargin':point3SumMargins, 'marginDetails':point3MarginsDetails},
                        {'sumMargin':point4SumMargins, 'marginDetails':point4MarginsDetails}]
                        // creating tablee and appending rows
                        let marginsSummaryTbl = document.createElement('table');
                        marginsSummaryTbl.className="table_class"
                        const orderArrayHeader = ["BLK No", "Sum Margins", "First Highest", "Second Highest", "Third Highest"];
                        const thead = document.createElement('thead');
                        marginsSummaryTbl.appendChild(thead);
                        for (var i=0; i<orderArrayHeader.length; i++) {
                        thead.appendChild(document.createElement("th")).
                                appendChild(document.createTextNode(orderArrayHeader[i]));
                        }
                        for (let row =0; row<tableData.length; row++){
                            let tr = document.createElement('tr');   

                            let td1 = document.createElement('td');
                            let td2 = document.createElement('td');
                            let td3 = document.createElement('td');
                            let td4 = document.createElement('td');
                            let td5 = document.createElement('td');
                            let text1 = document.createTextNode(`Blk-${tableData[row]['marginDetails'].maxVal1.pointInd +1}`);
                            let text2 = document.createTextNode(`Sum->${Math.round(tableData[row].sumMargin)}`);
                            let text3 = document.createTextNode(`${tableData[row]['marginDetails'].maxVal1.traceName}->${Math.round(tableData[row]['marginDetails'].maxVal1.val)}`);
                            let text4 = document.createTextNode(`${tableData[row]['marginDetails'].maxVal2.traceName}->${Math.round(tableData[row]['marginDetails'].maxVal2.val)}`);
                            let text5 = document.createTextNode(`${tableData[row]['marginDetails'].maxVal3.traceName}->${Math.round(tableData[row]['marginDetails'].maxVal3.val)}`);
                            
                            td1.appendChild(text1);
                            td2.appendChild(text2);
                            td3.appendChild(text3);
                            td4.appendChild(text4);
                            td5.appendChild(text5);
                            tr.appendChild(td1);
                            tr.appendChild(td2);
                            tr.appendChild(td3);
                            tr.appendChild(td4);
                            tr.appendChild(td5);
                        
                            marginsSummaryTbl.appendChild(tr);
                        }      
                        reserveInfoDiv.appendChild(marginsSummaryTbl);
                       
                    }
                })
                submitBtn.classList.remove("button", "disabled");          
        }
        catch (err) {
           errorDiv.classList.add("mt-4", "mb-4", "alert", "alert-danger")
           errorDiv.innerHTML = "<b>Oops !!! Data Fetch Unsuccessful For Selected Date. Please Try Again</b>"     
           submitBtn.classList.remove("button", "disabled");    
        }
    }

 }

const getTop3Margins = (pointInd:number, plotDataValues:plotDataPoints[] )=>{
    let maxVal1 = {'traceName':"", 'val':Number.NEGATIVE_INFINITY,'pointInd':pointInd}
    let maxVal2 = {'traceName':"", 'val':Number.NEGATIVE_INFINITY,'pointInd':pointInd}
    let maxVal3 = {'traceName':"", 'val':Number.NEGATIVE_INFINITY,'pointInd':pointInd}
    for (var i =0 ; i < plotDataValues.length ; i++) {
        // console.log(maxVal1)
        // console.log(maxVal2)
        // console.log(maxVal3)
        if (plotDataValues[i]['y'][pointInd] > maxVal1['val']){
            maxVal3['traceName']= maxVal2['traceName']
            maxVal3['val']= maxVal2['val']
            maxVal2['traceName']= maxVal1['traceName']
            maxVal2['val']= maxVal1['val']
            maxVal1['traceName']= plotDataValues[i]['name']
            maxVal1['val']= plotDataValues[i]['y'][pointInd]
            
        }
        else if(plotDataValues[i]['y'][pointInd] > maxVal2['val'] ){
            maxVal3['traceName']= maxVal2['traceName']
            maxVal3['val']= maxVal2['val']
            maxVal2['traceName']= plotDataValues[i]['name']
            maxVal2['val']= plotDataValues[i]['y'][pointInd]
        }
        else if (plotDataValues[i]['y'][pointInd] > maxVal3['val']){
            maxVal3['traceName']= plotDataValues[i]['name']
            maxVal3['val']= plotDataValues[i]['y'][pointInd]
        }
    }
    return {'maxVal1': maxVal1, 'maxVal2':maxVal2, 'maxVal3':maxVal3}
}