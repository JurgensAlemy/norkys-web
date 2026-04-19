// Base de datos de promociones por día (0 = Domingo, 1 = Lunes, etc.)
const promosDeLaSemana = [
  { dia: 0, nombre: "Domingo Familiar", desc: "1 Pollo + Papas + Chaufa + Inca Kola a S/65", img: "https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4" },
  { dia: 1, nombre: "Lunes Anticrisp", desc: "1/4 de Pollo a solo S/15", img: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092" },
  { dia: 2, nombre: "Martes 2x1", desc: "Lleva 2 octavos de pollo por el precio de 1", img: "https://images.unsplash.com/photo-1550547660-d9450f859349" },
  { dia: 3, nombre: "Miércoles Parrillero", desc: "Costillas + Papas + Gaseosa a S/35", img: "https://images.unsplash.com/photo-1544025162-d76694265947" },
  { dia: 4, nombre: "Jueves Patitas", desc: "Porción de alitas BBQ a S/18", img: "https://images.unsplash.com/photo-1527477396000-e27163b481c2" },
  { dia: 5, nombre: "Viernes de Locura", desc: "1/2 Pollo + Porción de Tequeños a S/39", img: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91" },
  { dia: 6, nombre: "Sábado de Salchipapa", desc: "Salchipapa Norkys XL a S/25", img: "https://images.unsplash.com/photo-1633504581786-316c8002b1b9" }
];

document.addEventListener("DOMContentLoaded", () => {
  const contDia = document.getElementById("promo-hoy-container");
  
  if(contDia){
    // Obtener qué día es hoy (hora local)
    const hoy = new Date().getDay(); 
    
    // Buscar la promo que coincide con hoy
    const promoHoy = promosDeLaSemana.find(p => p.dia === hoy);

    if(promoHoy) {
      contDia.innerHTML = `
        <div class="card" style="border: 2px solid #d32f2f;">
          <h3 style="background:#d32f2f; color:white; padding:5px; border-radius:5px; display:inline-block; margin-bottom:10px;">¡Oferta del Día!</h3>
          <img src="${promoHoy.img}" alt="${promoHoy.nombre}">
          <h2>${promoHoy.nombre}</h2>
          <p>${promoHoy.desc}</p>
          <button class="btn" onclick="alert('¡Promoción aplicada! Ve al menú para agregarla.')">Aprovechar Oferta</button>
        </div>
      `;
    }
  }
});