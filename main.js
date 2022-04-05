/** Connect to Moralis server */
const serverUrl = "https://5ip9ljtq95ri.usemoralis.com:2053/server";
const appId = "FLIwJ8FTlPyVQ0bRrTomHvILmrkddeGRYTB9RuIz";
Moralis.start({ serverUrl, appId });
let user = Moralis.User.current();

const _isDev = parseParams('dev');

console.log(_isDev)

const _TITLE = window.location.pathname.slice(1, -1).replace(/\/.*/ig, '') || "nft-minter";
const _DES = window.location.hostname + window.location.pathname;

window.cubes = [];
window.animateIsFinish = true;
window.createType = 'gif';

var id = null;
var fov = 45;
var near = 0.1;
var far = 1000;


initApp();
checkUserStatus();

// 获取地址栏参数
function parseParams(name) {
    if (!name) return
    const paramsStr = window.location.search;
    const params = new URLSearchParams(paramsStr)
    return params.get(name)
}

// create timestamp
function createTimeStamp() {
    let t = new Date();
    return t.getFullYear() + '/' + (t.getMonth() + 1) + '/' + t.getDate() + ' ' + t.getHours() + ':' + (t.getMinutes()) + ':' + t.getSeconds()
}

/** Add from here down */
async function login() {
    if (document.querySelector("#login").innerText == 'LOGOUT') {
        await Moralis.User.logOut();
        user = null;
        userLogout();
        return;
    }
    document.querySelector(".loading").style.display = "flex";
    // user = await Moralis.authenticate({ signingMessage: "Welcome to "+_TITLE })
    if (!user) {
        try {
            user = await Moralis.authenticate({ signingMessage: "Welcome to " + _TITLE })
            initApp();
            userLogin();
        } catch (error) {
            console.log(error)
            document.querySelector(".loading").style.display = "none";
        }
    } else {
        Moralis.enableWeb3();
        userLogin();
        initApp();
    }

}

function checkUserStatus() {

    if (user) {
        Moralis.enableWeb3();
        userLogin();
        initApp();
    }
}

function userLogin() {
    document.querySelector("#login").innerText = 'LOGOUT';
    document.querySelector(".loading").style.display = "none";
    // document.querySelector("#submit_button").removeAttribute('disabled');
    document.querySelector(".container").classList.remove('blur');
}

function userLogout() {
    document.querySelector("#login").innerText = 'LOGIN';
    document.querySelector(".loading").style.display = "none";
    document.querySelector("#submit_button").setAttribute('disabled', true);
    document.querySelector(".container").classList.add('blur');
}

function initApp() {
    document.querySelector("#title").innerText = _TITLE;
    document.querySelector("#login").onclick = login;
    document.querySelector("#open_github").onclick = () => window.location.href = 'https://github.com/shadowcz007/cubes-random-minter';
    document.querySelector("#app").style.display = "flex";
    document.querySelector("#submit_button").onclick = submit;
    document.querySelector("#input_refresh").onclick = runAnimate;
    document.querySelector("#target").onclick = () => document.querySelector("#input_refresh").click();
    document.querySelector("#input_gif").onclick = () => changeCreateType("gif");
    document.querySelector("#input_png").onclick = () => changeCreateType("png");


    // update cubes
    document.querySelector('#input_map').onclick = openFile;
    document.querySelector('#input_padding').onchange = updatePadding;
    document.querySelector('#input_width').onchange = updateWidth;
    document.querySelector('#input_height').onchange = updateHeight;

    window.input_width = parseInt(document.querySelector('#input_width').value);
    window.input_height = parseInt(document.querySelector('#input_height').value);
    window.input_padding = parseFloat(document.querySelector('#input_padding').value);

    initDragAndDrop(document, loadFile);

    // your id
    const fpPromise =
        import ('https://openfpcdn.io/fingerprintjs/v3')
        .then(FingerprintJS => FingerprintJS.load())

    // Get the visitor identifier when you need it.
    fpPromise
        .then(fp => fp.get())
        .then(result => {
            document.querySelector("#input_id").innerText = result.visitorId;
            window.visitorId = result.visitorId;
            document.querySelector("#input_title").innerText = _TITLE;
            document.querySelector("#input_description").innerText = "Co-Creation: " + _DES + " + DEVICE ID";

            // timestamp
            window.timestamp = createTimeStamp();
            document.querySelector("#input_timestamp").innerText = window.timestamp;
            // drawText();
        });

    window.drawingCanvas = document.createElement('canvas');

    create();

};

