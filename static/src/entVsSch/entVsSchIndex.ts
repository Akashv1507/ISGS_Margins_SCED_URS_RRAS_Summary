import {fetchTblData} from "./fetchTblData"
import {fetchPlotData} from "./fetchPlotData"





window.onload = async () => {
    
    const today = ( d => new Date(d.setDate(d.getDate())) )(new Date).toISOString().slice(0,10);
  
    //setting targetdDate  to today
    (document.getElementById("targetDate") as HTMLInputElement).value= today;
   
    const submitBtn = document.getElementById("submitBtn") as HTMLButtonElement;
    submitBtn.onclick= wrapperFunc;

    const tblIconBtn = document.getElementById("tblIcon") as HTMLButtonElement
    const chartIconBtn = document.getElementById("chartIcon") as HTMLButtonElement
    const stackedBarIconBtn = document.getElementById("stackedBarIcon") as HTMLButtonElement
  
    const plotSectionDiv = document.getElementById("plotSection") as HTMLDivElement
    const tblSectionDiv = document.getElementById("tableSection") as HTMLDivElement
    const stackedBarSectionDiv = document.getElementById("stackedBarSection") as HTMLDivElement
  
    tblIconBtn.classList.add("tblActive")
    plotSectionDiv.hidden =true
  
    tblIconBtn.onclick = ()=>{
      tblIconBtn.classList.add("tblActive")
      chartIconBtn.classList.remove("chartActive")
      stackedBarIconBtn.classList.remove("stackedBarActive")

  
      tblSectionDiv.hidden =false
      plotSectionDiv.hidden = true
      stackedBarSectionDiv.hidden=true
    }

    chartIconBtn.onclick = ()=>{
        chartIconBtn.classList.add("chartActive")
        tblIconBtn.classList.remove("tblActive")
        stackedBarIconBtn.classList.remove("stackedBarActive")

        plotSectionDiv.hidden = false
        tblSectionDiv.hidden =true
        stackedBarSectionDiv.hidden=true
      }

      stackedBarIconBtn.onclick = ()=>{
        stackedBarIconBtn.classList.add("stackedBarActive")
        chartIconBtn.classList.remove("chartActive")
        tblIconBtn.classList.remove("tblActive")
       
        stackedBarSectionDiv.hidden=false
        plotSectionDiv.hidden = true
        tblSectionDiv.hidden =true
        
      }
}


const wrapperFunc = async ()=>{

      await fetchTblData()
      await fetchPlotData()

    }