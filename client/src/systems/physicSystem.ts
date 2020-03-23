import { ColliderComponent } from "../components/colliderComponent";
import { Scene } from "../scene";
import { ISystem } from "./system";
import { QuadTree } from "./quadTree";
import { Rectangle } from "../components/rectangle";

// # Classe *PhysicSystem*
// Représente le système permettant de détecter les collisions
export class PhysicSystem implements ISystem {

  private quadTree: QuadTree = new QuadTree(0,new Rectangle({
    xMin: 0,
    yMin: 0,
    xMax: 148,
    yMax: 108,
  }));

  // Méthode *iterate*
  // Appelée à chaque tour de la boucle de jeu
  public iterate(dT: number) {
    const colliders: ColliderComponent[] = [];
    this.quadTree.clear();

    for (const e of Scene.current.entities()) {
      for (const comp of e.components) {
        if (comp instanceof ColliderComponent && comp.enabled) {
          //colliders.push(comp);
          this.quadTree.insert(comp)
        }
      }
    }

    const collisions: Array<[ColliderComponent, ColliderComponent]> = [];

    let returnColliders: ColliderComponent[] = [];
    for (const e of Scene.current.entities()) {
      for (const comp of e.components) {
        if (comp instanceof ColliderComponent && comp.enabled) {
          this.quadTree.retrieve(returnColliders, comp);

          for (let i = 0; i < returnColliders.length; i++) {
            const c1 = comp;
            const c2 = returnColliders[i];
            if (!c1.enabled || !c1.owner.active) {
              continue;
            }
            if (!c2.enabled || !c2.owner.active) {
              continue;
            }
      
            if ((c1.flag & c2.mask) && c1.area.intersectsWith(c2.area)) {
              collisions.push([c1, c2]);
            }
          }
        }
      }
    }

    for (const [c1, c2] of collisions) {
      if (c1.handler) {
        c1.handler.onCollision(c2);
      }
      if (c2.handler) {
        c2.handler.onCollision(c1);
      }
    }
  }
}
