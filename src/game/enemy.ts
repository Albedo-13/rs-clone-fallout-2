import Entity from "./entity";
import Phaser, { Tilemaps } from 'phaser';
import { GridEngine } from 'grid-engine';
import { startPositionsForScorpionsMap1 } from './constants';
import { scorpionAnims } from "./constants";

function getRandomXYDelta() {
    const deltaValue = () => Math.ceil(Math.random() * 10 / 3);
    return { xDelta: deltaValue(), yDelta: deltaValue() };
}

const timeModifier = 5;

function getRandomTimeInterval() {
    return (Math.ceil(Math.random() * timeModifier) * 1000);
}

class Enemy extends Entity {

    gridEngine: GridEngine;
    map: Tilemaps.Tilemap
    movesTimerId: NodeJS.Timer | null;
    id: string;

    constructor(scene: Phaser.Scene,
        x: number, 
        y: number, 
        texture: string, 
        gridEngine: GridEngine, 
        map: Tilemaps.Tilemap, 
        id: string, 
        healthPoints: number) {
        super(scene, x, y, texture, healthPoints)
        this.gridEngine = gridEngine;
        this.movesTimerId = null;
        this.map = map;
        this.id = id;
    }

    clearTimer(){
        clearInterval(this.movesTimerId as NodeJS.Timer);
        this.movesTimerId = null;
    }

    // позже надо удалить из аргументов карту и функцию покраски тайлов

    setEnemyWalkBehavior(charId: string, map: Tilemaps.Tilemap) {
        this.movesTimerId = setInterval(() => {
            const deltaXY = getRandomXYDelta();
            this.gridEngine.moveTo(`${charId}`, { x: startPositionsForScorpionsMap1[charId].x + deltaXY.xDelta, y: startPositionsForScorpionsMap1[charId].y + deltaXY.yDelta });
            this.tintTile(map, startPositionsForScorpionsMap1[charId].x + deltaXY.xDelta, startPositionsForScorpionsMap1[charId].y + deltaXY.yDelta, 0xff7a4a);
        }, getRandomTimeInterval())
    }

    setAttackAnimation(){
        this.createEntityAnimation('punch__up-right', this.id, scorpionAnims.punch.upRight.startFrame, scorpionAnims.punch.upRight.endFrame, 0);
        this.createEntityAnimation('punch__down-right', this.id, scorpionAnims.punch.downRight.startFrame, scorpionAnims.punch.downRight.endFrame, 0);
        this.createEntityAnimation('punch__down-left', this.id, scorpionAnims.punch.downLeft.startFrame, scorpionAnims.punch.downLeft.endFrame, 0);
        this.createEntityAnimation('punch__up-left', this.id, scorpionAnims.punch.upLeft.startFrame, scorpionAnims.punch.upLeft.endFrame, 0);
        this.createEntityAnimation('hit__up-right', this.id, scorpionAnims.hit.upRight.startFrame, scorpionAnims.hit.upRight.endFrame, 0);
        this.createEntityAnimation('hit-right', this.id, scorpionAnims.hit.downRight.startFrame, scorpionAnims.hit.downRight.endFrame, 0);
        this.createEntityAnimation('hit-left', this.id, scorpionAnims.hit.downLeft.startFrame, scorpionAnims.hit.downLeft.endFrame, 0);
        this.createEntityAnimation('hit-left', this.id, scorpionAnims.hit.upLeft.startFrame, scorpionAnims.hit.upLeft.endFrame, 0);
    }

    //повтор функции, удалить
    tintTile(tilemap: Phaser.Tilemaps.Tilemap, col: number, row: number, color: number) {
        for (const element of tilemap.layers) {
            element.tilemapLayer.layer.data[row][col].tint = color;
        }
    }

}

export default Enemy;