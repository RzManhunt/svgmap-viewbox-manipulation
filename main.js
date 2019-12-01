// el tag svg debe tener un atributo stroke para poder obtener el viewbox luego
const svgImage = document.getElementById("svgImage");
const svgContainer = document.getElementById("svgContainer");
const zoomValue = document.getElementById("zoomValue");

// obtener el objeto viewbox con svgImage.getBBox() o tomar el atributo directamente;
const initViewBox = { 
  x: 75,
  y: -10,
  width: 1000,
  height: 684
};

let viewBox = initViewBox;
let isSelected = false;

// Mejorar este codigo, se repiten los condicionales
const svgSize = {};
   if(svgImage.getAttribute('width').indexOf('%') > -1){
    if(svgImage.getAttribute('width') === '100%'){
      svgSize.width = viewBox.width;
    } else{
      const num = svgImage.getAttribute('width').slice(0, '100%'.search('%'));
      svgSize.width = viewBox.width * (parseInt(num) / 100);
    }
   } else{
    svgSize.width = svgImage.getAttribute('width');
   }

   if(svgImage.getAttribute('height').indexOf('%') > -1){
    if(svgImage.getAttribute('height') === '100%'){
      svgSize.height = viewBox.height;
    } else{
      const num = svgImage.getAttribute('height').slice(0, '100%'.search('%'));
      svgSize.height = viewBox.height * (parseInt(num) / 100);
    }
   } else{
    svgSize.height = svgImage.getAttribute('height');
   }

let isPanning = false;
var startPoint = {x:0,y:0};
var endPoint = {x:0,y:0};
var scale = 1;
var timer;

/*
* Zoom in-out with scrollwheel
*
*/
svgContainer.onwheel = function(e) {
  if(isSelected === false){
    var mx = e.x; // mouse position on x
    var my = e.y; // mouse position on y    
    var dw = viewBox.width * Math.sign(e.deltaY) * 0.05;
    var dh = viewBox.height * Math.sign(e.deltaY) * 0.05;
    var dx = (dw * mx) / svgSize.width; // el ultimo valo es svgSize.w pero no lo toma por ser un porcentaje
    var dy = (dh * my) / svgSize.height; // el ultimo valo es svgSize.h pero no lo toma por ser un porcentaje
    viewBox = {
    /* Al cambiar los signos de estas operaciones se cambia el comportamiento del
    scroll. Si hace zoom in o out al hacer scroll hacia arriba o hacia abajo */
      x: viewBox.x - dx,
      y: viewBox.y - dy,
      width: viewBox.width + dw,
      height: viewBox.height + dh
    };
    scale = svgSize.width / viewBox.width;
    svgImage.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`);
    // mostrar cuantos X de zoom se tienen - no esta activo por defecto
    zoomValue.innerText = `${Math.round(scale*100)/100}x`;
    clearTimeout(timer);
    timer = setTimeout(() => { zoomValue.innerText = ''; }, 3000);
  }
}

/*
* Panning
*
*/
svgContainer.onmousedown = function(e){
   isPanning = true;
   startPoint = {x:e.x,y:e.y};
}

svgContainer.onmousemove = function(e){
  if (isPanning && isSelected === false){
    endPoint = {x:e.x,y:e.y};
    var dx = (startPoint.x - endPoint.x) / scale;
    var dy = (startPoint.y - endPoint.y) / scale;
    var movedViewBox = {x:viewBox.x+dx,y:viewBox.y+dy,width:viewBox.width,height:viewBox.height};
    svgImage.setAttribute('viewBox', `${movedViewBox.x} ${movedViewBox.y} ${movedViewBox.width} ${movedViewBox.height}`);
  }
}

svgContainer.onmouseup = function(e){
  if (isPanning && isSelected === false){ 
    endPoint = {x:e.x,y:e.y};
    var dx = (startPoint.x - endPoint.x) / scale;
    var dy = (startPoint.y - endPoint.y) / scale;
    viewBox = {x:viewBox.x+dx,y:viewBox.y+dy,width:viewBox.width,height:viewBox.height};
    svgImage.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`);
    isPanning = false;
  }
}

svgContainer.onmouseleave = function(e){
 isPanning = false;
}

/*
* Hace zoom al pais seleccionado
*
*/
const countries = document.getElementsByTagName('path');
const backButton = document.getElementById('backButton');
const countryTooltip = document.getElementById('countryTooltip');
let isEnter = false;

backButton.onclick = function(e){
  e.target.style.display = 'none';
  svgImage.style.fill = '#ececec'; // "url('#myGradient')"
  svgImage.style.stroke = 'black';
  Array.from(countries).forEach(country => {
    country.removeAttribute('fill');
    country.removeAttribute('stroke');
  });
  svgImage.setAttribute('viewBox', `${initViewBox.x} ${initViewBox.y} ${initViewBox.width} ${initViewBox.height}`);
  viewBox = initViewBox;
  isSelected = false;
  isPanning = false;
  scale = 1;
}

Array.from(countries).forEach(country => {
  country.ondblclick = function(e){
    if(isSelected === false){
      // Quita todos los paises y solo pinta el que esta seleccionado y el backButton
      backButton.style.display = 'block';
      svgImage.style.fill = 'white';
      svgImage.style.stroke = 'white';
      e.target.setAttribute('fill', 'blue');
      e.target.setAttribute('stroke', 'white');

      // Hace zoom al pais seleccionado
      const countryViewbox = e.target.getBBox();
      viewBox = {x:countryViewbox.x - 5, y:countryViewbox.y - 5, width:countryViewbox.width + 10, height:countryViewbox.height + 10};
      svgImage.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`);

      // Evita que salga el nombre del pais cuando esta seleccionado
      isSelected = true;

      zoomValue.innerText = '';
      countryTooltip.innerHTML = '';
    }
  }
});

Array.from(countries).forEach(country => {
  country.onmouseenter = function(){
    isEnter = true;
  }
});

Array.from(countries).forEach(country => {
  country.onmousemove = function(e){
    if(isEnter === true && isSelected === false){
      countryTooltip.innerHTML = e.target.getAttribute('name');
      countryTooltip.style.cursor = 'pointer';
      countryTooltip.style.position = 'absolute';
      countryTooltip.style.left = `${e.x - 30}px`;
      countryTooltip.style.top = `${e.y - 30}px`;
    }
  }
});

Array.from(countries).forEach(country => {
  country.onmouseleave = function(){
    countryTooltip.innerHTML = '';
    isEnter = false;
  }
});