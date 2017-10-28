type Animations = {
  explosion: PIXI.Texture[];
  fire: PIXI.Texture[];
  attack: PIXI.Texture[];
  [key: string]: PIXI.Texture[];
};
const animations: Animations = {
  explosion: [],
  fire: [],
  attack: [],
};


function loadAnimations(onLoadComplete?: () => void) {
  PIXI.loader
    .add('explosion', 'images/mc.json')
    .add('fire', 'assets/sprites/fire12.json')
    .add('attack', 'assets/sprites/shogeki25.json')
    .load((loader: any, resources: any) => {
      for (let i = 0; i < 26; i++) {
        let texture =
          resources.explosion.textures[
            'Explosion_Sequence_A ' + (i + 1) + '.png'
          ];
        animations.explosion.push(texture);
      }

      for (let i = 0; i < 20; i++) {
        let texture = resources.fire.textures['fire12-' + i + '.png'];
        animations.fire.push(texture);
      }

      for (let i = 0; i < 10; i++) {
        let texture = resources.attack.textures['shogeki25-' + i + '.png'];
        animations.attack.push(texture);
      }

      if (onLoadComplete) {
        onLoadComplete();
      }
    });
}

function getAnimation(key: string): PIXI.extras.AnimatedSprite | null {
  const texture: PIXI.Texture[] | null = animations[key];
  if (texture != null && texture.length !== 0) {
    return new PIXI.extras.AnimatedSprite(texture);
  } else {
    return null;
  }
}

export { loadAnimations, getAnimation }
