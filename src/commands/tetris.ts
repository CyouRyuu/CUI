class TetrisGame {
  private readonly _canvas : HTMLCanvasElement;
  private readonly _ctx : CanvasRenderingContext2D;

  private _COLORS = [
    'black', 'orange', 'blue', 'yellow', 'cyan', 'red', 'green', 'magenta'
  ];

  private _TETROMINOS = [
    {
      name: 'L',
      color: 1,
      schema: [
        [1, 1, 1],
        [1, 0, 0]
      ]
    }, {
      name: 'J',
      color: 2,
      schema: [
        [1, 1, 1],
        [0, 0, 1]
      ]
    }, {
      name: 'O',
      color: 3,
      schema: [
        [1, 1],
        [1, 1]
      ]
    }, {
      name: 'I',
      color: 4,
      schema: [
        [1, 1, 1, 1]
      ]
    }, {
      name: 'Z',
      color: 5,
      schema: [
        [0, 1, 1],
        [1, 1, 0]
      ]
    }, {
      name: 'S',
      color: 6,
      schema: [
        [1, 1, 0],
        [0, 1, 1]
      ]
    }, {
      name: 'T',
      color: 7,
      schema: [
        [0, 1, 0],
        [1, 1, 1]
      ]
    }
  ];

  private readonly _WIDTH = 13;
  private readonly _HEIGHT = 20;
  private readonly _BLOCK_SIZE = 16;
  private readonly _NEXT_BLOCKS = 1;

  private _paused = false;
  private _landed: number[][] = [];
  private _currentX = 0;
  private _currentY = 0;
  private _currentBlockIndex: number = 0;
  private _nextBlockIndexes: number[] = [];
  private _currentSchema: number[][] = [];
  private _timeBefore = 0;
  private _timeAfter = 0;
  private _stoper = 0;
  private _score = 0;

  public constructor(canvas: HTMLCanvasElement) {
    this._canvas = canvas;
    this._ctx = this._canvas.getContext('2d') as CanvasRenderingContext2D;

    this.run = this.run.bind(this);
    this.update = this.update.bind(this);
    this.render = this.render.bind(this);
    this.drawBlock = this.drawBlock.bind(this);
    this.onPressKeyboard = this.onPressKeyboard.bind(this);
    this.onPressAnyKey = this.onPressAnyKey.bind(this);
    this.getNewBlock = this.getNewBlock.bind(this);
    this.checkCollision = this.checkCollision.bind(this);
    this.checkLines = this.checkLines.bind(this);
  }

  public run() {
    // 获取用户输入相关元素
    const USERINPUT = document.getElementById("user-input") as HTMLInputElement;
    const INPUT_HIDDEN = document.getElementById("input-hidden");

    // 禁用用户输入
    USERINPUT.disabled = true;
    if (INPUT_HIDDEN) INPUT_HIDDEN.style.display = "none";
    
    window.addEventListener('keydown', this.onPressKeyboard, false);

    this._landed = TetrisGame.getNewArray(this._WIDTH, this._HEIGHT);
    this.getNewBlock();
    this.update();
  }

  private gameOver() {
    // 结束游戏，可以移除事件监听等操作
    window.removeEventListener('keydown', this.onPressKeyboard);
    // 在画布上显示游戏结束信息
    const ctx = this._ctx;
    ctx.font = '30px IBM Plex Mono';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('Game Over', this._WIDTH * this._BLOCK_SIZE / 2 - 20, this._HEIGHT * this._BLOCK_SIZE / 2 - 16);
    ctx.font = '16px IBM Plex Mono';
    ctx.fillText('Press any key to quit', this._WIDTH * this._BLOCK_SIZE / 2 - 40, this._HEIGHT * this._BLOCK_SIZE / 2 + 16);
    
    // 添加事件监听器，侦听键盘按键事件
    window.addEventListener('keydown', this.onPressAnyKey);
  }

  private onPressAnyKey(event: KeyboardEvent) {
    // 阻止默认的键盘事件行为，例如字符输入
    event.preventDefault();
    // 按下任意键后执行的操作，例如返回到命令行输入模式
    this.returnToTerminal();
  }

  private returnToTerminal() {
    // 移除游戏画布
    const container = document.getElementById("game-container");
    if (container) container.innerHTML = "";

    // 恢复用户输入
    const USERINPUT = document.getElementById("user-input") as HTMLInputElement;
    const INPUT_HIDDEN = document.getElementById("input-hidden");
    USERINPUT.disabled = false;
    if (INPUT_HIDDEN) INPUT_HIDDEN.style.display = "block";
    USERINPUT.value = "";
    USERINPUT.focus();
    // 添加事件监听器，侦听键盘按键事件
    window.removeEventListener('keydown', this.onPressAnyKey);
  }

  private update() {
    if (!this._paused) {
      // 游戏未暂停时才更新游戏状态
      this._timeBefore = performance.now();
      this._stoper += this._timeBefore - this._timeAfter;

      if (this._stoper > 500) {
        this._currentY += 1;
        this._stoper = 0;
      }

      if (this.checkCollision(this._currentSchema, 0, 0)) {
        if (this._currentY <= 0) {
          this.gameOver();
          return; // 结束更新循环
        }
        this.setSolid();
        this.getNewBlock();
      }

      this.checkLines();
    }

    this.render();
    requestAnimationFrame(this.update);
    this._timeAfter = performance.now();
  }

  private render() {
    const ctx = this._ctx;
    const canvas = this._canvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#A9A9A9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < this._HEIGHT; y++) {
      for (let x = 0; x < this._WIDTH; x++) {
        ctx.fillRect(x * this._BLOCK_SIZE, y * this._BLOCK_SIZE, this._BLOCK_SIZE, this._BLOCK_SIZE)
        this.drawBlock(
          x * this._BLOCK_SIZE,
          y * this._BLOCK_SIZE,
          this._COLORS[this._landed[y][x]]
        )
      }
    }

    for (let y = 0; y < this._currentSchema.length; y++) {
      for (let x = 0; x < this._currentSchema[y].length; x++) {
        if (this._currentSchema[y][x] === 1) {
          this.drawBlock(
            (x + this._currentX) * this._BLOCK_SIZE,
            (y + this._currentY) * this._BLOCK_SIZE,
            this._COLORS[this._TETROMINOS[this._currentBlockIndex].color]
          )
        }
      }
    }

    for (let i = 0; i < this._nextBlockIndexes.length; i++) {
      for (let y = 0; y < this._TETROMINOS[this._nextBlockIndexes[i]].schema.length; y++) {
        for (let x = 0; x < this._TETROMINOS[this._nextBlockIndexes[i]].schema[y].length; x++) {
          if (this._TETROMINOS[this._nextBlockIndexes[i]].schema[y][x] === 1) {
            this.drawBlock(
              (x + this._WIDTH) * this._BLOCK_SIZE + 32,
              y * this._BLOCK_SIZE + ((i + 1) * 128) + (-32),
              this._COLORS[this._TETROMINOS[this._nextBlockIndexes[i]].color]
            )
          }
        }
      }
    }

    ctx.font = '16px IBM Plex Mono';
    ctx.fillStyle = '#0C0623';
    ctx.fillText(`Score: ${this._score}`, (this._WIDTH + 1) * this._BLOCK_SIZE, 260);

    ctx.font = '16px IBM Plex Mono';
    ctx.fillText(`Next:`, (this._WIDTH + 1) * this._BLOCK_SIZE, 80);

    // 控制 "Paused" 字样的光标闪烁效果
    if (this._paused) {
      const currentTime = Date.now();
      const blinkPeriod = 500; // 闪烁周期，单位毫秒
      const blinkState = Math.floor(currentTime / blinkPeriod) % 2; // 控制闪烁的状态，0 或 1

      if (blinkState === 0) {
        ctx.font = '30px IBM Plex Mono';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('Paused', this._WIDTH * this._BLOCK_SIZE / 2 - 54, this._HEIGHT * this._BLOCK_SIZE / 2);
      }
    }
  }

  private drawBlock(x : number, y : number, color : string) {
    this._ctx.fillStyle = color;
    this._ctx.fillRect(
      x,
      y,
      this._BLOCK_SIZE,
      this._BLOCK_SIZE
    )
  }

  private checkCollision(schema : Array<Array<number>>, offsetX : number, offsetY : number) : boolean {
    for (let y = 0; y < schema.length; y++) {
      for (let x = 0; x < schema[y].length; x++) {
        const pieceY = y + this._currentY + offsetY;
        const pieceX = x + this._currentX + offsetX;

        if (schema[y][x] !== 0 && pieceY > 0
          && (pieceY >= this._HEIGHT
            || pieceX < 0
            || pieceX > this._WIDTH
            || this._landed[pieceY][pieceX] !== 0)) {
          return true;
        }
      }
    }

    return false;
  }

  private setSolid() {
    for (let y = 0; y < this._currentSchema.length; y++) {
      for (let x = 0; x < this._currentSchema[y].length; x++) {
        if (this._currentSchema[y][x] === 1) {
          this._landed[y + this._currentY - 1][x + this._currentX] = this._TETROMINOS[this._currentBlockIndex].color;
        }
      }
    }
  }

  private onPressKeyboard(event: KeyboardEvent) {
    if (this._paused && event.code !== 'KeyP') {
      return; // 如果游戏暂停且按键不是 'p'，则忽略按键事件
    }

    switch (event.code) {
      case 'ArrowUp':
        const newSchema = TetrisGame.rotateClockwise(this._currentSchema);
        if (!this.checkCollision(newSchema, 0, 0)
          && !this.checkCollision(newSchema, 0, 1)
        ) {
          this._currentSchema = newSchema;
        }
        break;
      case 'ArrowLeft':
        if (!this.checkCollision(this._currentSchema, -1, 0)) {
          this._currentX -= 1;
        }
        break;
      case 'ArrowRight':
        if (!this.checkCollision(this._currentSchema, 1, 0)) {
          this._currentX += 1;
        }
        break;
      case 'ArrowDown':
        if (!this.checkCollision(this._currentSchema, 0, 1)) {
          this._currentY += 1;
          this._stoper = 0;
        }
        break;
      case 'Space':
        while (!this.checkCollision(this._currentSchema, 0, 1)) {
          this._currentY += 1;
          this._stoper = 0;
        }
        break;
      case 'KeyP':
        this.togglePause(); // 暂停/恢复游戏
        break;
    }
  }

  private togglePause() {
    this._paused = !this._paused;
  }

  private getNewBlock() {
    if (this._nextBlockIndexes.length === 0) {
      for(let i = 0; i < this._NEXT_BLOCKS; i++) {
        this._nextBlockIndexes.push(Math.floor(Math.random() * (this._TETROMINOS.length - 0.5)));
      }
    }
    this._currentBlockIndex = this._nextBlockIndexes[0];
    this._currentSchema = TetrisGame.copy(this._TETROMINOS[this._currentBlockIndex].schema);
    this._nextBlockIndexes.shift();
    this._nextBlockIndexes.push(Math.floor(Math.random() * (this._TETROMINOS.length - 0.5)));

    for (let i = 0; i < Math.random() * 4; i++) {
      this._currentSchema = TetrisGame.rotateClockwise(this._currentSchema);
    }

    this._currentY = -this._currentSchema.length + 1;
    this._currentX = Math.floor((this._WIDTH / 2) - (this._currentSchema[0].length / 2));
  }

  private static getNewArray(width : number, height : number) : Array<Array<number>>{
    let newArray: number[][] = [];
    for (let y = 0; y < height; y++) {
      newArray.push([]);
      for(let x = 0; x < width; x++) {
        newArray[y].push(0);
      }
    }

    return newArray;
  }

  private static copy(arr : Array<Array<number>>) : Array<Array<number>> {
    return JSON.parse(JSON.stringify(arr));
  }

  private static rotateClockwise(arr : Array<Array<number>>) : Array<Array<number>> {
    let transformedArray: number[][] = [];

    const M = arr.length;
    const N = arr[0].length;

    for (let y = 0; y < N; y++) {
      transformedArray.push([]);
      for (let x = 0; x < M; x++) {
        transformedArray[y].push(0);
      }
    }

    for (let y = 0; y < M; y++) {
      for (let x = 0; x < N; x++) {
        transformedArray[x][M - 1 - y] = arr[y][x];
      }
    }

    return transformedArray;
  }

  private checkLines() {
    let linesToShift = [];
    for (let y = this._HEIGHT - 1; y > 0; y--) {
      let blocksInRow = 0;
      for (let x = 0; x < this._WIDTH; x++) {
        if (this._landed[y][x] !== 0) {
          blocksInRow++;
        }
      }
      if (blocksInRow === this._WIDTH) {
        linesToShift.push(y);
      }
    }

    switch (linesToShift.length) {
      case 0:
        break;
      case 1:
        this._score += 1;
        break;
      case 2:
        this._score += 3;
        break;
      case 3:
        this._score += 5;
        break;
      case 4:
        this._score += 8;
        break;
      default:
        this._score += 8 + ( 4 * linesToShift.length)
        break;
    }

    for (const line of linesToShift) {
      this.shiftLines(line);
    }
  }

  private shiftLines(line : number) {
    for (let y = line; y > 0; y--) {
      if (line === 0) {
        this._landed[y][0] = 0;
      }
      for (let x = 0; x < this._WIDTH; x++) {
        this._landed[y][x] = this._landed[y-1][x];
      }
    }
  }
}

export { TetrisGame };
