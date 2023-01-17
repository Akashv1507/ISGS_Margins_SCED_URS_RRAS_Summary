import {PlotData, PlotTrace, setPlotTraces } from './plotUtils'
import {getIsgsScedData} from './fetchApiData'
import {apiRespObj, isgsValObj}  from './respInterfaceObj'



let intervalID = null

window.onload = async () => {
    const today = ( d => new Date(d.setDate(d.getDate())) )(new Date).toISOString().slice(0,10);
    //setting targetdate to today
    (document.getElementById("targetDate") as HTMLInputElement).value= today;
    
    const periodicity = +(document.getElementById('periodicity') as HTMLInputElement).value
    intervalID = setInterval(refreshData , periodicity*60*1000);
    (document.getElementById('submitBtn') as HTMLButtonElement ).onclick = refreshData;
    refreshData()
}

const refreshData = async () =>{
    //to display error msg
    const errorDiv = document.getElementById("errorDiv") as HTMLDivElement;
    const submitBtn = document.getElementById('submitBtn') as HTMLButtonElement;
    // making submit button disabled till api call fetches data
    submitBtn.classList.add("button", "disabled")
    const today = ( d => new Date(d.setDate(d.getDate())) )(new Date).toISOString().slice(0,10);
    //setting targetdate to today
    (document.getElementById("targetDate") as HTMLInputElement).value= today;
    //get user inputs
    let targetDateValue = (
         document.getElementById("targetDate") as HTMLInputElement
     ).value;
 
    //validation checks, and displaying msg in error div
    if (targetDateValue === "" ) {
         errorDiv.classList.add("mt-4", "mb-4", "alert", "alert-danger")
         errorDiv.innerHTML = "<b> Please Enter a Valid Date</b>";
         submitBtn.classList.remove("button", "disabled"); 
     } else {
         //if reached this ,means no validation error ,emptying error div 
         errorDiv.classList.remove("mt-4", "mb-4", "alert", "alert-danger")
         errorDiv.innerHTML = "";
         try {
                 let isgsScedData:apiRespObj  = await getIsgsScedData(
                     targetDateValue
                 );  
                 if (isgsScedData==null)   {
                    errorDiv.classList.add("mt-4", "mb-4", "alert", "alert-danger")
                    errorDiv.innerHTML = "<b>Oops !!! Data Fetch Unsuccessful For Selected Date. Please Try Again</b>" 
                 }

                 let isgsScedPlotData: PlotData = {
                     title: `ISGS SCED`,
                     traces: [],
                     yAxisTitle: "MW",
                     barmode: "relative"
                 };
                 for (const prop in isgsScedData) {
                    let singleGenScedTrace: PlotTrace = {
                        name: `${prop}`,
                        data: isgsScedData[prop],
                        type: "bar",
                        hoverYaxisDisplay: "--MW--",    
                        width:0.9
                    };
                    isgsScedPlotData.traces.push(singleGenScedTrace);
                  } 

                //line plot for sum SCED
                const allGenList =Object.keys(isgsScedData)
                let allGenSumSced:isgsValObj[] = []
                for (let blkInd=0; blkInd<96; blkInd++){
                    let sumScedForBlk= 0
                    for (let genInd=0; genInd<allGenList.length; genInd++){
                        const genName = allGenList[genInd]
                        // console.log(isgsScedData[genName][blkInd]['val'])
                        try{
                            const scedVal=isgsScedData[genName][blkInd]['val']
                            sumScedForBlk= sumScedForBlk + scedVal
                        }
                        catch(err){
                            continue
                        }
                    }
                allGenSumSced.push({'blkNo':blkInd+1, 'val':sumScedForBlk})
                }
                
                let sumScedTrace: PlotTrace = {
                    name: `Net SCED`,
                    data: allGenSumSced,
                    type: "lines",
                    line: {
                        width: 3,
                        color: "#696969",
                    },
                    hoverYaxisDisplay: "MW",     
                };
                isgsScedPlotData.traces.push(sumScedTrace);

                 //setting plot traces
                 setPlotTraces(
                     `plotDiv`,
                     isgsScedPlotData
                 );   
                 submitBtn.classList.remove("button", "disabled");            
         }
         catch (err) {
            console.log(err)
            errorDiv.classList.add("mt-4", "mb-4", "alert", "alert-danger")
            errorDiv.innerHTML = "<b>Oops !!! Data Fetch Unsuccessful For Selected Date. Please Try Again</b>"  
            submitBtn.classList.remove("button", "disabled");         
         }
     }
 };
