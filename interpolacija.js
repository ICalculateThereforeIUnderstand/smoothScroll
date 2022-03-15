// u ovom libraryiju sam implementirao cubic Hermite spline. Derivacije po zadanim
// tockama proracunavam tehnikom pod imenom cardinal spline (ili canonical spline).

export function vratiParametre(x0, y0, yc0, x1, y1, yc1) {
    // ova funkcija vraca polje parametara [a, b, c, d] polinoma 3. stupnja
    // a*x^3 + b*x^2 + c*x + d, za dani interval omeden tockama (x0, y0) i (x1, y1). Vrijednosti
    // yc0 i yc1 su pripadajuce prve derivacije tih tocaka.
    
    let C0 = (y0-y1)/(x0-x1) - yc1;
    let C1 = yc0 - yc1;
    let A0 = x0**2 - 2*x1**2 + x0*x1;
    let B0 = x0 - x1;
    let A1 = 3*(x0**2 - x1**2);
    let B1 = 2*(x0-x1);
    
    let a = (C1 - C0*B1/B0) / (A1 - A0*B1/B0);
    let b = (C0 - A0*a) / B0;
    let c = yc0 - 3*a*x0**2 - 2*b*x0;
    let d = y0 - a*x0**3 - b*x0**2 - c*x0;
    
    return [a, b, c, d];
}

export function vratiTritocke(tocke) {
    // ova funkcija kao input uzima polje tocaka (xi, yi), te za svaku tocku proracunava derivaciju
    // metodom cardinal spline, te vraca polje sa koordinatama svake tocke i njezinom pripadajucom
    // derivacijom (xi, yi, yci). ovu uredenu trojku nazvao sam tritocke
    
    let rez = [];
    let dulj = tocke.length;
    const C = 0.5; // tenzijski parametar
    
    let tocka = null;
    let x0, x1, y0, y1, m;
    
    for (let i = 0; i < dulj; i++) {
        if (i === 0) {
            x1 = tocke[i+1][0];
            x0 = tocke[i][0];
            y1 = tocke[i+1][1];
            y0 = tocke[i][1];
            m = (1-C) * (y1-y0) / (x1-x0);
            tocka = [x0, y0, m];
        } else if (i === dulj-1) {
            x1 = tocke[i][0];
            x0 = tocke[i-1][0];
            y1 = tocke[i][1];
            y0 = tocke[i-1][1];
            m = (1-C) * (y1-y0) / (x1-x0);
            tocka = [x1, y1, m];
        } else {
            x1 = tocke[i+1][0];
            x0 = tocke[i-1][0];
            y1 = tocke[i+1][1];
            y0 = tocke[i-1][1];
            m = (1-C) * (y1-y0) / (x1-x0);
            tocka = [tocke[i][0], tocke[i][1], m];
        }
        rez.push(tocka);
    }
    return rez;
}

export function vratiParametreInterpolacije(tritocke) {
    // ova funkcija uzima polje tritocaka od n elemenata te vraca n-1 setova parametara
    // [a, b, c, d] za pripadajucih n-1 intervala
    let parametri = [];
    for (let i = 1; i < tritocke.length; i++) {
        let par = vratiParametre(tritocke[i-1][0], tritocke[i-1][1], tritocke[i-1][2], tritocke[i][0], tritocke[i][1], tritocke[i][2]);
        parametri.push(par);
    }
    return parametri;
}

export function fun(tritocke, parametri, x) {
    let len = tritocke.length;
    if (len === 1)  return tritocke[0][1];
    
    let tp1 = 0;
    let tp2 = len - 1;
    if (tritocke[0][0] >= x)  return tritocke[0][1];
    if (tritocke[len-1][0] <= x)  return tritocke[len-1][1];
    
    while (tp2-tp1 > 1) {
        let tp = Math.floor((tp1+tp2)/2);
        if (tritocke[tp][0] >= x) {
            tp2 = tp;
        } else {
            tp1 = tp;
        }
    }
    
    let par = parametri[tp2-1];
    return par[0]*x**3 + par[1]*x**2 + par[2]*x + par[3]; 
}


export function randomNormal(sr, stdev) {
	// vraca random variate normalne distribucije srednje vrijednosti sr i standardne devijacije stdev
    var a = 0;
    let b = 0;
    while(a === 0) a = Math.random(); //Converting [0,1) to (0,1)
    while(b === 0) b = Math.random();
    return Math.sqrt(-2.0 * Math.log(a)) * Math.cos(2.0 * Math.PI * b) * stdev  +  sr;
}