function changeCreateType(t) {
    window.createType = t;
    if (t == 'gif') {
        document.querySelector("#input_gif").classList.add("select");
        document.querySelector("#input_png").classList.remove("select");
    } else {
        document.querySelector("#input_gif").classList.remove("select");
        document.querySelector("#input_png").classList.add("select");
    }
}

function disableCreateButtons() {
    document.querySelector("#input_gif").setAttribute('disabled', true);
    document.querySelector("#input_png").setAttribute('disabled', true);
    document.querySelector("#input_refresh").setAttribute('disabled', true);
    document.querySelector("#submit_button").setAttribute('disabled', true);
    document.querySelector("#success_message").style.display = 'none';

}

function enableCreateButtons() {
    document.querySelector("#input_gif").removeAttribute('disabled');
    document.querySelector("#input_png").removeAttribute('disabled');
    document.querySelector("#input_refresh").removeAttribute('disabled');
    document.querySelector("#submit_button").removeAttribute('disabled');
}


function runAnimate() {

    disableCreateButtons();
    window.animateTime = window.createType === 'gif' ? 1500 : 3500 + (3000 * Math.random());
    window.animateIsFinish ? window.animateIsFinish = false : null;
    window.spherify = Math.random() * 1.2;
    window.twist = Math.random() * 1.2;
    window.cubes = shuffle(window.cubes);

    if (window.createType === 'gif') {
        createGifFromAnimate(window.animateTime || 1000).then(() => enableCreateButtons())
    };

    // 动画终止
    setTimeout(() => {
        window.animateIsFinish = true;
        if (window.createType === 'png') enableCreateButtons();
    }, window.animateTime || 1000);


    // 打乱
    function shuffle(arr) {
        let arrNew = [...arr]
            //用Math.random()函数生成0~1之间的随机数与0.5比较，返回-1或1
        const randomsort = function(a, b) {
                return Math.random() > 0.5 ? -1 : 1
            }
            // var arr = [1, 2, 3, 4, 5];
        return [...arrNew.sort(randomsort)]
    }
}

async function createGifFromAnimate(t = 2000, fps = 12) {
    window.ctxs = [];
    window.fps = fps;
    for (var i = 0; i < (t / 1000) * fps; i++) {
        await sleep(1000 / fps)
        let ctx = await canvasClone2Ctx(renderer.domElement);
        window.ctxs.push(ctx);
    };
}

function canvasClone2Ctx(canvas) {
    let c = document.createElement('canvas');
    let ctx = c.getContext('2d');
    c.width = canvas.width;
    c.height = canvas.height;
    ctx.drawImage(canvas, 0, 0, c.width, c.height);
    return ctx;
}

function blobToBase64(blob) {
    return new Promise((resolve, _) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
    });
}

function sleep(m = 1000) {
    return new Promise(r => setTimeout(r, m))
}

function createGif(ctxs = [], delay = 200) {

    const encoder = new minigif.GIFEncoder();
    encoder.setRepeat(0); // loop forever
    encoder.setDelay(delay); // go to next frame every 100 ms
    encoder.start(); // write header

    for (const ctx of ctxs) {
        encoder.addFrame(ctx); // Render the frame from the canvas context.
    }

    encoder.finish(); // finsh
    const arr = encoder.stream().getUnit8Array(); //获取生成的Unit8Array
    // const file = new Blob([arr]);                  //生成文件
    // const url = URL.createObjectURL(new Blob([res],{type: 'image/gif'}));        //获取浏览器可用的地址

    return blobToBase64(new Blob([arr], { type: 'image/gif' }));
}

