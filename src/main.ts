import "./style.css";

class Magnetic {
  private requestId: number | null = null;
  private currentX = 0;
  private currentY = 0;
  private vx = 0;
  private vy = 0;

  private item: HTMLElement;
  private innerText: HTMLElement | null = null;
  private btnFill: HTMLElement | null = null;

  private strength: number;
  private strengthText: number;

  private readonly config = {
    stiffness: 0.06,
    damping: 0.85,
  };

  constructor(item: HTMLElement) {
    this.item = item;
    this.innerText = this.item.querySelector(".btn-text-inner");
    this.btnFill = this.item.querySelector(".btn-fill");

    this.strength = parseFloat(this.item.dataset.strength || "25") / 2;
    this.strengthText =
      parseFloat(this.item.dataset.strengthText || "12.5") / 2;

    this.item.addEventListener("mouseenter", this.mouseenter);
    this.item.addEventListener("mousemove", this.mousehandler);
    this.item.addEventListener("mouseleave", this.mouseleave);
  }

  mouseenter = () => {
    if (this.btnFill) {
      this.btnFill.style.transition = "none";
      this.btnFill.style.transform = "translate3d(0, 76%, 0)";

      this.btnFill.offsetHeight;

      this.btnFill.style.transition =
        "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)";
      this.btnFill.style.transform = "translate3d(0, 0%, 0)";
    }
  };

  mouseleave = () => {
    if (this.btnFill) {
      this.btnFill.style.transition =
        "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)";
      this.btnFill.style.transform = "translate3d(0, -76%, 0)";
    }

    const style = window.getComputedStyle(this.item);
    const matrix = new DOMMatrix(style.transform);

    this.currentX = matrix.m41;
    this.currentY = matrix.m42;

    this.vx = 0;
    this.vy = 0;

    this.animateReturn();
  };

  private animateReturn = () => {
    const ax = (0 - this.currentX) * this.config.stiffness;
    const ay = (0 - this.currentY) * this.config.stiffness;

    this.vx = (this.vx + ax) * this.config.damping;
    this.vy = (this.vy + ay) * this.config.damping;

    this.currentX += this.vx;
    this.currentY += this.vy;

    this.item.style.transition = "none";
    this.item.style.transform = `translate3d(${this.currentX}px, ${this.currentY}px, 0px)`;

    if (this.innerText) {
      const ratio = this.strengthText / this.strength;
      this.innerText.style.transition = "none";
      this.innerText.style.transform = `translate3d(${this.currentX * ratio}px, ${this.currentY * ratio}px, 0px)`;
    }

    if (
      Math.abs(this.vx) > 0.001 ||
      Math.abs(this.vy) > 0.001 ||
      Math.abs(this.currentX) > 0.001 ||
      Math.abs(this.currentY) > 0.001
    ) {
      this.requestId = requestAnimationFrame(this.animateReturn);
    } else {
      this.item.style.transform = `translate3d(0px, 0px, 0px)`;
      if (this.innerText) {
        this.innerText.style.transform = `translate3d(0px, 0px, 0px)`;
      }
      this.vx = 0;
      this.vy = 0;
      this.requestId = null;
    }
  };

  mousehandler = (e: MouseEvent) => {
    if (this.requestId) {
      cancelAnimationFrame(this.requestId);
      this.requestId = null;
    }

    const rect = this.item.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const x = (e.clientX - centerX) / (rect.width / 2);
    const y = (e.clientY - centerY) / (rect.height / 2);

    this.currentX = x * this.strength;
    this.currentY = y * this.strength;

    this.item.style.transition =
      "transform 0.8s cubic-bezier(0.19, 1, 0.22, 1)";
    this.item.style.transform = `translate3d(${this.currentX}px, ${this.currentY}px, 0px)`;

    if (this.innerText) {
      const ratio = this.strengthText / this.strength;
      this.innerText.style.transition =
        "transform 0.8s cubic-bezier(0.19, 1, 0.22, 1)";
      this.innerText.style.transform = `translate3d(${this.currentX * ratio}px, ${this.currentY * ratio}px, 0px)`;
    }
  };
}

const items = document.querySelectorAll<HTMLElement>(".magnetic");
for (const item of items) {
  new Magnetic(item);
}
