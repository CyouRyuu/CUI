interface Point {
  x: number;
  y: number;
}

enum Direction {
  Up,
  Down,
  Left,
  Right,
}

interface SnakeGameConfig {
  gridSize: number;
  speed: number;
}

class SnakeGame {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gridSize: number;
  private speed: number;
  private snake: Point[];
  private food: Point;
  private direction: Direction;
  private gameInterval?: number;
  private paused: boolean = false;

  public constructor(canvas: HTMLCanvasElement, config: SnakeGameConfig) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.gridSize = config.gridSize;
    this.speed = config.speed;
    this.snake = [{ x: 10, y: 10 }];
    this.food = this.getRandomPosition();
    this.direction = Direction.Right;

    this.setupEventListeners();
    this.onPressAnyKey = this.onPressAnyKey.bind(this);
  }

  public run() {
    // 获取用户输入相关元素
    const USERINPUT = document.getElementById("user-input") as HTMLInputElement;
    const INPUT_HIDDEN = document.getElementById("input-hidden");

    // 禁用用户输入
    USERINPUT.disabled = true;
    if (INPUT_HIDDEN) INPUT_HIDDEN.style.display = "none";
    
    this.gameInterval = setInterval(() => {
      this.update();
      this.draw();
    }, this.speed);
  }

  private endGame() {
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
    }
    setTimeout(() => {
      // 在画布上显示游戏结束信息
      const ctx = this.ctx;
      ctx.font = '30px IBM Plex Mono';
      ctx.fillStyle = '#FFA500';
      ctx.fillText('Game Over', this.canvas.width / this.gridSize * 2 + 29, this.canvas.height / this.gridSize * 2 + 96);
      ctx.font = '16px IBM Plex Mono';
      ctx.fillText('Press any key to quit', this.canvas.width / this.gridSize * 2 + 10, this.canvas.height / this.gridSize * 2 + 128);
    });
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

  private setupEventListeners() {
    document.addEventListener("keydown", (e) => {
      if (this.paused && e.code !== 'KeyP') {
        return; // 如果游戏暂停且按键不是 'p'，则忽略按键事件
      }
      if (e.code === "KeyP") {
        this.togglePause();
      } else {
        this.changeDirection(e);
      }
    });
  }

  private changeDirection(e: KeyboardEvent) {
    const currentDirection = this.direction;

    switch (e.code) {
      case "ArrowUp":
      case "KeyW":
        if (currentDirection !== Direction.Down) {
          this.direction = Direction.Up;
        }
        break;
      case "ArrowDown":
      case "KeyS":
        if (currentDirection !== Direction.Up) {
          this.direction = Direction.Down;
        }
        break;
      case "ArrowLeft":
      case "KeyA":
        if (currentDirection !== Direction.Right) {
          this.direction = Direction.Left;
        }
        break;
      case "ArrowRight":
      case "KeyD":
        if (currentDirection !== Direction.Left) {
          this.direction = Direction.Right;
        }
        break;
    }
  }

  private togglePause() {
    this.paused = !this.paused;
  }

  private update() {
    if (!this.paused) {
      const head = { ...this.snake[0] };
      switch (this.direction) {
        case Direction.Up:
          head.y -= 1;
          break;
        case Direction.Down:
          head.y += 1;
          break;
        case Direction.Left:
          head.x -= 1;
          break;
        case Direction.Right:
          head.x += 1;
          break;
      }

      if (this.checkCollision(head)) {
        this.endGame();
        return;
      }

      this.snake.unshift(head);

      if (this.isFoodEaten()) {
        this.food = this.getRandomPosition();
      } else {
        this.snake.pop();
      }
    }
  }

  private draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawSnake();
    this.drawFood();

    // 控制 "Paused" 字样的光标闪烁效果
    if (this.paused) {
      const currentTime = Date.now();
      const blinkPeriod = 500; // 闪烁周期，单位毫秒
      const blinkState = Math.floor(currentTime / blinkPeriod) % 2; // 控制闪烁的状态，0 或 1

      if (blinkState === 0) {
        const ctx = this.ctx;
        ctx.font = '30px IBM Plex Mono';
        ctx.fillStyle = '#FFA500';
        ctx.fillText('Paused', this.canvas.width / this.gridSize * 2 + 54, this.canvas.height / this.gridSize * 2 + 108);
      }
    }
  }

  private drawSnake() {
    this.snake.forEach((segment, index) => {
      const transparency = 1 - (index / this.snake.length) * 0.5; // 根据蛇身位置计算透明度
      this.ctx.fillStyle = `rgba(0, 255, 0, ${transparency})`; // 使用 rgba 设置颜色和透明度
      this.ctx.fillRect(segment.x * this.gridSize, segment.y * this.gridSize, this.gridSize, this.gridSize);
    });
  }

  private drawFood() {
    this.ctx.fillStyle = "red";
    this.ctx.beginPath();
    this.ctx.arc((this.food.x + 0.5) * this.gridSize, (this.food.y + 0.5) * this.gridSize, this.gridSize / 2, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private getRandomPosition(): Point {
    return {
      x: Math.floor(Math.random() * (this.canvas.width / this.gridSize)),
      y: Math.floor(Math.random() * (this.canvas.height / this.gridSize)),
    };
  }

  private checkCollision(head: Point): boolean {
    return (
      head.x < 0 ||
      head.x >= this.canvas.width / this.gridSize ||
      head.y < 0 ||
      head.y >= this.canvas.height / this.gridSize ||
      this.snake.some((segment) => segment.x === head.x && segment.y === head.y)
    );
  }

  private isFoodEaten(): boolean {
    return this.snake[0].x === this.food.x && this.snake[0].y === this.food.y;
  }
}

export { SnakeGame };
export type { SnakeGameConfig };