async function submit() {
    if (!animateIsFinish) return;
    disableCreateButtons();

    // try {

    // } catch(error) {

    // }

    let message = document.querySelector('#success_message');
    message.style.display = "block";
    let base64;
    if (window.createType == 'gif' && window.ctxs && window.ctxs.length > 0) {
        message.innerHTML = `- gif - create`;
        await sleep(200);
        base64 = await createGif(window.ctxs, 1000 / window.fps);
    }

    if (window.createType == 'png') base64 = getTargetResult();
    message.innerHTML = `- ipfs - init`;


    // let base64=getTargetResult();
    // const input = document.querySelector('#input_image');
    // let data = input.files[0]
    const imageFile = new Moralis.File(_TITLE + '.' + window.createType, { base64: base64 })
    await imageFile.saveIPFS();
    let imageHash = imageFile.hash();

    message.innerHTML = `- ipfs - image-${window.createType}-file-save`;

    let metadata = {
        // 仅支持英文
        title: _TITLE,
        description: "Co-Creation: " + _DES + " + DEVICE ID-" + window.visitorId,
        image: "/ipfs/" + imageHash,
        timestamp: window.timestamp,
        visitorId: window.visitorId
    }
    console.log(metadata);
    const jsonFile = new Moralis.File("metadata.json", { base64: btoa(JSON.stringify(metadata)) });
    await jsonFile.saveIPFS();
    console.log(jsonFile)
    message.innerHTML = `- ipfs - metadata.json -save`;

    let metadataHash = jsonFile.hash();
    console.log(jsonFile.ipfs())
    let res = await Moralis.Plugins.rarible.lazyMint({
        chain: _isDev ? 'rinkeby' : 'eth',
        userAddress: user.get('ethAddress'),
        tokenType: 'ERC721',
        tokenUri: 'ipfs://' + metadataHash,
        royaltiesAmount: 5, // 0.05% royalty. Optional
    })
    console.log(res);
    document.querySelector('#success_message').innerHTML =
        `NFT minted. <a target="_blank" href="https://${_isDev?'rinkeby.':''}rarible.com/token/${res.data.result.tokenAddress}:${res.data.result.tokenId}">View NFT`;
    document.querySelector('#success_message').style.display = "block";
    // setTimeout(() => {
    //     document.querySelector('#success_message').style.display = "none";

    // }, 1000)
    enableCreateButtons();
}

function createCube() {
    const geometry = createGeometry();
    const material = new THREE.MeshPhongMaterial({
        color: 0x808080,
        shininess: 70,
        dithering: true
    });
    // const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    const cube = new THREE.Mesh(geometry, material);
    cube.position.y = 1.2;
    return cube;
}

function createCubesImage(width = 3, height = 3, padding = 0.1) {
    let cubes = [];
    let cube = createCube();
    for (let i = width / 2; i > -width / 2; i--) {
        let cubesChildren = [];
        let x = 0 + i + padding * i;
        for (let index = height / 2; index > -height / 2; index--) {
            let c = cube.clone();
            c.material = c.material.clone();
            c.position.x = x;
            c.position.y = 0 + index + index * padding;
            c.position.z = -2
                // scene.add(c);
            cubesChildren.push(c);
            c._baseX = i;
            c._baseY = index;
        };
        cubes.push(cubesChildren)
    }
    return cubes;
}

function updateCubesPosition(padding = 0.5) {
    for (const row of window.cubes) {
        for (const c of row) {
            c.position.x = c._baseX + padding * c._baseX;
            c.position.y = c._baseY + padding * c._baseY;
        }
    }
}

function updateCubesImage(width = 1, height = 1, padding = 0.1) {
    for (let cs of window.cubes) {
        for (let c of cs) {
            c.removeFromParent(window.scene)
        }
    };
    window.cubes = createCubesImage(width, height, padding);
    cubesAddScene(window.cubes, window.scene);
}

function cubesAddScene(cubes, scene) {
    for (const row of cubes) {
        for (const c of row) {
            scene.add(c);
        }
    }
}

function createGeometry() {

    const geometry = new THREE.BoxGeometry(1, 1, 1, 32, 32, 32);

    // create an empty array to  hold targets for the attribute we want to morph
    // morphing positions and normals is supported
    geometry.morphAttributes.position = [];

    // the original positions of the cube's vertices
    const positionAttribute = geometry.attributes.position;

    // for the first morph target we'll move the cube's vertices onto the surface of a sphere
    const spherePositions = [];

    // for the second morph target, we'll twist the cubes vertices
    const twistPositions = [];
    const direction = new THREE.Vector3(1, 0, 0);
    const vertex = new THREE.Vector3();

    for (let i = 0; i < positionAttribute.count; i++) {

        const x = positionAttribute.getX(i);
        const y = positionAttribute.getY(i);
        const z = positionAttribute.getZ(i);

        spherePositions.push(

            x * Math.sqrt(1 - (y * y / 2) - (z * z / 2) + (y * y * z * z / 3)),
            y * Math.sqrt(1 - (z * z / 2) - (x * x / 2) + (z * z * x * x / 3)),
            z * Math.sqrt(1 - (x * x / 2) - (y * y / 2) + (x * x * y * y / 3))

        );

        // stretch along the x-axis so we can see the twist better
        vertex.set(x * 2, y, z);

        vertex.applyAxisAngle(direction, Math.PI * x / 2).toArray(twistPositions, twistPositions.length);

    }

    // add the spherical positions as the first morph target
    geometry.morphAttributes.position[0] = new THREE.Float32BufferAttribute(spherePositions, 3);

    // add the twisted positions as the second morph target
    geometry.morphAttributes.position[1] = new THREE.Float32BufferAttribute(twistPositions, 3);

    return geometry;

}

