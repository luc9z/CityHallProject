import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import unorm from "unorm";
import styles from "./style.module.scss";

// Importação de imagens
import pontoImageAltoBoaVista from "../../assets/pics/Estação_Ferroviária_de_Santiago.jpg";
import pontoImageSantiagoPompeu from "../../assets/pics/Estação_Ferroviária_de_Santiago.jpg";
import pontoImageVilaRica from "../../assets/pics/Estação_Ferroviária_de_Santiago.jpg";
import pontoImageGinasião from "../../assets/pics/Estação_Ferroviária_de_Santiago.jpg";
import pontoImageLuluGenro from "../../assets/pics/Estação_Ferroviária_de_Santiago.jpg";
import pontoImageJoaoEvangelista from "../../assets/pics/Estação_Ferroviária_de_Santiago.jpg";
import pontoImageMissoes from "../../assets/pics/Estação_Ferroviária_de_Santiago.jpg";
import pontoImageItu from "../../assets/pics/Estação_Ferroviária_de_Santiago.jpg";
import pontoImageCastilhos from "../../assets/pics/Estação_Ferroviária_de_Santiago.jpg";
import pontoImageCeuAberto from "../../assets/pics/Estação_Ferroviária_de_Santiago.jpg";
import pontoImagePracaMoisésViana from "../../assets/pics/Estação_Ferroviária_de_Santiago.jpg";
import garrafaPet from "../../assets/pics/garrafapet.png";
import latinhas from "../../assets/pics/latinh.png";
import papel from "../../assets/pics/papel.png";
import vidro from "../../assets/pics/vidro.png";
import aluminio from "../../assets/pics/alu.png";
import plastico from "../../assets/pics/plast.png";
import garrafa2 from "../../assets/pics/garrafa2.png";
import pilaAzul from "../../assets/pics/vectorpila.png";

// Define custom icons
const createCustomIcon = () => {
  return new L.Icon({
    iconUrl: pilaAzul,
    iconSize: [30, 40], // size of the icon
    iconAnchor: [12, 41], // point of the icon which will correspond to marker's location
    popupAnchor: [1, -34], // point from which the popup should open relative to the iconAnchor
  });
};

// Dados dos bairros
const bairros = {
  "Alto da Boa Vista": {
    lat: -29.209007287137876,
    lng: -54.86172252220362,
    horarios: "Segunda-feira: 09h às 11h",
    image: pontoImageAltoBoaVista,
    icon: createCustomIcon(),
  },
  "Santiago Pompeu": {
    lat: -29.182666017024033,
    lng: -54.864372977508054,
    horarios: "Segunda-feira: 14h às 16h",
    image: pontoImageSantiagoPompeu,
    icon: createCustomIcon(),
  },
  "Vila Rica": {
    lat: -29.168489408322394,
    lng: -54.87639394555081,
    horarios: "Terça-feira: 09h às 11h",
    image: pontoImageVilaRica,
    icon: createCustomIcon(),
  },
  Ginásião: {
    lat: -29.18135826826034,
    lng: -54.85240583382978,
    horarios: "Terça-feira: 14h às 16h",
    image: pontoImageGinasião,
    icon: createCustomIcon(),
  },
  "Lulu Genro": {
    lat: -29.188751938218342,
    lng: -54.85568948915517,
    horarios: "Quarta-feira: 09h às 11h",
    image: pontoImageLuluGenro,
    icon: createCustomIcon(),
  },
  "João Evangelista": {
    lat: -29.2027,
    lng: -54.87688,
    horarios: "Quarta-feira: 14h às 16h",
    image: pontoImageJoaoEvangelista,
    icon: createCustomIcon(),
  },
  Missões: {
    lat: -29.17432657390861,
    lng: -54.889221038069294,
    horarios: "Quinta-feira: 09h às 11h",
    image: pontoImageMissoes,
    icon: createCustomIcon(),
  },
  Itú: {
    lat: -29.186908854967744,
    lng: -54.87765396544596,
    horarios: "Quinta-feira: 14h às 16h",
    image: pontoImageItu,
    icon: createCustomIcon(),
  },
  Castilhos: {
    lat: -29.203512653049476,
    lng: -54.86764006671212,
    horarios: "Sexta-feira: 14h às 16h",
    image: pontoImageCastilhos,
    icon: createCustomIcon(),
  },
  "Céu Aberto": {
    lat: -29.196562093138315,
    lng: -54.85813961102388,
    horarios: "Sexta-feira: 14h às 16h",
    image: pontoImageCeuAberto,
    icon: createCustomIcon(),
  },
  "Praça Moisés Viana": {
    lat: -29.19140271037639,
    lng: -54.866519747323714,
    horarios: "Sábado: 08h às 11h",
    image: pontoImagePracaMoisésViana,
    icon: createCustomIcon(),
  },
};

