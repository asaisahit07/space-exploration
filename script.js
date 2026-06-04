const NASA_API_KEY = 'RSOprgCCYAYP76yt1F9WrOvPWMNOt6CuJPJWhOt5';

// Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 3000);
camera.position.set(0, 0, 6);

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("spaceCanvas"), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

scene.add(new THREE.AmbientLight(0x333333));
const sun = new THREE.DirectionalLight(0xffffff, 2);
sun.position.set(5, 3, 5);
scene.add(sun);

// Stars & Earth
const starGeo = new THREE.BufferGeometry();
const starPos = new Float32Array(20000).map(() => (Math.random() - 0.5) * 3000);
starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ size: 1, color: 0xffffff })));

const loader = new THREE.TextureLoader();
const earth = new THREE.Mesh(
    new THREE.SphereGeometry(2, 64, 64),
    new THREE.MeshStandardMaterial({
        map: loader.load('textures/earth.jpg')
    })
);
scene.add(earth);

// Satellite
const satGroup = new THREE.Group();
const body = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), new THREE.MeshStandardMaterial({ color: 0xcccccc }));
satGroup.add(body);
satGroup.position.set(3, 1, 0);
scene.add(satGroup);

function animate() {
    requestAnimationFrame(animate);
    earth.rotation.y += 0.0003;
    const positions = starGeo.attributes.position.array;

for(let i = 2; i < positions.length; i += 3) {

    positions[i] += 0.2;

    if(positions[i] > 1500) {
        positions[i] = -1500;
    }
}

starGeo.attributes.position.needsUpdate = true;
    const time = Date.now() * 0.001;

satGroup.position.x = Math.cos(time) * 3;
satGroup.position.z = Math.sin(time) * 3;
    renderer.render(scene, camera);
}
animate();

// APIs
async function fetchAllData() {
    // APOD
    fetch(`https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`)
.then(res => res.json())
.then(data => {

    const apodSection = document.getElementById("apod-section");

    if(data.media_type === "image"){

        document.getElementById("apod").src = data.url;

    } else if(data.media_type === "video"){

        document.getElementById("apod").style.display = "none";

        apodSection.insertAdjacentHTML(
            "afterbegin",
            `
            <iframe
                width="560"
                height="315"
                src="${data.url}"
                frameborder="0"
                allowfullscreen>
            </iframe>
            `
        );
    }

    document.getElementById("desc").innerText =
        data.explanation.substring(0,500) + "...";
})
.catch(() => {

    document.getElementById("desc").innerText =
        "NASA Discovery data unavailable.";

});

    // Asteroids
    const today = new Date().toISOString().split('T')[0];
    fetch(`https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=${NASA_API_KEY}`)
    .then(res => res.json())
    .then(data => { document.getElementById("asteroid-info").innerText = `${data.element_count} asteroids passing by today.`; });

    // Mars Weather
    fetch(`https://api.nasa.gov/insight_weather/?api_key=${NASA_API_KEY}&feedtype=json&ver=1.0`)
.then(res => res.json())
.then(data => {

    if(!data.sol_keys || data.sol_keys.length === 0){

        document.getElementById("mars-info").innerText =
        "Mars weather unavailable.";

        return;
    }

    const latestSol =
        data.sol_keys[data.sol_keys.length - 1];

    document.getElementById("mars-info").innerText =
        `Sol ${latestSol}: High ${data[latestSol].AT.mx}°F`;

})
.catch(() => {

    document.getElementById("mars-info").innerText =
    "Mars weather unavailable.";

});
}
fetchAllData();

gsap.registerPlugin(ScrollTrigger);
gsap.to(camera.position, { z: 15, scrollTrigger: { trigger: "#apod-section", start: "top center", scrub: 1 } });
gsap.utils.toArray(".planet-section").forEach(section => {

    gsap.from(section, {

        opacity: 0,
        y: 100,

        scrollTrigger: {
            trigger: section,
            start: "top 80%",
            scrub: 1
        }
    });

});
const btn = document.getElementById("showFactsBtn");
const factsContainer = document.getElementById("unknownFactsContainer");

btn.addEventListener("click", () => {

    if(factsContainer.style.display === "none"){
        factsContainer.style.display = "flex";
        btn.innerText = "Hide Cosmic Mysteries";
    }
    else{
        factsContainer.style.display = "none";
        btn.innerText = "Explore Cosmic Mysteries";
    }

});
document.querySelectorAll('#navbar a').forEach(link => {

    link.addEventListener('click', function(e) {

        e.preventDefault();

        const target = document.querySelector(
            this.getAttribute('href')
        );

        gsap.to(window, {
            duration: 2.5,
            scrollTo: target.offsetTop
        });

    });

});
const topBtn =
document.getElementById("topBtn");

window.addEventListener("scroll", () => {

    if(window.scrollY > 500){

        topBtn.style.display = "block";

    } else {

        topBtn.style.display = "none";
    }

});

topBtn.addEventListener("click", () => {

    gsap.to(window, {
        duration: 2,
        scrollTo: 0
    });

});