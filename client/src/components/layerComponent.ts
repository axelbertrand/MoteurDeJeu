import * as GraphicsAPI from "../graphicsAPI";
import { IEntity } from "../entity";
import { IDisplayComponent } from "../systems/displaySystem";
import { Component } from "./component";
import { SpriteComponent } from "./spriteComponent";
import { TextureComponent } from "./textureComponent";
import { PositionComponent } from "./positionComponent";
import { IFrameEntry } from "./spriteSheetComponent";
import { Timing } from "../timing";

let GL: WebGLRenderingContext;

// # Classe *LayerComponent*
// Ce composant représente un ensemble de sprites qui
// doivent normalement être considérées comme étant sur un
// même plan.
export class LayerComponent extends Component<object> implements IDisplayComponent {
  private descr!: IFrameEntry;
  private vertexBuffer!: WebGLBuffer;
  private vertices!: Float32Array;
  private indexBuffer!: WebGLBuffer;

  public setup() {
    GL = GraphicsAPI.context;

    const layerSprites = this.listSprites();
    if(layerSprites.length === 0) {
      return;
    }

    // On crée ici un tableau de 4 vertices permettant de représenter
    // le rectangle à afficher.
    this.vertexBuffer = GL.createBuffer()!;
    GL.bindBuffer(GL.ARRAY_BUFFER, this.vertexBuffer);
    this.vertices = new Float32Array(4 * TextureComponent.vertexSize * layerSprites.length);
    GL.bufferData(GL.ARRAY_BUFFER, this.vertices, GL.DYNAMIC_DRAW);

    this.indexBuffer = GL.createBuffer()!;
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    const indicesArray: number[] = [];

    let i = 0;
    layerSprites.forEach(sprite => {
      // On crée ici un tableau de 6 indices, soit 2 triangles, pour
      // représenter quels vertices participent à chaque triangle:
      // ```
      // 0    1
      // +----+
      // |\   |
      // | \  |
      // |  \ |
      // |   \|
      // +----+
      // 3    2
      // ```
      
      indicesArray.push(i, i + 1, i + 2, i + 2, i + 3, i);
      i += 4;
    });
    const indices = new Uint16Array(indicesArray);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, indices, GL.DYNAMIC_DRAW);

    // Et on initialise le contenu des vertices
    layerSprites.forEach(sprite => {
      sprite.updateMesh();
    });
  }

  // public update(timing: Timing) {
  //   const layerSprites = this.listSprites();
  //   layerSprites.forEach(sprite => {
  //     const descr = sprite.spriteSheet.sprites[sprite.spriteName];
  //     this.updateComponents(descr);
  //   });
  // }

  // ## Méthode *display*
  // La méthode *display* est appelée une fois par itération
  // de la boucle de jeu.
  public display(dT: number) {
    const layerSprites = this.listSprites();
    if (layerSprites.length === 0) {
      return;
    }
    const spriteSheet = layerSprites[0].spriteSheet;

    GL.bindBuffer(GL.ARRAY_BUFFER, this.vertexBuffer);
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    spriteSheet.bind();
    GL.drawElements(GL.TRIANGLES, 6, GL.UNSIGNED_SHORT, 0);
    spriteSheet.unbind();
  }

  // private updateComponents(descr: IFrameEntry) {
  //   const position = this.owner.getComponent<PositionComponent>("Position").worldPosition;
  //   if (this.vertices.length === 0) {
  //     return;
  //   }

  //   const z = position[2];
  //   const xMin = position[0];
  //   const xMax = xMin + descr.frame.w;
  //   const yMax = position[1];
  //   const yMin = yMax - descr.frame.h;
  //   const uMin = descr.uv!.x;
  //   const uMax = uMin + descr.uv!.w;
  //   const vMin = descr.uv!.y;
  //   const vMax = vMin + descr.uv!.h;

  //   const v = [
  //     xMin, yMin, z, uMin, vMin,
  //     xMax, yMin, z, uMax, vMin,
  //     xMax, yMax, z, uMax, vMax,
  //     xMin, yMax, z, uMin, vMax,
  //   ];

  //   const offset = 0;
  //   this.vertices.set(v, offset);
  //   GL.bindBuffer(GL.ARRAY_BUFFER, this.vertexBuffer);
  //   GL.bufferSubData(GL.ARRAY_BUFFER, offset, this.vertices);
  // }

  // ## Fonction *listSprites*
  // Cette fonction retourne une liste comportant l'ensemble
  // des sprites de l'objet courant et de ses enfants.
  private listSprites() {
    const sprites: SpriteComponent[] = [];

    const queue: IEntity[] = [this.owner];
    while (queue.length > 0) {
      const node = queue.shift() as IEntity;
      for (const child of node.children) {
        if (child.active) {
          queue.push(child);
        }
      }

      for (const comp of node.components) {
        if (comp instanceof SpriteComponent && comp.enabled) {
          sprites.push(comp);
        }
      }
    }

    return sprites;
  }
}
