import Phaser, { Tilemaps } from 'phaser';
import { GridEngine } from 'grid-engine';
import { windowSize, startPositionsForScorpionsMap1, heroAnims, scorpionAnims } from './constants';
import Enemy from './enemy';
import Hero from './hero';
import { gridEngineType } from './types';

class Game extends Phaser.Scene {
  hero: Hero;
  entitiesMap: Map<string, Hero | Enemy>;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  target: Phaser.Math.Vector2;
  gridEngine: GridEngine;
  enemiesMovesTimers: { [enemyId: string]: NodeJS.Timer }

  constructor(hero: Hero, cursors: Phaser.Types.Input.Keyboard.CursorKeys, gridEngine: GridEngine) {
    super('game'); // why and how this works?
    this.hero = hero;
    this.entitiesMap = new Map();
    this.cursors = cursors;
    this.target = new Phaser.Math.Vector2();
    this.gridEngine = gridEngine;
    this.enemiesMovesTimers = {};
  }

  preload() {
    this.load.tilemapTiledJSON('map', 'assets/maps/currentMap.json');
    this.load.image('tiles', 'assets/maps/tiles-02.png');
    this.load.spritesheet('hero', 'assets/spritesheets/woman-13-spritesheet.png', { frameWidth: 75, frameHeight: 133 });
    this.load.spritesheet('scorpion1', 'assets/spritesheets/scorpion-01.png', { frameWidth: 175, frameHeight: 135 });
    this.load.spritesheet('scorpion2', 'assets/spritesheets/scorpion-01.png', { frameWidth: 175, frameHeight: 135 });
  }

  create() {
    const map = this.buildMap();
    this.tintTiles(map);
    this.cursors = this.input.keyboard.createCursorKeys();
    this.createHero(map);
    this.createCamera();
    this.hero.setFramesForEntityAnimations(this.hero, 'hero', heroAnims);
    this.hero.setPunchAnimation();
    this.createEnemy('scorpion1', map);
    this.createEnemy('scorpion2', map, 0.75);
    this.gridEngineInit(map);
    this.entitiesMap.forEach((entityValue, entityKey) => {
      if (entityKey !== 'hero') {
        entityValue.setFramesForEntityAnimations(entityValue, entityKey, scorpionAnims);
        (entityValue as Enemy).setAttackAnimation();
        (entityValue as Enemy).setDamageAnimation();
        // (entityValue as Enemy).setEnemyWalkBehavior(entityKey, map);
        this.hero.setPointerOnEnemyListener(entityValue as Enemy);
      }
      console.log(entityValue)
    })
    this.hero.setPointerDownListener(map);
    this.subscribeCharacterToChangeMoving();
  }

  update() {
    this.hero.moveHeroByArrows();
  }

  buildMap() {
    const map = this.make.tilemap({ key: 'map' });
    const tilesets = map.addTilesetImage('tiles-02', 'tiles');

    // Layers creation based on tilemap's layers
    for (let i = 0; i < map.layers.length; i++) {
      map.createLayer(i, tilesets, 0, 0);
    }
    return map;
  }

  createHero(map: Tilemaps.Tilemap) {
    this.hero = this.add.existing(new Hero(this, 20, 34, 'hero', this.gridEngine, map, this.cursors, 20));
    this.hero.scale = 1.5;
    this.entitiesMap.set('hero', this.hero);
  }

  createEnemy(key: string, map: Tilemaps.Tilemap, scaleValue = 1) {
    const enemy = this.add.existing(new Enemy(this, 0, 0, key, this.gridEngine, map, key, 15));
    this.entitiesMap.set(`${key}`, enemy);
    enemy.scale = scaleValue;
  }

  createCamera() {
    this.cameras.main.setSize(windowSize.windowWidth, windowSize.windowHeight);
    this.cameras.main.startFollow(this.hero, true);
  }

  gridEngineInit(map: Tilemaps.Tilemap) {
    const gridEngineConfig: gridEngineType = {
      characters: [
        {
          id: 'hero',
          sprite: this.hero,
          startPosition: { x: 68, y: 68},
          offsetX: 0,
          offsetY: 42,
          walkingAnimationEnabled: false,
          speed: 7,
        },
      ],
      numberOfDirections: 4
    };
    this.entitiesMap.forEach((enemyValue, enemyKey) => {
      if (enemyKey !== 'hero') {
        gridEngineConfig.characters.push(
          {
            id: enemyKey,
            sprite: enemyValue,
            startPosition: { x: startPositionsForScorpionsMap1[enemyKey].x, y: startPositionsForScorpionsMap1[enemyKey].y },
            offsetX: 10,
            offsetY: 37,
            walkingAnimationEnabled: false,
            speed: 7,
          }
        )
      }
    })
    this.gridEngine.create(map, gridEngineConfig);
  }

  // Герой вошел в радиус врагов, у всех должен измениться статус this.fightMode. Чекать тут.

  subscribeCharacterToChangeMoving() {
    // Hero movements subscribers
    this.gridEngine.movementStarted().subscribe(({ charId, direction }) => {
      const entity = this.entitiesMap.get(charId) as Hero | Enemy;
      entity.anims.play(direction);
    });

    this.gridEngine.movementStopped().subscribe(({ charId, direction }) => {
      const entity = this.entitiesMap.get(charId) as Hero | Enemy;
      entity.anims.stop();
      entity.setFrame(entity.getStopFrame(direction, charId));
    });

    this.gridEngine.directionChanged().subscribe(({ charId, direction }) => {
      const entity = this.entitiesMap.get(charId) as Hero | Enemy;
      entity.setFrame(entity.getStopFrame(direction, charId));
    });
  }

  tintTile(tilemap: Phaser.Tilemaps.Tilemap, col: number, row: number, color: number) {
    for (const element of tilemap.layers) {
      element.tilemapLayer.layer.data[row][col].tint = color;
    }
  }

  tintTiles(map: Tilemaps.Tilemap) {
    this.tintTile(map, 30, 35, 0xff7a4a); // orange
    this.tintTile(map, 35, 28, 0xffff0a); // yellow
    this.tintTile(map, 30, 22, 0x4a4aff); // blue
    this.tintTile(map, 15, 18, 0x4aff4a); // green
    this.tintTile(map, 20, 28, 0xaf2462); // red
    this.tintTile(map, 40, 48, 0xaf22ff); // magenta (unreachable)
    this.tintTile(map, 0, 0, 0xaf2462); // red (unreachable)
    this.tintTile(map, 48, 53, 0xaf2462); // red (unreachable)
    this.tintTile(map, startPositionsForScorpionsMap1.scorpion1.x, startPositionsForScorpionsMap1.scorpion1.y, 0xaf2462); // red (unreachable)
    this.tintTile(map, startPositionsForScorpionsMap1.scorpion2.x, startPositionsForScorpionsMap1.scorpion2.y, 0xaf2462);
  }
}

export default Game;
