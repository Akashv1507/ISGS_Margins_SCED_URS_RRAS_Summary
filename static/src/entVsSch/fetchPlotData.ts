import {getSchVsEntData} from '../fetchApiData'
import {PlotData, PlotTrace, setPlotTraces } from '../plotUtils'
import {getPlotData} from "./entVsSchHelperFn"


export const fetchPlotData = async() => {

    //to display error msg
    const errorDiv = document.getElementById("errorPlotDiv") as HTMLDivElement;
  
    //to display spinner
    const spinnerDiv = document.getElementById("plotSpinner") as HTMLDivElement;
  
    //to display plot
    const plotWrapper = document.getElementById("plotsWrapper") as HTMLDivElement;
  
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

    const schVsOnBarEntTraceList =[{'id':'ScheduleAmount_Sum', 'name':'Schedule'},{'id':'EntOnBar_Sum', 'name':'On-Bar Entitlement'}] 
    const offBarEntVsOffBarReqTraceList =[{'id':'EntOffBar_Sum', 'name':'Off-Bar Entitlement'},{'id':'ReqOffBar_Sum', 'name':'Off-Bar Requisition'}] 

    //submit btn
    const submitBtn = document.getElementById("submitBtn") as HTMLButtonElement
    submitBtn.classList.add("button", "disabled");

    // clearing earlier div(except for first api call), here all the datatble , and we are emptying it, hence no need to clear datatable
    plotWrapper.innerHTML = "";
  
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

        //defining divs dynamically, sch vs onbar entitlement plot div
        let schVsOnBarEntPlot = document.createElement('div');
        schVsOnBarEntPlot.id = `schVsOnBarEntPlot`;
        plotWrapper.appendChild(schVsOnBarEntPlot);
        // offbar entitlement vs off bar requisition plot div
        let offBarEntVsReqPlot = document.createElement('div');
        offBarEntVsReqPlot.id = `offBarEntVsReqPlot`;
        plotWrapper.appendChild(offBarEntVsReqPlot);
        
        //Schedule vs on bar entitlement plotdata
        let schVsOnBarEntPlotData: PlotData = {
            title: ` ${stateAcr} Schedule Vs On-Bar Entitlement ${targetDateValue.substring(0,10)}`,
            traces: [],
            yAxisTitle: "--MW--",
           
        };
        for (let i=0; i<schVsOnBarEntTraceList.length;i++) {
            const entityId = schVsOnBarEntTraceList[i]['id']
            const entityName = schVsOnBarEntTraceList[i]['name']
            const entityPlotData=getPlotData(schVsEntData[entityId])
           let singleTrace: PlotTrace = {
               name: `${entityName}`,
               data: entityPlotData,
               type: "scatter",
               hoverYaxisDisplay: "MW",
               //fill: 'tonexty',
               line: { width: 6 }
           };
           schVsOnBarEntPlotData.traces.push(singleTrace);
         } 

         //Off bar entitlement vs Off bar requisition plotdata
        let offBarEntVsOffBarReqPlotData: PlotData = {
            title: ` ${stateAcr} Off-Bar Entitlement Vs Off-Bar Requisition ${targetDateValue.substring(0,10)}`,
            traces: [],
            yAxisTitle: "--MW--",
           
        };
        for (let i=0; i<offBarEntVsOffBarReqTraceList.length;i++) {
            const entityId = offBarEntVsOffBarReqTraceList[i]['id']
            const entityName = offBarEntVsOffBarReqTraceList[i]['name']
            const entityPlotData=getPlotData(schVsEntData[entityId])
           let singleTrace: PlotTrace = {
               name: `${entityName}`,
               data: entityPlotData,
               type: "scatter",
               hoverYaxisDisplay: "MW",
               line: { width: 6 }
               //fill: 'tonexty',
           };
           offBarEntVsOffBarReqPlotData.traces.push(singleTrace);
         } 


        //setting plot traces
        setPlotTraces(
            `schVsOnBarEntPlot`,
            schVsOnBarEntPlotData
        );
 
        setPlotTraces(
            `offBarEntVsReqPlot`,
            offBarEntVsOffBarReqPlotData
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