import * as GraphicsAPI from "../graphicsAPI";
import { IEntity } from "../entity";
import { IDisplayComponent } from "../systems/displaySystem";
import { Component } from "./component";
import { SpriteComponent } from "./spriteComponent";
import { TextureComponent } from "./textureComponent";

let GL: WebGLRenderingContext;

// # Classe *LayerComponent*
// Ce composant représente un ensemble de sprites qui
// doivent normalement être considérées comme étant sur un
// même plan.
export class LayerComponent extends Component<object> implements IDisplayComponent {
  private vertexBuffer!: WebGLBuffer;
  private vertices!: Float32Array;
  private indexBuffer!: WebGLBuffer;

  // ## Méthode *display*
  // La méthode *display* est appelée une fois par itération
  // de la boucle de jeu.
  public display(dT: number) {
    const layerSprites = this.listSprites();
    if (layerSprites.length === 0) {
      return;
    }
    const spriteSheet = layerSprites[0].spriteSheet;

    GL = GraphicsAPI.context;

    // On crée ici un tableau de 4 vertices permettant de représenter
    // le rectangle à afficher.
    this.vertexBuffer = GL.createBuffer()!;
    GL.bindBuffer(GL.ARRAY_BUFFER, this.vertexBuffer);

    const vertices: number[] = [];
    layerSprites.forEach((sprite, index) => {
      vertices.push(...sprite.getVertices().values());
    });
    this.vertices = new Float32Array(vertices);
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

    GL.bindBuffer(GL.ARRAY_BUFFER, this.vertexBuffer);
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    spriteSheet.bind();
    GL.drawElements(GL.TRIANGLES, 6, GL.UNSIGNED_SHORT, 0);
    spriteSheet.unbind();
  }

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
