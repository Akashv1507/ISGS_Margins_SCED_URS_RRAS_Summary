import {PlotData, PlotTrace, setPlotTraces } from './plotUtils'
import {getIsgsMarginsData} from './fetchApiData'
import {apiRespObj}  from './respInterfaceObj'



let intervalID = null

window.onload = async () => {
    const today = ( d => new Date(d.setDate(d.getDate())) )(new Date).toISOString().slice(0,10);
    //setting targetdate to today
    (document.getElementById("targetDate") as HTMLInputElement).value= today;
    
    const periodicity = +(document.getElementById('periodicity') as HTMLInputElement).value
    intervalID = setInterval(refreshData , periodicity*60*1000);
    (document.getElementById('submitBtn') as HTMLButtonElement ).onclick = refreshData;
    // refreshData()
}

const refreshData = async () =>{
     //to display error msg
     const errorDiv = document.getElementById("errorDiv") as HTMLDivElement;
     
     //get user inputs
     let targetDateValue = (
         document.getElementById("targetDate") as HTMLInputElement
     ).value;
 
     //validation checks, and displaying msg in error div
     if (targetDateValue === "" ) {
         errorDiv.classList.add("mt-4", "mb-4", "alert", "alert-danger")
         errorDiv.innerHTML = "<b> Please Enter a Valid Date</b>";
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
                     title: `ISGS Margin`,
                     traces: [],
                     yAxisTitle: "--MW--",
                 };
                 for (const prop in isgsMarginData) {
                    let singleGenMarginTrace: PlotTrace = {
                        name: `${prop}`,
                        data: isgsMarginData[prop],
                        type: "scatter",
                        hoverYaxisDisplay: "MW",
                        // line: {
                        //     width: 4,
                        //     color: "#34A853"
                        // },
                        // fill: "tozeroy",
                        stackgroup: 'one'
                    };
                    isgsMarginPlotData.traces.push(singleGenMarginTrace);
                  } 
                 //setting plot traces
                 setPlotTraces(
                     `plotDiv`,
                     isgsMarginPlotData
                 );              
         }
         catch (err) {
            errorDiv.classList.add("mt-4", "mb-4", "alert", "alert-danger")
            errorDiv.innerHTML = "<b>Oops !!! Data Fetch Unsuccessful For Selected Date. Please Try Again</b>"          
         }
     }
 };