function create() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    const camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, near, far);

    let canvas = document.querySelector('#target'),
        width = parseInt(getComputedStyle(document.querySelector('#target')).width),
        height = parseInt(getComputedStyle(document.querySelector('#target')).height);

    let mouseX = 0,
        mouseY = 0;

    // 画布的中点
    let windowHalfX = width / 2 + canvas.offsetLeft;
    let windowHalfY = height / 2 + canvas.offsetTop;
    // console.log(windowHalfX,windowHalfY)
    // console.log(document.querySelector('#target').style.width)
    // canvas.width=width;
    // canvas.height=height;
    // canvas.width=
    const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: true,
        canvas: document.querySelector('#target')
    });
    renderer.outputEncoding = THREE.LinearEncoding;
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(2);
    // renderer.setSize( window.innerWidth, window.innerHeight );
    // document.body.appendChild( renderer.domElement );

    // scene.add( cube );

    // clone
    window.cubes = createCubesImage(window.input_width, window.input_height, window.input_padding);
    cubesAddScene(window.cubes, scene);

    // const geometry2 = new THREE.BoxGeometry(8,2,0.1);
    // const material2 = new THREE.MeshBasicMaterial( { color: 0xffffff } );
    // const cube2 = new THREE.Mesh( geometry2, material2 );
    // cube2.position.y=-2;
    // window.material=material2;
    // window.material.map = new THREE.CanvasTexture( window.drawingCanvas );
    // // cube2.position.x=-0
    // scene.add( cube2 );

    //lights
    // const sphere = new THREE.SphereGeometry( 0.5, 16, 8 );
    light1 = new THREE.PointLight(0xff0040, 2, 50);
    // light1.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xff0040 } ) ) );
    scene.add(light1);

    light2 = new THREE.PointLight(0x0040ff, 2, 50);
    // light2.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0x0040ff } ) ) );
    scene.add(light2);

    light3 = new THREE.PointLight(0x80ff80, 2, 50);
    // light3.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0x80ff80 } ) ) );
    scene.add(light3);

    light4 = new THREE.PointLight(0xffaa00, 2, 50);
    // light4.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xffaa00 } ) ) );
    scene.add(light4);

    scene.add(new THREE.AmbientLight(0xffffff, Math.random() + 0.2));

    camera.position.z = 5;

    function onPointerMove(event) {
        if (event.isPrimary === false) return;
        // console.log(event.clientX,event.clientY)
        mouseX = event.clientX - windowHalfX;
        mouseY = event.clientY - windowHalfY;

        //  控制在画布范围内
        // closeChangeCamera=!!(mouseX>=width/2||mouseX<-width/2||mouseY>=height/2||mouseY<-height/2)

        // if(mouseX<0) mouseX=Math.min(mouseX,-width/2);
        // if(mouseY>=0) mouseY=Math.max(mouseY,height/2);
        // if(mouseY<0) mouseY=Math.min(mouseY,-height/2);
        // console.log(mouseX,mouseY)
    }

    function onMousewheel(event) {
        event.preventDefault();
        // console.log(event)
        if (event.wheelDelta) { //判断浏览器IE，谷歌滑轮事件  
            if (event.wheelDelta > 0) { //当滑轮向上滚动时  
                fov -= (near < fov ? 1 : 0);
            }
            if (event.wheelDelta < 0) { //当滑轮向下滚动时  
                fov += (fov < far ? 1 : 0);
            }
        } else if (event.detail) { //Firefox滑轮事件  
            if (event.detail > 0) { //当滑轮向上滚动时  
                fov -= 1;
            }
            if (event.detail < 0) { //当滑轮向下滚动时  
                fov += 1;
            }
        }
        window.camera.fov = fov;
        window.camera.updateProjectionMatrix();
        renderer.render(window.scene, window.camera);
    }

    function onWindowResize() {
        windowHalfX = width / 2 + canvas.offsetLeft;
        windowHalfY = height / 2 + canvas.offsetTop;
        // camera.aspect = window.innerWidth / window.innerHeight;
        // camera.updateProjectionMatrix();
        // renderer.setSize( window.innerWidth, window.innerHeight );
    }

    function render() {
        // console.log('animate')
        if (!window.animateIsFinish) {

            let count = 30;
            for (const row of window.cubes) {
                for (const cube of row) {
                    cube.rotation.x += 0.01 * Math.random();
                    cube.rotation.y += 0.01 * Math.random();
                    // cube.position.z = Math.random()>0.5?-0.3:0;
                    if (count > 0) {
                        //cube.scale.x += Math.random()*(Math.random()>0.5?-0.02:0.02);
                        // Spherify
                        cube.morphTargetInfluences[0] = window.spherify
                            // Twist
                        cube.morphTargetInfluences[1] = window.twist;
                        count--;
                    };
                }
            }
            const time = Date.now() * 0.0035;

            light1.position.x = Math.sin(time * 0.7) * 30;
            light1.position.y = Math.cos(time * 0.5) * 40;
            light1.position.z = Math.cos(time * 0.3) * 30;

            light2.position.x = Math.cos(time * 0.3) * 30;
            light2.position.y = Math.sin(time * 0.5) * 40;
            light2.position.z = Math.sin(time * 0.7) * 30;

            light3.position.x = Math.sin(time * 0.7) * 30;
            light3.position.y = Math.cos(time * 0.3) * 40;
            light3.position.z = Math.sin(time * 0.5) * 30;

            light4.position.x = Math.sin(time * 0.3) * 30;
            light4.position.y = Math.cos(time * 0.7) * 40;
            light4.position.z = Math.sin(time * 0.5) * 30;


            camera.position.x += (mouseX - camera.position.x) * 0.0001;
            camera.position.y += (-mouseY - camera.position.y) * 0.0001;
            camera.rotation.x += (mouseX - camera.rotation.x) * 0.000001;
            camera.rotation.y += (-mouseY - camera.rotation.y) * 0.000001;

        }

        // camera.lookAt( scene.position );
        // console.log(camera.position.x,camera.position.y)
        renderer.render(scene, camera);

    }

    function animate() {
        requestAnimationFrame(animate);
        render();
    };



    document.body.style.touchAction = 'none';
    document.body.addEventListener('pointermove', onPointerMove);
    document.querySelector('#target').addEventListener('mousewheel', onMousewheel, false);
    window.addEventListener('resize', onWindowResize);

    animate();

    window.renderer = renderer;
    window.scene = scene;
    window.camera = camera;
};



