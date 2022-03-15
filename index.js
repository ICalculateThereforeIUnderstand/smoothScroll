import Skrol from "./skrol.js";

window.onload = function() {
	console.log("Sve je OK.");
	
	let sc = new Skrol("#klik1", "#natpis", "bezier(0.47, 2.37, 0.64, -1.01)", "1500msec");
	let sc2 = new Skrol("#klik3", "#natpis", "linear", "500px");
	let sc3 = new Skrol("#klik4", "#natpis", "ease-in-out", "2000msec");
	let sc1 = new Skrol("#klik2", "#objekt");
	

}


