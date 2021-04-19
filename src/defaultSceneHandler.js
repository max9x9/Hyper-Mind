import * as THREE from './js/tree.js/three.module.js';
import { TWEEN } from './js/jsm/libs/tween.module.min.js';
import { CSS3DRenderer, CSS3DObject } from './js/jsm/renderers/CSS3DRenderer.js';


let camera, scene, renderer;
let scene2, renderer2;
//let controls;
let container;

var objects = [];
var lines = [];
const targets = { table: [], sphere: [], helix: [], grid: [] };

//let group,group2;
let layer=0;
let groups=[];
let groups2=[];
let targetRotation = 0;
let targetRotationOnPointerDown = 0;

let pointerX = 0;
let pointerXOnPointerDown = 0;
let windowHalfX = window.innerWidth / 2;

let widthSpace = 230;
let heightSpace = 80;

var lineColor = 0x8A0808;

function animate(){
    requestAnimationFrame(animate );
    TWEEN.update();
    render();
}

function render (){
    let group = groups[layer];
    let group2 = groups2[layer];
    group.rotation.y += ( targetRotation - group.rotation.y ) * 0.05;
    group2.rotation.y += ( targetRotation - group2.rotation.y ) * 0.05;
    renderer.render( scene, camera );
    renderer2.render( scene2, camera );
}

var hdr = function(hym){
    this.hym = hym;
};

