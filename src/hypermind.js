
var default_options = {
    container : '',
    view : {
        widthSpace : 230,
        heigthSpace : 80,
        lineColor : 0x8A0808
    },
    events : {}
};


var hym = function(){
    this.option = null;
    this.data = null;
    this.root = null;
    this.currentRoot = null;
    this.sceneHandler = null;
    this.selectedNode = null;
    this.builder = null;
};

hym.node = function(id,parentId,text){
    this.id = id;
    this.parentId = parentId;
    this.text = text;
    this.parentNode = null;
    this.isRoot = false;
    this.x = 0.0;
    this.y = 0.0;
    if(this.parentId == null) this.isRoot = true;
    this.children = [];
    this.nodeObject = null;
    this.lineObject = null;
    this.panelObject = null;
    this.havingRemark = false;
    this.havingQuestion = false;
};

hym.mindBuilder = function(_hym){
    this._hym = _hym;
    this.nodeMap = new Map();
};

hym.mindBuilder.prototype ={
    build : function(){
        var nodeMap = this.nodeMap;
        var data = this._hym.data;
        var _hym = this._hym;
        data.forEach(d => {
            var node = new hym.node(d.id,d.parentId,d.text);
            if(node.isRoot) {_hym.root = node;return true;}
            var children = nodeMap.get(d.parentId);
            if(children == null){
                children = [];
                children.push(node);
                nodeMap.set(d.parentId,children);
            }else{
                children.push(node);
            }
        });
        this.buildNode(_hym.root);
        this.initPosition(_hym.root);
    },
    initPosition : function (root, recursion){
        var _builder = this;
        if(root.children.length == 0) return;
        var treeHeight = root.children.length / 2;
        for(var i =0;i< root.children.length;i++){
            if(i<treeHeight) root.child
        }
        root.children.forEach((child,i)=>{
            if(i<treeHeight) child.x = -1;
            else child.x = 1;
            child.y = treeHeight/2 - i;
            if(child.x == 1) child.y = treeHeight/2 - (i - treeHeight) ;
            child.y -=0.25;
            if(recursion != null && recursion)
                _builder.initPosition(child, recursion);
        });
    },
    buildNode : function(root){
        var nodeMap = this.nodeMap;
        var children = nodeMap.get(root.id);
        if( children == null) return;
        children.forEach(child =>{
            child.parentNode = root;
            root.children.push(child);
            this.buildNode(child);
        });
    }

};

hym.prototype = {
    show : function(){
        var builder = new hym.mindBuilder(this);
        this.builder = builder;
        builder.build();
        this.sceneHandler.init();
    }
};

export { hym as HyperMind };