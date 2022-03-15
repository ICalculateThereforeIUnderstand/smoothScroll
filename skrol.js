import { vratiParametre, vratiTritocke, vratiParametreInterpolacije, fun as bezierFun} from "./interpolacija.js";

export default class Skrol {
	constructor(elem=null, target=null, tip="linear", time="300px") {
	// ova klasa omogucuje dizajneru stranice da proizvoljno prilagodi brzinu i obrazac scrollanja po stranici, kada korisnik
	// klikne na neki link. elem je css selector kojim biramo gumb za klik (npr. "#gumb"), target je slican selektor za odabir
	// elementa na stranici do kojeg ce browser skrolati. Opcija tip nam omogucuje kvalitativno prilagodavanje skrola, za opciju
	// "linear" imamo linearni skrol sa konstantnom brzinom od pocetka do kraja, zatim imamo sljedece specijalne slucajeve bezierovih
	// krivulja: "ease-in", "ease-out", "ease", "ease-in-out". Ako zelis zadati svoju vlastitu bezierovu krivulju, tada je zadajes
	// na sljedeci nacin "bezier(p1,p2,p3,p4)" gdje su p1 do p4 float parametri. Opcija time zadaje prosjecnu brzinu skrola. Mozes 
	// je zadati u broju piksela po sekundi, npr. "300px", ili u ukupnom vremenu za izvodenje cijelog skrola, npr. "800msec". Dopustene
	// su samo jedinice px i msec.
		this.el = null;
		this.target = null;
		
		this.speed = 200; // broj pixela po sekundi, brzina skrolanja
        this.brToc = 100;
		this.poz = window.scrollY;
		this.pozT = null;
		this.smjer = 1;
        this.poljeTritoc = [];
        this.poljePar = [];
		
		this.skrolaj = this.skrolaj.bind(this);
		if (elem !== null && target !== null) {
			this.el = document.querySelector(elem);
			this.target = document.querySelector(target);
			this.listener = this.el.addEventListener("click", this.skrolaj);
			this.pozT = getCoords(this.target).top;
		}
		
		this.time = null;
		if (time.includes("px")) {
			this.speed = Number.parseInt(time);
		} else if (time.includes("msec")) {
			this.time = Number.parseInt(time);
		} else {
			console.log("GRESKA kod time parametra, moras ga zadati u px ili msec");
			this.speed = 300;
			console.log("brzina je " + this.speed);
		}
		
		this.p1x = -0.01;
		this.p1y = 0.01;
		this.p2x = 0.99;
		this.p2y = 1.01;
		
		if (tip === "ease-out") {
			this.p1x = -0.01;
		    this.p1y = 0.01;
		    this.p2x = 0.57;
		    this.p2y = 1.01;
		} else if (tip === "ease-in-out") {
			this.p1x = 0.41;
		    this.p1y = 0.01;
		    this.p2x = 0.57;
		    this.p2y = 1.01;
		} else if (tip === "ease-in") {
			this.p1x = 0.41;
		    this.p1y = 0.01;
		    this.p2x = 0.99;
		    this.p2y = 1.01;
		} else if (tip === "ease") {
			this.p1x = 0.25;
		    this.p1y = 0.1;
		    this.p2x = 0.25;
		    this.p2y = 1;
		}
		if (tip.includes("bezier")) {
			let in1 = tip.indexOf("(");
		    let in2 = tip.indexOf(")");
		    [this.p1x, this.p1y, this.p2x, this.p2y] = tip.substring(in1+1, in2).split(",").map((e)=>{return Number.parseFloat(e)});
		    if (! isNumPolje([this.p1x, this.p1y, this.p2x, this.p2y])) {
				console.log("GRESKA kod parametara, ucitavas default linear mode");
				this.p1x = -0.01;
		        this.p1y = 0.01;
		        this.p2x = 0.99;
		        this.p2y = 1.01;
			}
		}
				
		this.iniciraj();
		
	}
    