hdr.prototype = {
    init : function(){
        this.sceneInit();
        this.newTree(this.hym.root);
        animate();
    },
    goInto : function(root,duration,group,group2){
        var _hym = this.hym;
        var _hdr = this;
        TWEEN.removeAll();
        new TWEEN.Tween( group.position )
                .to( { x: group.position.x, y: group.position.y, z: 2000 }, duration )
                .easing( TWEEN.Easing.Exponential.InOut )
                .start();
        new TWEEN.Tween( group2.position )
                .to( { x: group2.position.x, y: group2.position.y, z: 2000 }, duration )
                .easing( TWEEN.Easing.Exponential.InOut )
                .start();
    
    
        for(let i=0;i<group.children.length;i++){
            let element = group.children[i].element;
            new TWEEN.Tween( {opacity:element.style.opacity*1} )
                .to( {opacity:0} , duration/1.5 )
                .onUpdate(function(o) {
                    element.style.opacity = o.opacity;
                }).easing( TWEEN.Easing.Exponential.InOut )
                .start();
        }
        for(let i=0;i<group2.children.length;i++){
            let targetLine = group2.children[i];
            new TWEEN.Tween( {opacity:targetLine.material.opacity} )
                .to( {opacity:0} , duration/1.5 )
                .onUpdate(function(o) {
                    targetLine.material.opacity = o.opacity;
                }).easing( TWEEN.Easing.Exponential.InOut )
                .start();
        }
    
    
        new TWEEN.Tween( this )
            .to( {}, duration/2 )
            .onUpdate( render ).onComplete(function(){_hdr.newTree(root);layer++;})
            .start();
    },
    initLine : function(targetTable,group){
        var _hym = this.hym;
        var root = _hym.currentRoot;
        for(var i=1;i<targetTable.length;i++){
            /*var x1 = root.x*230;
            var y1 = root.y*100;*/
            var x1 = 0;
            var y1 = 0;
            var x2 = targetTable[i].x*widthSpace;
            var y2 = targetTable[i].y*heightSpace;
            //var xm=Math.round((x1-x2)/2+x2);
            //var ym=Math.round((y1-y2)/2+y2);
            var geometry = new THREE.Geometry();
            var p1 = new THREE.Vector3(x1, y1, 0);
            var p2 = new THREE.Vector3(x1, y2, 0);
            var p3 = new THREE.Vector3(x2, y2, 0);
            // 三维二次贝赛尔曲线
            var curve = new THREE.QuadraticBezierCurve3(p1, p2, p3);
            var points = curve.getPoints(100); //分段数100，返回101个顶点
            // setFromPoints方法从points中提取数据改变几何体的顶点属性vertices
            geometry.setFromPoints(points);
            //材质对象
            var material = new THREE.LineBasicMaterial({
                /*color: 0x888888,*/
                color: lineColor,
                transparent: true,
                linewidth: 1,
                opacity: 0
            });
            //线条模型对象
            var line = new THREE.Line(geometry, material);
            lines.push(line);
            group.add(line);
        }
    },
    showLines : function(duration){
        var _hym = this.hym;
        TWEEN.removeAll();
        for(var j=0;j < lines.length;j++){
            let targetLine = lines[j];
            new TWEEN.Tween( {opacity:targetLine.material.opacity} )
                .to( {opacity:1} , Math.random() * duration/1.5 )
                .onUpdate(function(o) {
                    targetLine.material.opacity = o.opacity;
                }).easing( TWEEN.Easing.Exponential.InOut )
                .start();
        }
        new TWEEN.Tween( this )
            .to( {}, duration/1.5 )
            .onUpdate( render )
            .start();

    },
    transform : function(targets, duration ) {
        var _hdr = this;
        TWEEN.removeAll();
    
        for ( let i = 0; i < objects.length; i ++ ) {
    
            const object = objects[ i ];
            const target = targets[ i ];
    
            new TWEEN.Tween( object.position )
                .to( { x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration )
                .easing( TWEEN.Easing.Exponential.InOut )
                .start();
    
            new TWEEN.Tween( object.rotation )
                .to( { x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration )
                .easing( TWEEN.Easing.Exponential.InOut )
                .start();
    
                
            new TWEEN.Tween( {opacity:object.element.style.opacity*1} )
                .to( {opacity:1} , Math.random() * duration + duration )
                .onUpdate(function(o) {
                    object.element.style.opacity = o.opacity;
                }).easing( TWEEN.Easing.Exponential.InOut )
                .start();
        }
        
    
        new TWEEN.Tween( this )
            .to( {}, duration * 2 )
            .onUpdate( render ).onComplete(function(){_hdr.showLines(duration);})
            .start();
    
    },
    newTree : function (root){
        var _hym = this.hym;
        var _hdr = this;
        _hym.currentRoot = root;
        let group = new THREE.Group();
        let group2 = new THREE.Group();
        scene2.add(group2);
        scene.add( group);
        groups.push(group);
        groups2.push(group2);
        var targetTable = [];
        targetTable.push(_hym.currentRoot);
        root.children.forEach(child =>{
            targetTable.push(child);
        });
        targets.table = [];
        objects = [];
        lines = [];
        for (let i =0 ; i< targetTable.length ; i++){

            // const border = document.createElement("div");
            // border.className = "border";

            
            const element = document.createElement("div");
            element.id="node_"+targetTable[i].id;
            element.className="element";
            element.textContent = targetTable[i].text;
            element.style.opacity = 0;
            /*element.ondblclick = function(){
                goInto(table2,1000,group,group2);
            };*/
            if(_hym.currentRoot.id != targetTable[i].id && targetTable[i].children.length > 0){
                element.onclick = function(){
                    _hdr.goInto(targetTable[i],1000,group,group2);
                };
            }
            

            // border.appendChild(element);
            //element.style.backgroundColor = 'rgba(0,127,127,' + ( Math.random() * 0.5 + 0.25 ) + ')';

            /*const text = document.createElement("div");
            text.classname="details";
            text.textContent = table[i].text;
            element.appendChild(text);*/

            const objectCSS = new CSS3DObject(element);
            objectCSS.position.x = Math.random() * 4000 - 2000;
            objectCSS.position.y = Math.random() * 4000 - 2000;
            objectCSS.position.z = Math.random() * 4000 - 2000;
            /*objectCSS.position.x = 0;
            objectCSS.position.y = 0;
            objectCSS.position.z = -10000;*/
            
            group.add( objectCSS );

            objects.push( objectCSS );
        }
        this.initLine(targetTable,group2);
        render();

        for (let i =0 ; i< targetTable.length ; i++){
            const object = new THREE.Object3D();
            object.position.x = ( targetTable[ i ].x * widthSpace );
            object.position.y = ( targetTable[ i ].y * heightSpace );
            if(i == 0){
                object.position.x = 0;
                object.position.y = 0;
            }
            let elementWidth = document.getElementById("node_"+targetTable[i].id).offsetWidth / 2;
            if(object.position.x>0){
                object.position.x = object.position.x + elementWidth;
            }else if(object.position.x < 0){
                object.position.x = object.position.x - elementWidth;
            }

            targets.table.push( object );
        }

        this.transform( targets.table, 1000 );
    },
    sceneInit : function(){
        var _hym = this.hym;
        var _hdr = this;
        document.getElementById("btnBack").onclick = function(){_hdr.goBack(1000);};

        camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 10000 );
        camera.position.z = 1000;
        scene = new THREE.Scene();
        //scene.background = new THREE.Color( 0xcccccc );
        //scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 );
        //scene.fog = new THREE.Fog(0xcc0000, 1, 1000);
        //scene.background = new THREE.Color( 0xf0f0f0 );
        //group = new THREE.Group();
        //group2 = new THREE.Group();
        //group.position.y = 100;
    
        scene2 = new THREE.Scene();
        //scene2.background = new THREE.Color( 0xf0f0f0 );
        //scene2.add(group2);
        //scene.add( group);
    
        
    
        renderer2 = new THREE.WebGLRenderer( { antialias: true, alpha: true  } );
        renderer2.setClearAlpha(0);
        renderer2.setPixelRatio( window.devicePixelRatio );
        renderer2.setSize( window.innerWidth, window.innerHeight );
        renderer2.domElement.style.position = 'absolute';
        renderer2.domElement.style.top = 0;
        document.getElementById( 'container' ).appendChild( renderer2.domElement );
        
        renderer = new CSS3DRenderer();
        //renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setSize( window.innerWidth, window.innerHeight );
        document.getElementById( 'container' ).appendChild( renderer.domElement );
        
        /*controls = new TrackballControls( camera, renderer.domElement );
        controls.minDistance = 500;
        controls.maxDistance = 6000;
        controls.addEventListener( 'change', render );*/
        container = document.getElementById("container");
        container.style.touchAction = 'none';
        container.addEventListener( 'pointerdown', onPointerDown, false );
    
        window.addEventListener( 'resize', onWindowResize, false );
    
    },
    goBack : function (duration){
        if(layer==0) return;
        var _hym = this.hym;
        var _hdr = this;
        var group = groups[layer -1];
        var group2 = groups2[layer -1];
        var oldGroup = groups[layer];
        var oldGroup2 = groups2[layer];
        TWEEN.removeAll();
        new TWEEN.Tween( group.position )
                .to( { x: group.position.x, y: group.position.y, z: 0 }, duration )
                .easing( TWEEN.Easing.Exponential.InOut )
                .start();
        new TWEEN.Tween( group2.position )
                .to( { x: group2.position.x, y: group2.position.y, z: 0 }, duration )
                .easing( TWEEN.Easing.Exponential.InOut )
                .start();
        new TWEEN.Tween( oldGroup.position )
                .to( { x: oldGroup.position.x, y: oldGroup.position.y, z: -1000 }, duration )
                .easing( TWEEN.Easing.Exponential.InOut )
                .start();
        new TWEEN.Tween( oldGroup2.position )
                .to( { x: oldGroup2.position.x, y: oldGroup2.position.y, z: -1000 }, duration )
                .easing( TWEEN.Easing.Exponential.InOut )
                .start();
    
        for(let i=0;i<group.children.length;i++){
            let element = group.children[i].element;
            new TWEEN.Tween( {opacity:element.style.opacity*1} )
                .to( {opacity:1} , duration )
                .onUpdate(function(o) {
                    element.style.opacity = o.opacity;
                }).easing( TWEEN.Easing.Exponential.InOut )
                .start();
        }
        for(let i=0;i<group2.children.length;i++){
            let targetLine = group2.children[i];
            new TWEEN.Tween( {opacity:targetLine.material.opacity} )
                .to( {opacity:1} , duration )
                .onUpdate(function(o) {
                    targetLine.material.opacity = o.opacity;
                }).easing( TWEEN.Easing.Exponential.InOut )
                .start();
        }
    
        for(let i=0;i<oldGroup.children.length;i++){
            let element = oldGroup.children[i].element;
            new TWEEN.Tween( {opacity:element.style.opacity*1} )
                .to( {opacity:0} , Math.random() * duration )
                .onUpdate(function(o) {
                    element.style.opacity = o.opacity;
                }).easing( TWEEN.Easing.Exponential.InOut )
                .start();
        }
        for(let i=0;i<oldGroup2.children.length;i++){
            let targetLine = oldGroup2.children[i];
            new TWEEN.Tween( {opacity:targetLine.material.opacity} )
                .to( {opacity:0} , Math.random() * duration/2 )
                .onUpdate(function(o) {
                    targetLine.material.opacity = o.opacity;
                }).easing( TWEEN.Easing.Exponential.InOut )
                .start();
        }
    
        new TWEEN.Tween( this )
            .to( {}, duration )
            .onUpdate( render ).onComplete(function(){
                layer--;
                _hdr.removeElement(scene,oldGroup);
                _hdr.removeObject(scene,oldGroup);
                _hdr.removeObject(scene2,oldGroup2);
                groups.pop();
                groups2.pop();
                render();
                })
            .start();
    },
    removeElement : function(sce,group){
        for(var i =0;i<group.children.length;i++){
            var element = group.children[i].element;
            element.parentNode.removeChild(element);
        }
    },
    removeObject : function (sce,group){
        group.traverse(function(obj) {
            if (obj.type === 'Mesh') {
                obj.geometry.dispose();
                obj.material.dispose();
            }
        })
        // 删除场景对象scene的子对象group
        sce.remove(group);
    }
};



function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer2.setSize( window.innerWidth, window.innerHeight );

    render();

}

function onPointerDown( event ) {

    if ( event.isPrimary === false ) return;

    pointerXOnPointerDown = event.clientX - windowHalfX;
    targetRotationOnPointerDown = targetRotation;

    document.addEventListener( 'pointermove', onPointerMove, false );
    document.addEventListener( 'pointerup', onPointerUp, false );

}

function onPointerMove( event ) {

    if ( event.isPrimary === false ) return;

    pointerX = event.clientX - windowHalfX;

    let newRotation = targetRotationOnPointerDown + ( pointerX - pointerXOnPointerDown ) * 0.02;
    if(Math.abs(newRotation)>0.6) return;
    targetRotation = newRotation;
    
    //console.log(targetRotation);
}

function onPointerUp() {

    if ( event.isPrimary === false ) return;
    targetRotation = 0;
    document.removeEventListener( 'pointermove', onPointerMove );
    document.removeEventListener( 'pointerup', onPointerUp );

}


export {hdr as SceneHandler}