function drawText() {
    var drawingContext = drawingCanvas.getContext('2d');
    // draw white background
    drawingContext.fillStyle = 'rgba(0,0,0,1)';
    drawingContext.fillRect(0, 0, 300, 250);
    drawingContext.fillStyle = '#FFFFFF';
    drawingContext.fillText(window.timestamp, 20, 130)
    if (window.material) window.material.map.needsUpdate = true;
}

function getTargetResult() {
    let c = window.renderer.domElement;
    // let ctx = c.getContext('2d');
    // // console.log(ctx)
    // ctx.font = '14px Arial'
    // ctx.fillStyle = 'white'
    // ctx.fillText('by shadow', 24, c.height - 8)
    let png = c.toDataURL('image/png');
    return png
}

function initDragAndDrop(dom, callback) {
    dom.addEventListener('dragover', function(event) {
        event.preventDefault()
        event.dataTransfer.dropEffect = 'copy'
    })

    dom.addEventListener('drop', function(event) {
        event.preventDefault()

        callback(event.dataTransfer.files[0])
    })
}

function openFile() {
    let input = document.createElement('input')
    input.type = 'file'
    input.addEventListener('change', e => {
        const curFiles = input.files;
        loadFile(curFiles[0]);
    })
    input.click()
}

function loadFile(file) {
    const filename = file.name
    const extension = filename
        .split('.')
        .pop()
        .toLowerCase()

    if (['gif', 'png', 'jpeg', 'jpg', 'jfif'].includes(extension)) {
        // 'jpg', 'png'
        const reader = new FileReader()
        reader.addEventListener('load', function(event) {
            // console.log(event,event.target.result)
            window.mapImage = event.target.result
            updateTexture(event.target.result)

        });
        reader.readAsDataURL(file)
    }
}

