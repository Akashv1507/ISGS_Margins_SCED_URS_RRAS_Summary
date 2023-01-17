import {PlotData, PlotTrace, setPlotTraces } from './plotUtils'
import {getIsgsRrasData} from './fetchApiData'
import {apiRespObj,isgsValObj}  from './respInterfaceObj'



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
         //if reached this ,means no validation error ,emptying error div and making start date and end date in desired format
         errorDiv.classList.remove("mt-4", "mb-4", "alert", "alert-danger")
         errorDiv.innerHTML = "";
         try {
                 let isgsRrasData:apiRespObj  = await getIsgsRrasData(
                     targetDateValue
                 );  
                 if (isgsRrasData==null)   {
                    errorDiv.classList.add("mt-4", "mb-4", "alert", "alert-danger")
                    errorDiv.innerHTML = "<b>Oops !!! Data Fetch Unsuccessful For Selected Date. Please Try Again</b>" 
                 }

                 let isgsRrasPlotData: PlotData = {
                     title: `ISGS RRAS`,
                     traces: [],
                     yAxisTitle: "--MW--",
                     barmode: "relative"
                 };
                 for (const prop in isgsRrasData) {
                    let singleGenMarginTrace: PlotTrace = {
                        name: `${prop}`,
                        data: isgsRrasData[prop],
                        type: "bar",
                        hoverYaxisDisplay: "MW",
                    };
                    isgsRrasPlotData.traces.push(singleGenMarginTrace);
                  } 
                  //line plot for sum SCED
                const allGenList =Object.keys(isgsRrasData)
                let allGenSumRras:isgsValObj[] = []
                for (let blkInd=0; blkInd<96; blkInd++){
                    let sumRrasForBlk= 0
                    for (let genInd=0; genInd<allGenList.length; genInd++){
                        const genName = allGenList[genInd]
                        // console.log(isgsScedData[genName][blkInd]['val'])
                        try{
                            const scedVal=isgsRrasData[genName][blkInd]['val']
                            sumRrasForBlk= sumRrasForBlk + scedVal
                        }
                        catch(err){
                            continue
                        }
                    }
                    allGenSumRras.push({'blkNo':blkInd+1, 'val':sumRrasForBlk})
                }
                
                let sumRrasTrace: PlotTrace = {
                    name: `Net RRAS`,
                    data: allGenSumRras,
                    type: "lines",
                    line: {
                        width: 3,
                        color: "#696969",
                    },
                    hoverYaxisDisplay: "MW",     
                };
                isgsRrasPlotData.traces.push(sumRrasTrace);
                 //setting plot traces
                 setPlotTraces(
                     `plotDiv`,
                     isgsRrasPlotData
                 );   
                 submitBtn.classList.remove("button", "disabled");           
         }
         catch (err) {
            errorDiv.classList.add("mt-4", "mb-4", "alert", "alert-danger")
            errorDiv.innerHTML = "<b>Oops !!! Data Fetch Unsuccessful For Selected Date. Please Try Again</b>"  
            submitBtn.classList.remove("button", "disabled");        
         }
     }
 };
