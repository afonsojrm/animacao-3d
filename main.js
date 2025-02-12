import * as THREE from "three";
import { Water } from "three/examples/jsm/objects/Water.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import "./style.css";

let camera, scene, renderer;
let water;
const loader = new GLTFLoader();

function random(min, max) {
  return Math.random() * (max - min) + min;
}

loader.load("./assets/namek/scene.gltf", function (gltf) {
  const model = gltf.scene;
  scene.add(model);
  gltf.scene.scale.set(50, 50, 50);
  gltf.scene.position.set(500, 1.2, -2900);
});
loader.load("./assets/esfera/scene.gltf", function (gltf) {
  const model = gltf.scene;
  scene.add(model);
  gltf.scene.scale.set(400, 400, 400);
  gltf.scene.position.set(500, 85, -2900);
});

class navedbz {
  constructor() {
    loader.load("./assets/navedbz/scene.gltf", (gltf) => {
      scene.add(gltf.scene);

      gltf.scene.scale.set(6, 6, 6);
      gltf.scene.position.set(20, 30, 20);
      gltf.scene.rotation.y = 3;
      this.nave = gltf.scene;
      this.speed = {
        vel: 0,
        yVel: 0,
        rot: 0,
      };
    });
  }

  stop() {
    this.speed.vel = 0;
    this.speed.yVel = 0;
    this.speed.rot = 0;
  }

  update() {
    //limitação no eixo y
    if (this.nave) {
      this.nave.rotation.y += this.speed.rot;
      this.nave.translateZ(this.speed.vel);
      if (this.nave.position.y + this.speed.yVel >= 6) {
        this.nave.position.y += this.speed.yVel;
      } else {
        this.nave.position.y = 6;
        this.speed.yVel = 0;
      }
      //Introducao da camera em terceira pessoa
      camera.position.copy(this.nave.position);
      var c = new THREE.Vector3(0, 0, 0);
      var d = new THREE.Vector3(0, 0, 0);
      this.nave.getWorldDirection(c);
      c.normalize();
      c.multiplyScalar(16);
      camera.position.sub(c);
      camera.translateY(5);
      camera.translateZ(10);
      d.copy(this.nave.position);
      c.normalize();
      c.multiplyScalar(4);
      d.add(c);
      camera.lookAt(d);
    }
  }
}

const nave = new navedbz();

class Nuvem {
  constructor(_scene) {
    scene.add(_scene);
    _scene.scale.set(20, 20, 20);
    if (Math.random() > 0.2) {
      _scene.position.set(random(-7500, 7500), 1000, random(-7500, 7500));
    } else {
      _scene.position.set(random(-1500, 1500), 250, random(-1500, 1500));
    }

    this.Nuvem = _scene;
  }
}

//criacao da classe ilha usando a mesma logica de geraçao randomica das nuvens
class Ilha {
  constructor(_scene) {
    scene.add(_scene);
    _scene.scale.set(20, 20, 20);
    if (Math.random() > 0.2) {
      _scene.position.set(random(-7500, 7500), 1.2, random(-7500, 7500));
    } else {
      _scene.position.set(random(-1500, 1500), 1.2, random(-1500, 1500));
    }

    this.Ilha = _scene;
  }
}
async function loadModel(url) {
  return new Promise((resolve) => {
    loader.load(url, (gltf) => {
      resolve(gltf.scene);
    });
  });
}

let nuvemModel = null;
async function createNuvem() {
  if (!nuvemModel) {
    nuvemModel = await loadModel("assets/cloud/scene.gltf");
  }
  return new Nuvem(nuvemModel.clone());
}
let ilhaModel = null;
async function createIlha() {
  if (!ilhaModel) {
    ilhaModel = await loadModel("assets/namek/scene.gltf");
  }
  return new Ilha(ilhaModel.clone());
}

let ilhas = [];
const ILHA_COUNT = 25;

let nuvens = [];
const NUVEM_COUNT = 100;

init();
animate();

async function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    1,
    200000
  );
  camera.position.set(30, 30, 100);

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.3;
  document.body.appendChild(renderer.domElement);

  const waterGeometry = new THREE.PlaneGeometry(100000, 100000);

  water = new Water(waterGeometry, {
    textureWidth: 1024,
    textureHeight: 1024,
    waterNormals: new THREE.TextureLoader().load(
      "assets/waternormals.jpg",
      function (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }
    ),
    sunDirection: new THREE.Vector3(0, 10, 200),
    sunColor: 0x4e9b62,
    waterColor: 0x4e9b62,
    distortionScale: 7.0,
  });

  water.rotation.x = -Math.PI / 2;

  scene.add(water);

  let light = new THREE.DirectionalLight(0xffffff, 2);
  light.position.set(3, 5, 8);
  scene.add(light, new THREE.AmbientLight(0xffffff, 1));

  for (let i = 0; i < NUVEM_COUNT; i++) {
    const nuvem = await createNuvem();
    nuvens.push(nuvem);
  }
  for (let i = 0; i < ILHA_COUNT; i++) {
    const ilha = await createIlha();
    ilhas.push(ilha);
  }

  window.addEventListener("resize", onWindowResize);
  window.addEventListener("keydown", function (e) {
    if (e.key == "w") {
      nave.speed.vel = 1;
    }
    if (e.key == "s") {
      nave.speed.vel = -1;
    }
    if (e.key == "a") {
      nave.speed.rot = 0.03;
    }
    if (e.key == "d") {
      nave.speed.rot = -0.03;
    }
    if (e.key == "ArrowUp") {
      nave.speed.yVel = 0.5;
    }
    if (e.key == "ArrowDown") {
      nave.speed.yVel = -0.5;
    }
  });
  //mudanca nas condicionais, melhorando a dinamica de movimentacao
  window.addEventListener("keyup", function (e) {
    if (e.key === "w" || e.key === "s") {
      nave.speed.vel = 0;
    }
    if (e.key === "a" || e.key === "d") {
      nave.speed.rot = 0;
    }
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      nave.speed.yVel = 0;
    }
  });
}

function onWindowResize() {}

function animate() {
  requestAnimationFrame(animate);
  render();
  renderer.render(scene, camera);
  nave.update();
}

function render() {
  water.material.uniforms["time"].value += 0.5 / 60.0;
  renderer.render(scene, camera);
}