// Itens de troca
const itemsOfExchange = [
  {
    description: "1kg de alumínio - 4 pilas",
    carouselImage: aluminio,
  },
  {
    description: "10 unidades de PET 2L - 1 pila",
    carouselImage: garrafa2,
  },
  {
    description: "1kg de plástico - 2 pilas",
    carouselImage: plastico,
  },
  {
    description: "25 unidades de garrafa PET - 1 pila",
    carouselImage: garrafaPet,
  },
  {
    description: "18 unidades de latinhas - 1 pila",
    carouselImage: latinhas,
  },
  {
    description: "1kg de papel - 1 pila",
    carouselImage: papel,
  },
  { description: "10kg de vidro - 1 pila", carouselImage: vidro },
];

// Componente para controlar o zoom do mapa
const ZoomHandler = ({ position, zoom }) => {
  const map = useMap();
  map.setView(position, zoom);
  return null;
};

// Componente principal
const PontosDeTroca = () => {
  const [selectedBairro, setSelectedBairro] = useState("");
  const [horarios, setHorarios] = useState("");
  const [imageSrc, setImageSrc] = useState("");
  const [showMap, setShowMap] = useState(true);

  // Função para normalizar strings removendo acentos e convertendo para minúsculas
  const normalizeString = (str) => {
    return unorm
      .nfd(str)
      .toLowerCase()
      .replace(/[\u0300-\u036f]/g, "");
  };

  // Função para lidar com a pesquisa de bairro
  const handleSearch = () => {
    const normalizedInput = normalizeString(selectedBairro);

    if (normalizedInput === "") {
      // Mostrar o mapa e limpar os detalhes do bairro
      setShowMap(true);
      setSelectedBairro("");
      setHorarios("");
      setImageSrc("");
    } else {
      const foundBairroKey = Object.keys(bairros).find((key) => {
        return normalizeString(key) === normalizedInput;
      });

      if (foundBairroKey) {
        const bairroData = bairros[foundBairroKey];
        // Atualizar os detalhes do bairro e esconder o mapa
        setShowMap(false);
        setSelectedBairro(foundBairroKey);
        setHorarios(bairroData.horarios);
        setImageSrc(bairroData.image);

        // Exibir toast de sucesso
        toast.success(`Bairro encontrado: ${foundBairroKey}`);
      } else {
        // Exibir toast de erro se o bairro não for encontrado
        toast.error(`Bairro não encontrado: ${selectedBairro}`);
      }
    }
  };

  return (
    <div className={styles.pontosDeTroca}>
      <h1>Pontos de Coleta</h1>
      {showMap && (
        <div>
          <div className={styles.searchContainer}>
            <input
              type="text"
              value={selectedBairro}
              onChange={(e) => setSelectedBairro(e.target.value)}
              placeholder="Digite o nome do seu bairro"
              className={styles.searchInput}
            />
            <button onClick={handleSearch} className={styles.searchButton}>
              <FontAwesomeIcon icon={faSearch} />
            </button>
          </div>
          <MapContainer
            center={[-29.1899, -54.8669]}
            zoom={12}
            className={styles.map}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {Object.keys(bairros).map((bairroKey) => (
              <Marker
                key={bairroKey}
                position={[bairros[bairroKey].lat, bairros[bairroKey].lng]}
                icon={createCustomIcon()}
              >
                <Popup>
                  <div className={styles.markerPopup}>
                    <img
                      src={bairros[bairroKey].image}
                      alt={bairroKey}
                      className={styles.markerImage}
                    />
                    <h3>{bairroKey}</h3>
                    <p>{bairros[bairroKey].horarios}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
            <ZoomHandler position={[-29.1899, -54.8669]} zoom={12} />
          </MapContainer>
        </div>
      )}

      {selectedBairro && !showMap && (
        <div className={styles.detailsContainer}>
          <button
            onClick={() => setShowMap(true)}
            className={styles.resetButton}
          >
            Voltar
          </button>
          <h2>{selectedBairro}</h2>
          <p>{horarios}</p>
          <img
            src={imageSrc}
            alt="Ponto de Coleta"
            className={styles.detailsImage}
          />
          <h3>Itens que podem ser trocados:</h3>
          <Carousel
            showArrows={true}
            showStatus={false}
            showIndicators={false}
            infiniteLoop={true}
            swipeable={true} // Permitir o deslizamento
            emulateTouch={true} // Emular toque para dispositivos móveis
          >
            {itemsOfExchange.map((item, index) => (
              <div key={index} className={styles.carouselCard}>
                <img src={item.carouselImage} alt={item.description} />
                <p>{item.description}</p>
              </div>
            ))}
          </Carousel>
        </div>
      )}

      <ToastContainer position="bottom-left" />
    </div>
  );
};

export default PontosDeTroca;
