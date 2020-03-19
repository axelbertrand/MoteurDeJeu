class Point {
    public x: number; 
    public y: number;

    constructor (_x:number, _y:number){
        this.x = _x;
        this.y = _y;
    }
}

class Node{
    public pos: Point;
    public data = 0;
    constructor(_pos: Point, _data: number){
        this.pos = _pos;
        this.data = _data;
    }
}

export class QuadTree {
    // Hold details of the boundary of this node 
    topLeft = new Point(0,0); 
    botRight= new Point(0,0); 
  
    // Contains details of node 
    n!: Node; 
  
    // Children of this tree 
    topLeftTree!: QuadTree; 
    topRightTree!: QuadTree; 
    botLeftTree!: QuadTree; 
    botRightTree!: QuadTree; 
  

    constructor(topL: Point, botR:Point) 
    { 
        this.topLeft = topL; 
        this.botRight = botR; 
    }

    insert(node: Node) 
    { 
        if (!node) 
            return; 
      
        // Current quad cannot contain it 
        if (!this.inBoundary(node.pos)) 
            return; 
      
        // We are at a quad of unit area 
        // We cannot subdivide this quad further 
        if (Math.abs(this.topLeft.x - this.botRight.x) <= 1 && 
            Math.abs(this.topLeft.y - this.botRight.y) <= 1) 
        { 
            if (!this.n) 
                this.n = node; 
            return; 
        } 
      
        if ((this.topLeft.x + this.botRight.x) / 2 >= node.pos.x) 
        { 
            // Indicates topLeftTree 
            if ((this.topLeft.y + this.botRight.y) / 2 >= node.pos.y) 
            { 
                if (!this.topLeftTree) 
                {
                    this.topLeftTree = new QuadTree( 
                        new Point(this.topLeft.x, this.topLeft.y), 
                        new Point((this.topLeft.x + this.botRight.x) / 2, 
                            (this.topLeft.y + this.botRight.y) / 2)); 
                }
                this.topLeftTree.insert(node); 
            } 
      
            // Indicates botLeftTree 
            else
            { 
                if (!this.botLeftTree) 
                {
                    this.botLeftTree = new QuadTree( 
                        new Point(this.topLeft.x, 
                            (this.topLeft.y + this.botRight.y) / 2), 
                        new Point((this.topLeft.x + this.botRight.x) / 2, 
                            this.botRight.y));
                }
                this.botLeftTree.insert(node); 
            } 
        } 
        else
        { 
            // Indicates topRightTree 
            if ((this.topLeft.y + this.botRight.y) / 2 >= node.pos.y) 
            { 
                if (!this.topRightTree) 
                {
                    this.topRightTree = new QuadTree( 
                        new Point((this.topLeft.x + this.botRight.x) / 2, 
                            this.topLeft.y), 
                        new Point(this.botRight.x, 
                            (this.topLeft.y + this.botRight.y) / 2)); 
                }
                this.topRightTree.insert(node); 
            } 
      
            // Indicates botRightTree 
            else
            { 
                if (!this.botRightTree) 
                {
                    this.botRightTree = new QuadTree( 
                        new Point((this.topLeft.x + this.botRight.x) / 2, 
                            (this.topLeft.y + this.botRight.y) / 2), 
                        new Point(this.botRight.x, this.botRight.y));
                }
                this.botRightTree.insert(node); 
            } 
        } 
    }

    // Check if current quadtree contains the point 
    inBoundary(p: Point) 
    { 
        return (p.x >= this.topLeft.x && 
            p.x <= this.botRight.x && 
            p.y >= this.topLeft.y && 
            p.y <= this.botRight.y); 
    }

    // Find a node in a quadtree 
    search(p: Point): Node|undefined
    { 
        // Current quad cannot contain it 
        if (!this.inBoundary(p)) 
            return undefined; 
    
        // We are at a quad of unit length 
        // We cannot subdivide this quad further 
        if (this.n) 
            return this.n; 
    
        if ((this.topLeft.x + this.botRight.x) / 2 >= p.x) 
        { 
            // Indicates topLeftTree 
            if ((this.topLeft.y + this.botRight.y) / 2 >= p.y) 
            { 
                if (!this.topLeftTree) 
                    return undefined; 
                return this.topLeftTree.search(p); 
            } 
    
            // Indicates botLeftTree 
            else
            { 
                if (!this.botLeftTree) 
                    return undefined; 
                return this.botLeftTree.search(p); 
            } 
        } 
        else
        { 
            // Indicates topRightTree 
            if ((this.topLeft.y + this.botRight.y) / 2 >= p.y) 
            { 
                if (!this.topRightTree) 
                    return undefined; 
                return this.topRightTree.search(p); 
            } 
    
            // Indicates botRightTree 
            else
            { 
                if (!this.botRightTree) 
                    return undefined; 
                return this.botRightTree.search(p); 
            } 
        } 
    }; 

}; 
  
// Driver program 
/*
int main() 
{ 
    Quad center(Point(0, 0), Point(8, 8)); 
    Node a(Point(1, 1), 1); 
    Node b(Point(2, 5), 2); 
    Node c(Point(7, 6), 3); 
    center.insert(&a); 
    center.insert(&b); 
    center.insert(&c); 
    cout << "Node a: " << 
        center.search(Point(1, 1))->data << "\n"; 
    cout << "Node b: " << 
        center.search(Point(2, 5))->data << "\n"; 
    cout << "Node c: " << 
        center.search(Point(7, 6))->data << "\n"; 
    cout << "Non-existing node: "
        << center.search(Point(5, 5)); 
    return 0; 
}
*/

    