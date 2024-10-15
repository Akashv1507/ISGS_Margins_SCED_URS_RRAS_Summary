import {PlotData, PlotTrace, setPlotTraces } from './plotUtils'
import {getRooftopSolarData} from './fetchApiData'
import {rooftopSolarObj}  from './respInterfaceObj'




let intervalID = null

window.onload = async () => {
    let currDate = new Date();
    
    let currDateDateStr = currDate.toISOString().substring(0,10);
    //setting startdate and enddate to yesterday
    (document.getElementById("startDate") as HTMLInputElement).value= currDateDateStr + 'T00:00';
    (document.getElementById("endDate") as HTMLInputElement).value = currDateDateStr +'T23:59';
    intervalID = setInterval(fetchData , 10*60*1000);
    (document.getElementById('submitBtn') as HTMLButtonElement ).onclick = fetchData;
    fetchData()
}

//  fetch data and plot on button click
const fetchData = async()=>{
    let startDateValue = (
        document.getElementById("startDate") as HTMLInputElement
    ).value;
    let endDateValue = (
        document.getElementById("endDate") as HTMLInputElement
    ).value;
    //to display error msg
    const errorDiv = document.getElementById("errorDiv") as HTMLDivElement;
    const plotDiv = document.getElementById("plotDiv") as any;
    const submitBtn = document.getElementById('submitBtn') as HTMLButtonElement;
    // making submit button disabled till api call fetches data
    submitBtn.classList.add("button", "disabled")
    if (startDateValue === "" || endDateValue=== "" ) {
        errorDiv.classList.add("mt-4", "mb-4", "alert", "alert-danger")
        errorDiv.innerHTML = "<b> Please Enter a Valid Date</b>";
        submitBtn.classList.remove("button", "disabled");
    } else {
        //if reached this ,means no validation error ,emptying error div and making start date and end date in desired format
        errorDiv.classList.remove("mt-4", "mb-4", "alert", "alert-danger")
        errorDiv.innerHTML = "";
        try {
                let rooftopSolarData= await getRooftopSolarData(
                    startDateValue, endDateValue
                );
                // console.log(rooftopSolarData)  
                if (rooftopSolarData==null || rooftopSolarData.length===0)   {
                   errorDiv.classList.add("mt-4", "mb-4", "alert", "alert-danger")
                   errorDiv.innerHTML = "<b>Oops !!! Data Fetch Unsuccessful For Selected Date. Please Try Again</b>" 
                }

                let rooftopSolarPlotData: PlotData = {
                    title: `RoofTop Solar Generation between ${startDateValue} & ${endDateValue}`,
                    traces: [],
                    yAxisTitle: "--KW--",
                };
               
                let singleGenMarginTrace: PlotTrace = {
                    name: `RoofTopSolar`,
                    data: rooftopSolarData,
                    type: "scatter",
                    hoverYaxisDisplay: "KW", 
                    fill: 'tonexty',
                    fillcolor: '#50C878',
                    line: {
                        color: '#50C888'
                      },
                    // stackgroup: 'one'
                };
                rooftopSolarPlotData.traces.push(singleGenMarginTrace);
                //setting plot traces
                setPlotTraces(
                    `plotDiv`,
                    rooftopSolarPlotData,
                    true
                );  
                submitBtn.classList.remove("button", "disabled");          
        }
        catch (err) {
           errorDiv.classList.add("mt-4", "mb-4", "alert", "alert-danger")
           errorDiv.innerHTML = "<b>Oops !!! Data Fetch Unsuccessful For Selected Date. Please Try Again</b>"     
           submitBtn.classList.remove("button", "disabled");
           console.log(err)    
        }
    }

}


