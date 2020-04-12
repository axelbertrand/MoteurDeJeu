import { ColliderComponent } from "../components/colliderComponent";
import { Scene } from "../scene";
import { ISystem } from "./system";
import { QuadTree } from "./quadTree";
import { Rectangle } from "../components/rectangle";

// # Classe *PhysicSystem*
// Représente le système permettant de détecter les collisions
export class PhysicSystem implements ISystem {

  private quadTree: QuadTree = new QuadTree(0, new Rectangle({
    xMin: 0,
    yMin: 0,
    xMax: 1000,
    yMax: 1000,
  }));

  // Méthode *iterate*
  // Appelée à chaque tour de la boucle de jeu
  public iterate(dT: number) {
    const colliders: ColliderComponent[] = [];
    this.quadTree.clear();

    for (const e of Scene.current.entities()) {
      for (const comp of e.components) {
        if (comp instanceof ColliderComponent && comp.enabled) {
          colliders.push(comp);
          this.quadTree.insert(comp)
        }
      }
    }

    const collisions: Array<[ColliderComponent, ColliderComponent]> = [];

    for (let c1 of colliders) {
      if (!c1.enabled || !c1.owner.active) {
        continue;
      }

      let returnColliders: ColliderComponent[] = this.quadTree.retrieve(c1);
      for (let c2 of returnColliders) {
        if (!c2.enabled || !c2.owner.active) {
          continue;
        }

        if (c1 === c2) {
          continue;
        }

        if(c1.isColliding && c2.isColliding)
        {
          continue;
        }
  
        if ((c1.flag & c2.mask) && c1.area.intersectsWith(c2.area)) {
          collisions.push([c1, c2]);
          c1.isColliding = true;
          c2.isColliding = true;
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