    iniciraj() {
        let dt = 1 / this.brToc;
        let t1 = 0;
        let rez = [];
        while (t1 < 1) {
            let [x, y] = this.bezier(t1, this.p1x, this.p1y, this.p2x, this.p2y);
            t1 += dt;
            rez.push([x,y]);
        }
        this.poljeTritoc = [];
        this.poljePar = [];
        
        this.poljeTritoc = vratiTritocke(rez);
        this.poljePar = vratiParametreInterpolacije(this.poljeTritoc);
        
    }
	
	skrolaj() {

		this.poz = window.scrollY;
		let poz1 = this.poz;
		this.dpoz = 0;
		
		if (this.pozT > this.poz) {
		    this.smjer = 1;
		    this.dpoz = this.pozT - this.poz;
		    if (this.time === null) {
		        this.vrijeme = this.dpoz / this.speed * 1000;
		    } else {
				this.vrijeme = this.time;
			}
		} else {
			this.smjer = -1;
			this.dpoz = this.poz - this.pozT;
			if (this.time === null) {
			    this.vrijeme = this.dpoz / this.speed * 1000;
			} else {
				this.vrijeme = this.time;
			}
		}
		
		let vrijemePoc = performance.now();
		
		requestAnimationWrapper(() => {
			let vrijeme = performance.now();
			
			let t = (vrijeme - vrijemePoc) / this.vrijeme;
            poz1 = bezierFun(this.poljeTritoc, this.poljePar, t) * this.dpoz * this.smjer +  this.poz;
        
			if (t > 1) {
				poz1 = this.pozT;
				window.scrollTo(0, poz1);
				this.poz = poz1;
				return false;
			}
			
			window.scrollTo(0, poz1);
			return true;
			
		});
	}

	pocisti() {
		this.el.removeEventListener("click", this.skrolaj);
		console.log("pocisceno...");
	}
    
    bezier(t, p1x=-0.01, p1y=0.01, p2x=0.99, p2y=1.01) {
        // ovi default p parametri su za linearni bezier
        
        // linear      -0.01, 0.01, 0.99, 1.01
        // ease-out    -0.01, 0.01, 0.57, 1.01
        // ease-in-out  0.41, 0.01, 0.57, 1.01
        // ease-in      0.41, 0.01, 0.99, 1.01
        // ease         0.25, 0.1, 0.25, 1
        let rezx = 0;
        let rezy = 0;
        let p0x = 0;
        let p0y = 0;
        let p3x = 1;
        let p3y = 1;
        rezx = Math.pow((1-t), 3) * p0x + 3 * Math.pow((1-t), 2) * t * p1x +
               3 * (1-t) * Math.pow(t, 2) * p2x + Math.pow(t, 3) * p3x;
        rezy = Math.pow((1-t), 3) * p0y + 3 * Math.pow((1-t), 2) * t * p1y +
               3 * (1-t) * Math.pow(t, 2) * p2y + Math.pow(t, 3) * p3y;
        return [rezx, rezy];
    }
}

function getCoords(elem) { // crossbrowser version
    var box = elem.getBoundingClientRect();

    var body = document.body;
    var docEl = document.documentElement;

    var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
    var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

    var clientTop = docEl.clientTop || body.clientTop || 0;
    var clientLeft = docEl.clientLeft || body.clientLeft || 0;

    var top  = box.top +  scrollTop - clientTop;
    var left = box.left + scrollLeft - clientLeft;

    return { top: Math.round(top), left: Math.round(left) };
}

function requestAnimationWrapper(fun) {
    window.requestAnimationFrame(()=> {if (fun())  requestAnimationWrapper(fun)});
}

function isNumPolje(br) {
	let sw = true;
	for (let i = 0; i < br.length; i++) {
		if (! (Number(br[i]) === br[i]))  return false;
	}
	
	return true;
}
