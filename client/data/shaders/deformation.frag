precision mediump float;

/* Rendu du jeu */
uniform sampler2D uSampler;

/* Texture de déformation en rouge et vert */
uniform sampler2D uDeformation;

/* Texture pour contrôler l'intensité de la déformation */
uniform sampler2D uIntensity;

/* Interval de temps multiplié par la vitesse depuis l'activation du composant */
uniform float uTime;

/* Échelle de la déformation */
uniform float uScale;

/* Coordonnées UV du fragment */
varying vec2 vTextureCoord;

void main(void) {
    float deformationIntensity = texture2D(uIntensity, vec2(uTime, 0.5)).x * uScale;
    vec2 deformationVector = (texture2D(uDeformation, vTextureCoord + sin(uTime)).rg - 0.5) * deformationIntensity;

    gl_FragColor = texture2D(uSampler, vTextureCoord + deformationVector);
}
