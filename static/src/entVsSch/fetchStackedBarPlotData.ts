import {getSchVsEntData} from '../fetchApiData'
import {PlotData, PlotTrace, setPlotTraces } from '../plotUtils'
import {getPlotData} from "./entVsSchHelperFn"
import {colorArray} from "./colorArray"


export const fetchStackedBarPlotData = async() => {

    //to display error msg
    const errorDiv = document.getElementById("stackedBarErrorPlotDiv") as HTMLDivElement;
  
    //to display spinner
    const spinnerDiv = document.getElementById("stackedBarPlotSpinner") as HTMLDivElement;
  
    //to display stacked bar plot
    const stackedBarPlotWrapper = document.getElementById("stackedBarPlotsWrapper") as HTMLDivElement;
  
    //get user inputs
    const targetDateValue = (
      document.getElementById("targetDate") as HTMLInputElement
    ).value;
    const stateAcr = (
        document.getElementById("state") as HTMLSelectElement
    ).value;
  
    const fuelType = (
          document.getElementById("genType") as HTMLSelectElement
        ).value;

    //const schVsOnBarEntTraceList =[{'id':'ScheduleAmount_Sum', 'name':'Schedule'},{'id':'EntOnBar_Sum', 'name':'On-Bar Entitlement'}] 
    //const offBarEntVsOffBarReqTraceList =[{'id':'EntOffBar_Sum', 'name':'Off-Bar Entitlement'},{'id':'ReqOffBar_Sum', 'name':'Off-Bar Requisition'}] 

    //submit btn
    const submitBtn = document.getElementById("submitBtn") as HTMLButtonElement
    submitBtn.classList.add("button", "disabled");

    // clearing earlier div(except for first api call), here all the datatble , and we are emptying it, hence no need to clear datatable
    stackedBarPlotWrapper.innerHTML = "";
  
    //validation checks, and displaying msg in error div
    if (targetDateValue === "" ) {
      errorDiv.classList.add("mt-4", "mb-4", "alert", "alert-danger");
      errorDiv.innerHTML = "<b> Please Enter a Valid  Date</b>";
      submitBtn.classList.remove("button", "disabled");
    }
    else {

      //if reached this ,means no validation error ,emptying error div 
      errorDiv.classList.remove("mt-4", "mb-4", "alert", "alert-danger");
      errorDiv.innerHTML = "";

      //adding spinner class to spinner div
      spinnerDiv.classList.add("loader");

    try{

        let schVsEntData  = await getSchVsEntData(
            targetDateValue, stateAcr, fuelType
        ); 

        //defining divs dynamically, sch vs onbar entitlement barplot div
        let schVsOnBarEntBarPlot = document.createElement('div');
        schVsOnBarEntBarPlot.id = `schVsOnBarEntBarPlot`;
        stackedBarPlotWrapper.appendChild(schVsOnBarEntBarPlot);
        
        
        //Schedule vs on bar entitlement plotdata
        let schVsOnBarEntBarPlotData: PlotData = {
            title: ` ${stateAcr} Schedule Vs On-Bar Entitlement ${targetDateValue.substring(0,10)}`,
            traces: [],
            yAxisTitle: "--MW--",
            //barmode:'stack'
           
        };
        const allGenScheduleData = schVsEntData['ScheduleAmount']
        const allGenEntOnBarData = schVsEntData['EntOnBar']
        let allGenSdlClrCount = 0
        let allGenEntOnBarClrCount=0

        for (const key in allGenEntOnBarData) {
           
            const entityPlotData=getPlotData(allGenEntOnBarData[key])
            let singleGenTrace: PlotTrace = {
               name: `${key}_Ent`,
               data: entityPlotData,
               type: "bar",
               hoverYaxisDisplay: "MW",
               width:0.2,
               offsetgroup:"2",
               stackgroup:"2",
               marker:{color:colorArray[allGenEntOnBarClrCount]}
           };
           schVsOnBarEntBarPlotData.traces.push(singleGenTrace);
           allGenEntOnBarClrCount= allGenEntOnBarClrCount+1
         }
 
        for (const key in allGenScheduleData) {

            const entityPlotData=getPlotData(allGenScheduleData[key])
            let singleGenTrace: PlotTrace = {
               name: `${key}_Sdl`,
               data: entityPlotData,
               type: "bar",
               hoverYaxisDisplay: "MW",
               width:0.2,
               offsetgroup:"1",
               stackgroup:"1",
               marker:{color:colorArray[allGenSdlClrCount]}
           };
           schVsOnBarEntBarPlotData.traces.push(singleGenTrace);
           allGenSdlClrCount = allGenSdlClrCount+1
         }  
     
        setPlotTraces(
            `schVsOnBarEntBarPlot`,
            schVsOnBarEntBarPlotData
        );
        submitBtn.classList.remove("button", "disabled");
        spinnerDiv.classList.remove("loader");

    }
    catch(err){
        errorDiv.classList.add("mt-4", "mb-4", "alert", "alert-danger")
        errorDiv.innerHTML = "<b>Oops !!! Data Fetch Unsuccessful For Target Date. Please Try Again</b>"  
        submitBtn.classList.remove("button", "disabled");       
        spinnerDiv.classList.remove("loader"); 
        console.log(err)
    
    }  
}
}