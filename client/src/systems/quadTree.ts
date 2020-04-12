import { ColliderComponent } from "../components/colliderComponent";
import { vec2 } from "gl-matrix";
import { Rectangle } from "../components/rectangle";



export class QuadTree {
 
    private MAX_OBJECTS: number = 10;
    private MAX_LEVELS: number = 5;
   
    private level: number;
    private colliders: ColliderComponent[] = [];
    private bounds: Rectangle;
    private nodes: Array<QuadTree> = new Array<QuadTree>(4);
   
    public constructor(_level: number, _bounds: Rectangle) {
     this.level = _level;
     this.bounds = _bounds;
    }

    clear()
    {
      this.colliders = [];
      this.nodes.forEach((node) => {
        if(node != null) {
          node.clear();
          node.nodes = [];
        }
      });
    }

    split()
    {
      /*let botLeft1: [number, number] = this.bounds.botLeft;
      let botLeft2: [number, number] = [this.bounds.botLeft[0] + this.bounds.w/2, this.bounds.botLeft[1]];
      let botLeft3: [number, number] = [this.bounds.botLeft[0], this.bounds.botLeft[1] - this.bounds.h];
      let botLeft4: [number, number] = [this.bounds.botLeft[0] + this.bounds.w/2, this.bounds.botLeft[1] - this.bounds.h];
      this.nodes.push(new QuadTree(this.level+1, new Rectangle(botLeft1, this.bounds.w/2,this.bounds.h/2)));
      this.nodes.push(new QuadTree(this.level+1, new Rectangle(botLeft2, this.bounds.w/2,this.bounds.h/2)));
      this.nodes.push(new QuadTree(this.level+1, new Rectangle(botLeft3, this.bounds.w/2,this.bounds.h/2)));
      this.nodes.push(new QuadTree(this.level+1, new Rectangle(botLeft4, this.bounds.w/2,this.bounds.h/2)));
      */
      let subWidth: number = (this.bounds.w / 2);
      let subHeight: number = (this.bounds.h / 2);
      let x: number = this.bounds.x;
      let y: number = this.bounds.y;
    
      this.nodes[0] = new QuadTree(this.level+1, new Rectangle({
        x: x + subWidth,
        y: y,
        width: subWidth,
        height: subHeight,
      }));
      this.nodes[1] = new QuadTree(this.level+1, new Rectangle({
        x: x,
        y: y,
        width: subWidth,
        height: subHeight,
      }));
      this.nodes[2] = new QuadTree(this.level+1, new Rectangle({
        x: x,
        y: y + subHeight,
        width: subWidth,
        height: subHeight,
      }));
      this.nodes[3] = new QuadTree(this.level+1, new Rectangle({
        x: x + subWidth,
        y: y + subHeight,
        width: subWidth,
        height: subHeight,
      }));
    }

    getIndex(_col: ColliderComponent): number
    {
      let res: number = -1;
      let verticalMidpoint:number  = this.bounds.x + this.bounds.w / 2;
      let horizontalMidpoint:number = this.bounds.y + this.bounds.h / 2;

      let topQuadrant: boolean = (_col.area.yMin < horizontalMidpoint && _col.area.yMin + _col.area.h < horizontalMidpoint);
      let bottomQuadrant: boolean = (_col.area.yMin > horizontalMidpoint);

      // Object can completely fit within the left quadrants
      if (_col.area.xMin < verticalMidpoint && _col.area.xMin + _col.area.w < verticalMidpoint) {
        if (topQuadrant) {
          res = 1;
        }
        else if (bottomQuadrant) {
          res = 2;
        }
      }
      // Object can completely fit within the right quadrants
      else if (_col.area.xMin > verticalMidpoint) {
      if (topQuadrant) {
        res = 0;
      }
      else if (bottomQuadrant) {
        res = 3;
      }
    }
      return res;
    }

    public insert(_col: ColliderComponent) {
      if (this.nodes[0]) {
        let index:number = this.getIndex(_col);
    
        if (index != -1) {
          this.nodes[index].insert(_col);
    
          return;
        }
      }
    
      this.colliders.push(_col);
    
      if (this.colliders.length > this.MAX_OBJECTS && this.level < this.MAX_LEVELS) {
         if (!this.nodes[0]) { 
            this.split(); 
         }
    
        let i: number = 0;
        while (i < this.colliders.length) {
          let index: number = this.getIndex(this.colliders[i]);
          if (index != -1) {
            this.nodes[index].insert(this.colliders[i]);
            this.colliders.splice(i,1);
          }
          else {
            i++;
          }
        }
      }
    }

    public retrieve(collider: ColliderComponent): ColliderComponent[]
    {
      if (this.nodes[0]) {
        let index: number = this.getIndex(collider);
        if (index != -1) {
          return this.nodes[index].retrieve(collider);
        }
      }

      return this.colliders;
    }
  }