// gridSize 马赛克大小
function splitImage(url, gridSize = 10) {
    let canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d');

    let img = new Image();
    img.src = url;
    return new Promise((resolve, _) => {
        img.onload = () => {

            let width = img.naturalWidth,
                height = img.naturalHeight;

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            let gw = parseInt(width / gridSize),
                gh = parseInt(height / gridSize);
            let gwStart = (width - gw * gridSize) / 2;
            let ghStart = (height - gh * gridSize) / 2;

            let res = [];
            for (let x = 0; x < gw; x++) {
                let xStart = gwStart + x * gridSize;
                let xEnd = xStart + gridSize;
                let ws = [];
                for (let y = 0; y < gh; y++) {
                    let yStart = ghStart + y * gridSize;
                    let yEnd = yStart + gridSize;
                    // console.log(xStart,xEnd,yStart,yEnd)
                    let imgData = ctx.getImageData(xStart, yStart, gridSize, gridSize);
                    ws.push({
                        imgData,
                        x: xStart,
                        width: gridSize,
                        y: yStart,
                        height: gridSize
                    })
                };
                res.push(ws);
            };
            resolve({ data: res, width: gw, height: gh });
        };

    })

};

function loadTexture(url) {
    return new Promise((resolve, _) => {
        let t = new THREE.TextureLoader();
        // 注意材质是异步的，需要在回调里render下
        let texture = t.load(url, res => {
            resolve(texture)
        });
    })
}

function updateTexture(url) {
    if (!(window.cubes && window.cubes.length > 0)) return;

    splitImage(url, 20).then(async si => {
        let data = si.data,
            width = si.width,
            height = si.height;
        window.input_width = width;
        window.input_height = height;
        document.querySelector('#input_width').value = window.input_width;
        document.querySelector('#input_height').value = window.input_height;

        updateCubesImage(width, height, window.input_padding)

        for (let index = 0; index < data.length; index++) {
            for (let i = 0; i < data[index].length; i++) {
                // console.log( window.cubes[index][i]);
                let c = document.createElement('canvas'),
                    ctx = c.getContext('2d');
                c.width = data[index][i].width;
                c.height = data[index][i].height;
                // console.log(data[index][i].imgData)
                ctx.putImageData(data[index][i].imgData, 0, 0);
                // document.body.appendChild(c);
                let texture = await loadTexture(c.toDataURL());
                updateMeshTexture(window.cubes[index][i], texture);
                // window.renderer.render( window.scene, window.camera );

            }
        };
        window.renderer.render(window.scene, window.camera);

    })

    // loadTexture(url).then(texture=>{

    //   for (const row of window.cubes) {
    //    for (const mesh of row) {
    //      if (mesh.material.map) mesh.material.map.dispose()
    //       mesh.material.map = texture
    //       // texture.needsUpdate = true
    //       mesh.material.needsUpdate = true 
    //     }
    //   }

    //   window.renderer.render( window.scene, window.camera );

    // })

    function updateMeshTexture(mesh, texture) {
        if (mesh.material.map) mesh.material.map.dispose();
        mesh.material.map = texture;
        mesh.material.needsUpdate = true; // because the encoding can change
    }

}

function updatePadding(e) {
    // console.log()
    window.input_padding = parseFloat(e.target.value);
    updateCubesPosition(window.input_padding)
}

function updateWidth(e) {
    window.input_width = parseInt(e.target.value);
    console.log(window.input_width, window.input_height, window.input_padding)
    updateCubesImage(window.input_width, window.input_height, window.input_padding)
}

function updateHeight(e) {
    window.input_height = parseInt(e.target.value);
    console.log(window.input_width, window.input_height, window.input_padding)
    updateCubesImage(window.input_width, window.input_height, window.input_padding)
}

// login();



// https://threejs.org/examples/?q=mor#webgl_morphtargets
//